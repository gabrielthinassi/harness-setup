'use client';

import { useCallback, useState } from 'react';

/** Estado aberto/fechado para diálogos, menus e drawers. */
export function useDisclosure(inicial = false) {
  const [aberto, setAberto] = useState(inicial);
  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);
  const alternar = useCallback(() => setAberto((v) => !v), []);
  return { aberto, abrir, fechar, alternar };
}
