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
  updateJournal: (id: string, updates: Partial<Journal>) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'isBalanced' | 'totalDebit' | 'totalCredit'>) => JournalEntry;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => void;
  postJournalEntry: (id: string) => void;
  cancelJournalEntry: (id: string) => void;
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
  const [contacts, setContacts] = useState<Contact[]>(() => getStored('contacts', []));
  const [products, setProducts] = useState<Product[]>(() => getStored('products', []));
  const [categories, setCategories] = useState<string[]>(() => getStored('categories', ['Furniture', 'Seating', 'Tables', 'Living & Lounge', 'Dining', 'Storage', 'Electronics', 'Services']));
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(() => getStored('sales_orders', []));
  const [invoices, setInvoices] = useState<CustomerInvoice[]>(() => getStored('invoices', []));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStored('purchase_orders', []));
  const [bills, setBills] = useState<VendorBill[]>(() => getStored('bills', []));
  const [payments, setPayments] = useState<Payment[]>(() => getStored('payments', []));
  const [accounts, setAccounts] = useState<Account[]>(() => getStored('accounts', []));
  const [journals, setJournals] = useState<Journal[]>(() => getStored('journals', []));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getStored('journal_entries', []));
  const [analyticAccounts, setAnalyticAccounts] = useState<AnalyticAccount[]>(() => getStored('analytic_accounts', []));
  const [budgets, setBudgets] = useState<Budget[]>(() => getStored('budgets', []));

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
      try {
        const contactRes = await api.getContacts();
        if (contactRes && contactRes.contacts && Array.isArray(contactRes.contacts)) {
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
      } catch (err) {
        console.warn('[DataContext] Error fetching contacts from MongoDB Atlas:', err);
      }

      // 2. Fetch products from MongoDB Atlas
      try {
        const productRes = await api.getProducts();
        if (productRes && productRes.products && Array.isArray(productRes.products)) {
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

          const distinctCats = Array.from(new Set([
            'Furniture', 'Seating', 'Tables', 'Living & Lounge', 'Dining', 'Storage', 'Electronics', 'Services',
            ...mappedProducts.map(p => p.category).filter(Boolean)
          ]));
          setCategories(distinctCats);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching products from MongoDB Atlas:', err);
      }

      // 3. Fetch accounts from MongoDB Atlas
      try {
        const accRes = await api.getAccounts();
        if (accRes && accRes.accounts && Array.isArray(accRes.accounts)) {
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
      } catch (err) {
        console.warn('[DataContext] Error fetching accounts from MongoDB Atlas:', err);
      }

      // 5. Fetch journals from MongoDB Atlas
      try {
        const jrnRes = await api.getJournals();
        if (jrnRes && jrnRes.journals && Array.isArray(jrnRes.journals) && jrnRes.journals.length > 0) {
          const mappedJournals: Journal[] = jrnRes.journals.map((doc: any) => ({
            id: String(doc._id || doc.id),
            name: doc.name || '',
            code: doc.code || '',
            type: doc.type || 'sales',
            defaultAccountId: String(doc.defaultAccountId?._id || doc.defaultAccountId || ''),
            defaultAccountName: doc.defaultAccountName || '',
            status: doc.status || 'active',
          }));
          setJournals(mappedJournals);
        }
      } catch {
        // silent
      }

      // 6. Fetch journal entries from MongoDB Atlas
      try {
        const jeRes = await api.getJournalEntries();
        if (jeRes && jeRes.entries && Array.isArray(jeRes.entries) && jeRes.entries.length > 0) {
          const mappedEntries: JournalEntry[] = jeRes.entries.map((doc: any) => ({
            id: String(doc._id || doc.id),
            entryNumber: doc.entryNumber || '',
            date: doc.date || '',
            reference: doc.reference || '',
            journalId: String(doc.journalId?._id || doc.journalId || ''),
            journalName: doc.journalName || '',
            partnerId: String(doc.partnerId?._id || doc.partnerId || ''),
            partnerName: doc.partnerName || '',
            lines: (doc.lines || []).map((l: any, idx: number) => ({
              id: String(l._id || l.id || `line-${idx}`),
              accountId: String(l.accountId?._id || l.accountId || ''),
              accountCode: l.accountCode || '',
              accountName: l.accountName || '',
              partnerId: String(l.partnerId?._id || l.partnerId || ''),
              partnerName: l.partnerName || '',
              debit: Number(l.debit || 0),
              credit: Number(l.credit || 0),
              label: l.label || '',
            })),
            totalDebit: Number(doc.totalDebit || 0),
            totalCredit: Number(doc.totalCredit || 0),
            isBalanced: Boolean(doc.isBalanced),
            status: doc.status || 'draft',
          }));
          setJournalEntries(mappedEntries);
        }
      } catch {
        // silent
      }

      // 7. Fetch sales orders from MongoDB Atlas
      try {
        const soRes = await api.getSalesOrders();
        if (soRes && soRes.salesOrders && Array.isArray(soRes.salesOrders)) {
          const mappedSO: SalesOrder[] = soRes.salesOrders.map((doc: any) => ({
            id: String(doc._id || doc.id),
            orderNumber: doc.orderNumber || '',
            customerId: String(doc.customerId?._id || doc.customerId || ''),
            customerName: doc.customerName || doc.customerId?.name || '',
            orderDate: doc.orderDate || '',
            dueDate: doc.dueDate || '',
            items: (doc.items || []).map((it: any, idx: number) => ({
              id: String(it._id || it.id || `so-item-${idx}`),
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
            invoiceId: doc.invoiceId ? String(doc.invoiceId?._id || doc.invoiceId) : undefined,
            notes: doc.notes || '',
          }));
          if (mappedSO.length > 0) {
            setSalesOrders(mappedSO);
          }
        }
      } catch {
        // silent
      }

      // 8. Fetch customer invoices from MongoDB Atlas
      try {
        const invRes = await api.getInvoices();
        if (invRes && invRes.invoices && Array.isArray(invRes.invoices)) {
          const mappedInv: CustomerInvoice[] = invRes.invoices.map((doc: any) => ({
            id: String(doc._id || doc.id),
            invoiceNumber: doc.invoiceNumber || '',
            salesOrderId: doc.salesOrderId ? String(doc.salesOrderId?._id || doc.salesOrderId) : undefined,
            customerId: String(doc.customerId?._id || doc.customerId || ''),
            customerName: doc.customerName || doc.customerId?.name || '',
            invoiceDate: doc.invoiceDate || '',
            dueDate: doc.dueDate || '',
            items: (doc.items || []).map((it: any, idx: number) => ({
              id: String(it._id || it.id || `inv-item-${idx}`),
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
            paidAmount: Number(doc.paidAmount || 0),
            outstandingAmount: Number(doc.outstandingAmount ?? (doc.grandTotal - (doc.paidAmount || 0))),
            status: doc.status || 'pending',
            notes: doc.notes || '',
          }));
          if (mappedInv.length > 0) {
            setInvoices(mappedInv);
          }
        }
      } catch {
        // silent
      }

      // 9. Fetch purchase orders from MongoDB Atlas
      try {
        const poRes = await api.getPurchaseOrders();
        if (poRes && poRes.purchaseOrders && Array.isArray(poRes.purchaseOrders)) {
          const mappedPO: PurchaseOrder[] = poRes.purchaseOrders.map((doc: any) => ({
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
          }));
          if (mappedPO.length > 0) {
            setPurchaseOrders(mappedPO);
          }
        }
      } catch {
        // silent
      }

      // 10. Fetch vendor bills from MongoDB Atlas
      try {
        const billRes = await api.getVendorBills();
        if (billRes && billRes.bills && Array.isArray(billRes.bills)) {
          const mappedBills: VendorBill[] = billRes.bills.map((doc: any) => ({
            id: String(doc._id || doc.id),
            billNumber: doc.billNumber || '',
            purchaseOrderId: doc.purchaseOrderId ? String(doc.purchaseOrderId?._id || doc.purchaseOrderId) : undefined,
            vendorId: String(doc.vendorId?._id || doc.vendorId || ''),
            vendorName: doc.vendorName || doc.vendorId?.name || '',
            billDate: doc.billDate || '',
            dueDate: doc.dueDate || '',
            items: (doc.items || []).map((it: any, idx: number) => ({
              id: String(it._id || it.id || `bill-item-${idx}`),
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
            paidAmount: Number(doc.paidAmount || 0),
            outstandingAmount: Number(doc.outstandingAmount ?? (doc.grandTotal - (doc.paidAmount || 0))),
            status: doc.status || 'posted',
            notes: doc.notes || '',
          }));
          if (mappedBills.length > 0) {
            setBills(mappedBills);
          }
        }
      } catch {
        // silent
      }

      // 11. Fetch payments from MongoDB Atlas
      try {
        const payRes = await api.getPayments();
        if (payRes && payRes.payments && Array.isArray(payRes.payments)) {
          const mappedPayments: Payment[] = payRes.payments.map((doc: any) => ({
            id: String(doc._id || doc.id),
            paymentNumber: doc.paymentNumber || '',
            type: doc.type || 'customer_payment',
            contactId: String(doc.contactId?._id || doc.contactId || ''),
            contactName: doc.contactName || doc.contactId?.name || '',
            referenceId: doc.referenceId ? String(doc.referenceId?._id || doc.referenceId) : undefined,
            referenceNumber: doc.referenceNumber || '',
            paymentDate: doc.paymentDate || '',
            method: doc.method || 'bank',
            bankAccount: doc.bankAccount || '',
            amount: doc.amount || 0,
            referenceNo: doc.referenceNo || '',
            notes: doc.notes || '',
            journalEntryId: String(doc.journalEntryId?._id || doc.journalEntryId || ''),
            status: doc.status || 'posted',
          }));
          setPayments(mappedPayments);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching payments from MongoDB Atlas:', err);
      }

      // 7. Fetch Journals from MongoDB Atlas
      try {
        const jrnRes = await api.getJournals();
        if (jrnRes && jrnRes.journals && Array.isArray(jrnRes.journals)) {
          const mappedJournals: Journal[] = jrnRes.journals.map((doc: any) => ({
            id: String(doc._id || doc.id),
            name: doc.name || '',
            code: doc.code || '',
            type: doc.type || 'general',
            status: doc.status || 'active',
          }));
          setJournals(mappedJournals);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching journals from MongoDB Atlas:', err);
      }

      // 8. Fetch Journal Entries from MongoDB Atlas
      try {
        const jeRes = await api.getJournalEntries();
        if (jeRes && jeRes.entries && Array.isArray(jeRes.entries)) {
          const mappedEntries: JournalEntry[] = jeRes.entries.map((doc: any) => ({
            id: String(doc._id || doc.id),
            entryNumber: doc.entryNumber || '',
            date: doc.date || '',
            reference: doc.reference || '',
            journalName: doc.journalName || '',
            lines: doc.lines || [],
            totalDebit: doc.totalDebit || 0,
            totalCredit: doc.totalCredit || 0,
            isBalanced: doc.isBalanced ?? true,
            status: doc.status || 'posted',
          }));
          setJournalEntries(mappedEntries);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching journal entries from MongoDB Atlas:', err);
      }

      // 9. Fetch Sales Orders from MongoDB Atlas
      try {
        const soRes = await api.getSalesOrders();
        if (soRes && soRes.salesOrders && Array.isArray(soRes.salesOrders)) {
          const mappedSO: SalesOrder[] = soRes.salesOrders.map((doc: any) => ({
            id: String(doc._id || doc.id),
            orderNumber: doc.orderNumber || '',
            customerId: doc.customerId ? String(doc.customerId._id || doc.customerId) : '',
            customerName: doc.customerName || '',
            orderDate: doc.orderDate || '',
            dueDate: doc.dueDate || '',
            items: doc.items || [],
            subtotal: doc.subtotal || 0,
            taxTotal: doc.taxTotal || 0,
            grandTotal: doc.grandTotal || 0,
            status: doc.status || 'confirmed',
            notes: doc.notes || '',
          }));
          setSalesOrders(mappedSO);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching sales orders from MongoDB Atlas:', err);
      }

      // 10. Fetch Purchase Orders from MongoDB Atlas
      try {
        const poRes = await api.getPurchaseOrders();
        if (poRes && poRes.purchaseOrders && Array.isArray(poRes.purchaseOrders)) {
          const mappedPO: PurchaseOrder[] = poRes.purchaseOrders.map((doc: any) => ({
            id: String(doc._id || doc.id),
            poNumber: doc.poNumber || '',
            vendorId: doc.vendorId ? String(doc.vendorId._id || doc.vendorId) : '',
            vendorName: doc.vendorName || '',
            orderDate: doc.orderDate || '',
            dueDate: doc.dueDate || '',
            items: doc.items || [],
            subtotal: doc.subtotal || 0,
            taxTotal: doc.taxTotal || 0,
            grandTotal: doc.grandTotal || 0,
            status: doc.status || 'confirmed',
            notes: doc.notes || '',
          }));
          setPurchaseOrders(mappedPO);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching purchase orders from MongoDB Atlas:', err);
      }

      // 11. Fetch Analytics & Budgets from MongoDB Atlas
      try {
        const anaRes = await api.getAnalytics();
        if (anaRes && anaRes.analyticAccounts && Array.isArray(anaRes.analyticAccounts)) {
          const mappedAna: AnalyticAccount[] = anaRes.analyticAccounts.map((doc: any) => ({
            id: String(doc._id || doc.id),
            code: doc.code || '',
            name: doc.name || '',
            type: doc.type || 'expense',
            description: doc.description || '',
            status: doc.status || 'active',
          }));
          setAnalyticAccounts(mappedAna);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching analytics from MongoDB Atlas:', err);
      }

      try {
        const bdgRes = await api.getBudgets();
        if (bdgRes && bdgRes.budgets && Array.isArray(bdgRes.budgets)) {
          const mappedBudgets: Budget[] = bdgRes.budgets.map((doc: any) => ({
            id: String(doc._id || doc.id),
            name: doc.name || '',
            analyticAccountId: doc.analyticAccountId ? String(doc.analyticAccountId._id || doc.analyticAccountId) : '',
            analyticAccountName: doc.analyticAccountName || '',
            period: doc.period || '',
            planned: doc.planned || 0,
            actual: doc.actual || 0,
            remaining: doc.remaining || 0,
            utilization: doc.utilization || 0,
            status: doc.status || 'active',
          }));
          setBudgets(mappedBudgets);
        }
      } catch (err) {
        console.warn('[DataContext] Error fetching budgets from MongoDB Atlas:', err);
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
    api.createSalesOrder(soData).then(() => fetchFromBackend()).catch(() => {});
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

    api.createInvoice({
      customerId: so.customerId,
      customerName: so.customerName,
      invoiceDate: today,
      dueDate: so.dueDate,
      items: so.items,
      subtotal: so.subtotal,
      taxTotal: so.taxTotal,
      grandTotal: so.grandTotal,
      notes: so.notes,
    }).then(() => fetchFromBackend()).catch(() => {});

    // Persist to MongoDB Atlas
    api.convertSOToInvoice(soId).catch(err => console.warn('[Atlas ConvertSO Error]:', err));

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

    api.createInvoice(invData).then(() => fetchFromBackend()).catch(() => {});

    // Persist to MongoDB Atlas
    api.createInvoice({
      customerId: invData.customerId,
      customerName: invData.customerName,
      salesOrderId: invData.salesOrderId,
      invoiceDate: invData.invoiceDate,
      dueDate: invData.dueDate,
      items: invData.items,
      notes: invData.notes,
    }).catch(err => console.warn('[Atlas CreateInvoice Error]:', err));

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
    api.createPurchaseOrder({
      vendorId: poData.vendorId,
      vendorName: poData.vendorName,
      orderDate: poData.orderDate,
      dueDate: poData.dueDate,
      items: poData.items,
      notes: poData.notes,
    }).then(res => {
      if (res && res.purchaseOrder) {
        setPurchaseOrders(prev => prev.map(p => p.id === newPO.id ? { ...p, id: res.purchaseOrder._id, poNumber: res.purchaseOrder.poNumber } : p));
      }
    }).catch(err => console.warn('[Atlas PurchaseOrder Error]:', err));
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

    api.createVendorBill({
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      billDate: today,
      dueDate: po.dueDate,
      items: po.items,
      subtotal: po.subtotal,
      taxTotal: po.taxTotal,
      grandTotal: po.grandTotal,
      notes: po.notes,
    }).then(() => fetchFromBackend()).catch(() => {});

    // Persist to MongoDB Atlas
    api.convertPOToVendorBill(poId).catch(err => console.warn('[Atlas ConvertPO Error]:', err));

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
    api.createVendorBill(billData).then(() => fetchFromBackend()).catch(() => {});

    // Persist to MongoDB Atlas
    api.createVendorBill({
      vendorId: billData.vendorId,
      vendorName: billData.vendorName,
      purchaseOrderId: billData.purchaseOrderId,
      billDate: billData.billDate,
      dueDate: billData.dueDate,
      items: billData.items,
      notes: billData.notes,
    }).catch(err => console.warn('[Atlas CreateBill Error]:', err));

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
    const contactName = contact ? contact.name : 'Contact';
    const paymentNumber = `PAY-${String(payments.length + 34).padStart(5, '0')}`;
    const jeNumber = `JE-${String(journalEntries.length + 57).padStart(5, '0')}`;

    const isCustomerPayment = pData.type === 'customer_payment';

    // Dynamic Account Lookup from MongoDB fetched accounts
    const bankAcc = accounts.find(a => String(a.type).toLowerCase() === 'asset' && (a.name.toLowerCase().includes('bank') || a.code === '1002')) || accounts.find(a => String(a.type).toLowerCase() === 'asset');
    const cashAcc = accounts.find(a => String(a.type).toLowerCase() === 'asset' && (a.name.toLowerCase().includes('cash') || a.code === '1001')) || accounts.find(a => String(a.type).toLowerCase() === 'asset');
    const arAcc = accounts.find(a => String(a.type).toLowerCase() === 'asset' && (a.name.toLowerCase().includes('receivable') || a.code === '1003')) || accounts.find(a => String(a.type).toLowerCase() === 'asset');
    const apAcc = accounts.find(a => String(a.type).toLowerCase() === 'liability' && (a.name.toLowerCase().includes('payable') || a.code === '2001')) || accounts.find(a => String(a.type).toLowerCase() === 'liability');

    const assetAccount = pData.method === 'bank' ? bankAcc : cashAcc;

    const journalLines = isCustomerPayment ? [
      {
        id: `jel-${Date.now()}-1`,
        accountId: assetAccount?.id || '',
        accountCode: assetAccount?.code || (pData.method === 'bank' ? '1002' : '1001'),
        accountName: assetAccount?.name || (pData.method === 'bank' ? (pData.bankAccount || 'Bank Account') : 'Petty Cash'),
        debit: pData.amount,
        credit: 0,
        label: `Payment received from ${contactName}`,
      },
      {
        id: `jel-${Date.now()}-2`,
        accountId: arAcc?.id || '',
        accountCode: arAcc?.code || '1003',
        accountName: arAcc?.name || 'Accounts Receivable',
        debit: 0,
        credit: pData.amount,
        label: `Clear invoice balance ${pData.referenceNumber || ''}`,
      }
    ] : [
      {
        id: `jel-${Date.now()}-1`,
        accountId: apAcc?.id || '',
        accountCode: apAcc?.code || '2001',
        accountName: apAcc?.name || 'Accounts Payable',
        debit: pData.amount,
        credit: 0,
        label: `Vendor bill payment to ${contactName}`,
      },
      {
        id: `jel-${Date.now()}-2`,
        accountId: assetAccount?.id || '',
        accountCode: assetAccount?.code || (pData.method === 'bank' ? '1002' : '1001'),
        accountName: assetAccount?.name || (pData.method === 'bank' ? (pData.bankAccount || 'Bank Account') : 'Petty Cash'),
        debit: 0,
        credit: pData.amount,
        label: `Disbursement for ${pData.referenceNumber || ''}`,
      }
    ];

    const newJE: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: jeNumber,
      date: pData.paymentDate,
      reference: pData.referenceNumber || pData.referenceNo || 'Payment Register',
      journalId: pData.method === 'bank' ? 'jrn-bank-1' : 'jrn-cash-1',
      journalName: pData.method === 'bank' ? 'Bank' : 'Cash',
      partnerId: pData.contactId,
      partnerName: contactName,
      lines: journalLines,
      totalDebit: pData.amount,
      totalCredit: pData.amount,
      isBalanced: true,
      status: 'posted',
    };

    const newPayment: Payment = {
      ...pData,
      id: `pay-${Date.now()}`,
      paymentNumber,
      contactName,
      journalEntryId: newJE.id,
      status: 'posted',
    };

    setJournalEntries(prev => [newJE, ...prev]);
    setPayments(prev => [newPayment, ...prev]);

    // Update target invoice or bill
    if (pData.referenceId) {
      if (pData.type === 'customer_payment') {
        setInvoices(prev => prev.map(inv => {
          if (inv.id === pData.referenceId || inv.invoiceNumber === pData.referenceNumber) {
            const newPaid = inv.paidAmount + pData.amount;
            const newOutstanding = Math.max(0, inv.grandTotal - newPaid);
            const newStatus: CustomerInvoice['status'] = newOutstanding === 0 ? 'paid' : (newPaid > 0 ? 'partially_paid' : inv.status);
            return {
              ...inv,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
              status: newStatus,
            };
          }
          return inv;
        }));
      } else {
        setBills(prev => prev.map(bill => {
          if (bill.id === pData.referenceId || bill.billNumber === pData.referenceNumber) {
            const newPaid = bill.paidAmount + pData.amount;
            const newOutstanding = Math.max(0, bill.grandTotal - newPaid);
            const newStatus: VendorBill['status'] = newOutstanding === 0 ? 'paid' : (newPaid > 0 ? 'partially_paid' : bill.status);
            return {
              ...bill,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
              status: newStatus,
            };
          }
          return bill;
        }));
      }
    }

    // Update Contact totalPaid & outstanding
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

    api.createPayment({
      type: pData.type,
      contactId: pData.contactId,
      referenceId: pData.referenceId,
      referenceNumber: pData.referenceNumber,
      paymentDate: pData.paymentDate,
      method: pData.method,
      bankAccount: pData.bankAccount,
      amount: pData.amount,
      referenceNo: pData.referenceNo,
      notes: pData.notes,
    }).catch(err => console.warn('[Atlas Payment Error]:', err));

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

    return { payment: newPayment, journalEntry: newJE };
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
    api.createJournal(newJournal).catch(err => {
      console.warn('Could not create journal in MongoDB Atlas:', err);
    });
    return newJournal;
  };

  const updateJournal = (id: string, updates: Partial<Journal>) => {
    setJournals(prev => prev.map(j => (j.id === id ? { ...j, ...updates } : j)));
    api.updateJournal(id, updates).catch(err => {
      console.warn('Could not update journal in MongoDB Atlas:', err);
    });
  };

  const generateEntryNumber = (journalType?: string) => {
    const year = new Date().getFullYear();
    const prefixMap: Record<string, string> = {
      sales: 'Inv',
      purchase: 'Bill',
      bank: 'BNK',
      cash: 'CSH',
    };
    const prefix = prefixMap[journalType || ''] || 'JE';
    const count = journalEntries.filter(e => e.entryNumber.startsWith(`${prefix}/${year}/`)).length;
    return `${prefix}/${year}/${String(count + 1).padStart(4, '0')}`;
  };

  const addJournalEntry = (
    jeData: Omit<JournalEntry, 'id' | 'entryNumber' | 'isBalanced' | 'totalDebit' | 'totalCredit'>
  ) => {
    const totalDebit = jeData.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = jeData.lines.reduce((s, l) => s + l.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    const journal = journals.find(j => j.id === jeData.journalId);
    const entryNumber = generateEntryNumber(journal?.type);

    const newJE: JournalEntry = {
      ...jeData,
      id: `je-${Date.now()}`,
      entryNumber,
      totalDebit,
      totalCredit,
      isBalanced,
    };
    setJournalEntries(prev => [newJE, ...prev]);
    api.createJournalEntry(newJE).catch(err => {
      console.warn('Could not create journal entry in MongoDB Atlas:', err);
    });
    return newJE;
  };

  const updateJournalEntry = (id: string, updates: Partial<JournalEntry>) => {
    setJournalEntries(prev =>
      prev.map(je => {
        if (je.id !== id) return je;
        const merged = { ...je, ...updates };
        if (updates.lines) {
          merged.totalDebit = merged.lines.reduce((s, l) => s + l.debit, 0);
          merged.totalCredit = merged.lines.reduce((s, l) => s + l.credit, 0);
          merged.isBalanced = Math.abs(merged.totalDebit - merged.totalCredit) < 0.01;
        }
        return merged;
      })
    );
    api.updateJournalEntry(id, updates).catch(err => {
      console.warn('Could not update journal entry in MongoDB Atlas:', err);
    });
  };

  const postJournalEntry = (id: string) => {
    setJournalEntries(prev =>
      prev.map(je => {
        if (je.id !== id) return je;
        const totalDebit = je.lines.reduce((s, l) => s + l.debit, 0);
        const totalCredit = je.lines.reduce((s, l) => s + l.credit, 0);
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
        if (!isBalanced) return je;
        return { ...je, status: 'posted' as const, totalDebit, totalCredit, isBalanced: true };
      })
    );
    api.postJournalEntry(id).catch(err => {
      console.warn('Could not post journal entry in MongoDB Atlas:', err);
    });
  };

  const cancelJournalEntry = (id: string) => {
    setJournalEntries(prev =>
      prev.map(je => (je.id === id ? { ...je, status: 'cancelled' as const } : je))
    );
    api.cancelJournalEntry(id).catch(err => {
      console.warn('Could not cancel journal entry in MongoDB Atlas:', err);
    });
  };

  const addAnalyticAccount = (anaData: Omit<AnalyticAccount, 'id'>) => {
    const newAna: AnalyticAccount = {
      ...anaData,
      id: `ana-${Date.now()}`,
    };
    setAnalyticAccounts(prev => [...prev, newAna]);
    api.createAnalytics(anaData).then(() => fetchFromBackend()).catch(() => {});
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
    api.createBudget(bData).then(() => fetchFromBackend()).catch(() => {});
    return newBudget;
  };

  const resetDemoData = () => {
    localStorage.clear();
    fetchFromBackend();
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
        updateJournal,
        addJournalEntry,
        updateJournalEntry,
        postJournalEntry,
        cancelJournalEntry,
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
