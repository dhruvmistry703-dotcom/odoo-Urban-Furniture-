import Account from '../models/Account.js';

// @desc    Get all chart of accounts
// @route   GET /api/accounts
// @access  Protected (ADMIN, ACCOUNTANT)
export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find().sort({ code: 1 });
    res.status(200).json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create account
// @route   POST /api/accounts
// @access  Protected (ADMIN, ACCOUNTANT)
export const createAccount = async (req, res, next) => {
  try {
    if (!req.body.code) {
      const count = await Account.countDocuments();
      req.body.code = String(6000 + count + 1);
    }
    const account = await Account.create(req.body);
    res.status(201).json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.status(200).json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive account
// @route   PATCH /api/accounts/:id/archive
// @access  Protected (ADMIN, ACCOUNTANT)
export const archiveAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    account.status = account.status === 'archived' ? 'active' : 'archived';
    await account.save();

    res.status(200).json({
      success: true,
      message: `Account ${account.status === 'archived' ? 'archived' : 'activated'}`,
      account,
    });
  } catch (error) {
    next(error);
  }
};
