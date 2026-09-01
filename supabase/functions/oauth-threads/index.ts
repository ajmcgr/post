import { getAuthenticatedOAuthContext } from '../_shared/oauth-auth.ts';
import { createSupabaseOAuthStateRepository, issueOAuthState, validateAndConsumeOAuthState } from '../_shared/oauth-state.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resolveRedirectUri(redirectUri: string | null | undefined, platform: string, origin: string | null): string {
  const fallbackOrigin = origin ?? 'https://trypost.ai';
  const candidate = (redirectUri ?? fallbackOrigin).trim();
  return candidate.includes('/oauth/')
    ? candidate
    : `${candidate.replace(/\/+$/, '')}/oauth/${platform}/callback`;
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
      // Return authorization URL (Threads uses Meta's OAuth)
      const appId = Deno.env.get('THREADS_APP_ID');
      const redirectUri = resolveRedirectUri(redirect_uri, 'threads', req.headers.get('origin'));
      const scope = 'threads_basic,threads_content_publish';
      const authState = await issueOAuthState(stateRepository, user.id, 'threads');
      const authUrl = `https://threads.net/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&state=${encodeURIComponent(authState)}`;
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await validateAndConsumeOAuthState(stateRepository, user.id, 'threads', state);

    // Exchange code for token
    const appId = Deno.env.get('THREADS_APP_ID');
    const appSecret = Deno.env.get('THREADS_APP_SECRET');
    const redirectUri = resolveRedirectUri(redirect_uri, 'threads', req.headers.get('origin'));

    if (!appId || !appSecret) {
      throw new Error('Threads app credentials are not configured');
    }

    const tokenResponse = await fetch(
      `https://graph.threads.net/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: appId!,
          client_secret: appSecret!,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }),
      }
    );

    const tokenData = await readJsonResponse(tokenResponse);
    
    if (!tokenResponse.ok) {
      console.error('Threads token error:', tokenData);
      throw new Error(tokenData.error?.message || tokenData.error_message || tokenData.raw || 'Failed to get Threads access token');
    }

    // Get user info
    const meResponse = await fetch(
      `https://graph.threads.net/v1.0/me?fields=id,username`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );
    const meData = await readJsonResponse(meResponse);
    if (!meResponse.ok) {
      console.error('Threads me error:', meData);
      throw new Error(meData.error?.message || meData.error_message || meData.raw || 'Failed to load Threads profile');
    }

    if (!meData.id || !meData.username) {
      console.error('Threads me payload missing expected fields:', meData);
      throw new Error('Threads profile response did not include an id and username');
    }

    // Store connection
    const { error: dbError } = await admin
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        platform: 'threads',
        platform_user_id: meData.id,
        platform_username: meData.username,
        access_token: tokenData.access_token,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true, username: meData.username }),
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
