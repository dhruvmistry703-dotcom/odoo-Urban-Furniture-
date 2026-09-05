import Budget from '../models/Budget.js';

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Protected (ADMIN, ACCOUNTANT)
export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find().populate('analyticAccountId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: budgets.length, budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create budget
// @route   POST /api/budgets
// @access  Protected (ADMIN, ACCOUNTANT)
export const createBudget = async (req, res, next) => {
  try {
    const { name, analyticAccountId, analyticAccountName, period, planned } = req.body;
    const plannedNum = Number(planned) || 0;

    const budget = await Budget.create({
      name,
      analyticAccountId,
      analyticAccountName: analyticAccountName || 'General Project',
      period,
      planned: plannedNum,
      actual: 0,
      remaining: plannedNum,
      utilization: 0,
      status: 'active',
    });

    res.status(201).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateBudget = async (req, res, next) => {
  try {
    if (req.body.status === 'archived' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive budgets',
      });
    }

    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.status(200).json({ success: true, budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive budget
// @route   PATCH /api/budgets/:id/archive
// @access  Protected (ADMIN only)
export const archiveBudget = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive budgets',
      });
    }

    const budget = await Budget.findById(req.params.id);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    budget.status = budget.status === 'archived' ? 'active' : 'archived';
    await budget.save();

    res.status(200).json({
      success: true,
      message: `Budget ${budget.status === 'archived' ? 'archived' : 'activated'}`,
      budget,
    });
  } catch (error) {
    next(error);
  }
};
