import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import StudentTable from './components/StudentTable';
import PaymentsView from './components/PaymentsView';
import ClassesView from './components/ClassesView';
import BillingView from './components/BillingView';
import SubscriptionGuard from './components/SubscriptionGuard';
import NotificationPanel from './src/components/NotificationPanel';
import LandingPage from './src/pages/LandingPage';
import { LoginPage, SignupPage } from './src/pages/AuthPages';
import { TabType, Language, Theme, Alert, Teacher, PricingRule, Class } from './types';
import { TRANSLATIONS } from './constants';
import { Loader2 } from 'lucide-react';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isSubscribed: boolean;
  t: (key: string) => string;
  user: any;
  expiredStudents: any[];
  setIsNotifyOpen: (open: boolean) => void;
  refreshAlerts: () => void;
  centerName: string;
  refreshProfile: () => Promise<void>;
  profile: any;
  teachers: Teacher[];
  updateTeachers: (teachers: Teacher[]) => Promise<void>;
  pricingRules: PricingRule[];
  updatePricingRules: (rules: PricingRule[]) => Promise<void>;
  classes: Class[];
  refreshClasses: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Protected Logic Wrapper
const ProtectedDashboard = () => {
  const { user, isSubscribed, theme, t, expiredStudents, setIsNotifyOpen, profile } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  if (!user) return <Navigate to="/login" replace />;

  const renderContent = () => {
    // Admin or Subscriber Check
    if (!isSubscribed) {
      if (activeTab === 'billing') return <BillingView />;
      return <SubscriptionGuard />;
    }

    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'students': return <StudentTable profile={profile} />;
      case 'payments': return <PaymentsView />;
      case 'classes': return <ClassesView />;
      case 'billing': return <BillingView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0a0a0b] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNotifications={() => setIsNotifyOpen(true)}
        notificationCount={expiredStudents.length}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <Header title={t(activeTab)} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');
  const [user, setUser] = useState<any>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Notification State
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [expiredStudents, setExpiredStudents] = useState<any[]>([]);

  // Profile State
  const [centerName, setCenterName] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        setCenterName(data.center_name || ''); // Keep centerName for backward compatibility if needed
        // Load teachers and pricing rules from metadata if exists
        const metadata = data.school_metadata || {};
        if (metadata.teachers && Array.isArray(metadata.teachers)) {
          setTeachers(metadata.teachers);
        } else {
          setTeachers([]); // Ensure teachers state is cleared if no data
        }
        if (metadata.pricingRules && Array.isArray(metadata.pricingRules)) {
          setPricingRules(metadata.pricingRules);
        } else {
          setPricingRules([]);
        }
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
      } else {
        setClasses(data || []);
      }
    } catch (err) {
      console.error('Fetch classes error:', err);
    }
  };

  const updateTeachers = async (newTeachers: Teacher[]) => {
    try {
      setTeachers(newTeachers); // Optimistic update
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        alert('You must be logged in to save teachers.');
        return;
      }

      // Optimistic update local profile state for immediate UI reflection
      const newMetadata = { ...(profile?.school_metadata || {}), teachers: newTeachers };
      setProfile((prev: any) => ({ ...prev, school_metadata: newMetadata }));

      const { error } = await supabase
        .from('profiles')
        .update({ school_metadata: newMetadata })
        .eq('id', user.id);

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Refresh profile to sync in case of other changes or to confirm
      await fetchProfile();
      console.log('Teachers saved successfully!');
    } catch (err: any) {
      console.error('Error updating teachers:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      alert(`Failed to save teachers list.\n\nError: ${errorMessage}\n\nPlease ensure the 'school_metadata' column exists in your profiles table.`);
      // Revert optimistic update if error occurs
      await fetchProfile();
    }
  };

  const updatePricingRules = async (newRules: PricingRule[]) => {
    try {
      setPricingRules(newRules); // Optimistic update
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        alert('You must be logged in to save pricing rules.');
        return;
      }

      // Optimistic update local profile state for immediate UI reflection
      const newMetadata = { ...(profile?.school_metadata || {}), pricingRules: newRules };
      setProfile((prev: any) => ({ ...prev, school_metadata: newMetadata }));

      const { error } = await supabase
        .from('profiles')
        .update({ school_metadata: newMetadata })
        .eq('id', user.id);

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      // Refresh profile to sync
      await fetchProfile();
      console.log('Pricing rules saved successfully!');
    } catch (err: any) {
      console.error('Error updating pricing rules:', err);
      const errorMessage = err?.message || 'Unknown error occurred';
      alert(`Failed to save pricing rules.\n\nError: ${errorMessage}`);
      // Revert optimistic update if error occurs
      await fetchProfile();
    }
  };

  useEffect(() => {
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscription(session.user);
        checkExpirations(session.user);
        fetchProfile();
        fetchClasses();
      } else {
        setLoading(false);
        setProfile(null);
        setTeachers([]);
        setClasses([]);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkSubscription(session.user);
        checkExpirations(session.user);
        fetchProfile();
        fetchClasses();
      } else {
        setLoading(false);
        setProfile(null);
        setTeachers([]);
        setClasses([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkExpirations(currentUser: any) {
    if (!currentUser) return;

    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('payment_status', 'paid')
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching students for expiration check:', error);
        return;
      }

      if (!students) return;

      const now = new Date();
      const expired = students.filter((s: any) => {
        if (!s.paid_at) return false;
        const paidDate = new Date(s.paid_at);
        const diffTime = now.getTime() - paidDate.getTime();
        const diffDays = diffTime / (1000 * 3600 * 24);
        return diffDays >= 30;
      });

      setExpiredStudents(expired);
    } catch (e) {
      console.error('Error checking expirations:', e);
    }
  }


  async function checkSubscription(currentUser: any) {
    try {
      // Admin Bypass
      if (currentUser.email === 'hshisoka84@gmail.com') {
        setIsSubscribed(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', currentUser.id)
        .single();

      setIsSubscribed(data?.status === 'active');
    } catch (e) {
      console.error('Sub check error', e);
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        language, setLanguage, theme, setTheme, isSubscribed, t, user,
        expiredStudents,
        setIsNotifyOpen,
        refreshAlerts: () => checkExpirations(user),
        centerName,
        refreshProfile: fetchProfile,
        profile,
        teachers,
        updateTeachers,
        pricingRules,
        updatePricingRules,
        classes,
        refreshClasses: fetchClasses
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <NotificationPanel
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
        expiredStudents={expiredStudents}
      />
    </AppContext.Provider>
  );
};

export default App;