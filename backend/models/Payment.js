import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['customer_payment', 'vendor_payment'],
      required: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceNumber: String,
    paymentDate: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      enum: ['cash', 'bank'],
      default: 'bank',
      required: true,
    },
    bankAccount: String,
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    referenceNo: String,
    notes: String,
    journalEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JournalEntry',
    },
    status: {
      type: String,
      enum: ['posted', 'cancelled'],
      default: 'posted',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
