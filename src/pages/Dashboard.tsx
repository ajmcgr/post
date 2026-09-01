import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { disconnectSocialConnection, listSocialConnections, type SocialConnectionMetadata } from '@/lib/socialConnections';

const platforms = [
  { id: 'twitter', name: 'Twitter / X', icon: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'threads', name: 'Threads', icon: '🧵' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
];

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<SocialConnectionMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
    
    // Check for OAuth callback success/error
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    
    if (connected) {
      alert(`Successfully connected to ${connected}!`);
      window.history.replaceState({}, '', '/dashboard');
    } else if (error) {
      alert(`Error: ${error}`);
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      setConnections(await listSocialConnections());
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
    setLoading(false);
  };

  const handleConnect = async (platform: string) => {
    try {
      setLoading(true);
      
      if (platform === 'twitter') {
        // Twitter uses direct credentials, no OAuth flow needed
        const { data, error } = await supabase.functions.invoke('oauth-twitter', {
          body: {}
        });
        
        if (error) throw error;
        
        if (data.success) {
          await loadConnections();
        }
      } else {
        // For other platforms, initiate OAuth flow
        const { data, error } = await supabase.functions.invoke(`oauth-${platform}`, {
          body: { redirect_uri: window.location.origin }
        });
        
        if (error) throw error;
        
        if (data.authUrl) {
          // Redirect to OAuth provider
          window.location.href = data.authUrl;
        }
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(`Failed to connect to ${platform}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await disconnectSocialConnection(connectionId);
      await loadConnections();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to disconnect account: ${message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showSignup={false} />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your social media connections</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/composer')}>
              Create Post
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const connection = connections.find(c => c.platform === platform.id);
            const isConnected = connection?.is_connected;

            return (
              <Card key={platform.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{platform.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        {connection?.platform_username && (
                          <CardDescription>@{connection.platform_username}</CardDescription>
                        )}
                      </div>
                    </div>
                    {isConnected && (
                      <Badge variant="default">Connected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isConnected ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => connection && handleDisconnect(connection.id)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleConnect(platform.id)}
                    >
                      Connect
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
