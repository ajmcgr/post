// Sends branded notification emails via Resend.
// Supported types:
//   - connection_success: after a social account connects successfully
//   - post_failed:        when a post fails on one or more platforms

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const SITE_URL = 'https://trypost.ai';

// Inline shared template so the function bundles without external imports.
interface EmailTemplateOptions {
  preheader?: string;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}

const LOGO_URL = 'https://trypost.ai/email-logo.png';

function renderEmail(opts: EmailTemplateOptions): string {
  const {
    preheader = '',
    heading,
    body,
    ctaLabel,
    ctaUrl,
    footerNote = "You're receiving this because you have an account with Post.",
  } = opts;

  const cta = ctaLabel && ctaUrl
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 8px;">
        <tr><td>
          <a href="${ctaUrl}" style="display:inline-block;background:#136ed5;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">${ctaLabel}</a>
        </td></tr>
      </table>`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;padding:48px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;">
        <tr><td style="padding:36px 40px 24px;text-align:center;">
          <img src="${LOGO_URL}" alt="Post" height="32" style="height:32px;width:auto;display:inline-block;" />
        </td></tr>
        <tr><td style="padding:0 40px;"><div style="height:1px;background:#e5e7eb;"></div></td></tr>
        <tr><td style="padding:28px 40px 8px;">
          <h1 style="margin:0 0 12px;font-size:20px;line-height:1.35;font-weight:700;color:#0f172a;">${heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#334155;">${body}</div>
          ${cta}
        </td></tr>
        <tr><td style="padding:24px 40px 32px;"><div style="height:1px;background:#e5e7eb;margin-bottom:20px;"></div>
          <p style="margin:0;text-align:center;font-size:13px;color:#94a3b8;">${footerNote}</p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">© Post · <a href="${SITE_URL}" style="color:#94a3b8;text-decoration:none;">trypost.ai</a></p>
    </td></tr>
  </table>
</body></html>`;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-scheduler-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  threads: 'Threads',
  tiktok: 'TikTok',
};

interface FailureResult { platform: string; success: boolean; error?: string }

interface NotifyRequest {
  type: 'connection_success' | 'post_failed';
  userId?: string;
  email?: string;
  platform?: string;
  platformUsername?: string | null;
  content?: string;
  results?: FailureResult[];
}

function labelFor(p: string) {
  return PLATFORM_LABELS[p] ?? p;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = (await req.json()) as NotifyRequest;
    if (!body?.type) throw new Error('Missing type');

    // Resolve recipient email.
    let email = body.email;
    let userId = body.userId;

    if (!email) {
      // Try to authenticate the caller and use their email.
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace(/^Bearer\s+/i, '');
        const { data: { user } } = await admin.auth.getUser(token);
        if (user) {
          email = user.email ?? undefined;
          userId = userId ?? user.id;
        }
      }
      if (!email && userId) {
        const { data } = await admin.auth.admin.getUserById(userId);
        email = data.user?.email ?? undefined;
      }
    }

    if (!email) throw new Error('Recipient email could not be resolved');

    if (userId) {
      const { data: preferences } = await admin
        .from('notification_preferences')
        .select('connection_success,post_failed')
        .eq('user_id', userId)
        .maybeSingle();
      if (body.type === 'connection_success' && preferences?.connection_success === false) {
        return new Response(JSON.stringify({ success: true, skipped: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (body.type === 'post_failed' && preferences?.post_failed === false) {
        return new Response(JSON.stringify({ success: true, skipped: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) throw new Error('RESEND_API_KEY not configured');
    const resend = new Resend(resendKey);

    let subject = '';
    let html = '';

    if (body.type === 'connection_success') {
      const name = labelFor(body.platform ?? '');
      subject = `${name} connected to Post`;
      const handle = body.platformUsername ? `<strong>@${body.platformUsername}</strong>` : 'Your account';
      html = renderEmail({
        preheader: `${name} is now connected to your Post account.`,
        heading: `${name} connected 🎉`,
        body: `
          <p style="margin:0 0 12px;">${handle} is now connected to Post. You can start scheduling and publishing to ${name} from your dashboard.</p>
          <p style="margin:0;color:#64748b;font-size:13px;">If you didn't connect this account, you can disconnect it any time from your dashboard.</p>
        `,
        ctaLabel: 'Create a post',
        ctaUrl: `${SITE_URL}/dashboard/composer`,
      });
    } else if (body.type === 'post_failed') {
      const failed = (body.results ?? []).filter((r) => !r.success);
      const rows = failed.map((r) => `
        <tr>
          <td style="padding:8px 0;color:#0f172a;font-weight:600;">${labelFor(r.platform)}</td>
          <td style="padding:8px 0;color:#b91c1c;">${r.error ?? 'Unknown error'}</td>
        </tr>
      `).join('') || `<tr><td style="padding:8px 0;color:#b91c1c;">Publishing failed. Please try again.</td></tr>`;

      const snippet = (body.content ?? '').trim().slice(0, 240);
      subject = failed.length
        ? `Your post failed on ${failed.map((r) => labelFor(r.platform)).join(', ')}`
        : 'Your post failed to publish';

      html = renderEmail({
        preheader: 'One or more platforms rejected your post.',
        heading: 'Your post didn\'t publish',
        body: `
          <p style="margin:0 0 12px;">We couldn't publish your post to the following platforms:</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;font-size:14px;margin:8px 0 16px;">
            ${rows}
          </table>
          ${snippet ? `<p style="margin:0 0 8px;color:#334155;font-size:13px;"><strong>Your post:</strong></p>
          <div style="background:#f9fafb;border-left:3px solid #136ed5;padding:12px 14px;border-radius:8px;white-space:pre-wrap;color:#0f172a;font-size:14px;">${snippet}</div>` : ''}
        `,
        ctaLabel: 'Retry in composer',
        ctaUrl: `${SITE_URL}/dashboard/composer`,
      });
    } else {
      throw new Error(`Unsupported notification type: ${body.type}`);
    }

    await resend.emails.send({
      from: 'Post <alex@trypost.ai>',
      to: [email],
      subject,
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('send-notification-email error:', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Failed to send' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
