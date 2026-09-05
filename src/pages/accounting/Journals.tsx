import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Check,
  Search,
  Receipt,
  BookOpen,
  Building2,
  Wallet,
  Landmark,
  Coins,
  Edit3,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Journal, JournalType } from '../../types';

// Pre-configured Journal types matching the wireframe
export const JOURNAL_TYPES = ['Sales', 'Purchase', 'Bank', 'Cash'] as const;

export const Journals: React.FC = () => {
  const { journals, accounts, addJournal, updateJournal } = useData();
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
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Form View state ("When Clicking on New")
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<string>('Sales');
  const [formAccountId, setFormAccountId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Form View on edit or create
  useEffect(() => {
    if (id) {
      const existing = journals.find(j => j.id === id || j.code === id);
      if (existing) {
        setFormName(existing.name);
        setFormType(
          existing.type.charAt(0).toUpperCase() + existing.type.slice(1).toLowerCase()
        );
        setFormAccountId(existing.defaultAccountId || '');
      }
    } else if (isCreateRoute) {
      setFormName('');
      setFormType('Sales');
      // Default to Sales Income account if available
      const defaultAcc = accounts.find(a =>
        a.name.toLowerCase().includes('sales')
      ) || accounts[0];
      setFormAccountId(defaultAcc?.id || '');
    }
    // Only initialize the form when entering edit/create routes.
    // Avoid listening to `journals` or `accounts` here because background
    // polling can replace those arrays and unexpectedly reset user input
    // while they are interacting with the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isCreateRoute]);

  // When formType changes, automatically suggest default account if not set
  const handleTypeChange = (newType: string) => {
    setFormType(newType);
    const lower = newType.toLowerCase();
    let suggested = accounts.find(a => a.name.toLowerCase().includes(lower));
    if (!suggested) {
      if (lower === 'sales') suggested = accounts.find(a => a.name.toLowerCase().includes('sale'));
      else if (lower === 'purchase') suggested = accounts.find(a => a.name.toLowerCase().includes('purchase'));
      else if (lower === 'bank') suggested = accounts.find(a => a.name.toLowerCase().includes('bank'));
      else if (lower === 'cash') suggested = accounts.find(a => a.name.toLowerCase().includes('cash'));
    }
    if (suggested) {
      setFormAccountId(suggested.id);
    }
  };

  // Filter journals for List View
  const filteredJournals = useMemo(() => {
    return journals.filter(jrn => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        jrn.name.toLowerCase().includes(term) ||
        (jrn.type && jrn.type.toLowerCase().includes(term)) ||
        (jrn.defaultAccountName && jrn.defaultAccountName.toLowerCase().includes(term));

      const matchesType =
        typeFilter === 'all' ||
        jrn.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [journals, searchTerm, typeFilter]);

  // Form submit handler
  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formName.trim()) {
      showToast({
        type: 'error',
        title: 'Journal Name Required',
        message: 'Please enter a Journal Name (e.g. Sales, Purchase, Bank, Cash).',
      });
      return;
    }

    const selectedAccount = accounts.find(a => a.id === formAccountId);
    const defaultAccountName = selectedAccount
      ? selectedAccount.name
      : `${formName} Default Account`;

    setIsSubmitting(true);
    try {
      if (id) {
        updateJournal(id, {
          name: formName.trim(),
          type: formType.toLowerCase() as JournalType,
          defaultAccountId: formAccountId,
          defaultAccountName,
        });
        showToast({
          type: 'success',
          title: 'Journal Updated',
          message: `Journal "${formName}" updated successfully.`,
        });
      } else {
        addJournal({
          name: formName.trim(),
          type: formType.toLowerCase() as JournalType,
          code: formName.slice(0, 3).toUpperCase(),
          defaultAccountId: formAccountId,
          defaultAccountName,
          status: 'active',
        });
        showToast({
          type: 'success',
          title: 'Journal Created',
          message: `Journal "${formName}" created and synced to MongoDB Atlas.`,
        });
      }
      navigate('/journals');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Saving Journal',
        message: err.message || 'Could not save journal.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Type badge styling
  const getTypeBadge = (typeStr: string) => {
    const t = (typeStr || '').toLowerCase();
    if (t.includes('sale')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    if (t.includes('purch')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    if (t.includes('bank')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    if (t.includes('cash')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-700';
  };

  const getTypeIcon = (typeStr: string) => {
    const t = (typeStr || '').toLowerCase();
    if (t.includes('bank')) return <Landmark className="w-3.5 h-3.5 text-blue-600" />;
    if (t.includes('cash')) return <Coins className="w-3.5 h-3.5 text-purple-600" />;
    if (t.includes('purch')) return <Building2 className="w-3.5 h-3.5 text-amber-600" />;
    return <Receipt className="w-3.5 h-3.5 text-emerald-600" />;
  };

  // -------------------------------------------------------------
  // RENDER: FORM VIEW ("When Clicking on New")
  // Fields: Journal Name, Journal Type, Default Account
  // Actions: [Confirm] / [Save], [Back]
  // -------------------------------------------------------------
  if (isFormMode) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Header toolbar matching screenshot */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFormSubmit()}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Confirm</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/journals')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Form Box matching screenshot */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-6 sm:p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-navy-750">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {id ? 'Edit Journal' : 'When Clicking on New'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure accounting book for grouping financial activities
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 1. Journal Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                Journal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="Name (e.g. Sales, Purchase, Bank, Cash)"
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
              />
            </div>

            {/* 2. Journal Type */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Journal Type <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Select from: Sales, Purchase, Bank, Cash
                </span>
              </div>
              <select
                value={formType}
                onChange={e => handleTypeChange(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-semibold"
              >
                {JOURNAL_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* Quick Type Selection Pills */}
              <div className="flex items-center gap-2 pt-1">
                {JOURNAL_TYPES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                      formType.toLowerCase() === t.toLowerCase()
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-navy-800 dark:text-slate-300 border-slate-200 dark:border-navy-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Default Account (From Chart of Accounts Many to one) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Default Account <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  From Chart of Accounts (Many to one)
                </span>
              </div>

              <select
                value={formAccountId}
                onChange={e => setFormAccountId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
              >
                <option value="">-- Select Default Account --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type}) {acc.code ? `[#${acc.code}]` : ''}
                  </option>
                ))}
              </select>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                <span>
                  Connected to Account:{' '}
                  <strong>
                    {accounts.find(a => a.id === formAccountId)?.name || 'None selected'}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/accounts')}
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                >
                  <span>Open Chart of Accounts</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-750 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/journals')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{id ? 'Confirm & Update Journal' : 'Confirm & Save Journal'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LIST VIEW ("Journals (List View)")
  // Columns: Journal Name | Type | Default Account
  // Rows: Sales, Purchase, Bank, Cash
  // Top Buttons: [New] (left), [Back] (right)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Journals (List View)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {journals.length} Books
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accounting books for organizing sales, purchases, bank, and cash transactions
          </p>
        </div>

        {/* Quick link to Journal Entries */}
        <button
          type="button"
          onClick={() => navigate('/journal-entries')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all"
        >
          <span>View Journal Entries</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Toolbar matching screenshot: [New] (left) ... [Back] (right) */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/journals/new')}
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

      {/* Search Bar */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Journal Name, Type, or Default Account..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Types
          </button>
          {JOURNAL_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter.toLowerCase() === t.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Journals Table matching Screenshot Wireframe */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-navy-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-navy-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="px-6 py-3.5">Journal Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Default Account</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 font-medium">
              {filteredJournals.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No journals found</p>
                    <p className="text-xs">Click "New" above to add a journal</p>
                  </td>
                </tr>
              ) : (
                filteredJournals.map(jrn => (
                  <tr
                    key={jrn.id}
                    onClick={() => navigate(`/journals/${jrn.id}`)}
                    className="hover:bg-slate-50/90 dark:hover:bg-navy-800/60 cursor-pointer transition-colors group"
                  >
                    {/* Journal Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-navy-700 group-hover:scale-105 transition-transform">
                          {getTypeIcon(jrn.type)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {jrn.name}
                          </span>
                          {jrn.code && (
                            <span className="ml-2 font-mono text-[10px] text-slate-400">
                              #{jrn.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs ${getTypeBadge(
                          jrn.type
                        )}`}
                      >
                        {jrn.type.charAt(0).toUpperCase() + jrn.type.slice(1)}
                      </span>
                    </td>

                    {/* Default Account */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {jrn.defaultAccountName || 'Not Set'}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td
                      className="px-4 py-4 text-right"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/journals/${jrn.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-navy-800 transition-colors"
                        title="Edit Journal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Wireframe Pre-configured: Sales, Purchase, Bank, Cash</span>
          <span>Showing {filteredJournals.length} of {journals.length} Journals</span>
        </div>
      </div>
    </div>
  );
};

export default Journals;
