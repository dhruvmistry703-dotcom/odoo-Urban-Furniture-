import mongoose from 'mongoose';

const journalLineSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.Mixed,
  },
  accountCode: String,
  accountName: String,
  partnerId: {
    type: mongoose.Schema.Types.Mixed,
  },
  partnerName: String,
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
    journalId: {
      type: mongoose.Schema.Types.Mixed,
    },
    journalName: {
      type: String,
      default: 'General Journal',
    },
    partnerId: {
      type: mongoose.Schema.Types.Mixed,
    },
    partnerName: String,
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
      enum: ['posted', 'draft', 'cancelled'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);
export default JournalEntry;
