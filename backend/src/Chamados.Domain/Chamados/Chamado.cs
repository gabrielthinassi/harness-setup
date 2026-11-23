using Chamados.Domain.Common;
using Chamados.Domain.Usuarios;

namespace Chamados.Domain.Chamados;

/// <summary>
/// Agregado Chamado. Todo o ciclo de vida passa por métodos com nome de negócio;
/// nenhum estado é alterado por fora (setters privados).
/// </summary>
/// <remarks>
/// Transições permitidas:
/// Aberto → EmAtendimento (Atribuir) → Resolvido (Resolver) → Fechado (Fechar)
/// Resolvido → EmAtendimento/Aberto (Reabrir)
/// </remarks>
public sealed class Chamado : AggregateRoot<ChamadoId>, ITenantEntity
{
    public const int TituloMaxLength = 200;
    public const int DescricaoMaxLength = 4000;
    public const int SolucaoMaxLength = 4000;

    private readonly List<Comentario> _comentarios = [];

    // Usado apenas pelo EF Core na materialização.
    private Chamado()
    {
        Titulo = null!;
        Descricao = null!;
    }

    private Chamado(
        ChamadoId id,
        string titulo,
        string descricao,
        Prioridade prioridade,
        UsuarioId solicitanteId,
        DateTimeOffset criadoEm)
    {
        Id = id;
        Titulo = titulo;
        Descricao = descricao;
        Prioridade = prioridade;
        SolicitanteId = solicitanteId;
        Status = StatusChamado.Aberto;
        CriadoEm = criadoEm;
    }

    public Guid TenantId { get; private set; }

    public string Titulo { get; private set; }

    public string Descricao { get; private set; }

    public Prioridade Prioridade { get; private set; }

    public StatusChamado Status { get; private set; }

    public UsuarioId SolicitanteId { get; private set; }

    public UsuarioId? ResponsavelId { get; private set; }

    public string? Solucao { get; private set; }

    public DateTimeOffset CriadoEm { get; private set; }

    public DateTimeOffset? AtualizadoEm { get; private set; }

    public DateTimeOffset? ResolvidoEm { get; private set; }

    public IReadOnlyCollection<Comentario> Comentarios => _comentarios.AsReadOnly();

    public bool Encerrado => Status is StatusChamado.Resolvido or StatusChamado.Fechado;

    public static Result<Chamado> Abrir(
        string titulo,
        string descricao,
        Prioridade prioridade,
        UsuarioId solicitanteId,
        DateTimeOffset agora)
    {
        if (string.IsNullOrWhiteSpace(titulo))
        {
            return ChamadoErros.TituloObrigatorio;
        }

        if (titulo.Trim().Length > TituloMaxLength)
        {
            return ChamadoErros.TituloMuitoLongo;
        }

        if (string.IsNullOrWhiteSpace(descricao))
        {
            return ChamadoErros.DescricaoObrigatoria;
        }

        var chamado = new Chamado(ChamadoId.Novo(), titulo.Trim(), descricao.Trim(), prioridade, solicitanteId, agora);
        chamado.Raise(new ChamadoAberto(chamado.Id, prioridade, agora));
        return chamado;
    }

    public Result Atribuir(UsuarioId responsavelId, DateTimeOffset agora)
    {
        if (Encerrado)
        {
            return ChamadoErros.JaEncerrado;
        }

        ResponsavelId = responsavelId;
        Status = StatusChamado.EmAtendimento;
        AtualizadoEm = agora;
        Raise(new ChamadoAtribuido(Id, responsavelId, agora));
        return Result.Success();
    }

    public Result Resolver(string solucao, DateTimeOffset agora)
    {
        if (Status != StatusChamado.EmAtendimento || ResponsavelId is null)
        {
            return ChamadoErros.NaoEstaEmAtendimento;
        }

        if (string.IsNullOrWhiteSpace(solucao))
        {
            return ChamadoErros.SolucaoObrigatoria;
        }

        Solucao = solucao.Trim();
        Status = StatusChamado.Resolvido;
        ResolvidoEm = agora;
        AtualizadoEm = agora;
        Raise(new ChamadoResolvido(Id, ResponsavelId.Value, agora));
        return Result.Success();
    }

    public Result Reabrir(string motivo, UsuarioId reabertoPor, DateTimeOffset agora)
    {
        if (Status != StatusChamado.Resolvido)
        {
            return ChamadoErros.NaoEstaResolvido;
        }

        if (string.IsNullOrWhiteSpace(motivo))
        {
            return ChamadoErros.MotivoObrigatorio;
        }

        Status = ResponsavelId is null ? StatusChamado.Aberto : StatusChamado.EmAtendimento;
        Solucao = null;
        ResolvidoEm = null;
        AtualizadoEm = agora;
        _comentarios.Add(new Comentario(reabertoPor, $"Chamado reaberto: {motivo.Trim()}", interno: false, agora));
        Raise(new ChamadoReaberto(Id, reabertoPor, agora));
        return Result.Success();
    }

    public Result Fechar(DateTimeOffset agora)
    {
        if (Status != StatusChamado.Resolvido)
        {
            return ChamadoErros.NaoEstaResolvido;
        }

        Status = StatusChamado.Fechado;
        AtualizadoEm = agora;
        Raise(new ChamadoFechado(Id, agora));
        return Result.Success();
    }

    public Result Comentar(UsuarioId autorId, string texto, bool interno, DateTimeOffset agora)
    {
        if (Status == StatusChamado.Fechado)
        {
            return ChamadoErros.Fechado;
        }

        if (string.IsNullOrWhiteSpace(texto) || texto.Trim().Length > Comentario.TextoMaxLength)
        {
            return ChamadoErros.ComentarioInvalido;
        }

        _comentarios.Add(new Comentario(autorId, texto.Trim(), interno, agora));
        AtualizadoEm = agora;
        return Result.Success();
    }
}
