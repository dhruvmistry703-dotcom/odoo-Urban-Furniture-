export type ContactType = 'customer' | 'vendor' | 'both';
export type ContactStatus = 'active' | 'archived';

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  image?: string;
  address: string;
  taxId?: string;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  status: ContactStatus;
}

export type ProductType = 'goods' | 'service' | 'combo';
export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: ProductType;
  category: string;
  salesPrice: number;
  purchasePrice: number;
  stock: number;
  status: ProductStatus;
  description?: string;
  image?: string;
}

export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // e.g. 18 for 18%
  taxAmount: number;
  total: number;
}

export type SalesOrderStatus = 'draft' | 'confirmed' | 'completed' | 'cancelled';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: SalesOrderStatus;
  invoiceId?: string;
  paymentId?: string;
  journalEntryId?: string;
  notes?: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId?: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  notes?: string;
}

export type PurchaseOrderStatus = 'draft' | 'confirmed' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  orderDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: PurchaseOrderStatus;
  billId?: string;
  notes?: string;
}

export type BillStatus = 'draft' | 'posted' | 'partially_paid' | 'paid' | 'cancelled';

export interface VendorBill {
  id: string;
  billNumber: string;
  purchaseOrderId?: string;
  vendorId: string;
  vendorName: string;
  billDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  status: BillStatus;
  notes?: string;
}

export type PaymentType = 'customer_payment' | 'vendor_payment';
export type PaymentMethod = 'cash' | 'bank';
export type PaymentStatus = 'posted' | 'cancelled';

export interface Payment {
  id: string;
  paymentNumber: string;
  type: PaymentType;
  contactId: string;
  contactName: string;
  referenceId?: string;
  referenceNumber?: string; // e.g. INV-00045 or BILL-00012
  paymentDate: string;
  method: PaymentMethod;
  bankAccount?: string;
  amount: number;
  referenceNo?: string; // Transaction reference e.g. TXN123456
  notes?: string;
  journalEntryId?: string;
  status: PaymentStatus;
}

export type AccountType =
  | 'Asset'
  | 'Liability'
  | 'Bank'
  | 'Capital'
  | 'Cash'
  | 'Income'
  | 'Expenses'
  | 'Other Expenses'
  | 'Assets'
  | 'Liabilities'
  | 'Expense'
  | 'asset'
  | 'liability'
  | 'income'
  | 'expense'
  | 'capital'
  | string;

export type AccountStatus = 'active' | 'inactive' | 'archived';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  reportGroup?: 'Balancesheet' | 'Profit and Loss' | string;
  parentAccountId?: string;
  parentAccountName?: string;
  balance: number;
  status: AccountStatus;
}

export type JournalType = 'sales' | 'purchase' | 'cash' | 'bank';
export type JournalStatus = 'active' | 'inactive' | 'archived';

export interface Journal {
  id: string;
  name: string;
  code?: string;
  type: JournalType;
  defaultAccountId: string;
  defaultAccountName: string;
  status: JournalStatus;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  partnerId?: string;
  partnerName?: string;
  debit: number;
  credit: number;
  label?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  reference: string;
  journalId?: string;
  journalName?: string;
  partnerId?: string;
  partnerName?: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'posted' | 'draft' | 'cancelled';
}

export interface AnalyticAccount {
  _id?: string;
  id?: string;
  code?: string;
  name: string;
  type: 'Income' | 'Expenses' | 'income' | 'expense';
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export type BudgetStatus = 'NEW' | 'CONFIRMED' | 'REVISED' | 'CANCELLED' | 'active' | 'exceeded' | 'closed' | 'archived';

export interface BudgetRevision {
  revisionNumber: number;
  revisedAt: string;
  revisedBy: string;
  previousAmount: number;
  newAmount: number;
  notes?: string;
}

export interface Budget {
  _id?: string;
  id?: string;
  name: string;
  analyticAccountId: string | AnalyticAccount;
  analyticAccountName?: string;
  type?: 'Income' | 'Expenses' | 'income' | 'expense';
  responsiblePersonId?: string | any;
  responsiblePersonName?: string;
  startDate?: string;
  endDate?: string;
  period?: string;
  planned: number;
  originalPlanned?: number;
  actual: number;
  remaining: number;
  utilization: number; // percentage
  status: BudgetStatus;
  originalBudgetId?: string | any;
  revisedBudgetId?: string | any;
  notes?: string;
  revisions?: BudgetRevision[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'CONTACT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  contactId?: string | null;
  avatar?: string;
  isActive?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
