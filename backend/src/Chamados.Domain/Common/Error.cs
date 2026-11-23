namespace Chamados.Domain.Common;

public enum TipoErro
{
    Validacao,
    NaoEncontrado,
    Conflito,
    Proibido,
}

/// <summary>Erro de negócio esperado. Exceções ficam para o que é realmente excepcional.</summary>
public sealed record Error(
    string Codigo,
    string Mensagem,
    TipoErro Tipo,
    IReadOnlyDictionary<string, string[]>? Detalhes = null)
{
    public static Error Validacao(string codigo, string mensagem) => new(codigo, mensagem, TipoErro.Validacao);

    public static Error Validacao(IReadOnlyDictionary<string, string[]> detalhes) =>
        new("Validacao", "Um ou mais campos são inválidos.", TipoErro.Validacao, detalhes);

    public static Error NaoEncontrado(string codigo, string mensagem) => new(codigo, mensagem, TipoErro.NaoEncontrado);

    public static Error Conflito(string codigo, string mensagem) => new(codigo, mensagem, TipoErro.Conflito);

    public static Error Proibido(string codigo, string mensagem) => new(codigo, mensagem, TipoErro.Proibido);
}
