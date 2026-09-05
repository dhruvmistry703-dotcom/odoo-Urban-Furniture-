import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LifecycleStepper, StepItem } from '../../components/common/LifecycleStepper';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const PurchaseOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseOrders, convertPOToBill, bills, payments } = useData();
  const { showToast } = useToast();

  const po = purchaseOrders.find(p => p.id === id);

  if (!po) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Order Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/purchase-orders')}>Back to Purchase Orders</Button>
      </div>
    );
  }

  const linkedBill = bills.find(b => b.purchaseOrderId === po.id || b.id === po.billId);
  const linkedPayment = payments.find(p => p.referenceId === linkedBill?.id || p.referenceNumber === linkedBill?.billNumber);

  const steps: StepItem[] = [
    { label: 'Purchase Order', isDone: true, refCode: po.poNumber },
    {
      label: 'Vendor Bill',
      isDone: !!linkedBill,
      refCode: linkedBill ? linkedBill.billNumber : undefined,
      isCurrent: !linkedBill && po.status !== 'cancelled',
    },
    {
      label: 'Payment Register',
      isDone: !!linkedPayment || (linkedBill?.status === 'paid'),
      refCode: linkedPayment ? linkedPayment.paymentNumber : undefined,
      isCurrent: !!linkedBill && linkedBill.status !== 'paid',
    },
    {
      label: 'Accounting Entry',
      isDone: !!linkedPayment?.journalEntryId || (linkedBill?.status === 'paid'),
      refCode: linkedPayment?.journalEntryId ? 'JE Posted' : undefined,
    },
  ];

  const handleConvert = () => {
    try {
      const newBill = convertPOToBill(po.id);
      showToast({
        type: 'success',
        title: 'Vendor Bill Created',
        message: `Vendor Bill ${newBill.billNumber} created from ${po.poNumber}.`,
      });
      navigate(`/vendor-bills/${newBill.id}`);
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e.message || 'Could not convert PO.' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Purchase Order ${po.poNumber}`}
        subtitle={`Issued on ${po.orderDate} • Supplier: ${po.vendorName}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/purchase-orders')}>
              Back
            </Button>
            {!po.billId && po.status !== 'cancelled' && (
              <Button variant="primary" icon={<FileText className="w-4 h-4" />} onClick={handleConvert}>
                Create Vendor Bill
              </Button>
            )}
          </div>
        }
        breadcrumbs={[{ label: 'Purchase Orders', href: '/purchase-orders' }, { label: po.poNumber }]}
      />

      {/* Visual Transaction Lifecycle Stepper */}
      <LifecycleStepper steps={steps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Procurement Items">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                  <tr>
                    <th className="px-4 py-3">Item Description</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Unit Price</th>
                    <th className="px-3 py-3">Tax Rate</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                  {po.items.map(item => (
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
              <div className="flex justify-between w-48 text-slate-500">
                <span>Subtotal:</span>
                <span>₹{po.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-48 text-slate-500">
                <span>GST Tax (18%):</span>
                <span>₹{po.taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-48 text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-navy-700">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{po.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Supplier Information">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Vendor Account:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{po.vendorName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Order Status:</span>
                <Badge status={po.status} />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Issued Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{po.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Expected Arrival:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{po.dueDate}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
