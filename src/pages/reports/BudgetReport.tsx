import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Search,
  List,
  LayoutGrid,
  RefreshCw,
  Target,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Budget, AnalyticAccount, BudgetStatus } from '../../types';

// Mini Pie Chart component: Achieved (Cyan) vs Balance (Coral)
interface MiniPieChartProps {
  achieved: number;
  planned: number;
  size?: number;
  showLegend?: boolean;
}

export const MiniBudgetPieChart: React.FC<MiniPieChartProps> = ({
  achieved,
  planned,
  size = 38,
  showLegend = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const safePlanned = Math.max(0, planned || 0);
  const safeAchieved = Math.max(0, achieved || 0);
  const balance = Math.max(0, safePlanned - safeAchieved);

  const achievedPct = safePlanned > 0 ? Math.min(100, (safeAchieved / safePlanned) * 100) : 0;
  const balancePct = Math.max(0, 100 - achievedPct);

  const radius = 16;
  const center = 20;

  const angle = (achievedPct / 100) * 360;
  const radians = ((angle - 90) * Math.PI) / 180;
  const startRadians = (-90 * Math.PI) / 180;

  const startX = center + radius * Math.cos(startRadians);
  const startY = center + radius * Math.sin(startRadians);
  const endX = center + radius * Math.cos(radians);
  const endY = center + radius * Math.sin(radians);

  const largeArcFlag = achievedPct > 50 ? 1 : 0;

  const achievedPath =
    achievedPct >= 100
      ? `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center - 0.001},${center - radius} Z`
      : achievedPct <= 0
      ? ''
      : `M ${center},${center} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;

  const balancePath =
    achievedPct <= 0
      ? `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center - 0.001},${center - radius} Z`
      : achievedPct >= 100
      ? ''
      : `M ${center},${center} L ${endX},${endY} A ${radius},${radius} 0 ${1 - largeArcFlag},1 ${startX},${startY} Z`;

  return (
    <div
      className="relative inline-flex items-center gap-2 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 40 40"
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-xs transition-transform duration-200 group-hover:scale-110"
        >
          {balancePath && <path d={balancePath} fill="#f43f5e" />}
          {achievedPath && <path d={achievedPath} fill="#06b6d4" />}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
        </svg>

        {isHovered && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-slate-900/95 text-white text-[11px] rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none backdrop-blur-xs min-w-[150px]">
            <div className="font-bold text-slate-300 border-b border-slate-700/60 pb-1 mb-1.5 flex items-center justify-between gap-2">
              <span>Budget Distribution</span>
              <span className="font-mono text-emerald-400">₹{safePlanned.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Achieved:
              </span>
              <span className="font-bold font-mono">
                ₹{safeAchieved.toLocaleString('en-IN')} ({achievedPct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-rose-300 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Balance:
              </span>
              <span className="font-bold font-mono">
                ₹{balance.toLocaleString('en-IN')} ({balancePct.toFixed(1)}%)
              </span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
          </div>
        )}
      </div>

      {showLegend && (
        <div className="text-[11px] space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
            <span className="truncate">Achieved: ₹{safeAchieved.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <span className="truncate">Balance: ₹{balance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const BudgetReport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { budgets: contextBudgets, analyticAccounts: contextAnalytics } = useData();
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [anaId, setAnaId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [planned, setPlanned] = useState<number | string>(100000);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
      case 'ACTIVE':
        return <Badge variant="success">Confirm</Badge>;
      case 'REVISED':
        return <Badge variant="warning">Revised</Badge>;
      case 'CANCELLED':
      case 'ARCHIVED':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'NEW':
      case 'DRAFT':
      default:
        return <Badge variant="default">Draft</Badge>;
    }
  };

  const fetchBudgetsData = useCallback(async () => {
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
        setAnalytics(analyticsRes.value.analyticAccounts);
        if (analyticsRes.value.analyticAccounts.length > 0 && !anaId) {
          setAnaId(analyticsRes.value.analyticAccounts[0]._id || analyticsRes.value.analyticAccounts[0].id || '');
        }
      } else {
        setAnalytics(contextAnalytics as any);
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to context data:', err);
      setBudgets(contextBudgets as any);
      setAnalytics(contextAnalytics as any);
    } finally {
      setLoading(false);
    }
  }, [contextBudgets, contextAnalytics, anaId]);

  useEffect(() => {
    fetchBudgetsData();
  }, [fetchBudgetsData]);

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
        responsiblePersonName: user?.name || 'Business Owner (Admin)',
        planned: plannedNum,
        notes: notes.trim(),
      });

      showToast({
        type: 'success',
        title: 'Budget Created',
        message: `Budget '${res.budget?.name || name}' created successfully.`,
      });

      setIsModalOpen(false);
      setName('');
      setNotes('');
      fetchBudgetsData();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Creation Failed',
        message: err.message || 'Could not save budget',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBudgets = budgets.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = b.name.toLowerCase().includes(q);
    const anaMatch = (b.analyticAccountName || '').toLowerCase().includes(q);
    const statusMatch = (b.status || '').toLowerCase().includes(q);
    const startMatch = formatDate(b.startDate).includes(q);
    const endMatch = formatDate(b.endDate).includes(q);
    return nameMatch || anaMatch || statusMatch || startMatch || endMatch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Toolbar */}
      <div className="p-4 bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: New Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto font-bold shadow-sm"
          >
            New
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBudgetsData}
            disabled={loading}
            title="Refresh Data"
            className="hidden sm:inline-flex"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Center: Search Box */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search budget title, dates, or status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Right: Back Button & View Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/budgets')}
            className="font-medium"
          >
            Back
          </Button>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-700">
            <button
              onClick={() => setViewMode('list')}
              title="Budget Report (List View)"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              title="Budget Report (Kanban View)"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Title & Legend */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Budget Report ({viewMode === 'list' ? 'List View' : 'Kanban View'})
          </h2>
          <p className="text-xs text-slate-500">
            Click on any budget row or card to open the form/review view.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider">Pie Chart:</span>
          <span className="flex items-center gap-1.5 text-cyan-500">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Achieved
          </span>
          <span className="flex items-center gap-1.5 text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Balance
          </span>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {viewMode === 'list' && (
        <Card noPadding className="overflow-hidden shadow-xs border border-slate-200 dark:border-navy-700">
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs table-auto">
              <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 whitespace-nowrap text-left">Budget</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Start Date</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">End Date</th>
                  <th className="px-5 py-3.5 whitespace-nowrap text-center">Status</th>
                  <th className="px-5 py-3.5 whitespace-nowrap text-center">Pie Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
                        <span className="font-medium">Loading budget report records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredBudgets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <Target className="w-8 h-8 text-slate-400" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">No budgets found</p>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={() => setIsModalOpen(true)}
                          className="mt-2"
                        >
                          New Budget
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBudgets.map(b => {
                    const budgetId = b._id || b.id;
                    const achievedAmount = Number(b.actual) || 0;
                    const plannedAmount = Number(b.planned) || 0;

                    return (
                      <tr
                        key={budgetId}
                        onClick={() => navigate(`/budgets/${budgetId}`)}
                        className="hover:bg-emerald-50/40 dark:hover:bg-navy-700/50 transition-colors cursor-pointer group"
                        title="Click to Open Form View"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                              <Target className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {b.name}
                              </p>
                              {b.analyticAccountName && (
                                <p className="text-[11px] text-slate-400 truncate">
                                  {b.analyticAccountName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(b.startDate)}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(b.endDate)}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          {getStatusBadge(b.status)}
                        </td>
                        <td className="px-5 py-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="inline-flex items-center justify-center">
                            <MiniBudgetPieChart
                              achieved={achievedAmount}
                              planned={plannedAmount}
                              size={36}
                            />
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
      )}

      {/* 2. KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
              <span className="text-sm font-medium text-slate-500">Loading Kanban cards...</span>
            </div>
          ) : filteredBudgets.length === 0 ? (
            <Card className="py-16 text-center text-slate-400">
              <Target className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No budgets found</p>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsModalOpen(true)}
                className="mt-3"
              >
                New Budget
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBudgets.map(b => {
                const budgetId = b._id || b.id;
                const achievedAmount = Number(b.actual) || 0;
                const plannedAmount = Number(b.planned) || 0;
                const balanceAmount = Math.max(0, plannedAmount - achievedAmount);
                const achievedPct = plannedAmount > 0 ? (achievedAmount / plannedAmount) * 100 : 0;

                return (
                  <div
                    key={budgetId}
                    onClick={() => navigate(`/budgets/${budgetId}`)}
                    className="group bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-navy-700 p-5 shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer relative overflow-hidden"
                    title="Click to Open Form View"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                          <h3 className="font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {b.name}
                          </h3>
                        </div>
                        {b.analyticAccountName && (
                          <p className="text-xs text-slate-400 mt-0.5 ml-6 truncate">
                            {b.analyticAccountName}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(b.status)}
                    </div>

                    <div className="bg-slate-50 dark:bg-navy-900/70 rounded-xl p-3.5 border border-slate-100 dark:border-navy-700/60 space-y-2 mb-4 text-xs font-mono">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400 font-sans text-[11px] font-semibold">Start Date:</span>
                        <span className="font-bold">{formatDate(b.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-slate-400 font-sans text-[11px] font-semibold">End Date:</span>
                        <span className="font-bold">{formatDate(b.endDate)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-navy-700/80 flex items-center justify-between">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">Committed:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {formatCurrency(plannedAmount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                            Achieved: {achievedPct.toFixed(0)}%
                          </span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Balance: {formatCurrency(balanceAmount)}
                          </span>
                        </div>
                      </div>

                      <div onClick={e => e.stopPropagation()} className="shrink-0">
                        <MiniBudgetPieChart
                          achieved={achievedAmount}
                          planned={plannedAmount}
                          size={42}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 text-right">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline inline-flex items-center gap-1">
                        Open Form View &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE BUDGET MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Budget">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Budget Name / Period"
            required
            placeholder="e.g. January 2026 or Q1 Maintenance"
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
            label="Planned Committed Amount (₹)"
            type="number"
            required
            min="1"
            placeholder="e.g. 100000"
            value={planned}
            onChange={e => setPlanned(e.target.value)}
          />

          <Input
            label="Scope / Notes"
            placeholder="Optional operational notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Budget...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BudgetReport;
