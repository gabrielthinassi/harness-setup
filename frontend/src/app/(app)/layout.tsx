import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout';
import { getSession } from '@/lib/auth/session';

/** Toda rota dentro de (app) exige sessão válida (validação real, não só a presença do cookie). */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  return <AppShell user={session.user}>{children}</AppShell>;
}
