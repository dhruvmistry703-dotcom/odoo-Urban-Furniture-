import React from 'react';

export type BadgeVariant =
  | 'paid'
  | 'pending'
  | 'partially_paid'
  | 'overdue'
  | 'draft'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'posted'
  | 'active'
  | 'inactive'
  | 'customer'
  | 'vendor'
  | 'both';

interface BadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, className = '' }) => {
  const norm = (variant || status.toLowerCase().replace(' ', '_')) as BadgeVariant;

  const styles: Record<string, string> = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
    posted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800/60',
    
    pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60',
    partially_paid: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/60',
    
    overdue: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60',
    exceeded: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60',
    
    draft: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-700',
    inactive: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-700',
    
    customer: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/60',
    vendor: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60',
    both: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800/60',
  };

  const badgeStyle = styles[norm] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-slate-300';
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${badgeStyle} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 mr-1.5" />
      {label}
    </span>
  );
};
