namespace Chamados.Application.Messaging;

/// <summary>Altera estado. Nome no imperativo: AbrirChamadoCommand.</summary>
public interface ICommand
{
}

/// <summary>Altera estado e devolve um valor (ex.: Id criado).</summary>
public interface ICommand<TResponse>
{
}
