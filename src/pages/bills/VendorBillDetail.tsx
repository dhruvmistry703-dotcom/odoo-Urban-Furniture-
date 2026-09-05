import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LifecycleStepper, StepItem } from '../../components/common/LifecycleStepper';
import { useData } from '../../context/DataContext';

export const VendorBillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bills, payments, contacts, purchaseOrders } = useData();

  const bill = bills.find(b => b.id === id);

  if (!bill) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vendor Bill Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/vendor-bills')}>Back to Bills</Button>
      </div>
    );
  }

  const vendor = contacts.find(c => c.id === bill.vendorId);
  const linkedPO = purchaseOrders.find(p => p.id === bill.purchaseOrderId || p.billId === bill.id);
  const relatedPayments = payments.filter(p => p.referenceId === bill.id || p.referenceNumber === bill.billNumber);

  const steps: StepItem[] = [
    { label: 'Purchase Order', isDone: !!linkedPO, refCode: linkedPO ? linkedPO.poNumber : 'Direct Bill' },
    { label: 'Vendor Bill', isDone: true, refCode: bill.billNumber, isCurrent: bill.outstandingAmount > 0 },
    {
      label: 'Payment Register',
      isDone: bill.status === 'paid' || relatedPayments.length > 0,
      refCode: relatedPayments.length > 0 ? relatedPayments[0].paymentNumber : undefined,
      isCurrent: bill.outstandingAmount > 0 && bill.paidAmount > 0,
    },
    {
      label: 'Accounting Entry',
      isDone: bill.status === 'paid' || relatedPayments.some(p => !!p.journalEntryId),
      refCode: relatedPayments.find(p => !!p.journalEntryId)?.journalEntryId ? 'JE Posted' : 'JE Posted',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Vendor Bill ${bill.billNumber}`}
        subtitle={`Issued on ${bill.billDate} • Supplier: ${bill.vendorName}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/vendor-bills')}>
              Back
            </Button>
            {bill.outstandingAmount > 0 && (
              <Button
                variant="primary"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => navigate('/payments/new', { state: { billId: bill.id, contactId: bill.vendorId, amount: bill.outstandingAmount, refNo: bill.billNumber } })}
              >
                Record Vendor Payment
              </Button>
            )}
          </div>
        }
        breadcrumbs={[{ label: 'Vendor Bills', href: '/vendor-bills' }, { label: bill.billNumber }]}
      />

      {/* Connected Transaction Timeline */}
      <LifecycleStepper steps={steps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Bill Item Details">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Unit Price</th>
                    <th className="px-3 py-3">Tax</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                  {bill.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{item.productName}</td>
                      <td className="px-3 py-3">{item.quantity}</td>
                      <td className="px-3 py-3">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3">{item.taxRate}% GST</td>
                      <td className="px-4 py-3 font-bold text-right text-slate-900 dark:text-white">
                        ₹{item.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-navy-700 flex flex-col items-end text-xs space-y-1">
              <div className="flex justify-between w-56 text-slate-500">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-56 text-slate-500">
                <span>GST Tax (18%):</span>
                <span>₹{bill.taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-56 text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-navy-700">
                <span>Grand Total:</span>
                <span>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-56 text-emerald-600 font-semibold">
                <span>Amount Paid:</span>
                <span>₹{bill.paidAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-56 text-rose-600 font-extrabold text-sm pt-1 border-t border-slate-100 dark:border-navy-700">
                <span>Outstanding Due:</span>
                <span>₹{bill.outstandingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>

          {/* Payment History */}
          <Card title="Payment Outflow History">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                    {relatedPayments.map(p => (
                      <tr key={p.id}>
                        <td className="px-4 py-2.5 font-bold">{p.paymentNumber}</td>
                        <td className="px-4 py-2.5">{p.paymentDate}</td>
                        <td className="px-4 py-2.5 uppercase font-semibold">{p.method}</td>
                        <td className="px-4 py-2.5 font-mono">{p.referenceNo || '—'}</td>
                        <td className="px-4 py-2.5 font-bold text-rose-600">₹{p.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No vendor payments recorded yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Vendor Details">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Vendor Account:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{bill.vendorName}</span>
              </div>
              {linkedPO && (
                <div>
                  <span className="text-slate-400 block font-medium">Linked PO Reference:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline" onClick={() => navigate(`/purchase-orders/${linkedPO.id}`)}>
                    {linkedPO.poNumber}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block font-medium">GSTIN:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{vendor?.taxId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bill Status:</span>
                <Badge status={bill.status} />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bill Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{bill.billDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Due Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{bill.dueDate}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
