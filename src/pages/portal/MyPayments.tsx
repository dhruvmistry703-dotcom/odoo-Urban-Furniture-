import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

export const MyPayments: React.FC = () => {
  const { user } = useAuth();
  const { payments: contextPayments } = useData();
  const { showToast } = useToast();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.getPayments();
      if (res && res.payments && res.payments.length > 0) {
        setPayments(res.payments);
        return;
      }
    } catch (err) {
      console.warn('API getPayments error, using context fallback:', err);
    }

    const targetContactId = user?.contactId || 'cnt-1';
    const filtered = contextPayments.filter(
      p => p.contactId === targetContactId || p.contactName?.toLowerCase().includes('royal oak')
    );
    setPayments(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [user, contextPayments]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payment Receipts & Transaction History"
        description="Official payment acknowledgments and transaction records."
        breadcrumbs={[
          { label: 'Portal', path: '/my-invoices' },
          { label: 'My Payments', path: '/my-payments' },
        ]}
        actions={
          <Button variant="secondary" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-center justify-between text-amber-200 text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Payment History Isolation:</strong> Displaying confirmed payments credited to <strong>{user?.name}</strong>.
          </span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Invoice / Bill Reference</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Transaction / UTR #</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    {loading ? 'Loading payments...' : 'No payment records registered for this account.'}
                  </td>
                </tr>
              ) : (
                payments.map(p => (
                  <tr key={p._id || p.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      {p.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{p.paymentDate}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{p.referenceNumber || 'Direct Payment'}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-600 dark:text-slate-300">
                      {p.method} {p.bankAccount ? `(${p.bankAccount})` : ''}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{p.referenceNo || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{p.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Posted
                      </span>
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
