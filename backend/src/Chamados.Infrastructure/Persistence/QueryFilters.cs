namespace Chamados.Infrastructure.Persistence;

/// <summary>
/// Nomes dos filtros globais (EF Core 10). Para desligar um filtro use
/// IgnoreQueryFilters([QueryFilters.SoftDelete]) — nunca IgnoreQueryFilters() sem argumentos
/// fora de código administrativo auditado.
/// </summary>
public static class QueryFilters
{
    public const string Tenant = "Tenant";
    public const string SoftDelete = "SoftDelete";
}
