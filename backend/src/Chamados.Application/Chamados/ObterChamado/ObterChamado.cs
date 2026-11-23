using Chamados.Application.Abstractions;
using Chamados.Application.Messaging;
using Chamados.Domain.Chamados;
using Chamados.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Chamados.Application.Chamados.ObterChamado;

public sealed record ObterChamadoQuery(Guid Id) : IQuery<ChamadoDetalheResponse>;

public sealed record ComentarioResponse(Guid Id, Guid AutorId, string Texto, bool Interno, DateTimeOffset CriadoEm);

public sealed record ChamadoDetalheResponse(
    Guid Id,
    string Titulo,
    string Descricao,
    Prioridade Prioridade,
    StatusChamado Status,
    Guid SolicitanteId,
    Guid? ResponsavelId,
    string? Solucao,
    DateTimeOffset CriadoEm,
    DateTimeOffset? ResolvidoEm,
    IReadOnlyList<ComentarioResponse> Comentarios);

internal sealed class ObterChamadoHandler(IAppDbContext db) : IQueryHandler<ObterChamadoQuery, ChamadoDetalheResponse>
{
    public async Task<Result<ChamadoDetalheResponse>> Handle(ObterChamadoQuery query, CancellationToken cancellationToken)
    {
        var id = new ChamadoId(query.Id);

        var chamado = await db.Chamados
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (chamado is null)
        {
            return ChamadoErros.NaoEncontrado;
        }

        return new ChamadoDetalheResponse(
            chamado.Id.Value,
            chamado.Titulo,
            chamado.Descricao,
            chamado.Prioridade,
            chamado.Status,
            chamado.SolicitanteId.Value,
            chamado.ResponsavelId?.Value,
            chamado.Solucao,
            chamado.CriadoEm,
            chamado.ResolvidoEm,
            [.. chamado.Comentarios
                .OrderBy(c => c.CriadoEm)
                .Select(c => new ComentarioResponse(c.Id, c.AutorId.Value, c.Texto, c.Interno, c.CriadoEm))]);
    }
}
