import { screen } from '@testing-library/react';
import type { Pagina } from '@/lib/http/types';
import { renderWithProviders } from '@/test/render';
import { chamadosApi } from '../api/chamadosApi';
import type { ChamadoResumo } from '../types';
import { ChamadosList } from './ChamadosList';

vi.mock('../api/chamadosApi', () => ({ chamadosApi: { listar: vi.fn() } }));
const listar = vi.mocked(chamadosApi.listar);

const pagina: Pagina<ChamadoResumo> = {
  itens: [
    {
      id: '1',
      titulo: 'Impressora não imprime',
      prioridade: 'Alta',
      status: 'EmAtendimento',
      responsavelId: null,
      criadoEm: '2026-11-23T10:00:00Z',
    },
  ],
  pagina: 1,
  tamanhoPagina: 20,
  total: 1,
};

describe('ChamadosList', () => {
  beforeEach(() => listar.mockReset());

  it('lista os chamados com status e prioridade traduzidos', async () => {
    listar.mockResolvedValue(pagina);

    renderWithProviders(<ChamadosList />);

    expect(await screen.findByText('Impressora não imprime')).toBeInTheDocument();
    expect(screen.getByText('Em atendimento')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
    expect(listar).toHaveBeenCalledWith({ pagina: 1, tamanhoPagina: 20 }, expect.anything());
  });

  it('mostra estado vazio', async () => {
    listar.mockResolvedValue({ ...pagina, itens: [], total: 0 });

    renderWithProviders(<ChamadosList />);

    expect(await screen.findByText('Nenhum chamado por aqui')).toBeInTheDocument();
  });

  it('mostra erro com nova tentativa', async () => {
    listar.mockRejectedValueOnce(new Error('falhou')).mockResolvedValueOnce(pagina);

    const { user } = renderWithProviders(<ChamadosList />);
    await user.click(await screen.findByRole('button', { name: /tentar novamente/i }));

    expect(await screen.findByText('Impressora não imprime')).toBeInTheDocument();
  });
});
