using Chamados.Application.Abstractions;
using Chamados.Application.Common;
using Chamados.Application.Messaging;
using Chamados.Domain.Chamados;
using Chamados.Domain.Common;
using FluentValidation;

namespace Chamados.Application.Chamados.AbrirChamado;

public sealed record AbrirChamadoCommand(string Titulo, string Descricao, Prioridade Prioridade) : ICommand<Guid>;

internal sealed class AbrirChamadoValidator : AbstractValidator<AbrirChamadoCommand>
{
    public AbrirChamadoValidator()
    {
        RuleFor(x => x.Titulo).NotEmpty().MaximumLength(Chamado.TituloMaxLength);
        RuleFor(x => x.Descricao).NotEmpty().MaximumLength(Chamado.DescricaoMaxLength);
        RuleFor(x => x.Prioridade).IsInEnum();
    }
}

internal sealed class AbrirChamadoHandler(
    IAppDbContext db,
    IUsuarioAtual usuarioAtual,
    IValidator<AbrirChamadoCommand> validator,
    TimeProvider clock) : ICommandHandler<AbrirChamadoCommand, Guid>
{
    public async Task<Result<Guid>> Handle(AbrirChamadoCommand command, CancellationToken cancellationToken)
    {
        if (await validator.ValidarAsync(command, cancellationToken) is { } erroValidacao)
        {
            return erroValidacao;
        }

        var resultado = Chamado.Abrir(
            command.Titulo,
            command.Descricao,
            command.Prioridade,
            usuarioAtual.Id,
            clock.GetUtcNow());

        if (resultado.IsFailure)
        {
            return resultado.Error!;
        }

        // TenantId é preenchido pelo interceptor da Infrastructure ao salvar.
        db.Chamados.Add(resultado.Value);
        await db.SaveChangesAsync(cancellationToken);

        return resultado.Value.Id.Value;
    }
}
