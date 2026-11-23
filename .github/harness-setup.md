---
status: CONCLUIDO
---
# Registro de setup do harness

Este arquivo indica se o harness já foi adaptado à aplicação. O **Orquestrador** só inicia uma entrega
quando `status: CONCLUIDO`. Quem o mantém é o agente **Setup** (ver seção "Reaproveitar o harness em outra
aplicação" no `README.md` da raiz). Se este arquivo não existir ou o status for outro, é o primeiro uso.

| Item | Valor |
|---|---|
| Aplicação | Sistema de Chamados |
| Identificador técnico (PascalCase / kebab-case) | `Chamados` / `chamados` |
| Domínio | Help desk (controle de chamados) |
| Multitenant | Sim — tenant = empresa cliente, `tenant_id` vem do claim do token |
| Backend | .NET 10, Clean Architecture, DDD, EF Core 10, PostgreSQL |
| Frontend | Next.js 16 (App Router) + BFF, TypeScript, Material UI, React Query |
| Autenticação | OIDC (provedor ainda não definido) |
| Idioma (negócio, interface, commits) | Português (termos técnicos consagrados em inglês) |
| Conformidade | LGPD |
| Backlog | `docs/user-stories/US-<id>.md` |
| Meta de cobertura | 80% (backend e frontend) |
| Convenção de commits | Conventional Commits 1.0.0, com `Refs: US-<id>` |
| Limite de ciclos de ajuste do Orquestrador | 3 |
