using Chamados.Application.Chamados.AtribuirChamado;
using Chamados.Domain.Chamados;
using Chamados.Domain.Usuarios;
using Chamados.Infrastructure.Persistence;

namespace Chamados.Application.Tests.Chamados;

public sealed class AtribuirChamadoHandlerTests
{
    private static readonly DateTimeOffset Agora = new(2026, 11, 23, 10, 0, 0, TimeSpan.Zero);

    private readonly string _banco = Guid.NewGuid().ToString();
    private readonly Guid _tenant = Guid.NewGuid();

    private static AtribuirChamadoHandler CriarHandler(AppDbContext db) =>
        new(db, new AtribuirChamadoValidator(), new RelogioFixo(Agora));

    private async Task<ChamadoId> CriarChamadoAsync(Guid tenant)
    {
        await using var db = Contextos.Criar(_banco, tenant);
        var chamado = Chamado.Abrir("Monitor piscando", "Desde ontem", Prioridade.Baixa, UsuarioId.Novo(), Agora).Value;
        db.Chamados.Add(chamado);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        return chamado.Id;
    }

    [Fact]
    public async Task Atribui_responsavel_ao_chamado()
    {
        var id = await CriarChamadoAsync(_tenant);
        var tecnico = Guid.NewGuid();

        await using (var db = Contextos.Criar(_banco, _tenant))
        {
            var resultado = await CriarHandler(db).Handle(
                new AtribuirChamadoCommand(id.Value, tecnico),
                TestContext.Current.CancellationToken);

            resultado.IsSuccess.ShouldBeTrue();
        }

        await using var leitura = Contextos.Criar(_banco, _tenant);
        var chamado = leitura.Chamados.Single(c => c.Id == id);
        chamado.ResponsavelId.ShouldBe(new UsuarioId(tecnico));
        chamado.Status.ShouldBe(StatusChamado.EmAtendimento);
    }

    [Fact]
    public async Task Chamado_de_outro_tenant_retorna_nao_encontrado()
    {
        var idDeOutroTenant = await CriarChamadoAsync(Guid.NewGuid());

        await using var db = Contextos.Criar(_banco, _tenant);
        var resultado = await CriarHandler(db).Handle(
            new AtribuirChamadoCommand(idDeOutroTenant.Value, Guid.NewGuid()),
            TestContext.Current.CancellationToken);

        resultado.Error.ShouldBe(ChamadoErros.NaoEncontrado);
    }

    [Fact]
    public async Task Ids_vazios_retornam_erro_de_validacao()
    {
        await using var db = Contextos.Criar(_banco, _tenant);

        var resultado = await CriarHandler(db).Handle(
            new AtribuirChamadoCommand(Guid.Empty, Guid.Empty),
            TestContext.Current.CancellationToken);

        resultado.IsFailure.ShouldBeTrue();
        resultado.Error!.Detalhes!.Count.ShouldBe(2);
    }
}
