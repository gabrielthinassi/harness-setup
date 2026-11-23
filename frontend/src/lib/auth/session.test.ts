// @vitest-environment node
import type { Session } from './types';

const store = new Map<string, string>();
const cookiesMock = {
  get: (nome: string) => (store.has(nome) ? { name: nome, value: store.get(nome)! } : undefined),
  set: vi.fn((nome: string, valor: string) => void store.set(nome, valor)),
  delete: vi.fn((nome: string) => void store.delete(nome)),
};

vi.mock('next/headers', () => ({ cookies: async () => cookiesMock }));

const env = { NODE_ENV: 'test', SESSION_SECRET: Buffer.alloc(32, 7).toString('base64') };
vi.mock('@/lib/env', () => ({ getEnv: () => env }));

const { createSession, deleteSession, getSession } = await import('./session');
const { SESSION_COOKIE } = await import('./constants');

const sessao: Session = {
  accessToken: 'abc',
  expiresAt: Date.now() + 60 * 60 * 1000,
  user: { id: 'u1', nome: 'Ana Souza', email: 'ana@x.com', tenantId: 't1' },
};

beforeEach(() => {
  store.clear();
  env.SESSION_SECRET = Buffer.alloc(32, 7).toString('base64');
});

describe('sessão', () => {
  it('grava cookie httpOnly criptografado e lê de volta', async () => {
    await createSession(sessao);

    const token = store.get(SESSION_COOKIE)!;
    expect(token).not.toContain('abc');
    expect(cookiesMock.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      token,
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    );
    await expect(getSession()).resolves.toMatchObject({ accessToken: 'abc', user: sessao.user });
  });

  it('retorna null sem cookie', async () => {
    await expect(getSession()).resolves.toBeNull();
  });

  it('retorna null para cookie adulterado', async () => {
    store.set(SESSION_COOKIE, 'valor-invalido');

    await expect(getSession()).resolves.toBeNull();
  });

  it('retorna null para sessão expirada', async () => {
    await createSession({ ...sessao, expiresAt: Date.now() + 1000 });
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + 5000);

    await expect(getSession()).resolves.toBeNull();
    vi.useRealTimers();
  });

  it('remove o cookie no logout', async () => {
    await createSession(sessao);
    await deleteSession();

    expect(store.has(SESSION_COOKIE)).toBe(false);
  });

  it('exige chave de 32 bytes', async () => {
    env.SESSION_SECRET = Buffer.alloc(16).toString('base64');

    await expect(createSession(sessao)).rejects.toThrow(/32 bytes/);
  });
});
