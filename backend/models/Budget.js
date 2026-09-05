import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    analyticAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnalyticAccount',
      required: true,
    },
    analyticAccountName: String,
    period: {
      type: String,
      required: true,
    },
    planned: {
      type: Number,
      required: true,
      default: 0,
    },
    actual: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    utilization: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'exceeded', 'closed', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
