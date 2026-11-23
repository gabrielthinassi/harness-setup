'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import {
  Avatar,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import type { SessionUser } from '@/lib/auth/types';

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes.at(-1)?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase() || '?';
}

export function UserMenu({ user }: { user: SessionUser }) {
  const [ancora, setAncora] = useState<HTMLElement | null>(null);
  const aberto = ancora !== null;
  const fechar = () => setAncora(null);
  const formLogout = useRef<HTMLFormElement>(null);

  return (
    <>
      <Tooltip title="Conta">
        <IconButton
          onClick={(evento) => setAncora(evento.currentTarget)}
          aria-label={`Conta de ${user.nome}`}
          aria-haspopup="menu"
          aria-expanded={aberto}
        >
          <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{iniciais(user.nome)}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={ancora} open={aberto} onClose={fechar}>
        <MenuItem
          disabled
          sx={{ flexDirection: 'column', alignItems: 'flex-start', opacity: '1 !important' }}
        >
          <Typography variant="subtitle2">{user.nome}</Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => formLogout.current?.requestSubmit()}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
      {/* Logout por POST (nunca GET) para evitar CSRF */}
      <form ref={formLogout} action="/api/auth/logout" method="post" hidden />
    </>
  );
}
