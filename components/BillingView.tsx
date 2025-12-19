// @ts-nocheck
import React, { useState } from 'react';
import { CreditCard, Zap, Check, ShieldCheck, Building2, Save } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../lib/supabase';
import TeachersSettings from './TeachersSettings';
import PricingSettings from './PricingSettings';

const BillingView: React.FC = () => {
  const { theme, t, setIsSubscribed, isSubscribed, centerName, refreshProfile, user } = useApp();
  const [newCenterName, setNewCenterName] = useState(centerName);
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Upsert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, center_name: newCenterName });

      if (error) throw error;
      await refreshProfile();
      alert('Profile updated!');
    } catch (e) {
      console.error('Error updating profile:', e);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">

      {/* Teachers Settings Section */}
      <TeachersSettings />

      {/* Pricing Settings Section */}
      <PricingSettings />


      {/* Profile Settings Section */}
      <div className={`p-8 rounded-[2.5rem] border ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-white border-gray-200 shadow-lg'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Building2 size={24} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Center Settings</h3>
            <p className="text-gray-500 text-sm">Manage your center's identity for receipts</p>
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-500">Center Name</label>
            <input
              type="text"
              value={newCenterName}
              onChange={(e) => setNewCenterName(e.target.value)}
              placeholder="e.g. Al-Nour Academy"
              className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${theme === 'dark'
                ? 'bg-black/20 border-white/10 text-white focus:border-indigo-500'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 focus:bg-white'
                }`}
            />
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
          SoutienFlow Premium
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          The all-in-one management suite for growing Moroccan tutoring centers. Simple, high-end, and powerful.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className={`p-8 rounded-[2.5rem] border transition-all ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-white border-gray-200 shadow-xl'
          } ${isSubscribed ? 'opacity-60 scale-95' : 'ring-2 ring-purple-500'}`}>
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="px-3 py-1 bg-purple-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-2 inline-block">Pro Center</span>
              <h3 className="text-2xl font-bold">Standard Monthly</h3>
            </div>
            <Zap className="w-8 h-8 text-purple-500 fill-purple-500/20" />
          </div>

          <div className="mb-8">
            <span className="text-5xl font-black tracking-tighter">300</span>
            <span className="text-xl font-bold text-gray-400 ml-2">MAD/mo</span>
          </div>

          <ul className="space-y-4 mb-8">
            {['Unlimited Students', 'Automated WhatsApp Notifications', 'Expense Tracking', 'Attendance Management', 'Priority Support'].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                <Check className="w-5 h-5 text-green-500" />
                {feat}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setIsSubscribed(true)}
            disabled={isSubscribed}
            className={`w-full py-4 rounded-2xl font-bold transition-all ${isSubscribed
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl'
              }`}
          >
            {isSubscribed ? 'Active Subscription' : 'Upgrade to Pro'}
          </button>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 shrink-0 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Secure Payments</h4>
              <p className="text-sm text-gray-500">Processed by Morocco's leading payment gateways. Your data is encrypted and safe.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 shrink-0 bg-orange-500/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Instant Activation</h4>
              <p className="text-sm text-gray-500">The CRM is ready for use immediately after confirmation. No setup fees.</p>
            </div>
          </div>
          <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-4">
              <CreditCard className="w-5 h-5" />
              <h5 className="font-bold">Next Invoice</h5>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Estimated for April 1st</span>
              <span className="font-bold">300.00 MAD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;
