'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  ArrowRight, 
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsAuthenticated(loggedIn);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      window.location.replace('/login');
    }
  }, [mounted, isAuthenticated]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Users size={18} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-tighter text-lg font-jakarta">HASAMEX</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/experts" className="h-9 px-5 bg-black text-white rounded-xl text-[11px] font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/10">
              Launch App
              <ArrowRight size={14} />
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('user');
                window.location.replace('/login');
              }}
              className="h-9 px-5 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60 -z-10" />
        <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] opacity-40 -z-10" />

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-gray-500">
              The Next Generation of Expert Intelligence
            </span>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 font-jakarta">
              Access the Worlds <br />
              <span className="text-zinc-400">Elite Talent Network.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-medium mb-12">
              The premier database for connecting with global subject matter experts. 
              Streamlined management, verified intelligence, and real-time insights.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/experts" className="h-14 px-10 bg-black text-white rounded-2xl text-sm font-bold flex items-center gap-3 hover:bg-zinc-800 transition-all shadow-2xl shadow-black/20 group">
                Enter Expert Database
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="h-14 px-10 bg-white border border-gray-200 text-black rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
                Explore Network
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
