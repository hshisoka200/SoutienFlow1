
import React from 'react';
import { Search, Bell, Filter } from 'lucide-react';
import { useApp } from '../App';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { theme, t } = useApp();

  return (
    <header className={`h-20 px-8 flex items-center justify-between sticky top-0 z-40 transition-all duration-300
      ${theme === 'dark' ? 'bg-[#0a0a0b]/60 border-gray-800' : 'bg-gray-50/60 border-gray-200'}
      backdrop-blur-xl border-b`}>
      
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-black tracking-tight italic uppercase">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t('search')} 
            className={`pl-11 pr-4 py-2.5 text-sm transition-all w-72 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 border
              ${theme === 'dark' 
                ? 'bg-white/5 border-gray-800 placeholder-gray-600 text-white' 
                : 'bg-white border-gray-100 placeholder-gray-400'}`}
          />
        </div>
        <button className={`p-2.5 transition-all border rounded-xl hover:scale-105 active:scale-95
          ${theme === 'dark' ? 'border-gray-800 text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:text-black hover:bg-white shadow-sm'}`}>
          <Bell className="w-5 h-5 stroke-[1.5px]" />
        </button>
      </div>
    </header>
  );
};

export default Header;
