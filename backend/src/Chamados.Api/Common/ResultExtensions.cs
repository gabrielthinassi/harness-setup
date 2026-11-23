using Chamados.Domain.Common;

namespace Chamados.Api.Common;

public static class ResultExtensions
{
    /// <summary>Converte um erro de negócio no ProblemDetails correspondente.</summary>
    public static IResult ToProblem(this Error error)
    {
        if (error.Tipo == TipoErro.Validacao && error.Detalhes is not null)
        {
            return TypedResults.ValidationProblem(
                error.Detalhes.ToDictionary(),
                title: error.Mensagem);
        }

        var status = error.Tipo switch
        {
            TipoErro.Validacao => StatusCodes.Status400BadRequest,
            TipoErro.NaoEncontrado => StatusCodes.Status404NotFound,
            TipoErro.Conflito => StatusCodes.Status409Conflict,
            TipoErro.Proibido => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError,
        };

        return TypedResults.Problem(statusCode: status, title: error.Codigo, detail: error.Mensagem);
    }
}
