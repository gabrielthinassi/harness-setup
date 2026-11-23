using Chamados.Domain.Chamados;
using Microsoft.EntityFrameworkCore;

namespace Chamados.Application.Abstractions;

/// <summary>
/// Unidade de trabalho. Escrita: carregue o agregado, chame o método de negócio e salve.
/// Leitura: AsNoTracking() + Select() direto para o DTO de resposta.
/// </summary>
public interface IAppDbContext
{
    DbSet<Chamado> Chamados { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
