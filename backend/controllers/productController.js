import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Protected (ADMIN, ACCOUNTANT)
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Protected (ADMIN, ACCOUNTANT)
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateProduct = async (req, res, next) => {
  try {
    if (req.body.status === 'archived' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive products',
      });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive product
// @route   PATCH /api/products/:id/archive
// @access  Protected (ADMIN only)
export const archiveProduct = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive products',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    product.status = product.status === 'archived' ? 'active' : 'archived';
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.status === 'archived' ? 'archived' : 'activated'}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};
