'use client';

import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { usePathname } from 'next/navigation';
import { Link } from '@/components/ui/Link';
import type { NavItem } from '@/config/navigation';

type NavMenuProps = {
  items: readonly NavItem[];
  onNavigate?: () => void;
};

export function isRotaAtiva(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavMenu({ items, onNavigate }: NavMenuProps) {
  const pathname = usePathname();

  return (
    <List component="nav" aria-label="Menu principal" sx={{ px: 1 }}>
      {items.map((item) => {
        const ativo = isRotaAtiva(pathname, item.href);
        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={ativo}
            aria-current={ativo ? 'page' : undefined}
            onClick={onNavigate}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
