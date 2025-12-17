
import React from 'react';
import { TrendingUp, Users, CreditCard, Calendar } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_PAYMENTS } from '../constants';

const DashboardView: React.FC = () => {
  const stats = [
    { label: 'Total Students', value: MOCK_STUDENTS.length, icon: Users, change: '+12%', color: 'text-blue-600' },
    { label: 'Monthly Revenue', value: '2,400 MAD', icon: CreditCard, change: '+5.4%', color: 'text-green-600' },
    { label: 'Active Classes', value: '14', icon: Calendar, change: '0%', color: 'text-purple-600' },
    { label: 'Unpaid Balance', value: '1,200 MAD', icon: TrendingUp, change: '-2.1%', color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 border border-gray-100 rounded-sm shadow-sm bg-white hover:border-gray-200 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-sm bg-gray-50 group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <h4 className="text-2xl font-bold mb-1 tracking-tight">{stat.value}</h4>
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent Activities</h3>
            <button className="text-sm text-gray-500 hover:text-black">View all</button>
          </div>
          <div className="border border-gray-100 rounded-sm bg-white overflow-hidden divide-y divide-gray-50">
            {MOCK_PAYMENTS.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-sm bg-green-50 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{payment.studentName}</p>
                    <p className="text-xs text-gray-500">Payment via {payment.method} • {payment.date}</p>
                  </div>
                </div>
                <p className="text-sm font-bold">+{payment.amount} MAD</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Reminders</h3>
          <div className="p-6 border border-gray-100 rounded-sm bg-gray-50/50 space-y-4">
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Payment Follow-up</p>
                <p className="text-xs text-gray-500 mt-0.5">Contact Salma Bennani regarding outstanding March fees.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <div>
                <p className="text-sm font-medium">New Session Room 2</p>
                <p className="text-xs text-gray-500 mt-0.5">Confirm availability of Salle 2 for tomorrow's Physics class.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
