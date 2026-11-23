using Chamados.Domain.Chamados;
using Chamados.Domain.Usuarios;

namespace Chamados.Application.Tests.Infrastructure;

public sealed class TenantInterceptorTests
{
    private readonly string _banco = Guid.NewGuid().ToString();

    [Fact]
    public async Task Salvar_sem_tenant_lanca_excecao()
    {
        await using var db = Contextos.Criar(_banco, Guid.Empty);
        db.Chamados.Add(Chamado.Abrir("T", "D", Prioridade.Baixa, UsuarioId.Novo(), DateTimeOffset.UtcNow).Value);

        await Should.ThrowAsync<InvalidOperationException>(
            () => db.SaveChangesAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Alterar_entidade_de_outro_tenant_lanca_excecao()
    {
        var tenantA = Guid.NewGuid();
        Chamado chamado;
        await using (var dbA = Contextos.Criar(_banco, tenantA))
        {
            chamado = Chamado.Abrir("T", "D", Prioridade.Baixa, UsuarioId.Novo(), DateTimeOffset.UtcNow).Value;
            dbA.Chamados.Add(chamado);
            await dbA.SaveChangesAsync(TestContext.Current.CancellationToken);
        }

        // Simula um bug: entidade do tenant A anexada no contexto do tenant B.
        await using var dbB = Contextos.Criar(_banco, Guid.NewGuid());
        dbB.Chamados.Update(chamado);

        await Should.ThrowAsync<InvalidOperationException>(
            () => dbB.SaveChangesAsync(TestContext.Current.CancellationToken));
    }
}
