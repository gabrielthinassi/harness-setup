---
applyTo: "backend/**"
---
# Regras do Backend (.NET 10 · Clean Architecture · DDD · EF Core 10 · Multitenant)

Itens marcados com **[B]** são BLOQUEANTES na revisão de código.

## 1. Camadas e dependências
- **[B]** `Api → Application → Domain` e `Infrastructure → Application`. Nada mais.
- **[B]** `Chamados.Domain` não referencia pacotes nem outros projetos (nem EF Core, nem ASP.NET).
- **[B]** `Chamados.Application` não referencia `Infrastructure`, `Api`, `Microsoft.AspNetCore.*` nem providers (Npgsql).
  Pode usar `Microsoft.EntityFrameworkCore` só pela API de `DbSet`/LINQ via `IAppDbContext`.
- Interfaces de serviços externos (e-mail, storage, fila) são declaradas em `Application/Abstractions`
  e implementadas em `Infrastructure`.
- Os testes em `Chamados.ArchitectureTests` precisam continuar passando.

## 2. Organização por feature
- Cada caso de uso fica em `Application/<Agregado>/<CasoDeUso>/<CasoDeUso>.cs` contendo
  Command/Query, Validator, Handler e Response.
- **Nomes:** commands no imperativo (`AbrirChamadoCommand`), queries com `Obter`/`Listar`
  (`ListarChamadosQuery`), eventos no passado (`ChamadoAberto`), handlers `<CasoDeUso>Handler`.
- **[B]** Handlers e validators são `internal sealed`. Commands, queries e responses são `public sealed record`.
- **[B]** Não usar MediatR nem AutoMapper. Handlers são injetados direto (`ICommandHandler<,>`,
  `IQueryHandler<,>`) e o mapeamento é manual.

## 3. Domínio (DDD tático)
- **[B]** Entidades sem setters públicos. Estado muda só por métodos com nome de negócio
  (`chamado.Atribuir(...)`), que validam invariantes e retornam `Result`.
- Criação por método de fábrica estático (`Chamado.Abrir(...)`) retornando `Result<T>`.
- IDs fortemente tipados (`readonly record struct XxxId(Guid Value)`) gerados com `Guid.CreateVersion7()`.
- Eventos de domínio: `sealed record` implementando `IDomainEvent`, emitidos com `Raise(...)`.
- **[B]** Uma transação altera um único agregado. Entre agregados, use eventos.
- Data e hora entram como parâmetro (`DateTimeOffset agora`); no handler use `TimeProvider`.
  **[B]** Nunca `DateTime.Now`/`DateTime.UtcNow` no domínio ou nos handlers.
- Cadastros simples (sem regra de negócio) podem ser entidades anêmicas com CRUD direto.

## 4. Erros e validação
- Erros de negócio esperados retornam `Result`/`Error` (`ChamadoErros.NaoEncontrado`). Exceções ficam
  para situações excepcionais.
- Todo command tem um `AbstractValidator<T>` (FluentValidation), chamado no início do handler com
  `validator.ValidarAsync(command, ct)`.
- Os erros de cada agregado ficam centralizados em `<Agregado>Erros` com código `Agregado.Motivo`.
- A Api traduz o `Error` com `ToProblem()`: Validacao→400, NaoEncontrado→404, Conflito→409, Proibido→403.

## 5. Multitenancy
- **[B]** Toda raiz de agregado de dados de cliente implementa `ITenantEntity`.
- **[B]** `TenantId` nunca vem de DTO, rota, query string ou header. Ele vem só de `ITenantContext`
  (claim `tenant_id` do token).
- **[B]** Nunca chamar `IgnoreQueryFilters()` sem argumentos. Para desligar só o soft delete use
  `IgnoreQueryFilters([QueryFilters.SoftDelete])`. Acesso entre tenants só em endpoints administrativos
  explícitos e auditados.
- **[B]** Proibido SQL bruto (`FromSql`, `ExecuteSql`, Dapper) sem filtro explícito de `TenantId`.
- **[B]** Não usar `AddDbContextPool`.
- Índices compostos começam por `TenantId`, e restrições únicas incluem `TenantId`.
- Recursos fora do banco também são separados por tenant: chave de cache `t:{tenantId}:...`, caminho de
  arquivo `{tenantId}/...`, e `TenantId` no payload de mensagens e jobs.
- Acessar recurso de outro tenant retorna **404** (não 403).

## 6. EF Core
- **[B]** Não criar repositório genérico. O `IAppDbContext` é a unidade de trabalho.
- **Escrita:** carregar o agregado, chamar o método de negócio e `SaveChangesAsync(ct)`.
- **Leitura:** `AsNoTracking()` + projeção só das colunas necessárias. Nunca devolver entidade na API.
- O mapeamento fica em `Infrastructure/Persistence/Configurations/<Entidade>Configuration.cs`
  (`IEntityTypeConfiguration<T>`). Nada de atributos de dados no domínio.
- Enums são gravados como string (`HasConversion<string>()`). IDs tipados usam os conversores em `ConfigureConventions`.
- Migrations são geradas com `dotnet ef migrations add <Nome>` em `Persistence/Migrations` e aplicadas
  pelo pipeline. **[B]** Nunca aplicar migrations no `Program.cs`.

## 7. API
- Minimal APIs agrupadas por recurso (`Endpoints/<Recurso>Endpoints.cs`, `MapGroup`).
- Endpoints finos: recebem, chamam o handler e traduzem o `Result`. **[B]** Sem regra de negócio no endpoint.
- **[B]** `RequireAuthorization()` em todo grupo, salvo exceção documentada.
- Rotas no plural e em minúsculas (`/api/chamados/{id}/atribuicao`). POST de criação → `201` com `{ id }`.
- Erros sempre em `ProblemDetails`. Enums serializados como string.

## 8. Código
- **[B]** Build sem warnings (`TreatWarningsAsErrors`). Não silencie analyzers sem justificativa no PR.
- **[B]** `CancellationToken` repassado em toda chamada assíncrona.
- Nullable habilitado, namespaces file-scoped, campos privados `_camelCase`, primary constructors para DI.
- Termos de negócio em português (`Chamado`, `Atribuir`). Termos técnicos consagrados em inglês
  (`Handler`, `Command`, `Repository`).
- Versões de pacotes só em `Directory.Packages.props`. **[B]** Nenhum pacote novo com licença comercial sem aprovação.

## 9. Testes
- **Ferramentas:** xUnit v3, Shouldly e NSubstitute. FluentAssertions não deve ser usado (licença comercial).
- **Nome do teste:** `Metodo_cenario_resultado_esperado` em português
  (ex.: `Atribuir_chamado_resolvido_falha`).
- **Domínio:** testes unitários puros, cobrindo cada transição válida e inválida.
- **Handlers:** `Contextos.Criar(banco, tenant)` (EF InMemory com os filtros reais) e `RelogioFixo`.
- **[B]** Todo endpoint novo tem pelo menos um teste de isolamento de tenant em `Chamados.IntegrationTests`.
- **Cobertura:** `dotnet test --settings coverlet.runsettings --collect "XPlat Code Coverage"`, com meta **≥ 80%**.

## Comandos
- Build: `dotnet build backend/Chamados.slnx`
- Testes com cobertura: `dotnet test backend/Chamados.slnx --settings backend/coverlet.runsettings --collect "XPlat Code Coverage"`
- Testes sem Docker (rápidos): `dotnet test backend/Chamados.slnx --filter "FullyQualifiedName!~IntegrationTests"`
