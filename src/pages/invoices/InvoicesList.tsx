import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';

export const InvoicesList: React.FC = () => {
  const { invoices } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = invoices.filter(inv => {
    const matchesQuery = inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) || inv.customerName.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Invoices"
        subtitle="Tax invoices issued to customers and receivable tracking"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/sales-orders/new')}>
            Create Invoice
          </Button>
        }
      />

      <Card noPadding>
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search invoice # or customer..."
              icon={<Search className="w-4 h-4" />}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Paid Amount</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{inv.customerName}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.dueDate}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-rose-600 font-semibold">₹{inv.outstandingAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge status={inv.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => navigate(`/invoices/${inv.id}`)}>
                      View
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
