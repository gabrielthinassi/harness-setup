import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/**
 * Regras de arquitetura do frontend:
 * - features só se comunicam pela API pública (index.ts) umas das outras;
 * - componentes MUI que têm versão padronizada em src/components não são usados diretamente;
 * - código de servidor (lib/bff, lib/auth) nunca é importado por componentes de cliente.
 */
const muiPadronizados = {
  name: '@mui/material',
  importNames: ['TextField', 'Select', 'Dialog', 'Snackbar', 'Table', 'Link'],
  message:
    'Use os componentes padronizados de @/components (FormTextField, FormSelect, ConfirmDialog, useNotify, DataTable, Link).',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'react/jsx-no-useless-fragment': 'error',
    },
  },
  {
    files: ['src/features/**', 'src/app/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [muiPadronizados],
          patterns: [
            {
              group: ['@/features/*/*'],
              message: 'Importe outra feature apenas pela API pública: @/features/<nome>.',
            },
            {
              group: ['@mui/material/TextField', '@mui/material/Dialog', '@mui/material/Table'],
              message: 'Use os componentes padronizados de @/components.',
            },
          ],
        },
      ],
    },
  },
  {
    // Os wrappers padronizados são o único lugar onde esses componentes MUI podem ser usados
    files: ['src/components/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
]);

export default eslintConfig;
