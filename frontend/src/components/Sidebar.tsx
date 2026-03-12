'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  LayoutGrid, 
  Layers, 
  Settings, 
  HelpCircle,
  LogOut,
  FolderDot,
  Send,
  BarChart3,
  Command,
  Search,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
}

function NavItem({ href, icon, label, badge, active }: NavItemProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-all duration-200 group relative text-sm font-medium",
        active 
          ? "bg-[rgba(255,255,255,0.08)] text-white shadow-sm" 
          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
      )}
    >
      <span className={cn(
        "transition-colors duration-200",
        active ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
      )}>
        {icon}
      </span>
      <span>{label}</span>
      {badge && (
        <span className="ml-auto bg-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700">
          {badge}
        </span>
      )}
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-[-8px] top-1.5 bottom-1.5 w-[2px] bg-white rounded-r-full"
        />
      )}
    </Link>
  );
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "fixed top-0 left-0 bottom-0 bg-[#09090b] flex flex-col z-[100] border-r border-white/5 transition-all duration-300",
      isCollapsed ? "w-16" : "w-[var(--sidebar-w)]"
    )}>
      {/* Brand Header */}
      <div className="p-7 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-black shadow-2xl shadow-white/10 group cursor-pointer transition-all hover:scale-105 active:scale-95">
            <Users size={20} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight font-jakarta">HASAMEX</h1>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none mt-1">Experts DB</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="absolute top-7 -right-3">
        <button
          onClick={onToggle}
          className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
        >
          {isCollapsed ? <Menu size={14} /> : <X size={14} />}
        </button>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto">
        {!isCollapsed && (
          <>
            <div className="space-y-1.5">
              <div className="px-3 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Management</div>
              <NavItem href="/overview" icon={<LayoutGrid size={18} />} label="System Overview" active={pathname === '/overview'} />
              <NavItem href="/experts" icon={<Users size={18} />} label="Expert Database" active={pathname.startsWith('/experts')} />
            </div>

            <div className="space-y-1.5">
              <div className="px-3 mb-3 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Platform</div>
              <NavItem href="/settings" icon={<Settings size={18} />} label="System Settings" active={pathname === '/settings'} />
            </div>
          </>
        )}

        {/* Collapsed Icons */}
        {isCollapsed && (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Link href="/overview" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <LayoutGrid size={18} className={pathname === '/overview' ? 'text-white' : 'text-zinc-500'} />
              </Link>
            </div>
            <div className="flex justify-center">
              <Link href="/experts" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Users size={18} className={pathname.startsWith('/experts') ? 'text-white' : 'text-zinc-500'} />
              </Link>
            </div>
            <div className="flex justify-center">
              <Link href="/settings" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Settings size={18} className={pathname === '/settings' ? 'text-white' : 'text-zinc-500'} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-5 border-t border-white/5 bg-white/[0.02]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-all group">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
              SK
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-zinc-100 truncate tracking-tight">Syamal Kishore</div>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Admin</div>
            </div>
            <LogOut size={14} className="text-zinc-600 group-hover:text-white transition-colors" />
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
              SK
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
