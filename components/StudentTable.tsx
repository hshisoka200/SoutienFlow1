import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Filter, Trash2, Edit2, Download, Printer,
  ChevronDown, UserPlus, Save, X, Loader2, AlertCircle, MessageCircle
} from 'lucide-react';
import Select from 'react-select'; // Multi-select
import { useApp } from '../App';
import { Student, MoroccanLevel, Enrollment, Class } from '../types';
import { supabase } from '../lib/supabase';
import { generatePDF } from '../src/utils/generateReceipt';
import { getPriceForSubject } from '../src/constants/pricing';

interface StudentTableProps {
  profile?: any;
}

// Helper to parse subjects safely (Backwards compatibility)
const parseSubjects = (subj: string | string[]): string[] => {
  if (Array.isArray(subj)) return subj;
  if (!subj) return [];
  try {
    const parsed = JSON.parse(subj);
    // If it's an Enrollment[] (new format), map to subject names for display
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return parsed.map((e: any) => e.subject);
    }
    return Array.isArray(parsed) ? parsed : [subj];
  } catch {
    return [subj]; // Fallback for simple strings
  }
};

const StudentTable: React.FC<StudentTableProps> = ({ profile }) => {
  const { t, theme, refreshAlerts, teachers, pricingRules, classes, refreshClasses } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState<{
    name: string;
    level: MoroccanLevel;
    subjects: string[]; // Keep for the multi-select UI
    enrollments: Enrollment[]; // Structured data
    phone: string;
    status: 'Paid' | 'Unpaid' | 'Pending';
    discount: number;
    class_ids: string[]; // Use array for multiple classes
  }>({
    name: '',
    level: '1BAC',
    subjects: [],
    enrollments: [],
    phone: '',
    status: 'Pending',
    discount: 0,
    class_ids: []
  });

  const levels: { category: string, items: MoroccanLevel[] }[] = [
    { category: 'primary', items: ['1AP', '2AP', '3AP', '4AP', '5AP', '6AP'] },
    { category: 'middle', items: ['1AC', '2AC', '3AC'] },
    { category: 'high', items: ['Tronc Commun', '1BAC', '2BAC'] }
  ];

  const subjects = ['Maths', 'Physics', 'PC', 'SVT', 'Anglais', 'Français', 'Arabe', 'Philo', 'H-G'];

  // Helper function to find pricing rule
  const findPriceRule = (subject: string, level: MoroccanLevel) => {
    return pricingRules.find(rule => rule.subject === subject && rule.level === level);
  };

  const calculateTotal = () => {
    const subtotal = newStudent.enrollments.reduce((sum, e) => sum + (e.price || 0), 0);
    return Math.max(0, subtotal - newStudent.discount);
  };

  const statuses = ['Paid', 'Pending', 'Unpaid'] as const;

  // Auto-update prices when level changes
  useEffect(() => {
    if (newStudent.enrollments.length > 0) {
      const updatedEnrollments = newStudent.enrollments.map(enrollment => {
        const priceRule = findPriceRule(enrollment.subject, newStudent.level);
        if (priceRule) {
          return {
            ...enrollment,
            level: newStudent.level,
            price: priceRule.price,
            teacherId: priceRule.teacherId || enrollment.teacherId,
            teacherName: priceRule.teacherName || enrollment.teacherName
          };
        }
        return { ...enrollment, level: newStudent.level };
      });
      setNewStudent(prev => ({ ...prev, enrollments: updatedEnrollments }));
    }
  }, [newStudent.level]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLevel, filterSubject, filterStatus]);

  async function fetchStudents() {
    try {
      setLoading(true);
      // Fetch all students first, then filter client-side for subjects
      let query = supabase.from('students').select('*').order('created_at', { ascending: false });

      // Server-side filters for level and status
      if (filterLevel !== 'all') query = query.eq('level', filterLevel);
      if (filterStatus !== 'all') {
        // Map 'Pending' to 'pending' for database consistency
        const dbStatus = filterStatus.toLowerCase();
        query = query.eq('payment_status', dbStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Client-side filter for subjects (since stored as JSON array)
      if (filterSubject !== 'all') {
        filteredData = filteredData.filter(student => {
          const subjects = parseSubjects(student.subject);
          return subjects.some(s => s === filterSubject);
        });
      }

      setStudents(filteredData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStudent(e?: React.FormEvent) {
    // Prevent page reload
    if (e) e.preventDefault();

    if (!newStudent.name || !newStudent.phone || newStudent.enrollments.length === 0) {
      alert('Please fill all required fields and select at least one subject');
      return;
    }

    if (!profile || !profile.id) {
      alert('Profile not loaded. Please refresh the page and try again.');
      return;
    }

    try {
      const total = calculateTotal();

      // Prepare the student data with all required fields
      const studentData = {
        full_name: newStudent.name,
        level: newStudent.level,
        subject: JSON.stringify(newStudent.enrollments),
        phone: newStudent.phone,
        payment_status: newStudent.status.toLowerCase(),
        user_id: profile.id,  // Use profile.id
        discount: newStudent.discount,
        total_price: total,
        subjects_info: JSON.stringify(newStudent.enrollments),
        class_id: newStudent.class_ids // Send explicitly as array
      };

      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message || 'Unknown error'}`);
      }

      // Optimistically update local state - add new student to the list
      if (data) {
        setStudents(prev => [data as Student, ...prev]);

        // Generate PDF receipt with enrollment details
        generatePDF(
          {
            ...data,
            enrollments: newStudent.enrollments,
            discount: newStudent.discount
          },
          profile.center_name || 'مركز دعم تعليمي'
        );
      }

      // Refresh alerts silently
      await refreshAlerts();
      await refreshClasses(); // Refresh classes to update student counts

      // Close modal and reset form
      setShowAddForm(false);
      setNewStudent({
        name: '',
        level: '1BAC',
        subjects: [],
        enrollments: [],
        phone: '',
        status: 'Pending',
        discount: 0,
        class_ids: []
      });

      alert('Student added successfully!');
    } catch (error: any) {
      console.error('Error adding student:', error);
      alert(`Failed to add student: ${error.message || 'Unknown error occurred'}`);
    }
  }

  async function handleDelete(studentId: string) {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to delete students.');
        return;
      }

      console.log('Deleting student:', studentId);
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      // Update UI only after successful DB deletion
      setStudents(prev => prev.filter(s => s.id !== studentId));
      console.log('Student deleted successfully');
      refreshClasses(); // Refresh classes to update student counts
    } catch (error: any) {
      console.error('Error deleting student:', error);
      alert(`Error: ${error.message || 'Failed to delete student'}`);
    }
  }

  async function togglePaymentStatus(studentId: string, currentStatus: string) {
    // Toggle status
    const status = (currentStatus || 'Pending');
    const newStatus = status === 'Paid' ? 'Pending' : 'Paid';

    // Set paid_at only if new status is 'Paid'
    const newPaidAt = newStatus === 'Paid' ? new Date().toISOString() : null;

    // Optimistic UI update
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, payment_status: newStatus, paid_at: newPaidAt as any } : s
    ));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to update status.');
      }

      console.log(`Updating status for ${studentId} to ${newStatus}`);
      const { error } = await supabase
        .from('students')
        .update({
          payment_status: newStatus,
          paid_at: newPaidAt
        })
        .eq('id', studentId);

      if (error) throw error;
      console.log('Status updated successfully in DB');
      refreshAlerts();

    } catch (error: any) {
      console.error('Error updating payment status:', error);

      // Revert UI on error
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { ...s, payment_status: status } : s
      ));
      alert(`Failed to update status: ${error.message}`);
    }
  }

  const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1a1a1e' : 'white',
      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      color: theme === 'dark' ? 'white' : 'black',
      borderRadius: '0.75rem', // rounded-xl
      padding: '0.25rem', // py-1
      minHeight: '44px', // px-4 py-3 for input
      boxShadow: state.isFocused ? '0 0 0 2px rgba(168, 85, 247, 0.5)' : 'none', // focus:ring-purple-500/50
      '&:hover': {
        borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#4c1d95' : '#e0e7ff', // indigo-900/30 or indigo-100
      color: theme === 'dark' ? '#c7d2fe' : '#4338ca', // indigo-300 or indigo-700
      borderRadius: '9999px', // rounded-full
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#c7d2fe' : '#4338ca',
      fontSize: '0.75rem', // text-xs
      fontWeight: 'bold',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#a78bfa' : '#6366f1',
      '&:hover': {
        backgroundColor: theme === 'dark' ? '#6d28d9' : '#818cf8',
        color: 'white',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? (theme === 'dark' ? '#4c1d95' : '#e0e7ff')
        : state.isFocused
          ? (theme === 'dark' ? '#374151' : '#f3f4f6')
          : (theme === 'dark' ? '#1a1a1e' : 'white'),
      color: state.isSelected
        ? (theme === 'dark' ? '#c7d2fe' : '#4338ca')
        : (theme === 'dark' ? 'white' : 'black'),
      fontSize: '0.875rem', // text-sm
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? '#1a1a1e' : 'white',
      borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      borderRadius: '0.75rem',
      zIndex: 9999,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280', // placeholder-gray-500
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: theme === 'dark' ? 'white' : 'black',
    }),
  };

  const filteredClasses = classes.filter(cls => cls.active && cls.level === newStudent.level);

  return (
    <div className="space-y-6">
      {/* Filtering Header */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-[#151518]/50 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{t('students')}</h3>
            <p className="text-sm text-gray-500">Managing {students.length} records</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5px]" />
            {showAddForm ? 'Cancel' : t('new_student')}
          </button>
        </div>

        {/* Add Student Form */}
        {showAddForm && (
          <form onSubmit={handleAddStudent} className={`mb-8 p-6 rounded-2xl border border-dashed grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-gray-50/50 border-gray-200'}`}>
            <input
              placeholder="Full Name"
              value={newStudent.name || ''}
              onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
              className={`px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-black placeholder-gray-400'}`}
              required
            />
            <input
              placeholder="Phone (+212...)"
              value={newStudent.phone || ''}
              onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
              className={`px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-black placeholder-gray-400'}`}
              required
            />
            <div className="relative">
              <select
                value={newStudent.level || ''}
                onChange={e => setNewStudent({ ...newStudent, level: e.target.value as MoroccanLevel })}
                className={`w-full appearance-none px-4 py-3 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white' : 'bg-white border-gray-200 text-black'}`}
              >
                {levels.flatMap(l => l.items).map(l => (
                  <option key={l} value={l} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="col-span-full">
              <label className={`block text-xs font-black uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Select Classes (الاقسام)</label>
              <Select
                isMulti
                options={filteredClasses.map(c => ({
                  value: c.id,
                  label: `${c.class_name} - ${c.subject || 'N/A'} (${c.level || ''})`,
                  classObj: c
                }))}
                onChange={(selected: any) => {
                  const selectedClasses = selected.map((opt: any) => opt.classObj as Class);
                  const newEnrollments = selectedClasses.map(c => {
                    // Fetch real price from pricing rules since it's not on the class object
                    const priceRule = findPriceRule(c.subject, c.level as MoroccanLevel);
                    return {
                      subject: c.subject,
                      level: c.level,
                      price: priceRule ? priceRule.price : 0,
                      teacherId: c.teacher_id || (priceRule?.teacherId || ''),
                      teacherName: c.teacher_name || (priceRule?.teacherName || ''),
                      schedule: c.schedule_time
                    };
                  });

                  setNewStudent({
                    ...newStudent,
                    level: selectedClasses.length > 0 ? selectedClasses[0].level as MoroccanLevel : newStudent.level,
                    subjects: selectedClasses.map(c => c.subject),
                    enrollments: newEnrollments,
                    class_ids: selectedClasses.map(c => c.id) // Map all IDs
                  });
                }}
                styles={selectStyles}
                className="text-sm font-bold"
                classNamePrefix="select"
                placeholder={!newStudent.level ? "يرجى اختيار المستوى أولاً (Select level first)" : "Choose classes..."}
                noOptionsMessage={() => !newStudent.level
                  ? "يرجى اختيار المستوى أولاً (Please select a level first)"
                  : "لا توجد أقسام لهذا المستوى (No classes for this level)"
                }
              />
              {/* Show warnings for full classes */}
              <div className="mt-2 space-y-1">
                {classes.filter(c => newStudent.subjects.includes(c.subject) && c.current_students >= c.max_capacity).map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-wider">
                    <AlertCircle size={12} />
                    Class "{c.class_name}" is full ({c.current_students}/{c.max_capacity})
                  </div>
                ))}
              </div>
            </div>

            {/* Enrollments Configuration Table */}
            {newStudent.enrollments.length > 0 && (
              <div className="md:col-span-2 border rounded-xl overflow-hidden mt-2">
                <table className="w-full text-xs md:text-sm text-left">
                  <thead className={theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}>
                    <tr>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Price (MAD)</th>
                      <th className="p-2">Teacher</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {newStudent.enrollments.map((enrollment, idx) => (
                      <tr key={enrollment.subject} className={theme === 'dark' ? 'bg-[#1a1a1e]' : 'bg-white'}>
                        <td className="p-2 font-medium">{t(enrollment.subject)}</td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={enrollment.price || 0}
                            onChange={(e) => {
                              const updated = [...newStudent.enrollments];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setNewStudent({ ...newStudent, enrollments: updated });
                            }}
                            className={`w-20 p-1 rounded border outline-none ${theme === 'dark' ? 'bg-black/20 border-gray-700' : 'border-gray-300'}`}
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={enrollment.teacherId || ''}
                            onChange={(e) => {
                              const tID = e.target.value;
                              const teacher = teachers.find(t => t.id === tID);
                              const updated = [...newStudent.enrollments];
                              updated[idx].teacherId = tID;
                              updated[idx].teacherName = teacher?.name || '';
                              setNewStudent({ ...newStudent, enrollments: updated });
                            }}
                            className={`w-full p-1 rounded border outline-none ${theme === 'dark' ? 'bg-black/20 border-gray-700' : 'border-gray-300'}`}
                          >
                            <option value="">Select Teacher</option>
                            {teachers
                              .filter(t => t.subjects.includes(enrollment.subject) || t.subjects.length === 0)
                              .map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div>
              <label className={`text-xs font-black uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-black'}`}>Discount (MAD)</label>
              <input
                type="number"
                placeholder="0"
                value={newStudent.discount || 0}
                onChange={e => setNewStudent({ ...newStudent, discount: Number(e.target.value) })}
                className={`w-full p-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-800 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-black placeholder-gray-400'}`}
              />
            </div>

            <div className="md:col-span-2 bg-gray-50 dark:bg-white/5 p-4 rounded-xl flex justify-between items-center border border-gray-100 dark:border-gray-800">
              <div>
                <span className="block text-xs text-gray-500 uppercase tracking-wider">Subjects</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{newStudent.subjects.length} Selected</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Subtotal: {newStudent.enrollments.reduce((sum, e) => sum + (e.price || 0), 0)} MAD</div>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Total: {calculateTotal()} MAD
                </div>
              </div>
            </div>

            <button type="submit" className="md:col-span-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all font-bold text-sm">
              Save Student
            </button>
          </form>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${theme === 'dark' ? 'bg-[#0f0f11] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            >
              <option value="all" className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>{t('all_levels')}</option>
              {levels.map(cat => (
                <optgroup key={cat.category} label={t(cat.category)} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>
                  {cat.items.map(l => (
                    <option key={l} value={l} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>
                      {l}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${theme === 'dark' ? 'bg-[#0f0f11] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            >
              <option value="all" className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>{t('all_subjects')}</option>
              {subjects.map(s => (
                <option key={s} value={s} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${theme === 'dark' ? 'bg-[#0f0f11] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
            >
              <option value="all" className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>{t('all_statuses')}</option>
              {statuses.map(s => (
                <option key={s} value={s} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white' : 'bg-white text-gray-900'}>
                  {t(s)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-[#0f0f11]/40 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className={`${theme === 'dark' ? 'bg-white/5 border-gray-800' : 'bg-gray-50 border-gray-100'} border-b`}>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('name')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('level')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('subject')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('phone')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('status')}</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                      <span className="text-sm font-medium text-gray-500">Loading student data...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-purple-500/5 transition-all group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-[11px] font-bold text-gray-500 group-hover:scale-110 transition-transform">
                          {(student.full_name || student.name || 'S').split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-semibold">{student.full_name || student.name}</span>
                        {/* Display Classes Subtitle */}
                        {student.class_id && (
                          <div className="text-[10px] text-gray-400 font-medium">
                            {Array.isArray(student.class_id)
                              ? student.class_id.map(id => classes.find(c => c.id === id)?.class_name).filter(Boolean).join(', ')
                              : classes.find(c => c.id === student.class_id)?.class_name || ''
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-gray-500">{student.level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {parseSubjects(student.subject).map((subj, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {t(subj)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-mono">{student.phone}</span>
                        <a
                          href={`https://wa.me/${student.phone?.replace(/\+/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 p-1.5 rounded-lg hover:bg-green-500/10 transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePaymentStatus(student.id, student.payment_status || student.status || 'Pending')}
                        className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${(student.payment_status || student.status || 'Pending') === 'Paid'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'}`}
                        title="Click to toggle status"
                      >
                        {t((student.payment_status || student.status || 'Pending').toLowerCase())}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => generatePDF(student, profile?.center_name || 'مركزنا')}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Print Receipt"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;