'use client';

/** Último recurso: erro no layout raiz (sem tema/providers disponíveis). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'grid',
          placeItems: 'center',
          minHeight: '100dvh',
        }}
      >
        <main style={{ textAlign: 'center' }}>
          <h1>Algo deu errado</h1>
          <button type="button" onClick={reset}>
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
