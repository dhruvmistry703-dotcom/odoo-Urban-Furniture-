import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { LineItemTable } from '../../components/transactions/LineItemTable';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { LineItem } from '../../types';

export const CreateSalesOrder: React.FC = () => {
  const navigate = useNavigate();
  const { contacts, products, createSalesOrder } = useData();
  const { showToast } = useToast();

  const customers = contacts.filter(c => c.type === 'customer' || c.type === 'both');
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Initial line items
  const firstProd = products[0];
  const [items, setItems] = useState<LineItem[]>(() => [
    {
      id: 'li-init-1',
      productId: firstProd?.id || '',
      productName: firstProd?.name || '',
      quantity: 2,
      unitPrice: firstProd?.salesPrice || 12500,
      taxRate: 18,
      taxAmount: (2 * (firstProd?.salesPrice || 12500)) * 0.18,
      total: (2 * (firstProd?.salesPrice || 12500)) * 1.18,
    },
  ]);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxTotal = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = (status: 'draft' | 'confirmed') => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      showToast({ type: 'error', title: 'Customer Required', message: 'Please select a customer.' });
      return;
    }

    const newSO = createSalesOrder({
      customerId: customer.id,
      customerName: customer.name,
      orderDate,
      dueDate,
      items,
      notes,
    });

    if (status === 'draft') {
      newSO.status = 'draft';
    }

    showToast({
      type: 'success',
      title: 'Sales Order Created',
      message: `Sales Order ${newSO.orderNumber} successfully ${status === 'draft' ? 'saved as draft' : 'confirmed'}.`,
    });

    navigate(`/sales-orders/${newSO.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Sales Order"
        subtitle="New quotation or commercial furniture sales agreement"
        action={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/sales-orders')}>
            Back
          </Button>
        }
        breadcrumbs={[{ label: 'Sales Orders', href: '/sales-orders' }, { label: 'New Sales Order' }]}
      />

      <Card>
        <div className="space-y-6">
          {/* Header Customer Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Customer Account"
              required
              options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.email})` }))}
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            />
            <Input
              label="Order Date"
              type="date"
              required
              value={orderDate}
              onChange={e => setOrderDate(e.target.value)}
            />
            <Input
              label="Payment / Delivery Due Date"
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <div className="border-t border-slate-100 dark:border-navy-700 pt-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Order Items</h3>
            <LineItemTable items={items} onChange={setItems} />
          </div>

          <Input
            label="Internal Notes / Shipping Instructions"
            placeholder="Special delivery requirements or assembly instructions..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          {/* Sticky Financial Summary Box */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between p-4 bg-slate-50 dark:bg-navy-900 rounded-xl border border-slate-200/80 dark:border-navy-700/80">
            <div className="text-xs text-slate-500 mb-3 sm:mb-0">
              * GST tax rate is automatically calculated at 18% per line item.
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" icon={<Save className="w-4 h-4" />} onClick={() => handleSubmit('draft')}>
              Save Draft
            </Button>
            <Button type="button" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => handleSubmit('confirmed')}>
              Confirm Order
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
