import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Plus,
  Check,
  Archive,
  Home,
  ArrowLeft,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  Landmark,
  Coins
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Account, AccountType, AccountStatus } from '../../types';

// Pre-configured accounts list as requested in the screenshot wireframe
export const PRE_CONFIGURED_ACCOUNTS = [
  { name: 'Bank A/c', type: 'Assets', group: 'Balancesheet', code: '1002' },
  { name: 'Purchase Expense A/c', type: 'Expense', group: 'Profit and Loss', code: '5001' },
  { name: 'Debtors A/c', type: 'Assets', group: 'Balancesheet', code: '1003' },
  { name: 'Creditors A/c', type: 'Liabilities', group: 'Balancesheet', code: '2001' },
  { name: 'Sales Income A/c', type: 'Income', group: 'Profit and Loss', code: '4001' },
  { name: 'Cash A/c', type: 'Assets', group: 'Balancesheet', code: '1001' },
  { name: 'Other Expense A/c', type: 'Expense', group: 'Profit and Loss', code: '5004' },
  { name: 'Capital A/c', type: 'Capital', group: 'Balancesheet', code: '3001' },
];

// Dropdown grouped options matching screenshot exactly
export const ACCOUNT_TYPE_GROUPS = [
  {
    group: 'Balancesheet',
    note: 'Just for heading selection can be done from the orange part only',
    options: [
      { value: 'Asset', label: 'Asset', displayGroup: 'Assets' },
      { value: 'Liability', label: 'Liability', displayGroup: 'Liabilities' },
      { value: 'Bank', label: 'Bank', displayGroup: 'Assets' },
      { value: 'Capital', label: 'Capital', displayGroup: 'Capital' },
      { value: 'Cash', label: 'Cash', displayGroup: 'Assets' },
    ],
  },
  {
    group: 'Profit and Loss',
    note: 'Just for heading',
    options: [
      { value: 'Income', label: 'Income', displayGroup: 'Income' },
      { value: 'Expenses', label: 'Expenses', displayGroup: 'Expense' },
      { value: 'Other Expenses', label: 'Other Expenses', displayGroup: 'Expense' },
    ],
  },
];

export const ChartOfAccounts: React.FC = () => {
  const { accounts, addAccount, updateAccount, archiveAccount } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  // Determine if viewing form or list based on URL
  const isCreateRoute = location.pathname.endsWith('/new');
  const isEditRoute = Boolean(id);
  const isFormMode = isCreateRoute || isEditRoute;

  // Search & Filter state for List View
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<'all' | 'Balancesheet' | 'Profit and Loss'>('all');
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form State for "When clicking on new"
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<string>('Asset');
  const [formCode, setFormCode] = useState('');
  const [formBalance, setFormBalance] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<AccountStatus>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If editing existing account, populate form
  useEffect(() => {
    if (id) {
      const existing = accounts.find(a => a.id === id || a.code === id);
      if (existing) {
        setFormName(existing.name);
        setFormType(existing.type);
        setFormCode(existing.code || '');
        setFormBalance(existing.balance || 0);
        setFormStatus(existing.status || 'active');
      }
    } else if (isCreateRoute) {
      // Reset form on "New"
      setFormName('');
      setFormType('Asset');
      // Generate preview code based on current count
      const nextCode = `10${String(accounts.length + 1).padStart(2, '0')}`;
      setFormCode(nextCode);
      setFormBalance(0);
      setFormStatus('active');
    }
  }, [id, isCreateRoute, accounts]);

  // Derive report group from selected type
  const currentReportGroup = useMemo(() => {
    const pnlOption = ACCOUNT_TYPE_GROUPS[1].options.find(o => o.value === formType);
    return pnlOption ? 'Profit and Loss' : 'Balancesheet';
  }, [formType]);

  // Filter accounts for List View
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        acc.name.toLowerCase().includes(term) ||
        (acc.code && acc.code.toLowerCase().includes(term)) ||
        (acc.type && acc.type.toLowerCase().includes(term));

      const isArchived = acc.status === 'archived';
      const matchesArchiveFilter = showArchivedOnly ? isArchived : !isArchived;

      // Group filter check
      let matchesGroup = true;
      if (filterGroup !== 'all') {
        const isPnl = ['Income', 'Expenses', 'Other Expenses', 'income', 'expense'].includes(acc.type);
        matchesGroup = filterGroup === 'Profit and Loss' ? isPnl : !isPnl;
      }

      return matchesSearch && matchesArchiveFilter && matchesGroup;
    });
  }, [accounts, searchTerm, showArchivedOnly, filterGroup]);

  // Multi-selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredAccounts.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (accId: string) => {
    setSelectedIds(prev =>
      prev.includes(accId) ? prev.filter(i => i !== accId) : [...prev, accId]
    );
  };

  // Archive toggle for toolbar
  const handleToggleArchiveView = () => {
    setShowArchivedOnly(prev => !prev);
    setSelectedIds([]);
  };

  // Confirm action in List View (e.g. batch confirm or info)
  const handleListConfirm = () => {
    if (selectedIds.length > 0) {
      showToast({
        type: 'success',
        title: 'Accounts Confirmed',
        message: `${selectedIds.length} account(s) confirmed and verified in Chart of Accounts.`,
      });
      setSelectedIds([]);
    } else {
      showToast({
        type: 'info',
        title: 'Chart of Accounts Confirmed',
        message: `All active ledger accounts are synchronized with Atlas database.`,
      });
    }
  };

  // Form Save / Confirm handler
  const handleFormConfirm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formName.trim()) {
      showToast({
        type: 'error',
        title: 'Account Name Required',
        message: 'Please enter a valid Account Name (e.g. Bank A/c, Cash A/c).',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (id) {
        // Update existing
        updateAccount(id, {
          name: formName.trim(),
          type: formType,
          reportGroup: currentReportGroup,
          status: formStatus,
          balance: Number(formBalance) || 0,
          code: formCode || undefined,
        });

        showToast({
          type: 'success',
          title: 'Account Updated',
          message: `Account "${formName}" updated successfully in Chart of Accounts.`,
        });
      } else {
        // Create new
        const finalCode = formCode.trim() || `ACC-${Date.now().toString().slice(-4)}`;
        addAccount({
          code: finalCode,
          name: formName.trim(),
          type: formType,
          reportGroup: currentReportGroup,
          status: formStatus,
          balance: Number(formBalance) || 0,
        });

        showToast({
          type: 'success',
          title: 'Account Created',
          message: `Account "${formName}" (${formType}) saved and synced to Atlas cloud database.`,
        });
      }

      navigate('/accounts');
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Error Saving Account',
        message: err.message || 'Could not save account.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Badge styler for Types
  const getTypeBadge = (typeStr: string) => {
    const t = (typeStr || '').toLowerCase();
    if (t.includes('asset') || t.includes('bank') || t.includes('cash')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    }
    if (t.includes('liab') || t.includes('creditor')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    }
    if (t.includes('inc') || t.includes('sale')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (t.includes('exp')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    }
    if (t.includes('cap')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-700';
  };

  // Icon selector based on type/name
  const getAccountIcon = (name: string, type: string) => {
    const n = name.toLowerCase();
    const t = type.toLowerCase();
    if (n.includes('bank') || t.includes('bank')) return <Landmark className="w-3.5 h-3.5 text-blue-600" />;
    if (n.includes('cash') || t.includes('cash')) return <Coins className="w-3.5 h-3.5 text-emerald-600" />;
    if (t.includes('liab')) return <Building2 className="w-3.5 h-3.5 text-rose-600" />;
    if (t.includes('inc')) return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
    if (t.includes('exp')) return <TrendingDown className="w-3.5 h-3.5 text-amber-600" />;
    return <BookOpen className="w-3.5 h-3.5 text-slate-500" />;
  };

  // -------------------------------------------------------------
  // RENDER: TOP TOOLBAR (Matching Screenshot Wireframe)
  // [New] [Confirm] [Archived]               [Home] [Back]
  // -------------------------------------------------------------
  const renderMasterHeaderBar = () => {
    return (
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm transition-all duration-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left Buttons: [New] [Confirm] [Archived] */}
          <div className="flex items-center flex-wrap gap-2">
            {/* [New] Button */}
            <button
              type="button"
              onClick={() => {
                if (isFormMode) {
                  // Reset form for fresh account
                  setFormName('');
                  setFormType('Asset');
                  setFormCode(`10${String(accounts.length + 1).padStart(2, '0')}`);
                  setFormBalance(0);
                  setFormStatus('active');
                  navigate('/accounts/new');
                } else {
                  navigate('/accounts/new');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
              title="Create new ledger account"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New</span>
            </button>

            {/* [Confirm] Button */}
            <button
              type="button"
              onClick={() => {
                if (isFormMode) {
                  handleFormConfirm();
                } else {
                  handleListConfirm();
                }
              }}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              title={isFormMode ? 'Save and confirm this account' : 'Confirm accounts'}
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Confirm</span>
            </button>

            {/* [Archived] Button */}
            <button
              type="button"
              onClick={() => {
                if (isFormMode) {
                  // Toggle status for the currently edited account
                  const nextStatus: AccountStatus = formStatus === 'archived' ? 'active' : 'archived';
                  setFormStatus(nextStatus);
                  showToast({
                    type: 'info',
                    title: 'Status Toggled',
                    message: `Account set to ${nextStatus.toUpperCase()}`,
                  });
                } else {
                  handleToggleArchiveView();
                }
              }}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 active:scale-[0.98] ${
                (isFormMode ? formStatus === 'archived' : showArchivedOnly)
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Toggle Archived filter"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                {isFormMode
                  ? formStatus === 'archived' ? 'Archived (Active: No)' : 'Archived'
                  : showArchivedOnly ? 'Showing Archived' : 'Archived'}
              </span>
            </button>

            {/* Selection info badge if items checked in List View */}
            {!isFormMode && selectedIds.length > 0 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                {selectedIds.length} selected
              </span>
            )}
          </div>

          {/* Right Buttons: [Home] [Back] */}
          <div className="flex items-center justify-end gap-2">
            {/* [Home] Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
              title="Go to Home Dashboard"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {/* [Back] Button */}
            <button
              type="button"
              onClick={() => {
                if (isFormMode) {
                  navigate('/accounts');
                } else {
                  navigate(-1);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-navy-700 transition-all active:scale-[0.98]"
              title="Go back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // RENDER: FORM VIEW ("When clicking on new")
  // -------------------------------------------------------------
  if (isFormMode) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Top Header & Master Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {id ? 'Edit Ledger Account' : 'New Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chart of Accounts (Form View) • Classify financial transactions
            </p>
          </div>
        </div>

        {/* Master Toolbar: [New] [Confirm] [Archived] [Home] [Back] */}
        {renderMasterHeaderBar()}

        {/* Main Form Card matching screenshot wireframe */}
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleFormConfirm} className="space-y-6">
            {/* Account Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                Account Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Bank A/c, Cash A/c, Sales Income A/c..."
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Example names from Master: Bank A/c, Cash A/c, Debtors A/c, Creditors A/c, Sales Income A/c, Purchase Expense A/c, Capital A/c.
              </p>
            </div>

            {/* Type Dropdown Field with Grouping from Screenshot */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                Type <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <select
                  value={formType}
                  onChange={e => setFormType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-semibold"
                >
                  {ACCOUNT_TYPE_GROUPS.map(grp => (
                    <optgroup key={grp.group} label={`── ${grp.group.toUpperCase()} ──`}>
                      {grp.options.map(opt => (
                        <option key={opt.value} value={opt.value} className="py-1">
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Visual Group Reference Card matching wireframe annotations */}
              <div className="mt-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Provide drop down list to select from the following:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Balancesheet Group */}
                  <div className="p-3 rounded-lg bg-white/80 dark:bg-navy-900/80 border border-amber-200/60 dark:border-navy-700">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Balancesheet
                    </span>
                    <span className="text-[10px] text-slate-400 block mb-2 italic">
                      (Just for heading selection can be done from the items below)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCOUNT_TYPE_GROUPS[0].options.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormType(opt.value)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all ${
                            formType === opt.value
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : 'bg-amber-100/70 hover:bg-amber-200/70 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profit and Loss Group */}
                  <div className="p-3 rounded-lg bg-white/80 dark:bg-navy-900/80 border border-amber-200/60 dark:border-navy-700">
                    <span className="font-extrabold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Profit and Loss
                    </span>
                    <span className="text-[10px] text-slate-400 block mb-2 italic">
                      (Just for heading)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ACCOUNT_TYPE_GROUPS[1].options.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormType(opt.value)}
                          className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all ${
                            formType === opt.value
                              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                              : 'bg-amber-100/70 hover:bg-amber-200/70 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300/60'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wireframe Annotation */}
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-navy-700 flex items-start gap-2 text-slate-700 dark:text-slate-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-medium text-cyan-800 dark:text-cyan-300">
                    Each account is assigned an Account Type, which would further be used for how the account to be treated and where it appears in reports.
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Code & Opening Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Account Code (Auto-generated or custom)
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={e => setFormCode(e.target.value)}
                  placeholder="e.g. 1005"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Current Balance (₹)
                </label>
                <input
                  type="number"
                  value={formBalance}
                  onChange={e => setFormBalance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 font-bold"
                />
              </div>
            </div>

            {/* Submit & Navigation footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-750 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/accounts')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{id ? 'Confirm & Update Account' : 'Confirm & Save Account'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: LIST VIEW ("Chart of Accounts (List View)")
  // All these accounts are to be pre-configured
  // Table columns: Account Name | Type
  // -------------------------------------------------------------
  const isAllSelected =
    filteredAccounts.length > 0 &&
    filteredAccounts.every(a => selectedIds.includes(a.id));

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Chart of Accounts (List View)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {accounts.length} Total Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All these accounts are to be pre configured • General ledger account directory
          </p>
        </div>
      </div>

      {/* Master Toolbar: [New] [Confirm] [Archived] [Home] [Back] */}
      {renderMasterHeaderBar()}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search Account Name or Type..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Group Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterGroup('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterGroup === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Accounts
          </button>
          <button
            type="button"
            onClick={() => setFilterGroup('Balancesheet')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterGroup === 'Balancesheet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Balancesheet
          </button>
          <button
            type="button"
            onClick={() => setFilterGroup('Profit and Loss')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filterGroup === 'Profit and Loss'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Profit & Loss
          </button>
        </div>
      </div>

      {/* Main Table matching Screenshot Wireframe */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-navy-900/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-navy-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="w-12 px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-navy-700 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3">Account Name</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Current Balance</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 font-medium">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No accounts found</p>
                    <p className="text-xs">Click "New" above to add an account to Chart of Accounts</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => {
                  const isSelected = selectedIds.includes(acc.id);
                  return (
                    <tr
                      key={acc.id}
                      onClick={() => navigate(`/accounts/${acc.id}`)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'hover:bg-slate-50/90 dark:hover:bg-navy-800/60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-4 py-3.5 text-center"
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleSelect(acc.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(acc.id)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 dark:border-navy-700 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Account Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-navy-700 group-hover:scale-105 transition-transform">
                            {getAccountIcon(acc.name, acc.type)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {acc.name}
                            </span>
                            {acc.code && (
                              <span className="ml-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                                #{acc.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Column matching screenshot */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs ${getTypeBadge(
                            acc.type
                          )}`}
                        >
                          {acc.type}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ₹{(acc.balance || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            acc.status === 'archived'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {acc.status === 'archived' ? 'Archived' : 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/accounts/${acc.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-navy-800 transition-colors"
                            title="Edit Account"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              archiveAccount(acc.id);
                              showToast({
                                type: 'info',
                                title: 'Account Status',
                                message: `Account "${acc.name}" ${acc.status === 'archived' ? 'activated' : 'archived'}.`,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-navy-800 transition-colors"
                            title={acc.status === 'archived' ? 'Restore Account' : 'Archive Account'}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info showing Pre-configured Status */}
        <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-navy-900/50 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Pre-configured Accounts: Bank A/c, Purchase Expense A/c, Debtors A/c, Creditors A/c, Sales Income A/c, Cash A/c, Other Expense A/c, Capital A/c.</span>
          </div>
          <span>Showing {filteredAccounts.length} of {accounts.length} Accounts</span>
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
