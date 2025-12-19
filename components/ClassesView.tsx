import React, { useState, useMemo } from 'react';
import {
  Calendar, Users, Plus, Clock, Save, X, Trash2, Edit2,
  AlertCircle, UserCheck, BookOpen, GraduationCap
} from 'lucide-react';
import { useApp } from '../App';
import { Class, MoroccanLevel, ScheduleEntry, PricingRule } from '../types';
import { supabase } from '../lib/supabase';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS: { [key: string]: string } = {
  'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
};

const formatSchedule = (scheduleRaw: string | ScheduleEntry[]): string => {
  if (!scheduleRaw) return 'No schedule';
  try {
    const schedule: ScheduleEntry[] = typeof scheduleRaw === 'string' ? JSON.parse(scheduleRaw) : scheduleRaw;
    if (!Array.isArray(schedule)) return String(scheduleRaw);
    return schedule.map(s => `${SHORT_DAYS[s.day] || s.day}: ${s.start}-${s.end}h`).join(' | ');
  } catch {
    return String(scheduleRaw);
  }
};

const getSubjectColor = (subject: string): string => {
  const s = subject.toLowerCase();
  if (s.includes('math')) return 'blue';
  if (s.includes('physic') || s.includes('pc')) return 'purple';
  if (s.includes('svt') || s.includes('scienc')) return 'green';
  if (s.includes('arab')) return 'emerald';
  if (s.includes('fran')) return 'indigo';
  if (s.includes('angl') || s.includes('en')) return 'sky';
  return 'gray';
};

const ClassesView: React.FC = () => {
  const { classes, refreshClasses, teachers, pricingRules, theme, t, profile } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Class>>({
    class_name: '',
    subject: '',
    level: '',
    max_capacity: 20,
    teacher_id: '',
    teacher_name: ''
  });

  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    { day: 'Monday', start: '16:00', end: '18:00' }
  ]);

  // Dynamic Subject & Level Fetching
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(pricingRules.map(r => r.subject)));
  }, [pricingRules]);

  const availableLevels = useMemo(() => {
    if (!formData.subject) return [];
    return pricingRules
      .filter(r => r.subject === formData.subject)
      .map(r => r.level);
  }, [formData.subject, pricingRules]);

  const addScheduleDay = () => {
    setSchedule([...schedule, { day: 'Monday', start: '16:00', end: '18:00' }]);
  };

  const removeScheduleDay = (index: number) => {
    if (schedule.length <= 1) return;
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const updateScheduleEntry = (index: number, updates: Partial<ScheduleEntry>) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], ...updates };
    setSchedule(newSchedule);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.level) {
      alert('Please select both a subject and a level from your pricing settings.');
      return;
    }

    setLoading(true);
    try {
      if (!profile?.id) throw new Error('User profile not loaded');

      // STRICT PAYLOAD: Matches user list exactly to fix PGRST204
      const payload = {
        user_id: profile.id,
        class_name: formData.class_name,
        subject: formData.subject,
        level: formData.level,
        teacher_id: formData.teacher_id || null,
        day: schedule[0]?.day || 'Unknown',
        schedule_time: JSON.stringify(schedule),
        max_capacity: formData.max_capacity,
        current_students: 0,
        active: true
      };

      console.log('Attempting to save class with STRICT payload:', payload);

      const { data, error } = await supabase.from('classes').insert([payload]).select();

      if (error) {
        console.error('Supabase Error Details:', error);
        throw new Error(`[Supabase Error] ${error.message} - ${error.details}`);
      }

      console.log('Class saved successfully:', data);
      alert('Class saved successfully!');

      // Temporary measure to ensure UI stays in sync
      window.location.reload();
    } catch (err: any) {
      console.error('Full Error Object:', err);
      alert(`Failed to save class: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      await refreshClasses();
    } catch (err: any) {
      console.error('Error deleting class:', err);
      alert(`Failed to delete class: ${err.message}`);
    }
  };

  const handleTeacherChange = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    setFormData({
      ...formData,
      teacher_id: id,
      teacher_name: teacher ? teacher.name : ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {t('classes')} (الاقسام)
          </h3>
          <p className="text-sm text-gray-500 font-medium">Manage groups, teaching assignments, and time slots.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Class
          </button>
        )}
      </div>

      {/* Add Form Modal/Section */}
      {isAdding && (
        <div className={`p-8 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-300 ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-white border-gray-200 shadow-xl'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Group</h4>
              <p className="text-xs text-gray-500">Configure your class details and weekly schedule.</p>
            </div>
            <button
              onClick={() => setIsAdding(false)}
              className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Class Name</label>
              <input
                placeholder="e.g. Maths Excellence Group"
                value={formData.class_name || ''}
                onChange={e => setFormData({ ...formData, class_name: e.target.value })}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400'}`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Subject</label>
              <select
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value, level: '' })}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}
                required
              >
                <option value="">Choose a subject...</option>
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Level</label>
              <select
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value })}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}
                disabled={!formData.subject}
                required
              >
                <option value="">{formData.subject ? 'Select level...' : 'First select a subject'}</option>
                {availableLevels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* Schedule Section */}
            <div className="col-span-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
                    <Clock size={16} />
                  </div>
                  <label className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Weekly Intervals</label>
                </div>
                <button
                  type="button"
                  onClick={addScheduleDay}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all border border-blue-100"
                >
                  <Plus size={14} />
                  Add Slot
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {schedule.map((entry, index) => (
                  <div key={index} className={`grid grid-cols-12 gap-4 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                    <div className="col-span-12 md:col-span-4">
                      <select
                        value={entry.day}
                        onChange={e => updateScheduleEntry(index, { day: e.target.value })}
                        className={`w-full p-2.5 rounded-lg border text-sm font-bold focus:outline-none ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                      >
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase">From</span>
                      <input
                        type="time"
                        value={entry.start}
                        onChange={e => updateScheduleEntry(index, { start: e.target.value })}
                        className={`w-full p-2.5 rounded-lg border text-sm font-bold focus:outline-none ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase">To</span>
                      <input
                        type="time"
                        value={entry.end}
                        onChange={e => updateScheduleEntry(index, { end: e.target.value })}
                        className={`w-full p-2.5 rounded-lg border text-sm font-bold focus:outline-none ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2 flex items-center justify-end">
                      {schedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduleDay(index)}
                          className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Assigned Teacher</label>
              <select
                value={formData.teacher_id}
                onChange={e => handleTeacherChange(e.target.value)}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}
              >
                <option value="">Unassigned (Pending)</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Max Capacity</label>
              <input
                type="number"
                value={formData.max_capacity}
                onChange={e => setFormData({ ...formData, max_capacity: Number(e.target.value) })}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white' : 'bg-white border-gray-300 text-black'}`}
                required
              />
            </div>

            <div className="md:col-start-3 flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[1.5] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-black hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : <><Save size={18} /> Deploy Group</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {classes.length === 0 && !isAdding && (
          <div className={`col-span-full p-24 text-center border-2 border-dashed rounded-[40px] ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200 bg-white shadow-sm'}`}>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 animate-bounce">
              <Plus className="text-white" size={40} />
            </div>
            <h4 className={`text-2xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Zero Groups Found</h4>
            <p className="text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">It looks empty here. Start building your schedule by creating your first educational group.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-8 py-3.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
            >
              Initialize First Class
            </button>
          </div>
        )}

        {classes.map((cls) => {
          const occupancy = (cls.current_students / cls.max_capacity) * 100;
          const isFull = cls.current_students >= cls.max_capacity;
          const color = getSubjectColor(cls.subject);

          return (
            <div key={cls.id} className={`group relative overflow-hidden rounded-[32px] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${theme === 'dark' ? 'bg-[#151518] border-gray-800 hover:border-gray-700 shadow-none' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/50'}`}>
              {/* Left Stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-2.5 transition-all duration-300 group-hover:w-3.5 bg-${color}-500 shadow-[2px_0_15px_rgba(0,0,0,0.1)]`} />

              <div className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex flex-col gap-1 pl-2">
                    <h4 className={`text-xl font-black tracking-tight leading-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{cls.class_name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                        {cls.subject}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400">•</span>
                      <span className="text-[11px] font-bold text-gray-400 capitalize">{cls.level}</span>
                    </div>
                  </div>
                  {isFull && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg shadow-red-500/30">
                      Full
                    </span>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Schedule Row */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-900 shadow-sm'}`}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Active Intervals</p>
                      <p className={`text-sm font-bold leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{formatSchedule(cls.schedule_time)}</p>
                    </div>
                  </div>

                  {/* Teacher Row */}
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:-rotate-12 ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-900 shadow-sm'}`}>
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Professor</p>
                      {cls.teacher_name ? (
                        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{cls.teacher_name}</p>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[11px] font-bold">
                          <AlertCircle size={10} /> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] font-black tracking-widest mb-2">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Group Density</span>
                      <span className={`px-2 py-0.5 rounded-lg font-bold ${occupancy > 85
                          ? 'bg-red-500/10 text-red-500'
                          : occupancy >= 50
                            ? 'bg-orange-500/10 text-orange-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                        {cls.current_students} / {cls.max_capacity}
                      </span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <div
                        className={`h-full transition-all duration-1000 ease-out rounded-full shadow-inner ${occupancy > 85
                            ? 'bg-gradient-to-r from-red-600 to-red-400'
                            : occupancy >= 50
                              ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                              : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          }`}
                        style={{ width: `${Math.min(occupancy, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100/50 dark:border-white/5 flex gap-3">
                  <button className={`flex-1 group/btn flex items-center justify-center gap-2 text-xs font-black py-3.5 rounded-2xl transition-all ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-100'}`}>
                    <GraduationCap className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
                    Attendance
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id)}
                    className={`px-4 py-3.5 rounded-2xl transition-all ${theme === 'dark' ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100'}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassesView;
