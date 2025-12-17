
import React, { useState, useMemo } from 'react';
import { MessageCircle, MoreHorizontal, UserPlus, ChevronDown } from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';
import { useApp } from '../App';
import { MoroccanLevel } from '../types';

const StudentTable: React.FC = () => {
  const { t, theme, language } = useApp();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
      const levelMatch = filterLevel === 'all' || s.level === filterLevel;
      const subjectMatch = filterSubject === 'all' || s.subject === filterSubject;
      const statusMatch = filterStatus === 'all' || s.status === filterStatus;
      return levelMatch && subjectMatch && statusMatch;
    });
  }, [filterLevel, filterSubject, filterStatus]);

  const levels: { category: string, items: MoroccanLevel[] }[] = [
    { category: 'primary', items: ['1AP', '2AP', '3AP', '4AP', '5AP', '6AP'] },
    { category: 'middle', items: ['1AC', '2AC', '3AC'] },
    { category: 'high', items: ['Tronc Commun', '1BAC', '2BAC'] }
  ];

  const subjects = Array.from(new Set(MOCK_STUDENTS.map(s => s.subject)));
  const statuses = ['Paid', 'Unpaid', 'Pending'];

  return (
    <div className="space-y-6">
      {/* Filtering Header */}
      <div className={`p-6 rounded-2xl border transition-all duration-300 ${
        theme === 'dark' ? 'bg-[#151518]/50 border-gray-800' : 'bg-white border-gray-100 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{t('students')}</h3>
            <p className="text-sm text-gray-500">Managing {filteredStudents.length} records</p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all">
            <UserPlus className="w-4 h-4 stroke-[2.5px]" />
            {t('new_student')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <select 
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                theme === 'dark' ? 'bg-[#0f0f11] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">{t('all_levels')}</option>
              {levels.map(cat => (
                <optgroup key={cat.category} label={t(cat.category)}>
                  {cat.items.map(l => (
                    <option key={l} value={l}>{t(l)}</option>
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
              className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                theme === 'dark' ? 'bg-[#0f0f11] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">{t('all_subjects')}</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative group">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full appearance-none px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                theme === 'dark' ? 'bg-[#0f0f11] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <option value="all">{t('all_statuses')}</option>
              {statuses.map(s => <option key={s} value={s}>{t(s.toLowerCase())}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className={`border rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${
        theme === 'dark' ? 'bg-[#0f0f11]/40 border-gray-800' : 'bg-white border-gray-100'
      }`}>
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
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-purple-500/5 transition-all group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-[11px] font-bold text-gray-500 group-hover:scale-110 transition-transform">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-500">{t(student.level)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-lg">
                      {student.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-mono">{student.phone}</span>
                      <a 
                        href={`https://wa.me/${student.phone.replace(/\+/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-500 p-1.5 rounded-lg hover:bg-green-500/10 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${
                      student.status === 'Paid' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : student.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {t(student.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-purple-500 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                    No results found for these filters.
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
