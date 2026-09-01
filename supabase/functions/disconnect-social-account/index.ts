import { getAuthenticatedOAuthContext } from '../_shared/oauth-auth.ts';
import { assertConnectionOwner } from '../_shared/connection-ownership.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StoredConnection {
  id: string;
  user_id: string;
  platform: string;
  access_token: string | null;
  refresh_token: string | null;
}

function isTikTokSandbox(): boolean {
  const env = Deno.env.get('TIKTOK_ENV')?.toLowerCase();
  return env === 'sandbox' || Deno.env.get('TIKTOK_SANDBOX') === 'true';
}

function getTikTokCredentials() {
  if (isTikTokSandbox()) {
    return {
      clientKey: Deno.env.get('TIKTOK_SANDBOX_CLIENT_KEY') ?? Deno.env.get('TIKTOK_SANDBOX_CLIENT_ID') ?? Deno.env.get('TIKTOK_CLIENT_KEY') ?? Deno.env.get('TIKTOK_CLIENT_ID'),
      clientSecret: Deno.env.get('TIKTOK_SANDBOX_CLIENT_SECRET') ?? Deno.env.get('TIKTOK_CLIENT_SECRET'),
    };
  }
  return {
    clientKey: Deno.env.get('TIKTOK_CLIENT_KEY') ?? Deno.env.get('TIKTOK_CLIENT_ID'),
    clientSecret: Deno.env.get('TIKTOK_CLIENT_SECRET'),
  };
}

async function revokeConnection(connection: StoredConnection): Promise<boolean> {
  if (connection.platform === 'youtube') {
    const token = connection.refresh_token ?? connection.access_token;
    if (!token) return false;
    const response = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    });
    if (!response.ok) throw new Error(`YouTube revocation failed (${response.status})`);
    return true;
  }

  if (connection.platform === 'tiktok') {
    const { clientKey, clientSecret } = getTikTokCredentials();
    if (!clientKey || !clientSecret || !connection.access_token) return false;
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        token: connection.access_token,
      }),
    });
    if (!response.ok) throw new Error(`TikTok revocation failed (${response.status})`);
    return true;
  }

  // LinkedIn, Meta/Instagram, Threads, and Twitter do not expose a practical
  // per-connection revocation call for the credentials stored by this app.
  // Their local credentials are deleted immediately below; users can also
  // revoke Post from the provider's connected-app settings.
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { admin, user } = await getAuthenticatedOAuthContext(req);
    const { connectionId } = await req.json();
    if (!connectionId || typeof connectionId !== 'string') throw new Error('Missing connectionId');

    const { data, error } = await admin
      .from('oauth_connections')
      .select('id,user_id,platform,access_token,refresh_token')
      .eq('id', connectionId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ error: 'Connection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const connection = data as StoredConnection;
    try {
      assertConnectionOwner(connection, user.id);
    } catch {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let revoked = false;
    try {
      revoked = await revokeConnection(connection);
    } catch (revokeError) {
      console.warn(`Provider revocation failed for ${connection.platform}; removing local credentials`, revokeError);
    }

    const { error: deleteError } = await admin
      .from('oauth_connections')
      .delete()
      .eq('id', connection.id)
      .eq('user_id', user.id);
    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true, revoked }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to disconnect account';
    return new Response(JSON.stringify({ error: message }), {
      status: message === 'Unauthorized' || message === 'Missing authorization header' ? 401 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
