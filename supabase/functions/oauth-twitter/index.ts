import { createHmac } from 'node:crypto';
import { getAuthenticatedOAuthContext } from '../_shared/oauth-auth.ts';
import { generateSecureOAuthNonce } from '../_shared/oauth-nonce.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const API_KEY = Deno.env.get('TWITTER_CONSUMER_KEY')?.trim();
const API_SECRET = Deno.env.get('TWITTER_CONSUMER_SECRET')?.trim();

function pct(value: string): string {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function parseFormEncoded(text: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(text).entries());
}

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method.toUpperCase()}&${pct(url)}&${pct(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${pct(k)}=${pct(v)}`)
      .join('&')
  )}`;
  const signingKey = `${pct(consumerSecret)}&${pct(tokenSecret)}`;
  const hmacSha1 = createHmac('sha1', signingKey);
  return hmacSha1.update(signatureBaseString).digest('base64');
}

function generateOAuthHeader(method: string, url: string, extraParams: Record<string, string> = {}, tokenSecret = ''): string {
  if (!API_KEY || !API_SECRET) {
    throw new Error('Twitter OAuth credentials are not configured');
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: API_KEY!,
    oauth_nonce: generateSecureOAuthNonce(),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
  };

  for (const [key, value] of Object.entries(extraParams)) {
    if (key.startsWith('oauth_')) {
      oauthParams[key] = value;
    }
  }

  const signature = generateOAuthSignature(method, url, { ...oauthParams, ...extraParams }, API_SECRET!, tokenSecret);
  const signedOAuthParams = { ...oauthParams, oauth_signature: signature };

  return (
    'OAuth ' +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${pct(k)}="${pct(v)}"`)
      .join(', ')
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { admin, user } = await getAuthenticatedOAuthContext(req);

    const { oauth_token, oauth_verifier, redirect_uri } = await req.json();

    if (!oauth_token || !oauth_verifier) {
      const callbackUrl = `${redirect_uri || req.headers.get('origin')}/oauth/twitter/callback`;
      const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
      const requestTokenParams = { oauth_callback: callbackUrl };
      const requestTokenResponse = await fetch(requestTokenUrl, {
        method: 'POST',
        headers: { Authorization: generateOAuthHeader('POST', requestTokenUrl, requestTokenParams) },
      });

      const requestTokenText = await requestTokenResponse.text();
      const requestTokenData = parseFormEncoded(requestTokenText);

      if (!requestTokenResponse.ok || requestTokenData.oauth_callback_confirmed !== 'true') {
        console.error('Twitter request token error:', requestTokenText);
        throw new Error(`Twitter request token error: ${requestTokenResponse.status}`);
      }

      const { error: tempError } = await admin
        .from('oauth_connections')
        .upsert({
          user_id: user.id,
          platform: 'twitter',
          platform_user_id: requestTokenData.oauth_token,
          platform_username: 'Twitter authorization in progress',
          access_token: requestTokenData.oauth_token,
          access_token_secret: requestTokenData.oauth_token_secret,
          is_connected: false,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform'
        });

      if (tempError) {
        console.error('Twitter temp token database error:', tempError);
        throw tempError;
      }

      return new Response(
        JSON.stringify({ authUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${encodeURIComponent(requestTokenData.oauth_token)}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: tempConnection, error: tempLookupError } = await admin
      .from('oauth_connections')
      .select('access_token_secret')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .eq('access_token', oauth_token)
      .maybeSingle();

    if (tempLookupError || !tempConnection?.access_token_secret) {
      console.error('Twitter temp token lookup error:', tempLookupError);
      throw new Error('Twitter authorization session expired. Please try connecting again.');
    }

    const accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    const accessTokenParams = { oauth_token, oauth_verifier };
    const accessTokenResponse = await fetch(accessTokenUrl, {
      method: 'POST',
      headers: {
        Authorization: generateOAuthHeader('POST', accessTokenUrl, accessTokenParams, tempConnection.access_token_secret),
      },
    });

    const accessTokenText = await accessTokenResponse.text();
    const accessTokenData = parseFormEncoded(accessTokenText);

    if (!accessTokenResponse.ok || !accessTokenData.oauth_token || !accessTokenData.oauth_token_secret) {
      console.error('Twitter access token error:', accessTokenText);
      throw new Error(`Twitter access token error: ${accessTokenResponse.status}`);
    }

    const { error: dbError } = await admin
      .from('oauth_connections')
      .upsert({
        user_id: user.id,
        platform: 'twitter',
        platform_user_id: accessTokenData.user_id,
        platform_username: accessTokenData.screen_name,
        access_token: accessTokenData.oauth_token,
        access_token_secret: accessTokenData.oauth_token_secret,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        username: accessTokenData.screen_name 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
