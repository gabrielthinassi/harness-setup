import { screen, waitFor } from '@testing-library/react';
import { z } from 'zod';
import { ApiError } from '@/lib/http/problemDetails';
import { renderWithProviders } from '@/test/render';
import { Form, FormActions, FormSelect, FormTextField, useZodForm } from '.';

const schema = z.object({
  titulo: z.string().min(1, 'Informe o título'),
  prioridade: z.enum(['Baixa', 'Alta'], { message: 'Escolha a prioridade' }),
});

type Valores = z.input<typeof schema>;

function FormularioExemplo({
  onSubmit,
  onCancel,
}: {
  onSubmit: (v: Valores) => Promise<unknown>;
  onCancel?: () => void;
}) {
  const form = useZodForm(schema, { defaultValues: { titulo: '', prioridade: '' as Valores['prioridade'] } });
  return (
    <Form form={form} onSubmit={onSubmit} aria-label="exemplo">
      <FormTextField<Valores> name="titulo" label="Título" />
      <FormSelect<Valores>
        name="prioridade"
        label="Prioridade"
        placeholder="Selecione"
        options={[
          { value: 'Baixa', label: 'Baixa' },
          { value: 'Alta', label: 'Alta' },
        ]}
      />
      <FormActions submitLabel="Enviar" onCancel={onCancel} />
    </Form>
  );
}

describe('Form', () => {
  it('valida no cliente antes de enviar', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<FormularioExemplo onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Informe o título')).toBeInTheDocument();
    expect(screen.getByText('Escolha a prioridade')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia valores válidos', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithProviders(<FormularioExemplo onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: 'Título' }), 'Impressora');
    await user.click(screen.getByRole('combobox', { name: /prioridade/i }));
    await user.click(screen.getByRole('option', { name: 'Alta' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ titulo: 'Impressora', prioridade: 'Alta' }));
  });

  it('mostra erros de validação da API nos campos', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(400, { errors: { Titulo: ['Título duplicado'] } }));
    const { user } = renderWithProviders(<FormularioExemplo onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: 'Título' }), 'X');
    await user.click(screen.getByRole('combobox', { name: /prioridade/i }));
    await user.click(screen.getByRole('option', { name: 'Baixa' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Título duplicado')).toBeInTheDocument();
  });

  it('notifica outros erros', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new ApiError(409, { detail: 'Conflito de versão' }));
    const { user } = renderWithProviders(<FormularioExemplo onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: 'Título' }), 'X');
    await user.click(screen.getByRole('combobox', { name: /prioridade/i }));
    await user.click(screen.getByRole('option', { name: 'Baixa' }));
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(await screen.findByText('Conflito de versão')).toBeInTheDocument();
  });

  it('chama onCancel', async () => {
    const onCancel = vi.fn();
    const { user } = renderWithProviders(<FormularioExemplo onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });
});
