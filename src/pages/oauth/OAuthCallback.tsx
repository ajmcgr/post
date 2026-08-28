import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { getOAuthCallbackUrl } from '@/lib/appUrl';
import { trackEvent } from '@/lib/analytics';

async function getSessionAccessToken(retries = 10, delayMs = 250): Promise<string | null> {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }

    const accessToken = data.session?.access_token ?? null;
    if (accessToken) {
      return accessToken;
    }

    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const platform = location.pathname.split('/')[2]; // Extract platform from path

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const oauthToken = params.get('oauth_token');
      const oauthVerifier = params.get('oauth_verifier');
      const error = params.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/dashboard');
        return;
      }

      if (!code && !(platform === 'twitter' && oauthToken && oauthVerifier)) {
        console.error('No authorization code received');
        navigate('/dashboard');
        return;
      }

      try {
        const accessToken = await getSessionAccessToken();
        if (!accessToken) {
          throw new Error('Your session expired. Please sign in again and reconnect.');
        }

        // Send code to backend to exchange for token
        const { data, error: invokeError } = await supabase.functions.invoke(`oauth-${platform}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            code,
            oauth_token: oauthToken,
            oauth_verifier: oauthVerifier,
            redirect_uri: getOAuthCallbackUrl(platform),
          },
        });

        if (invokeError) {
          console.error('Error exchanging code:', invokeError);
          throw invokeError;
        }

        if (data?.success) {
          trackEvent('oauth_connection_completed', { platform });
          // Fire-and-forget confirmation email
          supabase.functions.invoke('send-notification-email', {
            headers: { Authorization: `Bearer ${accessToken}` },
            body: {
              type: 'connection_success',
              platform,
              platformUsername: data?.platform_username ?? data?.username ?? null,
            },
          }).catch((e) => console.warn('notification email failed:', e));

          // Redirect back to dashboard with success
          navigate('/dashboard?connected=' + platform);
        } else {
          throw new Error(data?.error || 'Failed to connect account');
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        navigate('/dashboard?error=' + encodeURIComponent(err.message));
      }
    };

    handleCallback();
  }, [location, navigate, platform]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-lg">Connecting your account...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
