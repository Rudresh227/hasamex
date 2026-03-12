'use client';

import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-6"
      >
        <Construction size={40} />
      </motion.div>
      <h1 className="text-2xl font-bold font-jakarta tracking-tight text-gray-900">Module Under Construction</h1>
      <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
        We're working hard to bring you the full experience. This section will be available in the next release.
      </p>
      <Link href="/" className="btn-modern btn-modern-primary mt-8 px-6">
        Return to Dashboard
      </Link>
    </div>
  );
}
