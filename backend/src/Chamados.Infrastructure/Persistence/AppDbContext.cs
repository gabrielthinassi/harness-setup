using System.Linq.Expressions;
using Chamados.Application.Abstractions;
using Chamados.Domain.Chamados;
using Chamados.Domain.Common;
using Chamados.Domain.Usuarios;
using Chamados.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;

namespace Chamados.Infrastructure.Persistence;

/// <remarks>
/// Não use AddDbContextPool: o filtro de tenant lê <see cref="TenantIdAtual"/> da instância,
/// e contextos reaproveitados entre requisições carregariam o tenant errado.
/// </remarks>
public sealed class AppDbContext(DbContextOptions<AppDbContext> options, ITenantContext tenantContext)
    : DbContext(options), IAppDbContext
{
    public DbSet<Chamado> Chamados => Set<Chamado>();

    /// <summary>Lido pelo EF a cada consulta (o filtro é parametrizado pela instância do contexto).</summary>
    public Guid TenantIdAtual => tenantContext.TenantId;

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<ChamadoId>().HaveConversion<ChamadoIdConverter>();
        configurationBuilder.Properties<UsuarioId>().HaveConversion<UsuarioIdConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        AplicarFiltrosGlobais(modelBuilder);
    }

    /// <summary>
    /// Toda entidade ITenantEntity recebe o filtro de tenant; toda ISoftDeletable recebe o de exclusão lógica.
    /// Assim ninguém precisa lembrar de filtrar por tenant em cada consulta.
    /// </summary>
    private void AplicarFiltrosGlobais(ModelBuilder modelBuilder)
    {
        var entidades = modelBuilder.Model.GetEntityTypes()
            .Where(e => !e.IsOwned() && e.BaseType is null)
            .ToList();

        foreach (var entidade in entidades)
        {
            var tipo = entidade.ClrType;

            if (typeof(ITenantEntity).IsAssignableFrom(tipo))
            {
                modelBuilder.Entity(tipo).HasQueryFilter(QueryFilters.Tenant, CriarFiltroTenant(tipo));
            }

            if (typeof(ISoftDeletable).IsAssignableFrom(tipo))
            {
                modelBuilder.Entity(tipo).HasQueryFilter(QueryFilters.SoftDelete, CriarFiltroSoftDelete(tipo));
            }
        }
    }

    // e => e.TenantId == this.TenantIdAtual
    private LambdaExpression CriarFiltroTenant(Type tipo)
    {
        var parametro = Expression.Parameter(tipo, "e");
        var corpo = Expression.Equal(
            Expression.Property(parametro, nameof(ITenantEntity.TenantId)),
            Expression.Property(Expression.Constant(this), nameof(TenantIdAtual)));
        return Expression.Lambda(corpo, parametro);
    }

    // e => !e.Excluido
    private static LambdaExpression CriarFiltroSoftDelete(Type tipo)
    {
        var parametro = Expression.Parameter(tipo, "e");
        var corpo = Expression.Not(Expression.Property(parametro, nameof(ISoftDeletable.Excluido)));
        return Expression.Lambda(corpo, parametro);
    }
}
