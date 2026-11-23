import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { DataTable, type DataTableColumn } from './DataTable';

type Linha = { id: string; nome: string };

const colunas: DataTableColumn<Linha>[] = [{ id: 'nome', header: 'Nome', cell: (l) => l.nome }];
const linhas: Linha[] = [
  { id: '1', nome: 'Primeiro' },
  { id: '2', nome: 'Segundo' },
];

describe('DataTable', () => {
  it('renderiza cabeçalhos e linhas', () => {
    renderWithProviders(<DataTable label="itens" columns={colunas} rows={linhas} getRowId={(l) => l.id} />);

    const tabela = screen.getByRole('table', { name: 'itens' });
    expect(within(tabela).getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
    expect(within(tabela).getAllByRole('row')).toHaveLength(3);
  });

  it('mostra esqueleto enquanto carrega', () => {
    renderWithProviders(
      <DataTable label="itens" columns={colunas} rows={undefined} getRowId={(l) => l.id} loading />,
    );

    expect(screen.getByRole('progressbar', { name: 'Carregando itens' })).toBeInTheDocument();
  });

  it('mostra erro com ação de tentar novamente', async () => {
    const onRetry = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        label="itens"
        columns={colunas}
        rows={undefined}
        getRowId={(l) => l.id}
        error
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('mostra estado vazio personalizado', () => {
    renderWithProviders(
      <DataTable label="itens" columns={colunas} rows={[]} getRowId={(l) => l.id} emptyTitle="Sem itens" />,
    );

    expect(screen.getByText('Sem itens')).toBeInTheDocument();
  });

  it('dispara clique na linha', async () => {
    const onRowClick = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        label="itens"
        columns={colunas}
        rows={linhas}
        getRowId={(l) => l.id}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText('Segundo'));

    expect(onRowClick).toHaveBeenCalledWith(linhas[1]);
  });

  it('pagina em base 1 e troca o tamanho da página', async () => {
    const onPaginaChange = vi.fn();
    const onTamanhoPaginaChange = vi.fn();
    const { user } = renderWithProviders(
      <DataTable
        label="itens"
        columns={colunas}
        rows={linhas}
        getRowId={(l) => l.id}
        pagination={{ pagina: 1, tamanhoPagina: 10, total: 25, onPaginaChange, onTamanhoPaginaChange }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /próxima página/i }));
    expect(onPaginaChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '50' }));
    expect(onTamanhoPaginaChange).toHaveBeenCalledWith(50);
  });
});
