using Chamados.Domain.Chamados;
using Chamados.Domain.Usuarios;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Chamados.Infrastructure.Persistence.Converters;

internal sealed class ChamadoIdConverter() : ValueConverter<ChamadoId, Guid>(id => id.Value, valor => new ChamadoId(valor));

internal sealed class UsuarioIdConverter() : ValueConverter<UsuarioId, Guid>(id => id.Value, valor => new UsuarioId(valor));
