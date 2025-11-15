// Auto-generated lazy loading wrapper
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TokensInfoLazy = lazy(() => import('./TokensInfo'));

export default function TokensInfoWithSuspense(props: any) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    }>
      <TokensInfoLazy {...props} />
    </Suspense>
  );
}