using Chamados.Application.Abstractions;
using Chamados.Domain.Usuarios;
using Chamados.Infrastructure.Persistence;
using Chamados.Infrastructure.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Chamados.Application.Tests;

internal sealed class TenantFixo(Guid tenantId) : ITenantContext
{
    public Guid TenantId { get; } = tenantId;
}

internal sealed class RelogioFixo(DateTimeOffset agora) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => agora;
}

internal static class Contextos
{
    /// <summary>Cria um AppDbContext em memória para um tenant. Mesmo nome de banco = mesmos dados.</summary>
    public static AppDbContext Criar(string nomeBanco, Guid tenantId)
    {
        var tenant = new TenantFixo(tenantId);
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(nomeBanco)
            .AddInterceptors(new TenantSaveChangesInterceptor(tenant))
            .Options;

        return new AppDbContext(options, tenant);
    }

    public static IUsuarioAtual Usuario(UsuarioId id)
    {
        var usuario = Substitute.For<IUsuarioAtual>();
        usuario.Id.Returns(id);
        return usuario;
    }
}
