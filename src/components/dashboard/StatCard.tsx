import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  amount: number;
  change: string; // e.g. "+12.5%"
  isPositive: boolean;
  comparisonText: string;
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
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-navy-700/80 text-slate-600 dark:text-slate-300">
          {icon}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          ₹{amount.toLocaleString('en-IN')}
        </h3>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span
          className={`inline-flex items-center font-semibold px-2 py-0.5 rounded text-[11px] ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1 shrink-0" /> : <TrendingDown className="w-3 h-3 mr-1 shrink-0" />}
          {change}
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{comparisonText}</span>
      </div>
    </Card>
  );
};
