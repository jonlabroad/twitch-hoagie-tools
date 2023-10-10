export function getAuthHeaders(username: string, accessToken: string) {
  const token = btoa(`${username}:${accessToken}`);
  return {
    Authorization: `Basic ${token}`,
  };
}
