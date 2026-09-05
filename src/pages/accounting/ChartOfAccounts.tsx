import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Plus,
  Check,
  Archive,
  Home,
  ArrowLeft,
  Search,
  BookOpen,
  Info,
  CheckCircle2,
  FolderTree,
  Building2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Account, AccountType } from '../../types';

export const ChartOfAccounts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const { accounts, addAccount, updateAccount, archiveAccount } = useData();
  const { showToast } = useToast();

  // Determine if in Form mode (either route /accounts/new or /accounts/:id, or internal state)
  const isNewRoute = location.pathname.endsWith('/new');
  const isEditRoute = Boolean(id && id !== 'new');
  const isFormMode = isNewRoute || isEditRoute;

  // Search & Filter State for List View
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  // Form View State
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<string>('Asset');
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load account for editing when id changes
  useEffect(() => {
    if (isEditRoute && id) {
      const found = accounts.find(a => a.id === id || a.code === id);
      if (found) {
        setEditingAccount(found);
        setAccountName(found.name);
        setAccountType(found.type);
      } else {
        setEditingAccount(null);
      }
    } else if (isNewRoute) {
      setEditingAccount(null);
      setAccountName('');
      setAccountType('Asset');
      setErrors({});
    }
  }, [id, isEditRoute, isNewRoute, accounts]);

  // Accounts filtering
  const displayedAccounts = accounts.filter(acc => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showArchivedOnly
      ? acc.status === 'archived'
      : acc.status !== 'archived';
    return matchesSearch && matchesStatus;
  });

  // Handle Save / Confirm
  const handleConfirm = async () => {
    const errs: { name?: string; type?: string } = {};
    if (!accountName.trim()) {
      errs.name = 'Account Name is required';
    }
    if (!accountType) {
      errs.type = 'Account Type is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide both Account Name and Type.',
      });
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      if (editingAccount) {
        // Update existing account
        updateAccount(editingAccount.id, {
          name: accountName.trim(),
          type: accountType as AccountType,
        });

        showToast({
          type: 'success',
          title: 'Account Updated',
          message: `Account "${accountName.trim()}" has been updated successfully.`,
        });
      } else {
        // Create new account
        const created = addAccount({
          name: accountName.trim(),
          type: accountType as AccountType,
          status: 'active',
        });

        showToast({
          type: 'success',
          title: 'Account Created',
          message: `Account "${created.name}" created and synced with cloud database.`,
        });
      }

      // Navigate back to List View
      navigate('/accounts');
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save the account to the database.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Archive Action
  const handleArchive = () => {
    if (isFormMode && editingAccount) {
      const nextStatus = editingAccount.status === 'archived' ? 'active' : 'archived';
      archiveAccount(editingAccount.id);
      setEditingAccount(prev => prev ? { ...prev, status: nextStatus } : null);

      showToast({
        type: 'info',
        title: nextStatus === 'archived' ? 'Account Archived' : 'Account Activated',
        message: `Account "${editingAccount.name}" is now ${nextStatus}.`,
      });
    } else if (!isFormMode) {
      // On List View, toggles viewing archived vs active
      setShowArchivedOnly(prev => !prev);
      showToast({
        type: 'info',
        title: !showArchivedOnly ? 'Viewing Archived Accounts' : 'Viewing Active Accounts',
        message: !showArchivedOnly ? 'Showing accounts that are archived.' : 'Showing active accounts.',
      });
    } else {
      showToast({
        type: 'info',
        title: 'No Account Selected',
        message: 'Save this account first before archiving.',
      });
    }
  };

  // Handle New Button click
  const handleNew = () => {
    setEditingAccount(null);
    setAccountName('');
    setAccountType('Asset');
    setErrors({});
    navigate('/accounts/new');
  };

  // Handle Back Button click
  const handleBack = () => {
    if (isFormMode) {
      navigate('/accounts');
    } else {
      navigate(-1);
    }
  };

  // Handle Home Button click
  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-5 pb-10">
      {/* ─────────────────────────────────────────────────────────────
          MASTER TOP ACTION BAR (Exact Buttons from Wireframe):
          [New] [Confirm] [Archived]               [Home] [Back]
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-xl px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          {/* [New] Button */}
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#714B67] hover:bg-[#5E3D56] active:bg-[#4C3145] rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#714B67]/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          {/* [Confirm] Button */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Confirm'}</span>
          </button>

          {/* [Archived] Button */}
          <button
            type="button"
            onClick={handleArchive}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
              showArchivedOnly || editingAccount?.status === 'archived'
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-700'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>
              {isFormMode && editingAccount
                ? editingAccount.status === 'archived'
                  ? 'Archived (Click to Activate)'
                  : 'Archived'
                : showArchivedOnly
                ? 'Showing Archived'
                : 'Archived'}
            </span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* [Home] Button */}
          <button
            type="button"
            onClick={handleHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 rounded-lg shadow-sm transition-all"
          >
            <Home className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Home</span>
          </button>

          {/* [Back] Button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-700 border border-slate-200 dark:border-navy-700 rounded-lg shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FORM VIEW ("When clicking on new" or clicking an existing account)
         ───────────────────────────────────────────────────────────── */}
      {isFormMode ? (
        <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-sm p-6 sm:p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="border-b border-slate-100 dark:border-navy-700 pb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded">
                  Chart of Accounts Form
                </span>
                {editingAccount?.status === 'archived' && (
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Archived
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {editingAccount ? `Edit: ${editingAccount.name}` : 'New Ledger Account'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/accounts')}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts List
            </button>
          </div>

          {/* Form Fields: Account Name & Type */}
          <div className="space-y-6 max-w-2xl">
            {/* Account Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="accountName"
                className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Account Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="accountName"
                  type="text"
                  placeholder="e.g. Bank A/c, Cash A/c, Sales Income A/c"
                  value={accountName}
                  onChange={e => {
                    setAccountName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-navy-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 dark:border-navy-600 focus:border-[#714B67] focus:ring-[#714B67]/20'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>

            {/* Type Dropdown with Balancesheet & Profit and Loss Optgroups */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="accountType"
                  className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Type <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Classifies ledger in financial reports
                </span>
              </div>

              <select
                id="accountType"
                value={accountType}
                onChange={e => {
                  setAccountType(e.target.value);
                  if (errors.type) setErrors(prev => ({ ...prev, type: undefined }));
                }}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-navy-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all font-medium ${
                  errors.type
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-300 dark:border-navy-600 focus:border-[#714B67] focus:ring-[#714B67]/20'
                }`}
              >
                {/* ── Balancesheet Group (Header only, non-selectable) ── */}
                <optgroup label="── Balancesheet (Heading) ──" className="font-bold text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-navy-950 py-1">
                  <option value="Asset" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Asset
                  </option>
                  <option value="Liability" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Liability
                  </option>
                  <option value="Bank" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Bank
                  </option>
                  <option value="Capital" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Capital
                  </option>
                  <option value="Cash" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Cash
                  </option>
                </optgroup>

                {/* ── Profit and Loss Group (Header only, non-selectable) ── */}
                <optgroup label="── Profit and Loss (Heading) ──" className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-navy-950 py-1">
                  <option value="Income" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Income
                  </option>
                  <option value="Expenses" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Expenses
                  </option>
                  <option value="Other Expenses" className="text-slate-900 dark:text-slate-100 pl-4 py-1">
                    Other Expenses
                  </option>
                </optgroup>
              </select>

              {errors.type && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.type}
                </p>
              )}
            </div>

            {/* Informational Guidance Box (Matching wireframe notes) */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Account Type Guidelines</span>
              </div>
              <p className="leading-relaxed">
                Provide drop down list to select from the following categories:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white/70 dark:bg-navy-900/60 rounded-lg p-2.5 border border-amber-100 dark:border-navy-700">
                  <div className="font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Balancesheet (Heading)
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 font-medium">
                    <li>Asset</li>
                    <li>Liability</li>
                    <li>Bank</li>
                    <li>Capital</li>
                    <li>Cash</li>
                  </ul>
                </div>

                <div className="bg-white/70 dark:bg-navy-900/60 rounded-lg p-2.5 border border-amber-100 dark:border-navy-700">
                  <div className="font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Profit and Loss (Heading)
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 font-medium">
                    <li>Income</li>
                    <li>Expenses</li>
                    <li>Other Expenses</li>
                  </ul>
                </div>
              </div>
              <p className="italic text-slate-500 dark:text-slate-400 pt-1">
                * Each account is assigned an Account Type, which would further be used for how the account is treated and where it appears in reports.
              </p>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-navy-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/accounts')}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-navy-700 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                >
                  {isSaving ? 'Saving...' : 'Confirm & Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            LIST VIEW (Exact wireframe table with Account Name & Type)
           ───────────────────────────────────────────────────────────── */
        <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
          {/* Table Header & Search Filter */}
          <div className="p-4 border-b border-slate-100 dark:border-navy-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-navy-900/40">
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#714B67]" />
                Chart of Accounts (List View)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All these accounts are pre-configured in your system and cloud database
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search account name or type..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-navy-600 bg-white dark:bg-navy-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#714B67]/20 focus:border-[#714B67]"
              />
            </div>
          </div>

          {/* Table Columns: Account Name | Type */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-navy-900/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider text-[11px]">
                  <th className="px-6 py-3.5 w-7/12">Account Name</th>
                  <th className="px-6 py-3.5 w-5/12">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
                {displayedAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center text-slate-500">
                      <FolderTree className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No accounts found</p>
                      <p className="text-xs mt-0.5">
                        {showArchivedOnly ? 'No archived accounts.' : 'Click "+ New" above to create an account.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  displayedAccounts.map((acc, index) => {
                    const typeDisplay = acc.type;
                    const isBS =
                      ['asset', 'assets', 'liability', 'liabilities', 'bank', 'capital', 'cash'].includes(
                        String(acc.type).toLowerCase()
                      );

                    return (
                      <tr
                        key={acc.id || index}
                        onClick={() => navigate(`/accounts/${acc.id}`)}
                        className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 cursor-pointer transition-colors group"
                      >
                        {/* Account Name */}
                        <td className="px-6 py-3.5 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 group-hover:text-[#714B67] dark:group-hover:text-purple-300 transition-colors">
                          <span className="w-2 h-2 rounded-full bg-[#714B67]/60 shrink-0" />
                          <span className="font-semibold">{acc.name}</span>
                          {acc.status === 'archived' && (
                            <span className="ml-2 text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Archived
                            </span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              isBS
                                ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40'
                                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                            }`}
                          >
                            {typeDisplay}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Count */}
          <div className="px-6 py-3 bg-slate-50/50 dark:bg-navy-900/40 border-t border-slate-100 dark:border-navy-700 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing {displayedAccounts.length} account{displayedAccounts.length === 1 ? '' : 's'}
              {showArchivedOnly && ' (Archived)'}
            </span>
            <span className="text-[11px] text-slate-400">
              Click any account row to open form view
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
