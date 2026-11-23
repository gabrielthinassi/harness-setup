using Chamados.Domain.Chamados;
using Chamados.Domain.Usuarios;

namespace Chamados.Domain.Tests;

public sealed class ChamadoTests
{
    private static readonly DateTimeOffset Agora = new(2026, 11, 23, 10, 0, 0, TimeSpan.Zero);

    private static Chamado NovoChamado() =>
        Chamado.Abrir("Impressora não imprime", "Fica na fila e não sai papel", Prioridade.Media, UsuarioId.Novo(), Agora).Value;

    private static Chamado ChamadoResolvido()
    {
        var chamado = NovoChamado();
        chamado.Atribuir(UsuarioId.Novo(), Agora);
        chamado.Resolver("Driver reinstalado", Agora);
        return chamado;
    }

    [Fact]
    public void Abrir_com_dados_validos_cria_chamado_aberto_e_emite_evento()
    {
        var solicitante = UsuarioId.Novo();

        var resultado = Chamado.Abrir("  Sem acesso ao ERP  ", "Erro 403 ao entrar", Prioridade.Alta, solicitante, Agora);

        resultado.IsSuccess.ShouldBeTrue();
        var chamado = resultado.Value;
        chamado.Titulo.ShouldBe("Sem acesso ao ERP");
        chamado.Status.ShouldBe(StatusChamado.Aberto);
        chamado.SolicitanteId.ShouldBe(solicitante);
        chamado.CriadoEm.ShouldBe(Agora);
        chamado.DomainEvents.ShouldHaveSingleItem().ShouldBeOfType<ChamadoAberto>();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Abrir_sem_titulo_falha(string titulo)
    {
        var resultado = Chamado.Abrir(titulo, "Descrição", Prioridade.Baixa, UsuarioId.Novo(), Agora);

        resultado.Error.ShouldBe(ChamadoErros.TituloObrigatorio);
    }

    [Fact]
    public void Abrir_com_titulo_acima_do_limite_falha()
    {
        var titulo = new string('x', Chamado.TituloMaxLength + 1);

        var resultado = Chamado.Abrir(titulo, "Descrição", Prioridade.Baixa, UsuarioId.Novo(), Agora);

        resultado.Error.ShouldBe(ChamadoErros.TituloMuitoLongo);
    }

    [Fact]
    public void Abrir_sem_descricao_falha()
    {
        var resultado = Chamado.Abrir("Título", " ", Prioridade.Baixa, UsuarioId.Novo(), Agora);

        resultado.Error.ShouldBe(ChamadoErros.DescricaoObrigatoria);
    }

    [Fact]
    public void Atribuir_chamado_aberto_coloca_em_atendimento()
    {
        var chamado = NovoChamado();
        var tecnico = UsuarioId.Novo();

        var resultado = chamado.Atribuir(tecnico, Agora);

        resultado.IsSuccess.ShouldBeTrue();
        chamado.Status.ShouldBe(StatusChamado.EmAtendimento);
        chamado.ResponsavelId.ShouldBe(tecnico);
        chamado.DomainEvents.OfType<ChamadoAtribuido>().ShouldHaveSingleItem();
    }

    [Fact]
    public void Atribuir_chamado_resolvido_falha()
    {
        var chamado = ChamadoResolvido();

        chamado.Atribuir(UsuarioId.Novo(), Agora).Error.ShouldBe(ChamadoErros.JaEncerrado);
    }

    [Fact]
    public void Resolver_chamado_sem_atendimento_falha()
    {
        var chamado = NovoChamado();

        chamado.Resolver("Solução", Agora).Error.ShouldBe(ChamadoErros.NaoEstaEmAtendimento);
    }

    [Fact]
    public void Resolver_sem_solucao_falha()
    {
        var chamado = NovoChamado();
        chamado.Atribuir(UsuarioId.Novo(), Agora);

        chamado.Resolver(" ", Agora).Error.ShouldBe(ChamadoErros.SolucaoObrigatoria);
    }

    [Fact]
    public void Resolver_chamado_em_atendimento_registra_solucao()
    {
        var chamado = ChamadoResolvido();

        chamado.Status.ShouldBe(StatusChamado.Resolvido);
        chamado.Solucao.ShouldBe("Driver reinstalado");
        chamado.ResolvidoEm.ShouldBe(Agora);
        chamado.Encerrado.ShouldBeTrue();
        chamado.DomainEvents.OfType<ChamadoResolvido>().ShouldHaveSingleItem();
    }

    [Fact]
    public void Reabrir_chamado_resolvido_volta_para_atendimento_e_registra_motivo()
    {
        var chamado = ChamadoResolvido();
        var solicitante = chamado.SolicitanteId;

        var resultado = chamado.Reabrir("Voltou a falhar", solicitante, Agora);

        resultado.IsSuccess.ShouldBeTrue();
        chamado.Status.ShouldBe(StatusChamado.EmAtendimento);
        chamado.Solucao.ShouldBeNull();
        chamado.ResolvidoEm.ShouldBeNull();
        chamado.Comentarios.ShouldHaveSingleItem().Texto.ShouldContain("Voltou a falhar");
    }

    [Fact]
    public void Reabrir_sem_motivo_falha()
    {
        var chamado = ChamadoResolvido();

        chamado.Reabrir("", UsuarioId.Novo(), Agora).Error.ShouldBe(ChamadoErros.MotivoObrigatorio);
    }

    [Fact]
    public void Reabrir_chamado_nao_resolvido_falha()
    {
        var chamado = NovoChamado();

        chamado.Reabrir("Motivo", UsuarioId.Novo(), Agora).Error.ShouldBe(ChamadoErros.NaoEstaResolvido);
    }

    [Fact]
    public void Fechar_chamado_resolvido_encerra_definitivamente()
    {
        var chamado = ChamadoResolvido();

        chamado.Fechar(Agora).IsSuccess.ShouldBeTrue();

        chamado.Status.ShouldBe(StatusChamado.Fechado);
        chamado.Comentar(UsuarioId.Novo(), "Mais um detalhe", interno: false, Agora).Error.ShouldBe(ChamadoErros.Fechado);
    }

    [Fact]
    public void Fechar_chamado_nao_resolvido_falha()
    {
        NovoChamado().Fechar(Agora).Error.ShouldBe(ChamadoErros.NaoEstaResolvido);
    }

    [Fact]
    public void Comentar_adiciona_comentario()
    {
        var chamado = NovoChamado();
        var autor = UsuarioId.Novo();

        chamado.Comentar(autor, "  Verificando  ", interno: true, Agora).IsSuccess.ShouldBeTrue();

        var comentario = chamado.Comentarios.ShouldHaveSingleItem();
        comentario.Texto.ShouldBe("Verificando");
        comentario.AutorId.ShouldBe(autor);
        comentario.Interno.ShouldBeTrue();
    }

    [Fact]
    public void Comentar_texto_vazio_falha()
    {
        NovoChamado().Comentar(UsuarioId.Novo(), "", interno: false, Agora).Error.ShouldBe(ChamadoErros.ComentarioInvalido);
    }

    [Fact]
    public void ClearDomainEvents_remove_eventos_publicados()
    {
        var chamado = NovoChamado();

        chamado.ClearDomainEvents();

        chamado.DomainEvents.ShouldBeEmpty();
    }
}
