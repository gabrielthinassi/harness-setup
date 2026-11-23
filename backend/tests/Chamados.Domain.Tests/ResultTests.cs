using Chamados.Domain.Common;

namespace Chamados.Domain.Tests;

public sealed class ResultTests
{
    [Fact]
    public void Acessar_valor_de_falha_lanca_excecao()
    {
        Result<int> resultado = Error.Conflito("X", "Falhou");

        resultado.IsFailure.ShouldBeTrue();
        Should.Throw<InvalidOperationException>(() => resultado.Value);
    }

    [Fact]
    public void Sucesso_expoe_valor()
    {
        Result<int> resultado = 42;

        resultado.IsSuccess.ShouldBeTrue();
        resultado.Value.ShouldBe(42);
    }
}
