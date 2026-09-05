import SalesOrder from '../models/SalesOrder.js';

// @desc    Get all sales orders
// @route   GET /api/sales
// @access  Protected (ADMIN, ACCOUNTANT)
export const getSalesOrders = async (req, res, next) => {
  try {
    const orders = await SalesOrder.find().populate('customerId', 'name email phone').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, salesOrders: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sales order by ID
// @route   GET /api/sales/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getSalesOrderById = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id).populate('customerId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }
    res.status(200).json({ success: true, salesOrder: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sales order
// @route   POST /api/sales
// @access  Protected (ADMIN, ACCOUNTANT)
export const createSalesOrder = async (req, res, next) => {
  try {
    const { customerId, customerName, orderDate, dueDate, items, notes } = req.body;
    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and items are required' });
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * ((item.taxRate || 18) / 100),
      0
    );
    const grandTotal = subtotal + taxTotal;

    const count = await SalesOrder.countDocuments();
    const orderNumber = `SO-${String(count + 48).padStart(5, '0')}`;

    const order = await SalesOrder.create({
      orderNumber,
      customerId,
      customerName: customerName || 'Customer',
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxTotal,
      grandTotal,
      status: 'confirmed',
      notes,
    });

    res.status(201).json({ success: true, salesOrder: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sales order status
// @route   PUT /api/sales/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateSalesOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }
    res.status(200).json({ success: true, salesOrder: order });
  } catch (error) {
    next(error);
  }
};
