import mongoose from 'mongoose';

const budgetRevisionSchema = new mongoose.Schema(
  {
    revisionNumber: { type: Number, required: true },
    revisedAt: { type: Date, default: Date.now },
    revisedBy: { type: String, default: 'Admin' },
    previousAmount: { type: Number, required: true },
    newAmount: { type: Number, required: true },
    notes: { type: String, default: '' },
    revisedBudgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
  },
  { _id: false }
);

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
    analyticAccountName: {
      type: String,
      default: 'General Center',
    },
    type: {
      type: String,
      enum: ['Income', 'Expenses', 'income', 'expense'],
      default: 'Expenses',
    },
    responsiblePersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
    },
    responsiblePersonName: {
      type: String,
      default: 'Business Owner (Admin)',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    period: {
      type: String,
      default: function () {
        const s = this.startDate ? new Date(this.startDate) : new Date();
        const e = this.endDate ? new Date(this.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
        const sStr = `${s.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
        const eStr = `${e.toLocaleString('default', { month: 'short' })} ${e.getFullYear()}`;
        return sStr === eStr ? sStr : `${sStr} - ${eStr}`;
      },
    },
    planned: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Planned amount must be non-negative'],
    },
    originalPlanned: {
      type: Number,
      default: function () {
        return this.planned;
      },
    },
    actual: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: function () {
        return Math.max(0, this.planned - (this.actual || 0));
      },
    },
    utilization: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['NEW', 'Draft', 'draft', 'CONFIRMED', 'Confirmed', 'confirmed', 'REVISED', 'Revised', 'revised', 'CANCELLED', 'Cancelled', 'cancelled', 'active', 'archived'],
      default: 'NEW',
    },
    originalBudgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
    },
    revisedBudgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
    },
    notes: {
      type: String,
      default: '',
    },
    revisions: [budgetRevisionSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save calculations for period, remaining, and utilization
budgetSchema.pre('save', function (next) {
  // Normalize type
  const normType = String(this.type || '').toLowerCase();
  this.type = normType === 'income' ? 'Income' : 'Expenses';

  // Normalize status
  const normStatus = String(this.status || '').toUpperCase();
  if (normStatus === 'DRAFT' || normStatus === 'NEW') this.status = 'NEW';
  else if (normStatus === 'CONFIRMED' || normStatus === 'ACTIVE') this.status = 'CONFIRMED';
  else if (normStatus === 'REVISED') this.status = 'REVISED';
  else if (normStatus === 'CANCELLED' || normStatus === 'ARCHIVED') this.status = 'CANCELLED';

  if (!this.period) {
    const s = this.startDate ? new Date(this.startDate) : new Date();
    const e = this.endDate ? new Date(this.endDate) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const sStr = `${s.toLocaleString('default', { month: 'short' })} ${s.getFullYear()}`;
    const eStr = `${e.toLocaleString('default', { month: 'short' })} ${e.getFullYear()}`;
    this.period = sStr === eStr ? sStr : `${sStr} - ${eStr}`;
  }

  const plannedNum = Number(this.planned) || 0;
  const actualNum = Number(this.actual) || 0;
  this.remaining = Math.max(0, plannedNum - actualNum);
  this.utilization = plannedNum > 0 ? (actualNum / plannedNum) * 100 : 0;

  if (this.originalPlanned === undefined || this.originalPlanned === null) {
    this.originalPlanned = plannedNum;
  }
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
