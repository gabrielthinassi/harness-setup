'use client';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@mui/material';
import { EmptyState } from './EmptyState';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

/** Estado de erro com ação de tentar novamente. Reaproveita o layout do EmptyState. */
export function ErrorState({
  title = 'Não foi possível carregar',
  description = 'Ocorreu um problema ao buscar as informações.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<ErrorOutlineIcon fontSize="inherit" color="error" />}
      action={
        onRetry && (
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry}>
            Tentar novamente
          </Button>
        )
      }
    />
  );
}
