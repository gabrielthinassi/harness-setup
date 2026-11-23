namespace Chamados.Application.Common;

public sealed record PaginaResponse<T>(IReadOnlyList<T> Itens, int Pagina, int TamanhoPagina, int Total);
