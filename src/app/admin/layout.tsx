
"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin') {
      router.replace('/admin/login');
    }
  }, [pathname, router]);

  // Render children, but for /admin path it will quickly redirect.
  // This prevents rendering content for a path that is about to change.
  if (pathname === '/admin') {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
