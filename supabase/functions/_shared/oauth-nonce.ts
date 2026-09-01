export function generateSecureOAuthNonce(): string {
  return crypto.randomUUID().replaceAll('-', '');
}
