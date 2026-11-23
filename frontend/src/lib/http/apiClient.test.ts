import { jsonResponse } from '@/test/render';
import { apiClient } from './apiClient';
import { ApiError } from './problemDetails';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiClient', () => {
  it('chama o BFF com query string, ignorando valores vazios', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    const resultado = await apiClient.get('/chamados', {
      query: { pagina: 2, status: undefined, busca: '' },
    });

    expect(resultado).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('/api/bff/chamados?pagina=2');
    expect(init).toMatchObject({ method: 'GET', credentials: 'same-origin' });
  });

  it('envia corpo JSON nas mutações', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: '1' }, 201));

    await apiClient.post('chamados', { titulo: 'X' });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ titulo: 'X' }));
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it.each([
    ['put', () => apiClient.put('x', {})],
    ['patch', () => apiClient.patch('x', {})],
    ['delete', () => apiClient.delete('x')],
  ])('retorna undefined para 204 (%s)', async (_, chamada) => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(chamada()).resolves.toBeUndefined();
  });

  it('lança ApiError com o ProblemDetails em respostas de erro', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ title: 'Conflito' }, 409, 'application/problem+json'));

    const erro = await apiClient.get('x').catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ApiError);
    expect((erro as ApiError).status).toBe(409);
  });
});
