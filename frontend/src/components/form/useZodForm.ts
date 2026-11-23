'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Formulário tipado a partir de um schema Zod (a mesma fonte de verdade para tipos e validação).
 *
 * @example
 * const schema = z.object({ titulo: z.string().min(1, 'Informe o título') });
 * const form = useZodForm(schema, { defaultValues: { titulo: '' } });
 */
export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues = TInput>(
  schema: z.ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'>,
): UseFormReturn<TInput, unknown, TOutput> {
  return useForm<TInput, unknown, TOutput>({
    mode: 'onTouched',
    ...options,
    resolver: zodResolver(schema),
  });
}
