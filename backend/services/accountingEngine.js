import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import JournalEntry from '../models/JournalEntry.js';

/**
 * Accounting Service Engine
 * Handles dynamic discovery of Chart of Accounts & Journals,
 * enforces strict double-entry balance validation (totalDebit === totalCredit),
 * and creates posted Journal Entries linked to source transactions.
 */

// Helper to find default accounts
export const getAccountByCodeOrType = async (code, fallbackType) => {
  let account = await Account.findOne({ code });
  if (!account && fallbackType) {
    account = await Account.findOne({ type: fallbackType, status: 'active' });
  }
  return account;
};

// Helper to find default journal
export const getJournalByType = async (type) => {
  let journal = await Journal.findOne({ type, status: 'active' });
  if (!journal) {
    journal = await Journal.findOne({ status: 'active' });
  }
  return journal;
};

/**
 * Create and validate a double-entry Journal Entry
 */
export const createBalancedJournalEntry = async ({
  entryNumberPrefix = 'JE',
  date,
  reference = '',
  journalName = 'General Journal Entries',
  lines = [],
  status = 'posted',
}) => {
  // Calculate total debit and total credit
  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);

  // Strict double-entry accounting validation: debit must equal credit
  const diff = Math.abs(totalDebit - totalCredit);
  if (diff > 0.01) {
    const errorMsg = `Journal entry is not balanced. Total debit (${totalDebit.toFixed(
      2
    )}) must equal total credit (${totalCredit.toFixed(2)}).`;
    const err = new Error(errorMsg);
    err.statusCode = 400;
    throw err;
  }

  // Generate sequential Entry Number if not provided
  const count = await JournalEntry.countDocuments();
  const entryNumber = `${entryNumberPrefix}-${String(count + 1).padStart(5, '0')}`;

  const entryDate = date || new Date().toISOString().split('T')[0];

  const journalEntry = await JournalEntry.create({
    entryNumber,
    date: entryDate,
    reference,
    journalName,
    lines,
    totalDebit,
    totalCredit,
    isBalanced: true,
    status,
  });

  return journalEntry;
};

/**
 * Generate Journal Entry for Vendor Bill
 */
export const createVendorBillJournalEntry = async (bill) => {
  const purchaseAccount = await getAccountByCodeOrType('5001', 'expense');
  const apAccount = await getAccountByCodeOrType('2001', 'liability');
  const purchaseJournal = await getJournalByType('purchase');

  const lines = [
    {
      accountId: purchaseAccount?._id,
      accountCode: purchaseAccount?.code || '5001',
      accountName: purchaseAccount?.name || 'Cost of Timber & Raw Materials',
      debit: bill.grandTotal,
      credit: 0,
      label: `Purchase expense for ${bill.billNumber} (${bill.vendorName})`,
    },
    {
      accountId: apAccount?._id,
      accountCode: apAccount?.code || '2001',
      accountName: apAccount?.name || 'Accounts Payable (Trade Creditors)',
      debit: 0,
      credit: bill.grandTotal,
      label: `Vendor bill liability for ${bill.billNumber}`,
    },
  ];

  return await createBalancedJournalEntry({
    entryNumberPrefix: 'JE-VP',
    date: bill.billDate,
    reference: bill.billNumber,
    journalName: purchaseJournal?.name || 'Vendor Purchase Journal',
    lines,
  });
};

/**
 * Generate Journal Entry for Customer Invoice
 */
export const createCustomerInvoiceJournalEntry = async (invoice) => {
  const arAccount = await getAccountByCodeOrType('1003', 'asset');
  const salesAccount = await getAccountByCodeOrType('4001', 'income');
  const salesJournal = await getJournalByType('sales');

  const lines = [
    {
      accountId: arAccount?._id,
      accountCode: arAccount?.code || '1003',
      accountName: arAccount?.name || 'Accounts Receivable (Trade Debtors)',
      debit: invoice.grandTotal,
      credit: 0,
      label: `Customer receivable for ${invoice.invoiceNumber} (${invoice.customerName})`,
    },
    {
      accountId: salesAccount?._id,
      accountCode: salesAccount?.code || '4001',
      accountName: salesAccount?.name || 'Furniture Sales & Custom Joinery Revenue',
      debit: 0,
      credit: invoice.grandTotal,
      label: `Sales revenue for ${invoice.invoiceNumber}`,
    },
  ];

  return await createBalancedJournalEntry({
    entryNumberPrefix: 'JE-CS',
    date: invoice.invoiceDate,
    reference: invoice.invoiceNumber,
    journalName: salesJournal?.name || 'Customer Sales Journal',
    lines,
  });
};
