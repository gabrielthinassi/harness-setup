using System.Net;
using System.Net.Http.Json;

namespace Chamados.IntegrationTests;

/// <summary>O teste mais importante de um sistema multitenant: um tenant nunca enxerga dados de outro.</summary>
public sealed class IsolamentoTenantTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    public sealed record CriadoResponse(Guid Id);

    public sealed record ItemLista(Guid Id, string Titulo);

    public sealed record Pagina(List<ItemLista> Itens, int Total);

    [Fact]
    public async Task Tenant_nao_enxerga_chamado_de_outro_tenant()
    {
        var ct = TestContext.Current.CancellationToken;
        var clienteA = factory.CriarClienteDoTenant(Guid.NewGuid());
        var clienteB = factory.CriarClienteDoTenant(Guid.NewGuid());

        var criacao = await clienteA.PostAsJsonAsync(
            "/api/chamados",
            new { titulo = "Notebook não liga", descricao = "Nem a luz acende", prioridade = "Alta" },
            ct);
        criacao.StatusCode.ShouldBe(HttpStatusCode.Created);
        var id = (await criacao.Content.ReadFromJsonAsync<CriadoResponse>(ct))!.Id;

        (await clienteA.GetAsync($"/api/chamados/{id}", ct)).StatusCode.ShouldBe(HttpStatusCode.OK);
        (await clienteB.GetAsync($"/api/chamados/{id}", ct)).StatusCode.ShouldBe(HttpStatusCode.NotFound);

        var listaB = await clienteB.GetFromJsonAsync<Pagina>("/api/chamados", ct);
        listaB!.Itens.ShouldNotContain(i => i.Id == id);

        var atribuicaoB = await clienteB.PostAsJsonAsync(
            $"/api/chamados/{id}/atribuicao",
            new { responsavelId = Guid.NewGuid() },
            ct);
        atribuicaoB.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Requisicao_sem_autenticacao_retorna_401()
    {
        var cliente = factory.CreateClient();

        var resposta = await cliente.GetAsync("/api/chamados", TestContext.Current.CancellationToken);

        resposta.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Dados_invalidos_retornam_problem_details_400()
    {
        var cliente = factory.CriarClienteDoTenant(Guid.NewGuid());

        var resposta = await cliente.PostAsJsonAsync(
            "/api/chamados",
            new { titulo = "", descricao = "", prioridade = "Media" },
            TestContext.Current.CancellationToken);

        resposta.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        resposta.Content.Headers.ContentType!.MediaType.ShouldBe("application/problem+json");
    }
}
