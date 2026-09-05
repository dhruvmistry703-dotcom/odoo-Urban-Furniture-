import Account from '../models/Account.js';

// Helper to determine report group
const determineReportGroup = (type) => {
  const pnlTypes = ['Income', 'Expenses', 'Other Expenses', 'income', 'expense'];
  return pnlTypes.includes(type) ? 'Profit and Loss' : 'Balancesheet';
};

// Helper to generate account code
const generateAccountCode = async (type) => {
  const count = await Account.countDocuments();
  const lower = (type || '').toLowerCase();
  let prefix = '10'; // Assets default
  if (lower.includes('liab')) prefix = '20';
  else if (lower.includes('cap')) prefix = '30';
  else if (lower.includes('inc')) prefix = '40';
  else if (lower.includes('exp')) prefix = '50';
  return `${prefix}${String(count + 1).padStart(2, '0')}`;
};

// @desc    Get all chart of accounts
// @route   GET /api/accounts
// @access  Public / Optional Protect
export const getAccounts = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    const accounts = await Account.find(filter).sort({ createdAt: 1, code: 1 });
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
// @access  Public / Optional Protect
export const createAccount = async (req, res, next) => {
  try {
    const { name, type, reportGroup, status, balance, code } = req.body;
    const finalCode = code || (await generateAccountCode(type));
    const finalReportGroup = reportGroup || determineReportGroup(type);

    const account = await Account.create({
      code: finalCode,
      name,
      type: type || 'Asset',
      reportGroup: finalReportGroup,
      status: status || 'active',
      balance: balance || 0,
    });
    res.status(201).json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Public / Optional Protect
export const updateAccount = async (req, res, next) => {
  try {
    if (req.body.type && !req.body.reportGroup) {
      req.body.reportGroup = determineReportGroup(req.body.type);
    }
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

// @desc    Archive / unarchive account
// @route   PATCH /api/accounts/:id/archive
// @access  Public / Optional Protect
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
