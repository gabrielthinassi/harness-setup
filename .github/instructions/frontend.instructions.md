---
applyTo: "frontend/**"
---
# Regras do Frontend (Next.js 16 · App Router · BFF · TypeScript · Material UI)

Itens marcados com **[B]** são BLOQUEANTES na revisão de código.

## 1. Estrutura de pastas
```
src/
  app/                 rotas (App Router). Páginas finas: compõem componentes, sem lógica
    (auth)/            rotas públicas (login)
    (app)/             rotas autenticadas (layout valida a sessão)
    api/bff/[...path]  BFF: proxy autenticado para a API .NET
    api/auth/          login / callback / logout (OIDC)
  components/          COMPARTILHADOS, sem regra de negócio
    ui/                PageHeader, DataTable, EmptyState, ErrorState, LoadingState, StatusChip, ConfirmDialog, Link
    form/              Form, FormTextField, FormSelect, FormActions, useZodForm
    feedback/          NotificationProvider/useNotify, QueryState
    layout/            AppShell, NavMenu, UserMenu
  features/<feature>/  tudo de uma área de negócio
    api/               <feature>Api.ts (HTTP) + queries.ts (hooks React Query + query keys)
    components/        componentes da feature
    constants.ts       mapas de status/labels (StatusConfig)
    types.ts           contratos espelhando a API
    index.ts           API PÚBLICA da feature
  hooks/               hooks genéricos (useDisclosure, usePaginacao)
  lib/                 infraestrutura (http, bff, auth, query, env, format)
  config/              navegação e configurações estáticas
  theme/               tema MUI (único lugar com cores e tipografia)
  providers/           providers de cliente
```

## 2. Reutilização (anti-duplicação)
- **[B]** Antes de criar um componente, procure em `src/components`. Se algo parecido existir, estenda-o
  com props e não crie outro.
- **[B]** Componentes padronizados obrigatórios (o ESLint bloqueia o uso direto nas features):

  | Necessidade | Use | Não use |
  |---|---|---|
  | Listagem/tabela | `DataTable` | `Table` do MUI |
  | Campo de formulário | `FormTextField` / `FormSelect` | `TextField` / `Select` |
  | Formulário | `Form` + `useZodForm` + `FormActions` | `<form>` + `useForm` soltos |
  | Confirmação | `ConfirmDialog` + `useDisclosure` | `Dialog` |
  | Toast/mensagem | `useNotify()` | `Snackbar` |
  | Mutação | `useAppMutation` | `useMutation` direto |
  | Carregando/erro/vazio | `QueryState`, `LoadingState`, `ErrorState`, `EmptyState` | spinners e mensagens soltas |
  | Status colorido | `StatusChip` + `StatusConfig` em `constants.ts` | `Chip` com `if`s de cor |
  | Cabeçalho de página | `PageHeader` | `Typography h1` solto |
  | Link | `Link` / `TextLink` de `@/components/ui` | `Link` do MUI ou `<a>` interno |
  | Datas | `formatarData` / `formatarDataHora` | `toLocaleString` inline |

- Um componente que for usado por uma segunda feature sobe para `src/components` (genérico, sem regra de negócio).
- **[B]** `npm run dup` (jscpd) precisa passar. Duplicação acima do limite reprova o PR.

## 3. Features
- **[B]** Uma feature importa outra somente pelo `index.ts` (`@/features/chamados`), nunca por arquivos internos.
- **[B]** Componentes não chamam `fetch`/`apiClient` diretamente: usam `<feature>Api.ts`, consumido
  pelos hooks de `queries.ts`.
- Query keys em fábrica (`chamadosKeys.list(params)`). Invalidação sempre a partir dessa fábrica.
- Tipos em `types.ts` com os nomes da API (camelCase). Enums como union de strings.

## 4. BFF e segurança
- **[B]** O navegador fala só com `/api/bff/*` (via `apiClient`). A URL da API .NET e o token **nunca**
  chegam ao cliente. Nada de `NEXT_PUBLIC_` com URL da API ou segredo.
- **[B]** Token só no cookie de sessão httpOnly criptografado (`lib/auth/session.ts`).
  Proibido `localStorage`/`sessionStorage` para tokens ou dados sensíveis.
- **[B]** Código de `lib/auth`, `lib/bff` e `lib/env` tem `import 'server-only'` e não é importado por
  componentes `'use client'`.
- **[B]** `process.env` só em `lib/env.ts` (validado com Zod).
- Server Components que precisam de dados usam `backendJson()`, e componentes de cliente usam React Query + `apiClient`.
- Redirecionamentos com `returnTo` aceitam somente caminhos relativos (`/...`, nunca `//`).
- O `proxy.ts` faz só uma checagem otimista. A validação real da sessão fica no layout `(app)` e no BFF.

## 5. Next.js / React
- Server Components por padrão. `'use client'` só onde há estado, efeitos, eventos ou hooks de navegação,
  o mais perto possível da folha da árvore.
- **[B]** Componentes de servidor não passam funções como props para componentes de cliente (exceto
  `component={Link}` usando o `Link` de `@/components/ui`).
- Toda rota de grupo tem `loading.tsx` e `error.tsx`. Metadados (`metadata`) definidos em cada página.
- Hooks que leem a URL (`useSearchParams`) ficam dentro de `<Suspense>`.
- Estado de filtros e paginação que precisa ser compartilhável vai na URL (search params).

## 6. UX e acessibilidade
- **[B]** Toda tela trata os quatro estados: carregando (esqueleto), erro (com "Tentar novamente"),
  vazio (com explicação e próximo passo) e sucesso.
- **[B]** Toda ação de escrita dá feedback (toast de sucesso/erro). Ações destrutivas pedem confirmação.
- Botões de envio mostram carregamento e bloqueiam duplo clique (o `FormActions` já faz isso).
- Erros de validação aparecem no campo (o `Form` mapeia os 400 da API automaticamente).
- **[B]** Acessibilidade:
  - um único `h1` por página;
  - todo campo tem `label`;
  - botões só com ícone têm `aria-label`;
  - foco visível;
  - contraste vindo do tema.
- Responsivo do mobile ao desktop (`sx` com breakpoints). Nada de largura fixa em px para layout.
- **[B]** Cores, espaçamentos e tipografia saem do tema (`theme.palette`, `sx={{ p: 2 }}`). Proibido usar hex/px
  soltos nos componentes.
- Textos da interface em português.

## 7. TypeScript e estilo
- **[B]** `strict` sem `any` (use `unknown` + narrowing). Sem `@ts-ignore`, e `@ts-expect-error` só com justificativa.
- Imports com alias `@/`. Imports de tipo com `import type`.
- Componentes como funções nomeadas (`export function X`), com props tipadas em um `type XProps`.
- Arquivos: componentes em `PascalCase.tsx`, hooks em `useAlgo.ts` e demais arquivos em `camelCase.ts`.
- **[B]** `npm run lint`, `npm run typecheck` e `npm run format:check` sem erros.

## 8. Testes (Vitest + Testing Library)
- Testes ficam ao lado do código: `Componente.test.tsx`.
- Use `renderWithProviders` de `@/test/render` (os mesmos providers da aplicação).
- Consulte por papel e nome acessível (`getByRole('button', { name: 'Salvar' })`), não por classe ou test-id.
- Mock na fronteira: `<feature>Api` ou `fetch`, nunca hooks internos do React Query.
- Testes de código de servidor (`lib/bff`, `lib/auth`) usam `// @vitest-environment node`.
- **[B]** Cobertura ≥ 80% (linhas, funções, branches e statements). Ela é configurada no `vitest.config.mts`,
  e o comando falha abaixo disso.

## Comandos (dentro de `frontend/`)
- Verificação completa (o mesmo que o CI): `npm run check`
- Testes com cobertura: `npm run test:coverage`
- Duplicação: `npm run dup`
- Lint e tipos: `npm run lint && npm run typecheck`
