"use client";

import { useState } from "react";
import type { AuthUser } from "@/features/auth/types/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/Toaster";

type AppShellProps = {
  children: React.ReactNode;
  user: AuthUser;
};

export function AppShell({ children, user }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
          <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
            <div className="app-content">
              <div className="app-content-inner">{children}</div>
            </div>
            <div className="md:hidden">
              <Footer />
            </div>
          </main>
          <div className="hidden shrink-0 md:block">
            <Footer />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
