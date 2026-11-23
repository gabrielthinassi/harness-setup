'use client';

import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import type { ReactNode } from 'react';

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

/** Menu lateral. Novas áreas da aplicação entram SÓ aqui. */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', label: 'Início', icon: <DashboardOutlinedIcon /> },
  { href: '/chamados', label: 'Chamados', icon: <ConfirmationNumberOutlinedIcon /> },
];
