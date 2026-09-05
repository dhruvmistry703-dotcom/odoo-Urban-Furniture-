import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    parentAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
    },
    parentAccountName: String,
    balance: {
      type: Number,
      default: 0,
    },
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

const Account = mongoose.model('Account', accountSchema);
export default Account;
