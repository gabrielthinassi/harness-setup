'use client';

import { Button, Stack } from '@mui/material';
import { useFormState } from 'react-hook-form';

type FormActionsProps = {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
};

/** Botões padrão do formulário: cancelar + enviar (com estado de carregamento e bloqueio de duplo envio). */
export function FormActions({
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  onCancel,
}: FormActionsProps) {
  const { isSubmitting } = useFormState();

  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 3 }}>
      {onCancel && (
        <Button onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button type="submit" variant="contained" loading={isSubmitting}>
        {submitLabel}
      </Button>
    </Stack>
  );
}
