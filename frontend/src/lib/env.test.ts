// @vitest-environment node
import { getEnv, resetEnvCache } from './env';

describe('getEnv', () => {
  beforeEach(() => {
    resetEnvCache();
    vi.unstubAllEnvs();
  });

  it('valida e aplica valores padrão', () => {
    vi.stubEnv('BACKEND_API_URL', 'https://api.local');
    vi.stubEnv('SESSION_SECRET', 'segredo');
    vi.stubEnv('OIDC_ISSUER', '');

    const env = getEnv();

    expect(env.BACKEND_API_URL).toBe('https://api.local');
    expect(env.APP_URL).toBe('http://localhost:3000');
    expect(env.OIDC_ISSUER).toBeUndefined();
  });

  it('falha quando falta variável obrigatória', () => {
    vi.stubEnv('BACKEND_API_URL', '');
    vi.stubEnv('SESSION_SECRET', '');

    expect(() => getEnv()).toThrow();
  });
});
