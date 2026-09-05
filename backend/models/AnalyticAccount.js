import mongoose from 'mongoose';

const analyticAccountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      default: 'Expenses',
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique code if not provided
analyticAccountSchema.pre('save', function (next) {
  const normType = String(this.type || '').toLowerCase();
  this.type = normType === 'income' ? 'Income' : 'Expenses';

  if (!this.code || this.code.trim() === '') {
    const prefix = this.type === 'Income' ? 'ANA-INC' : 'ANA-EXP';
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.code = `${prefix}-${Date.now().toString().slice(-4)}${rand.toString().slice(-2)}`;
  }
  next();
});

const AnalyticAccount = mongoose.model('AnalyticAccount', analyticAccountSchema);
export default AnalyticAccount;
