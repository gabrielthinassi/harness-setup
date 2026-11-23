/** Contratos espelhando a API (Chamados.Application.Chamados.*Response). */
export type StatusChamado = 'Aberto' | 'EmAtendimento' | 'Resolvido' | 'Fechado';

export type Prioridade = 'Baixa' | 'Media' | 'Alta' | 'Critica';

export type ChamadoResumo = {
  id: string;
  titulo: string;
  prioridade: Prioridade;
  status: StatusChamado;
  responsavelId: string | null;
  criadoEm: string;
};

export type ListarChamadosParams = {
  status?: StatusChamado;
  pagina: number;
  tamanhoPagina: number;
};
