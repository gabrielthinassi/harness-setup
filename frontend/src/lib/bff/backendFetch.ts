import 'server-only';
import { getSession } from '@/lib/auth/session';
import { getEnv } from '@/lib/env';
import { ApiError } from '@/lib/http/problemDetails';

/**
 * Chamada à API .NET a partir de Server Components / Server Actions.
 * Componentes de cliente usam apiClient (que passa pelo BFF).
 */
export async function backendJson<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const session = await getSession();
  const headers = new Headers(init.headers);
  headers.set('accept', 'application/json');
  if (session) {
    headers.set('authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(new URL(caminho, getEnv().BACKEND_API_URL), {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}
