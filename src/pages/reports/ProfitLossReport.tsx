import React, { useState } from 'react';
import { Download, Calendar, BarChart3 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ProfitLossReport: React.FC = () => {
  const { invoices, bills, accounts } = useData();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('01 Sep 2026 — 30 Sep 2026');

  // Compute live revenue and expenses from Accounts / Invoices / Bills
  const salesRevenue = invoices.reduce((s, i) => s + i.subtotal, 0);
  const otherIncome = 25000;
  const totalIncome = salesRevenue + otherIncome;

  const rawMaterialExpense = bills.reduce((s, b) => s + b.subtotal, 0);
  const salaryExpense = accounts.find(a => a.code === '5002')?.balance || 125000;
  const rentExpense = accounts.find(a => a.code === '5003')?.balance || 45000;
  const freightExpense = accounts.find(a => a.code === '5004')?.balance || 70000;

  const totalExpenses = rawMaterialExpense + salaryExpense + rentExpense + freightExpense;
  const netProfit = totalIncome - totalExpenses;

  const chartData = [
    { category: 'Furniture Sales', Income: salesRevenue, Expense: 0 },
    { category: 'Other Services', Income: otherIncome, Expense: 0 },
    { category: 'Raw Materials', Income: 0, Expense: rawMaterialExpense },
    { category: 'Factory Salary', Income: 0, Expense: salaryExpense },
    { category: 'Showroom Rent', Income: 0, Expense: rentExpense },
    { category: 'Freight & Logistics', Income: 0, Expense: freightExpense },
  ];

  const handleExportPDF = () => {
    showToast({
      type: 'info',
      title: 'Exporting Profit & Loss Statement',
      message: 'Generating P_and_L_Report_Sep_2026.pdf...',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle={dateRange}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="01 Sep 2026 — 30 Sep 2026">01 Sep 2026 — 30 Sep 2026</option>
                <option value="01 Aug 2026 — 31 Aug 2026">01 Aug 2026 — 31 Aug 2026</option>
                <option value="Q3 FY 2026-27">Q3 FY 2026-27</option>
              </select>
            </div>
            <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>
              Export PDF
            </Button>
          </div>
        }
        breadcrumbs={[{ label: 'Reports' }, { label: 'Profit & Loss' }]}
      />

      {/* Visual Comparison Chart */}
      <Card title="Income vs Operating Expenses Breakdown">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="category" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, 'Amount']} />
              <Bar dataKey="Income" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Financial P&L Statement Card */}
      <Card className="p-8 max-w-4xl mx-auto border-2 border-slate-200 dark:border-navy-700">
        <div className="text-center pb-6 border-b border-slate-200 dark:border-navy-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Urban Furniture Systems Pvt Ltd
          </h2>
          <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Statement of Profit and Loss
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">For the period ending {dateRange}</p>
        </div>

        <div className="py-6 space-y-6 text-sm">
          {/* INCOME SECTION */}
          <div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase border-b border-emerald-200 dark:border-emerald-800 pb-1 mb-2 flex justify-between">
              <span>INCOME & REVENUE</span>
              <span>Amount (₹)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Furniture Sales Revenue</span>
                <span className="font-mono">₹{salesRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Assembly & Service Income</span>
                <span className="font-mono">₹{otherIncome.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-navy-700 text-sm">
                <span>TOTAL INCOME</span>
                <span className="font-mono text-emerald-600">₹{totalIncome.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* EXPENSE SECTION */}
          <div>
            <div className="font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase border-b border-rose-200 dark:border-rose-800 pb-1 mb-2 flex justify-between">
              <span>OPERATING EXPENSES</span>
              <span>Amount (₹)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Raw Material & Timber Purchase Expense</span>
                <span className="font-mono">₹{rawMaterialExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Factory & Office Salary Expense</span>
                <span className="font-mono">₹{salaryExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Showroom & Workshop Rent Expense</span>
                <span className="font-mono">₹{rentExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span>Logistics & Freight Overhead</span>
                <span className="font-mono">₹{freightExpense.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-navy-700 text-sm">
                <span>TOTAL EXPENSES</span>
                <span className="font-mono text-rose-600">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* NET PROFIT HIGHLIGHT */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                NET OPERATING PROFIT
              </span>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                Income after deducting all raw material and operating overheads
              </p>
            </div>
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              ₹{netProfit.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
