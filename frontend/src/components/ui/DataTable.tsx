'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  type TableCellProps,
} from '@mui/material';
import type { ReactNode } from 'react';
import { TAMANHOS_PAGINA } from '@/hooks/usePaginacao';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { LoadingState } from './LoadingState';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (linha: T) => ReactNode;
  align?: TableCellProps['align'];
  width?: number | string;
};

export type DataTablePagination = {
  /** Página atual, 1-based (igual à API). */
  pagina: number;
  tamanhoPagina: number;
  total: number;
  onPaginaChange: (pagina: number) => void;
  onTamanhoPaginaChange: (tamanho: number) => void;
};

type DataTableProps<T> = {
  /** Descrição da tabela para leitores de tela. */
  label: string;
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  getRowId: (linha: T) => string;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onRowClick?: (linha: T) => void;
  pagination?: DataTablePagination;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
};

/**
 * Tabela padrão de listagens: já trata carregamento, erro, vazio e paginação.
 * Toda listagem da aplicação usa este componente — não monte <Table> nas features.
 */
export function DataTable<T>({
  label,
  columns,
  rows,
  getRowId,
  loading = false,
  error = false,
  onRetry,
  onRowClick,
  pagination,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription,
  emptyAction,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Paper>
        <LoadingState label={`Carregando ${label}`} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper>
        <ErrorState onRetry={onRetry} />
      </Paper>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Paper>
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table aria-label={label} size="medium">
          <TableHead>
            <TableRow>
              {columns.map((coluna) => (
                <TableCell key={coluna.id} align={coluna.align} sx={{ width: coluna.width }}>
                  {coluna.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((linha) => (
              <TableRow
                key={getRowId(linha)}
                hover={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(linha) : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((coluna) => (
                  <TableCell key={coluna.id} align={coluna.align}>
                    {coluna.cell(linha)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.pagina - 1}
          rowsPerPage={pagination.tamanhoPagina}
          rowsPerPageOptions={[...TAMANHOS_PAGINA]}
          onPageChange={(_, pagina) => pagination.onPaginaChange(pagina + 1)}
          onRowsPerPageChange={(evento) => pagination.onTamanhoPaginaChange(Number(evento.target.value))}
        />
      )}
    </Paper>
  );
}
