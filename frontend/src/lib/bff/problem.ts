import type { ProblemDetails } from '@/lib/http/problemDetails';

/** Resposta de erro do BFF no mesmo formato da API (ProblemDetails). */
export function problemResponse(status: number, title: string, detail?: string): Response {
  const corpo: ProblemDetails = { type: 'about:blank', title, status, ...(detail ? { detail } : {}) };
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}
