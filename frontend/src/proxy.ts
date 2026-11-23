import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

const ROTAS_PUBLICAS = ['/login', '/api/auth'];

/**
 * Next.js 16 (antigo middleware.ts). Verificação OTIMISTA: só checa a presença do cookie.
 * A validação real da sessão acontece no layout protegido e no BFF.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (ROTAS_PUBLICAS.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`))) {
    return NextResponse.next();
  }

  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { type: 'about:blank', title: 'Sessão expirada', status: 401 },
      { status: 401, headers: { 'Content-Type': 'application/problem+json' } },
    );
  }

  const login = request.nextUrl.clone();
  login.pathname = '/login';
  login.search = '';
  login.searchParams.set('returnTo', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
