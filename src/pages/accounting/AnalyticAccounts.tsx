import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Target,
  PieChart,
  RefreshCw,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  Layers,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Budget, AnalyticAccount, BudgetStatus } from '../../types';

export const AnalyticAccounts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { budgets: contextBudgets, analyticAccounts: contextAnalytics } = useData();
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = useState<AnalyticAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisTypeFilter, setAnalysisTypeFilter] = useState<'ALL' | 'Income' | 'Expenses'>('ALL');

  // Helper date & currency formatters
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetsRes, analyticsRes] = await Promise.allSettled([
        api.getBudgets(),
        api.getAnalytics(),
      ]);

      if (budgetsRes.status === 'fulfilled' && budgetsRes.value?.budgets) {
        setBudgets(budgetsRes.value.budgets);
      } else {
        setBudgets(contextBudgets as any);
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.analyticAccounts) {
        setAnalyticAccounts(analyticsRes.value.analyticAccounts);
      } else {
        setAnalyticAccounts(contextAnalytics as any);
      }
    } catch (err) {
      console.warn('Backend API failed, using fallback:', err);
      setBudgets(contextBudgets as any);
      setAnalyticAccounts(contextAnalytics as any);
    } finally {
      setLoading(false);
    }
  }, [contextBudgets, contextAnalytics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete an analytic account entry
  const handleDeleteAnalyticAccount = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete analytic account '${name}' and its linked budgets?`)) {
      return;
    }
    try {
      await api.deleteAnalytic(id);
      showToast({
        type: 'success',
        title: 'Account Deleted',
        message: `Analytic account '${name}' removed successfully.`,
      });
      fetchData();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete analytic account',
      });
    }
  };

  // Helper to resolve the analytic account object for a budget
  const getBudgetAnalyticAccount = (b: Budget): AnalyticAccount | undefined => {
    if (b.analyticAccountId && typeof b.analyticAccountId === 'object') {
      return b.analyticAccountId as AnalyticAccount;
    }
    const accId = typeof b.analyticAccountId === 'string' ? b.analyticAccountId : (b as any).analyticAccount;
    return analyticAccounts.find(a => (a._id || a.id) === accId);
  };

  // Helper to get analytic type ('Income' | 'Expenses')
  const getBudgetAnalyticType = (b: Budget): 'Income' | 'Expenses' => {
    const acc = getBudgetAnalyticAccount(b);
    if (acc?.type) {
      return String(acc.type).toLowerCase() === 'income' ? 'Income' : 'Expenses';
    }
    return 'Expenses';
  };

  // Filter budgets based on search and selected analysis type
  const filteredBudgets = budgets.filter(b => {
    const acc = getBudgetAnalyticAccount(b);
    const accName = acc?.name || b.analyticAccountName || (b as any).analyticAccount || '';
    const accType = getBudgetAnalyticType(b);

    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.responsiblePersonName && b.responsiblePersonName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = analysisTypeFilter === 'ALL' || accType === analysisTypeFilter;

    return matchesSearch && matchesType;
  });

  // KPI Calculations
  const incomeBudgets = budgets.filter(b => getBudgetAnalyticType(b) === 'Income');
  const expenseBudgets = budgets.filter(b => getBudgetAnalyticType(b) === 'Expenses');

  const totalCommitted = budgets.reduce((sum, b) => sum + (Number(b.planned) || 0), 0);
  const incomeCommitted = incomeBudgets.reduce((sum, b) => sum + (Number(b.planned) || 0), 0);
  const expenseCommitted = expenseBudgets.reduce((sum, b) => sum + (Number(b.planned) || 0), 0);

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <PageHeader
        title="Analytic & Budget Analysis"
        subtitle="Budget allocations categorized by analytic cost and income centers"
        breadcrumbs={[{ label: 'Finance' }, { label: 'Analytic Accounts / Analysis' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button
              variant="outline"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/analytic-accounts/new')}
            >
              New Analytic Account
            </Button>
            <Button
              variant="primary"
              icon={<Target className="w-4 h-4" />}
              onClick={() => navigate('/budgets')}
            >
              Manage Budgets
            </Button>
          </div>
        }
      />

      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Budgets</span>
            <Target className="w-4 h-4 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{budgets.length}</p>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            Total Committed: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(totalCommitted)}</span>
          </p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Income Type Budgets</span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{incomeBudgets.length}</p>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            Income Allocation: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(incomeCommitted)}</span>
          </p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expense Type Budgets</span>
            <ArrowDownCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{expenseBudgets.length}</p>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            Expense Allocation: <span className="font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(expenseCommitted)}</span>
          </p>
        </Card>
      </div>

      {/* 1. Analytic Accounts Directory (Single-line, no scrollbar) */}
      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-navy-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Layers className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analytic Accounts</h3>
              <p className="text-xs text-slate-500 truncate">Cost and income centers used to classify budgets</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 shrink-0 font-semibold">
            {analyticAccounts.length} {analyticAccounts.length === 1 ? 'Account' : 'Accounts'}
          </span>
        </div>

        <div className="w-full">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider">
              <tr>
                <th className="w-[40%] px-4 py-3 text-left">Account</th>
                <th className="w-[18%] px-4 py-3">Code</th>
                <th className="w-[14%] px-4 py-3 text-center">Type</th>
                <th className="w-[14%] px-4 py-3 text-center">Linked Budgets</th>
                <th className="w-[14%] px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading analytic accounts...</td>
                </tr>
              ) : analyticAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No analytic accounts yet. Create one to start linking budgets.
                  </td>
                </tr>
              ) : (
                analyticAccounts
                  .filter(acc => {
                    const t = String(acc.type || '').toLowerCase() === 'income' ? 'Income' : 'Expenses';
                    const matchesType = analysisTypeFilter === 'ALL' || t === analysisTypeFilter;
                    const q = searchQuery.toLowerCase();
                    const matchesSearch =
                      !q ||
                      acc.name.toLowerCase().includes(q) ||
                      (acc.code || '').toLowerCase().includes(q) ||
                      (acc.description || '').toLowerCase().includes(q);
                    return matchesType && matchesSearch;
                  })
                  .map(acc => {
                    const accId = acc._id || acc.id;
                    const accType = String(acc.type || '').toLowerCase() === 'income' ? 'Income' : 'Expenses';
                    const linkedCount = budgets.filter(b => {
                      const linked = getBudgetAnalyticAccount(b);
                      const linkedId = linked?._id || linked?.id || (typeof b.analyticAccountId === 'string' ? b.analyticAccountId : '');
                      return linkedId && accId && String(linkedId) === String(accId);
                    }).length;

                    return (
                      <tr key={accId} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                        {/* Account Name in 1 line */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <PieChart className={`w-4 h-4 shrink-0 ${accType === 'Income' ? 'text-emerald-500' : 'text-purple-500'}`} />
                            <span className="font-bold text-slate-900 dark:text-white truncate" title={acc.name}>
                              {acc.name}
                            </span>
                          </div>
                        </td>

                        {/* Code in 1 line */}
                        <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-slate-400 truncate">
                          {acc.code || '—'}
                        </td>

                        {/* Type Badge */}
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              accType === 'Income'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            {accType}
                          </span>
                        </td>

                        {/* Linked Budgets Count */}
                        <td className="px-4 py-2.5 text-center font-semibold text-slate-800 dark:text-slate-200">
                          {linkedCount}
                        </td>

                        {/* Actions (Open + Delete) */}
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => accId && navigate(`/analytic-accounts/${accId}`)}
                            >
                              <Layers className="w-3.5 h-3.5 mr-1 text-slate-500" /> Open
                            </Button>
                            <button
                              onClick={e => accId && handleDeleteAnalyticAccount(e, accId, acc.name)}
                              title="Delete Analytic Account"
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

      {/* Filter and Search Bar */}
      <Card noPadding>
        <div className="p-4 border-b border-slate-200 dark:border-navy-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by budget, analytic center, or owner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 shrink-0 font-medium">Analysis Type:</span>
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-xs">
              {(['ALL', 'Income', 'Expenses'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setAnalysisTypeFilter(t)}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                    analysisTypeFilter === t
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'ALL' ? 'All Budgets' : `${t} Budgets`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Budgets & Analysis Table (Single-line per entry, NO horizontal scrollbar) */}
        <div className="w-full">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider">
              <tr>
                <th className="w-[22%] px-3 py-3 text-left">Budget</th>
                <th className="w-[18%] px-3 py-3 text-left">Analytic Center</th>
                <th className="w-[10%] px-2 py-3 text-center">Type</th>
                <th className="w-[9%] px-2 py-3">Start Date</th>
                <th className="w-[9%] px-2 py-3">End Date</th>
                <th className="w-[10%] px-2 py-3 text-right">Committed</th>
                <th className="w-[10%] px-2 py-3 text-right">Achieved</th>
                <th className="w-[6%] px-2 py-3 text-center">Status</th>
                <th className="w-[6%] px-2 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                      <span>Loading budget analysis records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Target className="w-7 h-7 text-slate-400" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">No budgets found</p>
                      <Button variant="primary" size="sm" onClick={() => navigate('/budgets')} className="mt-1">
                        Create Budget
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBudgets.map(b => {
                  const acc = getBudgetAnalyticAccount(b);
                  const accName = acc?.name || b.analyticAccountName || 'General Center';
                  const accCode = acc?.code ? `(${acc.code})` : '';
                  const accType = getBudgetAnalyticType(b);
                  const isIncome = accType === 'Income';
                  const budgetId = b._id || b.id;

                  return (
                    <tr
                      key={budgetId}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/budgets/${budgetId}`)}
                    >
                      {/* 1. Budget Name in 1 line */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white truncate" title={b.name}>
                            {b.name}
                          </span>
                        </div>
                      </td>

                      {/* 2. Analytic Center in 1 line */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5 min-w-0" title={`${accName} ${accCode}`}>
                          <PieChart className={`w-3.5 h-3.5 shrink-0 ${isIncome ? 'text-emerald-500' : 'text-purple-500'}`} />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{accName}</span>
                          {accCode && (
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{accCode}</span>
                          )}
                        </div>
                      </td>

                      {/* 3. Analysis Type */}
                      <td className="px-2 py-2.5 text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          }`}
                        >
                          {isIncome ? 'Income' : 'Expenses'}
                        </span>
                      </td>

                      {/* 4. Start Date */}
                      <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate">
                        {formatDate(b.startDate)}
                      </td>

                      {/* 5. End Date */}
                      <td className="px-2 py-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] truncate">
                        {formatDate(b.endDate)}
                      </td>

                      {/* 6. Committed */}
                      <td className="px-2 py-2.5 text-right font-bold text-slate-900 dark:text-white truncate">
                        {formatCurrency(b.planned)}
                      </td>

                      {/* 7. Achieved Amount */}
                      <td className="px-2 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400 truncate">
                        {formatCurrency(b.actual || 0)}
                      </td>

                      {/* 8. Status Badge */}
                      <td className="px-2 py-2.5 text-center">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* 9. Actions */}
                      <td className="px-2 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/budgets/${budgetId}`)}
                          title="Review Budget"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticAccounts;
