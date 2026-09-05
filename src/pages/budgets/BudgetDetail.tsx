import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  FileEdit,
  XCircle,
  Plus,
  Calendar,
  User as UserIcon,
  PieChart,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Receipt,
  FileText,
  DollarSign,
  Info,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';
import { Budget, AnalyticAccount, Contact } from '../../types';

export const BudgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { budgets: contextBudgets } = useData();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Revise Modal State (Visible at Confirmed Stage)
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [revisedAmount, setRevisedAmount] = useState<number | string>('');
  const [revisedName, setRevisedName] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  // Transactions Modal State (When clicking Achieved Amount)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const matchesBudgetId = (b: Budget, targetId: string) => {
    const candidates = [b.id, b._id, typeof b._id === 'object' ? String(b._id) : null];
    return candidates.some(v => v && String(v) === String(targetId));
  };

  const fetchBudgetAndMeta = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [resBudget, resAnalytics, resContacts] = await Promise.allSettled([
        api.getBudgetById(id),
        api.getAnalytics(),
        api.getContacts(),
      ]);

      if (resBudget.status === 'fulfilled' && resBudget.value?.budget) {
        setBudget(resBudget.value.budget);
      } else {
        const localFallback = contextBudgets.find(b => matchesBudgetId(b, id));
        if (localFallback) {
          setBudget(localFallback as any);
        } else {
          showToast({
            type: 'error',
            title: 'Not Found',
            message: 'Budget record not found in database.',
          });
          setBudget(null);
        }
      }

      if (resAnalytics.status === 'fulfilled' && resAnalytics.value?.analyticAccounts) {
        setAnalytics(resAnalytics.value.analyticAccounts);
      }

      if (resContacts.status === 'fulfilled' && resContacts.value?.contacts) {
        setContacts(resContacts.value.contacts);
      }
    } catch (err: any) {
      const localFallback = contextBudgets.find(b => matchesBudgetId(b, id));
      if (localFallback) {
        setBudget(localFallback as any);
      } else {
        showToast({
          type: 'error',
          title: 'Fetch Error',
          message: err.message || 'Could not load budget details',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id, contextBudgets, showToast]);

  useEffect(() => {
    fetchBudgetAndMeta();
    // Load once per budget id; ignore context identity churn that retriggers Strict Mode toasts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Stage 1 -> 2: Confirm newly created budget
  const handleConfirm = async () => {
    if (!id) return;
    try {
      const res = await api.confirmBudget(id);
      showToast({
        type: 'success',
        title: 'Budget Confirmed',
        message: `Budget '${res.budget?.name || budget?.name}' is now Confirmed. Achieved tracking is active.`,
      });
      fetchBudgetAndMeta();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: err.message || 'Could not confirm budget',
      });
    }
  };

  // Stage 2 -> 3: Revise Confirmed Budget (Creates new Revised budget, moves old to REVISED state)
  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !budget) return;

    const amountNum = Number(revisedAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast({
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Revised planned amount must be greater than zero.',
      });
      return;
    }

    setIsRevising(true);
    try {
      const res = await api.reviseBudget(id, {
        planned: amountNum,
        newName: revisedName.trim() || undefined,
        notes: revisionNotes.trim() || `Revised limit to ₹${amountNum.toLocaleString('en-IN')}`,
      });

      showToast({
        type: 'success',
        title: 'Budget Revised',
        message: `Original budget moved to Revised state. New budget '${res.budget?.name}' created.`,
      });

      setIsReviseOpen(false);

      const newId = res.budget?._id || res.budget?.id;
      if (newId) {
        navigate(`/budgets/${newId}`);
      } else {
        fetchBudgetAndMeta();
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Revision Failed',
        message: err.message || 'Could not revise budget',
      });
    } finally {
      setIsRevising(false);
    }
  };

  // Stage -> 4: Cancel / Archive budget
  const handleCancel = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to cancel this budget allocation?')) return;
    try {
      await api.cancelBudget(id);
      showToast({
        type: 'info',
        title: 'Budget Cancelled',
        message: 'Budget status transitioned to Cancelled.',
      });
      fetchBudgetAndMeta();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err.message || 'Could not cancel budget',
      });
    }
  };

  // View linked transactions when clicking Achieved Amount
  const handleOpenTransactions = async () => {
    if (!id) return;
    setIsTxModalOpen(true);
    setLoadingTx(true);
    try {
      const res = await api.getBudgetTransactions(id);
      if (res?.transactions) {
        setTransactions(res.transactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-sm font-medium text-slate-500">Loading Budget Review...</span>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Budget Not Found</h2>
        <Button variant="primary" onClick={() => navigate('/budgets')}>
          Back to Budgets
        </Button>
      </div>
    );
  }

  const normStatus = String(budget.status || '').toUpperCase();
  const isDraft = normStatus === 'NEW' || normStatus === 'DRAFT';
  const isConfirmed = normStatus === 'CONFIRMED' || normStatus === 'ACTIVE';
  const isRevised = normStatus === 'REVISED';
  const isCancelled = normStatus === 'CANCELLED' || normStatus === 'ARCHIVED';

  // Resolved metadata
  const anaObj =
    budget.analyticAccountId && typeof budget.analyticAccountId === 'object'
      ? (budget.analyticAccountId as AnalyticAccount)
      : analytics.find(a => (a._id || a.id) === budget.analyticAccountId) || null;
  const anaName = anaObj?.name || budget.analyticAccountName || 'General Center';
  const anaType = String(budget.type || anaObj?.type || 'Expenses').toLowerCase() === 'income' ? 'Income' : 'Expenses';

  // Financial calculations from Image 3
  const committedAmount = Number(budget.planned) || 0;
  const achievedAmount = Number(budget.actual) || 0;
  const achievedPercent = committedAmount > 0 ? (achievedAmount / committedAmount) * 100 : 0;
  const amountToAchieve = Math.max(0, committedAmount - achievedAmount);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header / Action Buttons matching Menu & Stage Mapping */}
      <PageHeader
        title={budget.name}
        subtitle={`Budget Review • Stage: ${isDraft ? 'Draft' : isConfirmed ? 'Confirmed' : isRevised ? 'Revised' : 'Cancelled'}`}
        breadcrumbs={[
          { label: 'Finance' },
          { label: 'Budgets', href: '/budgets' },
          { label: budget.name },
        ]}
        actions={
          <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-2">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-2">
              {/* 1. New button */}
              <Button
                variant="secondary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => navigate('/budgets')}
              >
                New
              </Button>

              {/* 2. Confirm button (Available at Draft stage) */}
              {isDraft && (
                <Button
                  variant="primary"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              )}

              {/* 3. Revise button (Only visible at confirmed Stage) */}
              {isConfirmed && (
                <Button
                  variant="primary"
                  icon={<FileEdit className="w-4 h-4" />}
                  onClick={() => {
                    setRevisedAmount(budget.planned);
                    setRevisedName(
                      budget.name.toLowerCase().includes('revised')
                        ? `${budget.name} (v2)`
                        : `${budget.name} Revised`
                    );
                    setRevisionNotes('');
                    setIsReviseOpen(true);
                  }}
                >
                  Revise
                </Button>
              )}

              {/* 4. Cancelled button (Archive/Cancel budget) */}
              {!isCancelled && (
                <Button
                  variant="outline"
                  icon={<XCircle className="w-4 h-4 text-rose-500" />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Right: Back button */}
            <Button
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/budgets')}
            >
              Back
            </Button>
          </div>
        }
      />

      {/* Stage Flow Banner */}
      <Card className="p-4 bg-slate-50/70 dark:bg-navy-800/60 border border-slate-200 dark:border-navy-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stage:</span>
            <Badge
              variant={
                isConfirmed
                  ? 'success'
                  : isRevised
                  ? 'warning'
                  : isCancelled
                  ? 'danger'
                  : 'default'
              }
            >
              {isDraft ? 'Draft' : isConfirmed ? 'Confirmed' : isRevised ? 'Revised' : 'Cancelled'}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`px-2.5 py-1 rounded-md ${isDraft ? 'bg-slate-900 text-white font-bold' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'}`}>
              Draft
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded-md ${isConfirmed ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'}`}>
              Confirm
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded-md ${isRevised ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'}`}>
              Revised
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded-md ${isCancelled ? 'bg-rose-600 text-white font-bold' : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'}`}>
              Cancelled
            </span>
          </div>
        </div>

        {/* Revision Interlinks (As specified in Image 3) */}
        {budget.originalBudgetId && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between text-xs">
            <span className="text-slate-500">This budget was revised from an earlier baseline:</span>
            <Link
              to={`/budgets/${typeof budget.originalBudgetId === 'object' ? (budget.originalBudgetId as any)._id : budget.originalBudgetId}`}
              className="font-bold text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1"
            >
              View Original Budget <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {budget.revisedBudgetId && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-navy-700 flex items-center justify-between text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              This budget has been superseded by a newer revised budget:
            </span>
            <Link
              to={`/budgets/${typeof budget.revisedBudgetId === 'object' ? (budget.revisedBudgetId as any)._id : budget.revisedBudgetId}`}
              className="font-bold text-emerald-600 hover:text-emerald-500 inline-flex items-center gap-1"
            >
              View New Revised Budget <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </Card>

      {/* Main Budget Review Form Structure matching Image 3 Field Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Field Section */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-navy-700 pb-3">
            <Target className="w-5 h-5 text-emerald-500" /> Budget Details
          </h3>

          <div className="space-y-4 text-xs">
            {/* 1. Budget Name */}
            <div>
              <span className="text-slate-500 font-medium block mb-1">Budget Name:</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono bg-slate-50 dark:bg-navy-900 p-2.5 rounded-lg border border-slate-200 dark:border-navy-700">
                {budget.name}
              </p>
            </div>

            {/* 2. Budget Period */}
            <div>
              <span className="text-slate-500 font-medium block mb-1">Budget Period (Dates):</span>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-navy-900 p-2.5 rounded-lg border border-slate-200 dark:border-navy-700">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>{formatDate(budget.startDate)}</span>
                <span className="text-slate-400">to</span>
                <span>{formatDate(budget.endDate)}</span>
              </div>
            </div>

            {/* 3. Responsible */}
            <div>
              <span className="text-slate-500 font-medium block mb-1">Responsible Person (Contact):</span>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-navy-900 p-2.5 rounded-lg border border-slate-200 dark:border-navy-700">
                <UserIcon className="w-4 h-4 text-blue-500" />
                <span>{budget.responsiblePersonName || 'Business Owner (Admin)'}</span>
              </div>
            </div>

            {/* 4. Analyticals */}
            <div>
              <span className="text-slate-500 font-medium block mb-1">Analytic Account:</span>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-navy-900 p-2.5 rounded-lg border border-slate-200 dark:border-navy-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{anaName}</span>
                {anaObj && (
                  <Link
                    to={`/analytic-accounts/${anaObj._id || anaObj.id}`}
                    className="text-[11px] text-emerald-600 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Open Form <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* 5. Type */}
            <div>
              <span className="text-slate-500 font-medium block mb-1">Type:</span>
              <div className="flex items-center gap-2">
                <Badge variant={anaType === 'Income' ? 'success' : 'warning'}>
                  {anaType}
                </Badge>
                <span className="text-[11px] text-slate-500">
                  {anaType === 'Income'
                    ? '(Mapped to Customer / Sales Invoices)'
                    : '(Mapped to Vendor Bills / Purchase Orders)'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Amounts & Metrics Section */}
        <Card className="p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-navy-700 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-500" /> Financial Execution
          </h3>

          <div className="space-y-4">
            {/* 6. Committed Amount */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Committed Amount:</span>
                <Badge variant="primary">Target Budget</Badge>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(committedAmount)}
              </p>
            </div>

            {/* Metrics Visible only for Confirmed / Revised Budget */}
            {(isConfirmed || isRevised) ? (
              <div className="space-y-3">
                {/* 7. Achieved Amount Button */}
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                      Achieved Amount:
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleOpenTransactions}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Receipt className="w-3.5 h-3.5 mr-1" /> View Linked Invoices/Bills
                    </Button>
                  </div>
                  <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                    {formatCurrency(achievedAmount)}
                  </p>
                  <p className="text-[11px] text-blue-600/80 dark:text-blue-300/80 mt-1">
                    Computed dynamically from {anaType === 'Income' ? 'Sales Invoices' : 'Vendor Bills'} for this budget period.
                  </p>
                </div>

                {/* 8. Achieved % */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Achieved %:
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      {achievedPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-navy-700 h-2.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full transition-all ${
                        achievedPercent > 100
                          ? 'bg-rose-500'
                          : achievedPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, achievedPercent)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Formula: (Achieved Amount / Committed Amount) * 100
                  </p>
                </div>

                {/* 9. Amount to Achieve */}
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                      Amount to Achieve:
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">Remaining</span>
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(amountToAchieve)}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 dark:text-emerald-300/80 mt-1">
                    Formula: Committed Amount - Achieved Amount
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-navy-700 text-center text-slate-400 space-y-2">
                <Info className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-semibold">Achieved Amount, Achieved %, and Amount to Achieve are visible once this budget is Confirmed.</p>
                {isDraft && (
                  <Button variant="primary" size="sm" onClick={handleConfirm} className="mt-2">
                    Confirm Budget Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Revise Modal (Visible at Confirmed Stage) */}
      <Modal
        isOpen={isReviseOpen}
        onClose={() => setIsReviseOpen(false)}
        title="Revise Confirmed Budget"
      >
        <form onSubmit={handleReviseSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Revising will move the current budget to <strong className="text-amber-600">REVISED</strong> status and spawn a new active revised budget record with cross-linked references.
          </p>

          <Input
            label="New Revised Budget Name"
            required
            value={revisedName}
            onChange={e => setRevisedName(e.target.value)}
            helperText="e.g. Project A Revised"
          />

          <Input
            label="New Committed Limit Amount (₹)"
            type="number"
            required
            min="1"
            value={revisedAmount}
            onChange={e => setRevisedAmount(e.target.value)}
            helperText={`Previous Committed Limit was ${formatCurrency(committedAmount)}`}
          />

          <Input
            label="Revision Justification / Notes"
            placeholder="e.g. Increased material cost and additional carpentry shifts"
            value={revisionNotes}
            onChange={e => setRevisionNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsReviseOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isRevising}>
              {isRevising ? 'Creating Revision...' : 'Confirm & Create Revised Budget'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Linked Invoices / Vendor Bills Modal (Opened via Achieved Amount Button) */}
      <Modal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        title={`Linked ${anaType === 'Income' ? 'Sales Invoices' : 'Vendor Bills'} for ${budget.name}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Period: {formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
            <span className="font-bold text-slate-900 dark:text-white">
              Total: {formatCurrency(achievedAmount)}
            </span>
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-lg border border-slate-200 dark:border-navy-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                <tr>
                  <th className="p-2.5">Doc #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Party</th>
                  <th className="p-2.5 text-right">Amount</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                {loadingTx ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-emerald-500" />
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No matching {anaType === 'Income' ? 'Sales Invoices' : 'Vendor Bills'} recorded in this budget period.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx: any) => (
                    <tr key={tx._id || tx.id} className="hover:bg-slate-50 dark:hover:bg-navy-700/40">
                      <td className="p-2.5 font-bold font-mono">
                        {tx.invoiceNumber || tx.billNumber || '—'}
                      </td>
                      <td className="p-2.5 text-slate-500 font-mono">
                        {formatDate(tx.invoiceDate || tx.billDate || tx.createdAt)}
                      </td>
                      <td className="p-2.5 font-medium">
                        {tx.customerName || tx.vendorName || '—'}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(tx.grandTotal || tx.subtotal || 0)}
                      </td>
                      <td className="p-2.5 text-center">
                        <Badge variant="success">{tx.status || 'posted'}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsTxModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
