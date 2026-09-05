import React, { useState } from 'react';
import { Plus, PieChart } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const AnalyticAccounts: React.FC = () => {
  const { analyticAccounts, addAnalyticAccount } = useData();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const newAna = addAnalyticAccount({
      code,
      name,
      type,
      description,
      status: 'active',
    });

    showToast({
      type: 'success',
      title: 'Analytic Account Created',
      message: `${newAna.name} (${newAna.code}) configured for cost tracking.`,
    });

    setIsModalOpen(false);
    setCode('');
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytic Cost Accounts"
        subtitle="Cost centers, project tags, and departmental profit tracking"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add Analytic Account
          </Button>
        }
      />

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Analytic Account Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {analyticAccounts.map(ana => (
                <tr key={ana.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{ana.code}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    {ana.name}
                  </td>
                  <td className="px-4 py-3 uppercase font-bold text-[10px] text-slate-500">{ana.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{ana.description}</td>
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

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Analytic Account">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Analytic Code"
            required
            placeholder="e.g. ANA-MKTG"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <Input
            label="Account Name"
            required
            placeholder="e.g. Digital Marketing & Furniture Trade Fairs"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Select
            label="Type"
            options={[
              { value: 'expense', label: 'Expense Cost Center' },
              { value: 'income', label: 'Income Profit Center' },
            ]}
            value={type}
            onChange={e => setType(e.target.value as any)}
          />
          <Input
            label="Description"
            placeholder="Details about cost allocation..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
