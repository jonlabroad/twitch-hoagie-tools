export function getAuthHeaders(userId: string, accessToken: string) {
  const token = btoa(`${userId}:${accessToken}`);
  return {
    Authorization: `Basic ${token}`,
  };
}
