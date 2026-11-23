import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render';
import { AppShell } from './AppShell';
import { isRotaAtiva } from './NavMenu';
import { iniciais } from './UserMenu';

const usuario = { id: 'u1', nome: 'Ana Maria Souza', email: 'ana@empresa.com', tenantId: 't1' };

describe('AppShell', () => {
  it('renderiza menu, conteúdo e link de acessibilidade', () => {
    renderWithProviders(
      <AppShell user={usuario}>
        <p>conteúdo da página</p>
      </AppShell>,
    );

    expect(screen.getByText('conteúdo da página')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute('href', '#conteudo');
    // hidden: true → o jsdom não avalia media queries do menu responsivo
    expect(screen.getAllByRole('link', { name: 'Chamados', hidden: true }).length).toBeGreaterThan(0);
  });

  it('abre o menu do usuário com nome, e-mail e opção de sair', async () => {
    const { user } = renderWithProviders(
      <AppShell user={usuario}>
        <p />
      </AppShell>,
    );

    await user.click(screen.getByRole('button', { name: 'Conta de Ana Maria Souza' }));

    expect(screen.getByText('ana@empresa.com')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeInTheDocument();
  });

  it('abre o menu lateral no mobile', async () => {
    const { user } = renderWithProviders(
      <AppShell user={usuario}>
        <p />
      </AppShell>,
    );

    const antes = screen.getAllByRole('navigation', { name: 'Menu principal', hidden: true }).length;
    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getAllByRole('navigation', { name: 'Menu principal', hidden: true }).length).toBe(
      antes + 1,
    );
  });
});

describe('isRotaAtiva', () => {
  it.each([
    ['/', '/', true],
    ['/chamados', '/', false],
    ['/chamados', '/chamados', true],
    ['/chamados/123', '/chamados', true],
    ['/chamados-arquivados', '/chamados', false],
  ])('%s em %s → %s', (pathname, href, esperado) => {
    expect(isRotaAtiva(pathname, href)).toBe(esperado);
  });
});

describe('iniciais', () => {
  it.each([
    ['Ana Maria Souza', 'AS'],
    ['ana', 'A'],
    ['  ', '?'],
  ])('%s → %s', (nome, esperado) => {
    expect(iniciais(nome)).toBe(esperado);
  });
});
