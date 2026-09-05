import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { expenseBreakdownData } from '../../data/mockData';

export const ExpenseChart: React.FC = () => {
  const totalExpense = expenseBreakdownData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title="Expense Breakdown" subtitle="Operating costs overview">
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={expenseBreakdownData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {expenseBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Amount']}
              contentStyle={{ borderRadius: '12px', border: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Expense</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
            ₹{(totalExpense / 100000).toFixed(2)}L
          </span>
        </div>
      </div>

      <div className="space-y-2 mt-2 pt-3 border-t border-slate-100 dark:border-navy-700/60">
        {expenseBreakdownData.map(item => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              ₹{item.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
