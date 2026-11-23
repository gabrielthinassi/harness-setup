'use client';

import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { NAV_ITEMS } from '@/config/navigation';
import { useDisclosure } from '@/hooks/useDisclosure';
import type { SessionUser } from '@/lib/auth/types';
import { NavMenu } from './NavMenu';
import { UserMenu } from './UserMenu';

const LARGURA_MENU = 248;

type AppShellProps = {
  user: SessionUser;
  children: ReactNode;
};

/**
 * Estrutura das telas autenticadas: barra superior, menu lateral responsivo e área de conteúdo.
 * A troca entre menu fixo (desktop) e gaveta (mobile) é feita só com CSS, sem diferença entre SSR e cliente.
 */
export function AppShell({ user, children }: AppShellProps) {
  const menuMobile = useDisclosure();

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Box
        component="a"
        href="#conteudo"
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': { left: 16, top: 16, zIndex: 'tooltip', p: 1, bgcolor: 'background.paper' },
        }}
      >
        Pular para o conteúdo
      </Box>

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={menuMobile.abrir}
            aria-label="Abrir menu"
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="span" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Chamados
          </Typography>
          <UserMenu user={user} />
        </Toolbar>
      </AppBar>

      <Box component="aside" sx={{ width: { md: LARGURA_MENU }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={menuMobile.aberto}
          onClose={menuMobile.fechar}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: LARGURA_MENU } }}
        >
          <NavMenu items={NAV_ITEMS} onNavigate={menuMobile.fechar} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: LARGURA_MENU } }}
        >
          <Toolbar />
          <NavMenu items={NAV_ITEMS} />
        </Drawer>
      </Box>

      <Box
        component="main"
        id="conteudo"
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
