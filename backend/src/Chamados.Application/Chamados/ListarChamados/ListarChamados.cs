using Chamados.Application.Abstractions;
using Chamados.Application.Common;
using Chamados.Application.Messaging;
using Chamados.Domain.Chamados;
using Chamados.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace Chamados.Application.Chamados.ListarChamados;

public sealed record ListarChamadosQuery(StatusChamado? Status, int Pagina = 1, int TamanhoPagina = 20)
    : IQuery<PaginaResponse<ChamadoResumoResponse>>;

public sealed record ChamadoResumoResponse(
    Guid Id,
    string Titulo,
    Prioridade Prioridade,
    StatusChamado Status,
    Guid? ResponsavelId,
    DateTimeOffset CriadoEm);

internal sealed class ListarChamadosHandler(IAppDbContext db)
    : IQueryHandler<ListarChamadosQuery, PaginaResponse<ChamadoResumoResponse>>
{
    public const int TamanhoMaximoPagina = 100;

    public async Task<Result<PaginaResponse<ChamadoResumoResponse>>> Handle(
        ListarChamadosQuery query,
        CancellationToken cancellationToken)
    {
        var pagina = Math.Max(1, query.Pagina);
        var tamanho = Math.Clamp(query.TamanhoPagina, 1, TamanhoMaximoPagina);

        var consulta = db.Chamados.AsNoTracking();
        if (query.Status is { } status)
        {
            consulta = consulta.Where(c => c.Status == status);
        }

        var total = await consulta.CountAsync(cancellationToken);

        // Projeta só as colunas necessárias; a conversão dos IDs tipados é feita em memória.
        var linhas = await consulta
            .OrderByDescending(c => c.CriadoEm)
            .Skip((pagina - 1) * tamanho)
            .Take(tamanho)
            .Select(c => new { c.Id, c.Titulo, c.Prioridade, c.Status, c.ResponsavelId, c.CriadoEm })
            .ToListAsync(cancellationToken);

        var itens = linhas
            .Select(c => new ChamadoResumoResponse(c.Id.Value, c.Titulo, c.Prioridade, c.Status, c.ResponsavelId?.Value, c.CriadoEm))
            .ToList();

        return new PaginaResponse<ChamadoResumoResponse>(itens, pagina, tamanho, total);
    }
}
