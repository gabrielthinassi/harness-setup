'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState title="Algo deu errado" description="Tente novamente em instantes." onRetry={reset} />;
}
