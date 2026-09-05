import Journal from '../models/Journal.js';

// @desc    Get all journals
// @route   GET /api/journals
// @access  Protected (ADMIN, ACCOUNTANT)
export const getJournals = async (req, res, next) => {
  try {
    const journals = await Journal.find().sort({ code: 1 });
    res.status(200).json({ success: true, count: journals.length, journals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create journal
// @route   POST /api/journals
// @access  Public / Optional Protect
export const createJournal = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.code) {
      const type = (payload.type || '').toLowerCase();
      const prefixMap = {
        sales: 'SAL',
        purchase: 'PUR',
        bank: 'BNK',
        cash: 'CSH',
      };
      const prefix = prefixMap[type] || 'JRN';
      const count = await Journal.countDocuments();
      payload.code = `${prefix}${String(count + 1).padStart(2, '0')}`;
    }
    const journal = await Journal.create(payload);
    res.status(201).json({ success: true, journal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal
// @route   PUT /api/journals/:id
// @access  Public / Optional Protect
export const updateJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    res.status(200).json({ success: true, journal });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive journal
// @route   PATCH /api/journals/:id/archive
// @access  Public / Optional Protect
export const archiveJournal = async (req, res, next) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    journal.status = journal.status === 'archived' ? 'active' : 'archived';
    await journal.save();

    res.status(200).json({
      success: true,
      message: `Journal ${journal.status === 'archived' ? 'archived' : 'activated'}`,
      journal,
    });
  } catch (error) {
    next(error);
  }
};
