import 'server-only';
import { getSession } from '@/lib/auth/session';
import { getEnv } from '@/lib/env';
import { problemResponse } from './problem';

const METODOS_COM_CORPO = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Só estes cabeçalhos vão para a API. Cookies do navegador nunca são repassados. */
const CABECALHOS_REQUISICAO = ['accept', 'accept-language', 'content-type', 'if-match', 'if-none-match'];
const CABECALHOS_RESPOSTA = ['content-type', 'etag', 'cache-control', 'location'];

/**
 * BFF: repassa /api/bff/<caminho> para <BACKEND_API_URL>/api/<caminho>,
 * anexando o token da sessão. O navegador nunca vê o token nem a URL da API.
 */
export async function proxyToBackend(request: Request, segmentos: string[]): Promise<Response> {
  if (METODOS_COM_CORPO.has(request.method) && !mesmaOrigem(request)) {
    return problemResponse(403, 'Origem não permitida');
  }

  if (segmentos.length === 0 || segmentos.some((s) => s === '..' || s === '.' || s.includes('/'))) {
    return problemResponse(400, 'Caminho inválido');
  }

  const session = await getSession();
  if (!session) {
    return problemResponse(401, 'Sessão expirada', 'Faça login novamente.');
  }

  const destino = new URL(`/api/${segmentos.map(encodeURIComponent).join('/')}`, getEnv().BACKEND_API_URL);
  destino.search = new URL(request.url).search;

  const headers = new Headers();
  for (const nome of CABECALHOS_REQUISICAO) {
    const valor = request.headers.get(nome);
    if (valor) {
      headers.set(nome, valor);
    }
  }
  headers.set('authorization', `Bearer ${session.accessToken}`);
  headers.set('x-correlation-id', request.headers.get('x-correlation-id') ?? crypto.randomUUID());

  let body: ArrayBuffer | undefined;
  if (METODOS_COM_CORPO.has(request.method)) {
    const conteudo = await request.arrayBuffer();
    body = conteudo.byteLength > 0 ? conteudo : undefined;
  }

  let resposta: Response;
  try {
    resposta = await fetch(destino, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return problemResponse(502, 'Serviço indisponível', 'Não foi possível contatar a API.');
  }

  const headersResposta = new Headers();
  for (const nome of CABECALHOS_RESPOSTA) {
    const valor = resposta.headers.get(nome);
    if (valor) {
      headersResposta.set(nome, valor);
    }
  }

  return new Response(resposta.body, { status: resposta.status, headers: headersResposta });
}

/** Proteção CSRF: requisições que alteram estado precisam vir da própria aplicação. */
function mesmaOrigem(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host;
  if (!origin) {
    return false;
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
