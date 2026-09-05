import React, { useEffect, useState } from 'react';
import { Download, Target } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const BudgetReport: React.FC = () => {
  const { showToast } = useToast();
  const [reportItems, setReportItems] = useState<any[]>([]);

  useEffect(() => {
    api.getBudgetReport()
      .then(response => setReportItems(response.report.budgets.map((budget: any) => ({
        category: budget.analyticAccountName || budget.analyticAccountId?.name || budget.name,
        budget: budget.planned || 0,
        actual: budget.actual || 0,
        variance: (budget.planned || 0) - (budget.actual || 0),
      }))))
      .catch(error => showToast({ type: 'error', title: 'Unable to load Budget Report', message: error.message }));
  }, [showToast]);

  const handleExportPDF = () => {
    showToast({
      type: 'info',
      title: 'Exporting Budget vs Actual Report',
      message: 'Generating Budget_Variance_Report_Q3.pdf...',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget vs Actual Variance Report"
        subtitle="Performance tracking across expense categories and cost centers"
        action={
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>
            Export PDF
          </Button>
        }
        breadcrumbs={[{ label: 'Reports' }, { label: 'Budget Report' }]}
      />

      {/* Variance Bar Chart */}
      <Card title="Budget vs Actual Expense Comparison">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportItems} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="category" fontSize={11} stroke="#94a3b8" />
              <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(val: any) => [`₹${Number(val || 0).toLocaleString('en-IN')}`, '']} />
              <Legend />
              <Bar dataKey="budget" fill="#3B82F6" name="Planned Budget" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#16A34A" name="Actual Spend" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Report Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Expense Category</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Actual</th>
                <th className="px-4 py-3">Variance</th>
                <th className="px-4 py-3 min-w-[160px]">Utilization Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
              {reportItems.map(item => {
                const util = (item.actual / item.budget) * 100;
                return (
                  <tr key={item.category} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      {item.category}
                    </td>
                    <td className="px-4 py-3 font-bold">₹{item.budget.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">₹{item.actual.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        +₹{item.variance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>{util.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${util}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
