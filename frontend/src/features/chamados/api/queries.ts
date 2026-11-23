'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListarChamadosParams } from '../types';
import { chamadosApi } from './chamadosApi';

/** Fábrica de query keys: base única para cache e invalidação da feature. */
export const chamadosKeys = {
  all: ['chamados'] as const,
  lists: () => [...chamadosKeys.all, 'list'] as const,
  list: (params: ListarChamadosParams) => [...chamadosKeys.lists(), params] as const,
  detail: (id: string) => [...chamadosKeys.all, 'detail', id] as const,
};

export function useChamados(params: ListarChamadosParams) {
  return useQuery({
    queryKey: chamadosKeys.list(params),
    queryFn: ({ signal }) => chamadosApi.listar(params, signal),
    placeholderData: keepPreviousData,
  });
}
