'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Mail, Moon, Sun } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('itemsPerPage', itemsPerPage.toString());
    localStorage.setItem('emailAlerts', emailAlerts.toString());
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    onClose();
  };

  return (
    <AnimatePresence mode="popLayout">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                    <Settings size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">System Settings</h3>
                    <p className="text-sm text-gray-600">Customize your experience</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Items Per Page */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Items Per Page</label>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-black focus:ring-0 transition-all"
                >
                  <option value={10}>10 items per page</option>
                  <option value={25}>25 items per page</option>
                  <option value={50}>50 items per page</option>
                  <option value={100}>100 items per page</option>
                </select>
                <p className="text-xs text-gray-500">Choose how many experts to display in the table</p>
              </div>

              {/* Email Notifications */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Notifications</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    id="email-alerts"
                    checked={emailAlerts} 
                    onChange={(e) => setEmailAlerts(e.target.checked)} 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="email-alerts" className="text-sm text-gray-700 cursor-pointer">
                    Send email notifications when new experts are added
                  </label>
                </div>
                <p className="text-xs text-gray-500">Get notified immediately when team members add new experts</p>
              </div>

              {/* Theme Toggle */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Appearance</label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">Light Mode</span>
                  </div>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">Dark Mode</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Choose your preferred color theme</p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
