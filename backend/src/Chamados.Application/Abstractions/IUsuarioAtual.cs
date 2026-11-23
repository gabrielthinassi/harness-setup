using Chamados.Domain.Usuarios;

namespace Chamados.Application.Abstractions;

public interface IUsuarioAtual
{
    UsuarioId Id { get; }
}
