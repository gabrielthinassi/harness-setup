import { ApiError } from '@/lib/http/problemDetails';
import { criarQueryClient, redirecionarSeSessaoExpirou } from './queryClient';

describe('criarQueryClient', () => {
  const retry = criarQueryClient().getDefaultOptions().queries?.retry as (n: number, e: unknown) => boolean;

  it('não tenta de novo em erros 4xx', () => {
    expect(retry(0, new ApiError(404, {}))).toBe(false);
  });

  it('tenta de novo até 2 vezes em erros 5xx e de rede', () => {
    expect(retry(0, new ApiError(503, {}))).toBe(true);
    expect(retry(1, new TypeError('rede'))).toBe(true);
    expect(retry(2, new ApiError(503, {}))).toBe(false);
  });

  it('redireciona para o login quando a sessão expira', () => {
    const navegar = vi.fn();

    redirecionarSeSessaoExpirou(new ApiError(401, {}), navegar, '/chamados');

    expect(navegar).toHaveBeenCalledWith('/login?expirada=1&returnTo=%2Fchamados');
  });

  it('ignora outros erros', () => {
    const navegar = vi.fn();

    redirecionarSeSessaoExpirou(new ApiError(403, {}), navegar, '/');

    expect(navegar).not.toHaveBeenCalled();
  });
});
