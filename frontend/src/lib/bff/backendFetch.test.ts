// @vitest-environment node
import type { Session } from '@/lib/auth/types';
import { ApiError } from '@/lib/http/problemDetails';

const getSession = vi.fn<() => Promise<Session | null>>();
vi.mock('@/lib/auth/session', () => ({ getSession: () => getSession() }));
vi.mock('@/lib/env', () => ({ getEnv: () => ({ BACKEND_API_URL: 'https://api.interna' }) }));

const { backendJson } = await import('./backendFetch');

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  getSession.mockResolvedValue({
    accessToken: 'tk',
    expiresAt: Date.now() + 60_000,
    user: { id: 'u', nome: 'U', email: 'u@x.com', tenantId: 't' },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('backendJson', () => {
  it('chama a API com o token da sessão', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ total: 1 }), { status: 200 }));

    await expect(backendJson('/api/chamados')).resolves.toEqual({ total: 1 });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe('https://api.interna/api/chamados');
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer tk');
  });

  it('não envia Authorization sem sessão e trata 204', async () => {
    getSession.mockResolvedValue(null);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(backendJson('/api/x', { method: 'DELETE' })).resolves.toBeUndefined();

    const [, init] = fetchMock.mock.calls[0]!;
    expect(new Headers(init?.headers).has('authorization')).toBe(false);
  });

  it('lança ApiError em respostas de erro', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ title: 'Proibido' }), { status: 403 }));

    await expect(backendJson('/api/x')).rejects.toBeInstanceOf(ApiError);
  });
});
