import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Próximo passo sugerido ao usuário (ex.: botão "Criar o primeiro"). */
  action?: ReactNode;
};

/** Estado vazio: sempre explique o motivo e ofereça o próximo passo. */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack spacing={1.5} sx={{ py: 6, px: 2, alignItems: 'center', textAlign: 'center' }} role="status">
      <Stack sx={{ color: 'text.disabled', fontSize: 48, lineHeight: 0 }} aria-hidden>
        {icon ?? <InboxOutlinedIcon fontSize="inherit" />}
      </Stack>
      <Typography variant="h3" component="p">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
