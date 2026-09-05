import PurchaseOrder from '../models/PurchaseOrder.js';

// @desc    Get all purchase orders
// @route   GET /api/purchases
// @access  Protected (ADMIN, ACCOUNTANT)
export const getPurchaseOrders = async (req, res, next) => {
  try {
    const orders = await PurchaseOrder.find().populate('vendorId', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, purchaseOrders: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase order by ID
// @route   GET /api/purchases/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getPurchaseOrderById = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id).populate('vendorId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, purchaseOrder: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create purchase order
// @route   POST /api/purchases
// @access  Protected (ADMIN, ACCOUNTANT)
export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendorId, vendorName, orderDate, dueDate, items, notes } = req.body;
    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vendor and items are required' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * ((item.taxRate || 18) / 100),
      0
    );
    const grandTotal = subtotal + taxTotal;

    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${String(count + 14).padStart(5, '0')}`;

    const order = await PurchaseOrder.create({
      poNumber,
      vendorId,
      vendorName: vendorName || 'Vendor',
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxTotal,
      grandTotal,
      status: 'confirmed',
      notes,
    });

    res.status(201).json({ success: true, purchaseOrder: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update purchase order
// @route   PUT /api/purchases/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updatePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, purchaseOrder: order });
  } catch (error) {
    next(error);
  }
};
