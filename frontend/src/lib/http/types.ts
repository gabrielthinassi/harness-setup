/** Contrato de paginação da API (PaginaResponse<T> no backend). */
export type Pagina<T> = {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  total: number;
};

export type QueryParams = Record<string, string | number | boolean | null | undefined>;
