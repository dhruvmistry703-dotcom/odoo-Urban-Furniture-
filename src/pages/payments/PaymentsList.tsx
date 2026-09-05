import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, ArrowDownLeft, ArrowUpRight, Landmark, Wallet } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';

export const PaymentsList: React.FC = () => {
  const { payments, accounts } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const totalReceived = payments.filter(p => p.type === 'customer_payment').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.type === 'vendor_payment').reduce((sum, p) => sum + p.amount, 0);

  const bankBalance = accounts.find(a => a.code === '1002')?.balance || 0;
  const cashBalance = accounts.find(a => a.code === '1001')?.balance || 0;

  const filtered = payments.filter(p => {
    const matchesQuery = p.paymentNumber.toLowerCase().includes(query.toLowerCase()) || p.contactName.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Register"
        subtitle="Receipts from customers and disbursements to suppliers"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/payments/new')}>
            Record Payment
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total Received</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalReceived.toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-emerald-600 font-medium">Customer Receipts</span>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Total Paid Out</span>
            <ArrowUpRight className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalPaid.toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-rose-600 font-medium">Vendor Disbursements</span>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>HDFC Bank Account</span>
            <Landmark className="w-4 h-4 text-blue-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{bankBalance.toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Current Account 9981</span>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Petty Cash</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{cashBalance.toLocaleString('en-IN')}
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Cash in Hand</span>
        </Card>
      </div>

      <Card noPadding>
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search payment # or contact..."
              icon={<Search className="w-4 h-4" />}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Payment Types</option>
              <option value="customer_payment">Customer Receipts</option>
              <option value="vendor_payment">Vendor Payments</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Payment #</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Reference Doc</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{p.paymentNumber}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.type === 'customer_payment'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {p.type === 'customer_payment' ? 'Receipt' : 'Disbursement'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.contactName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{p.referenceNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{p.paymentDate}</td>
                  <td className="px-4 py-3 uppercase font-semibold text-slate-700 dark:text-slate-300">{p.method}</td>
                  <td
                    className={`px-4 py-3 font-bold ${
                      p.type === 'customer_payment' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => navigate(`/journals/${p.journalEntryId}`)}>
                      Journal Entry
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
