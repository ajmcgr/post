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

function buildMetaAuthUrl(appId: string, redirectUri: string, options: {
  configId?: string | null;
  scope?: string | null;
  state: string;
}) {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: options.state,
  });

  if (options.configId) {
    params.set('config_id', options.configId);
  } else if (options.scope) {
    params.set('scope', options.scope);
  }

  return `https://www.facebook.com/v25.0/dialog/oauth?${params.toString()}`;
}

async function fetchMetaPages(userAccessToken: string) {
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(userAccessToken)}`
  );
  const pagesData = await pagesResponse.json();
  if (!pagesResponse.ok) {
    console.error('Instagram pages error:', pagesData);
    throw new Error(pagesData.error?.message || 'Failed to load connected Facebook pages');
  }
  return pagesData.data ?? [];
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
      // Prefer Facebook Login for Business when an Instagram Graph API config is available.
      const clientId = Deno.env.get('FACEBOOK_APP_ID');
      const configId = Deno.env.get('META_INSTAGRAM_CONFIG_ID');
      const redirectUri = resolveRedirectUri(redirect_uri, 'instagram', req.headers.get('origin'));
      const scope = 'instagram_basic,instagram_content_publish,pages_show_list,business_management';
      const authState = await issueOAuthState(stateRepository, user.id, 'instagram');
      const authUrl = buildMetaAuthUrl(clientId ?? '', redirectUri, { configId, scope, state: authState });
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await validateAndConsumeOAuthState(stateRepository, user.id, 'instagram', state);

    // Exchange code for a Meta user token, then swap to the linked page token for publishing.
    const clientId = Deno.env.get('FACEBOOK_APP_ID');
    const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    const redirectUri = resolveRedirectUri(redirect_uri, 'instagram', req.headers.get('origin'));

    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`
    );

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Instagram token error:', tokenData);
      throw new Error('Failed to get access token');
    }

    const pages = await fetchMetaPages(tokenData.access_token);
    const pageWithInstagram = pages.find((page: any) => page.instagram_business_account?.id && page.access_token);
    if (!pageWithInstagram?.instagram_business_account?.id || !pageWithInstagram?.access_token) {
      throw new Error('No Instagram business account is connected to a Facebook page for this login.');
    }

    // Store connection
    const { error: dbError } = await admin
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        platform: 'instagram',
        platform_user_id: pageWithInstagram.instagram_business_account.id,
        platform_username: pageWithInstagram.instagram_business_account.username || pageWithInstagram.name,
        access_token: pageWithInstagram.access_token,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({ success: true }),
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
