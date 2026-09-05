import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CreditCard, Armchair } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LifecycleStepper, StepItem } from '../../components/common/LifecycleStepper';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices: localInvoices, payments, contacts, salesOrders = [] } = useData();
  const { showToast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getInvoiceById(id)
      .then(response => setInvoice(response.invoice))
      .catch(error => showToast({ type: 'error', title: 'Unable to load invoice', message: error.message }))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading invoice from MongoDB...</div>;

  if (!invoice) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invoice Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  const customer = invoice.customerId?.address ? invoice.customerId : contacts.find(c => c.id === invoice.customerId);
  const invoiceId = invoice._id || invoice.id;
  const customerId = invoice.customerId?._id || invoice.customerId?.id || invoice.customerId;
  const relatedPayments = payments.filter(p => p.referenceId === invoiceId || p.referenceNumber === invoice.invoiceNumber);
  const linkedSO = invoice.salesOrderId ? salesOrders.find(so => ((so as any)._id || so.id) === ((invoice.salesOrderId as any)?._id || invoice.salesOrderId?.id || invoice.salesOrderId)) : null;

  const steps: StepItem[] = [
    { label: 'Sales Order', isDone: !!linkedSO, refCode: linkedSO ? linkedSO.orderNumber : 'Direct Invoice' },
    { label: 'Customer Invoice', isDone: true, refCode: invoice.invoiceNumber, isCurrent: invoice.outstandingAmount > 0 },
    {
      label: 'Payment Register',
      isDone: invoice.status === 'paid' || relatedPayments.length > 0,
      refCode: relatedPayments.length > 0 ? relatedPayments[0].paymentNumber : undefined,
      isCurrent: invoice.outstandingAmount > 0 && invoice.paidAmount > 0,
    },
    {
      label: 'Accounting Entry',
      isDone: invoice.status === 'paid' || relatedPayments.some(p => !!p.journalEntryId),
      refCode: relatedPayments.find(p => !!p.journalEntryId)?.journalEntryId ? 'JE Posted' : 'JE Posted',
    },
  ];

  const handleDownloadPDF = () => {
    showToast({
      type: 'info',
      title: 'Downloading Tax Invoice PDF',
      message: `Generating tax invoice ${invoice.invoiceNumber}.pdf...`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Tax Invoice ${invoice.invoiceNumber}`}
        subtitle={`Issued on ${invoice.invoiceDate} • Due Date: ${invoice.dueDate}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/invoices')}>
              Back
            </Button>
            <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={handleDownloadPDF}>
              Download PDF
            </Button>
            {invoice.outstandingAmount > 0 && (
              <Button
                variant="primary"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => navigate('/payments/new', { state: { invoiceId, contactId: customerId, amount: invoice.outstandingAmount, refNo: invoice.invoiceNumber } })}
              >
                Record Payment
              </Button>
            )}
          </div>
        }
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: invoice.invoiceNumber }]}
      />

      {/* Connected Transaction Timeline */}
      <LifecycleStepper steps={steps} />

      {/* Printable Invoice Header Card */}
      <Card className="p-8 border-2 border-slate-200 dark:border-navy-700">
        {/* Brand & Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200 dark:border-navy-700">
          <div>
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl">
              <Armchair className="w-7 h-7" />
              <span>Urban Furniture Ltd</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Plot 102, Timber & Furniture Park, Industrial Area Phase II, Mumbai, Maharashtra - 400093
              <br />GSTIN: 27AAACU9988P1Z8
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tax Invoice</h2>
              <Badge status={invoice.status} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">{invoice.invoiceNumber}</p>
            {linkedSO && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline" onClick={() => navigate(`/sales-orders/${linkedSO.id}`)}>
                Linked SO: {linkedSO.orderNumber}
              </p>
            )}
            <p className="text-xs text-slate-500">Invoice Date: {invoice.invoiceDate}</p>
            <p className="text-xs text-slate-500">Due Date: {invoice.dueDate}</p>
          </div>
        </div>

        {/* Bill To Info */}
        <div className="py-6 border-b border-slate-200 dark:border-navy-700">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Billed To Customer:</h4>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{invoice.customerName}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{customer?.address || 'Mumbai, MH'}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">GSTIN: {customer?.taxId || '27AABCA1234F1ZM'}</p>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-3 py-2.5">Item Description</th>
                <th className="px-3 py-2.5 w-16 text-center">Qty</th>
                <th className="px-3 py-2.5 w-28 text-right">Unit Price</th>
                <th className="px-3 py-2.5 w-20 text-center">GST Rate</th>
                <th className="px-3 py-2.5 w-28 text-right">GST Amount</th>
                <th className="px-3 py-2.5 w-32 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
              {invoice.items.map((item: any) => (
                <tr key={item._id || item.id}>
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">{item.productName}</td>
                  <td className="px-3 py-3 text-center">{item.quantity}</td>
                  <td className="px-3 py-3 text-right">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-center">{item.taxRate}%</td>
                  <td className="px-3 py-3 text-right">₹{item.taxAmount.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 font-bold text-right text-slate-900 dark:text-white">
                    ₹{item.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals */}
        <div className="flex flex-col items-end pt-4 border-t border-slate-200 dark:border-navy-700 text-xs space-y-1">
          <div className="flex justify-between w-64 text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-slate-600 dark:text-slate-400">
            <span>GST Output Tax (18%):</span>
            <span>₹{invoice.taxTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-navy-700">
            <span>Grand Total:</span>
            <span>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-emerald-600 font-semibold">
            <span>Amount Paid:</span>
            <span>₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-rose-600 font-extrabold text-sm pt-1 border-t border-slate-100 dark:border-navy-700">
            <span>Balance Due:</span>
            <span>₹{invoice.outstandingAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Card>

      {/* Payment History Section */}
      <Card title="Payment Receipts History">
        {relatedPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                <tr>
                  <th className="px-4 py-2.5">Payment #</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Txn Reference</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5 text-right">Journal Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                {relatedPayments.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-bold">{p.paymentNumber}</td>
                    <td className="px-4 py-2.5">{p.paymentDate}</td>
                    <td className="px-4 py-2.5 uppercase font-semibold">{p.method}</td>
                    <td className="px-4 py-2.5 font-mono">{p.referenceNo || '—'}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/journals/${p.journalEntryId}`)}>
                        JE Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No payment records logged against this invoice yet.</p>
        )}
      </Card>
    </div>
  );
};
