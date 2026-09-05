import Account from '../models/Account.js';
import JournalEntry from '../models/JournalEntry.js';
import Budget from '../models/Budget.js';

// @desc    Get Profit & Loss Report
// @route   GET /api/reports/profit-loss
// @access  Protected (ADMIN, ACCOUNTANT)
export const getProfitLoss = async (req, res, next) => {
  try {
    const incomeAccounts = await Account.find({ type: 'income' });
    const expenseAccounts = await Account.find({ type: 'expense' });

    const totalIncome = incomeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalExpense = expenseAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const netProfit = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      report: {
        totalIncome,
        totalExpense,
        netProfit,
        incomeAccounts,
        expenseAccounts,
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

    const totalAssets = assetAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
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
