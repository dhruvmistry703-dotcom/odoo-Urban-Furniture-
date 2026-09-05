import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  productName: String,
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  taxRate: {
    type: Number,
    default: 18,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
});

const vendorBillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder',
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    billDate: {
      type: String,
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    items: [lineItemSchema],
    subtotal: {
      type: Number,
      default: 0,
    },
    taxTotal: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'posted', 'partially_paid', 'paid', 'cancelled'],
      default: 'posted',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const VendorBill = mongoose.model('VendorBill', vendorBillSchema);
export default VendorBill;
