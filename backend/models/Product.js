import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: () => `FURN-PRD-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    image: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['goods', 'service', 'combo'],
      default: 'goods',
    },
    category: {
      type: String,
      default: 'Furniture',
    },
    salesPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
