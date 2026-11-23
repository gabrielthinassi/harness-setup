using Chamados.Application.Abstractions;

namespace Chamados.Api.Common;

/// <summary>
/// Lê o tenant da claim do token. Nunca de header ou query string enviados pelo cliente.
/// </summary>
public sealed class HttpTenantContext(IHttpContextAccessor accessor) : ITenantContext
{
    public const string ClaimTenant = "tenant_id";

    public Guid TenantId =>
        Guid.TryParse(accessor.HttpContext?.User.FindFirst(ClaimTenant)?.Value, out var tenantId)
            ? tenantId
            : throw new UnauthorizedAccessException("Requisição sem tenant identificado.");
}
