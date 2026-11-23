'use client';

import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { NotificationProvider } from '@/components/feedback/NotificationProvider';
import { criarQueryClient } from '@/lib/query/queryClient';
import { theme } from '@/theme/theme';

/** Todos os providers de cliente em um só lugar (tema, cache de dados, notificações). */
type AppProvidersProps = {
  children: ReactNode;
  /** Só para testes: permite injetar um QueryClient sem novas tentativas. */
  queryClient?: QueryClient;
};

export function AppProviders({ children, queryClient: clienteExterno }: AppProvidersProps) {
  const [queryClientInterno] = useState(criarQueryClient);
  const queryClient = clienteExterno ?? queryClientInterno;

  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline enableColorScheme />
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>{children}</NotificationProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
