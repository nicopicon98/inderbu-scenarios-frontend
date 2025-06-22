'use client';

import { AuthProvider } from '@/features/auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { getQueryClient } from '../api/query-client';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Get or create query client
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </AuthProvider>
    </QueryClientProvider>
  );
}
