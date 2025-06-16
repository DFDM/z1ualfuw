'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppHeader } from '@/components/AppHeader';
import { SidebarNavigation } from '@/components/SidebarNavigation';
import { Loader2, Bot } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
        <SidebarHeader className="p-4 flex items-center gap-2">
           <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot size={24} />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-headline text-lg font-semibold">Calendar Bot</h2>
            {user && <p className="text-xs text-muted-foreground">{user.username}</p>}
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNavigation />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Footer content if any, like app version */}
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
