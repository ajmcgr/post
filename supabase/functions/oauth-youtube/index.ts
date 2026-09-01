import { getAuthenticatedOAuthContext } from '../_shared/oauth-auth.ts';
import { createSupabaseOAuthStateRepository, issueOAuthState, validateAndConsumeOAuthState } from '../_shared/oauth-state.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
      const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
      const redirectUri = `${redirect_uri || req.headers.get('origin')}/oauth/youtube/callback`;
      const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube';
      const authState = await issueOAuthState(stateRepository, user.id, 'youtube');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&state=${encodeURIComponent(authState)}`;
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await validateAndConsumeOAuthState(stateRepository, user.id, 'youtube', state);

    // Exchange code for token
    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');
    const redirectUri = redirect_uri || `${req.headers.get('origin')}/oauth/youtube/callback`;

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('YouTube token error:', tokenData);
      throw new Error('Failed to get access token');
    }

    // Get channel info
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];

    // Store connection
    const { error: dbError } = await admin
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        platform: 'youtube',
        platform_user_id: channel?.id,
        platform_username: channel?.snippet?.title || 'YouTube Channel',
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
      JSON.stringify({ success: true, username: channel?.snippet?.title }),
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
