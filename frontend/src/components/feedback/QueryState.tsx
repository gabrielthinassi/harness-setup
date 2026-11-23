'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ApiError } from '@/lib/http/problemDetails';

type QueryStateProps<T> = {
  query: UseQueryResult<T>;
  children: (dados: T) => ReactNode;
  /** Quando informado, exibe estado vazio se retornar true. */
  isEmpty?: (dados: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: ReactNode;
};

/**
 * Trata carregamento/erro/vazio de uma query de forma padronizada.
 * Use em telas que não são tabelas (detalhes, cards, dashboards).
 */
export function QueryState<T>({
  query,
  children,
  isEmpty,
  emptyTitle = 'Nada para mostrar',
  emptyDescription,
  loading,
}: QueryStateProps<T>) {
  if (query.isPending) {
    return loading ?? <LoadingState />;
  }

  if (query.isError) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <EmptyState
          title="Não encontrado"
          description="O registro não existe ou você não tem acesso a ele."
        />
      );
    }
    return <ErrorState onRetry={() => void query.refetch()} />;
  }

  if (isEmpty?.(query.data)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return children(query.data);
}
