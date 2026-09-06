import React, { useEffect, useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { exportProfitLossPdf } from '../../utils/reportPdf';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ProfitLossReport: React.FC = () => {
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('2026-09-01|2026-09-30');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const displayDateRange = dateRange.replace('|', ' — ');

  const loadReport = () => {
    setLoading(true);
    setError('');
    const [from, to] = dateRange.split('|');
    api.getProfitLoss({ from, to })
      .then(response => {
        if (response && response.report) {
          setReport(response.report);
        } else {
          setReport(response);
        }
      })
      .catch(error => {
        const message = error.message || 'The report API is unavailable.';
        setError(message);
        showToast({ type: 'error', title: 'Unable to load Profit & Loss', message });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading financial report from MongoDB...</div>;
  if (!report) return (
    <div className="p-8 space-y-3">
      <p className="text-sm text-rose-600">The financial report could not be loaded.</p>
      {error && <p className="text-xs text-slate-500">{error}</p>}
      <Button variant="outline" onClick={loadReport}>Retry</Button>
    </div>
  );

  const salesRevenue = report.totalIncome || 0;
  const totalIncome = report.totalIncome || 0;
  const totalExpenses = report.totalExpense || 0;
  const netProfit = report.netProfit || 0;
  const billsList = report.bills || [];
  const rawMaterialExpense = billsList.reduce((sum: number, bill: any) => sum + (bill.subtotal || 0), 0);
  const otherIncome = report.otherIncome || 0;
  const expenseAccounts = report.expenseAccounts || [];
  const operatingExpenseAccounts = expenseAccounts.filter((account: any) => (account.balance || 0) > 0);

  const chartData = [
    { category: 'Customer Invoices', Income: salesRevenue, Expense: 0 },
    { category: 'Other Income', Income: otherIncome, Expense: 0 },
    { category: 'Vendor Bills', Income: 0, Expense: rawMaterialExpense },
    ...operatingExpenseAccounts.map((account: any) => ({ category: account.name, Income: 0, Expense: account.balance || 0 })),
  ];

  const handleExportPDF = () => {
    exportProfitLossPdf(report, displayDateRange);
    showToast({
      type: 'info',
      title: 'Exporting Profit & Loss Statement',
      message: 'Profit & Loss PDF downloaded.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profit & Loss Statement"
        subtitle={displayDateRange}
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <select
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="2026-09-01|2026-09-30">01 Sep 2026 — 30 Sep 2026</option>
                <option value="2026-08-01|2026-08-31">01 Aug 2026 — 31 Aug 2026</option>
                <option value="2026-07-01|2026-09-30">Q3 FY 2026-27</option>
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
          <p className="text-xs text-slate-400 mt-0.5">For the period ending {dateRange.replace('|', ' — ')}</p>
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
                <span>Account-based operating expenses</span>
                <span className="font-mono">₹{expenseAccounts.reduce((sum: number, account: any) => sum + (account.balance || 0), 0).toLocaleString('en-IN')}</span>
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
