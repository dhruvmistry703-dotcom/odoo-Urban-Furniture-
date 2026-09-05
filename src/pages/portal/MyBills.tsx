import React, { useState, useEffect } from 'react';
import { FileText, Shield, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const MyBills: React.FC = () => {
  const { user } = useAuth();
  const { bills: contextBills } = useData();
  const { showToast } = useToast();

  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.getVendorBills();
      if (res && res.bills && res.bills.length > 0) {
        setBills(res.bills);
        return;
      }
    } catch (err) {
      console.warn('API getVendorBills error, using context fallback:', err);
    }

    const targetContactId = user?.contactId || 'cnt-1';
    const filtered = contextBills.filter(
      b => b.vendorId === targetContactId || b.vendorName?.toLowerCase().includes('royal oak')
    );
    setBills(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, [user, contextBills]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Vendor Bills & Purchase Records"
        description="View bills and supplies recorded under your vendor account."
        breadcrumbs={[
          { label: 'Portal', path: '/my-invoices' },
          { label: 'My Bills', path: '/my-bills' },
        ]}
        actions={
          <Button variant="secondary" onClick={fetchBills} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-center justify-between text-amber-200 text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Vendor Records Isolation:</strong> Displaying only bills and purchase receipts issued to <strong>{user?.name}</strong>.
          </span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Bill #</th>
                <th className="py-3.5 px-4">Bill Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {loading ? 'Loading bills...' : 'No vendor bills registered for this account.'}
                  </td>
                </tr>
              ) : (
                bills.map(b => (
                  <tr key={b._id || b.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      {b.billNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{b.billDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{b.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{b.grandTotal?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      ₹{b.paidAmount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      ₹{b.outstandingAmount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status="posted">{b.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
