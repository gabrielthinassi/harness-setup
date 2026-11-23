import { problemResponse } from '@/lib/bff/problem';

/**
 * Início do login OIDC (Authorization Code + PKCE).
 * TODO: integrar o provedor de identidade do time (Keycloak, Entra ID, Auth0...).
 * Recomendado: biblioteca `openid-client`. Ao final do fluxo, o callback chama createSession().
 */
export function GET(): Response {
  return problemResponse(501, 'Login não configurado', 'Configure o provedor OIDC em src/app/api/auth.');
}
