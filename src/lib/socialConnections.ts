import { supabase } from '@/lib/supabase';

export interface SocialConnectionMetadata {
  id: string;
  platform: string;
  platform_username: string | null;
  is_connected: boolean;
  updated_at: string;
}

export async function listSocialConnections(): Promise<SocialConnectionMetadata[]> {
  const { data, error } = await supabase.functions.invoke('list-social-connections', { body: {} });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return Array.isArray(data?.connections) ? data.connections : [];
}

export async function disconnectSocialConnection(connectionId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('disconnect-social-account', {
    body: { connectionId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
}
