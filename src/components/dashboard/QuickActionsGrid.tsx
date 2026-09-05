import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Building2, FileCheck, CreditCard, UserPlus, PackagePlus } from 'lucide-react';
import { Card } from '../ui/Card';

export const QuickActionsGrid: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'New Sales Order', path: '/sales-orders/new', icon: <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'New Purchase Order', path: '/purchase-orders/new', icon: <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
    { label: 'New Invoice', path: '/invoices/new', icon: <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
    { label: 'Record Payment', path: '/payments/new', icon: <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" /> },
    { label: 'Add Contact', path: '/contacts/new', icon: <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" /> },
    { label: 'Add Product', path: '/products/new', icon: <PackagePlus className="w-5 h-5 text-rose-600 dark:text-rose-400" /> },
  ];

  return (
    <Card title="Quick Actions" subtitle="Shortcuts for daily accounting operations">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map(action => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200/60 dark:border-navy-700/60 hover:bg-slate-100 dark:hover:bg-navy-700 hover:border-slate-300 dark:hover:border-navy-600 transition-all text-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-navy-800 shadow-xs group-hover:scale-110 transition-transform mb-2">
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};
