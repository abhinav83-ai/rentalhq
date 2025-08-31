
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from "@/context/data-context";
import { CartProvider } from "@/context/cart-context";
import { Zap } from "lucide-react";
import { CartIcon } from "@/components/public/cart-icon";

function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="px-4 lg:px-6 h-16 flex items-center bg-card border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <Zap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold font-headline">RentalHQ</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link href="/generators" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Generators
          </Link>
          <Link href="/reviews" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Reviews
          </Link>
          <Link href="/admin/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Admin Login
          </Link>
          <CartIcon />
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-card">
        <p className="text-xs text-muted-foreground">&copy; 2024 RentalHQ. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>RentalHQ</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DataProvider>
          <CartProvider>
            {isAdminRoute ? (
              children
            ) : (
              <PublicLayout>{children}</PublicLayout>
            )}
            <Toaster />
          </CartProvider>
        </DataProvider>
      </body>
    </html>
  );
}

    