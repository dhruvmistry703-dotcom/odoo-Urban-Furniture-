import React, { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const BudgetsList: React.FC = () => {
  const { budgets, analyticAccounts, addBudget } = useData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [anaId, setAnaId] = useState(analyticAccounts[0]?.id || '');
  const [period, setPeriod] = useState('Jul 2026 - Sep 2026');
  const [planned, setPlanned] = useState(500000);

  const totalPlanned = budgets.reduce((sum, b) => sum + b.planned, 0);
  const totalActual = budgets.reduce((sum, b) => sum + b.actual, 0);
  const totalRemaining = totalPlanned - totalActual;
  const overallUtilization = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const ana = analyticAccounts.find(a => a.id === anaId);

    const newB = addBudget({
      name,
      analyticAccountId: anaId,
      analyticAccountName: ana ? ana.name : 'General Operations',
      period,
      planned: Number(planned),
    });

    showToast({
      type: 'success',
      title: 'Budget Created',
      message: `Budget ${newB.name} initialized for ${newB.planned.toLocaleString('en-IN')}.`,
    });

    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        subtitle="Operational budget planning and expenditure variance monitoring"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Create Budget
          </Button>
        }
      />

      {/* 4 Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Planned Budget</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalPlanned.toLocaleString('en-IN')}
          </h3>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Expenditure</span>
          <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            ₹{totalActual.toLocaleString('en-IN')}
          </h3>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Buffer</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalRemaining.toLocaleString('en-IN')}
          </h3>
        </Card>
        <Card>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Utilization</span>
          <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {overallUtilization.toFixed(1)}%
          </h3>
        </Card>
      </div>

      {/* Budget Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Budget Title</th>
                <th className="px-4 py-3">Analytic Account</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Planned</th>
                <th className="px-4 py-3">Actual</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3 min-w-[160px]">Utilization</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {budgets.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    {b.name}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{b.analyticAccountName}</td>
                  <td className="px-4 py-3 text-slate-500">{b.period}</td>
                  <td className="px-4 py-3 font-bold">₹{b.planned.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold text-blue-600">₹{b.actual.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">₹{b.remaining.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>{b.utilization.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            b.utilization > 100
                              ? 'bg-rose-500'
                              : b.utilization > 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, b.utilization)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Budget">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Budget Name"
            required
            placeholder="e.g. Q4 Workshop & Machinery Maintenance"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Select
            label="Analytic Cost Center"
            options={analyticAccounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
            value={anaId}
            onChange={e => setAnaId(e.target.value)}
          />
          <Input
            label="Budget Period"
            placeholder="Oct 2026 - Dec 2026"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          />
          <Input
            label="Planned Amount (₹)"
            type="number"
            required
            value={planned}
            onChange={e => setPlanned(Number(e.target.value))}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
