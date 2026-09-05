import React, { useState } from 'react';
import { Plus, Search, Filter, BookOpen } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { AccountType } from '../../types';

export const ChartOfAccounts: React.FC = () => {
  const { accounts, addAccount } = useData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Account State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('asset');

  const filtered = accounts.filter(acc => {
    const matchesQuery = acc.code.includes(query) || acc.name.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === 'all' || acc.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;

    const newAcc = addAccount({
      code,
      name,
      type,
      status: 'active',
    });

    showToast({
      type: 'success',
      title: 'Account Created',
      message: `Account ${newAcc.code} - ${newAcc.name} added to Chart of Accounts.`,
    });

    setIsModalOpen(false);
    setCode('');
    setName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chart of Accounts"
        subtitle="General ledger account code directory and real-time balances"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Account
          </Button>
        }
      />

      <Card noPadding>
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search code or account name..."
              icon={<Search className="w-4 h-4" />}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="asset">Asset (1000s)</option>
              <option value="liability">Liability (2000s)</option>
              <option value="capital">Capital / Equity (3000s)</option>
              <option value="income">Income (4000s)</option>
              <option value="expense">Expense (5000s)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Current Balance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {filtered.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{acc.code}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    {acc.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        acc.type === 'asset'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : acc.type === 'liability'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : acc.type === 'income'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}
                    >
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                    ₹{acc.balance.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Account Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Ledger Account">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Account Code"
            required
            placeholder="e.g. 5005"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Input
            label="Account Name"
            required
            placeholder="e.g. Electricity & Power Utility Expense"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Select
            label="Account Type"
            options={[
              { value: 'asset', label: 'Asset (1000s)' },
              { value: 'liability', label: 'Liability (2000s)' },
              { value: 'capital', label: 'Capital & Equity (3000s)' },
              { value: 'income', label: 'Income & Revenue (4000s)' },
              { value: 'expense', label: 'Expense (5000s)' },
            ]}
            value={type}
            onChange={e => setType(e.target.value as AccountType)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
