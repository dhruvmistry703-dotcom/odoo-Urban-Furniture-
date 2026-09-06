import mongoose from 'mongoose';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Contact from '../models/Contact.js';
import Product from '../models/Product.js';

// @desc    Get all purchase orders
// @route   GET /api/purchases
// @access  Protected (ADMIN, ACCOUNTANT)
export const getPurchaseOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.vendorId) filter.vendorId = req.query.vendorId;
    if (req.query.status) filter.status = req.query.status;

    const orders = await PurchaseOrder.find(filter)
      .populate('vendorId', 'name email phone type')
      .populate('billId', 'billNumber status paidAmount outstandingAmount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, purchaseOrders: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase order by ID or PO number
// @route   GET /api/purchases/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let order = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await PurchaseOrder.findById(id)
        .populate('vendorId', 'name email phone address taxId type')
        .populate('billId', 'billNumber status paidAmount grandTotal outstandingAmount');
    }

    if (!order) {
      order = await PurchaseOrder.findOne({
        $or: [{ poNumber: id }, { poNumber: new RegExp(`^${id}$`, 'i') }],
      })
        .populate('vendorId', 'name email phone address taxId type')
        .populate('billId', 'billNumber status paidAmount grandTotal outstandingAmount');
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, purchaseOrder: order });
  } catch (error) {
    next(error);
  }
};

// Helper for backend recalculation & line item validation
const validateAndCalculateLines = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one item is required');
  }

  const processedItems = [];
  let subtotal = 0;
  let taxTotal = 0;

  for (const item of items) {
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);
    const tax = Number(item.taxRate ?? 18);

    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Quantity must be greater than 0 for item ${item.productName || item.productId}`);
    }
    if (isNaN(price) || price < 0) {
      throw new Error(`Unit price cannot be negative for item ${item.productName || item.productId}`);
    }
    if (isNaN(tax) || tax < 0) {
      throw new Error(`Tax rate cannot be negative for item ${item.productName || item.productId}`);
    }

    let productName = item.productName;
    if (item.productId && !productName) {
      const prod = await Product.findById(item.productId);
      if (prod) productName = prod.name;
    }

    const lineSubtotal = qty * price;
    const lineTax = lineSubtotal * (tax / 100);
    const lineTotal = lineSubtotal + lineTax;

    subtotal += lineSubtotal;
    taxTotal += lineTax;

    processedItems.push({
      productId: item.productId || null,
      productName: productName || 'Product Item',
      quantity: qty,
      unitPrice: price,
      taxRate: tax,
      taxAmount: lineTax,
      total: lineTotal,
    });
  }

  const grandTotal = subtotal + taxTotal;
  return { processedItems, subtotal, taxTotal, grandTotal };
};

// @desc    Create purchase order
// @route   POST /api/purchases
// @access  Protected (ADMIN, ACCOUNTANT)
export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendorId, orderDate, dueDate, items, notes, status } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor is required' });
    }

    const vendor = await Contact.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Selected vendor contact does not exist' });
    }

    if (vendor.type === 'customer') {
      return res.status(400).json({
        success: false,
        message: 'Selected contact is a Customer. Please select a contact with type Vendor or Both.',
      });
    }

    const { processedItems, subtotal, taxTotal, grandTotal } = await validateAndCalculateLines(items);

    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${String(count + 1).padStart(5, '0')}`;

    const orderStatus = status === 'draft' ? 'draft' : 'confirmed';

    const order = await PurchaseOrder.create({
      poNumber,
      vendorId: vendor._id,
      vendorName: vendor.name,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items: processedItems,
      subtotal,
      taxTotal,
      grandTotal,
      status: orderStatus,
      notes: notes || '',
    });

    res.status(201).json({ success: true, purchaseOrder: order });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('greater') || error.message.includes('negative')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Update purchase order (Draft only)
// @route   PUT /api/purchases/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const existing = await PurchaseOrder.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (existing.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit Purchase Order in '${existing.status}' status. Only draft orders can be modified.`,
      });
    }

    const { vendorId, orderDate, dueDate, items, notes, status } = req.body;
    let updateFields = {};

    if (vendorId) {
      const vendor = await Contact.findById(vendorId);
      if (!vendor || vendor.type === 'customer') {
        return res.status(400).json({
          success: false,
          message: 'Invalid vendor contact selected',
        });
      }
      updateFields.vendorId = vendor._id;
      updateFields.vendorName = vendor.name;
    }

    if (items) {
      const { processedItems, subtotal, taxTotal, grandTotal } = await validateAndCalculateLines(items);
      updateFields.items = processedItems;
      updateFields.subtotal = subtotal;
      updateFields.taxTotal = taxTotal;
      updateFields.grandTotal = grandTotal;
    }

    if (orderDate) updateFields.orderDate = orderDate;
    if (dueDate) updateFields.dueDate = dueDate;
    if (notes !== undefined) updateFields.notes = notes;
    if (status) updateFields.status = status;

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('vendorId', 'name email phone');

    res.status(200).json({ success: true, purchaseOrder: updatedOrder });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('greater') || error.message.includes('negative')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Confirm purchase order
// @route   POST /api/purchases/:id/confirm
// @access  Protected (ADMIN, ACCOUNTANT)
export const confirmPurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot confirm a cancelled purchase order' });
    }

    order.status = 'confirmed';
    await order.save();

    res.status(200).json({ success: true, purchaseOrder: order, message: 'Purchase Order confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel purchase order
// @route   POST /api/purchases/:id/cancel
// @access  Protected (ADMIN, ACCOUNTANT)
export const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    if (order.status === 'received' || order.billId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a purchase order that has already been converted to a vendor bill',
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, purchaseOrder: order, message: 'Purchase Order cancelled' });
  } catch (error) {
    next(error);
  }
};
