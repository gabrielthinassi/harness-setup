'use client';

import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions } from '@tanstack/react-query';
import { useNotify } from '@/components/feedback/NotificationProvider';
import { ApiError, mensagemDeErro } from '@/lib/http/problemDetails';

type Opcoes<TData, TVariables> = Omit<UseMutationOptions<TData, unknown, TVariables>, 'onError'> & {
  /** Mensagem exibida em caso de sucesso. */
  mensagemSucesso?: string;
  /** Query keys invalidadas após sucesso (recarregam listas/detalhes). */
  invalidar?: QueryKey[];
  /**
   * Erros de validação (400 com campos) normalmente são exibidos no formulário pelo <Form>.
   * Defina true para também mostrar uma notificação.
   */
  notificarErroDeValidacao?: boolean;
};

/**
 * Padrão único de mutação: notifica sucesso/erro e invalida o cache.
 * Não use useMutation diretamente nas features.
 */
export function useAppMutation<TData = unknown, TVariables = void>({
  mensagemSucesso,
  invalidar = [],
  notificarErroDeValidacao = false,
  onSuccess,
  ...opcoes
}: Opcoes<TData, TVariables>) {
  const queryClient = useQueryClient();
  const notify = useNotify();

  return useMutation<TData, unknown, TVariables>({
    ...opcoes,
    onSuccess: async (...args) => {
      await Promise.all(invalidar.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (mensagemSucesso) {
        notify.success(mensagemSucesso);
      }
      await onSuccess?.(...args);
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.isValidation && !notificarErroDeValidacao) {
        return;
      }
      notify.error(mensagemDeErro(erro));
    },
  });
}
