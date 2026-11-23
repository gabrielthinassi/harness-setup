'use client';

import { MenuItem } from '@mui/material';
import type { FieldValues } from 'react-hook-form';
import { FormTextField, type FormTextFieldProps } from './FormTextField';

export type SelectOption = { value: string; label: string };

type FormSelectProps<T extends FieldValues> = Omit<FormTextFieldProps<T>, 'select' | 'children'> & {
  options: readonly SelectOption[];
  /** Texto da opção vazia. Omita para não exibir opção vazia. */
  placeholder?: string;
};

/** Select ligado ao formulário. Reaproveita o FormTextField (mesma validação e layout). */
export function FormSelect<T extends FieldValues>({ options, placeholder, ...props }: FormSelectProps<T>) {
  return (
    <FormTextField<T> {...props} select>
      {placeholder !== undefined && (
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
      )}
      {options.map((opcao) => (
        <MenuItem key={opcao.value} value={opcao.value}>
          {opcao.label}
        </MenuItem>
      ))}
    </FormTextField>
  );
}
