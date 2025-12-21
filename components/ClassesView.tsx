import React, { useState, useMemo } from 'react';
import {
  Calendar, Users, Plus, Clock, Save, X, Trash2, Edit2,
  AlertCircle, UserCheck, BookOpen, GraduationCap, Search, Filter, ChevronDown,
  Download, ArrowLeft, User as UserIcon, MessageCircle, Pencil, FileText
} from 'lucide-react';
import { useApp } from '../App';
import { Class, MoroccanLevel, ScheduleEntry, PricingRule, Student } from '../types';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeClass, setActiveClass] = useState<any>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  // Fetch all students to enable roster filtering
  React.useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      const { data, error } = await supabase
        .from('students')
        .select('*');
      if (error) throw error;
      setAllStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleExportPDF = (cls: Class, students: Student[]) => {
    const doc = new jsPDF();
    const centerName = profile?.center_name || 'SoutienFlow Center';
    const date = new Date().toLocaleDateString('fr-FR');

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text(centerName, 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Roster: ${cls.class_name}`, 105, 30, { align: 'center' });
    doc.text(`Level: ${cls.level} | Subject: ${cls.subject}`, 105, 37, { align: 'center' });
    doc.text(`Date: ${date}`, 105, 44, { align: 'center' });

    const tableData = students.map(s => [
      s.full_name || s.name || 'N/A',
      s.level || cls.level,
      s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : 'N/A',
      s.created_at ? new Date(s.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
    ]);

    (doc as any).autoTable({
      startY: 55,
      head: [['Student Name', 'Level', 'Enrolled Date', 'Time']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 55 }
    });

    doc.save(`Roster_${cls.class_name.replace(/\s+/g, '_')}.pdf`);
  };

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const [formData, setFormData] = useState<Partial<Class>>({
    class_name: '',
    subject: '',
    level: '',
    max_capacity: 20,
    teacher_id: '',
    teacher_name: '',
    whatsapp: ''
  });

  const [schedule, setSchedule] = useState<ScheduleEntry[]>([
    { day: 'Monday', start: '16:00', end: '18:00' }
  ]);

  // Dynamic Data for Form (from Pricing Settings)
  const formSubjects = useMemo(() => {
    return Array.from(new Set(pricingRules.map(r => r.subject)));
  }, [pricingRules]);

  const formLevels = useMemo(() => {
    if (!formData.subject) return [];
    return pricingRules
      .filter(r => r.subject === formData.subject)
      .map(r => r.level);
  }, [formData.subject, pricingRules]);

  // Dynamic Data for Filtering (from existing classes)
  const availableLevels = useMemo(() => [...new Set(classes.map(cls => cls.level))], [classes]);
  const availableSubjects = useMemo(() => [...new Set(classes.map(cls => cls.subject))], [classes]);

  // Filtering Logic
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchesSearch = cls.class_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === 'all' || cls.level === selectedLevel;
      const matchesSubject = selectedSubject === 'all' || cls.subject === selectedSubject;
      return matchesSearch && matchesLevel && matchesSubject;
    });
  }, [classes, searchTerm, selectedLevel, selectedSubject]);

  const updateScheduleEntry = (index: number, updates: Partial<ScheduleEntry>) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], ...updates };
    setSchedule(newSchedule);
  };

  const addScheduleDay = () => {
    setSchedule([...schedule, { day: 'Monday', start: '16:00', end: '18:00' }]);
  };

  const removeScheduleDay = (index: number) => {
    if (schedule.length <= 1) return;
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleEdit = (cls: Class) => {
    setFormData({
      class_name: cls.class_name,
      subject: cls.subject,
      level: cls.level as MoroccanLevel,
      max_capacity: cls.max_capacity,
      teacher_id: cls.teacher_id,
      teacher_name: cls.teacher_name,
      whatsapp: cls.whatsapp || ''
    });
    try {
      const scheduleData = typeof cls.schedule_time === 'string' ? JSON.parse(cls.schedule_time) : cls.schedule_time;
      setSchedule(Array.isArray(scheduleData) ? scheduleData : []);
    } catch {
      setSchedule([]);
    }
    setEditingId(cls.id);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.level) {
      alert('Please select both a subject and a level from your pricing settings.');
      return;
    }

    // Duplicate Check
    const isDuplicate = classes.some(c =>
      c.class_name === formData.class_name &&
      c.level === formData.level &&
      c.subject === formData.subject &&
      c.id !== editingId
    );

    if (isDuplicate) {
      alert('هذا القسم موجود بالفعل!');
      return;
    }

    setLoading(true);
    try {
      if (!profile?.id) throw new Error('User profile not loaded');

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
        active: true,
        whatsapp: formData.whatsapp
      };

      let result;
      if (isEditing && editingId) {
        result = await supabase.from('classes').update(payload).eq('id', editingId).select();
      } else {
        result = await supabase.from('classes').insert([payload]).select();
      }

      if (result.error) {
        console.error('Supabase Error Details:', result.error);
        throw new Error(`[Supabase Error] ${result.error.message}`);
      }

      console.log('Class saved successfully:', result.data);
      alert('Class saved successfully!');

      setIsAdding(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({ class_name: '', subject: '', level: '', max_capacity: 20, teacher_id: '', teacher_name: '', whatsapp: '' });
      await refreshClasses();
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
      {activeClass === null ? (
        <>
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

          {/* Advanced Filter Hub */}
          <div className={`p-4 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-[#151518]/50 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by class name... (بحث باسم الفوج)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${theme === 'dark' ? 'bg-[#0a0a0b] border-gray-800 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                />
              </div>

              {/* Level Filter */}
              <div className="relative group">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className={`w-full appearance-none pl-11 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0a0b] border-gray-800 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                >
                  <option value="all">All Levels (المستوى)</option>
                  {availableLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Subject Filter */}
              <div className="relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className={`w-full appearance-none pl-11 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${theme === 'dark' ? 'bg-[#0a0a0b] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="all">All Subjects (المادة)</option>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Add Form Modal/Section */}
          <div className={`p-8 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-300 ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-white border-gray-200 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {editingId ? 'تعديل القسم' : 'Create New Group'}
                </h4>
                <p className="text-xs text-gray-500">Configure your class details and weekly schedule.</p>
              </div>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ class_name: '', subject: '', level: '', max_capacity: 20, teacher_id: '', teacher_name: '', whatsapp: '' });
                }}
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
                  {formSubjects.map(s => <option key={s} value={s}>{s}</option>)}
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
                  {formLevels.map(l => <option key={l} value={l}>{l}</option>)}
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
                <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>WhatsApp Number</label>
                <input
                  placeholder="e.g. 0661234567"
                  value={formData.whatsapp || ''}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white placeholder-gray-600' : 'bg-white border-gray-300 text-black placeholder-gray-400'}`}
                />
              </div>

              <div className="md:col-start-3 flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[1.5] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-black hover:shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : <><Save size={18} /> {isEditing ? 'تحديث البيانات' : 'Deploy Group'}</>}
                </button>
              </div>
            </form>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.length === 0 && !isAdding && (
              <div className={`col-span-full p-24 text-center border-2 border-dashed rounded-[40px] ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200 bg-white shadow-sm'}`}>
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 animate-bounce">
                  <Plus className="text-white" size={40} />
                </div>
                <h4 className={`text-2xl font-black mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {classes.length === 0 ? 'Zero Groups Found' : 'لا توجد أقسام تطابق اختياراتك'}
                </h4>
                <p className="text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">
                  {classes.length === 0
                    ? "It looks empty here. Start building your schedule by creating your first educational group."
                    : "No classes match your current search and filter selection."}
                </p>
                {classes.length === 0 && (
                  <button
                    onClick={() => setIsAdding(true)}
                    className="px-8 py-3.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
                  >
                    Initialize First Class
                  </button>
                )}
              </div>
            )}

            {filteredClasses.map((cls) => {
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
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12 ${theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-900 shadow-sm'}`}>
                          <MessageCircle size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">WhatsApp Professor</p>
                          {cls.whatsapp ? (
                            <a
                              href={`https://wa.me/${cls.whatsapp.replace(/\+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                            >
                              Connect via WhatsApp
                            </a>
                          ) : (
                            <span className="text-xs text-gray-500 italic">No number set</span>
                          )}
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

                    <div className="mt-8 pt-6 border-t border-gray-100/50 dark:border-white/5 flex flex-col gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveClass(cls);
                        }}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg mt-4 z-50 relative font-bold text-sm transition-all active:scale-95"
                      >
                        عرض لائحة التلاميذ
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(cls)}
                          className={`flex-1 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-400/10' : 'text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100'}`}
                        >
                          <Edit2 size={18} />
                          <span className="text-xs font-bold uppercase">تعديل</span>
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
                          className={`flex-1 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-red-400 hover:bg-red-400/10' : 'text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100'}`}
                        >
                          <Trash2 size={20} />
                          <span className="text-xs font-bold uppercase">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0a0b] p-4 md:p-8 animate-in fade-in zoom-in duration-300">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveClass(null)}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 flex items-center gap-2 font-bold"
                >
                  <ArrowLeft size={20} />
                  ← العودة
                </button>
                <div>
                  <h3 className="text-3xl font-black text-white">{activeClass.class_name}</h3>
                  <p className="text-gray-500 font-medium">Class Roster & Student Details</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative group w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="البحث عن طريق الاسم..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                  />
                </div>
                <button
                  onClick={() => handleExportPDF(activeClass, allStudents.filter(s => {
                    const classIds = Array.isArray(s.class_id) ? s.class_id : (typeof s.class_id === 'string' ? [s.class_id] : []);
                    const matchesClass = classIds.includes(activeClass.id);
                    const matchesSearch = (s.full_name || s.name || '').toLowerCase().includes(studentSearchTerm.toLowerCase());
                    return matchesClass && matchesSearch;
                  }))}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95 whitespace-nowrap"
                >
                  <Download size={18} />
                  تحميل لائحة التلاميذ (PDF)
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: 'Total Enrolled', value: allStudents.filter(s => {
                    const classIds = Array.isArray(s.class_id) ? s.class_id : (typeof s.class_id === 'string' ? [s.class_id] : []);
                    return classIds.includes(activeClass.id);
                  }).length, icon: Users, color: 'blue'
                },
                {
                  label: 'Remaining Capacity', value: Math.max(0, activeClass.max_capacity - (allStudents.filter(s => {
                    const classIds = Array.isArray(s.class_id) ? s.class_id : (typeof s.class_id === 'string' ? [s.class_id] : []);
                    return classIds.includes(activeClass.id);
                  }).length)), icon: Clock, color: 'purple'
                },
                { label: 'Subject/Level', value: `${activeClass.subject} - ${activeClass.level}`, icon: GraduationCap, color: 'emerald' }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-[32px] bg-[#151518] border border-gray-800 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500`}>
                    <stat.icon size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-[40px] border border-gray-800 bg-[#151518] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-gray-800">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">الاسم (Name)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">المستوى (Level)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">التاريخ (Date)</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">الوقت (Time)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {allStudents.filter(s => {
                      const classIds = Array.isArray(s.class_id) ? s.class_id : (typeof s.class_id === 'string' ? [s.class_id] : []);
                      const matchesClass = classIds.includes(activeClass.id);
                      const matchesSearch = (s.full_name || s.name || '').toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesClass && matchesSearch;
                    }).length > 0 ? (
                      allStudents.filter(s => {
                        const classIds = Array.isArray(s.class_id) ? s.class_id : (typeof s.class_id === 'string' ? [s.class_id] : []);
                        const matchesClass = classIds.includes(activeClass.id);
                        const matchesSearch = (s.full_name || s.name || '').toLowerCase().includes(studentSearchTerm.toLowerCase());
                        return matchesClass && matchesSearch;
                      }).map((student) => (
                        <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <UserIcon size={20} />
                              </div>
                              <span className="text-sm font-bold text-white">{student.full_name || student.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold border border-gray-700">
                              {student.level}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-gray-300">
                              {student.created_at ? new Date(student.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-gray-300">
                              {student.created_at ? new Date(student.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
                              <Users size={40} />
                            </div>
                            <h4 className="text-xl font-bold text-white">No students enrolled in this group yet</h4>
                            <p className="text-gray-500 text-sm max-w-xs">Start adding students to this class through the Students panel.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesView;
