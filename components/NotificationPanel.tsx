import React from 'react';
import { X, Bell, Calendar, User } from 'lucide-react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    expiredStudents: any[];
}

const NotificationPanel = ({ isOpen, onClose, expiredStudents }: NotificationPanelProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#1a1a1e] shadow-2xl z-50 border-l border-gray-200 dark:border-gray-800 transform transition-transform">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bell className="text-amber-500" size={20} />
                    <h2 className="font-bold dark:text-white">التنبيهات</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <X size={20} className="dark:text-gray-400" />
                </button>
            </div>

            <div className="p-4 overflow-y-auto h-[calc(100vh-70px)]">
                {expiredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
                        <Bell size={40} className="mb-2 opacity-20" />
                        <p>لا توجد تنبيهات حالياً</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {expiredStudents.map((student) => (
                            <div key={student.id} className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                        <User size={14} className="text-red-600" />
                                    </div>
                                    <span className="font-bold dark:text-white text-sm">{student.full_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-medium">
                                    <Calendar size={12} />
                                    <span>انتهت صلاحية الدفع (30 يوم)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
