
import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { MOCK_PAYMENTS } from '../constants';

const PaymentsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Payment Transactions</h3>
          <p className="text-sm text-gray-500">Monitor all financial movements and student tuition.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors rounded-sm">
          <Plus className="w-4 h-4" />
          Log Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 border border-gray-100 rounded-sm bg-white">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ArrowDownLeft className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Income (March)</span>
          </div>
          <p className="text-2xl font-bold">12,450 MAD</p>
        </div>
        <div className="p-4 border border-gray-100 rounded-sm bg-white">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ArrowUpRight className="w-4 h-4 text-red-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses (March)</span>
          </div>
          <p className="text-2xl font-bold">4,200 MAD</p>
        </div>
      </div>

      <div className="border border-gray-100 shadow-sm rounded-sm overflow-hidden bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_PAYMENTS.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">{payment.studentName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{payment.date}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold">{payment.amount} MAD</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-sm">
                    {payment.method}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100 rounded-sm">
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsView;
