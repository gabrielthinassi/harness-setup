import 'server-only';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';
import { getEnv } from '@/lib/env';
import { SESSION_COOKIE } from './constants';
import type { Session } from './types';

function chave(): Uint8Array {
  const bytes = Buffer.from(getEnv().SESSION_SECRET, 'base64');
  if (bytes.length !== 32) {
    throw new Error('SESSION_SECRET deve ter exatamente 32 bytes em base64.');
  }
  return bytes;
}

/** Grava a sessão em um cookie httpOnly criptografado (JWE A256GCM). */
export async function createSession(session: Session): Promise<void> {
  const token = await new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(session.expiresAt / 1000))
    .encrypt(chave());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: getEnv().NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.expiresAt),
  });
}

/** Lê e valida a sessão. Retorna null se ausente, adulterada ou expirada. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtDecrypt(token, chave());
    const session = payload as unknown as Session;
    return session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
