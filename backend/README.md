# Chamados – Backend (.NET 10)

API multitenant do sistema de chamados. Clean Architecture + DDD tático + EF Core 10 (PostgreSQL).

## Pré-requisitos
- .NET SDK 10
- Docker (PostgreSQL local e testes de integração)

## Primeiros passos
```bash
dotnet restore
dotnet build                     # warnings quebram o build (TreatWarningsAsErrors)

# banco local
docker run -d --name chamados-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:17-alpine

# primeira migration (o esqueleto ainda não tem nenhuma)
dotnet tool install --global dotnet-ef
dotnet ef migrations add Inicial -p src/Chamados.Infrastructure -s src/Chamados.Api -o Persistence/Migrations
dotnet ef database update -p src/Chamados.Infrastructure -s src/Chamados.Api

dotnet run --project src/Chamados.Api   # documentação em /scalar (Development)
```

> `dotnet ef` instancia o AppDbContext em design time. Se reclamar do `ITenantContext`,
> crie um `IDesignTimeDbContextFactory<AppDbContext>` na Infrastructure com um tenant fixo.

## Testes e cobertura
```bash
dotnet test --settings coverlet.runsettings --collect "XPlat Code Coverage"

# relatório local (opcional)
dotnet tool install --global dotnet-reportgenerator-globaltool
reportgenerator -reports:"tests/**/coverage.cobertura.xml" -targetdir:coverage -reporttypes:"Html;TextSummary"
cat coverage/Summary.txt
```
O quality gate exige **≥ 80%**. Migrations e `Program.cs` ficam fora da medição (`coverlet.runsettings`).
O formato `opencover` é gerado para o SonarQube/SonarCloud.

| Projeto | O que cobre |
|---|---|
| `Chamados.Domain.Tests` | Regras do agregado (unitário puro) |
| `Chamados.Application.Tests` | Handlers com o AppDbContext real em memória (filtros e interceptor incluídos) |
| `Chamados.ArchitectureTests` | Regra de dependência entre camadas e convenções |
| `Chamados.IntegrationTests` | API ponta a ponta com PostgreSQL real (Testcontainers) — isolamento entre tenants |

## Estrutura
```
src/
  Chamados.Domain          entidades, value objects, eventos, Result/Error — sem dependências
  Chamados.Application     casos de uso por feature (Command/Query + Handler + Validator)
  Chamados.Infrastructure  EF Core, filtros de tenant, interceptors
  Chamados.Api             Minimal APIs, autenticação, ProblemDetails, composição
```
As convenções completas estão em `.github/instructions/backend.instructions.md`.
