import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Hammer, FileCheck, CreditCard, UserPlus, Armchair } from 'lucide-react';
import { Card } from '../ui/Card';

export const QuickActionsGrid: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'New Sales Order', path: '/sales-orders/new', icon: <ShoppingCart className="w-4 h-4 text-amber-700 dark:text-amber-400" /> },
    { label: 'Timber Purchase PO', path: '/purchase-orders/new', icon: <Hammer className="w-4 h-4 text-amber-700 dark:text-amber-400" /> },
    { label: 'New Tax Invoice', path: '/invoices/new', icon: <FileCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> },
    { label: 'Record Payment', path: '/payments/new', icon: <CreditCard className="w-4 h-4 text-slate-700 dark:text-slate-300" /> },
    { label: 'Add Client Contact', path: '/contacts/new', icon: <UserPlus className="w-4 h-4 text-slate-700 dark:text-slate-300" /> },
    { label: 'Add Furniture Item', path: '/products/new', icon: <Armchair className="w-4 h-4 text-amber-700 dark:text-amber-400" /> },
  ];

  return (
    <Card title="Furniture Workshop Quick Actions" subtitle="Shortcuts for daily carpentry & accounting operations">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/80 dark:border-navy-700/80 hover:bg-amber-50/50 dark:hover:bg-navy-800 hover:border-amber-400/50 transition-colors text-center group cursor-pointer"
          >
            <div className="p-2.5 rounded-xl bg-white dark:bg-navy-800 border border-slate-200/60 dark:border-navy-700/60 shadow-2xs mb-2">
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-800 dark:group-hover:text-amber-400">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};
