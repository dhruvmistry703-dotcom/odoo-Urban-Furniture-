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
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
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

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    orderDate: {
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
    status: {
      type: String,
      enum: ['draft', 'confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerInvoice',
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
export default SalesOrder;
