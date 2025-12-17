
import React, { useState, createContext, useContext, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import StudentTable from './components/StudentTable';
import PaymentsView from './components/PaymentsView';
import ClassesView from './components/ClassesView';
import BillingView from './components/BillingView';
import SubscriptionGuard from './components/SubscriptionGuard';
import { TabType, Language, Theme, Translations } from './types';
import { TRANSLATIONS } from './constants';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSubscribed: boolean;
  setIsSubscribed: (val: boolean) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('light');
  // Set to true by default for development purposes as requested
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true); 

  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  const renderContent = () => {
    if (!isSubscribed && activeTab !== 'billing') {
      return <SubscriptionGuard />;
    }

    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'students': return <StudentTable />;
      case 'payments': return <PaymentsView />;
      case 'classes': return <ClassesView />;
      case 'billing': return <BillingView />;
      default: return <DashboardView />;
    }
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, isSubscribed, setIsSubscribed, t }}>
      <div className={`flex min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0b] text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 flex flex-col min-w-0">
          <Header title={t(activeTab)} />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
