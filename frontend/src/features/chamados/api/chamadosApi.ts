import { apiClient } from '@/lib/http/apiClient';
import type { Pagina } from '@/lib/http/types';
import type { ChamadoResumo, ListarChamadosParams } from '../types';

/** Chamadas HTTP da feature. Componentes nunca chamam apiClient/fetch diretamente. */
export const chamadosApi = {
  listar: (params: ListarChamadosParams, signal?: AbortSignal) =>
    apiClient.get<Pagina<ChamadoResumo>>('chamados', { query: params, signal }),
};
