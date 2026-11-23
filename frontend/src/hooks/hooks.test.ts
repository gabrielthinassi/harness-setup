import { act, renderHook } from '@testing-library/react';
import { useDisclosure } from './useDisclosure';
import { usePaginacao } from './usePaginacao';

describe('useDisclosure', () => {
  it('abre, fecha e alterna', () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => result.current.abrir());
    expect(result.current.aberto).toBe(true);
    act(() => result.current.alternar());
    expect(result.current.aberto).toBe(false);
    act(() => result.current.alternar());
    act(() => result.current.fechar());
    expect(result.current.aberto).toBe(false);
  });
});

describe('usePaginacao', () => {
  it('volta para a página 1 ao trocar o tamanho', () => {
    const { result } = renderHook(() => usePaginacao(10));

    act(() => result.current.setPagina(3));
    expect(result.current.pagina).toBe(3);

    act(() => result.current.setTamanhoPagina(50));
    expect(result.current).toMatchObject({ pagina: 1, tamanhoPagina: 50 });
  });
});
