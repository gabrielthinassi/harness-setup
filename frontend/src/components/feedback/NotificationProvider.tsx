'use client';

import { Alert, type AlertColor } from '@mui/material';
// Único ponto da aplicação autorizado a usar Snackbar diretamente.
import Snackbar from '@mui/material/Snackbar';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Notificacao = { id: number; mensagem: string; severidade: AlertColor };

export type Notify = {
  success: (mensagem: string) => void;
  error: (mensagem: string) => void;
  info: (mensagem: string) => void;
  warning: (mensagem: string) => void;
};

const NotifyContext = createContext<Notify | null>(null);

const DURACAO_MS: Record<AlertColor, number> = { success: 4000, info: 5000, warning: 6000, error: 8000 };

/** Fila de notificações (toasts). Use o hook useNotify() — nunca Snackbar diretamente. */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [fila, setFila] = useState<Notificacao[]>([]);
  const atual = fila[0];

  const adicionar = useCallback((severidade: AlertColor, mensagem: string) => {
    setFila((anterior) => [...anterior, { id: Date.now() + Math.random(), mensagem, severidade }]);
  }, []);

  const fechar = useCallback(() => setFila((anterior) => anterior.slice(1)), []);

  const notify = useMemo<Notify>(
    () => ({
      success: (m) => adicionar('success', m),
      error: (m) => adicionar('error', m),
      info: (m) => adicionar('info', m),
      warning: (m) => adicionar('warning', m),
    }),
    [adicionar],
  );

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar
        key={atual?.id}
        open={atual !== undefined}
        autoHideDuration={atual ? DURACAO_MS[atual.severidade] : null}
        onClose={(_, motivo) => motivo !== 'clickaway' && fechar()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={fechar}
          severity={atual?.severidade ?? 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {atual?.mensagem}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  );
}

export function useNotify(): Notify {
  const contexto = useContext(NotifyContext);
  if (!contexto) {
    throw new Error('useNotify deve ser usado dentro de <NotificationProvider>.');
  }
  return contexto;
}
