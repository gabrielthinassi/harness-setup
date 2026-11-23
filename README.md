# Sistema de Chamados

| Pasta | Conteúdo |
|---|---|
| `backend/` | API .NET 10 — Clean Architecture, DDD, EF Core 10, multitenant ([README](backend/README.md)) |
| `frontend/` | Next.js 16 + BFF + TypeScript + Material UI ([README](frontend/README.md)) |
| `.github/` | Harness dos agentes (Setup no primeiro uso; depois Orquestrador → BA → Dev → Revisor → BA → Testes) e convenções |
| `docs/user-stories/` | User Stories usadas pelo agente BA (prontidão antes do Dev e validação depois) |

Para entregar uma feature: no Chat do VS Code, selecione o agente **Orquestrador** e informe o ID da US (ex.: `US-123`).

---

# Reaproveitar o harness em outra aplicação

O harness (agentes, regras e convenções em `.github/`) foi desenhado para ser compartilhado. O que muda de uma
aplicação para outra é o **domínio**, a **stack**, a **infraestrutura** e os **nomes**. O que se mantém é o
**processo** (fluxo, papéis, gates de qualidade). Esta seção é a fonte de verdade para essa adaptação e é a
que o agente **Setup** executa.

> **Regra de ouro:** nenhuma regra de negócio, nome de domínio, provedor, banco ou política de conformidade é
> assumida. Tudo vem de respostas do usuário. O que não for respondido fica **PENDENTE** e o setup não conclui.

## 1. O que é do harness e o que é da aplicação

| Camada | Arquivos | Tratamento |
|---|---|---|
| **Processo (reaproveitar sem mudar)** | `.github/agents/{orquestrador,ba,dev,revisor,testes,setup}.agent.md`, mecanismo de regras **[B]**, Definição de pronto, convenção de commits (tipos/formato) | Copie como está. Só altere por decisão explícita de processo (ver seção 5) |
| **Políticas (confirmar com o usuário)** | meta de cobertura, limite de 3 ciclos, idioma, escopos de commit, LGPD, lista "O que NÃO fazer" | Copie, mas o Setup pergunta se mantém ou muda |
| **Domínio (sempre reescrever)** | `.github/copilot-instructions.md` (Produto, Glossário, escopos de commit de negócio), `docs/user-stories/*`, exemplos nas instruções | Reescreva a partir das respostas |
| **Stack e infra (adaptar conforme resposta)** | `.github/instructions/backend.instructions.md`, `frontend.instructions.md`, `backend/`, `frontend/`, `.vscode/` | Adapte ou reescreva. Ver seção 4 |
| **Registro** | `.github/harness-setup.md` | **Nunca copie**: ele é criado/atualizado pelo Setup |

## 2. Primeiro uso (como funciona)

1. Crie o repositório da nova aplicação e copie o harness (seção 3, passo 1).
2. No Chat do VS Code, selecione o agente **Setup**. Se você selecionar o **Orquestrador** antes, ele
   detecta que `.github/harness-setup.md` não existe (ou não está `CONCLUIDO`), **para** e oferece o
   botão de handoff para o Setup. O fluxo de US só roda depois do setup concluído.
3. O Setup faz o diagnóstico do repositório, **entrevista** você (tabela da seção 6), apresenta um **plano**
   `arquivo → mudança`, espera sua **aprovação**, aplica, **verifica** (seção 7) e grava o registro.
4. Se algum item obrigatório ficar sem resposta, o registro fica `PENDENTE` e o Orquestrador continua bloqueado.
5. Para refazer ou revisar o setup depois, apague `.github/harness-setup.md` (ou mude o `status`) e rode o Setup de novo.

## 3. Passo a passo rigoroso (manual ou executado pelo Setup)

Execute **na ordem**. Não pule etapas e não misture a adaptação com a implementação de features.

1. **Copiar o harness.** Copie para o novo repositório: `.github/` (**exceto** `harness-setup.md`), `.vscode/`,
   `docs/user-stories/US-000-exemplo.md` e este `README.md`. Copie `backend/` e `frontend/` somente se a stack for a
   mesma (seção 4); caso contrário, copie só o que for reaproveitável e reescreva as instruções.
2. **Branch dedicada** (`chore/harness-setup`). Nada de feature junto.
3. **Entrevista** (seção 6). Registre as respostas antes de editar qualquer arquivo.
4. **Renomear pastas, projetos e namespaces primeiro** (use `git mv`), depois o conteúdo:
   - `backend/Chamados.slnx` e projetos `Chamados.Domain|Application|Infrastructure|Api` + `tests/Chamados.*`
     (pasta, `.csproj`, `<Project Path>` no `.slnx`, `ProjectReference`, `RootNamespace`, `InternalsVisibleTo`);
   - namespaces, `using`s e constantes de namespace em `tests/*ArchitectureTests` (`CamadasTests.cs`, `ConvencoesTests.cs`);
   - pastas de agregado/feature: `Domain/Chamados`, `Application/Chamados`, `Api/Endpoints/Chamados*`,
     `frontend/src/features/chamados`, `frontend/src/app/(app)/chamados`;
   - filtros de nome em `backend/coverlet.runsettings`, se houver.
5. **Reescrever o domínio** em `.github/copilot-instructions.md`: Produto, Glossário (com os sinônimos proibidos),
   escopos de commit de negócio, jurisdição de conformidade (LGPD, GDPR etc.) e Definição de pronto.
6. **Adaptar as instruções de stack** (`backend.instructions.md`, `frontend.instructions.md`): troque títulos,
   exemplos (`Chamado`, `Atribuir`, `ChamadoErros`, `ChamadoAberto`, `chamadosKeys`), nomes de solução/projetos e
   comandos. Mantenha a marcação **[B]** em toda regra que o Revisor deve tratar como bloqueante.
7. **Atualizar comandos** na tabela "Comandos" de `.github/copilot-instructions.md` e nas seções "Comandos" das instruções.
   O agente **Testes** lê essa tabela; ela é a única fonte dos comandos de build/teste (não repita em outros agentes).
8. **Configurações de aplicação e infra** (valores fictícios; segredos só por variável de ambiente):
   - `backend/src/*.Api/appsettings*.json`: nome da connection string, banco, `ValidIssuer`, `ValidAudiences`;
   - `frontend/.env.example` (`BACKEND_API_URL`, `SESSION_SECRET`, `OIDC_*`, `APP_URL`) e `src/lib/env.ts`;
   - `frontend/package.json` (`name`), `src/app/layout.tsx` (título e descrição), `src/config/navigation.tsx` (menu),
     `src/theme/theme.ts` (identidade visual, se informada);
   - READMEs de `backend/` e `frontend/` (título, comandos, nome do container/banco local, variáveis);
   - pipelines de CI/CD e IaC, **somente** se o usuário aprovou no plano.
9. **Código de referência.** O agregado `Chamado` (backend e frontend) é só exemplo de padrão. Conforme a resposta:
   **substituir** pelo primeiro agregado real da nova aplicação, **manter** temporariamente como referência (e remover
   na primeira US), ou **remover**. Nunca deixe termos do domínio antigo no código final.
10. **User Stories.** Remova US de outro domínio; mantenha `US-000-exemplo.md` como modelo. Ajuste o prefixo/ID se o
    backlog usar outro (ex.: Jira), e então atualize `ba.agent.md`, `orquestrador.agent.md` e os textos que citam
    `docs/user-stories/`.
11. **README da raiz.** Troque o título e a tabela de pastas; mantenha esta seção.
12. **Agentes.** Revise `orquestrador|ba|dev|revisor|testes.agent.md` só para trocar referências específicas
    (nomes de pasta, comandos). Não altere papéis, formatos de retorno (`APROVADO`/`REPROVADO`/`PRONTO`/`LACUNAS`/
    `COBERTURA_OK`) nem a ordem do fluxo.
13. **Verificar** (seção 7) e **registrar**: reescreva `.github/harness-setup.md` com as respostas e `status: CONCLUIDO`.
14. **Commitar** (Conventional Commits): `chore(harness): adaptar harness para <aplicação>`.

## 4. Decisões que invalidam regras (tratar antes de editar)

Se a resposta da entrevista cair em um destes casos, **não basta trocar nomes**: as regras e os testes de
arquitetura precisam ser reescritos, com aprovação explícita do usuário.

| Decisão | O que reescrever |
|---|---|
| Banco **não relacional** (ex.: MongoDB) ou outro provider | `backend.instructions.md` §3 (agregados), §5 (filtros de tenant via EF), §6 inteira (EF Core, migrations, `AsNoTracking`), §9 (testes com EF InMemory/Testcontainers), `Directory.Packages.props`, `Infrastructure`. O nome desta pasta cita Mongo, mas as regras atuais são PostgreSQL + EF Core: confirme o banco na entrevista |
| Banco relacional diferente de PostgreSQL | Pacote do provider, connection string, Testcontainers, comandos `dotnet ef`, container local |
| **Não multitenant** | Remova `backend.instructions.md` §5, `ITenantEntity`/`ITenantContext`, filtros e interceptors de tenant, teste de isolamento ([B] da §9), o claim `tenant_id`, `tenantId` na sessão do BFF, o termo Tenant do glossário e "tenancy" dos escopos de commit |
| Multitenant com outro modelo (banco/schema por tenant) | Reescreva a §5 e a seção de recursos fora do banco (cache, arquivos, mensageria) |
| Só backend ou só frontend | Remova a instrução, a coluna da tabela "Comandos", os itens da Definição de pronto e os trechos do Dev/Testes/Revisor que citam o app removido |
| Outra linguagem/framework | Reescreva a instrução da camada inteira e os comandos; preserve a estrutura de seções e as marcações **[B]** |
| Meta de cobertura diferente de 80% | `vitest.config.mts` (thresholds), `coverlet.runsettings`, instruções, Definição de pronto e `testes.agent.md` (aprovação explícita) |
| Outro idioma | Glossário, mensagens, commits, UI e a regra "Idioma" |

## 5. Regras da adaptação (proibido)

- Assumir regra de negócio, glossário, banco, IdP ou conformidade sem resposta do usuário.
- Concluir o setup com itens obrigatórios PENDENTES ou com a verificação falhando.
- Adicionar/atualizar dependências, alterar CI/CD, lint, analyzers ou cobertura sem aprovação explícita no plano.
- Remover ou enfraquecer regras **[B]**, desligar lint/analyzer, usar `@ts-ignore`, reduzir cobertura para "fazer passar".
- Editar migrations já aplicadas; versionar segredos, senhas ou dados reais (testes usam dados fictícios).
- Alterar a ordem do fluxo **BA → Dev → Revisor → BA → Testes** ou os formatos de retorno dos agentes.
- Misturar o setup com a implementação de uma US (o setup termina antes de qualquer feature).
- Copiar `.github/harness-setup.md` de outra aplicação (ele marcaria o setup como feito indevidamente).

## 6. Informações levantadas no setup

O Setup pergunta nesta ordem. **Obrigatório** = sem resposta, o setup não conclui.

| # | Tema | Perguntas | Obrig. |
|---|---|---|---|
| 1 | Identidade | Nome da aplicação; identificador técnico em PascalCase (namespaces) e kebab-case (pacotes/containers); descrição do produto em 1–2 frases | Sim |
| 2 | Domínio | Perfis de usuário; entidade/agregado principal e seu ciclo de vida (estados e transições); **glossário** (termo, significado, sinônimos proibidos) | Sim |
| 3 | Multitenancy | É multitenant? Qual é o tenant (termo e significado)? De onde vem o tenant (claim, host)? Modelo de isolamento (coluna, schema, banco)? | Sim |
| 4 | Backend | Existe backend? Linguagem/framework e versão; banco e provider (PostgreSQL, SQL Server, MongoDB...); cache, fila, storage, e-mail | Sim |
| 5 | Frontend | Existe frontend? Framework e versão; biblioteca de UI; BFF sim/não; identidade visual (cores, logo), se houver | Sim |
| 6 | Autenticação | Provedor OIDC (Keycloak, Entra ID, Auth0...); fluxo; claims de usuário/tenant; perfis/permissões | Sim |
| 7 | Infra e operação | Ambientes; hospedagem; Docker/compose local; CI/CD (GitHub Actions, Azure DevOps...); IaC; observabilidade; origem dos segredos | Não |
| 8 | Qualidade | Meta de cobertura (padrão 80%); ferramentas de teste; lint/formatador; limite de duplicação; SonarQube/SonarCloud | Sim |
| 9 | Conformidade | LGPD, GDPR ou outra; quais dados pessoais/sensíveis existem; regras de log e retenção | Sim |
| 10 | Processo | Onde ficam as US (`docs/user-stories` ou Jira etc.) e o prefixo do ID; idioma de código/UI/commits; escopos de commit por área de negócio; limite de ciclos do Orquestrador (padrão 3) | Sim |
| 11 | Código de referência | Substituir, manter temporariamente ou remover o agregado de exemplo? Existe código legado a aproveitar? | Sim |
| 12 | Aprovações | Pode adicionar/atualizar dependências? Pode alterar CI/CD, lint e cobertura? Pode apagar pastas? (cada uma é uma aprovação separada) | Sim |

## 7. Verificação obrigatória (gate do setup)

1. **Varredura de termos antigos.** Não pode restar nada do template fora do `README.md` (que cita os termos como exemplo):
   ```powershell
   git grep -n -i -I --untracked -E "chamado|help ?desk|solicitante|respons[aá]vel|\bSLA\b|postgres|chamados-(db|api|frontend)" -- . ":!README.md"
   git ls-files --cached --others --exclude-standard | Select-String -Pattern "chamado" 
   ```
   Cada ocorrência é corrigida ou justificada no resumo do Setup (ex.: PostgreSQL continua sendo o banco).
2. **Build e testes** com os comandos da tabela "Comandos" de `.github/copilot-instructions.md`
   (backend: build + testes com cobertura; frontend: `npm run check`). Devem passar sem warnings e com a meta de cobertura.
3. **Testes de arquitetura** (`*.ArchitectureTests`) passando com os novos namespaces.
4. **Coerência do harness:** os nomes de pastas/projetos/comandos citados em `.github/**` e nos READMEs existem de fato.
5. **Dry-run do fluxo:** selecione o **Orquestrador** com `US-000-exemplo` e confirme que ele passa do gate de setup
   e aciona o **BA (prontidão)**; a US de exemplo deve retornar `LACUNAS` (é um modelo vazio). Pare aí.
6. **Registro:** `.github/harness-setup.md` com todas as respostas e `status: CONCLUIDO`.

## 8. Manter o harness compartilhado

- Mudanças de **processo** (agentes, fluxo, regras **[B]** genéricas) são feitas na origem do harness e propagadas
  às aplicações; mudanças de **domínio/stack** ficam só na aplicação.
- Ao incorporar uma atualização do harness numa aplicação, compare `.github/agents/` e preserve os trechos de
  domínio, stack e o `harness-setup.md` da aplicação.
- Toda alteração no harness é um commit `chore(harness)`/`docs(harness)` separado, sem código de feature.
