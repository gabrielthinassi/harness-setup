using Chamados.Application.Chamados.AbrirChamado;
using Chamados.Domain.Chamados;
using Chamados.Domain.Common;
using Chamados.Domain.Usuarios;
using Chamados.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Chamados.Application.Tests.Chamados;

public sealed class AbrirChamadoHandlerTests
{
    private static readonly DateTimeOffset Agora = new(2026, 11, 23, 10, 0, 0, TimeSpan.Zero);

    private readonly string _banco = Guid.NewGuid().ToString();
    private readonly Guid _tenant = Guid.NewGuid();
    private readonly UsuarioId _usuario = UsuarioId.Novo();

    private AbrirChamadoHandler CriarHandler(AppDbContext db) =>
        new(db, Contextos.Usuario(_usuario), new AbrirChamadoValidator(), new RelogioFixo(Agora));

    [Fact]
    public async Task Abre_chamado_no_tenant_atual()
    {
        await using var db = Contextos.Criar(_banco, _tenant);
        var handler = CriarHandler(db);

        var resultado = await handler.Handle(
            new AbrirChamadoCommand("VPN caiu", "Sem conexão desde as 9h", Prioridade.Alta),
            TestContext.Current.CancellationToken);

        resultado.IsSuccess.ShouldBeTrue();
        var salvo = await db.Chamados.SingleAsync(TestContext.Current.CancellationToken);
        salvo.Id.Value.ShouldBe(resultado.Value);
        salvo.TenantId.ShouldBe(_tenant);
        salvo.SolicitanteId.ShouldBe(_usuario);
        salvo.CriadoEm.ShouldBe(Agora);
    }

    [Fact]
    public async Task Dados_invalidos_retornam_erro_de_validacao_sem_salvar()
    {
        await using var db = Contextos.Criar(_banco, _tenant);
        var handler = CriarHandler(db);

        var resultado = await handler.Handle(
            new AbrirChamadoCommand("", "", (Prioridade)99),
            TestContext.Current.CancellationToken);

        resultado.IsFailure.ShouldBeTrue();
        resultado.Error!.Tipo.ShouldBe(TipoErro.Validacao);
        resultado.Error.Detalhes!.Keys.ShouldBe(
            new[] { nameof(AbrirChamadoCommand.Titulo), nameof(AbrirChamadoCommand.Descricao), nameof(AbrirChamadoCommand.Prioridade) },
            ignoreOrder: true);
        (await db.Chamados.CountAsync(TestContext.Current.CancellationToken)).ShouldBe(0);
    }
}
