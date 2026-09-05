import Account from '../models/Account.js';
import JournalEntry from '../models/JournalEntry.js';
import Budget from '../models/Budget.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';

// @desc    Get Profit & Loss Report
// @route   GET /api/reports/profit-loss
// @access  Protected (ADMIN, ACCOUNTANT)
export const getProfitLoss = async (req, res, next) => {
  try {
    const dateFilter = {};
    if (req.query.from || req.query.to) {
      dateFilter.$gte = req.query.from || '0000-01-01';
      dateFilter.$lte = req.query.to || '9999-12-31';
    }

    const incomeAccounts = await Account.find({ type: 'income' });
    const expenseAccounts = await Account.find({ type: 'expense' });
    const invoices = await CustomerInvoice.find({ status: { $ne: 'cancelled' }, ...(Object.keys(dateFilter).length ? { invoiceDate: dateFilter } : {}) }).sort({ invoiceDate: 1 });
    const bills = await VendorBill.find({ status: { $ne: 'cancelled' }, ...(Object.keys(dateFilter).length ? { billDate: dateFilter } : {}) }).sort({ billDate: 1 });

    const accountIncome = incomeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const invoiceIncome = invoices.reduce((sum, invoice) => sum + (invoice.subtotal || 0), 0);
    const accountExpense = expenseAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const billExpense = bills.reduce((sum, bill) => sum + (bill.subtotal || 0), 0);
    const totalIncome = invoiceIncome || accountIncome;
    const otherIncome = invoiceIncome ? 0 : accountIncome;
    const totalExpense = billExpense || accountExpense;
    const netProfit = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      report: {
        totalIncome,
        invoiceIncome,
        otherIncome,
        totalExpense,
        netProfit,
        incomeAccounts,
        expenseAccounts,
        invoices,
        bills,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Balance Sheet Report
// @route   GET /api/reports/balance-sheet
// @access  Protected (ADMIN, ACCOUNTANT)
export const getBalanceSheet = async (req, res, next) => {
  try {
    const assetAccounts = await Account.find({ type: 'asset' });
    const liabilityAccounts = await Account.find({ type: 'liability' });
    const capitalAccounts = await Account.find({ type: 'capital' });
    const invoices = await CustomerInvoice.find({ status: { $ne: 'cancelled' } });
    const bills = await VendorBill.find({ status: { $ne: 'cancelled' } });

    const accountAssets = assetAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const accountLiabilities = liabilityAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const accountsReceivable = invoices.reduce((sum, invoice) => sum + (invoice.outstandingAmount || 0), 0);
    const accountsPayable = bills.reduce((sum, bill) => sum + (bill.outstandingAmount || 0), 0);
    const totalAssets = accountAssets;
    const totalLiabilities = accountLiabilities;
    const totalCapital = capitalAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    res.status(200).json({
      success: true,
      report: {
        totalAssets,
        totalLiabilities,
        totalCapital,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalCapital)) < 0.01,
        assetAccounts,
        liabilityAccounts,
        capitalAccounts,
        accountsReceivable,
        accountsPayable,
        invoices,
        bills,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Budget Report
// @route   GET /api/reports/budget
// @access  Protected (ADMIN, ACCOUNTANT)
export const getBudgetReport = async (req, res, next) => {
  try {
    const budgets = await Budget.find().populate('analyticAccountId');
    res.status(200).json({
      success: true,
      report: {
        budgets,
        totalPlanned: budgets.reduce((s, b) => s + (b.planned || 0), 0),
        totalActual: budgets.reduce((s, b) => s + (b.actual || 0), 0),
        totalRemaining: budgets.reduce((s, b) => s + (b.remaining || 0), 0),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Ledger Report
// @route   GET /api/reports/ledger
// @access  Protected (ADMIN, ACCOUNTANT)
export const getLedger = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find({ status: 'posted' }).sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    next(error);
  }
};
