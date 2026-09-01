import test from 'node:test';
import assert from 'node:assert/strict';
import { assertConnectionOwner } from './connection-ownership.ts';
import { generateSecureOAuthNonce } from './oauth-nonce.ts';
import {
  hashOAuthState,
  issueOAuthState,
  OAUTH_STATE_TTL_MS,
  type OAuthStateConsumeRequest,
  type OAuthStateRecord,
  type OAuthStateRepository,
  validateAndConsumeOAuthState,
} from './oauth-state.ts';
import { CONNECTION_METADATA_SELECT, FORBIDDEN_CONNECTION_FIELDS } from './social-connection-fields.ts';

class MemoryOAuthStateRepository implements OAuthStateRepository {
  private records: Array<OAuthStateRecord & { consumed: boolean }> = [];

  async create(record: OAuthStateRecord) {
    this.records = this.records.filter((item) => item.userId !== record.userId || item.platform !== record.platform);
    this.records.push({ ...record, consumed: false });
  }

  async consume(request: OAuthStateConsumeRequest) {
    const record = this.records.find((item) =>
      item.userId === request.userId
      && item.platform === request.platform
      && item.stateHash === request.stateHash
      && !item.consumed
      && new Date(item.expiresAt).getTime() > Date.now()
    );
    if (!record) return false;
    record.consumed = true;
    return true;
  }
}

test('connection metadata allowlist excludes every provider token field', () => {
  const fields = CONNECTION_METADATA_SELECT.split(',');
  assert.deepEqual(fields, ['id', 'platform', 'platform_username', 'is_connected', 'updated_at']);
  for (const forbidden of FORBIDDEN_CONNECTION_FIELDS) assert.equal(fields.includes(forbidden), false);
});

test('OAuth state and Twitter nonce use cryptographic randomness', async () => {
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('Math.random must not be used'); };
  try {
    const repository = new MemoryOAuthStateRepository();
    const state = await issueOAuthState(repository, 'user-1', 'linkedin');
    const nonce = generateSecureOAuthNonce();
    assert.match(state, /^[0-9a-f-]{36}$/i);
    assert.match(nonce, /^[0-9a-f]{32}$/i);
  } finally {
    Math.random = originalRandom;
  }
});

test('correct OAuth state succeeds once', async () => {
  const repository = new MemoryOAuthStateRepository();
  const state = await issueOAuthState(repository, 'user-1', 'linkedin');
  await validateAndConsumeOAuthState(repository, 'user-1', 'linkedin', state);
  await assert.rejects(() => validateAndConsumeOAuthState(repository, 'user-1', 'linkedin', state), /Invalid or expired/);
});

test('missing and incorrect OAuth state fail', async () => {
  const repository = new MemoryOAuthStateRepository();
  await issueOAuthState(repository, 'user-1', 'facebook');
  await assert.rejects(() => validateAndConsumeOAuthState(repository, 'user-1', 'facebook', null), /Missing OAuth state/);
  await assert.rejects(() => validateAndConsumeOAuthState(repository, 'user-1', 'facebook', 'incorrect'), /Invalid or expired/);
});

test('expired OAuth state fails', async () => {
  const repository = new MemoryOAuthStateRepository();
  const state = await issueOAuthState(repository, 'user-1', 'youtube', Date.now() - OAUTH_STATE_TTL_MS - 1);
  await assert.rejects(() => validateAndConsumeOAuthState(repository, 'user-1', 'youtube', state), /Invalid or expired/);
});

test('OAuth state cannot cross users or platforms', async () => {
  const repository = new MemoryOAuthStateRepository();
  const state = await issueOAuthState(repository, 'user-1', 'tiktok');
  await assert.rejects(() => validateAndConsumeOAuthState(repository, 'user-2', 'tiktok', state), /Invalid or expired/);
  await assert.rejects(() => validateAndConsumeOAuthState(repository, 'user-1', 'threads', state), /Invalid or expired/);
  await validateAndConsumeOAuthState(repository, 'user-1', 'tiktok', state);
});

test('OAuth state is stored only as a hash', async () => {
  const state = crypto.randomUUID();
  const hash = await hashOAuthState(state);
  assert.notEqual(hash, state);
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test('disconnect ownership succeeds for owner and fails for non-owner', () => {
  assert.doesNotThrow(() => assertConnectionOwner({ user_id: 'owner' }, 'owner'));
  assert.throws(() => assertConnectionOwner({ user_id: 'owner' }, 'attacker'), /Forbidden/);
});
