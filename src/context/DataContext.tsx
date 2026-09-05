import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Contact,
  Product,
  SalesOrder,
  CustomerInvoice,
  PurchaseOrder,
  VendorBill,
  Payment,
  Account,
  AccountStatus,
  Journal,
  JournalEntry,
  AnalyticAccount,
  Budget,
  LineItem
} from '../types';
import {
  initialContacts,
  initialProducts,
  initialSalesOrders,
  initialInvoices,
  initialPurchaseOrders,
  initialVendorBills,
  initialPayments,
  initialAccounts,
  initialJournals,
  initialJournalEntries,
  initialAnalyticAccounts,
  initialBudgets,
  initialCategories
} from '../data/mockData';

interface DataContextType {
  contacts: Contact[];
  products: Product[];
  categories: string[];
  salesOrders: SalesOrder[];
  invoices: CustomerInvoice[];
  purchaseOrders: PurchaseOrder[];
  bills: VendorBill[];
  payments: Payment[];
  accounts: Account[];
  journals: Journal[];
  journalEntries: JournalEntry[];
  analyticAccounts: AnalyticAccount[];
  budgets: Budget[];

  // Helper actions
  addContact: (contact: Omit<Contact, 'id' | 'totalInvoiced' | 'totalPaid' | 'outstanding'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addCategory: (categoryName: string) => string;
  refreshData: () => Promise<void>;
  createSalesOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber' | 'subtotal' | 'taxTotal' | 'grandTotal' | 'status'> & { items: LineItem[] }) => SalesOrder;
  updateSalesOrderStatus: (id: string, status: SalesOrder['status']) => void;
  convertSOToInvoice: (soId: string) => CustomerInvoice;
  createInvoice: (invoice: Omit<CustomerInvoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'outstandingAmount' | 'status'>) => CustomerInvoice;
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'subtotal' | 'taxTotal' | 'grandTotal' | 'status'> & { items: LineItem[] }) => PurchaseOrder;
  convertPOToBill: (poId: string) => VendorBill;
  createVendorBill: (bill: Omit<VendorBill, 'id' | 'billNumber' | 'paidAmount' | 'outstandingAmount' | 'status'>) => VendorBill;
  recordPayment: (payment: {
    type: Payment['type'];
    contactId: string;
    referenceId?: string;
    referenceNumber?: string;
    paymentDate: string;
    method: Payment['method'];
    bankAccount?: string;
    amount: number;
    referenceNo?: string;
    notes?: string;
  }) => { payment: Payment; journalEntry: JournalEntry };
  addAccount: (account: Omit<Account, 'id' | 'balance'> & { balance?: number }) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  archiveAccount: (id: string) => void;
  addJournal: (journal: Omit<Journal, 'id'>) => Journal;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'isBalanced'>) => JournalEntry;
  addAnalyticAccount: (account: Omit<AnalyticAccount, 'id'>) => AnalyticAccount;
  addBudget: (budget: Omit<Budget, 'id' | 'actual' | 'remaining' | 'utilization' | 'status'>) => Budget;
  resetDemoData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const getStored = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(`urban_furniture_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => getStored('contacts', initialContacts));
  const [products, setProducts] = useState<Product[]>(() => getStored('products', initialProducts));
  const [categories, setCategories] = useState<string[]>(() => getStored('categories', initialCategories));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => getStored('sales_orders', initialSalesOrders));
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => getStored('invoices', initialInvoices));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStored('purchase_orders', initialPurchaseOrders));
  const [bills, setBills] = useState<VendorBill[]>(() => getStored('bills', initialVendorBills));
  const [payments, setPayments] = useState<Payment[]>(() => getStored('payments', initialPayments));
  const [accounts, setAccounts] = useState<Account[]>(() => getStored('accounts', initialAccounts));
  const [journals, setJournals] = useState<Journal[]>(() => getStored('journals', initialJournals));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getStored('journal_entries', initialJournalEntries));
  const [analyticAccounts, setAnalyticAccounts] = useState<AnalyticAccount[]>(() => getStored('analytic_accounts', initialAnalyticAccounts));
  const [budgets, setBudgets] = useState<Budget[]>(() => getStored('budgets', initialBudgets));

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('urban_furniture_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('urban_furniture_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('urban_furniture_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('urban_furniture_sales_orders', JSON.stringify(salesOrders)); }, [salesOrders]);
  useEffect(() => { localStorage.setItem('urban_furniture_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('urban_furniture_purchase_orders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('urban_furniture_bills', JSON.stringify(bills)); }, [bills]);
  useEffect(() => { localStorage.setItem('urban_furniture_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('urban_furniture_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('urban_furniture_journals', JSON.stringify(journals)); }, [journals]);
  useEffect(() => { localStorage.setItem('urban_furniture_journal_entries', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('urban_furniture_analytic_accounts', JSON.stringify(analyticAccounts)); }, [analyticAccounts]);
  useEffect(() => { localStorage.setItem('urban_furniture_budgets', JSON.stringify(budgets)); }, [budgets]);

  const fetchFromBackend = async () => {
    try {
      // 1. Fetch contacts from MongoDB Atlas
      const contactRes = await api.getContacts();
      if (contactRes && contactRes.contacts && Array.isArray(contactRes.contacts) && contactRes.contacts.length > 0) {
        const mappedContacts: Contact[] = contactRes.contacts.map((doc: any) => ({
          id: String(doc._id || doc.id),
          name: doc.name || '',
          type: doc.type || 'customer',
          email: doc.email || '',
          phone: doc.phone || '',
          street: doc.street || '',
          city: doc.city || '',
          state: doc.state || '',
          country: doc.country || 'India',
          pincode: doc.pincode || '',
          image: doc.image || '',
          address: doc.address || [doc.street, doc.city, doc.state, doc.pincode, doc.country].filter(Boolean).join(', '),
          taxId: doc.taxId || '',
          totalInvoiced: doc.totalInvoiced || 0,
          totalPaid: doc.totalPaid || 0,
          outstanding: doc.outstanding || 0,
          status: doc.status || 'active',
        }));
        setContacts(mappedContacts);
      }

      // 2. Fetch products from MongoDB Atlas
      const productRes = await api.getProducts();
      if (productRes && productRes.products && Array.isArray(productRes.products) && productRes.products.length > 0) {
        const mappedProducts: Product[] = productRes.products.map((doc: any) => ({
          id: String(doc._id || doc.id),
          name: doc.name || '',
          sku: doc.sku || '',
          type: doc.type || 'goods',
          category: doc.category || 'Furniture',
          salesPrice: doc.salesPrice || 0,
          purchasePrice: doc.purchasePrice || 0,
          stock: doc.stock ?? 10,
          status: doc.status || 'active',
          description: doc.description || '',
          image: doc.image || '',
        }));
        setProducts(mappedProducts);

        // Derive categories
        const distinctCats = Array.from(new Set([
          ...initialCategories,
          ...mappedProducts.map(p => p.category).filter(Boolean)
        ]));
        setCategories(distinctCats);
      }

      // 3. Fetch categories from Atlas if available
      try {
        const catRes = await api.getCategories();
        if (catRes && catRes.categories && Array.isArray(catRes.categories)) {
          setCategories(prev => Array.from(new Set([...prev, ...catRes.categories])));
        }
      } catch {
        // silent
      }

      // 4. Fetch accounts from MongoDB Atlas
      try {
        const accRes = await api.getAccounts();
        if (accRes && accRes.accounts && Array.isArray(accRes.accounts) && accRes.accounts.length > 0) {
          const mappedAccounts: Account[] = accRes.accounts.map((doc: any) => ({
            id: String(doc._id || doc.id),
            code: doc.code || '',
            name: doc.name || '',
            type: doc.type || 'Asset',
            reportGroup: doc.reportGroup || (['Income', 'Expenses', 'Other Expenses', 'income', 'expense'].includes(doc.type) ? 'Profit and Loss' : 'Balancesheet'),
            balance: doc.balance || 0,
            status: doc.status || 'active',
          }));
          setAccounts(mappedAccounts);
        }
      } catch {
        // silent
      }
    } catch (err) {
      console.warn('[DataContext] MongoDB Atlas sync error:', err);
    }
  };

  // Sync with MongoDB Atlas on mount, window focus, and background polling every 6 seconds
  useEffect(() => {
    fetchFromBackend();

    const handleFocus = () => {
      fetchFromBackend();
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      fetchFromBackend();
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const addCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return '';
    if (!categories.includes(trimmed)) {
      setCategories(prev => [...prev, trimmed]);
    }
    return trimmed;
  };

  const addContact = (contactData: Omit<Contact, 'id' | 'totalInvoiced' | 'totalPaid' | 'outstanding'>) => {
    const computedAddress = contactData.address || [
      contactData.street,
      contactData.city,
      contactData.state,
      contactData.pincode,
      contactData.country
    ].filter(Boolean).join(', ');

    const tempId = `cnt-${Date.now()}`;
    const newContact: Contact = {
      ...contactData,
      address: computedAddress,
      id: tempId,
      totalInvoiced: 0,
      totalPaid: 0,
      outstanding: 0,
    };
    setContacts(prev => [newContact, ...prev]);

    // Save directly into MongoDB Atlas cloud database
    api.createContact({
      ...contactData,
      address: computedAddress,
    }).then(res => {
      if (res && res.contact && res.contact._id) {
        const realId = String(res.contact._id);
        setContacts(prev => prev.map(c => c.id === tempId ? { ...c, id: realId } : c));
      }
    }).catch(err => {
      console.warn('[Atlas Save Error] Could not save contact to Atlas:', err);
    });

    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updates };
        if (!updates.address && (updates.street || updates.city || updates.state || updates.pincode)) {
          merged.address = [merged.street, merged.city, merged.state, merged.pincode, merged.country].filter(Boolean).join(', ');
        }
        return merged;
      }
      return c;
    }));

    // Update in MongoDB Atlas
    api.updateContact(id, updates).catch(err => {
      console.warn('[Atlas Update Error] Could not update contact in Atlas:', err);
    });
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const tempId = `prd-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      sku: productData.sku || `FURN-PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      id: tempId,
    };
    setProducts(prev => [newProduct, ...prev]);

    // Save directly into MongoDB Atlas cloud database
    api.createProduct(newProduct).then(res => {
      if (res && res.product && res.product._id) {
        const realId = String(res.product._id);
        setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: realId } : p));
      }
    }).catch(err => {
      console.warn('[Atlas Save Error] Could not save product to Atlas:', err);
    });

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    // Update in MongoDB Atlas
    api.updateProduct(id, updates).catch(err => {
      console.warn('[Atlas Update Error] Could not update product in Atlas:', err);
    });
  };

  const createSalesOrder = (soData: Omit<SalesOrder, 'id' | 'orderNumber' | 'subtotal' | 'taxTotal' | 'grandTotal' | 'status'> & { items: LineItem[] }) => {
    const subtotal = soData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = soData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const grandTotal = subtotal + taxTotal;
    const orderNumber = `SO-${String(salesOrders.length + 48).padStart(5, '0')}`;

    const newSO: SalesOrder = {
      ...soData,
      id: `so-${Date.now()}`,
      orderNumber,
      subtotal,
      taxTotal,
      grandTotal,
      status: 'confirmed',
    };

    setSalesOrders(prev => [newSO, ...prev]);
    return newSO;
  };

  const updateSalesOrderStatus = (id: string, status: SalesOrder['status']) => {
    setSalesOrders(prev => prev.map(so => so.id === id ? { ...so, status } : so));
  };

  const convertSOToInvoice = (soId: string) => {
    const so = salesOrders.find(s => s.id === soId);
    if (!so) throw new Error('Sales Order not found');

    const invoiceNumber = `INV-${String(invoices.length + 47).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newInvoice: CustomerInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      salesOrderId: so.id,
      customerId: so.customerId,
      customerName: so.customerName,
      invoiceDate: today,
      dueDate: so.dueDate,
      items: so.items,
      subtotal: so.subtotal,
      taxTotal: so.taxTotal,
      grandTotal: so.grandTotal,
      paidAmount: 0,
      outstandingAmount: so.grandTotal,
      status: 'pending',
      notes: so.notes,
    };

    setInvoices(prev => [newInvoice, ...prev]);
    setSalesOrders(prev => prev.map(s => s.id === soId ? { ...s, status: 'completed', invoiceId: newInvoice.id } : s));

    // Update customer total invoiced & outstanding
    setContacts(prev => prev.map(c => {
      if (c.id === so.customerId) {
        return {
          ...c,
          totalInvoiced: c.totalInvoiced + so.grandTotal,
          outstanding: c.outstanding + so.grandTotal,
        };
      }
      return c;
    }));

    return newInvoice;
  };

  const createInvoice = (invData: Omit<CustomerInvoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'outstandingAmount' | 'status'>) => {
    const invoiceNumber = `INV-${String(invoices.length + 47).padStart(5, '0')}`;
    const newInvoice: CustomerInvoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      paidAmount: 0,
      outstandingAmount: invData.grandTotal,
      status: 'pending',
    };

    setInvoices(prev => [newInvoice, ...prev]);
    // Update contact metrics
    setContacts(prev => prev.map(c => {
      if (c.id === invData.customerId) {
        return {
          ...c,
          totalInvoiced: c.totalInvoiced + invData.grandTotal,
          outstanding: c.outstanding + invData.grandTotal,
        };
      }
      return c;
    }));

    return newInvoice;
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'subtotal' | 'taxTotal' | 'grandTotal' | 'status'> & { items: LineItem[] }) => {
    const subtotal = poData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxTotal = poData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const grandTotal = subtotal + taxTotal;
    const poNumber = `PO-${String(purchaseOrders.length + 14).padStart(5, '0')}`;

    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
      subtotal,
      taxTotal,
      grandTotal,
      status: 'confirmed',
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    return newPO;
  };

  const convertPOToBill = (poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) throw new Error('Purchase Order not found');

    const billNumber = `BILL-${String(bills.length + 13).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newBill: VendorBill = {
      id: `bill-${Date.now()}`,
      billNumber,
      purchaseOrderId: po.id,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      billDate: today,
      dueDate: po.dueDate,
      items: po.items,
      subtotal: po.subtotal,
      taxTotal: po.taxTotal,
      grandTotal: po.grandTotal,
      paidAmount: 0,
      outstandingAmount: po.grandTotal,
      status: 'posted',
      notes: po.notes,
    };

    setBills(prev => [newBill, ...prev]);
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'received', billId: newBill.id } : p));

    // Update vendor total invoiced & outstanding
    setContacts(prev => prev.map(c => {
      if (c.id === po.vendorId) {
        return {
          ...c,
          totalInvoiced: c.totalInvoiced + po.grandTotal,
          outstanding: c.outstanding + po.grandTotal,
        };
      }
      return c;
    }));

    return newBill;
  };

  const createVendorBill = (billData: Omit<VendorBill, 'id' | 'billNumber' | 'paidAmount' | 'outstandingAmount' | 'status'>) => {
    const billNumber = `BILL-${String(bills.length + 13).padStart(5, '0')}`;
    const newBill: VendorBill = {
      ...billData,
      id: `bill-${Date.now()}`,
      billNumber,
      paidAmount: 0,
      outstandingAmount: billData.grandTotal,
      status: 'posted',
    };

    setBills(prev => [newBill, ...prev]);
    setContacts(prev => prev.map(c => {
      if (c.id === billData.vendorId) {
        return {
          ...c,
          totalInvoiced: c.totalInvoiced + billData.grandTotal,
          outstanding: c.outstanding + billData.grandTotal,
        };
      }
      return c;
    }));

    return newBill;
  };

  const recordPayment = (pData: {
    type: Payment['type'];
    contactId: string;
    referenceId?: string;
    referenceNumber?: string;
    paymentDate: string;
    method: Payment['method'];
    bankAccount?: string;
    amount: number;
    referenceNo?: string;
    notes?: string;
  }) => {
    const contact = contacts.find(c => c.id === pData.contactId);
    const contactName = contact ? contact.name : 'Unknown Contact';
    const paymentNumber = `PAY-${String(payments.length + 34).padStart(5, '0')}`;
    const jeNumber = `JE-${String(journalEntries.length + 57).padStart(5, '0')}`;

    // Create Journal Entry automatically according to Accounting Logic Rule (Backend / System determines debit & credit)
    const isCustomerPayment = pData.type === 'customer_payment';

    const journalLines = isCustomerPayment ? [
      {
        id: `jel-${Date.now()}-1`,
        accountId: pData.method === 'bank' ? 'acc-1002' : 'acc-1001',
        accountCode: pData.method === 'bank' ? '1002' : '1001',
        accountName: pData.method === 'bank' ? (pData.bankAccount || 'HDFC Bank Main Account') : 'Petty Cash',
        debit: pData.amount,
        credit: 0,
        label: `Payment received from ${contactName}`,
      },
      {
        id: `jel-${Date.now()}-2`,
        accountId: 'acc-1003',
        accountCode: '1003',
        accountName: 'Accounts Receivable',
        debit: 0,
        credit: pData.amount,
        label: `Clear invoice balance ${pData.referenceNumber || ''}`,
      }
    ] : [
      {
        id: `jel-${Date.now()}-1`,
        accountId: 'acc-2001',
        accountCode: '2001',
        accountName: 'Accounts Payable',
        debit: pData.amount,
        credit: 0,
        label: `Vendor bill payment to ${contactName}`,
      },
      {
        id: `jel-${Date.now()}-2`,
        accountId: pData.method === 'bank' ? 'acc-1002' : 'acc-1001',
        accountCode: pData.method === 'bank' ? '1002' : '1001',
        accountName: pData.method === 'bank' ? (pData.bankAccount || 'HDFC Bank Main Account') : 'Petty Cash',
        debit: 0,
        credit: pData.amount,
        label: `Payout for ${pData.referenceNumber || 'Vendor Bill'}`,
      }
    ];

    const newJournalEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: jeNumber,
      date: pData.paymentDate,
      reference: pData.referenceNumber || pData.referenceNo || 'Payment Record',
      journalName: pData.method === 'bank' ? 'Bank Receipts & Payments' : 'Cash Journal',
      lines: journalLines,
      totalDebit: pData.amount,
      totalCredit: pData.amount,
      isBalanced: true,
      status: 'posted',
    };

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      type: pData.type,
      contactId: pData.contactId,
      contactName,
      referenceId: pData.referenceId,
      referenceNumber: pData.referenceNumber,
      paymentDate: pData.paymentDate,
      method: pData.method,
      bankAccount: pData.bankAccount,
      amount: pData.amount,
      referenceNo: pData.referenceNo,
      notes: pData.notes,
      journalEntryId: newJournalEntry.id,
      status: 'posted',
    };

    // Update state
    setPayments(prev => [newPayment, ...prev]);
    setJournalEntries(prev => [newJournalEntry, ...prev]);

    // Update target invoice or bill if linked
    if (pData.referenceId) {
      if (isCustomerPayment) {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === pData.referenceId) {
            const newPaid = inv.paidAmount + pData.amount;
            const newOutstanding = Math.max(0, inv.grandTotal - newPaid);
            const status: CustomerInvoice['status'] = newOutstanding === 0 ? 'paid' : 'partially_paid';
            return {
              ...inv,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
              status,
            };
          }
          return inv;
        }));
      } else {
        setBills(prev => prev.map(b => {
          if (b.id === pData.referenceId) {
            const newPaid = b.paidAmount + pData.amount;
            const newOutstanding = Math.max(0, b.grandTotal - newPaid);
            const status: VendorBill['status'] = newOutstanding === 0 ? 'paid' : 'partially_paid';
            return {
              ...b,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
              status,
            };
          }
          return b;
        }));
      }
    }

    // Update Contact totalPaid and outstanding
    setContacts(prev => prev.map(c => {
      if (c.id === pData.contactId) {
        return {
          ...c,
          totalPaid: c.totalPaid + pData.amount,
          outstanding: Math.max(0, c.outstanding - pData.amount),
        };
      }
      return c;
    }));

    // Update bank/cash account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.code === (pData.method === 'bank' ? '1002' : '1001')) {
        return {
          ...acc,
          balance: isCustomerPayment ? acc.balance + pData.amount : acc.balance - pData.amount,
        };
      }
      if (acc.code === (isCustomerPayment ? '1003' : '2001')) {
        return {
          ...acc,
          balance: Math.max(0, acc.balance - pData.amount),
        };
      }
      return acc;
    }));

    return { payment: newPayment, journalEntry: newJournalEntry };
  };

  const addAccount = (accData: Omit<Account, 'id' | 'balance'> & { balance?: number }) => {
    const tempId = `acc-${Date.now()}`;
    const newAccount: Account = {
      ...accData,
      id: tempId,
      balance: accData.balance || 0,
      status: accData.status || 'active',
    };
    setAccounts(prev => [newAccount, ...prev]);

    // Asynchronously persist to MongoDB Atlas cloud database
    api.createAccount({
      code: accData.code,
      name: accData.name,
      type: accData.type,
      reportGroup: accData.reportGroup,
      status: accData.status || 'active',
      balance: accData.balance || 0,
    })
      .then(res => {
        if (res && res.account && res.account._id) {
          setAccounts(prev => prev.map(a => a.id === tempId ? { ...a, id: String(res.account._id) } : a));
        }
      })
      .catch(err => {
        console.warn('Could not persist account to MongoDB Atlas:', err);
      });

    return newAccount;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    api.updateAccount(id, updates).catch(err => {
      console.warn('Could not update account in MongoDB Atlas:', err);
    });
  };

  const archiveAccount = (id: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus: AccountStatus = a.status === 'archived' ? 'active' : 'archived';
        return { ...a, status: newStatus };
      }
      return a;
    }));
    api.archiveAccount(id).catch(err => {
      console.warn('Could not archive account in MongoDB Atlas:', err);
    });
  };

  const addJournal = (jrnData: Omit<Journal, 'id'>) => {
    const newJournal: Journal = {
      ...jrnData,
      id: `jrn-${Date.now()}`,
    };
    setJournals(prev => [...prev, newJournal]);
    return newJournal;
  };

  const addJournalEntry = (jeData: Omit<JournalEntry, 'id' | 'entryNumber' | 'isBalanced'>) => {
    const entryNumber = `JE-${String(journalEntries.length + 57).padStart(5, '0')}`;
    const totalDebit = jeData.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = jeData.lines.reduce((s, l) => s + l.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const newJE: JournalEntry = {
      ...jeData,
      id: `je-${Date.now()}`,
      entryNumber,
      totalDebit,
      totalCredit,
      isBalanced,
    };
    setJournalEntries(prev => [newJE, ...prev]);
    return newJE;
  };

  const addAnalyticAccount = (anaData: Omit<AnalyticAccount, 'id'>) => {
    const newAna: AnalyticAccount = {
      ...anaData,
      id: `ana-${Date.now()}`,
    };
    setAnalyticAccounts(prev => [...prev, newAna]);
    return newAna;
  };

  const addBudget = (bData: Omit<Budget, 'id' | 'actual' | 'remaining' | 'utilization' | 'status'>) => {
    const newBudget: Budget = {
      ...bData,
      id: `bdg-${Date.now()}`,
      actual: 0,
      remaining: bData.planned,
      utilization: 0,
      status: 'active',
    };
    setBudgets(prev => [newBudget, ...prev]);
    return newBudget;
  };

  const resetDemoData = () => {
    localStorage.clear();
    setContacts(initialContacts);
    setProducts(initialProducts);
    setSalesOrders(initialSalesOrders);
    setInvoices(initialInvoices);
    setPurchaseOrders(initialPurchaseOrders);
    setBills(initialVendorBills);
    setPayments(initialPayments);
    setAccounts(initialAccounts);
    setJournals(initialJournals);
    setJournalEntries(initialJournalEntries);
    setAnalyticAccounts(initialAnalyticAccounts);
    setBudgets(initialBudgets);
    setCategories(initialCategories);
  };

  return (
    <DataContext.Provider
      value={{
        contacts,
        products,
        categories,
        salesOrders,
        invoices,
        purchaseOrders,
        bills,
        payments,
        accounts,
        journals,
        journalEntries,
        analyticAccounts,
        budgets,
        addContact,
        updateContact,
        addProduct,
        updateProduct,
        addCategory,
        createSalesOrder,
        updateSalesOrderStatus,
        convertSOToInvoice,
        createInvoice,
        createPurchaseOrder,
        convertPOToBill,
        createVendorBill,
        recordPayment,
        addAccount,
        updateAccount,
        archiveAccount,
        addJournal,
        addJournalEntry,
        addAnalyticAccount,
        addBudget,
        resetDemoData,
        refreshData: fetchFromBackend,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
