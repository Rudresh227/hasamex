'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowUpRight, 
  Plus, 
  Activity, 
  Globe, 
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardOverview() {
  const activities = [
    { title: 'New expert joined from UK', time: '12m ago', icon: <Users size={12} /> },
    { title: 'Project "Titan Blue" completed', time: '1h ago', icon: <Activity size={12} /> },
    { title: 'Global reach updated to 45 countries', time: '4h ago', icon: <Globe size={12} /> },
  ];

  return (
    <AuthGuard>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-jakarta tracking-tight text-zinc-900">System Overview</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-[0.2em] leading-none">Real-time database performance and metrics</p>
        </div>
        <div className="flex gap-2">
           <button className="h-9 px-4 rounded-xl border border-gray-100 bg-white text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all">
             Report Settings
           </button>
           <Link href="/experts/new" className="h-9 px-4 rounded-xl bg-black text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 group">
             <Plus size={14} className="group-hover:rotate-90 transition-transform" />
             Quick Add
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Stats & Chart Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div className="p-8 rounded-3xl bg-zinc-900 text-white shadow-2xl shadow-black/20 border border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Active Pool</span>
                  <div className="p-1.5 rounded-lg bg-white/10">
                    <TrendingUp size={12} />
                  </div>
                </div>
                <div className="text-5xl font-bold font-jakarta tracking-tighter relative z-10">1,240</div>
                <div className="mt-4 text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 relative z-10">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   +12.5% Growth this month
                </div>
             </div>
             
             <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xs flex flex-col justify-between group hover:border-black/5 transition-all">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Global Presence</span>
                  <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400">
                    <Globe size={12} />
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-bold font-jakarta tracking-tighter text-zinc-900">42</div>
                  <div className="mt-4 text-[10px] font-bold text-gray-400 tracking-[0.1em] uppercase">Active Regions worldwide</div>
                </div>
             </div>
          </div>

          <div className="p-12 rounded-3xl bg-gray-50/50 border border-gray-100 border-dashed text-center">
             <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Activity size={24} />
             </div>
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-[0.2em]">Live Expert Distribution</h3>
             <p className="text-[11px] text-gray-400 mt-2 font-medium">Connect to the analytics engine to visualize real-time network flow</p>
          </div>
        </div>

        {/* Right Column - Activity & More */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl shadow-xs overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-[#fcfcfc] flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Activity Feed</span>
              <button className="text-[10px] font-bold text-black hover:underline uppercase tracking-widest">View History</button>
            </div>
            <div className="p-6 space-y-6 flex-1">
              {activities.map((act, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                    {act.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-gray-800 leading-tight group-hover:text-black transition-colors">{act.title}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{act.time}</div>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-gray-200 group-hover:text-gray-400 transition-colors" />
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-50">
               <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black transition-all shadow-lg shadow-black/10">
                 Refresh Real-time Logs
               </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </AuthGuard>
  );
}
