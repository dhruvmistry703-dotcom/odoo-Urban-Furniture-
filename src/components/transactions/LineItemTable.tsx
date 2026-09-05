import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { LineItem } from '../../types';
import { useData } from '../../context/DataContext';
import { Button } from '../ui/Button';

interface LineItemTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export const LineItemTable: React.FC<LineItemTableProps> = ({ items, onChange }) => {
  const { products } = useData();

  const handleProductChange = (index: number, productId: string) => {
    const selected = products.find(p => p.id === productId);
    if (!selected) return;

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const unitPrice = selected.salesPrice;
    const taxRate = 18;
    const taxAmount = qty * unitPrice * (taxRate / 100);
    const total = qty * unitPrice + taxAmount;

    newItems[index] = {
      ...newItems[index],
      productId: selected.id,
      productName: selected.name,
      unitPrice,
      taxRate,
      taxAmount,
      total,
    };
    onChange(newItems);
  };

  const handleQtyChange = (index: number, quantity: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const qty = Math.max(1, quantity);
    const taxAmount = qty * item.unitPrice * (item.taxRate / 100);
    const total = qty * item.unitPrice + taxAmount;

    newItems[index] = {
      ...item,
      quantity: qty,
      taxAmount,
      total,
    };
    onChange(newItems);
  };

  const handleUnitPriceChange = (index: number, unitPrice: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const price = Math.max(0, unitPrice);
    const taxAmount = item.quantity * price * (item.taxRate / 100);
    const total = item.quantity * price + taxAmount;

    newItems[index] = {
      ...item,
      unitPrice: price,
      taxAmount,
      total,
    };
    onChange(newItems);
  };

  const handleAddItem = () => {
    const firstProduct = products[0];
    const defaultPrice = firstProduct ? firstProduct.salesPrice : 5000;
    const taxRate = 18;
    const taxAmount = 1 * defaultPrice * (taxRate / 100);

    const newItem: LineItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      productId: firstProduct ? firstProduct.id : '',
      productName: firstProduct ? firstProduct.name : 'Select Product',
      quantity: 1,
      unitPrice: defaultPrice,
      taxRate,
      taxAmount,
      total: defaultPrice + taxAmount,
    };

    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, idx) => idx !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-navy-700">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-navy-700">
            <tr>
              <th className="px-4 py-3 min-w-[220px]">Product / Service</th>
              <th className="px-3 py-3 w-20">Qty</th>
              <th className="px-3 py-3 w-32">Unit Price (₹)</th>
              <th className="px-3 py-3 w-24">Tax Rate</th>
              <th className="px-3 py-3 w-28">Tax (₹)</th>
              <th className="px-4 py-3 w-32 text-right">Total (₹)</th>
              <th className="px-3 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60 bg-white dark:bg-navy-800">
            {items.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-50/50 dark:hover:bg-navy-700/30">
                <td className="px-4 py-2.5">
                  <select
                    value={item.productId}
                    onChange={e => handleProductChange(index, e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 p-2 text-slate-900 dark:text-white"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — ₹{p.salesPrice.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQtyChange(index, Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 p-2 text-center text-slate-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={e => handleUnitPriceChange(index, Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 p-2 text-right text-slate-900 dark:text-white"
                  />
                </td>
                <td className="px-3 py-2.5 text-slate-500 font-medium text-center">
                  {item.taxRate}% GST
                </td>
                <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 font-medium text-right">
                  ₹{item.taxAmount.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white text-right">
                  ₹{item.total.toLocaleString('en-IN')}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleAddItem}>
        Add Product Line
      </Button>
    </div>
  );
};
