import { proxyToBackend } from '@/lib/bff/proxy';

type Contexto = { params: Promise<{ path: string[] }> };

async function handler(request: Request, { params }: Contexto): Promise<Response> {
  const { path } = await params;
  return proxyToBackend(request, path);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
