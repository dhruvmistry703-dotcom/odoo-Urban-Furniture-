import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';

export const RecentTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, bills } = useData();

  const recentInvoices = invoices.slice(0, 4);
  const recentBills = bills.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Invoices */}
      <Card
        title="Recent Customer Invoices"
        subtitle="Latest sales invoices issued"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
            View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {recentInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
                    {inv.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    ₹{inv.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${inv.id}`)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Vendor Bills */}
      <Card
        title="Recent Vendor Bills"
        subtitle="Latest purchase bills received"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/vendor-bills')}>
            View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Bill #</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {recentBills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{bill.billNumber}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
                    {bill.vendorName}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{bill.billDate}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    ₹{bill.grandTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={bill.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/vendor-bills/${bill.id}`)}>
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
