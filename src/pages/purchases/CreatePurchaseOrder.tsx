import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { LineItemTable } from '../../components/transactions/LineItemTable';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { LineItem } from '../../types';

export const CreatePurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, products, createPurchaseOrder } = useData();
  const { showToast } = useToast();

  const vendors = contacts.filter(c => c.type === 'vendor' || c.type === 'both');
  const [vendorId, setVendorId] = useState(vendors[0]?.id || '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  const firstProd = products[0];
  const [items, setItems] = useState<LineItem[]>(() => [
    {
      id: 'li-po-init-1',
      productId: firstProd?.id || '',
      productName: firstProd?.name || '',
      quantity: 5,
      unitPrice: firstProd?.purchasePrice || 7200,
      taxRate: 18,
      taxAmount: (5 * (firstProd?.purchasePrice || 7200)) * 0.18,
      total: (5 * (firstProd?.purchasePrice || 7200)) * 1.18,
    },
  ]);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async () => {
    const vendor = vendors.find(v => v.id === vendorId || (v as any)._id === vendorId);
    if (!vendor) {
      showToast({ type: 'error', title: 'Vendor Required', message: 'Please select a vendor.' });
      return;
    }

    try {
      const res = await api.createPurchaseOrder({
        vendorId: vendor.id || (vendor as any)._id,
        vendorName: vendor.name,
        orderDate,
        dueDate,
        items,
        notes,
      });

      const createdPO = res?.purchaseOrder;
      const targetId = createdPO?._id || createdPO?.id;

      showToast({
        type: 'success',
        title: 'Purchase Order Issued',
        message: `Purchase Order ${createdPO?.poNumber || ''} confirmed with ${createdPO?.vendorName || vendor.name}.`,
      });

      if (targetId) {
        navigate(`/purchase-orders/${targetId}`);
      } else {
        navigate('/purchase-orders');
      }
    } catch (err: any) {
      const newPO = createPurchaseOrder({
        vendorId: vendor.id,
        vendorName: vendor.name,
        orderDate,
        dueDate,
        items,
        notes,
      });

      showToast({
        type: 'success',
        title: 'Purchase Order Issued',
        message: `Purchase Order ${newPO.poNumber} confirmed with ${newPO.vendorName}.`,
      });

      navigate(`/purchase-orders/${newPO.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Purchase Order"
        subtitle="Issue raw materials procurement order to suppliers"
        action={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/purchase-orders')}>
            Back
          </Button>
        }
        breadcrumbs={[{ label: 'Purchase Orders', href: '/purchase-orders' }, { label: 'New Purchase Order' }]}
      />

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Supplier / Vendor Account"
              required
              options={vendors.map(v => ({ value: v.id, label: `${v.name} (${v.email})` }))}
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
            />
            <Input
              label="Order Date"
              type="date"
              required
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
            />
            <Input
              label="Expected Delivery Date"
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="border-t border-slate-100 dark:border-navy-700 pt-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Procurement Items</h3>
            <LineItemTable items={items} onChange={setItems} />
          </div>

          <Input
            label="Procurement / Dispatch Notes"
            placeholder="Timber quality standard requirements, sawmill delivery instructions..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200/80 dark:border-navy-700/80">
            <div className="text-xs text-slate-500 mb-3 sm:mb-0">
              * Supplier GST input tax credit is estimated at 18%.
            </div>
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>GST Tax (18%):</span>
                <span className="font-semibold">₹{taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-navy-700">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => navigate('/purchase-orders')}>
              Cancel
            </Button>
            <Button type="button" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleSubmit}>
              Issue Purchase Order
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
