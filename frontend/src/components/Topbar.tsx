'use client';

import { Bell, Command, ChevronRight, Plus, ExternalLink, Search, Menu, Settings, LogOut, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearch } from '../lib/store';
import { useState } from 'react';
import SettingsModal from './modals/SettingsModal';

interface TopbarProps {
  onSidebarToggle?: () => void;
}

export default function Topbar({ onSidebarToggle }: TopbarProps) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { query, setQuery } = useSearch();
  
  return (
    <>
      <div className="h-[52px] bg-white border-b border-gray-100 flex items-center px-6 gap-6 sticky top-0 z-[40]">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Hasamex</span>
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Search Bar - Moved to Right */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search database..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-8.5 w-[320px] rounded-xl border border-gray-100 bg-gray-50/50 px-9 text-[11px] font-bold outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 focus:bg-white transition-all tracking-tight"
           />
          {/* <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-30 group-focus-within:opacity-10 transition-opacity">
              <span className="text-[10px] font-bold border border-gray-300 rounded px-1">⌘</span>
              <span className="text-[10px] font-bold border border-gray-300 rounded px-1">K</span>
           </div> */}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Primary Action */}
        <Link 
          href="/experts/new" 
          className="h-8.5 px-4 rounded-xl bg-black text-white text-[11px] font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 active:scale-95"
        >
          <Plus size={14} strokeWidth={3} />
          <span>New Profile</span>
        </Link>
        
        {/* Settings Button */}
        {/* <button 
          onClick={() => setSettingsModalOpen(true)}
          className="h-8.5 px-3 rounded-xl border border-gray-200 text-gray-600 hover:text-black hover:bg-gray-50 transition-all flex items-center gap-2"
          title="System Settings"
        >
          <Settings size={14} strokeWidth={2} />
        </button> */}
        
        {/* <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-black transition-all">
          <ExternalLink size={14} />
        </button> */}
      </div>
    </div>
    
    {/* Settings Modal */}
    <SettingsModal 
      isOpen={settingsModalOpen}
      onClose={() => setSettingsModalOpen(false)}
    />
    </>
  );
}
