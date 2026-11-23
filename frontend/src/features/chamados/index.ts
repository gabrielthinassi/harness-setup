/** API pública da feature. Outras partes da aplicação importam SOMENTE daqui. */
export { chamadosKeys, useChamados } from './api/queries';
export { ChamadosList } from './components/ChamadosList';
export { PRIORIDADE, STATUS_CHAMADO } from './constants';
export type { ChamadoResumo, Prioridade, StatusChamado } from './types';
