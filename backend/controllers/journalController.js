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
// @access  Protected (ADMIN, ACCOUNTANT)
export const createJournal = async (req, res, next) => {
  try {
    const journal = await Journal.create(req.body);
    res.status(201).json({ success: true, journal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal
// @route   PUT /api/journals/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateJournal = async (req, res, next) => {
  try {
    if (req.body.status === 'archived' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive journals',
      });
    }

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
// @access  Protected (ADMIN only)
export const archiveJournal = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive journals',
      });
    }

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
