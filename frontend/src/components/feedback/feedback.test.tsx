import type { UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { ApiError } from '@/lib/http/problemDetails';
import { renderWithProviders } from '@/test/render';
import { useNotify } from './NotificationProvider';
import { QueryState } from './QueryState';

function BotoesDeNotificacao() {
  const notify = useNotify();
  return (
    <>
      <button onClick={() => notify.success('Salvo com sucesso')}>sucesso</button>
      <button onClick={() => notify.error('Falhou')}>erro</button>
      <button onClick={() => notify.info('Info')}>info</button>
      <button onClick={() => notify.warning('Atenção')}>aviso</button>
    </>
  );
}

describe('NotificationProvider', () => {
  it('exibe as notificações em fila', async () => {
    const { user } = renderWithProviders(<BotoesDeNotificacao />);

    await user.click(screen.getByRole('button', { name: 'sucesso' }));
    await user.click(screen.getByRole('button', { name: 'erro' }));

    expect(await screen.findByText('Salvo com sucesso')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /fechar|close/i }));
    expect(await screen.findByText('Falhou')).toBeInTheDocument();
  });

  it('exige o provider', () => {
    const silenciar = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<BotoesDeNotificacao />)).toThrow(/NotificationProvider/);
    silenciar.mockRestore();
  });
});

function consulta<T>(parcial: Partial<UseQueryResult<T>>): UseQueryResult<T> {
  return { isPending: false, isError: false, refetch: vi.fn(), ...parcial } as unknown as UseQueryResult<T>;
}

describe('QueryState', () => {
  it('mostra carregamento', () => {
    renderWithProviders(<QueryState query={consulta({ isPending: true })}>{() => 'conteúdo'}</QueryState>);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('mostra não encontrado para 404', () => {
    renderWithProviders(
      <QueryState query={consulta({ isError: true, error: new ApiError(404, {}) })}>
        {() => 'conteúdo'}
      </QueryState>,
    );

    expect(screen.getByText('Não encontrado')).toBeInTheDocument();
  });

  it('mostra erro com nova tentativa', async () => {
    const refetch = vi.fn();
    const { user } = renderWithProviders(
      <QueryState query={consulta({ isError: true, error: new ApiError(500, {}), refetch })}>
        {() => 'conteúdo'}
      </QueryState>,
    );

    await user.click(screen.getByRole('button', { name: /tentar novamente/i }));

    expect(refetch).toHaveBeenCalled();
  });

  it('mostra vazio quando isEmpty retorna true', () => {
    renderWithProviders(
      <QueryState
        query={consulta({ data: [] })}
        isEmpty={(d: unknown[]) => d.length === 0}
        emptyTitle="Vazio"
      >
        {() => 'conteúdo'}
      </QueryState>,
    );

    expect(screen.getByText('Vazio')).toBeInTheDocument();
  });

  it('renderiza os dados', () => {
    renderWithProviders(
      <QueryState query={consulta({ data: 'olá' })}>{(dados) => <p>{dados}</p>}</QueryState>,
    );

    expect(screen.getByText('olá')).toBeInTheDocument();
  });
});
