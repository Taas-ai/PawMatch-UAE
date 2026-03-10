const PUBLIC_USER_FIELDS = ['id', 'email', 'name', 'phone', 'emirate', 'role', 'kycVerified', 'avatarUrl', 'createdAt'] as const;

/** Strip server-internal fields before sending user to client */
export function sanitizeUser(user: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const key of PUBLIC_USER_FIELDS) {
    if (key in user) result[key] = user[key];
  }
  return result;
}
