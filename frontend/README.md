# Chamados – Frontend (Next.js 16 + BFF + Material UI)

## Pré-requisitos
- Node.js 22 (`.nvmrc`)
- API .NET rodando (veja `../backend/README.md`)

## Primeiros passos
```bash
npm install
cp .env.example .env.local     # preencha BACKEND_API_URL e SESSION_SECRET
npm run dev                    # http://localhost:3000
```

## Arquitetura
```
Navegador ──(cookie httpOnly)──▶ Next.js (BFF) ──(Bearer token)──▶ API .NET
             /api/bff/*            src/app/api/bff/[...path]          /api/*
```
- O navegador **nunca** recebe o token nem conhece a URL da API.
- A sessão é um JWE (A256GCM) em cookie httpOnly (`src/lib/auth/session.ts`).
- O BFF repassa só cabeçalhos permitidos, valida a origem em requisições que alteram dados (CSRF)
  e devolve os erros como ProblemDetails.
- **Pendente:** o login OIDC (`src/app/api/auth/login` e `callback`) está como stub. Integre o
  provedor de identidade do time (recomendado: `openid-client`, fluxo Authorization Code + PKCE)
  e, no callback, chame `createSession()` com o token e os dados do usuário (incluindo `tenantId`).

## Scripts
| Comando | O que faz |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento (Turbopack) |
| `npm run check` | Tipos + lint + duplicação + testes com cobertura (o mesmo que o CI) |
| `npm run test:coverage` | Testes com cobertura (falha abaixo de 80%) |
| `npm run dup` | Detecta código duplicado (jscpd) |
| `npm run lint` / `npm run format` | ESLint / Prettier |

## Componentes reutilizáveis
Ver a tabela em `.github/instructions/frontend.instructions.md`. O ESLint bloqueia o uso direto de
`TextField`, `Select`, `Dialog`, `Snackbar`, `Table` e `Link` do MUI dentro de `src/app` e `src/features`.

## Nova feature (passo a passo)
1. `src/features/<nome>/types.ts`: contratos da API.
2. `api/<nome>Api.ts`: chamadas com `apiClient`.
3. `api/queries.ts`: query keys + hooks (`useQuery` / `useAppMutation`).
4. `components/`: telas compostas com `DataTable`, `Form*`, `PageHeader`, `QueryState`...
5. `index.ts`: exporte só o que outras partes usam.
6. Rota em `src/app/(app)/<nome>/page.tsx` e item de menu em `src/config/navigation.tsx`.
