import JournalEntry from '../models/JournalEntry.js';
import Journal from '../models/Journal.js';

const calcTotals = (lines = []) => {
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
  return { totalDebit, totalCredit, isBalanced };
};

const generateEntryNumber = async (journalType) => {
  const year = new Date().getFullYear();
  const prefixMap = {
    sales: 'Inv',
    purchase: 'Bill',
    bank: 'BNK',
    cash: 'CSH',
    general: 'JE',
  };
  const prefix = prefixMap[journalType] || 'JE';
  const regex = new RegExp(`^${prefix}/${year}/`);
  const count = await JournalEntry.countDocuments({ entryNumber: regex });
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}/${year}/${seq}`;
};

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

// @desc    Create journal entry (draft or posted)
// @route   POST /api/journal-entries
// @access  Protected (ADMIN, ACCOUNTANT)
export const createJournalEntry = async (req, res, next) => {
  try {
    const { date, reference, journalId, journalName, partnerId, partnerName, lines, status } = req.body;
    if (!lines || lines.length === 0) {
      return res.status(400).json({ success: false, message: 'Journal lines are required' });
    }

    const { totalDebit, totalCredit, isBalanced } = calcTotals(lines);
    const targetStatus = status || 'draft';

    if (targetStatus === 'posted' && !isBalanced) {
      return res.status(400).json({
        success: false,
        message: `Cannot post: debit and credit amounts do not match. Debit: ${totalDebit}, Credit: ${totalCredit}`,
      });
    }

    let journalType = 'general';
    if (journalId) {
      const journal = await Journal.findById(journalId);
      if (journal) journalType = journal.type;
    }

    const entryNumber = await generateEntryNumber(journalType);

    const entry = await JournalEntry.create({
      entryNumber,
      date: date || new Date().toISOString().split('T')[0],
      reference: reference || '',
      journalId: journalId || undefined,
      journalName: journalName || 'General Journal',
      partnerId: partnerId || undefined,
      partnerName: partnerName || '',
      lines,
      totalDebit,
      totalCredit,
      isBalanced,
      status: targetStatus,
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal-entries/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal Entry not found' });
    }
    if (entry.status === 'posted') {
      return res.status(400).json({ success: false, message: 'Posted journal entries cannot be edited' });
    }
    if (entry.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled journal entries cannot be edited' });
    }

    const lines = req.body.lines || entry.lines;
    const { totalDebit, totalCredit, isBalanced } = calcTotals(lines);

    Object.assign(entry, {
      date: req.body.date ?? entry.date,
      reference: req.body.reference ?? entry.reference,
      journalId: req.body.journalId ?? entry.journalId,
      journalName: req.body.journalName ?? entry.journalName,
      partnerId: req.body.partnerId ?? entry.partnerId,
      partnerName: req.body.partnerName ?? entry.partnerName,
      lines,
      totalDebit,
      totalCredit,
      isBalanced,
    });

    await entry.save();
    res.status(200).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Post a draft journal entry
// @route   PATCH /api/journal-entries/:id/post
// @access  Protected (ADMIN, ACCOUNTANT)
export const postJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal Entry not found' });
    }
    if (entry.status === 'posted') {
      return res.status(400).json({ success: false, message: 'Journal entry is already posted' });
    }
    if (entry.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled journal entries cannot be posted' });
    }

    const { totalDebit, totalCredit, isBalanced } = calcTotals(entry.lines);
    if (!isBalanced) {
      return res.status(400).json({
        success: false,
        message: `Cannot post: debit and credit amounts do not match. Debit: ${totalDebit}, Credit: ${totalCredit}`,
      });
    }

    entry.status = 'posted';
    entry.totalDebit = totalDebit;
    entry.totalCredit = totalCredit;
    entry.isBalanced = true;
    await entry.save();

    res.status(200).json({ success: true, message: 'Journal entry posted', entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a journal entry
// @route   PATCH /api/journal-entries/:id/cancel
// @access  Protected (ADMIN, ACCOUNTANT)
export const cancelJournalEntry = async (req, res, next) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal Entry not found' });
    }
    if (entry.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Journal entry is already cancelled' });
    }

    entry.status = 'cancelled';
    await entry.save();

    res.status(200).json({ success: true, message: 'Journal entry cancelled', entry });
  } catch (error) {
    next(error);
  }
};
