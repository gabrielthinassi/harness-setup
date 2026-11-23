import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query';
import { ApiError } from '@/lib/http/problemDetails';

/** Sessão expirada (401) em qualquer query/mutação → volta para o login preservando a página atual. */
export function redirecionarSeSessaoExpirou(
  erro: unknown,
  navegar: (url: string) => void = (url) => window.location.assign(url),
  caminhoAtual: string = typeof window === 'undefined' ? '/' : window.location.pathname,
): void {
  if (erro instanceof ApiError && erro.status === 401) {
    navegar(`/login?expirada=1&returnTo=${encodeURIComponent(caminhoAtual)}`);
  }
}

export function criarQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: (erro) => redirecionarSeSessaoExpirou(erro) }),
    mutationCache: new MutationCache({ onError: (erro) => redirecionarSeSessaoExpirou(erro) }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Erros 4xx não melhoram com nova tentativa
        retry: (tentativas, erro) => !(erro instanceof ApiError && erro.status < 500) && tentativas < 2,
      },
    },
  });
}
