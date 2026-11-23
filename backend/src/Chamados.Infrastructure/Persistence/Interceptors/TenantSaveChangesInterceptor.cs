using Chamados.Application.Abstractions;
using Chamados.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Chamados.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Protege o caminho de escrita: preenche o TenantId de entidades novas e
/// impede alterar ou excluir entidades de outro tenant.
/// </summary>
public sealed class TenantSaveChangesInterceptor(ITenantContext tenantContext) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        AplicarTenant(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        AplicarTenant(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void AplicarTenant(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var entradas = context.ChangeTracker.Entries<ITenantEntity>().ToList();
        if (entradas.Count == 0)
        {
            return;
        }

        var tenantId = tenantContext.TenantId;
        if (tenantId == Guid.Empty)
        {
            throw new InvalidOperationException("Não é possível salvar dados sem um tenant definido.");
        }

        foreach (var entrada in entradas)
        {
            switch (entrada.State)
            {
                case EntityState.Added:
                    entrada.Property(nameof(ITenantEntity.TenantId)).CurrentValue = tenantId;
                    break;

                case EntityState.Modified or EntityState.Deleted when entrada.Entity.TenantId != tenantId:
                    throw new InvalidOperationException(
                        $"Tentativa de alterar {entrada.Metadata.ClrType.Name} de outro tenant.");
            }
        }
    }
}
