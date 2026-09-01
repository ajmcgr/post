export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export interface OAuthStateRecord {
  userId: string;
  platform: string;
  stateHash: string;
  expiresAt: string;
}

export interface OAuthStateConsumeRequest {
  userId: string;
  platform: string;
  stateHash: string;
}

export interface OAuthStateRepository {
  create(record: OAuthStateRecord): Promise<void>;
  consume(request: OAuthStateConsumeRequest): Promise<boolean>;
}

export function generateSecureOAuthState(): string {
  return crypto.randomUUID();
}

export async function hashOAuthState(state: string): Promise<string> {
  const bytes = new TextEncoder().encode(state);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function issueOAuthState(
  repository: OAuthStateRepository,
  userId: string,
  platform: string,
  now = Date.now(),
): Promise<string> {
  const state = generateSecureOAuthState();
  await repository.create({
    userId,
    platform,
    stateHash: await hashOAuthState(state),
    expiresAt: new Date(now + OAUTH_STATE_TTL_MS).toISOString(),
  });
  return state;
}

export async function validateAndConsumeOAuthState(
  repository: OAuthStateRepository,
  userId: string,
  platform: string,
  state: string | null | undefined,
): Promise<void> {
  if (!state) throw new Error('Missing OAuth state');

  const consumed = await repository.consume({
    userId,
    platform,
    stateHash: await hashOAuthState(state),
  });
  if (!consumed) throw new Error('Invalid or expired OAuth state');
}

export function createSupabaseOAuthStateRepository(admin: any): OAuthStateRepository {
  return {
    async create(record) {
      await admin
        .from('oauth_states')
        .delete()
        .eq('user_id', record.userId)
        .eq('platform', record.platform)
        .is('consumed_at', null);

      const { error } = await admin.from('oauth_states').insert({
        user_id: record.userId,
        platform: record.platform,
        state_hash: record.stateHash,
        expires_at: record.expiresAt,
      });
      if (error) throw error;
    },
    async consume(request) {
      const { data, error } = await admin.rpc('consume_oauth_state', {
        target_user_id: request.userId,
        target_platform: request.platform,
        target_state_hash: request.stateHash,
      });
      if (error) throw error;
      return data === true;
    },
  };
}
