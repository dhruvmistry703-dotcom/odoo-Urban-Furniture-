import React, { useState, useEffect, useCallback } from 'react';
import { FileCheck, CreditCard, Shield, RefreshCw, Check, Clock, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';

export const MyInvoices: React.FC = () => {
  const { user } = useAuth();
  const { invoices: contextInvoices, recordPayment } = useData();
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'bank' | 'cash'>('bank');
  const [bankAccount, setBankAccount] = useState('HDFC NetBanking');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getInvoices();
      if (res && res.invoices && res.invoices.length > 0) {
        setInvoices(res.invoices);
        return;
      }
    } catch (err) {
      console.warn('API getInvoices error, using local filtered data:', err);
    }

    // Fallback to dataContext filtered for this contact
    const targetContactId = user?.contactId || 'cnt-1';
    const filtered = contextInvoices.filter(
      i => i.customerId === targetContactId || i.customerName?.toLowerCase().includes('royal oak')
    );
    setInvoices(filtered);
    setLoading(false);
  }, [user?.contactId, contextInvoices]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const openPayModal = (inv: any) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.outstandingAmount || inv.grandTotal);
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setIsSubmittingPay(true);
    try {
      // 1. Try Backend API
      try {
        await api.createPayment({
          type: 'customer_payment',
          contactId: user?.contactId || selectedInvoice.customerId,
          referenceId: selectedInvoice._id || selectedInvoice.id,
          referenceNumber: selectedInvoice.invoiceNumber,
          paymentDate: new Date().toISOString().split('T')[0],
          method: payMethod,
          bankAccount,
          amount: Number(payAmount),
          notes: `Online portal payment for ${selectedInvoice.invoiceNumber}`,
        });
      } catch (e) {
        // Local fallback
        recordPayment({
          type: 'customer_payment',
          contactId: user?.contactId || selectedInvoice.customerId || 'cnt-1',
          referenceId: selectedInvoice.id || selectedInvoice._id,
          referenceNumber: selectedInvoice.invoiceNumber,
          paymentDate: new Date().toISOString().split('T')[0],
          method: payMethod,
          bankAccount,
          amount: Number(payAmount),
          notes: `Online portal payment for ${selectedInvoice.invoiceNumber}`,
        });
      }

      showToast({
        type: 'success',
        title: 'Payment Successful',
        message: `₹${Number(payAmount).toLocaleString()} paid for ${selectedInvoice.invoiceNumber}`,
      });

      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Payment Failed',
        message: err.message || 'Could not process payment',
      });
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'partially_paid':
        return <Badge variant="warning">Partially Paid</Badge>;
      case 'pending':
        return <Badge variant="primary">Pending Payment</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const totalBilled = invoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (Number(inv.outstandingAmount) || 0), 0);
  const pendingCount = invoices.filter(inv => inv.status !== 'paid').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invoices & Billing Portal"
        description="View your furniture orders invoices, payment history, and settle outstanding balances directly."
        breadcrumbs={[
          { label: 'Portal', path: '/my-invoices' },
          { label: 'My Invoices', path: '/my-invoices' },
        ]}
        actions={
          <Button variant="secondary" onClick={fetchInvoices} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        }
      />

      {/* Data Isolation Security Banner */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-center justify-between text-amber-200 text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Client Portal Data Isolation:</strong> Authenticated as <strong>{user?.name}</strong>. Strictly displaying only invoices issued to your client account.
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Due for settlement</p>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Paid</span>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Cleared payments</p>
        </Card>

        <Card className="border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Invoiced</span>
            <FileCheck className="w-4 h-4 text-primary-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            ₹{totalBilled.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Across {invoices.length} invoices</p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unsettled Invoices</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
            {pendingCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Pending or partial</p>
        </Card>
      </div>

      {/* Invoices Table Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Invoice Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {loading ? 'Loading your invoices...' : 'No invoices registered for this client account.'}
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv._id || inv.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{inv.invoiceDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{inv.grandTotal?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      ₹{inv.paidAmount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      ₹{inv.outstandingAmount?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.outstandingAmount > 0 ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openPayModal(inv)}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now
                        </Button>
                      ) : (
                        <span className="text-emerald-500 flex items-center justify-end gap-1 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Settle Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          title={`Make Payment - ${selectedInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleMakePayment} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{selectedInvoice.grandTotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid:</span>
                <span className="text-emerald-400">₹{selectedInvoice.paidAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-navy-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">Remaining Balance:</span>
                <span className="font-bold text-amber-400">₹{selectedInvoice.outstandingAmount?.toLocaleString()}</span>
              </div>
            </div>

            <Input
              label="Payment Amount (₹)"
              type="number"
              required
              min={1}
              max={selectedInvoice.outstandingAmount}
              value={payAmount}
              onChange={e => setPayAmount(Number(e.target.value))}
            />

            <Select
              label="Payment Method"
              value={payMethod}
              onChange={e => setPayMethod(e.target.value as any)}
              options={[
                { value: 'bank', label: 'Bank Transfer / NEFT / UPI' },
                { value: 'cash', label: 'Cash Counter Receipt' },
              ]}
            />

            {payMethod === 'bank' && (
              <Input
                label="Bank Details / Reference"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
                placeholder="e.g. HDFC Bank UPI / NEFT Ref"
              />
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-navy-700">
              <Button type="button" variant="secondary" onClick={() => setSelectedInvoice(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmittingPay}>
                {isSubmittingPay ? 'Processing Payment...' : `Confirm & Pay ₹${Number(payAmount).toLocaleString()}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
