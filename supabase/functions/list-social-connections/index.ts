import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CONNECTION_METADATA_SELECT = 'id,platform,platform_username,is_connected,updated_at';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const admin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } },
    );
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized');

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
