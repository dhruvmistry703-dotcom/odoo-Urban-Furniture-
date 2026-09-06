import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CreditCard, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LifecycleStepper, StepItem } from '../../components/common/LifecycleStepper';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

export const PurchaseOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseOrders, convertPOToBill, bills, payments } = useData();
  const { showToast } = useToast();
  const [dbPO, setDbPO] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getPurchaseOrderById(id)
      .then(res => {
        if (res && res.purchaseOrder) {
          const doc = res.purchaseOrder;
          setDbPO({
            id: String(doc._id || doc.id),
            poNumber: doc.poNumber || '',
            vendorId: String(doc.vendorId?._id || doc.vendorId || ''),
            vendorName: doc.vendorName || doc.vendorId?.name || '',
            orderDate: doc.orderDate || '',
            dueDate: doc.dueDate || '',
            items: (doc.items || []).map((it: any, idx: number) => ({
              id: String(it._id || it.id || `po-item-${idx}`),
              productId: String(it.productId?._id || it.productId || ''),
              productName: it.productName || '',
              quantity: Number(it.quantity || 1),
              unitPrice: Number(it.unitPrice || 0),
              taxRate: Number(it.taxRate ?? 18),
              taxAmount: Number(it.taxAmount || 0),
              total: Number(it.total || 0),
            })),
            subtotal: Number(doc.subtotal || 0),
            taxTotal: Number(doc.taxTotal || 0),
            grandTotal: Number(doc.grandTotal || 0),
            status: doc.status || 'confirmed',
            billId: doc.billId ? String(doc.billId?._id || doc.billId) : undefined,
            notes: doc.notes || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const localPO = purchaseOrders.find(p => p.id === id || (p as any)._id === id);
  const po = dbPO || localPO;

  if (loading && !po) {
    return <div className="p-8 text-sm text-slate-500">Loading purchase order from MongoDB...</div>;
  }

  if (!po) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Order Not Found</h2>
        <Button className="mt-4" onClick={() => navigate('/purchase-orders')}>Back to Purchase Orders</Button>
      </div>
    );
  }

  const linkedBill = bills.find(b => b.purchaseOrderId === po.id || (b as any).purchaseOrderId?._id === po.id || b.id === po.billId || (po.billId && b.id === (po.billId as any)._id));
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
      refCode: linkedPayment?.journalEntryId ? 'JE Posted' : (linkedBill?.status === 'paid' ? 'JE Posted' : undefined),
    },
  ];

  const handleConvert = async () => {
    try {
      const res = await api.convertPOToVendorBill(po._id || po.id);
      const newBill = res?.bill;
      const targetId = newBill?._id || newBill?.id;

      showToast({
        type: 'success',
        title: 'Vendor Bill Created',
        message: `Vendor Bill ${newBill?.billNumber || ''} created from ${po.poNumber}.`,
      });

      if (targetId) {
        navigate(`/vendor-bills/${targetId}`);
      } else {
        navigate('/vendor-bills');
      }
    } catch (e: any) {
      try {
        const fallbackBill = convertPOToBill(po.id);
        navigate(`/vendor-bills/${fallbackBill.id}`);
      } catch (err: any) {
        showToast({ type: 'error', title: 'Error', message: e.message || 'Could not convert PO.' });
      }
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
            {!linkedBill && po.status !== 'cancelled' && (
              <Button variant="primary" icon={<FileText className="w-4 h-4" />} onClick={handleConvert}>
                Receive Goods & Create Bill
              </Button>
            )}
            {linkedBill && linkedBill.outstandingAmount > 0 && (
              <Button
                variant="primary"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() =>
                  navigate('/payments/new', {
                    state: {
                      billId: linkedBill.id,
                      contactId: po.vendorId,
                      amount: linkedBill.outstandingAmount,
                      refNo: linkedBill.billNumber,
                    },
                  })
                }
              >
                Record Payment
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
                  {po.items?.map((item: any) => (
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

          {/* Linked Vendor Bill and Payment Status */}
          {linkedBill && (
            <Card title="Linked Vendor Bill & Payment Record">
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-navy-800 rounded-xl border border-slate-200 dark:border-navy-700 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{linkedBill.billNumber}</span>
                      <Badge status={linkedBill.status} />
                    </div>
                    <p className="text-slate-500">
                      Billed on {linkedBill.billDate} • Total: ₹{linkedBill.grandTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/vendor-bills/${linkedBill.id}`)}
                  >
                    View Bill
                  </Button>
                </div>

                {linkedPayment ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-slate-900 dark:text-white">{linkedPayment.paymentNumber}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                          Paid via {linkedPayment.method}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">
                        Paid on {linkedPayment.paymentDate} • Amount: ₹{linkedPayment.amount.toLocaleString('en-IN')} ({linkedPayment.bankAccount || 'Bank / Cash'})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => navigate('/payments')}
                    >
                      Payment Register
                    </Button>
                  </div>
                ) : (
                  linkedBill.outstandingAmount > 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-200">Outstanding Due: ₹{linkedBill.outstandingAmount.toLocaleString('en-IN')}</span>
                        <p className="text-amber-700 dark:text-amber-400 text-[11px]">Bill is posted but payment is pending in Payment Register.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() =>
                          navigate('/payments/new', {
                            state: {
                              billId: linkedBill.id,
                              contactId: po.vendorId,
                              amount: linkedBill.outstandingAmount,
                              refNo: linkedBill.billNumber,
                            },
                          })
                        }
                      >
                        Pay Now
                      </Button>
                    </div>
                  )
                )}
              </div>
            </Card>
          )}
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
