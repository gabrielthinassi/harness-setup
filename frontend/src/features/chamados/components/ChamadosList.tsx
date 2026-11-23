'use client';

import { DataTable, StatusChip, type DataTableColumn } from '@/components/ui';
import { usePaginacao } from '@/hooks/usePaginacao';
import { formatarDataHora } from '@/lib/format';
import { useChamados } from '../api/queries';
import { PRIORIDADE, STATUS_CHAMADO } from '../constants';
import type { ChamadoResumo } from '../types';

const COLUNAS: DataTableColumn<ChamadoResumo>[] = [
  { id: 'titulo', header: 'Título', cell: (c) => c.titulo },
  {
    id: 'prioridade',
    header: 'Prioridade',
    cell: (c) => <StatusChip value={c.prioridade} config={PRIORIDADE} />,
  },
  { id: 'status', header: 'Status', cell: (c) => <StatusChip value={c.status} config={STATUS_CHAMADO} /> },
  { id: 'criadoEm', header: 'Aberto em', cell: (c) => formatarDataHora(c.criadoEm), align: 'right' },
];

/** Exemplo de listagem: composição de componentes compartilhados, sem markup próprio de tabela. */
export function ChamadosList() {
  const { pagina, tamanhoPagina, setPagina, setTamanhoPagina } = usePaginacao();
  const consulta = useChamados({ pagina, tamanhoPagina });

  return (
    <DataTable
      label="chamados"
      columns={COLUNAS}
      rows={consulta.data?.itens}
      getRowId={(c) => c.id}
      loading={consulta.isPending}
      error={consulta.isError}
      onRetry={() => void consulta.refetch()}
      emptyTitle="Nenhum chamado por aqui"
      emptyDescription="Quando um chamado for aberto, ele aparecerá nesta lista."
      pagination={
        consulta.data && {
          pagina,
          tamanhoPagina,
          total: consulta.data.total,
          onPaginaChange: setPagina,
          onTamanhoPaginaChange: setTamanhoPagina,
        }
      }
    />
  );
}
