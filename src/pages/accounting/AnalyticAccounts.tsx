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
  Percent,
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
        return <Badge variant="default">Draft (New)</Badge>;
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
    <div className="space-y-6">
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
          <p className="mt-1 text-[11px] text-slate-500">
            Total Committed: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(totalCommitted)}</span>
          </p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Income Type Budgets</span>
            <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{incomeBudgets.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Income Allocation: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(incomeCommitted)}</span>
          </p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expense Type Budgets</span>
            <ArrowDownCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">{expenseBudgets.length}</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Expense Allocation: <span className="font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(expenseCommitted)}</span>
          </p>
        </Card>
      </div>

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
                  className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors ${
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

        {/* Budgets Table Displaying Fields that used the selected Analysis Type */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Budget</th>
                <th className="px-4 py-3.5">Analytic Center</th>
                <th className="px-4 py-3.5">Analysis Type</th>
                <th className="px-4 py-3.5">Start Date</th>
                <th className="px-4 py-3.5">End Date</th>
                <th className="px-4 py-3.5 text-right">Committed</th>
                <th className="px-4 py-3.5 text-right">Achieved Amount</th>
                <th className="px-4 py-3.5 min-w-[130px]">Achieved %</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                      <span>Loading budget analysis records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Target className="w-8 h-8 text-slate-400" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">No budgets found</p>
                      <p className="text-xs text-slate-400">
                        {analysisTypeFilter === 'ALL'
                          ? 'No budget records available in the database.'
                          : `No budgets found utilizing analytic accounts of type "${analysisTypeFilter}".`}
                      </p>
                      <Button variant="primary" size="sm" onClick={() => navigate('/budgets')} className="mt-2">
                        Create Budget
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBudgets.map(b => {
                  const acc = getBudgetAnalyticAccount(b);
                  const accId = acc?._id || acc?.id || (typeof b.analyticAccountId === 'string' ? b.analyticAccountId : '');
                  const accName = acc?.name || b.analyticAccountName || 'General Center';
                  const accType = getBudgetAnalyticType(b);
                  const isIncome = accType === 'Income';
                  const budgetId = b._id || b.id;
                  const utilPercent = Number(b.utilization) || (b.planned > 0 ? (Number(b.actual || 0) / Number(b.planned)) * 100 : 0);

                  return (
                    <tr
                      key={budgetId}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors cursor-pointer"
                      onClick={() => navigate(`/budgets/${budgetId}`)}
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{b.name}</span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <PieChart className={`w-3.5 h-3.5 ${isIncome ? 'text-emerald-500' : 'text-purple-500'}`} />
                          <span>{accName}</span>
                          {acc?.code && (
                            <span className="text-[10px] font-mono text-slate-400">({acc.code})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {isIncome ? 'Income' : 'Expenses'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono">
                        {formatDate(b.startDate)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono">
                        {formatDate(b.endDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(b.planned)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(b.actual || 0)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-slate-700 dark:text-slate-300">{utilPercent.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-navy-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                utilPercent > 100
                                  ? 'bg-rose-500'
                                  : utilPercent > 80
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, utilPercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/budgets/${budgetId}`)}
                            title="Review Budget"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Review
                          </Button>
                          {accId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/analytic-accounts/${accId}`)}
                              title="Open Analytic Account Form"
                            >
                              <Layers className="w-3.5 h-3.5 mr-1 text-slate-500" /> Form
                            </Button>
                          )}
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
    </div>
  );
};
