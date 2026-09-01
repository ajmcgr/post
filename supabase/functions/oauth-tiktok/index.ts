import { getAuthenticatedOAuthContext } from '../_shared/oauth-auth.ts';
import { createSupabaseOAuthStateRepository, issueOAuthState, validateAndConsumeOAuthState } from '../_shared/oauth-state.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resolveRedirectUri(redirectUri: string | null | undefined, origin: string | null): string {
  const fallbackOrigin = origin ?? 'https://trypost.ai';
  const candidate = (redirectUri ?? fallbackOrigin).trim();
  return candidate.includes('/oauth/')
    ? candidate
    : `${candidate.replace(/\/+$/, '')}/oauth/tiktok/callback`;
}

function isTikTokSandbox(): boolean {
  const env = Deno.env.get('TIKTOK_ENV')?.toLowerCase();
  return env === 'sandbox' || Deno.env.get('TIKTOK_SANDBOX') === 'true';
}

function getTikTokCredentials(): { clientKey: string | null; clientSecret: string | null } {
  if (isTikTokSandbox()) {
    return {
      clientKey:
        Deno.env.get('TIKTOK_SANDBOX_CLIENT_KEY') ??
        Deno.env.get('TIKTOK_SANDBOX_CLIENT_ID') ??
        Deno.env.get('TIKTOK_CLIENT_KEY') ??
        Deno.env.get('TIKTOK_CLIENT_ID'),
      clientSecret:
        Deno.env.get('TIKTOK_SANDBOX_CLIENT_SECRET') ??
        Deno.env.get('TIKTOK_CLIENT_SECRET'),
    };
  }

  return {
    clientKey: Deno.env.get('TIKTOK_CLIENT_KEY') ?? Deno.env.get('TIKTOK_CLIENT_ID'),
    clientSecret: Deno.env.get('TIKTOK_CLIENT_SECRET'),
  };
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { admin, user } = await getAuthenticatedOAuthContext(req);
    const stateRepository = createSupabaseOAuthStateRepository(admin);
    const { code, redirect_uri, state } = await req.json();

    if (!code) {
      // Return authorization URL
      const { clientKey } = getTikTokCredentials();
      const redirectUri = resolveRedirectUri(redirect_uri, req.headers.get('origin'));
      const scope = 'user.info.basic,video.upload';
      const csrfState = await issueOAuthState(stateRepository, user.id, 'tiktok');

      if (!clientKey) {
        throw new Error('TikTok client key is not configured');
      }

      const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
      authUrl.search = new URLSearchParams({
        client_key: clientKey,
        scope,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: csrfState,
      }).toString();
      
      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await validateAndConsumeOAuthState(stateRepository, user.id, 'tiktok', state);

    // Exchange code for token
    const { clientKey, clientSecret } = getTikTokCredentials();
    const redirectUri = resolveRedirectUri(redirect_uri, req.headers.get('origin'));

    if (!clientKey || !clientSecret) {
      throw new Error('TikTok client credentials are not configured');
    }

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await readJsonResponse(tokenResponse);
    
    if (!tokenResponse.ok) {
      console.error('TikTok token error:', tokenData);
      throw new Error(tokenData.error?.message || tokenData.error_description || tokenData.message || tokenData.raw || 'Failed to get access token');
    }

    // Get user info
    const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await readJsonResponse(userResponse);
    if (!userResponse.ok) {
      console.error('TikTok user info error:', userData);
      throw new Error(userData.error?.message || userData.error_description || userData.message || userData.raw || 'Failed to load TikTok profile');
    }

    const tikTokUser = userData.data?.user;
    if (!tikTokUser?.open_id) {
      console.error('TikTok user payload missing open_id:', userData);
      throw new Error('TikTok profile response did not include an open_id');
    }

    // Store connection
    const { error: dbError } = await admin
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_user_id: tikTokUser.open_id,
        platform_username: tikTokUser.display_name || 'TikTok User',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, username: tikTokUser.display_name || 'TikTok User' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
