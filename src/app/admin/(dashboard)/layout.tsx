
"use client";

import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LifeBuoy, LogOut, Zap, Home } from "lucide-react";
import { NavLinks } from "@/components/admin/nav-links";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      router.replace('/admin/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    router.push('/admin/login');
  };
  
  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
         <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
      </div>
    );
  }

  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
               <Zap className="w-8 h-8 text-primary" />
               <h1 className="text-xl font-headline font-semibold">RentalHQ</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
              <NavLinks />
          </SidebarContent>
          <SidebarFooter>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex justify-start items-center gap-3 w-full h-14 px-3">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src="https://picsum.photos/100" alt="Admin User" data-ai-hint="person" />
                              <AvatarFallback>AU</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                              <p className="font-semibold text-sm">Admin User</p>
                              <p className="text-xs text-muted-foreground">admin@rentalhq.com</p>
                          </div>
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Admin User</p>
                          <p className="text-xs leading-none text-muted-foreground">
                          admin@rentalhq.com
                          </p>
                      </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                          <LifeBuoy className="mr-2 h-4 w-4" />
                          <span>Support</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex items-center justify-between h-16 px-6 border-b bg-card">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <div className="hidden md:block">
                <h2 className="text-2xl font-headline font-semibold">Dashboard</h2>
              </div>
              <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/">
                      <Home />
                      <span>Go to Home</span>
                    </Link>
                  </Button>
              </div>
          </header>
          <main className="p-4 md:p-6 lg:p-8">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
