namespace Chamados.Application.Abstractions;

/// <summary>Tenant da requisição/execução atual. Resolvido na borda (API, consumidor de fila, job).</summary>
public interface ITenantContext
{
    Guid TenantId { get; }
}
