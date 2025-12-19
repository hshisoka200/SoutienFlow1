import React, { useState } from 'react';
import { useApp } from '../App';
import { Teacher } from '../types';
import { Plus, Trash2, Save, X } from 'lucide-react';
import Select from 'react-select';

const SUBJECTS_OPTIONS = ['Maths', 'Physics', 'PC', 'SVT', 'Anglais', 'Français', 'Arabe', 'Philo', 'H-G'].map(s => ({ value: s, label: s }));

const TeachersSettings: React.FC = () => {
    const { teachers, updateTeachers, theme } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newTeacher, setNewTeacher] = useState<Teacher>({
        id: '',
        name: '',
        subjects: [],
        phone: ''
    });

    const handleSave = async () => {
        if (!newTeacher.name) return;
        const teacher: Teacher = {
            ...newTeacher,
            id: Math.random().toString(36).substr(2, 9)
        };
        await updateTeachers([...teachers, teacher]);
        setIsAdding(false);
        setNewTeacher({ id: '', name: '', subjects: [], phone: '' });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this teacher?')) {
            await updateTeachers(teachers.filter(t => t.id !== id));
        }
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#1a1a1e' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
            '&:hover': { borderColor: theme === 'dark' ? '#4b5563' : '#9ca3af' }
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#1a1a1e' : '#ffffff',
            border: `1px solid ${theme === 'dark' ? '#374151' : '#d1d5db'}`
        }),
        option: (base: any, { isFocused, isSelected }: any) => ({
            ...base,
            backgroundColor: isSelected
                ? (theme === 'dark' ? '#3b82f6' : '#2563eb')
                : isFocused
                    ? (theme === 'dark' ? '#2d2d30' : '#f3f4f6')
                    : (theme === 'dark' ? '#1a1a1e' : '#ffffff'),
            color: isSelected
                ? '#ffffff'
                : (theme === 'dark' ? '#ffffff' : '#111827'),
            fontWeight: '600',
            '&:active': { backgroundColor: theme === 'dark' ? '#2563eb' : '#3b82f6' }
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: theme === 'dark' ? '#3b82f6' : '#dbeafe'
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#ffffff' : '#1e40af',
            fontWeight: '600'
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#ffffff' : '#1e40af',
            '&:hover': {
                backgroundColor: theme === 'dark' ? '#2563eb' : '#93c5fd',
                color: '#ffffff'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: theme === 'dark' ? '#ffffff' : '#111827'
        })
    };

    return (
        <div className={`p-6 rounded-2xl border shadow-sm ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Teachers Management</h3>
                    <p className="text-sm text-gray-500">Manage teachers and their assigned subjects</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus size={16} /> Add Teacher
                    </button>
                )}
            </div>

            {isAdding && (
                <div className={`mb-6 p-5 rounded-xl border border-dashed ${theme === 'dark' ? 'bg-white/5 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            placeholder="Teacher Name"
                            value={newTeacher.name}
                            onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                            className={`p-3 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                        <input
                            placeholder="Phone (Optional)"
                            value={newTeacher.phone}
                            onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                            className={`p-3 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-xs font-medium text-gray-500 block mb-2">Subjects Taught</label>
                        <Select
                            isMulti
                            options={SUBJECTS_OPTIONS}
                            onChange={(selected) => setNewTeacher({ ...newTeacher, subjects: selected.map(s => s.value) })}
                            styles={selectStyles}
                            className="text-sm"
                            placeholder="Select subjects..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <Save size={14} /> Save Teacher
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-600 transition-colors"
                        >
                            <X size={14} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className={`overflow-hidden rounded-xl border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                <table className="w-full text-sm">
                    <thead className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                        <tr>
                            <th className={`px-4 py-3 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                            <th className={`px-4 py-3 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Subjects</th>
                            <th className={`px-4 py-3 text-left font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                            <th className={`px-4 py-3 text-right font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-800' : 'divide-gray-200'}`}>
                        {teachers.length === 0 && (
                            <tr>
                                <td colSpan={4} className={`px-4 py-8 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                    No teachers found. Add one to get started!
                                </td>
                            </tr>
                        )}
                        {teachers.map(t => (
                            <tr key={t.id} className={theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'}>
                                <td className={`px-4 py-4 font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {t.name}
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                        {t.subjects.map(s => (
                                            <span
                                                key={s}
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${theme === 'dark' ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className={`px-4 py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {t.phone || '-'}
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300' : 'hover:bg-red-50 text-red-600 hover:text-red-700'}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeachersSettings;
