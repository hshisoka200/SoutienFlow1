import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  Settings,
  Plus,
  Moon,
  Sun,
  Globe,
  Lock,
  LogOut,
  Bell
} from 'lucide-react';
import { TabType } from '../types';
import { useApp } from '../App';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNotifications: () => void;
  notificationCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenNotifications, notificationCount }) => {
  const { theme, setTheme, language, setLanguage, t, isSubscribed } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'students', label: t('students'), icon: Users },
    { id: 'payments', label: t('payments'), icon: CreditCard },
    { id: 'classes', label: t('classes'), icon: BookOpen },
    { id: 'billing', label: t('billing'), icon: Settings },
  ];

  return (
    <aside className={`w-64 flex flex-col h-screen sticky top-0 transition-all duration-300 z-50
      ${theme === 'dark'
        ? 'bg-[#0f0f11]/80 backdrop-blur-xl border-gray-800'
        : 'bg-white/80 backdrop-blur-xl border-gray-100'} 
      border-r`}>

      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center rounded-lg shadow-lg shadow-purple-500/20">
            <span className="text-white font-bold text-sm tracking-widest">SF</span>
          </div>
          <h1 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            SoutienFlow
          </h1>
        </div>

        {/* Alarm Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-black'} transition-colors`}
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0f0f11]">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = !isSubscribed && item.id !== 'billing';

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all duration-300 rounded-xl group relative overflow-hidden
                ${isActive
                  ? (theme === 'dark'
                    ? 'bg-purple-600/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)] border border-purple-500/20'
                    : 'bg-purple-50 text-purple-600 border border-purple-100')
                  : (theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-50')
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 stroke-[1.5px] ${isActive ? 'text-purple-500 animate-pulse' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </div>
              {isLocked && <Lock className="w-3 h-3 text-gray-500" />}
              {isActive && (
                <div className="absolute inset-y-0 left-0 w-1 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 group
            ${theme === 'dark'
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-bold">Logout</span>
        </button>

        <div className="flex items-center justify-between bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setTheme('light')}
            className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white shadow-sm text-yellow-500' : 'text-gray-500'}`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-[#1a1a1c] shadow-sm text-purple-400' : 'text-gray-500'}`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setLanguage('fr')}
            className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${language === 'fr' ? 'bg-white dark:bg-[#1a1a1c] text-blue-500 shadow-sm' : 'text-gray-500'}`}
          >
            FR
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${language === 'ar' ? 'bg-white dark:bg-[#1a1a1c] text-green-500 shadow-sm' : 'text-gray-500'}`}
          >
            AR
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
