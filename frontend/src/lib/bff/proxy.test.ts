// @vitest-environment node
import type { Session } from '@/lib/auth/types';

const getSession = vi.fn<() => Promise<Session | null>>();
vi.mock('@/lib/auth/session', () => ({ getSession: () => getSession() }));
vi.mock('@/lib/env', () => ({ getEnv: () => ({ BACKEND_API_URL: 'https://api.interna:7100' }) }));

const { proxyToBackend } = await import('./proxy');

const sessao: Session = {
  accessToken: 'token-secreto',
  expiresAt: Date.now() + 60_000,
  user: { id: 'u1', nome: 'Ana', email: 'ana@x.com', tenantId: 't1' },
};

const fetchMock = vi.fn<typeof fetch>();

function requisicao(caminho: string, init: RequestInit = {}): Request {
  return new Request(`http://localhost:3000/api/bff/${caminho}`, init);
}

beforeEach(() => {
  getSession.mockResolvedValue(sessao);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'set-cookie': 'interno=1', etag: '"v1"' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('proxyToBackend', () => {
  it('repassa para a API com o token da sessão e a query string', async () => {
    const resposta = await proxyToBackend(
      requisicao('chamados?pagina=2', {
        headers: { cookie: 'chamados_session=abc', accept: 'application/json' },
      }),
      ['chamados'],
    );

    expect(resposta.status).toBe(200);
    const [destino, init] = fetchMock.mock.calls[0]!;
    expect(String(destino)).toBe('https://api.interna:7100/api/chamados?pagina=2');
    const headers = new Headers(init?.headers);
    expect(headers.get('authorization')).toBe('Bearer token-secreto');
    expect(headers.get('cookie')).toBeNull();
    expect(headers.get('x-correlation-id')).toBeTruthy();
  });

  it('não devolve cabeçalhos internos da API ao navegador', async () => {
    const resposta = await proxyToBackend(requisicao('chamados'), ['chamados']);

    expect(resposta.headers.get('set-cookie')).toBeNull();
    expect(resposta.headers.get('etag')).toBe('"v1"');
  });

  it('repassa o corpo em mutações da mesma origem', async () => {
    await proxyToBackend(
      requisicao('chamados', {
        method: 'POST',
        body: JSON.stringify({ titulo: 'X' }),
        headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      }),
      ['chamados'],
    );

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe('{"titulo":"X"}');
  });

  it.each([
    ['sem origin', {}],
    ['de outra origem', { origin: 'https://site-malicioso.com' }],
    ['com origin inválido', { origin: 'nao-e-url' }],
  ])('bloqueia mutação %s (CSRF)', async (_, headers) => {
    const resposta = await proxyToBackend(requisicao('chamados', { method: 'POST', headers }), ['chamados']);

    expect(resposta.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retorna 401 sem sessão', async () => {
    getSession.mockResolvedValue(null);

    const resposta = await proxyToBackend(requisicao('chamados'), ['chamados']);

    expect(resposta.status).toBe(401);
    expect(resposta.headers.get('content-type')).toBe('application/problem+json');
  });

  it.each([[[]], [['..', 'admin']], [['a/b']]])('rejeita caminho inválido %j', async (segmentos) => {
    const resposta = await proxyToBackend(requisicao('x'), segmentos);

    expect(resposta.status).toBe(400);
  });

  it('retorna 502 quando a API está fora do ar', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    const resposta = await proxyToBackend(requisicao('chamados'), ['chamados']);

    expect(resposta.status).toBe(502);
  });
});
