import { Chip, type ChipProps } from '@mui/material';

export type StatusConfig<TValor extends string> = Record<
  TValor,
  { label: string; color: ChipProps['color'] }
>;

type StatusChipProps<TValor extends string> = {
  value: TValor;
  config: StatusConfig<TValor>;
  size?: ChipProps['size'];
};

/**
 * Chip de status genérico. Cada feature define só o mapa valor → { label, color }
 * (ex.: features/chamados/constants.ts) em vez de criar um chip próprio.
 */
export function StatusChip<TValor extends string>({
  value,
  config,
  size = 'small',
}: StatusChipProps<TValor>) {
  const item = config[value];
  return (
    <Chip label={item?.label ?? value} color={item?.color ?? 'default'} size={size} variant="outlined" />
  );
}
