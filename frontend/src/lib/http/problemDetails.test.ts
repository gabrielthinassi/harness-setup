import { jsonResponse } from '@/test/render';
import { ApiError, mensagemDeErro } from './problemDetails';

describe('ApiError', () => {
  it('converte erros de validação para camelCase e pega a primeira mensagem', () => {
    const erro = new ApiError(400, {
      title: 'Validacao',
      errors: { Titulo: ['Obrigatório', 'Outra'], 'Endereco.Cep': ['Inválido'], Vazio: [] },
    });

    expect(erro.isValidation).toBe(true);
    expect(erro.fieldErrors).toEqual({ titulo: 'Obrigatório', 'endereco.cep': 'Inválido' });
  });

  it('usa detail, depois title, depois o status como mensagem', () => {
    expect(new ApiError(409, { detail: 'Detalhe', title: 'Título' }).message).toBe('Detalhe');
    expect(new ApiError(409, { title: 'Título' }).message).toBe('Título');
    expect(new ApiError(418, {}).message).toBe('Erro 418');
  });

  it('cria a partir de uma resposta ProblemDetails', async () => {
    const erro = await ApiError.fromResponse(jsonResponse({ title: 'Não encontrado' }, 404));

    expect(erro.status).toBe(404);
    expect(erro.problem).toMatchObject({ title: 'Não encontrado', status: 404 });
    expect(erro.isValidation).toBe(false);
  });

  it('tolera corpo vazio', async () => {
    const erro = await ApiError.fromResponse(new Response(null, { status: 502 }));

    expect(erro.status).toBe(502);
    expect(erro.fieldErrors).toEqual({});
  });
});

describe('mensagemDeErro', () => {
  it('esconde detalhes de erros 5xx', () => {
    expect(mensagemDeErro(new ApiError(500, { detail: 'stack trace' }))).toMatch(/erro inesperado/i);
  });

  it('mostra a mensagem de erros 4xx', () => {
    expect(mensagemDeErro(new ApiError(409, { detail: 'Chamado já encerrado' }))).toBe(
      'Chamado já encerrado',
    );
  });

  it('trata falhas de rede', () => {
    expect(mensagemDeErro(new TypeError('Failed to fetch'))).toMatch(/conexão/i);
  });
});
