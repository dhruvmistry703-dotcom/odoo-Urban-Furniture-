import JournalEntry from '../models/JournalEntry.js';

// @desc    Get all journal entries
// @route   GET /api/journal-entries
// @access  Protected (ADMIN, ACCOUNTANT)
export const getJournalEntries = async (req, res, next) => {
  try {
    const entries = await JournalEntry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: entries.length, entries });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal entry by ID
// @route   GET /api/journal-entries/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getJournalEntryById = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal Entry not found' });
    }
    res.status(200).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual journal entry
// @route   POST /api/journal-entries
// @access  Protected (ADMIN, ACCOUNTANT)
export const createJournalEntry = async (req, res, next) => {
  try {
    const { date, reference, journalName, lines, status } = req.body;
    if (!lines || lines.length === 0) {
      return res.status(400).json({ success: false, message: 'Journal lines are required' });
    }

    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    if (!isBalanced) {
      return res.status(400).json({
        success: false,
        message: `Journal entry is out of balance. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`,
      });
    }

    const count = await JournalEntry.countDocuments();
    const entryNumber = `JE-${String(count + 58).padStart(5, '0')}`;

    const entry = await JournalEntry.create({
      entryNumber,
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || '',
      journalName: journalName || 'General Journal',
      lines,
      totalDebit,
      totalCredit,
      isBalanced: true,
      status: status || 'posted',
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};
