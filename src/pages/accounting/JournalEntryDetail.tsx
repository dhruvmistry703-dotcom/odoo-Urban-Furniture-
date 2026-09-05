import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';

export const JournalEntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { journalEntries } = useData();

  const entry = journalEntries.find(je => je.id === id || je.entryNumber === id);

  if (!entry) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Journal Entry Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/journals')}>Back to Journals</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Journal Entry ${entry.entryNumber}`}
        subtitle={`Date: ${entry.date} • Reference: ${entry.reference} • Book: ${entry.journalName || 'General Journal'}`}
        action={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/journals')}>
            Back to Journals
          </Button>
        }
        breadcrumbs={[{ label: 'Journals', href: '/journals' }, { label: entry.entryNumber }]}
      />

      <Card className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{entry.entryNumber}</h3>
            <p className="text-xs text-slate-500">Ref: {entry.reference}</p>
          </div>
          <div>
            {entry.isBalanced ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> ✓ Balanced Ledger
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4" /> Unbalanced Entry
              </span>
            )}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="py-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Account Name & Particulars</th>
                <th className="px-4 py-3 text-right">Debit (₹)</th>
                <th className="px-4 py-3 text-right">Credit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700 font-mono">
              {entry.lines.map(line => (
                <tr key={line.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-700/30">
                  <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{line.accountCode}</td>
                  <td className="px-4 py-3 font-sans">
                    <span className="font-semibold text-slate-900 dark:text-white block">{line.accountName}</span>
                    {line.label && <span className="text-[11px] text-slate-400 font-normal">{line.label}</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                    {line.debit > 0 ? `₹${line.debit.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                    {line.credit > 0 ? `₹${line.credit.toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-300 dark:border-navy-600 bg-slate-50/50 dark:bg-navy-900/50">
              <tr className="font-extrabold text-slate-900 dark:text-white">
                <td colSpan={2} className="px-4 py-3 text-right uppercase text-xs">Total Ledger Sum:</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">
                  ₹{entry.totalDebit.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">
                  ₹{entry.totalCredit.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
