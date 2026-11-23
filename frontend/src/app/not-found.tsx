import { Box, Button } from '@mui/material';
import { EmptyState, Link } from '@/components/ui';

export default function NotFound() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <EmptyState
        title="Página não encontrada"
        description="O endereço acessado não existe ou foi movido."
        action={
          <Button component={Link} href="/" variant="contained">
            Voltar ao início
          </Button>
        }
      />
    </Box>
  );
}
