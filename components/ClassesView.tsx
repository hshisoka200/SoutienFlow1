
import React from 'react';
import { Calendar, Users, MapPin, Plus, Clock } from 'lucide-react';
import { MOCK_CLASSES } from '../constants';

const ClassesView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Session Schedules</h3>
          <p className="text-sm text-gray-500">Track current and upcoming tutoring sessions.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-sm">
          <Plus className="w-4 h-4" />
          Schedule Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_CLASSES.map((cls) => (
          <div key={cls.id} className="border border-gray-100 p-6 rounded-sm bg-white hover:border-gray-200 hover:shadow-sm transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold tracking-tight">{cls.subject}</h4>
                <p className="text-sm text-gray-500">{cls.teacher}</p>
              </div>
              <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-sm text-[10px] font-bold text-gray-400">
                {cls.day.toUpperCase()}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{cls.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{cls.room}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{cls.studentsCount} Students Enrolled</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-50">
              <button className="w-full text-sm font-medium py-2 border border-gray-100 rounded-sm hover:bg-gray-50 hover:border-gray-200 transition-all">
                View Attendance
              </button>
            </div>
          </div>
        ))}

        <div className="border border-dashed border-gray-200 p-6 rounded-sm flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">Add New Session</p>
          <p className="text-xs text-gray-400 mt-1">Define teacher, subject and room</p>
        </div>
      </div>
    </div>
  );
};

export default ClassesView;
