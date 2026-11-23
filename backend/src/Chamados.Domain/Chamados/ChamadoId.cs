namespace Chamados.Domain.Chamados;

public readonly record struct ChamadoId(Guid Value)
{
    public static ChamadoId Novo() => new(Guid.CreateVersion7());

    public override string ToString() => Value.ToString();
}
