import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { ConfirmDialog } from './ConfirmDialog';
import { ErrorState } from './ErrorState';
import { TextLink } from './Link';
import { PageHeader } from './PageHeader';
import { StatusChip, type StatusConfig } from './StatusChip';

describe('PageHeader', () => {
  it('renderiza título como h1, descrição e ações', () => {
    renderWithProviders(<PageHeader title="Chamados" description="Lista" actions={<button>Novo</button>} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Chamados' })).toBeInTheDocument();
    expect(screen.getByText('Lista')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument();
  });
});

describe('StatusChip', () => {
  type Status = 'A' | 'B';
  const config: StatusConfig<Status> = {
    A: { label: 'Ativo', color: 'success' },
    B: { label: 'Bloqueado', color: 'error' },
  };

  it('usa o rótulo do mapa', () => {
    renderWithProviders(<StatusChip value="B" config={config} />);

    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
  });

  it('mostra o valor bruto se não houver mapeamento', () => {
    renderWithProviders(<StatusChip value={'C' as Status} config={config} />);

    expect(screen.getByText('C')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('não mostra botão sem onRetry', () => {
    renderWithProviders(<ErrorState />);

    expect(screen.getByText('Não foi possível carregar')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('TextLink', () => {
  it('renderiza link de navegação', () => {
    renderWithProviders(<TextLink href="/chamados">Ver chamados</TextLink>);

    expect(screen.getByRole('link', { name: 'Ver chamados' })).toHaveAttribute('href', '/chamados');
  });
});

describe('ConfirmDialog', () => {
  const props = {
    open: true,
    title: 'Excluir item?',
    description: 'Esta ação não pode ser desfeita.',
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  };

  it('é acessível e confirma', async () => {
    const { user } = renderWithProviders(<ConfirmDialog {...props} destructive confirmLabel="Excluir" />);

    expect(screen.getByRole('dialog', { name: 'Excluir item?' })).toHaveAccessibleDescription(
      'Esta ação não pode ser desfeita.',
    );
    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it('cancela', async () => {
    const { user } = renderWithProviders(<ConfirmDialog {...props} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('bloqueia cancelamento durante o carregamento', () => {
    renderWithProviders(<ConfirmDialog {...props} loading />);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
