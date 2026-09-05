import React, { useState } from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ProductType } from '../../types';

export const ProductsList: React.FC = () => {
  const { products, addProduct } = useData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [type, setType] = useState<ProductType>('goods');
  const [category, setCategory] = useState('Seating');
  const [salesPrice, setSalesPrice] = useState(10000);
  const [purchasePrice, setPurchasePrice] = useState(6000);
  const [stock, setStock] = useState(10);
  const [description, setDescription] = useState('');

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd = addProduct({
      name,
      sku: sku || `FURN-PRD-${Math.floor(100 + Math.random() * 900)}`,
      type,
      category,
      salesPrice: Number(salesPrice),
      purchasePrice: Number(purchasePrice),
      stock: Number(stock),
      status: 'active',
      description,
    });

    showToast({
      type: 'success',
      title: 'Product Added',
      message: `${newProd.name} saved with SKU ${newProd.sku}.`,
    });

    setIsModalOpen(false);
    setName('');
    setSku('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Services"
        subtitle="Manage inventory items, pricing, and service catalog"
        action={
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add Product
          </Button>
        }
      />

      <Card noPadding>
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search by product name or SKU..."
              icon={<Search className="w-4 h-4" />}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Sales Price</th>
                <th className="px-4 py-3">Purchase Cost</th>
                <th className="px-4 py-3">Stock Qty</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      {product.name}
                    </div>
                    {product.description && (
                      <p className="text-[11px] text-slate-400 truncate max-w-xs pl-6">{product.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{product.sku}</td>
                  <td className="px-4 py-3 uppercase text-[10px] font-bold text-slate-500">{product.type}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-300 font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    ₹{product.salesPrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    ₹{product.purchasePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    <span className={product.stock < 10 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={product.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Product Name"
            required
            placeholder="e.g. Ergonomic Office Desk"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SKU Code"
              placeholder="FURN-DSK-009"
              value={sku}
              onChange={e => setSku(e.target.value)}
            />
            <Select
              label="Product Type"
              options={[
                { value: 'goods', label: 'Goods (Physical Inventory)' },
                { value: 'service', label: 'Service' },
                { value: 'combo', label: 'Combo Package' },
              ]}
              value={type}
              onChange={e => setType(e.target.value as ProductType)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Category"
              placeholder="Seating / Desks / Tables"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
            <Input
              label="Sales Price (₹)"
              type="number"
              value={salesPrice}
              onChange={e => setSalesPrice(Number(e.target.value))}
            />
            <Input
              label="Purchase Price (₹)"
              type="number"
              value={purchasePrice}
              onChange={e => setPurchasePrice(Number(e.target.value))}
            />
          </div>

          <Input
            label="Initial Stock Quantity"
            type="number"
            value={stock}
            onChange={e => setStock(Number(e.target.value))}
          />

          <Input
            label="Product Description"
            placeholder="Key specifications, wood type, dimension details..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
