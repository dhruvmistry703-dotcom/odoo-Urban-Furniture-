import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Check,
  Search,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  FileText,
  UserCheck,
  CreditCard,
  Building2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { JournalEntry, JournalLine } from '../../types';

export const JournalEntries: React.FC = () => {
  const { journalEntries, journals, accounts, contacts, addJournalEntry, postJournalEntry, cancelJournalEntry } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Route modes
  const isCreateRoute = location.pathname.endsWith('/new');
  const isEditRoute = Boolean(id);
  const isFormMode = isCreateRoute || isEditRoute;

  // List View state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'posted' | 'draft' | 'cancelled'>('all');

  // Form View state ("When Clicking on new")
  const [accountingDate, setAccountingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedJournalId, setSelectedJournalId] = useState('');
  const [entryNumber, setEntryNumber] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Journal Items lines
  const [lines, setLines] = useState<
    Array<{
      id: string;
      accountId: string;
      partnerId: string;
      debit: number;
      credit: number;
    }>
  >([]);

  // Default empty line generator
  const createEmptyLine = () => {
    return {
      id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      accountId: accounts[0]?.id || '',
      partnerId: '',
      debit: 0,
      credit: 0,
    };
  };

  // Populate form on edit or create
  useEffect(() => {
    if (id) {
      const existing = journalEntries.find(
        e => e.id === id || e.entryNumber === id
      );
      if (existing) {
        setAccountingDate(existing.date);
        setSelectedJournalId(existing.journalId || (journals[0]?.id || ''));
        setEntryNumber(existing.entryNumber);
        setReference(existing.reference || '');
        setLines(
          existing.lines.map(l => ({
            id: l.id || `line-${Math.random()}`,
            accountId: l.accountId || (accounts[0]?.id || ''),
            partnerId: l.partnerId || '',
            debit: Number(l.debit || 0),
            credit: Number(l.credit || 0),
          }))
        );
      }
    } else if (isCreateRoute) {
      const today = new Date().toISOString().split('T')[0];
      setAccountingDate(today);

      const defaultJournal = journals[0];
      const jId = defaultJournal?.id || '';
      setSelectedJournalId(jId);

      // Auto-generate preview number
      const year = new Date().getFullYear();
      const prefix = defaultJournal?.name?.toLowerCase().includes('purch')
        ? 'Bill'
        : 'Inv';
      const count = journalEntries.length + 1;
      setEntryNumber(`${prefix}/${year}/${String(count).padStart(4, '0')}`);
      setReference('');

      // Pre-populate with two wireframe sample lines (Debit row, Credit row)
      const assetAcc = accounts.find(a => a.name.toLowerCase().includes('asset')) || accounts[0];
      const bankAcc = accounts.find(a => a.name.toLowerCase().includes('bank')) || accounts[1];
      const rahulContact = contacts.find(c => c.name.toLowerCase().includes('rahul')) || contacts[0];

      setLines([
        {
          id: `line-1`,
          accountId: assetAcc?.id || accounts[0]?.id || '',
          partnerId: rahulContact?.id || '',
          debit: 10000,
          credit: 0,
        },
        {
          id: `line-2`,
          accountId: bankAcc?.id || accounts[1]?.id || '',
          partnerId: '',
          debit: 0,
          credit: 10000,
        },
      ]);
    }
    // Only initialize the form when entering edit/create routes.
    // Avoid listening to `journalEntries`, `journals`, `accounts`, or `contacts`
    // here because background polling in DataContext can replace those
    // arrays and unexpectedly reset the form while the user is interacting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isCreateRoute]);

  // When journal selection changes in form, update entryNumber prefix
  const handleJournalChange = (newJournalId: string) => {
    setSelectedJournalId(newJournalId);
    if (!id) {
      const jrn = journals.find(j => j.id === newJournalId);
      const year = new Date().getFullYear();
      const name = (jrn?.name || '').toLowerCase();
      let prefix = 'MISC';
      if (name.includes('sale')) prefix = 'Inv';
      else if (name.includes('purch')) prefix = 'Bill';
      else if (name.includes('bank')) prefix = 'BNK';
      else if (name.includes('cash')) prefix = 'CSH';

      const count = journalEntries.filter(e => e.entryNumber.startsWith(`${prefix}/${year}/`)).length + 1;
      setEntryNumber(`${prefix}/${year}/${String(count).padStart(4, '0')}`);
    }
  };

  // Line operations
  const handleAddLine = () => {
    setLines(prev => [...prev, createEmptyLine()]);
  };

  const handleRemoveLine = (lineId: string) => {
    if (lines.length <= 1) {
      showToast({
        type: 'warning',
        title: 'Minimum Lines',
        message: 'A journal entry requires at least one debit and credit item.',
      });
      return;
    }
    setLines(prev => prev.filter(l => l.id !== lineId));
  };

  const handleUpdateLine = (
    lineId: string,
    field: 'accountId' | 'partnerId' | 'debit' | 'credit',
    value: any
  ) => {
    setLines(prev =>
      prev.map(l => {
        if (l.id !== lineId) return l;
        if (field === 'debit') {
          const deb = Number(value) || 0;
          return { ...l, debit: deb, credit: deb > 0 ? 0 : l.credit };
        }
        if (field === 'credit') {
          const cred = Number(value) || 0;
          return { ...l, credit: cred, debit: cred > 0 ? 0 : l.debit };
        }
        return { ...l, [field]: value };
      })
    );
  };

  // Calculate totals and balance check
  const totals = useMemo(() => {
    const debit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const credit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    const difference = Math.abs(debit - credit);
    const isBalanced = difference < 0.01 && debit > 0;
    return { debit, credit, difference, isBalanced };
  }, [lines]);

  // Submit / Post handler
  const handlePost = (targetStatus: 'posted' | 'draft' = 'posted') => {
    if (lines.length === 0) {
      showToast({
        type: 'error',
        title: 'Empty Journal Items',
        message: 'Please add at least one debit line and one credit line.',
      });
      return;
    }

    // Critical Wireframe Rule: "Blocking warning if the debit and credit amount don't match"
    if (targetStatus === 'posted' && !totals.isBalanced) {
      showToast({
        type: 'error',
        title: 'Blocking Warning: Unbalanced Entry',
        message: `Debit (₹${totals.debit.toLocaleString('en-IN')}) and Credit (₹${totals.credit.toLocaleString('en-IN')}) amounts don't match! Difference: ₹${totals.difference.toLocaleString('en-IN')}. Both sides must balance before posting.`,
      });
      return;
    }

    const journal = journals.find(j => j.id === selectedJournalId);
    const partner = contacts.find(c => lines[0]?.partnerId === c.id);

    const formattedLines: JournalLine[] = lines.map(l => {
      const acc = accounts.find(a => a.id === l.accountId);
      const part = contacts.find(c => c.id === l.partnerId);
      return {
        id: l.id,
        accountId: l.accountId,
        accountCode: acc?.code || '',
        accountName: acc?.name || 'Ledger Account',
        partnerId: l.partnerId || undefined,
        partnerName: part?.name || undefined,
        debit: Number(l.debit || 0),
        credit: Number(l.credit || 0),
      };
    });

    setIsSubmitting(true);
    try {
      const newJE = addJournalEntry({
        date: accountingDate,
        reference: reference || `Entry for ${journal?.name || 'General'}`,
        journalId: selectedJournalId,
        journalName: journal?.name || 'General Journal',
        partnerId: partner?.id,
        partnerName: partner?.name || undefined,
        lines: formattedLines,
        status: targetStatus,
      });

      showToast({
        type: 'success',
        title: targetStatus === 'posted' ? 'Journal Entry Posted' : 'Draft Saved',
        message: `${newJE.entryNumber || entryNumber} successfully ${targetStatus === 'posted' ? 'posted' : 'saved'} and recorded in Chart of Accounts.`,
      });

      navigate('/journal-entries');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Record Entry',
        message: err.message || 'Could not save journal entry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter journal entries for List View
  const filteredEntries = useMemo(() => {
    return journalEntries.filter(je => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (je.entryNumber && je.entryNumber.toLowerCase().includes(term)) ||
        (je.partnerName && je.partnerName.toLowerCase().includes(term)) ||
        (je.journalName && je.journalName.toLowerCase().includes(term)) ||
        (je.date && je.date.toLowerCase().includes(term));

      const matchesStatus = statusFilter === 'all' || je.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [journalEntries, searchTerm, statusFilter]);

  // Format date helper matching screenshot (e.g. Sep 1, Sep 2)
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // -------------------------------------------------------------
  // RENDER: FORM VIEW ("When Clicking on new")
  // Buttons: [Post] (left) ... [Cancel] [Back] (right)
  // Fields: Accounting Date, Journal, Items table with Account, Partner, Debit, Credit
  // Blocking Warning if debit and credit don't match
  // Field Explanation at bottom
  // -------------------------------------------------------------
  if (isFormMode) {
    const existingEntry = id ? journalEntries.find(e => e.id === id || e.entryNumber === id) : null;
    const isAlreadyPosted = existingEntry?.status === 'posted';

    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Top Header Buttons matching wireframe: [Post] (left) ... [Cancel] [Back] (right) */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* [Post] Button */}
            <button
              type="button"
              onClick={() => handlePost('posted')}
              disabled={isSubmitting || isAlreadyPosted || !totals.isBalanced}
              className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] ${
                !totals.isBalanced || isAlreadyPosted
                  ? 'bg-slate-300 dark:bg-navy-700 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
              }`}
              title={
                !totals.isBalanced
                  ? "Cannot post: Debit and Credit must match"
                  : isAlreadyPosted
                  ? "Already posted"
                  : "Post Journal Entry"
              }
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isAlreadyPosted ? 'Posted' : 'Post'}</span>
            </button>

            {/* Save as Draft option */}
            {!isAlreadyPosted && (
              <button
                type="button"
                onClick={() => handlePost('draft')}
                disabled={isSubmitting}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 transition-all"
              >
                Save Draft
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* [Cancel] Button */}
            <button
              type="button"
              onClick={() => navigate('/journal-entries')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
            >
              <span>Cancel</span>
            </button>

            {/* [Back] Button */}
            <button
              type="button"
              onClick={() => navigate('/journal-entries')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Blocking Warning Banner if Debit and Credit don't match */}
        {!totals.isBalanced && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold tracking-wide uppercase">
                Blocking warning if the debit and credit amount don't match
              </h4>
              <p className="text-xs mt-1">
                Total Debit (<strong>₹{totals.debit.toLocaleString('en-IN')}</strong>) and Total Credit (<strong>₹{totals.credit.toLocaleString('en-IN')}</strong>) must be equal before posting. Difference to balance:{' '}
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                  ₹{totals.difference.toLocaleString('en-IN')}
                </span>
                . The <strong>[Post]</strong> button is locked until amounts match.
              </p>
            </div>
          </div>
        )}

        {/* Balanced Green Success Indicator */}
        {totals.isBalanced && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">
              ✓ Perfectly Balanced: Debit ₹{totals.debit.toLocaleString('en-IN')} = Credit ₹{totals.credit.toLocaleString('en-IN')}. Ready to post.
            </span>
          </div>
        )}

        {/* Main Entry Form Box */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-navy-750 gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                When Clicking on new
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {entryNumber || 'New Journal Entry'}
              </h2>
            </div>

            {existingEntry && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  existingEntry.status === 'posted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {existingEntry.status}
              </span>
            )}
          </div>

          {/* Top Fields: Accounting Date & Journal (From journals Many to one) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Accounting Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Accounting Date</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={accountingDate}
                onChange={e => setAccountingDate(e.target.value)}
                disabled={isAlreadyPosted}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium disabled:opacity-60"
              />
            </div>

            {/* Journal (Selection: From journals Many to one) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Journal</span> <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedJournalId}
                onChange={e => handleJournalChange(e.target.value)}
                disabled={isAlreadyPosted}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-semibold disabled:opacity-60"
              >
                {journals.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.name} ({j.type})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 block italic">
                Selection (From journals Many to one)
              </span>
            </div>
          </div>

          {/* Journal Items Table matching Screenshot: Account | Partner | Debit | Credit */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Journal Items
              </h3>
              {!isAlreadyPosted && (
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Line</span>
                </button>
              )}
            </div>

            <div className="border border-slate-200 dark:border-navy-700 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 dark:bg-navy-900/90 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-navy-700">
                  <tr>
                    <th className="px-4 py-3 w-5/12">Account</th>
                    <th className="px-4 py-3 w-3/12">Partner</th>
                    <th className="px-4 py-3 w-2/12 text-right">Debit</th>
                    <th className="px-4 py-3 w-2/12 text-right">Credit</th>
                    {!isAlreadyPosted && <th className="px-2 py-3 w-10 text-center"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 font-medium">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40">
                      {/* Account: Selection from Chart of Accounts (Many to one) */}
                      <td className="px-4 py-2.5">
                        <select
                          value={line.accountId}
                          onChange={e => handleUpdateLine(line.id, 'accountId', e.target.value)}
                          disabled={isAlreadyPosted}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium disabled:opacity-60"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.name} ({acc.type}) {acc.code ? `[#${acc.code}]` : ''}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Partner: Selection from Contact Master (Many to one) */}
                      <td className="px-4 py-2.5">
                        <select
                          value={line.partnerId}
                          onChange={e => handleUpdateLine(line.id, 'partnerId', e.target.value)}
                          disabled={isAlreadyPosted}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                        >
                          <option value="">-- No Partner --</option>
                          {contacts.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.type})
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Debit */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={line.debit === 0 ? '' : line.debit}
                          onChange={e => handleUpdateLine(line.id, 'debit', e.target.value)}
                          placeholder="0"
                          disabled={isAlreadyPosted}
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-right rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                        />
                      </td>

                      {/* Credit */}
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={line.credit === 0 ? '' : line.credit}
                          onChange={e => handleUpdateLine(line.id, 'credit', e.target.value)}
                          placeholder="0"
                          disabled={isAlreadyPosted}
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-right rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                        />
                      </td>

                      {/* Remove Line */}
                      {!isAlreadyPosted && (
                        <td className="px-2 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>

                {/* Totals Footer */}
                <tfoot className="bg-slate-50 dark:bg-navy-900 font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-navy-700">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right uppercase text-[11px] tracking-wider">
                      Total Ledger Balance:
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">
                      ₹{totals.debit.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">
                      ₹{totals.credit.toLocaleString('en-IN')}
                    </td>
                    {!isAlreadyPosted && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Field Explanation Box matching screenshot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-900/80 border border-slate-200 dark:border-navy-700 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Field Explanation</span>
            </div>
            <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300 font-medium pl-5 list-disc">
              <li>
                <strong>Account</strong> - Selection From Chart of Accounts (Many to one)
              </li>
              <li>
                <strong>Partner</strong> - Selection from contact master (Many to one)
              </li>
            </ul>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 italic pt-1 border-t border-slate-200/60 dark:border-navy-800">
              "The Transaction would be connected through Chart of Accounts"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LIST VIEW ("Journal Entries (List View)")
  // Buttons: [New] (left) ... [Back] (right)
  // Columns: Date | Number | Partner | Journal | Total | Status
  // Example records:
  //   Sep 1 | Bill/2026/0001 | Mr. Rahul | Purchases | Rs. 30,000 | Posted
  //   Sep 2 | Inv/2026/001 | Mr Raj | Sales | Rs. 10,500 | Draft
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Journal Entries (List View)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {journalEntries.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Double-entry bookkeeping transactions with balanced debit and credit accounts
          </p>
        </div>

        {/* Quick link to Journals master */}
        <button
          type="button"
          onClick={() => navigate('/journals')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-navy-700 transition-all"
        >
          <span>Open Journals Master</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Toolbar matching screenshot: [New] (left) ... [Back] (right) */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/journal-entries/new')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Search & Status Filter */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Number, Partner, or Journal..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Statuses
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('posted')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'posted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Posted
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'draft'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Draft
          </button>
        </div>
      </div>

      {/* Main Journal Entries Table matching Screenshot */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-navy-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-navy-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Number</th>
                <th className="px-5 py-3.5">Partner</th>
                <th className="px-5 py-3.5">Journal</th>
                <th className="px-5 py-3.5 text-right">Total</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 font-medium">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No journal entries found</p>
                    <p className="text-xs">Click "New" to create a double-entry transaction</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr
                    key={entry.id}
                    onClick={() => navigate(`/journal-entries/${entry.id}`)}
                    className="hover:bg-slate-50/90 dark:hover:bg-navy-800/60 cursor-pointer transition-colors group"
                  >
                    {/* Date (e.g. Sep 1, Sep 2) */}
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {formatDisplayDate(entry.date)}
                    </td>

                    {/* Number (e.g. Bill/2026/0001, Inv/2026/001) */}
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-xs group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {entry.entryNumber}
                      </span>
                      {entry.reference && (
                        <span className="text-[11px] text-slate-400 block truncate max-w-xs font-sans">
                          {entry.reference}
                        </span>
                      )}
                    </td>

                    {/* Partner (e.g. Mr. Rahul, Mr Raj) */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {entry.partnerName || '—'}
                      </span>
                    </td>

                    {/* Journal (e.g. Purchases, Sales, Bank, Cash) */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300">
                        {entry.journalName || 'General'}
                      </span>
                    </td>

                    {/* Total (e.g. Rs. 30,000, Rs. 10,500) */}
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ₹{(entry.totalDebit || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Status (e.g. Posted in green, Draft in blue/slate) */}
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          entry.status === 'posted'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {entry.status === 'posted' ? 'Posted' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Wireframe Examples: Sep 1 Bill/2026/0001 (Mr. Rahul) • Sep 2 Inv/2026/001 (Mr Raj)</span>
          <span>Showing {filteredEntries.length} of {journalEntries.length} Entries</span>
        </div>
      </div>
    </div>
  );
};

export default JournalEntries;
