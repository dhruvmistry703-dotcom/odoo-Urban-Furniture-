import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Target,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  XCircle,
  Eye,
  Calendar,
  User as UserIcon,
  PieChart,
  Percent,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Budget, AnalyticAccount, BudgetStatus } from '../../types';

export const BudgetsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { budgets: contextBudgets, analyticAccounts: contextAnalytics } = useData();
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticAccount[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'CONFIRMED' | 'REVISED' | 'CANCELLED'>('ALL');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [anaId, setAnaId] = useState('');
  const [respContactId, setRespContactId] = useState('');
  const [respPersonName, setRespPersonName] = useState(user?.name || 'Business Owner (Admin)');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [planned, setPlanned] = useState<number | string>(150000);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revise Modal State
  const [revisingBudget, setRevisingBudget] = useState<Budget | null>(null);
  const [revisedAmount, setRevisedAmount] = useState<number | string>('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isRevising, setIsRevising] = useState(false);

  const fetchBudgetsAndDependencies = useCallback(async () => {
    try {
      setLoading(true);

      const [budgetsRes, analyticsRes, contactsRes] = await Promise.allSettled([
        api.getBudgets(),
        api.getAnalytics(),
        api.getContacts(),
      ]);

      if (budgetsRes.status === 'fulfilled' && budgetsRes.value?.budgets) {
        setBudgets(budgetsRes.value.budgets);
      } else {
        setBudgets(contextBudgets as any);
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.analyticAccounts) {
        setAnalytics(analyticsRes.value.analyticAccounts);
        if (analyticsRes.value.analyticAccounts.length > 0 && !anaId) {
          setAnaId(analyticsRes.value.analyticAccounts[0]._id || analyticsRes.value.analyticAccounts[0].id || '');
        }
      } else {
        setAnalytics(contextAnalytics as any);
      }

      if (contactsRes.status === 'fulfilled' && contactsRes.value?.contacts) {
        setContacts(contactsRes.value.contacts);
      }
    } catch (err) {
      console.warn('Error fetching budget data, using local fallback:', err);
      setBudgets(contextBudgets as any);
      setAnalytics(contextAnalytics as any);
    } finally {
      setLoading(false);
    }
  }, [contextBudgets, contextAnalytics, anaId]);

  useEffect(() => {
    fetchBudgetsAndDependencies();
  }, [fetchBudgetsAndDependencies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast({ type: 'warning', title: 'Validation Error', message: 'Budget Name is required.' });
      return;
    }
    if (!anaId) {
      showToast({ type: 'warning', title: 'Validation Error', message: 'Please select an Analytic Account.' });
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      showToast({
        type: 'error',
        title: 'Invalid Date Range',
        message: 'End Date cannot be earlier than Start Date.',
      });
      return;
    }

    const plannedNum = Number(planned);
    if (isNaN(plannedNum) || plannedNum <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Planned Amount',
        message: 'Planned amount must be greater than zero.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAna = analytics.find(a => (a._id || a.id) === anaId);

      const sDateObj = new Date(startDate);
      const eDateObj = new Date(endDate);
      const sStr = `${sDateObj.toLocaleString('default', { month: 'short' })} ${sDateObj.getFullYear()}`;
      const eStr = `${eDateObj.toLocaleString('default', { month: 'short' })} ${eDateObj.getFullYear()}`;
      const computedPeriod = sStr === eStr ? sStr : `${sStr} - ${eStr}`;

      const res = await api.createBudget({
        name: name.trim(),
        analyticAccountId: anaId,
        analyticAccountName: selectedAna?.name,
        type: String(selectedAna?.type || '').toLowerCase() === 'income' ? 'Income' : 'Expenses',
        startDate,
        endDate,
        period: computedPeriod,
        responsiblePersonId: respContactId || undefined,
        responsiblePersonName: respPersonName,
        planned: plannedNum,
        notes: notes.trim(),
      });

      showToast({
        type: 'success',
        title: 'Budget Created (Draft Stage)',
        message: `Budget '${res.budget?.name || name}' created in Draft state.`,
      });

      setIsModalOpen(false);
      setName('');
      setNotes('');
      fetchBudgetsAndDependencies();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Could not create budget in database',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirm = async (budgetId: string) => {
    try {
      await api.confirmBudget(budgetId);
      showToast({
        type: 'success',
        title: 'Budget Confirmed',
        message: 'Budget has been moved to Confirmed stage and locked for baseline execution.',
      });
      fetchBudgetsAndDependencies();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: err.message || 'Could not confirm budget',
      });
    }
  };

  const openReviseModal = (b: Budget) => {
    setRevisingBudget(b);
    setRevisedAmount(b.planned);
    setRevisionNotes('');
  };

  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingBudget) return;
    const bId = revisingBudget._id || revisingBudget.id;
    if (!bId) return;

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
      await api.reviseBudget(bId, {
        planned: amountNum,
        notes: revisionNotes.trim() || `Allocation updated to ₹${amountNum.toLocaleString('en-IN')}`,
      });

      showToast({
        type: 'success',
        title: 'Budget Revised',
        message: `Budget successfully moved to REVISED state. Revision history has been recorded.`,
      });

      setRevisingBudget(null);
      fetchBudgetsAndDependencies();
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

  const handleCancel = async (budgetId: string) => {
    if (!window.confirm('Are you sure you want to cancel this budget allocation?')) return;
    try {
      await api.cancelBudget(budgetId);
      showToast({
        type: 'info',
        title: 'Budget Cancelled',
        message: 'Budget status transitioned to CANCELLED.',
      });
      fetchBudgetsAndDependencies();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err.message || 'Could not cancel budget',
      });
    }
  };

  const handleDeleteBudget = async (e: React.MouseEvent, budgetId: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete budget '${name}'?`)) return;
    try {
      await api.deleteBudget(budgetId);
      showToast({
        type: 'success',
        title: 'Budget Deleted',
        message: `Budget '${name}' has been deleted.`,
      });
      fetchBudgetsAndDependencies();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete budget',
      });
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

  const getStatusBadge = (status: BudgetStatus | string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge variant="success">Confirmed</Badge>;
      case 'REVISED':
        return <Badge variant="warning">Revised</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'NEW':
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  // Filtered Budgets
  const filteredBudgets = budgets.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.analyticAccountName && b.analyticAccountName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.responsiblePersonName && b.responsiblePersonName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'NEW'
        ? b.status === 'NEW' || !b.status
        : b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalPlanned = budgets.reduce((sum, b) => sum + (Number(b.planned) || 0), 0);
  const totalActual = budgets.reduce((sum, b) => sum + (Number(b.actual) || 0), 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + (Number(b.remaining) || 0), 0);
  const overallUtilization = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        subtitle="Operational budget planning, expenditure variance, and revision tracking"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Budgets' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchBudgetsAndDependencies} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Budget
            </Button>
          </div>
        }
      />

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Planned</span>
            <Target className="w-4 h-4 text-slate-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalPlanned)}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Across {budgets.length} configured budgets</p>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Achieved Amount</span>
            <PieChart className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {formatCurrency(totalActual)}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Actual financial expenditure</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Buffer</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalRemaining)}
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Unspent authorization</p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilization</span>
            <Percent className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {overallUtilization.toFixed(1)}%
          </h3>
          <p className="mt-1 text-[11px] text-slate-500 truncate">Overall expenditure percentage</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-navy-700 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, owner, or cost center..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['ALL', 'NEW', 'CONFIRMED', 'REVISED', 'CANCELLED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'ALL' ? 'All Stages' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Table with Single-line per entry, NO horizontal scrollbar */}
        <div className="w-full">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider">
              <tr>
                <th className="w-[24%] px-3 py-3 text-left">Budget Title</th>
                <th className="w-[18%] px-3 py-3 text-left">Analytic Center</th>
                <th className="w-[14%] px-2 py-3 text-left">Period</th>
                <th className="w-[12%] px-2 py-3 text-right">Committed</th>
                <th className="w-[11%] px-2 py-3 text-right">Achieved</th>
                <th className="w-[7%] px-2 py-3 text-center">Status</th>
                <th className="w-[14%] px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                      <span>Loading budget records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Target className="w-8 h-8 text-slate-400" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">No budgets found</p>
                      <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-2">
                        Create New Budget
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBudgets.map(b => {
                  const bId = b._id || b.id;
                  const isNewStage = b.status === 'NEW' || !b.status;
                  const isConfirmed = b.status === 'CONFIRMED';
                  const isRevised = b.status === 'REVISED';
                  const isCancelled = b.status === 'CANCELLED';

                  const anaObj = typeof b.analyticAccountId === 'object' ? (b.analyticAccountId as AnalyticAccount) : null;
                  const anaName = anaObj?.name || b.analyticAccountName || 'General Center';

                  return (
                    <tr
                      key={bId}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/budgets/${bId}`)}
                    >
                      {/* Budget Title in 1 line */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white truncate" title={b.name}>
                            {b.name}
                          </span>
                          {b.revisions && b.revisions.length > 0 && (
                            <span className="shrink-0 inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              v{b.revisions.length + 1}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Analytic Center in 1 line */}
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 truncate font-medium" title={anaName}>
                        {anaName}
                      </td>

                      {/* Period in 1 line */}
                      <td className="px-2 py-2.5 text-slate-500 font-mono text-[11px] truncate">
                        {formatDate(b.startDate)} - {formatDate(b.endDate)}
                      </td>

                      {/* Committed Amount */}
                      <td className="px-2 py-2.5 text-right font-bold text-slate-900 dark:text-white truncate">
                        {formatCurrency(b.planned)}
                      </td>

                      {/* Achieved Amount */}
                      <td className="px-2 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400 truncate">
                        {formatCurrency(b.actual || 0)}
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2.5 text-center">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/budgets/${bId}`)}
                            title="Review Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {isNewStage && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleConfirm(bId!)}
                              title="Confirm Budget"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {(isConfirmed || isRevised) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviseModal(b)}
                              title="Revise Budget Allocation"
                            >
                              <FileEdit className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          <button
                            onClick={e => bId && handleDeleteBudget(e, bId, b.name)}
                            title="Delete Budget"
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      </Card>

      {/* Create Budget Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Budget (Draft Stage)">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Budget Name / Purpose"
            required
            placeholder="e.g. Q4 Workshop & Machinery Maintenance"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Select
            label="Analytic Account / Cost Center"
            required
            options={analytics.map(a => ({
              value: a._id || a.id || '',
              label: `${a.code || 'ANA'} - ${a.name} (${a.type})`,
            }))}
            value={anaId}
            onChange={e => setAnaId(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>

          <Input
            label="Planned Budget Amount (₹)"
            type="number"
            required
            min="1"
            placeholder="e.g. 150000"
            value={planned}
            onChange={e => setPlanned(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Responsible Person (Contact)
            </label>
            {contacts.length > 0 ? (
              <Select
                options={[
                  { value: '', label: `${respPersonName} (Default)` },
                  ...contacts.map(c => ({ value: c._id || c.id || '', label: `${c.name} (${c.type})` })),
                ]}
                value={respContactId}
                onChange={e => {
                  setRespContactId(e.target.value);
                  const sel = contacts.find(c => (c._id || c.id) === e.target.value);
                  if (sel) setRespPersonName(sel.name);
                }}
              />
            ) : (
              <Input
                value={respPersonName}
                onChange={e => setRespPersonName(e.target.value)}
              />
            )}
          </div>

          <Input
            label="Scope & Strategic Notes"
            placeholder="Add operational notes or justification..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving to Database...' : 'Save Draft Budget'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Revise Modal */}
      <Modal isOpen={!!revisingBudget} onClose={() => setRevisingBudget(null)} title="Revise Budget Allocation">
        <form onSubmit={handleReviseSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Revising will update the planned limit while recording this change in the audit trail history.
          </p>

          <Input
            label="New Planned Amount (₹)"
            type="number"
            required
            min="1"
            value={revisedAmount}
            onChange={e => setRevisedAmount(e.target.value)}
          />

          <Input
            label="Revision Reason / Justification"
            required
            placeholder="e.g. Increased material cost from timber supplier"
            value={revisionNotes}
            onChange={e => setRevisionNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setRevisingBudget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isRevising}>
              {isRevising ? 'Revising...' : 'Confirm Revision'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
