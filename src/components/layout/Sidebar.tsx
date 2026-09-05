import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  Receipt,
  ShoppingCart,
  FileCheck,
  Building2,
  FileText,
  CreditCard,
  PieChart,
  Target,
  BarChart3,
  Scale,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Armchair,
  Hammer,
  Ruler,
  ShieldAlert,
  UserCheck2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    label: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { user } = useAuth();

  const role = (() => {
    const r = String(user?.role || '').toUpperCase();
    const e = String(user?.email || '').toLowerCase();
    if (r === 'CONTACT' || e.includes('customer')) return 'CONTACT';
    if (r === 'ADMIN' || e.includes('admin')) return 'ADMIN';
    return 'ACCOUNTANT';
  })();

  // Build role-specific navigation structure
  let navSections: NavSection[] = [];

  if (role === 'CONTACT') {
    // Strictly Contact Portal Navigation
    navSections = [
      {
        title: 'CLIENT PORTAL',
        items: [
          { label: 'My Invoices', path: '/my-invoices', icon: <FileCheck className="w-4 h-4 shrink-0 text-emerald-500" /> },
          { label: 'My Bills', path: '/my-bills', icon: <FileText className="w-4 h-4 shrink-0 text-blue-400" /> },
          { label: 'My Payments', path: '/my-payments', icon: <CreditCard className="w-4 h-4 shrink-0 text-amber-400" /> },
          { label: 'Client Profile', path: '/profile', icon: <UserCheck2 className="w-4 h-4 shrink-0 text-purple-400" /> },
        ],
      },
    ];
  } else {
    // Admin & Accountant Navigation
    navSections = [
      {
        items: [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
        ],
      },
      {
        title: 'MASTER DATA',
        items: [
          { label: 'Contacts & Clients', path: '/contacts', icon: <Users className="w-4 h-4 shrink-0" /> },
          { label: 'Products & Furniture', path: '/products', icon: <Package className="w-4 h-4 shrink-0" /> },
          { label: 'Chart of Accounts', path: '/accounts', icon: <BookOpen className="w-4 h-4 shrink-0" /> },
          { label: 'Journals', path: '/journals', icon: <Receipt className="w-4 h-4 shrink-0" /> },
          { label: 'Journal Entries', path: '/journal-entries', icon: <FileText className="w-4 h-4 shrink-0" /> },
        ],
      },
      {
        title: 'SALES & ORDERS',
        items: [
          { label: 'Sales Orders', path: '/sales-orders', icon: <ShoppingCart className="w-4 h-4 shrink-0" /> },
          { label: 'Customer Invoices', path: '/invoices', icon: <FileCheck className="w-4 h-4 shrink-0" /> },
        ],
      },
      {
        title: 'PROCUREMENT',
        items: [
          { label: 'Purchase Orders', path: '/purchase-orders', icon: <Building2 className="w-4 h-4 shrink-0" /> },
          { label: 'Vendor Bills', path: '/vendor-bills', icon: <FileText className="w-4 h-4 shrink-0" /> },
        ],
      },
      {
        title: 'FINANCE & WORKSHOP',
        items: [
          { label: 'Payments Register', path: '/payments', icon: <CreditCard className="w-4 h-4 shrink-0" /> },
          { label: 'Analytic Accounts', path: '/analytic-accounts', icon: <PieChart className="w-4 h-4 shrink-0" /> },
          { label: 'Budgets', path: '/budgets', icon: <Target className="w-4 h-4 shrink-0" /> },
        ],
      },
      {
        title: 'FINANCIAL REPORTS',
        items: [
          { label: 'Profit & Loss', path: '/reports/profit-loss', icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
          { label: 'Balance Sheet', path: '/reports/balance-sheet', icon: <Scale className="w-4 h-4 shrink-0" /> },
          { label: 'Budget Report', path: '/reports/budget', icon: <PieChart className="w-4 h-4 shrink-0" /> },
        ],
      },
    ];

    // Admin-only sections
    if (role === 'ADMIN') {
      navSections.push({
        title: 'SYSTEM ADMINISTRATION',
        items: [
          { label: 'User Management', path: '/users', icon: <ShieldAlert className="w-4 h-4 shrink-0 text-emerald-400" /> },
          { label: 'Settings', path: '/settings', icon: <SlidersHorizontal className="w-4 h-4 shrink-0" /> },
        ],
      });
    } else {
      // Accountant only gets Settings (no User Management)
      navSections.push({
        items: [
          { label: 'Settings', path: '/settings', icon: <SlidersHorizontal className="w-4 h-4 shrink-0" /> },
        ],
      });
    }
  }

  return (
    <aside
      className={`bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 flex flex-col h-full border-r border-slate-200 dark:border-navy-800 transition-all duration-300 select-none relative z-30 shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-navy-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-emerald-900/20 relative">
            <Armchair className="w-5 h-5" />
            <Hammer className="w-3.5 h-3.5 text-emerald-200 absolute -bottom-0.5 -right-0.5 bg-slate-900 p-0.5 rounded-full border border-emerald-500" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base leading-tight">
                Urban Furniture
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                {role === 'CONTACT' ? 'Client Portal' : 'CAD & Accounting'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Role Indicator Banner */}
      {!isCollapsed && (
        <div className="mx-3 mt-3 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800/80 border border-slate-200 dark:border-navy-700 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-semibold">Access Role:</span>
          <span
            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
              role === 'ADMIN'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : role === 'ACCOUNTANT'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {role}
          </span>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && !isCollapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1">
                {section.title}
              </h3>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border-l-4 border-emerald-600 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-navy-800 dark:hover:text-slate-200'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                {item.icon}
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-navy-800 shrink-0 hidden md:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
