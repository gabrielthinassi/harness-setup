import { Skeleton, Stack } from '@mui/material';

type LoadingStateProps = {
  /** Quantidade de linhas do esqueleto. */
  linhas?: number;
  /** Rótulo lido por leitores de tela. */
  label?: string;
};

/** Esqueleto de carregamento. Prefira-o a spinners para conteúdo de página/listas (evita "pulos" de layout). */
export function LoadingState({ linhas = 5, label = 'Carregando' }: LoadingStateProps) {
  return (
    <Stack spacing={1.5} sx={{ py: 2 }} role="progressbar" aria-label={label} aria-busy>
      <Skeleton variant="text" width="40%" height={32} />
      {Array.from({ length: linhas }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={40} />
      ))}
    </Stack>
  );
}
