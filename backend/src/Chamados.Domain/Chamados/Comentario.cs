using Chamados.Domain.Common;
using Chamados.Domain.Usuarios;

namespace Chamados.Domain.Chamados;

/// <summary>Entidade interna do agregado Chamado. Só é criada pelo próprio Chamado.</summary>
public sealed class Comentario : Entity<Guid>
{
    public const int TextoMaxLength = 4000;

    private Comentario()
    {
        Texto = null!;
    }

    internal Comentario(UsuarioId autorId, string texto, bool interno, DateTimeOffset criadoEm)
    {
        Id = Guid.CreateVersion7();
        AutorId = autorId;
        Texto = texto;
        Interno = interno;
        CriadoEm = criadoEm;
    }

    public UsuarioId AutorId { get; private set; }

    public string Texto { get; private set; }

    /// <summary>Comentário interno: visível só para a equipe de atendimento.</summary>
    public bool Interno { get; private set; }

    public DateTimeOffset CriadoEm { get; private set; }
}
