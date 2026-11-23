# Regras gerais do projeto

## Produto
Sistema de controle de chamados (help desk) **multitenant**: cada empresa cliente é um tenant, e os dados
de um tenant nunca podem ser vistos ou alterados por outro.

**Glossário.** Use estes termos no código, nas mensagens e na interface. Não use sinônimos como Ticket, Issue ou Request.

| Termo | Significado |
|---|---|
| Chamado | Solicitação de atendimento aberta por um usuário |
| Tenant | Empresa cliente; unidade de isolamento dos dados |
| Solicitante | Usuário que abriu o chamado |
| Responsável | Técnico atribuído ao chamado |
| Atribuir / Resolver / Reabrir / Fechar | Transições do ciclo de vida do chamado |
| SLA | Prazo de resposta/resolução acordado |

## Mapa do repositório
- `backend/`: API .NET 10 (Clean Architecture, DDD, EF Core 10 + PostgreSQL). Regras em `.github/instructions/backend.instructions.md`
- `frontend/`: Next.js 16 (App Router) + BFF + TypeScript + Material UI + React Query. Regras em `.github/instructions/frontend.instructions.md`
- `docs/user-stories/US-<id>.md`: User Stories (fonte de verdade para o agente BA)
- `.github/agents/`: agentes do fluxo de entrega

## Comandos
| Objetivo | Backend (raiz) | Frontend (`frontend/`) |
|---|---|---|
| Build / tipos | `dotnet build backend/Chamados.slnx` | `npm run typecheck` |
| Testes + cobertura | `dotnet test backend/Chamados.slnx --settings backend/coverlet.runsettings --collect "XPlat Code Coverage"` | `npm run test:coverage` |
| Verificação completa | build + testes acima | `npm run check` |

## Commits: Conventional Commits 1.0.0
Siga exatamente https://www.conventionalcommits.org/en/v1.0.0/.

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

- **Tipos:**
  - `feat` (nova funcionalidade → MINOR)
  - `fix` (correção → PATCH)
  - `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`, `revert`
- **Escopo** (substantivo, opcional):
  - por app: `backend`, `frontend`, `harness`
  - ou por área de negócio: `chamados`, `auth`, `tenancy`
- **Descrição:** em português, no imperativo, minúscula, sem ponto final, até ~72 caracteres.
  Ex.: `feat(chamados): permitir reabrir chamado resolvido`.
- **Quebra de compatibilidade** (contrato da API, schema, variável de ambiente) → MAJOR:
  use `!` antes dos dois-pontos (`feat(api)!: ...`) **e/ou** o rodapé `BREAKING CHANGE: <descrição>` (maiúsculo).
- **Corpo:** explica o **porquê** da mudança, não o "o quê".
- **Rodapés:** `Refs: US-123` para ligar à User Story. Os tokens usam hífen (`Reviewed-by: Nome`).
- **Um commit, uma mudança lógica.** Não misture `feat` com `refactor` não relacionado.
- Exemplo completo:
  ```
  fix(chamados): impedir atribuição de chamado fechado

  O endpoint aceitava a atribuição e o status voltava para EmAtendimento,
  quebrando o cálculo de SLA.

  Refs: US-123
  ```

## Regras gerais
- **Idioma:** termos de negócio em português (`Chamado`, `Atribuir`) e termos técnicos consagrados em inglês
  (`Handler`, `Command`, `Repository`). Textos da interface, mensagens de erro e commits em português.
- **Comentários:** só para explicar o porquê de uma decisão não óbvia. Não comente o que o código já diz.
- **Segurança e LGPD:**
  - nenhum segredo no código (use variáveis de ambiente);
  - nunca registre em log tokens, senhas ou dados pessoais (e-mail, CPF, telefone);
  - dados de teste são fictícios.
- **Mudanças pequenas e focadas:** implemente só o que a US pede e siga o padrão do código existente antes de introduzir um novo.
- **Dúvidas:** se a US for ambígua ou contraditória, pergunte. Não assuma regra de negócio.

## O que NÃO fazer sem aprovação explícita
- Adicionar ou atualizar dependências (`Directory.Packages.props`, `package.json`).
- Alterar pipelines de CI/CD, arquivos do harness (`.github/`) ou configurações de lint, analyzers e cobertura.
- Editar migrations já aplicadas (crie uma nova).
- Mudar contratos públicos da API (rotas, payloads, status) sem que a US peça.
- Desligar regras de lint/analyzer, usar `@ts-ignore` ou reduzir a meta de cobertura.

## Definição de pronto
- [ ] Critérios de aceite da US atendidos (validado pelo agente BA)
- [ ] Build, lint e checagem de tipos sem erros nem warnings
- [ ] Testes passando, com cobertura ≥ 80% em backend e frontend
- [ ] Sem duplicação (`npm run dup`) e sem violar as regras **[B]** dos arquivos de instruções
- [ ] Commits no padrão Conventional Commits com `Refs: US-<id>`
- [ ] README atualizado se algum comando, variável de ambiente ou passo de setup mudou

## Fluxo de entrega de feature
Toda feature segue o fluxo do agente **Orquestrador** (`.github/agents/orquestrador.agent.md`):
BA (prontidão) → Dev → Revisor → BA (validação) → (ajustes) → Testes.

O Orquestrador só inicia o fluxo com o harness adaptado à aplicação (`.github/harness-setup.md` com
`status: CONCLUIDO`). Para outra aplicação, veja "Reaproveitar o harness em outra aplicação" no `README.md`.
