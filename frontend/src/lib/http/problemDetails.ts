/** RFC 9457 — formato de erro devolvido pela API .NET e pelo BFF. */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? `Erro ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** Erros de validação por campo, com o nome em camelCase (Titulo → titulo). */
  get fieldErrors(): Record<string, string> {
    return Object.fromEntries(
      Object.entries(this.problem.errors ?? {})
        .filter(([, mensagens]) => mensagens.length > 0)
        .map(([campo, mensagens]) => [camelCase(campo), mensagens[0] as string]),
    );
  }

  get isValidation(): boolean {
    return this.status === 400 && this.problem.errors !== undefined;
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let problem: ProblemDetails = {};
    try {
      problem = (await response.json()) as ProblemDetails;
    } catch {
      // corpo vazio ou não-JSON
    }
    return new ApiError(response.status, { ...problem, status: response.status });
  }
}

/** Mensagem amigável para exibir ao usuário a partir de qualquer erro. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    if (erro.status >= 500) {
      return 'Ocorreu um erro inesperado. Tente novamente em instantes.';
    }
    return erro.message;
  }
  return 'Não foi possível concluir a operação. Verifique sua conexão.';
}

function camelCase(campo: string): string {
  return campo
    .split('.')
    .map((parte) => parte.charAt(0).toLowerCase() + parte.slice(1))
    .join('.');
}
