import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../ui/Card';
import { cashFlowTrendData } from '../../data/mockData';

export const CashFlowChart: React.FC = () => {
  const [filter, setFilter] = useState<'7d' | '30d' | '3m' | '1y'>('30d');

  const filterOptions: { label: string; value: '7d' | '30d' | '3m' | '1y' }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '3 Months', value: '3m' },
    { label: '1 Year', value: '1y' },
  ];

  return (
    <Card
      title="Cash Flow Overview"
      subtitle="Inflow vs Outflow over time"
      action={
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-900 p-1 rounded-lg">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filter === opt.value
                  ? 'bg-white dark:bg-navy-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-72 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cashFlowTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, '']}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="Inflow"
              stroke="#16A34A"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#inflowGrad)"
            />
            <Area
              type="monotone"
              dataKey="Outflow"
              stroke="#EF4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#outflowGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-navy-700/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Cash Inflow (Sales & Receipts)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Cash Outflow (Purchases & Expenses)</span>
        </div>
      </div>
    </Card>
  );
};
