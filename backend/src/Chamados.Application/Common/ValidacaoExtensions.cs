using Chamados.Domain.Common;
using FluentValidation;

namespace Chamados.Application.Common;

public static class ValidacaoExtensions
{
    /// <summary>Executa o validador e devolve um Error de validação (ou null se válido).</summary>
    public static async Task<Error?> ValidarAsync<T>(
        this IValidator<T> validator,
        T instancia,
        CancellationToken cancellationToken)
    {
        var resultado = await validator.ValidateAsync(instancia, cancellationToken);
        if (resultado.IsValid)
        {
            return null;
        }

        var detalhes = resultado.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

        return Error.Validacao(detalhes);
    }
}
