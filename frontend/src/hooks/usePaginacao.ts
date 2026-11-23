'use client';

import { useCallback, useState } from 'react';

export const TAMANHOS_PAGINA = [10, 20, 50] as const;

/** Estado de paginação 1-based (igual à API). Trocar o tamanho volta para a página 1. */
export function usePaginacao(tamanhoInicial: number = TAMANHOS_PAGINA[1]) {
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanho] = useState(tamanhoInicial);

  const setTamanhoPagina = useCallback((tamanho: number) => {
    setTamanho(tamanho);
    setPagina(1);
  }, []);

  return { pagina, tamanhoPagina, setPagina, setTamanhoPagina };
}
