using Chamados.Application.Chamados.ListarChamados;
using Chamados.Application.Chamados.ObterChamado;
using Chamados.Domain.Chamados;
using Chamados.Domain.Usuarios;

namespace Chamados.Application.Tests.Chamados;

public sealed class ConsultasChamadoTests
{
    private static readonly DateTimeOffset Agora = new(2026, 11, 23, 10, 0, 0, TimeSpan.Zero);

    private readonly string _banco = Guid.NewGuid().ToString();
    private readonly Guid _tenantA = Guid.NewGuid();
    private readonly Guid _tenantB = Guid.NewGuid();

    private async Task<Chamado> CriarAsync(Guid tenant, string titulo, int minutosDepois = 0, bool atribuir = false)
    {
        await using var db = Contextos.Criar(_banco, tenant);
        var chamado = Chamado.Abrir(titulo, "Descrição", Prioridade.Media, UsuarioId.Novo(), Agora.AddMinutes(minutosDepois)).Value;
        if (atribuir)
        {
            chamado.Atribuir(UsuarioId.Novo(), Agora);
        }

        chamado.Comentar(UsuarioId.Novo(), "Primeiro contato", interno: false, Agora);
        db.Chamados.Add(chamado);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);
        return chamado;
    }

    [Fact]
    public async Task Listar_retorna_apenas_chamados_do_tenant_atual_mais_recentes_primeiro()
    {
        await CriarAsync(_tenantA, "A1", minutosDepois: 0);
        await CriarAsync(_tenantA, "A2", minutosDepois: 5);
        await CriarAsync(_tenantB, "B1");

        await using var db = Contextos.Criar(_banco, _tenantA);
        var resultado = await new ListarChamadosHandler(db).Handle(
            new ListarChamadosQuery(Status: null),
            TestContext.Current.CancellationToken);

        resultado.Value.Total.ShouldBe(2);
        resultado.Value.Itens.Select(i => i.Titulo).ShouldBe(new[] { "A2", "A1" });
    }

    [Fact]
    public async Task Listar_filtra_por_status_e_limita_tamanho_da_pagina()
    {
        await CriarAsync(_tenantA, "Aberto");
        await CriarAsync(_tenantA, "Em atendimento", atribuir: true);

        await using var db = Contextos.Criar(_banco, _tenantA);
        var resultado = await new ListarChamadosHandler(db).Handle(
            new ListarChamadosQuery(StatusChamado.EmAtendimento, Pagina: 0, TamanhoPagina: 1000),
            TestContext.Current.CancellationToken);

        resultado.Value.Itens.ShouldHaveSingleItem().Titulo.ShouldBe("Em atendimento");
        resultado.Value.Pagina.ShouldBe(1);
        resultado.Value.TamanhoPagina.ShouldBe(ListarChamadosHandler.TamanhoMaximoPagina);
    }

    [Fact]
    public async Task Obter_retorna_detalhe_com_comentarios()
    {
        var criado = await CriarAsync(_tenantA, "Detalhe", atribuir: true);

        await using var db = Contextos.Criar(_banco, _tenantA);
        var resultado = await new ObterChamadoHandler(db).Handle(
            new ObterChamadoQuery(criado.Id.Value),
            TestContext.Current.CancellationToken);

        resultado.IsSuccess.ShouldBeTrue();
        resultado.Value.Titulo.ShouldBe("Detalhe");
        resultado.Value.ResponsavelId.ShouldNotBeNull();
        resultado.Value.Comentarios.ShouldHaveSingleItem().Texto.ShouldBe("Primeiro contato");
    }

    [Fact]
    public async Task Obter_chamado_de_outro_tenant_retorna_nao_encontrado()
    {
        var criado = await CriarAsync(_tenantB, "Do outro tenant");

        await using var db = Contextos.Criar(_banco, _tenantA);
        var resultado = await new ObterChamadoHandler(db).Handle(
            new ObterChamadoQuery(criado.Id.Value),
            TestContext.Current.CancellationToken);

        resultado.Error.ShouldBe(ChamadoErros.NaoEncontrado);
    }
}
