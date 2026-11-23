'use client';

import { Link as MuiLink, type LinkProps as MuiLinkProps } from '@mui/material';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';

/**
 * Link do Next pronto para `component={Link}` em componentes MUI (Button, ListItemButton...).
 * O arquivo é 'use client' para poder ser passado como prop a partir de Server Components (Next 16).
 */
export const Link = NextLink;

type TextLinkProps = Omit<MuiLinkProps, 'href'> & { href: ComponentProps<typeof NextLink>['href'] };

/** Link de texto com o estilo do tema e navegação client-side. */
export function TextLink({ href, ...props }: TextLinkProps) {
  return <MuiLink component={NextLink} href={href} {...props} />;
}
