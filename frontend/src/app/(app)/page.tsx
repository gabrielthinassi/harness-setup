import { EmptyState, PageHeader } from '@/components/ui';

export default function InicioPage() {
  return (
    <>
      <PageHeader title="Início" description="Visão geral dos seus chamados." />
      <EmptyState title="Painel em construção" description="Os indicadores aparecerão aqui." />
    </>
  );
}
