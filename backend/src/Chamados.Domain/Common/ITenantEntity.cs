namespace Chamados.Domain.Common;

/// <summary>
/// Entidade isolada por tenant. O TenantId é preenchido pela infraestrutura ao salvar
/// e nunca é alterado pelo domínio nem recebido da API.
/// </summary>
public interface ITenantEntity
{
    Guid TenantId { get; }
}
