import mongoose from 'mongoose';
import AnalyticAccount from '../models/AnalyticAccount.js';
import Budget from '../models/Budget.js';

// @desc    Get all analytic accounts
// @route   GET /api/analytics
// @access  Protected (ADMIN, ACCOUNTANT)
export const getAnalyticAccounts = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) {
      const lower = type.toLowerCase();
      if (lower === 'income') filter.type = { $in: ['Income', 'income'] };
      else if (lower === 'expense' || lower === 'expenses') filter.type = { $in: ['Expenses', 'expense', 'Expense'] };
      else filter.type = type;
    }

    const analytics = await AnalyticAccount.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: analytics.length, analyticAccounts: analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytic account by ID
// @route   GET /api/analytics/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getAnalyticAccountById = async (req, res, next) => {
  try {
    let analytic = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      analytic = await AnalyticAccount.findById(req.params.id);
    } else {
      analytic = await AnalyticAccount.findOne({
        $or: [{ code: req.params.id }, { name: req.params.id }],
      });
    }

    if (!analytic) {
      return res.status(404).json({ success: false, message: 'Analytic account not found' });
    }
    res.status(200).json({ success: true, analyticAccount: analytic });
  } catch (error) {
    next(error);
  }
};

// @desc    Create analytic account
// @route   POST /api/analytics
// @access  Protected (ADMIN, ACCOUNTANT)
export const createAnalyticAccount = async (req, res, next) => {
  try {
    const { name, type, code, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Analytic Account Name is required' });
    }

    let normType = 'Expenses';
    if (type) {
      const t = String(type).toLowerCase();
      normType = t === 'income' ? 'Income' : 'Expenses';
    }

    const analytic = await AnalyticAccount.create({
      name: name.trim(),
      type: normType,
      code: code ? code.trim() : undefined,
      description: description ? description.trim() : '',
      status: 'active',
    });

    res.status(201).json({ success: true, analyticAccount: analytic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update analytic account
// @route   PUT /api/analytics/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateAnalyticAccount = async (req, res, next) => {
  try {
    const { name, type, code, description, status } = req.body;

    if (status === 'archived' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive analytic accounts',
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (type !== undefined) {
      const t = String(type).toLowerCase();
      updates.type = t === 'income' ? 'Income' : 'Expenses';
    }
    if (code !== undefined) updates.code = code.trim();
    if (description !== undefined) updates.description = description.trim();
    if (status !== undefined) updates.status = status;

    let analytic = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      analytic = await AnalyticAccount.findById(req.params.id);
    } else {
      analytic = await AnalyticAccount.findOne({
        $or: [{ code: req.params.id }, { name: req.params.id }],
      });
    }

    if (!analytic) {
      return res.status(404).json({ success: false, message: 'Analytic account not found' });
    }

    Object.assign(analytic, updates);
    await analytic.save();

    res.status(200).json({ success: true, analyticAccount: analytic });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive analytic account
// @route   PATCH /api/analytics/:id/archive
// @access  Protected (ADMIN only)
export const archiveAnalyticAccount = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive analytic accounts',
      });
    }

    const analytic = await AnalyticAccount.findById(req.params.id);
    if (!analytic) {
      return res.status(404).json({ success: false, message: 'Analytic account not found' });
    }
    analytic.status = analytic.status === 'archived' ? 'active' : 'archived';
    await analytic.save();

    res.status(200).json({
      success: true,
      message: `Analytic account ${analytic.status === 'archived' ? 'archived' : 'activated'}`,
      analyticAccount: analytic,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all budgets associated with an analytic account
// @route   GET /api/analytics/:id/budgets
// @access  Protected (ADMIN, ACCOUNTANT)
export const getAnalyticAccountBudgets = async (req, res, next) => {
  try {
    let analytic = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      analytic = await AnalyticAccount.findById(req.params.id);
    } else {
      analytic = await AnalyticAccount.findOne({
        $or: [{ code: req.params.id }, { name: req.params.id }],
      });
    }

    if (!analytic) {
      return res.status(404).json({ success: false, message: 'Analytic account not found' });
    }

    const budgets = await Budget.find({ analyticAccountId: analytic._id })
      .populate('analyticAccountId')
      .populate('responsiblePersonId', 'name email role phone')
      .populate('originalBudgetId', 'name planned status')
      .populate('revisedBudgetId', 'name planned status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: budgets.length,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete analytic account
// @route   DELETE /api/analytics/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const deleteAnalyticAccount = async (req, res, next) => {
  try {
    const analytic = await AnalyticAccount.findById(req.params.id);
    if (!analytic) {
      return res.status(404).json({ success: false, message: 'Analytic account not found' });
    }

    // Also remove or unlink linked budgets if needed
    await Budget.deleteMany({ analyticAccountId: analytic._id });
    await analytic.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Analytic account and linked budgets deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
