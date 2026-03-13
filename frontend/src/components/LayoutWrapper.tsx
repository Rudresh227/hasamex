'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { cn } from '@/lib/utils';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname === '/login';

  // Hide sidebar on login and landing pages
  if (isLandingPage || isLoginPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className={cn(
        "flex-1 min-h-screen flex flex-col transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "ml-16" : "ml-[var(--sidebar-w)]"
      )}>
        <Topbar onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex-1 p-7 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
