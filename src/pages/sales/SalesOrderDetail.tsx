import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, XCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LifecycleStepper, StepItem } from '../../components/common/LifecycleStepper';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';

export const SalesOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { salesOrders, convertSOToInvoice, invoices, payments, updateSalesOrderStatus } = useData();
  const { showToast } = useToast();

  const order = salesOrders.find(s => s.id === id);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sales Order Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/sales-orders')}>Back to Sales Orders</Button>
      </div>
    );
  }

  const linkedInvoice = invoices.find(i => i.salesOrderId === order.id || i.id === order.invoiceId);
  const linkedPayment = payments.find(p => p.referenceId === linkedInvoice?.id || p.id === order.paymentId);

  // Compute steps for Visual Transaction Lifecycle Stepper
  const steps: StepItem[] = [
    { label: 'Sales Order', isDone: true, refCode: order.orderNumber },
    {
      label: 'Customer Invoice',
      isDone: !!linkedInvoice,
      refCode: linkedInvoice ? linkedInvoice.invoiceNumber : undefined,
      isCurrent: !linkedInvoice && order.status !== 'cancelled',
    },
    {
      label: 'Payment Register',
      isDone: !!linkedPayment || (linkedInvoice?.status === 'paid'),
      refCode: linkedPayment ? linkedPayment.paymentNumber : undefined,
      isCurrent: !!linkedInvoice && linkedInvoice.status !== 'paid',
    },
    {
      label: 'Accounting Entry',
      isDone: !!linkedPayment?.journalEntryId || (linkedInvoice?.status === 'paid'),
      refCode: linkedPayment?.journalEntryId ? 'JE Posted' : undefined,
    },
  ];

  const handleConvert = () => {
    try {
      const newInv = convertSOToInvoice(order.id);
      showToast({
        type: 'success',
        title: 'Invoice Created',
        message: `Customer Invoice ${newInv.invoiceNumber} generated from ${order.orderNumber}.`,
      });
      navigate(`/invoices/${newInv.id}`);
    } catch (e: any) {
      showToast({ type: 'error', title: 'Error', message: e.message || 'Could not convert order.' });
    }
  };

  const handleCancel = () => {
    updateSalesOrderStatus(order.id, 'cancelled');
    showToast({ type: 'warning', title: 'Order Cancelled', message: `${order.orderNumber} status changed to cancelled.` });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sales Order ${order.orderNumber}`}
        subtitle={`Created on ${order.orderDate} • Customer: ${order.customerName}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/sales-orders')}>
              Back
            </Button>
            {!order.invoiceId && order.status !== 'cancelled' && (
              <Button variant="primary" icon={<FileCheck className="w-4 h-4" />} onClick={handleConvert}>
                Convert to Invoice
              </Button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <Button variant="danger" size="sm" icon={<XCircle className="w-4 h-4" />} onClick={handleCancel}>
                Cancel Order
              </Button>
            )}
          </div>
        }
        breadcrumbs={[{ label: 'Sales Orders', href: '/sales-orders' }, { label: order.orderNumber }]}
      />

      {/* Visual Transaction Lifecycle Stepper */}
      <LifecycleStepper steps={steps} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Order Line Items">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-3 py-3">Qty</th>
                    <th className="px-3 py-3">Unit Price</th>
                    <th className="px-3 py-3">Tax Rate</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                  {order.items.map(item => (
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
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-48 text-slate-500">
                <span>GST Tax (18%):</span>
                <span>₹{order.taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-48 text-sm font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-navy-700">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{order.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Order Details">
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Order Status:</span>
                <Badge status={order.status} />
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Order Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{order.orderDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Due Date:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{order.dueDate}</span>
              </div>
              {order.notes && (
                <div>
                  <span className="text-slate-400 block font-medium">Notes:</span>
                  <p className="p-2 rounded bg-slate-50 dark:bg-navy-900 text-slate-700 dark:text-slate-300 italic">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
