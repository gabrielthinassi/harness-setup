'use client';

import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';

/**
 * Tema único da aplicação. Cores, tipografia, espaçamentos e padrões de componentes
 * ficam AQUI — componentes não usam cores/tamanhos fixos (hex, px), e sim tokens do tema.
 */
export const theme = createTheme(
  {
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: {
      light: {
        palette: {
          primary: { main: '#1d4ed8' },
          secondary: { main: '#7c3aed' },
          background: { default: '#f6f7f9', paper: '#ffffff' },
        },
      },
      dark: {
        palette: {
          primary: { main: '#60a5fa' },
          secondary: { main: '#a78bfa' },
        },
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      h1: { fontSize: '1.75rem', fontWeight: 600 },
      h2: { fontSize: '1.375rem', fontWeight: 600 },
      h3: { fontSize: '1.125rem', fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: { defaultProps: { disableElevation: true } },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
      MuiPaper: { defaultProps: { variant: 'outlined' } },
      MuiTableCell: { styleOverrides: { head: { fontWeight: 600 } } },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  },
  ptBR,
);
