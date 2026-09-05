import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Contact,
  Product,
  SalesOrder,
  CustomerInvoice,
  PurchaseOrder,
  VendorBill,
  Payment,
  Account,
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
  initialBudgets
} from '../data/mockData';

interface DataContextType {
  contacts: Contact[];
  products: Product[];
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
  addAccount: (account: Omit<Account, 'id' | 'balance'>) => Account;
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

  const addContact = (contactData: Omit<Contact, 'id' | 'totalInvoiced' | 'totalPaid' | 'outstanding'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `cnt-${Date.now()}`,
      totalInvoiced: 0,
      totalPaid: 0,
      outstanding: 0,
    };
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now()}`,
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
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

  const addAccount = (accData: Omit<Account, 'id' | 'balance'>) => {
    const newAccount: Account = {
      ...accData,
      id: `acc-${accData.code}`,
      balance: 0,
    };
    setAccounts(prev => [...prev, newAccount]);
    return newAccount;
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
  };

  return (
    <DataContext.Provider
      value={{
        contacts,
        products,
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
        createSalesOrder,
        updateSalesOrderStatus,
        convertSOToInvoice,
        createInvoice,
        createPurchaseOrder,
        convertPOToBill,
        createVendorBill,
        recordPayment,
        addAccount,
        addJournal,
        addJournalEntry,
        addAnalyticAccount,
        addBudget,
        resetDemoData,
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
