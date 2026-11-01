import { useEffect, useRef } from 'react';
import { api } from '@/lib/helpers';

export function useCsrfToken() {
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await api<{ token: string }>('/api/csrf');
        tokenRef.current = res.token;
      } catch (err) {
        console.error('Failed to fetch CSRF token:', err);
      }
    }

    fetchToken();
  }, []);

  return tokenRef;
}
