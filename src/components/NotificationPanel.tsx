import React from 'react';
import { X, Bell, Calendar, User, Clock } from 'lucide-react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    expiredStudents: any[];
}

const NotificationPanel = ({ isOpen, onClose, expiredStudents }: NotificationPanelProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Overlay to close when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/5 z-[90]"
                    onClick={onClose}
                />
            )}

            <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-[#1a1a1e] shadow-2xl z-[100] border-l border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#151518]">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Bell className="text-amber-500" size={20} />
                            {expiredStudents.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            )}
                        </div>
                        <h2 className="font-bold dark:text-white">التنبيهات (متأخري الأداء)</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={20} className="dark:text-gray-400" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100vh-70px)]">
                    {expiredStudents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
                            <Clock size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">كل شيء محدث! لا يوجد متأخرون.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {expiredStudents.map((student) => (
                                <div key={student.id} className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-2xl hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                                            <User size={18} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold dark:text-white text-sm">{student.full_name}</p>
                                            <p className="text-xs text-gray-500">{student.level} - {student.subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-red-600 dark:text-red-400 font-semibold bg-red-100/50 dark:bg-red-500/10 p-2 rounded-lg">
                                        <Calendar size={12} />
                                        <span>مرت أكثر من 30 يوماً على آخر أداء</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
