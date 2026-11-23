using System.Security.Claims;
using Chamados.Application.Abstractions;
using Chamados.Domain.Usuarios;

namespace Chamados.Api.Common;

public sealed class HttpUsuarioAtual(IHttpContextAccessor accessor) : IUsuarioAtual
{
    public UsuarioId Id
    {
        get
        {
            var user = accessor.HttpContext?.User;
            var valor = user?.FindFirst("sub")?.Value ?? user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(valor, out var id)
                ? new UsuarioId(id)
                : throw new UnauthorizedAccessException("Usuário não identificado.");
        }
    }
}
