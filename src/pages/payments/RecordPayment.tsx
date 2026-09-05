import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { useData } from '../../context/DataContext';
import { PaymentType, PaymentMethod, JournalEntry } from '../../types';

export const RecordPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { contacts, invoices, bills, recordPayment } = useData();

  const state = (location.state as any) || {};

  const [paymentType, setPaymentType] = useState<PaymentType>(
    state.billId ? 'vendor_payment' : 'customer_payment'
  );
  const [contactId, setContactId] = useState(state.contactId || contacts[0]?.id || '');
  const [referenceId, setReferenceId] = useState(state.invoiceId || state.billId || '');
  const [referenceNumber, setReferenceNumber] = useState(state.refNo || '');
  const [amount, setAmount] = useState<number>(state.amount || 50000);
  const [method, setMethod] = useState<PaymentMethod>('bank');
  const [bankAccount, setBankAccount] = useState('HDFC Bank - Current A/C 9981');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState(`TXN${Math.floor(100000 + Math.random() * 900000)}`);
  const [notes, setNotes] = useState('');

  // Success state confirmation box
  const [successInfo, setSuccessInfo] = useState<{ amount: number; method: string; je: JournalEntry } | null>(null);

  const availableContacts = contacts.filter(c => {
    if (paymentType === 'customer_payment') return c.type === 'customer' || c.type === 'both';
    return c.type === 'vendor' || c.type === 'both';
  });

  const availableDocs = paymentType === 'customer_payment'
    ? invoices.filter(i => i.customerId === contactId && i.outstandingAmount > 0)
    : bills.filter(b => b.vendorId === contactId && b.outstandingAmount > 0);

  const handleDocChange = (docId: string) => {
    setReferenceId(docId);
    if (paymentType === 'customer_payment') {
      const inv = invoices.find(i => i.id === docId);
      if (inv) {
        setReferenceNumber(inv.invoiceNumber);
        setAmount(inv.outstandingAmount);
      }
    } else {
      const bill = bills.find(b => b.id === docId);
      if (bill) {
        setReferenceNumber(bill.billNumber);
        setAmount(bill.outstandingAmount);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = recordPayment({
      type: paymentType,
      contactId,
      referenceId,
      referenceNumber,
      paymentDate,
      method,
      bankAccount: method === 'bank' ? bankAccount : undefined,
      amount: Number(amount),
      referenceNo,
      notes,
    });

    setSuccessInfo({
      amount: Number(amount),
      method: method === 'bank' ? bankAccount : 'Cash',
      je: result.journalEntry,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Payment"
        subtitle="Register customer payment receipt or vendor bill disbursement"
        action={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/payments')}>
            Back to Payments
          </Button>
        }
        breadcrumbs={[{ label: 'Payments', href: '/payments' }, { label: 'Record Payment' }]}
      />

      {successInfo ? (
        <Card className="border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 p-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Recorded Successfully</h2>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-2">
            ₹{successInfo.amount.toLocaleString('en-IN')} {paymentType === 'customer_payment' ? 'received' : 'disbursed'} via {successInfo.method}
          </p>
          <div className="p-4 bg-white dark:bg-navy-900 rounded-xl border border-emerald-200 dark:border-emerald-800/60 my-6 text-xs text-left space-y-2">
            <div className="flex justify-between font-bold">
              <span>Automatic Accounting Entry Generated:</span>
              <span className="text-emerald-600 font-mono">{successInfo.je.entryNumber}</span>
            </div>
            <p className="text-slate-500">
              Debit / Credit ledger entries posted to General Ledger. Customer outstanding balance adjusted.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate(`/journals/${successInfo.je.id}`)}>
              View Journal Entry ({successInfo.je.entryNumber})
            </Button>
            <Button variant="primary" onClick={() => navigate('/payments')}>
              Back to Payment Register
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Payment Type"
                required
                options={[
                  { value: 'customer_payment', label: 'Customer Payment Receipt' },
                  { value: 'vendor_payment', label: 'Vendor Bill Disbursement' },
                ]}
                value={paymentType}
                onChange={e => {
                  setPaymentType(e.target.value as PaymentType);
                  setReferenceId('');
                  setReferenceNumber('');
                }}
              />

              <Select
                label={paymentType === 'customer_payment' ? 'Customer Account' : 'Vendor Account'}
                required
                options={availableContacts.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))}
                value={contactId}
                onChange={e => setContactId(e.target.value)}
              />
            </div>

            <Select
              label={paymentType === 'customer_payment' ? 'Select Invoice to Clear' : 'Select Vendor Bill'}
              options={[
                { value: '', label: '-- General Advance Payment (No linked doc) --' },
                ...availableDocs.map(d => ({
                  value: d.id,
                  label: `${'invoiceNumber' in d ? d.invoiceNumber : d.billNumber} — Due: ₹${d.outstandingAmount.toLocaleString('en-IN')}`,
                })),
              ]}
              value={referenceId}
              onChange={e => handleDocChange(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Payment Amount (₹)"
                type="number"
                required
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
              />
              <Input
                label="Payment Date"
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Payment Method"
                required
                options={[
                  { value: 'bank', label: 'Bank Transfer (NEFT/RTGS/IMPS)' },
                  { value: 'cash', label: 'Cash in Hand' },
                ]}
                value={method}
                onChange={e => setMethod(e.target.value as PaymentMethod)}
              />

              {method === 'bank' ? (
                <Select
                  label="Bank Account"
                  options={[
                    { value: 'HDFC Bank - Current A/C 9981', label: 'HDFC Bank (A/C 9981)' },
                    { value: 'ICICI Bank - Current A/C 4099', label: 'ICICI Bank (A/C 4099)' },
                  ]}
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                />
              ) : (
                <Input
                  label="Cash Account"
                  disabled
                  value="Petty Cash (Account 1001)"
                />
              )}
            </div>

            <Input
              label="Transaction Reference / Cheque No"
              placeholder="e.g. TXN123456 or CHQ-9948"
              value={referenceNo}
              onChange={e => setReferenceNo(e.target.value)}
            />

            <Input
              label="Payment Notes"
              placeholder="Notes or transaction reference detail..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
              <Button type="button" variant="outline" onClick={() => navigate('/payments')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={<CreditCard className="w-4 h-4" />}>
                Record Payment
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
