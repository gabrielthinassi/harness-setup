namespace Chamados.Domain.Common;

/// <summary>Fato de negócio que já aconteceu. Nome sempre no passado (ChamadoAberto).</summary>
public interface IDomainEvent
{
    DateTimeOffset OcorridoEm { get; }
}
