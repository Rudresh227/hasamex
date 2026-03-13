'use client';

import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.replace('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all"
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
