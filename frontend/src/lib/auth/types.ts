export type SessionUser = {
  id: string;
  nome: string;
  email: string;
  tenantId: string;
};

export type Session = {
  /** Token da API .NET. Fica só no servidor (cookie criptografado); nunca vai para o navegador. */
  accessToken: string;
  /** Epoch em milissegundos. */
  expiresAt: number;
  user: SessionUser;
};
