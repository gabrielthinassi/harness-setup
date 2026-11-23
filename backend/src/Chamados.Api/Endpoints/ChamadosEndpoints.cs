using Chamados.Api.Common;
using Chamados.Application.Chamados.AbrirChamado;
using Chamados.Application.Chamados.AtribuirChamado;
using Chamados.Application.Chamados.ListarChamados;
using Chamados.Application.Chamados.ObterChamado;
using Chamados.Application.Common;
using Chamados.Application.Messaging;
using Chamados.Domain.Chamados;
using Microsoft.AspNetCore.Mvc;

namespace Chamados.Api.Endpoints;

/// <summary>Endpoints finos: recebem, delegam ao handler e traduzem o Result em HTTP.</summary>
public static class ChamadosEndpoints
{
    public sealed record AtribuirChamadoRequest(Guid ResponsavelId);

    public sealed record CriadoResponse(Guid Id);

    public static IEndpointRouteBuilder MapChamadosEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/chamados")
            .WithTags("Chamados")
            .RequireAuthorization();

        grupo.MapPost("/", AbrirAsync).WithName("AbrirChamado");
        grupo.MapGet("/{id:guid}", ObterAsync).WithName("ObterChamado");
        grupo.MapGet("/", ListarAsync).WithName("ListarChamados");
        grupo.MapPost("/{id:guid}/atribuicao", AtribuirAsync).WithName("AtribuirChamado");

        return app;
    }

    private static async Task<IResult> AbrirAsync(
        AbrirChamadoCommand command,
        [FromServices] ICommandHandler<AbrirChamadoCommand, Guid> handler,
        CancellationToken cancellationToken)
    {
        var resultado = await handler.Handle(command, cancellationToken);
        return resultado.IsSuccess
            ? TypedResults.Created($"/api/chamados/{resultado.Value}", new CriadoResponse(resultado.Value))
            : resultado.Error!.ToProblem();
    }

    private static async Task<IResult> ObterAsync(
        Guid id,
        [FromServices] IQueryHandler<ObterChamadoQuery, ChamadoDetalheResponse> handler,
        CancellationToken cancellationToken)
    {
        var resultado = await handler.Handle(new ObterChamadoQuery(id), cancellationToken);
        return resultado.IsSuccess
            ? TypedResults.Ok(resultado.Value)
            : resultado.Error!.ToProblem();
    }

    private static async Task<IResult> ListarAsync(
        [FromServices] IQueryHandler<ListarChamadosQuery, PaginaResponse<ChamadoResumoResponse>> handler,
        CancellationToken cancellationToken,
        StatusChamado? status = null,
        int pagina = 1,
        int tamanhoPagina = 20)
    {
        var resultado = await handler.Handle(new ListarChamadosQuery(status, pagina, tamanhoPagina), cancellationToken);
        return resultado.IsSuccess
            ? TypedResults.Ok(resultado.Value)
            : resultado.Error!.ToProblem();
    }

    private static async Task<IResult> AtribuirAsync(
        Guid id,
        AtribuirChamadoRequest request,
        [FromServices] ICommandHandler<AtribuirChamadoCommand> handler,
        CancellationToken cancellationToken)
    {
        var resultado = await handler.Handle(new AtribuirChamadoCommand(id, request.ResponsavelId), cancellationToken);
        return resultado.IsSuccess
            ? TypedResults.NoContent()
            : resultado.Error!.ToProblem();
    }
}
