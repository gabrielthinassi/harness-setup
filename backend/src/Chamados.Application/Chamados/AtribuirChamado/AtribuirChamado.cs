using Chamados.Application.Abstractions;
using Chamados.Application.Common;
using Chamados.Application.Messaging;
using Chamados.Domain.Chamados;
using Chamados.Domain.Common;
using Chamados.Domain.Usuarios;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Chamados.Application.Chamados.AtribuirChamado;

public sealed record AtribuirChamadoCommand(Guid ChamadoId, Guid ResponsavelId) : ICommand;

internal sealed class AtribuirChamadoValidator : AbstractValidator<AtribuirChamadoCommand>
{
    public AtribuirChamadoValidator()
    {
        RuleFor(x => x.ChamadoId).NotEmpty();
        RuleFor(x => x.ResponsavelId).NotEmpty();
    }
}

internal sealed class AtribuirChamadoHandler(
    IAppDbContext db,
    IValidator<AtribuirChamadoCommand> validator,
    TimeProvider clock) : ICommandHandler<AtribuirChamadoCommand>
{
    public async Task<Result> Handle(AtribuirChamadoCommand command, CancellationToken cancellationToken)
    {
        if (await validator.ValidarAsync(command, cancellationToken) is { } erroValidacao)
        {
            return erroValidacao;
        }

        var id = new ChamadoId(command.ChamadoId);

        // O filtro de tenant garante que só chamados do tenant atual são encontrados.
        var chamado = await db.Chamados.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (chamado is null)
        {
            return ChamadoErros.NaoEncontrado;
        }

        var resultado = chamado.Atribuir(new UsuarioId(command.ResponsavelId), clock.GetUtcNow());
        if (resultado.IsFailure)
        {
            return resultado;
        }

        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
