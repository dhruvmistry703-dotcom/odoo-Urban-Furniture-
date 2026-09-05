import React, { useState } from 'react';
import { DollarSign, ShoppingBag, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { ExpenseChart } from '../components/dashboard/ExpenseChart';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { QuickActionsGrid } from '../components/dashboard/QuickActionsGrid';
import { useData } from '../context/DataContext';

export const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('This Month (Sep 2026)');
  const { invoices, bills, contacts } = useData();

  // Compute live dashboard metrics from DataContext
  const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPurchases = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalReceivable = contacts.filter(c => c.type === 'customer' || c.type === 'both').reduce((sum, c) => sum + c.outstanding, 0);
  const totalPayable = contacts.filter(c => c.type === 'vendor' || c.type === 'both').reduce((sum, c) => sum + c.outstanding, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your business finances"
        action={
          <div className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 font-medium">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="This Month (Sep 2026)">This Month (Sep 2026)</option>
              <option value="Last Month (Aug 2026)">Last Month (Aug 2026)</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="FY 2026-27">FY 2026-27</option>
            </select>
          </div>
        }
      />

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          amount={totalSales}
          change="+12.5%"
          isPositive={true}
          comparisonText="from last month"
          icon={<DollarSign className="w-4 h-4" />}
        />
        <StatCard
          title="Total Purchases"
          amount={totalPurchases}
          change="+8.2%"
          isPositive={true}
          comparisonText="from last month"
          icon={<ShoppingBag className="w-4 h-4" />}
        />
        <StatCard
          title="Total Receivable"
          amount={totalReceivable}
          change="-3.4%"
          isPositive={false}
          comparisonText="from last month"
          icon={<ArrowDownLeft className="w-4 h-4" />}
        />
        <StatCard
          title="Total Payable"
          amount={totalPayable}
          change="-1.8%"
          isPositive={false}
          comparisonText="from last month"
          icon={<ArrowUpRight className="w-4 h-4" />}
        />
      </div>

      {/* Quick Actions Shortcuts */}
      <QuickActionsGrid />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart />
        </div>
        <div>
          <ExpenseChart />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <RecentTransactions />
    </div>
  );
};
