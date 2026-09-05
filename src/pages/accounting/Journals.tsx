import React, { useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { JournalType } from '../../types';

export const Journals: React.FC = () => {
  const { journals, accounts, addJournal } = useData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<JournalType>('general');
  const [debitAccId, setDebitAccId] = useState(accounts[0]?.id || '');
  const [creditAccId, setCreditAccId] = useState(accounts[1]?.id || '');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const debitAcc = accounts.find(a => a.id === debitAccId);
    const creditAcc = accounts.find(a => a.id === creditAccId);

    const newJrn = addJournal({
      name,
      code,
      type,
      debitAccountId: debitAccId,
      debitAccountName: debitAcc ? debitAcc.name : 'Default Debit',
      creditAccountId: creditAccId,
      creditAccountName: creditAcc ? creditAcc.name : 'Default Credit',
      status: 'active',
    });

    showToast({
      type: 'success',
      title: 'Journal Added',
      message: `${newJrn.name} (${newJrn.code}) configured.`,
    });

    setIsModalOpen(false);
    setName('');
    setCode('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting Journals"
        subtitle="Configure accounting entry books and default debit/credit rules"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Journal
          </Button>
        }
      />

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Journal Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Default Debit Account</th>
                <th className="px-4 py-3">Default Credit Account</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {journals.map(jrn => (
                <tr key={jrn.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    {jrn.name}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">{jrn.code}</td>
                  <td className="px-4 py-3 uppercase font-bold text-[10px] text-slate-500">{jrn.type}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{jrn.debitAccountName}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{jrn.creditAccountName}</td>
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

      {/* New Journal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Accounting Journal">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Journal Name"
            required
            placeholder="e.g. Online Gateway Journal"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input
            label="Short Code"
            required
            placeholder="e.g. GATE"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Select
            label="Journal Type"
            options={[
              { value: 'sales', label: 'Sales Journal' },
              { value: 'purchase', label: 'Purchase Journal' },
              { value: 'bank', label: 'Bank Journal' },
              { value: 'cash', label: 'Cash Journal' },
              { value: 'general', label: 'General Journal' },
            ]}
            value={type}
            onChange={e => setType(e.target.value as JournalType)}
          />
          <Select
            label="Default Debit Account"
            options={accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
            value={debitAccId}
            onChange={e => setDebitAccId(e.target.value)}
          />
          <Select
            label="Default Credit Account"
            options={accounts.map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))}
            value={creditAccId}
            onChange={e => setCreditAccId(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Journal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
