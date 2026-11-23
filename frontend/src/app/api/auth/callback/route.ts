import { problemResponse } from '@/lib/bff/problem';

/**
 * Retorno do provedor OIDC.
 * TODO: trocar o code pelo token, montar a Session (accessToken, expiresAt, user com tenantId)
 * e chamar createSession(); depois redirecionar para o returnTo validado (somente caminhos relativos).
 */
export function GET(): Response {
  return problemResponse(501, 'Login não configurado', 'Configure o provedor OIDC em src/app/api/auth.');
}
