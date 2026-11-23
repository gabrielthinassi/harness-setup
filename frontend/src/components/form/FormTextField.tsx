'use client';

// Único ponto autorizado a usar TextField para campos de formulário.
import { TextField, type TextFieldProps } from '@mui/material';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';

// Variante fixa (outlined) evita a união de tipos do TextField e mantém o visual padronizado.
export type FormTextFieldProps<T extends FieldValues> = Omit<
  TextFieldProps<'outlined'>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'variant'
> & {
  name: Path<T>;
};

/** Campo de texto ligado ao formulário: valor, validação e mensagem de erro já resolvidos. */
export function FormTextField<T extends FieldValues>({ name, helperText, ...props }: FormTextFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, value, ...field }, fieldState }) => (
        <TextField
          {...props}
          {...field}
          value={value ?? ''}
          inputRef={ref}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? helperText}
        />
      )}
    />
  );
}
