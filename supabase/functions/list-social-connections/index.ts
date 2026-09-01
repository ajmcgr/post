import { getAuthenticatedOAuthContext } from '../_shared/oauth-auth.ts';
import { CONNECTION_METADATA_SELECT } from '../_shared/social-connection-fields.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { admin, user } = await getAuthenticatedOAuthContext(req);
    const { data, error } = await admin
      .from('oauth_connections')
      .select(CONNECTION_METADATA_SELECT)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (error) throw error;

    return new Response(JSON.stringify({ connections: data ?? [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load connections';
    return new Response(JSON.stringify({ error: message }), {
      status: message === 'Unauthorized' || message === 'Missing authorization header' ? 401 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
