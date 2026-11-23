import { screen, waitFor } from '@testing-library/react';
import { ApiError } from '@/lib/http/problemDetails';
import { renderWithProviders } from '@/test/render';
import { useAppMutation } from './useAppMutation';

function Botao({
  acao,
  notificarErroDeValidacao,
}: {
  acao: () => Promise<unknown>;
  notificarErroDeValidacao?: boolean;
}) {
  const mutation = useAppMutation({
    mutationFn: acao,
    mensagemSucesso: 'Feito!',
    invalidar: [['lista']],
    notificarErroDeValidacao,
  });
  return <button onClick={() => mutation.mutate()}>executar</button>;
}

describe('useAppMutation', () => {
  it('notifica sucesso e invalida o cache', async () => {
    const { user, queryClient } = renderWithProviders(<Botao acao={() => Promise.resolve('ok')} />);
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Feito!')).toBeInTheDocument();
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['lista'] });
  });

  it('notifica erro amigável', async () => {
    const { user } = renderWithProviders(
      <Botao acao={() => Promise.reject(new ApiError(409, { detail: 'Já atribuído' }))} />,
    );

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Já atribuído')).toBeInTheDocument();
  });

  it('não notifica erro de validação (fica no formulário), a menos que pedido', async () => {
    const erro = new ApiError(400, { detail: 'Inválido', errors: { Titulo: ['x'] } });
    const { user } = renderWithProviders(<Botao acao={() => Promise.reject(erro)} />);

    await user.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.queryByText('Inválido')).not.toBeInTheDocument());

    const segundo = renderWithProviders(<Botao acao={() => Promise.reject(erro)} notificarErroDeValidacao />);
    await segundo.user.click(segundo.getByRole('button'));
    expect(await segundo.findByText('Inválido')).toBeInTheDocument();
  });
});
