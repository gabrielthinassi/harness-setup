import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui';
import { ChamadosList } from '@/features/chamados';

export const metadata: Metadata = { title: 'Chamados' };

export default function ChamadosPage() {
  return (
    <>
      <PageHeader title="Chamados" description="Acompanhe os chamados da sua organização." />
      <ChamadosList />
    </>
  );
}
