using Chamados.Domain.Common;

namespace Chamados.Domain.Chamados;

public static class ChamadoErros
{
    public static readonly Error NaoEncontrado =
        Error.NaoEncontrado("Chamado.NaoEncontrado", "Chamado não encontrado.");

    public static readonly Error TituloObrigatorio =
        Error.Validacao("Chamado.TituloObrigatorio", "O título é obrigatório.");

    public static readonly Error TituloMuitoLongo =
        Error.Validacao("Chamado.TituloMuitoLongo", $"O título deve ter no máximo {Chamado.TituloMaxLength} caracteres.");

    public static readonly Error DescricaoObrigatoria =
        Error.Validacao("Chamado.DescricaoObrigatoria", "A descrição é obrigatória.");

    public static readonly Error JaEncerrado =
        Error.Conflito("Chamado.JaEncerrado", "O chamado já foi resolvido ou fechado.");

    public static readonly Error NaoEstaEmAtendimento =
        Error.Conflito("Chamado.NaoEstaEmAtendimento", "Só é possível resolver um chamado em atendimento.");

    public static readonly Error SolucaoObrigatoria =
        Error.Validacao("Chamado.SolucaoObrigatoria", "Informe a solução aplicada.");

    public static readonly Error NaoEstaResolvido =
        Error.Conflito("Chamado.NaoEstaResolvido", "Só é possível reabrir ou fechar um chamado resolvido.");

    public static readonly Error MotivoObrigatorio =
        Error.Validacao("Chamado.MotivoObrigatorio", "Informe o motivo da reabertura.");

    public static readonly Error ComentarioInvalido =
        Error.Validacao("Chamado.ComentarioInvalido", $"O comentário deve ter entre 1 e {Comentario.TextoMaxLength} caracteres.");

    public static readonly Error Fechado =
        Error.Conflito("Chamado.Fechado", "Chamados fechados não aceitam alterações.");
}
