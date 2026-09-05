import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Journal name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    defaultAccountId: {
      type: mongoose.Schema.Types.Mixed,
    },
    defaultAccountName: String,
    // Legacy fields kept for backward compatibility with existing records
    debitAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    debitAccountName: String,
    creditAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    creditAccountName: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;
