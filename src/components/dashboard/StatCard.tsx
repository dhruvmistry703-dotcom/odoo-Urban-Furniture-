import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  amount: number;
  change: string; // e.g. "+12.5%"
  isPositive: boolean;
  comparisonText: string; // e.g. "from last month"
  icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  change,
  isPositive,
  comparisonText,
  icon,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-navy-700/80 text-emerald-600 dark:text-emerald-400">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ₹{amount.toLocaleString('en-IN')}
        </h3>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md ${
            isPositive
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {change}
        </span>
        <span className="text-slate-500 dark:text-slate-400">{comparisonText}</span>
      </div>
    </Card>
  );
};
