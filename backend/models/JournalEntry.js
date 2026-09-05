import mongoose from 'mongoose';

const journalLineSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
  accountCode: String,
  accountName: String,
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  label: String,
});

const journalEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      default: '',
    },
    journalName: {
      type: String,
      default: 'General Journal',
    },
    lines: [journalLineSchema],
    totalDebit: {
      type: Number,
      required: true,
      default: 0,
    },
    totalCredit: {
      type: Number,
      required: true,
      default: 0,
    },
    isBalanced: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['posted', 'draft'],
      default: 'posted',
    },
  },
  {
    timestamps: true,
  }
);

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;
