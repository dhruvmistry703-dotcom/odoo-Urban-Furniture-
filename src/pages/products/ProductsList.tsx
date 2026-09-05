import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Tag, Filter, Check } from 'lucide-react';
import { MasterToolbar } from '../../components/common/MasterToolbar';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';

export const ProductsList: React.FC = () => {
  const { products, categories } = useData();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term));

    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter;
    const matchesType = typeFilter === 'all' || p.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every(p => selectedIds.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Top Header matching wireframe */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Product Master
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeView === 'list' ? 'Product Master List View (Default)' : 'Product Master Kanban View'} • Manage products, pricing, categories & inventory
          </p>
        </div>

        {/* Category & Type Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-white dark:bg-navy-900 text-slate-800 dark:text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 text-xs">
            {(['all', 'goods', 'service', 'combo'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-white dark:bg-navy-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reusable Master Toolbar */}
      <MasterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search products by name, category, SKU..."
        activeView={activeView}
        onViewChange={setActiveView}
        onNewClick={() => navigate('/products/new')}
        onBackClick={() => navigate('/dashboard')}
        newButtonText="New"
        selectedCount={selectedIds.length}
      />

      {/* VIEW 1: PRODUCT MASTER LIST VIEW (DEFAULT) */}
      {activeView === 'list' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-navy-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-navy-700 select-none">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="w-14 px-3 py-3">Image</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Sales Price</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                      <tr
                        key={product.id}
                        onClick={() => navigate(`/products/${product.id}`)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-navy-800/50'
                        }`}
                      >
                        <td
                          className="px-4 py-3 text-center"
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleSelect(product.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(product.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-navy-750 flex items-center justify-center border border-slate-200 dark:border-navy-700 shrink-0 shadow-2xs">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {product.name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-navy-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                            <Tag className="w-3 h-3 text-emerald-500" />
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 uppercase font-bold text-[10px] text-slate-500">
                          {product.type}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                          ₹{product.salesPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">
                          ₹{product.purchasePrice.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge status={product.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No products found matching &ldquo;{searchTerm}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PRODUCT MASTER KANBAN VIEW */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="group bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-4 hover:border-emerald-500/60 hover:shadow-lg dark:hover:shadow-navy-950/50 transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center gap-3.5"
              >
                {/* Left Side: Product Image box matching wireframe */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-navy-750 flex items-center justify-center shrink-0 border border-slate-200 dark:border-navy-700 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>

                {/* Right Side: Product Details matching wireframe */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] text-slate-700 dark:text-slate-200 font-bold flex items-center justify-between">
                      <span className="text-slate-400 font-normal">Sales Price</span>
                      <span>₹{product.salesPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="text-slate-400 font-normal">Cost</span>
                      <span>₹{product.purchasePrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-navy-750 text-slate-600 dark:text-slate-300">
                        {product.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {product.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-750">
              No products found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
