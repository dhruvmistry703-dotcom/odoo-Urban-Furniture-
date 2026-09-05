import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';

export const PurchaseOrdersList: React.FC = () => {
  const { purchaseOrders } = useData();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = purchaseOrders.filter(po => {
    const matchesQuery = po.poNumber.toLowerCase().includes(query.toLowerCase()) || po.vendorName.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        subtitle="Vendor procurement orders for raw timber, steel frames, and hardware"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/purchase-orders/new')}>
            New Purchase Order
          </Button>
        }
      />

      <Card noPadding>
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search PO # or vendor..."
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
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">PO #</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">GST Tax</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {filtered.map(po => (
                <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{po.poNumber}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{po.vendorName}</td>
                  <td className="px-4 py-3 text-slate-500">{po.orderDate}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹{po.subtotal.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">₹{po.taxTotal.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">₹{po.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3"><Badge status={po.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />} onClick={() => navigate(`/purchase-orders/${po.id}`)}>
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
