
import React from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';

const SubscriptionGuard: React.FC = () => {
  const { t, theme } = useApp();

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className={`max-w-md w-full p-8 rounded-[2rem] border relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4 ${
        theme === 'dark' ? 'bg-[#0f0f11]/60 border-gray-800' : 'bg-white border-gray-100 shadow-2xl'
      } backdrop-blur-xl`}>
        
        {/* Decorative Gradients */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-xl shadow-purple-500/30 mb-2">
            <Lock className="w-10 h-10 text-white stroke-[1.5px]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">{t('subscribe_title')}</h2>
            <p className="text-gray-500 text-sm max-w-[280px] mx-auto leading-relaxed">
              {t('subscribe_desc')}
            </p>
          </div>

          <div className="space-y-3 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl text-left border border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Full Access to All CRM Features</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Multi-user Administrative Dashboard</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>WhatsApp Integration & Automated Receipts</span>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-2xl font-black mb-4 tracking-tighter">
              {t('price_month')}
            </p>
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-95 transition-all">
              {t('subscribe_now')}
            </button>
            <button className="mt-4 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionGuard;
