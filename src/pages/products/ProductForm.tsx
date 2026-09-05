import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, ArrowLeft, Package, DollarSign, Layers, Hash } from 'lucide-react';
import { ImageUploadBox } from '../../components/common/ImageUploadBox';
import { Many2OneSelect } from '../../components/common/Many2OneSelect';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ProductType } from '../../types';

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct, addCategory } = useData();
  const { showToast } = useToast();

  const isEditing = Boolean(id && id !== 'new');
  const existingProduct = isEditing ? products.find(p => p.id === id) : null;

  // Form states matching wireframe
  const [name, setName] = useState('');
  const [type, setType] = useState<ProductType>('goods');
  const [category, setCategory] = useState('Furniture');
  const [salesPrice, setSalesPrice] = useState<number | ''>(100);
  const [purchasePrice, setPurchasePrice] = useState<number | ''>(50); // Cost
  const [image, setImage] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState<number>(20);
  const [description, setDescription] = useState('');

  // Sample product presets for fast testing
  const productPresets = [
    { label: 'Office Chair', url: 'https://images.unsplash.com/photo-1580481077198-c8075fe01df1?auto=format&fit=crop&q=80&w=300' },
    { label: 'Wooden Table', url: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&q=80&w=300' },
    { label: 'Sofa', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300' },
    { label: 'Dining Table', url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&q=80&w=300' },
    { label: 'Air Conditioner', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=300' },
    { label: 'Refrigerator', url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&q=80&w=300' },
  ];

  const resetForm = () => {
    setName('');
    setType('goods');
    setCategory(categories[0] || 'Furniture');
    setSalesPrice(100);
    setPurchasePrice(50);
    setImage('');
    setSku(`FURN-PRD-${Math.floor(1000 + Math.random() * 9000)}`);
    setStock(20);
    setDescription('');
  };

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name || '');
      setType(existingProduct.type || 'goods');
      setCategory(existingProduct.category || 'Furniture');
      setSalesPrice(existingProduct.salesPrice ?? 0);
      setPurchasePrice(existingProduct.purchasePrice ?? 0);
      setImage(existingProduct.image || '');
      setSku(existingProduct.sku || '');
      setStock(existingProduct.stock ?? 0);
      setDescription(existingProduct.description || '');
    } else {
      resetForm();
    }
  }, [id, existingProduct]);

  const handleNewRecord = () => {
    resetForm();
    navigate('/products/new');
  };

  const handleCategoryCreateOnTheFly = (newCat: string) => {
    addCategory(newCat);
    showToast({
      type: 'info',
      title: 'Category Created on the fly',
      message: `"${newCat}" saved to Many2one master list.`,
    });
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Product Name is required.',
      });
      return;
    }

    const finalSalesPrice = Number(salesPrice) || 0;
    const finalCost = Number(purchasePrice) || 0;

    if (isEditing && id) {
      updateProduct(id, {
        name,
        type,
        category,
        salesPrice: finalSalesPrice,
        purchasePrice: finalCost,
        image,
        sku: sku || `FURN-PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        stock: Number(stock) || 0,
        description,
      });

      showToast({
        type: 'success',
        title: 'Product Updated',
        message: `${name} has been updated successfully.`,
      });
    } else {
      const created = addProduct({
        name,
        sku: sku || `FURN-PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        type,
        category,
        salesPrice: finalSalesPrice,
        purchasePrice: finalCost,
        stock: Number(stock) || 0,
        status: 'active',
        image,
        description,
      });

      showToast({
        type: 'success',
        title: 'Product Created',
        message: `${created.name} was successfully created.`,
      });
      navigate(`/products/${created.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar (Matching Wireframe: [New] [Confirm] ... [Back]) */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleNewRecord}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-navy-700 transition-all active:scale-95"
            title="Open blank form view to enter new record"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all active:scale-95"
            title="Save and confirm product details"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Confirm</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {existingProduct && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs border border-slate-200 dark:border-navy-750">
              <span className="text-slate-400">SKU:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {existingProduct.sku}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-navy-700 transition-all active:scale-95"
            title="Back to Product Master List View"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Product Form Card matching wireframe */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 shadow-sm p-6 sm:p-8">
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-navy-750 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isEditing ? `Edit Product: ${name || 'Saved Product'}` : 'Product Master Form View'}
            </h2>
            <p className="text-xs text-slate-400">
              Configure product details, type, Many2one category, image, and pricing.
            </p>
          </div>
          {isEditing && existingProduct && (
            <Badge status={existingProduct.status} />
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Image Upload Box */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
              <div className="w-full max-w-[240px] space-y-3">
                <ImageUploadBox
                  label="Upload Image"
                  image={image}
                  onChange={setImage}
                  presets={productPresets}
                  placeholderText="Upload Image"
                />
              </div>
            </div>

            {/* Right Column: Input Fields matching wireframe annotations */}
            <div className="lg:col-span-8 space-y-5">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Product Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Office Chair, Wooden Table, Sofa, Dining Table..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Product Type (Dropdown with Goods, Service, Combo - noted in wireframe) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Product Type</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Dropdown: Goods / Service / Combo
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['goods', 'service', 'combo'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setType(option)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize transition-all text-center ${
                        type === option
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                          : 'border-slate-200 dark:border-navy-700 bg-slate-50/70 dark:bg-navy-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category (Many2one Field - noted in wireframe: "Category can be created and saved on the fly") */}
              <Many2OneSelect
                label="Category"
                value={category}
                onChange={setCategory}
                options={categories}
                onCreate={handleCategoryCreateOnTheFly}
                placeholder="Select or create category on the fly..."
                required
              />

              {/* Pricing Grid: Sales Price and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Sales Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sales Price</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-500">
                      Rs.
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={salesPrice}
                      onChange={e => setSalesPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="100.00"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-extrabold"
                    />
                  </div>
                </div>

                {/* Cost (Purchase Price) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cost (Purchase Price)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-bold text-slate-500">
                      Rs.
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={purchasePrice}
                      onChange={e => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="50.00"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-extrabold"
                    />
                  </div>
                </div>
              </div>

              {/* SKU & Stock Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>SKU Code</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={e => setSku(e.target.value)}
                    placeholder="e.g. FURN-CHR-001"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Inventory Stock Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={e => setStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Product Description / Specifications
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Material, wood specifications, dimensions, finish..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
