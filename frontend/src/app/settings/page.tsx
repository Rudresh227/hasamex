'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Mail, Moon, Sun, Monitor, Bell, Shield, Database, Palette } from 'lucide-react';

export default function SettingsPage() {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Load settings from localStorage
  useEffect(() => {
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    const savedEmailAlerts = localStorage.getItem('emailAlerts');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedItemsPerPage) setItemsPerPage(Number(savedItemsPerPage));
    if (savedEmailAlerts) setEmailAlerts(savedEmailAlerts === 'true');
    if (savedTheme) setIsDark(savedTheme === 'dark');
  }, []);

  const handleSave = () => {
    localStorage.setItem('itemsPerPage', itemsPerPage.toString());
    localStorage.setItem('emailAlerts', emailAlerts.toString());
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Show success message
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={16} /> },
    { id: 'data', label: 'Data Management', icon: <Database size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
              <p className="text-sm text-gray-500">Manage your application preferences and configuration</p>
            </div>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                    
                    {/* Items Per Page */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Items Per Page</label>
                      <select 
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={10}>10 items per page</option>
                        <option value={25}>25 items per page</option>
                        <option value={50}>50 items per page</option>
                        <option value={100}>100 items per page</option>
                      </select>
                      <p className="text-xs text-gray-500">Choose how many experts to display in the table</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Email Notifications</div>
                          <div className="text-sm text-gray-500">Receive email alerts for new experts</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setEmailAlerts(!emailAlerts)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          emailAlerts ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            emailAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Theme</div>
                          <div className="text-sm text-gray-500">Choose your preferred color theme</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsDark(false)}
                          className={`px-3 py-2 rounded-lg border transition-all ${
                            !isDark 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <Sun size={16} />
                        </button>
                        <button
                          onClick={() => setIsDark(true)}
                          className={`px-3 py-2 rounded-lg border transition-all ${
                            isDark 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <Moon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h3>
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Security settings coming soon...</p>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                  <div className="text-center py-12">
                    <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Data management features coming soon...</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
