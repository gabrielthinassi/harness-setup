const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

/** Formatação centralizada: nunca formate datas/números inline nos componentes. */
export function formatarDataHora(valor: string | Date | null | undefined): string {
  return valor ? dataHora.format(new Date(valor)) : '—';
}

export function formatarData(valor: string | Date | null | undefined): string {
  return valor ? data.format(new Date(valor)) : '—';
}
