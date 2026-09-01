export interface ConnectionOwnerRecord {
  user_id: string;
}

export function assertConnectionOwner(connection: ConnectionOwnerRecord, authenticatedUserId: string): void {
  if (connection.user_id !== authenticatedUserId) throw new Error('Forbidden');
}
