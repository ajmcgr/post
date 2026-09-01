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
    : `${candidate.replace(/\/+$/, '')}/oauth/linkedin/callback`;
}

async function fetchLinkedInProfile(accessToken: string) {
  const endpoints = [
    {
      url: 'https://api.linkedin.com/v2/me',
      map: (payload: any) => ({
        id: payload?.id,
        name: [payload?.localizedFirstName, payload?.localizedLastName].filter(Boolean).join(' ').trim(),
      }),
    },
    {
      url: 'https://api.linkedin.com/v2/userinfo',
      map: (payload: any) => ({
        id: payload?.sub,
        name: payload?.name,
      }),
    },
  ];

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint.url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error('LinkedIn profile lookup failed:', endpoint.url, payload);
      continue;
    }

    const profile = endpoint.map(payload);
    if (profile.id) {
      return {
        id: profile.id as string,
        name: (profile.name as string | undefined)?.trim() || 'LinkedIn User',
      };
    }
  }

  throw new Error('Failed to load LinkedIn member profile');
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
      const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
      const redirectUri = resolveRedirectUri(redirect_uri, req.headers.get('origin'));
      const scope = 'r_liteprofile w_member_social';
      const authState = await issueOAuthState(stateRepository, user.id, 'linkedin');
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(authState)}&scope=${encodeURIComponent(scope)}`;
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await validateAndConsumeOAuthState(stateRepository, user.id, 'linkedin', state);

    // Exchange code for token
    const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
    const redirectUri = resolveRedirectUri(redirect_uri, req.headers.get('origin'));

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('LinkedIn token error:', tokenData);
      throw new Error('Failed to get access token');
    }

    const profileData = await fetchLinkedInProfile(tokenData.access_token);

    // Store connection
    const { error: dbError } = await admin
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        platform: 'linkedin',
        platform_user_id: profileData.id,
        platform_username: profileData.name,
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
      JSON.stringify({ success: true, username: profileData.name }),
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
