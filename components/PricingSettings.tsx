import React, { useState } from 'react';
import { useApp } from '../App';
import { PricingRule, MoroccanLevel } from '../types';
import { Plus, Trash2, Save, X, Edit2 } from 'lucide-react';

const PricingSettings: React.FC = () => {
    const { pricingRules, updatePricingRules, teachers, theme } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Omit<PricingRule, 'id'>>({
        subject: 'Maths',
        level: '2BAC',
        price: 0,
        teacherId: '',
        teacherName: ''
    });

    const subjects = ['Maths', 'Physics', 'PC', 'SVT', 'Anglais', 'Français', 'Arabe', 'Philo', 'H-G'];
    const levels: MoroccanLevel[] = [
        '1AP', '2AP', '3AP', '4AP', '5AP', '6AP',
        '1AC', '2AC', '3AC',
        'Tronc Commun', '1BAC', '2BAC'
    ];

    const handleSave = async () => {
        if (formData.price <= 0) {
            alert('Please enter a valid price');
            return;
        }

        const rule: PricingRule = {
            ...formData,
            id: editingId || Math.random().toString(36).substr(2, 9)
        };

        let updatedRules;
        if (editingId) {
            updatedRules = pricingRules.map(r => r.id === editingId ? rule : r);
        } else {
            updatedRules = [...pricingRules, rule];
        }

        await updatePricingRules(updatedRules);
        resetForm();
    };

    const handleEdit = (rule: PricingRule) => {
        setFormData({
            subject: rule.subject,
            level: rule.level,
            price: rule.price,
            teacherId: rule.teacherId || '',
            teacherName: rule.teacherName || ''
        });
        setEditingId(rule.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this pricing rule?')) {
            await updatePricingRules(pricingRules.filter(r => r.id !== id));
        }
    };

    const resetForm = () => {
        setFormData({
            subject: 'Maths',
            level: '2BAC',
            price: 0,
            teacherId: '',
            teacherName: ''
        });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleTeacherChange = (teacherId: string) => {
        const teacher = teachers.find(t => t.id === teacherId);
        setFormData({
            ...formData,
            teacherId,
            teacherName: teacher?.name || ''
        });
    };

    return (
        <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-[#151518] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Pricing Settings</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                    <Plus size={16} /> Add Pricing Rule
                </button>
            </div>

            {isAdding && (
                <div className="mb-6 p-4 border rounded-xl bg-gray-50 dark:bg-white/5 border-dashed border-gray-300 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Subject</label>
                            <select
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                className={`w-full p-2 rounded-lg border text-sm font-semibold ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                {subjects.map(s => (
                                    <option key={s} value={s} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white font-semibold' : 'bg-white text-gray-900 font-semibold'}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Level</label>
                            <select
                                value={formData.level}
                                onChange={e => setFormData({ ...formData, level: e.target.value as MoroccanLevel })}
                                className={`w-full p-2 rounded-lg border text-sm font-semibold ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                {levels.map(l => (
                                    <option key={l} value={l} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white font-semibold' : 'bg-white text-gray-900 font-semibold'}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Price (MAD)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className={`w-full p-2 rounded-lg border text-sm ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                placeholder="Enter price"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="text-xs text-gray-500 block mb-1">Teacher (Optional)</label>
                        <select
                            value={formData.teacherId}
                            onChange={e => handleTeacherChange(e.target.value)}
                            className={`w-full p-2 rounded-lg border text-sm font-semibold ${theme === 'dark' ? 'bg-[#1a1a1e] border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                            <option value="" className={theme === 'dark' ? 'bg-[#1a1a1e] text-white font-semibold' : 'bg-white text-gray-900 font-semibold'}>No teacher assigned</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id} className={theme === 'dark' ? 'bg-[#1a1a1e] text-white font-semibold' : 'bg-white text-gray-900 font-semibold'}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
                            <Save size={14} /> {editingId ? 'Update' : 'Save'}
                        </button>
                        <button onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm flex items-center gap-2">
                            <X size={14} /> Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-sm text-left">
                    <thead className={theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}>
                        <tr>
                            <th className="p-3">Subject</th>
                            <th className="p-3">Level</th>
                            <th className="p-3">Price (MAD)</th>
                            <th className="p-3">Teacher</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {pricingRules.length === 0 && (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-500">No pricing rules found. Add one to get started!</td></tr>
                        )}
                        {pricingRules.map(rule => (
                            <tr key={rule.id}>
                                <td className="p-3 font-medium">{rule.subject}</td>
                                <td className="p-3">{rule.level}</td>
                                <td className="p-3 font-bold text-purple-600 dark:text-purple-400">{rule.price} MAD</td>
                                <td className="p-3 text-gray-500">{rule.teacherName || '-'}</td>
                                <td className="p-3 text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleEdit(rule)} className="text-blue-500 hover:text-blue-700">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PricingSettings;
