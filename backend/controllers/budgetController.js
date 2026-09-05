import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import AnalyticAccount from '../models/AnalyticAccount.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Contact from '../models/Contact.js';

// Helper function to calculate real achieved transactions
const computeAchievedTransactions = async (budget) => {
  try {
    const isIncome = String(budget.type || '').toLowerCase() === 'income';
    const sDate = budget.startDate ? new Date(budget.startDate) : null;
    const eDate = budget.endDate ? new Date(budget.endDate) : null;

    let totalAchieved = Number(budget.actual || 0);
    let matchedTransactions = [];

    if (isIncome) {
      const query = {
        status: { $in: ['pending', 'partially_paid', 'paid', 'posted', 'draft'] },
      };
      const invoices = await CustomerInvoice.find(query);

      matchedTransactions = invoices.filter((inv) => {
        if (!sDate || !eDate) return true;
        const invDate = new Date(inv.invoiceDate || inv.createdAt);
        return invDate >= sDate && invDate <= eDate;
      });

      if (matchedTransactions.length > 0) {
        totalAchieved = matchedTransactions.reduce(
          (sum, inv) => sum + (Number(inv.grandTotal) || Number(inv.subtotal) || 0),
          0
        );
      }
    } else {
      const query = {
        status: { $in: ['posted', 'partially_paid', 'paid', 'draft'] },
      };
      const bills = await VendorBill.find(query);

      matchedTransactions = bills.filter((b) => {
        if (!sDate || !eDate) return true;
        const bDate = new Date(b.billDate || b.createdAt);
        return bDate >= sDate && bDate <= eDate;
      });

      if (matchedTransactions.length > 0) {
        totalAchieved = matchedTransactions.reduce(
          (sum, b) => sum + (Number(b.grandTotal) || Number(b.subtotal) || 0),
          0
        );
      }
    }

    if (totalAchieved > 0 && totalAchieved !== budget.actual) {
      budget.actual = totalAchieved;
      budget.remaining = Math.max(0, budget.planned - totalAchieved);
      budget.utilization = budget.planned > 0 ? (totalAchieved / budget.planned) * 100 : 0;
      await Budget.updateOne(
        { _id: budget._id },
        {
          $set: {
            actual: budget.actual,
            remaining: budget.remaining,
            utilization: budget.utilization,
          },
        }
      );
    }

    return { totalAchieved, matchedTransactions };
  } catch (err) {
    console.warn('Error computing live achieved transactions:', err);
    return { totalAchieved: budget.actual || 0, matchedTransactions: [] };
  }
};

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Protected (ADMIN, ACCOUNTANT)
export const getBudgets = async (req, res, next) => {
  try {
    const { status, analyticAccountId, search, type } = req.query;
    const filter = {};

    if (status && status !== 'ALL') {
      const s = String(status).toUpperCase();
      if (s === 'DRAFT' || s === 'NEW') filter.status = { $in: ['NEW', 'Draft', 'draft'] };
      else if (s === 'CONFIRMED') filter.status = { $in: ['CONFIRMED', 'Confirmed', 'confirmed', 'active'] };
      else if (s === 'REVISED') filter.status = { $in: ['REVISED', 'Revised', 'revised'] };
      else if (s === 'CANCELLED') filter.status = { $in: ['CANCELLED', 'Cancelled', 'cancelled', 'archived'] };
      else filter.status = status;
    }

    if (analyticAccountId) {
      filter.analyticAccountId = analyticAccountId;
    }

    if (type) {
      const normType = String(type).toLowerCase() === 'income' ? 'Income' : 'Expenses';
      filter.type = normType;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { responsiblePersonName: { $regex: search, $options: 'i' } },
        { analyticAccountName: { $regex: search, $options: 'i' } },
      ];
    }

    const budgets = await Budget.find(filter)
      .populate('analyticAccountId')
      .populate('responsiblePersonId', 'name email role phone')
      .populate('originalBudgetId', 'name planned status')
      .populate('revisedBudgetId', 'name planned status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: budgets.length, budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getBudgetById = async (req, res, next) => {
  try {
    let budget = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      budget = await Budget.findById(req.params.id)
        .populate('analyticAccountId')
        .populate('responsiblePersonId', 'name email role phone')
        .populate('originalBudgetId', 'name planned status')
        .populate('revisedBudgetId', 'name planned status');
    } else {
      budget = await Budget.findOne({
        $or: [{ name: req.params.id }],
      })
        .populate('analyticAccountId')
        .populate('responsiblePersonId', 'name email role phone')
        .populate('originalBudgetId', 'name planned status')
        .populate('revisedBudgetId', 'name planned status');
    }

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    // Calculate live achieved metrics
    await computeAchievedTransactions(budget);

    res.status(200).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live transactions associated with budget
// @route   GET /api/budgets/:id/transactions
// @access  Protected (ADMIN, ACCOUNTANT)
export const getBudgetTransactions = async (req, res, next) => {
  try {
    let budget = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      budget = await Budget.findById(req.params.id);
    } else {
      budget = await Budget.findOne({ name: req.params.id });
    }

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const { totalAchieved, matchedTransactions } = await computeAchievedTransactions(budget);

    res.status(200).json({
      success: true,
      budgetType: budget.type,
      totalAchieved,
      count: matchedTransactions.length,
      transactions: matchedTransactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Protected (ADMIN, ACCOUNTANT)
export const createBudget = async (req, res, next) => {
  try {
    const {
      name,
      analyticAccountId,
      analyticAccountName,
      type,
      startDate,
      endDate,
      period,
      responsiblePersonId,
      responsiblePersonName,
      planned,
      actual,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Budget Name is required' });
    }
    if (!analyticAccountId) {
      return res.status(400).json({ success: false, message: 'Analytic Account is required' });
    }

    const plannedNum = Number(planned);
    if (isNaN(plannedNum) || plannedNum <= 0) {
      return res.status(400).json({ success: false, message: 'Planned committed amount must be greater than zero' });
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Budget End Date cannot be earlier than Start Date',
      });
    }

    let finalAnaName = analyticAccountName;
    let finalType = type;

    const ana = await AnalyticAccount.findById(analyticAccountId);
    if (ana) {
      if (!finalAnaName) finalAnaName = ana.name;
      if (!finalType) finalType = ana.type;
    }

    const normType = String(finalType || 'Expenses').toLowerCase() === 'income' ? 'Income' : 'Expenses';

    const actualNum = Number(actual) || 0;
    const remainingNum = Math.max(0, plannedNum - actualNum);
    const utilizationNum = plannedNum > 0 ? (actualNum / plannedNum) * 100 : 0;

    let respName = responsiblePersonName;
    if (!respName && responsiblePersonId && mongoose.Types.ObjectId.isValid(responsiblePersonId)) {
      const contact = await Contact.findById(responsiblePersonId);
      if (contact) respName = contact.name;
    }

    let finalPeriod = period;
    if (!finalPeriod) {
      const s = startDate ? new Date(startDate) : new Date();
      const e = endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      const sStr = `${s.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
      const eStr = `${e.toLocaleString('default', { month: 'short' })} ${e.getFullYear()}`;
      finalPeriod = sStr === eStr ? sStr : `${sStr} - ${eStr}`;
    }

    const budget = await Budget.create({
      name: name.trim(),
      analyticAccountId,
      analyticAccountName: finalAnaName || 'General Center',
      type: normType,
      responsiblePersonId: (responsiblePersonId && mongoose.Types.ObjectId.isValid(responsiblePersonId)) ? responsiblePersonId : undefined,
      responsiblePersonName: respName || 'Business Owner (Admin)',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      period: finalPeriod,
      planned: plannedNum,
      originalPlanned: plannedNum,
      actual: actualNum,
      remaining: remainingNum,
      utilization: utilizationNum,
      status: 'NEW',
      notes: notes || '',
      revisions: [],
    });

    res.status(201).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget (Allowed in NEW state)
// @route   PUT /api/budgets/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const {
      name,
      analyticAccountId,
      analyticAccountName,
      type,
      startDate,
      endDate,
      period,
      responsiblePersonId,
      responsiblePersonName,
      planned,
      actual,
      notes,
      status,
    } = req.body;

    if (name) budget.name = name.trim();
    if (analyticAccountId) budget.analyticAccountId = analyticAccountId;
    if (analyticAccountName) budget.analyticAccountName = analyticAccountName;
    if (type) budget.type = String(type).toLowerCase() === 'income' ? 'Income' : 'Expenses';
    if (startDate) budget.startDate = new Date(startDate);
    if (endDate) budget.endDate = new Date(endDate);
    if (period) budget.period = period;
    if (responsiblePersonId && mongoose.Types.ObjectId.isValid(responsiblePersonId)) {
      budget.responsiblePersonId = responsiblePersonId;
    }
    if (responsiblePersonName) budget.responsiblePersonName = responsiblePersonName;
    if (planned !== undefined) {
      const p = Number(planned);
      if (p > 0) {
        budget.planned = p;
        if (budget.status === 'NEW') {
          budget.originalPlanned = p;
        }
      }
    }
    if (actual !== undefined) {
      budget.actual = Number(actual) || 0;
    }
    if (notes !== undefined) budget.notes = notes;
    if (status !== undefined) budget.status = status;

    budget.remaining = Math.max(0, budget.planned - (budget.actual || 0));
    budget.utilization = budget.planned > 0 ? ((budget.actual || 0) / budget.planned) * 100 : 0;

    await budget.save();
    res.status(200).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm budget (NEW -> CONFIRMED)
// @route   PATCH /api/budgets/:id/confirm
// @access  Protected (ADMIN, ACCOUNTANT)
export const confirmBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const s = String(budget.status).toUpperCase();
    if (s !== 'NEW' && s !== 'DRAFT' && s !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm budget currently in '${budget.status}' status. Only Draft/New budgets can be confirmed.`,
      });
    }

    budget.status = 'CONFIRMED';
    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget has been successfully confirmed.',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revise budget (CONFIRMED -> Creates new Revised budget and moves old to REVISED state)
// @route   POST /api/budgets/:id/revise
// @access  Protected (ADMIN, ACCOUNTANT)
export const reviseBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    const { planned, notes, newName } = req.body;
    const newPlanned = Number(planned);
    if (isNaN(newPlanned) || newPlanned <= 0) {
      return res.status(400).json({ success: false, message: 'Revised planned amount must be greater than zero' });
    }

    const previousAmount = budget.planned;
    const revNum = (budget.revisions?.length || 0) + 1;

    let revisedName = newName;
    if (!revisedName) {
      revisedName = budget.name.toLowerCase().includes('revised')
        ? `${budget.name} (v${revNum + 1})`
        : `${budget.name} Revised`;
    }

    // 1. Create the new revised budget in CONFIRMED state
    const newRevisedBudget = await Budget.create({
      name: revisedName,
      analyticAccountId: budget.analyticAccountId,
      analyticAccountName: budget.analyticAccountName,
      type: budget.type,
      responsiblePersonId: budget.responsiblePersonId,
      responsiblePersonName: budget.responsiblePersonName,
      startDate: budget.startDate,
      endDate: budget.endDate,
      period: budget.period,
      planned: newPlanned,
      originalPlanned: budget.originalPlanned || previousAmount,
      actual: budget.actual || 0,
      remaining: Math.max(0, newPlanned - (budget.actual || 0)),
      utilization: newPlanned > 0 ? ((budget.actual || 0) / newPlanned) * 100 : 0,
      status: 'CONFIRMED',
      originalBudgetId: budget._id,
      notes: notes || `Revised from ₹${previousAmount.toLocaleString('en-IN')} to ₹${newPlanned.toLocaleString('en-IN')}`,
      revisions: [
        ...(budget.revisions || []),
        {
          revisionNumber: revNum,
          revisedAt: new Date(),
          revisedBy: req.user?.name || 'Admin',
          previousAmount,
          newAmount: newPlanned,
          notes: notes || `Revised from ₹${previousAmount.toLocaleString('en-IN')}`,
        },
      ],
    });

    // 2. Move the old budget to REVISED state and link to new budget
    budget.status = 'REVISED';
    budget.revisedBudgetId = newRevisedBudget._id;
    budget.revisions.push({
      revisionNumber: revNum,
      revisedAt: new Date(),
      revisedBy: req.user?.name || 'Admin',
      previousAmount,
      newAmount: newPlanned,
      notes: notes || `Revised into new budget '${newRevisedBudget.name}'`,
      revisedBudgetId: newRevisedBudget._id,
    });
    await budget.save();

    res.status(200).json({
      success: true,
      message: `Budget '${budget.name}' marked as REVISED. New budget '${newRevisedBudget.name}' created.`,
      budget: newRevisedBudget,
      previousBudget: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel budget
// @route   PATCH /api/budgets/:id/cancel
// @access  Protected (ADMIN, ACCOUNTANT)
export const cancelBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    budget.status = 'CANCELLED';
    await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget has been cancelled.',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget permanently
// @route   DELETE /api/budgets/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
