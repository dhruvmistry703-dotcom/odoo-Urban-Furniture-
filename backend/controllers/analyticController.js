import AnalyticAccount from '../models/AnalyticAccount.js';

// @desc    Get all analytic accounts
// @route   GET /api/analytics
// @access  Protected (ADMIN, ACCOUNTANT)
export const getAnalyticAccounts = async (req, res, next) => {
  try {
    const analytics = await AnalyticAccount.find().sort({ code: 1 });
    res.status(200).json({ success: true, count: analytics.length, analyticAccounts: analytics });
  } catch (error) {
    next(error);
  }
};

// @desc    Create analytic account
// @route   POST /api/analytics
// @access  Protected (ADMIN, ACCOUNTANT)
export const createAnalyticAccount = async (req, res, next) => {
  try {
    const analytic = await AnalyticAccount.create(req.body);
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
    if (req.body.status === 'archived' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive analytic accounts',
      });
    }

    const analytic = await AnalyticAccount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!analytic) {
      return res.status(404).json({ success: false, message: 'Analytic account not found' });
    }
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
