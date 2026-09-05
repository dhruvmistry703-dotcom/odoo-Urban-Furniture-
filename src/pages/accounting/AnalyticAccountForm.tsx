import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, ArrowLeft, RefreshCw, Layers, Target } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';
import { api } from '../../services/api';
import { Budget } from '../../types';

export const AnalyticAccountForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { analyticAccounts: contextAnalytics } = useData();

  const isNew = !id || id === 'new';

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Income' | 'Expenses'>('Expenses');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');

  // Loading & Submitting State
  const [loading, setLoading] = useState(!isNew);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});

  // Associated Budgets State
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingBudgets, setLoadingBudgets] = useState(false);

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

  // Fetch Existing Analytic Account & Associated Budgets
  const fetchAnalyticAndBudgets = useCallback(async (accId: string) => {
    try {
      setLoading(true);
      setLoadingBudgets(true);

      const [analyticRes, budgetsRes] = await Promise.allSettled([
        api.getAnalyticById(accId),
        api.getAnalyticBudgets(accId),
      ]);

      if (analyticRes.status === 'fulfilled' && analyticRes.value?.analyticAccount) {
        const acc = analyticRes.value.analyticAccount;
        setName(acc.name || '');
        const normType = String(acc.type).toLowerCase() === 'income' ? 'Income' : 'Expenses';
        setType(normType);
        setCode(acc.code || '');
        setDescription(acc.description || '');
        setStatus(acc.status || 'active');
      } else {
        const localFallback = contextAnalytics.find(a => a.id === accId || a._id === accId || a.code === accId);
        if (localFallback) {
          setName(localFallback.name || '');
          const normType = String(localFallback.type).toLowerCase() === 'income' ? 'Income' : 'Expenses';
          setType(normType);
          setCode(localFallback.code || '');
          setDescription(localFallback.description || '');
          setStatus((localFallback.status as any) || 'active');
        } else {
          showToast({
            type: 'error',
            title: 'Not Found',
            message: 'Analytic account not found or could not be loaded.',
          });
          navigate('/analytic-accounts');
          return;
        }
      }

      if (budgetsRes.status === 'fulfilled' && budgetsRes.value?.budgets) {
        setBudgets(budgetsRes.value.budgets);
      } else {
        try {
          const fallbackBudgets = await api.getBudgets({ analyticAccountId: accId });
          if (fallbackBudgets?.budgets) {
            setBudgets(fallbackBudgets.budgets);
          }
        } catch {
          setBudgets([]);
        }
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Fetch Error',
        message: err.message || 'Error loading analytic account data',
      });
    } finally {
      setLoading(false);
      setLoadingBudgets(false);
    }
  }, [navigate, showToast]);

  useEffect(() => {
    if (!isNew && id) {
      fetchAnalyticAndBudgets(id);
    } else {
      setName('');
      setType('Expenses');
      setCode('');
      setDescription('');
      setStatus('active');
      setBudgets([]);
      setLoading(false);
      setLoadingBudgets(false);
    }
  }, [id, isNew, fetchAnalyticAndBudgets]);

  // Validation
  const validateForm = () => {
    const newErrors: { name?: string; type?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Analytic Account Name is required';
    }

    if (type !== 'Income' && type !== 'Expenses') {
      newErrors.type = 'Type must be either Income or Expenses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Button Actions
  const handleNew = () => {
    navigate('/analytic-accounts/new');
  };

  const handleBack = () => {
    navigate('/analytic-accounts');
  };

  const handleConfirm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      showToast({
        type: 'warning',
        title: 'Validation Failed',
        message: 'Please fill in all required fields properly.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isNew) {
        // Create new Analytic Account
        const res = await api.createAnalytics({
          name: name.trim(),
          type,
          code: code.trim() || undefined,
          description: description.trim() || undefined,
        });

        showToast({
          type: 'success',
          title: 'Analytic Account Created',
          message: `Analytic Account "${name.trim()}" has been saved successfully.`,
        });

        const createdId = res.analyticAccount?._id || res.analyticAccount?.id;
        if (createdId) {
          navigate(`/analytic-accounts/${createdId}`, { replace: true });
        } else {
          navigate('/analytic-accounts');
        }
      } else if (id) {
        // Update existing Analytic Account
        const res = await api.updateAnalytic(id, {
          name: name.trim(),
          type,
          code: code.trim() || undefined,
          description: description.trim() || undefined,
          status,
        });

        showToast({
          type: 'success',
          title: 'Analytic Account Updated',
          message: `Analytic Account "${name.trim()}" changes saved.`,
        });

        if (res.analyticAccount) {
          setName(res.analyticAccount.name || '');
          const normType = String(res.analyticAccount.type).toLowerCase() === 'income' ? 'Income' : 'Expenses';
          setType(normType);
          setCode(res.analyticAccount.code || '');
          setDescription(res.analyticAccount.description || '');
        }

        fetchAnalyticAndBudgets(id);
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save analytic account',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="text-sm font-medium text-slate-500">Loading Analytic Account...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Top Header & Horizontal Action Bar */}
      <PageHeader
        title={isNew ? 'New Analytic Account' : name || 'Analytic Account'}
        subtitle={isNew ? 'Define a new cost or income center' : `Code: ${code || 'Auto-generated'} • ${type}`}
        breadcrumbs={[
          { label: 'Finance' },
          { label: 'Analytic Accounts', href: '/analytic-accounts' },
          { label: isNew ? 'New' : name || 'Details' },
        ]}
        actions={
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleNew}
                disabled={isSubmitting}
              >
                New
              </Button>
              <Button
                variant="primary"
                icon={<Check className="w-4 h-4" />}
                onClick={() => handleConfirm()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Confirm'}
              </Button>
            </div>
            <Button
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </div>
        }
      />

      {/* Main Form Section */}
      <Card noPadding className="overflow-visible">
        <form onSubmit={handleConfirm} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
            {/* 1. Analytic Account Name Field */}
            <div className="min-w-0">
              <Input
                label="Analytic Account"
                required
                placeholder="e.g. Office Renovation"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                error={errors.name}
              />
            </div>

            {/* 2. Type Dropdown Field */}
            <div className="min-w-0">
              <Select
                label="Type"
                required
                options={[
                  { value: 'Income', label: 'Income' },
                  { value: 'Expenses', label: 'Expenses' },
                ]}
                value={type}
                onChange={e => {
                  const val = e.target.value as 'Income' | 'Expenses';
                  setType(val);
                  if (errors.type) setErrors(prev => ({ ...prev, type: undefined }));
                }}
                error={errors.type}
              />
            </div>

            {/* Optional Analytic Code Field */}
            <div className="min-w-0">
              <Input
                label="Analytic Code"
                placeholder="e.g. ANA-EXP-001 (auto-generated if empty)"
                value={code}
                onChange={e => setCode(e.target.value)}
                helperText="Reference code for accounting entries"
                className={!isNew && code ? 'bg-sky-50/80 dark:bg-navy-950' : ''}
              />
            </div>

            {/* Optional Description Field */}
            <div className="min-w-0">
              <Input
                label="Description"
                placeholder="e.g. Operational cost tracking for head office renovations"
                value={description}
                onChange={e => setDescription(e.target.value)}
                helperText="Additional context or purpose for this analytic center"
              />
            </div>
          </div>

          {/* Clean Horizontal Divider */}
          <div className="border-t border-slate-200 dark:border-navy-700 pt-6 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-5 h-5 text-emerald-500 shrink-0" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Budget Usage</h3>
              </div>
              <span className="text-xs text-slate-500 shrink-0">
                {budgets.length} {budgets.length === 1 ? 'Budget' : 'Budgets'} linked to this Analytic Account
              </span>
            </div>

            {/* Budget Usage Table */}
            <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-slate-200 dark:border-navy-700">
              <table className="w-full min-w-[640px] text-left text-xs table-auto">
                <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 whitespace-nowrap text-left">Budget</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Start Date</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">End Date</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right">Committed</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right">Achieved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 bg-white dark:bg-navy-800">
                  {loadingBudgets ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                          <span>Fetching linked budgets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : budgets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Target className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                          <p className="font-semibold text-slate-600 dark:text-slate-300">No linked budgets</p>
                          <p className="text-xs text-slate-400">
                            {isNew
                              ? 'Save this Analytic Account first to link future budgets.'
                              : 'No budget allocations currently utilize this Analytic Account.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    budgets.map(b => {
                      const budgetId = b._id || b.id;
                      return (
                        <tr
                          key={budgetId}
                          className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors cursor-pointer"
                          onClick={() => budgetId && navigate(`/budgets/${budgetId}`)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white min-w-0">
                              <Target className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span className="truncate">{b.name}</span>
                              {b.status && (
                                <span className="ml-1 shrink-0">
                                  <Badge
                                    variant={
                                      b.status === 'CONFIRMED'
                                        ? 'success'
                                        : b.status === 'REVISED'
                                        ? 'warning'
                                        : b.status === 'CANCELLED'
                                        ? 'danger'
                                        : 'default'
                                    }
                                  >
                                    {b.status}
                                  </Badge>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                            {formatDate(b.startDate)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                            {formatDate(b.endDate)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(b.planned)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                            {formatCurrency(b.actual || 0)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
