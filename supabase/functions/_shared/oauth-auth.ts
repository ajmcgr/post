import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getAuthenticatedOAuthContext(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw new Error('Missing authorization header');

  const token = authHeader.replace(/^Bearer\s+/i, '');
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) throw new Error('Unauthorized');

  return { admin, user };
}
