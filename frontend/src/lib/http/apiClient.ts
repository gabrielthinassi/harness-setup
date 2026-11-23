import { ApiError } from './problemDetails';
import type { QueryParams } from './types';

/**
 * Cliente HTTP do navegador. Fala SOMENTE com o BFF (/api/bff/*), nunca com a API .NET direto.
 * O token fica no servidor; o navegador só carrega o cookie de sessão httpOnly.
 */
export const BFF_BASE = '/api/bff';

type Opcoes = {
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
};

function montarUrl(caminho: string, query?: QueryParams): string {
  const url = `${BFF_BASE}/${caminho.replace(/^\/+/, '')}`;
  if (!query) {
    return url;
  }

  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(query)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params.set(chave, String(valor));
    }
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function request<T>(method: string, caminho: string, { query, body, signal }: Opcoes = {}): Promise<T> {
  const temCorpo = body !== undefined;
  const response = await fetch(montarUrl(caminho, query), {
    method,
    signal,
    credentials: 'same-origin',
    headers: { Accept: 'application/json', ...(temCorpo ? { 'Content-Type': 'application/json' } : {}) },
    body: temCorpo ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await ApiError.fromResponse(response);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(caminho: string, opcoes?: Omit<Opcoes, 'body'>) => request<T>('GET', caminho, opcoes),
  post: <T>(caminho: string, body?: unknown, opcoes?: Omit<Opcoes, 'body'>) =>
    request<T>('POST', caminho, { ...opcoes, body }),
  put: <T>(caminho: string, body?: unknown, opcoes?: Omit<Opcoes, 'body'>) =>
    request<T>('PUT', caminho, { ...opcoes, body }),
  patch: <T>(caminho: string, body?: unknown, opcoes?: Omit<Opcoes, 'body'>) =>
    request<T>('PATCH', caminho, { ...opcoes, body }),
  delete: <T = void>(caminho: string, opcoes?: Omit<Opcoes, 'body'>) => request<T>('DELETE', caminho, opcoes),
};
