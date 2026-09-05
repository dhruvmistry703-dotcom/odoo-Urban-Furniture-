import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Package, FileText, CreditCard, ArrowRight, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { contacts, products, salesOrders, invoices, bills, payments } = useData();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedContacts = q ? contacts.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) : [];
  const matchedProducts = q ? products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) : [];
  const matchedInvoices = q ? invoices.filter(i => i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)) : [];
  const matchedOrders = q ? salesOrders.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q)) : [];
  const matchedBills = q ? bills.filter(b => b.billNumber.toLowerCase().includes(q) || b.vendorName.toLowerCase().includes(q)) : [];
  const matchedPayments = q ? payments.filter(p => p.paymentNumber.toLowerCase().includes(q) || p.contactName.toLowerCase().includes(q)) : [];

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  const totalResults = matchedContacts.length + matchedProducts.length + matchedInvoices.length + matchedOrders.length + matchedBills.length + matchedPayments.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 px-4">
      <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-navy-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-navy-700/80">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search customers, vendors, products, invoices, bills, orders..."
            className="w-full text-base bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
              Type to search contacts, products, sales orders, invoices, bills, and payments...
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No matching records found for "{query}".
            </div>
          )}

          {/* Contacts */}
          {matchedContacts.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 mr-1.5" /> Contacts ({matchedContacts.length})
              </div>
              <div className="space-y-1">
                {matchedContacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(`/contacts/${c.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700/70 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{c.email} • {c.type}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {matchedProducts.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5 mr-1.5" /> Products ({matchedProducts.length})
              </div>
              <div className="space-y-1">
                {matchedProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/products`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700/70 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">SKU: {p.sku} • ₹{p.salesPrice.toLocaleString('en-IN')}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices */}
          {matchedInvoices.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Invoices ({matchedInvoices.length})
              </div>
              <div className="space-y-1">
                {matchedInvoices.map(inv => (
                  <button
                    key={inv.id}
                    onClick={() => handleSelect(`/invoices/${inv.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700/70 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{inv.invoiceNumber} — {inv.customerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Total: ₹{inv.grandTotal.toLocaleString('en-IN')} • {inv.status}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sales Orders */}
          {matchedOrders.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Sales Orders ({matchedOrders.length})
              </div>
              <div className="space-y-1">
                {matchedOrders.map(so => (
                  <button
                    key={so.id}
                    onClick={() => handleSelect(`/sales-orders/${so.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700/70 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{so.orderNumber} — {so.customerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Grand Total: ₹{so.grandTotal.toLocaleString('en-IN')}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vendor Bills */}
          {matchedBills.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Vendor Bills ({matchedBills.length})
              </div>
              <div className="space-y-1">
                {matchedBills.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(`/vendor-bills/${b.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700/70 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{b.billNumber} — {b.vendorName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Total: ₹{b.grandTotal.toLocaleString('en-IN')}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          {matchedPayments.length > 0 && (
            <div>
              <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Payments ({matchedPayments.length})
              </div>
              <div className="space-y-1">
                {matchedPayments.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(`/payments/${p.id}`)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700/70 text-left transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{p.paymentNumber} — {p.contactName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">₹{p.amount.toLocaleString('en-IN')} via {p.method}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-900 border-t border-slate-100 dark:border-navy-700/80 flex items-center justify-between text-xs text-slate-400">
          <span>Press ESC or click outside to close</span>
          <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-navy-800 rounded font-mono text-[10px]">Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};
