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
} from 'lucide-react';

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
  const navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
      ],
    },
    {
      title: 'MASTER DATA',
      items: [
        { label: 'Contacts', path: '/contacts', icon: <Users className="w-5 h-5 shrink-0" /> },
        { label: 'Products', path: '/products', icon: <Package className="w-5 h-5 shrink-0" /> },
        { label: 'Chart of Accounts', path: '/accounts', icon: <BookOpen className="w-5 h-5 shrink-0" /> },
        { label: 'Journals', path: '/journals', icon: <Receipt className="w-5 h-5 shrink-0" /> },
      ],
    },
    {
      title: 'SALES',
      items: [
        { label: 'Sales Orders', path: '/sales-orders', icon: <ShoppingCart className="w-5 h-5 shrink-0" /> },
        { label: 'Customer Invoices', path: '/invoices', icon: <FileCheck className="w-5 h-5 shrink-0" /> },
      ],
    },
    {
      title: 'PURCHASES',
      items: [
        { label: 'Purchase Orders', path: '/purchase-orders', icon: <Building2 className="w-5 h-5 shrink-0" /> },
        { label: 'Vendor Bills', path: '/vendor-bills', icon: <FileText className="w-5 h-5 shrink-0" /> },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Payments', path: '/payments', icon: <CreditCard className="w-5 h-5 shrink-0" /> },
        { label: 'Analytic Accounts', path: '/analytic-accounts', icon: <PieChart className="w-5 h-5 shrink-0" /> },
        { label: 'Budgets', path: '/budgets', icon: <Target className="w-5 h-5 shrink-0" /> },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        { label: 'Profit & Loss', path: '/reports/profit-loss', icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
        { label: 'Balance Sheet', path: '/reports/balance-sheet', icon: <Scale className="w-5 h-5 shrink-0" /> },
        { label: 'Budget Report', path: '/reports/budget', icon: <PieChart className="w-5 h-5 shrink-0" /> },
      ],
    },
    {
      items: [
        { label: 'Settings', path: '/settings', icon: <SlidersHorizontal className="w-5 h-5 shrink-0" /> },
      ],
    },
  ];

  return (
    <aside
      className={`bg-navy-900 text-slate-300 flex flex-col h-full border-r border-navy-800 transition-all duration-300 select-none relative z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/30 shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-white tracking-wide text-base leading-snug">Urban Furniture</span>
              <span className="text-[11px] text-emerald-400 font-medium tracking-wider uppercase">Accounting ERP</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && !isCollapsed && (
              <h3 className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider uppercase mb-1.5">
                {section.title}
              </h3>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400 border-l-4 border-emerald-500 font-semibold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
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

      {/* Collapse Toggle Footer Button */}
      <div className="p-3 border-t border-navy-800 shrink-0 hidden md:block">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg bg-navy-800/80 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};
