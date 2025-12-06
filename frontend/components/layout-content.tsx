'use client';

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { ProtectedRoute } from '@/components/protected-route';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 pl-64">
          <AppHeader />
          <main className="mt-16 p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
