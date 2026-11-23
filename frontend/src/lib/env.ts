import 'server-only';
import { z } from 'zod';

const urlOpcional = z.preprocess((valor) => (valor === '' ? undefined : valor), z.url().optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BACKEND_API_URL: z.url(),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET é obrigatório (32 bytes em base64).'),
  APP_URL: z.url().default('http://localhost:3000'),
  OIDC_ISSUER: urlOpcional,
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof schema>;

let cache: ServerEnv | undefined;

/**
 * Variáveis de ambiente do servidor, validadas na primeira leitura.
 * Nunca use process.env diretamente fora deste arquivo.
 */
export function getEnv(): ServerEnv {
  cache ??= schema.parse(process.env);
  return cache;
}

/** Só para testes. */
export function resetEnvCache(): void {
  cache = undefined;
}
