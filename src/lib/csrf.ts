import { randomBytes } from 'crypto';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function verifyCsrfToken(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie');
  const cookieToken = cookieHeader?.match(/csrf-token=([^;]+)/)?.[1] ?? null;
  const headerToken = request.headers.get('x-csrf-token');
  return cookieToken !== null && headerToken !== null && cookieToken === headerToken;
}

export function getCsrfToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  return cookieHeader?.match(/csrf-token=([^;]+)/)?.[1] ?? null;
}
