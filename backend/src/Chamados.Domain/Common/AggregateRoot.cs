namespace Chamados.Domain.Common;

/// <summary>
/// Raiz de agregado: único ponto de entrada para alterar o agregado.
/// Uma transação altera um único agregado; entre agregados use eventos de domínio.
/// </summary>
public abstract class AggregateRoot<TId> : Entity<TId>
    where TId : struct
{
    private readonly List<IDomainEvent> _domainEvents = [];

    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void Raise(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);

    public void ClearDomainEvents() => _domainEvents.Clear();
}
