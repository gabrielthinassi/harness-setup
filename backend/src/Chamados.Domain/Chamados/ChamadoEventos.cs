using Chamados.Domain.Common;
using Chamados.Domain.Usuarios;

namespace Chamados.Domain.Chamados;

public sealed record ChamadoAberto(ChamadoId ChamadoId, Prioridade Prioridade, DateTimeOffset OcorridoEm) : IDomainEvent;

public sealed record ChamadoAtribuido(ChamadoId ChamadoId, UsuarioId ResponsavelId, DateTimeOffset OcorridoEm) : IDomainEvent;

public sealed record ChamadoResolvido(ChamadoId ChamadoId, UsuarioId ResponsavelId, DateTimeOffset OcorridoEm) : IDomainEvent;

public sealed record ChamadoReaberto(ChamadoId ChamadoId, UsuarioId ReabertoPor, DateTimeOffset OcorridoEm) : IDomainEvent;

public sealed record ChamadoFechado(ChamadoId ChamadoId, DateTimeOffset OcorridoEm) : IDomainEvent;
