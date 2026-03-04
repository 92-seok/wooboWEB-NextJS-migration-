export function generateToken(username: string, type: 'access' | 'refresh'): string {
  const payload = {
    username,
    type,
    iat: Date.now(),
    exp: Date.now() + (type === 'access' ? 3600000 : 86400000),
  };
  return btoa(JSON.stringify(payload))
}

export function verifyToken(token: string): { username: string; type: string } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}