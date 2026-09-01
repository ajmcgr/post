export const CONNECTION_METADATA_SELECT = 'id,platform,platform_username,is_connected,updated_at';

export const FORBIDDEN_CONNECTION_FIELDS = [
  'access_token',
  'refresh_token',
  'access_token_secret',
  'token_expires_at',
] as const;
