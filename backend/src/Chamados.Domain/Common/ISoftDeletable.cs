namespace Chamados.Domain.Common;

/// <summary>Entidades que são marcadas como excluídas em vez de removidas do banco.</summary>
public interface ISoftDeletable
{
    bool Excluido { get; }
}
