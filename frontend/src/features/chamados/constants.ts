import type { StatusConfig } from '@/components/ui';
import type { Prioridade, StatusChamado } from './types';

export const STATUS_CHAMADO: StatusConfig<StatusChamado> = {
  Aberto: { label: 'Aberto', color: 'info' },
  EmAtendimento: { label: 'Em atendimento', color: 'warning' },
  Resolvido: { label: 'Resolvido', color: 'success' },
  Fechado: { label: 'Fechado', color: 'default' },
};

export const PRIORIDADE: StatusConfig<Prioridade> = {
  Baixa: { label: 'Baixa', color: 'default' },
  Media: { label: 'Média', color: 'info' },
  Alta: { label: 'Alta', color: 'warning' },
  Critica: { label: 'Crítica', color: 'error' },
};
