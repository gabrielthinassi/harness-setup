'use client';

import type { ComponentProps, ReactNode } from 'react';
import { FormProvider, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';
import { useNotify } from '@/components/feedback/NotificationProvider';
import { ApiError, mensagemDeErro } from '@/lib/http/problemDetails';

type FormProps<TInput extends FieldValues, TOutput extends FieldValues> = Omit<
  ComponentProps<'form'>,
  'onSubmit' | 'children'
> & {
  form: UseFormReturn<TInput, unknown, TOutput>;
  onSubmit: (valores: TOutput) => Promise<unknown> | void;
  children: ReactNode;
};

/**
 * Formulário padrão. Responsabilidades:
 * - liga o react-hook-form aos campos Form* (FormTextField, FormSelect...);
 * - erros 400 da API com campos → mensagem em cada campo;
 * - demais erros → notificação.
 */
export function Form<TInput extends FieldValues, TOutput extends FieldValues>({
  form,
  onSubmit,
  children,
  ...props
}: FormProps<TInput, TOutput>) {
  const notify = useNotify();

  const enviar = form.handleSubmit(async (valores) => {
    try {
      await onSubmit(valores);
    } catch (erro) {
      if (erro instanceof ApiError && erro.isValidation) {
        for (const [campo, mensagem] of Object.entries(erro.fieldErrors)) {
          form.setError(campo as Path<TInput>, { type: 'server', message: mensagem });
        }
        return;
      }
      notify.error(mensagemDeErro(erro));
    }
  });

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={enviar} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
