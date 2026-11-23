import LoginIcon from '@mui/icons-material/Login';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Entrar' };

type LoginPageProps = {
  searchParams: Promise<{ expirada?: string; returnTo?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { expirada, returnTo } = await searchParams;
  // Só caminhos relativos internos (evita open redirect)
  const destino = returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h1">Chamados</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Entre com sua conta corporativa para continuar.
            </Typography>
          </Box>
          {expirada && <Alert severity="info">Sua sessão expirou. Entre novamente.</Alert>}
          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            href={`/api/auth/login?returnTo=${encodeURIComponent(destino)}`}
          >
            Entrar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
