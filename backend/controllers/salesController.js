import SalesOrder from '../models/SalesOrder.js';
import Contact from '../models/Contact.js';
import Product from '../models/Product.js';

// @desc    Get all sales orders
// @route   GET /api/sales
// @access  Protected (ADMIN, ACCOUNTANT)
export const getSalesOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.customerId) filter.customerId = req.query.customerId;
    if (req.query.status) filter.status = req.query.status;

    const orders = await SalesOrder.find(filter)
      .populate('customerId', 'name email phone type')
      .populate('invoiceId', 'invoiceNumber status paidAmount outstandingAmount')
      .sort({ createdAt: -1 });

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
    const order = await SalesOrder.findById(req.params.id)
      .populate('customerId', 'name email phone address taxId type')
      .populate('invoiceId', 'invoiceNumber status paidAmount grandTotal outstandingAmount');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }
    res.status(200).json({ success: true, salesOrder: order });
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

// @desc    Create sales order
// @route   POST /api/sales
// @access  Protected (ADMIN, ACCOUNTANT)
export const createSalesOrder = async (req, res, next) => {
  try {
    const { customerId, orderDate, dueDate, items, notes, status } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    const customer = await Contact.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Selected customer contact does not exist' });
    }

    if (customer.type === 'vendor') {
      return res.status(400).json({
        success: false,
        message: 'Selected contact is a Vendor. Please select a contact with type Customer or Both.',
      });
    }

    const { processedItems, subtotal, taxTotal, grandTotal } = await validateAndCalculateLines(items);

    const count = await SalesOrder.countDocuments();
    const orderNumber = `SO-${String(count + 1).padStart(5, '0')}`;

    const orderStatus = status === 'draft' ? 'draft' : 'confirmed';

    const order = await SalesOrder.create({
      orderNumber,
      customerId: customer._id,
      customerName: customer.name,
      orderDate: orderDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items: processedItems,
      subtotal,
      taxTotal,
      grandTotal,
      status: orderStatus,
      notes: notes || '',
    });

    res.status(201).json({ success: true, salesOrder: order });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('greater') || error.message.includes('negative')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Update sales order (Draft only)
// @route   PUT /api/sales/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateSalesOrder = async (req, res, next) => {
  try {
    const existing = await SalesOrder.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    if (existing.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit Sales Order in '${existing.status}' status. Only draft orders can be modified.`,
      });
    }

    const { customerId, orderDate, dueDate, items, notes, status } = req.body;
    let updateFields = {};

    if (customerId) {
      const customer = await Contact.findById(customerId);
      if (!customer || customer.type === 'vendor') {
        return res.status(400).json({
          success: false,
          message: 'Invalid customer contact selected',
        });
      }
      updateFields.customerId = customer._id;
      updateFields.customerName = customer.name;
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

    const updatedOrder = await SalesOrder.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('customerId', 'name email phone');

    res.status(200).json({ success: true, salesOrder: updatedOrder });
  } catch (error) {
    if (error.message.includes('required') || error.message.includes('greater') || error.message.includes('negative')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Confirm sales order
// @route   POST /api/sales/:id/confirm
// @access  Protected (ADMIN, ACCOUNTANT)
export const confirmSalesOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot confirm a cancelled sales order' });
    }

    order.status = 'confirmed';
    await order.save();

    res.status(200).json({ success: true, salesOrder: order, message: 'Sales Order confirmed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel sales order
// @route   POST /api/sales/:id/cancel
// @access  Protected (ADMIN, ACCOUNTANT)
export const cancelSalesOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    if (order.status === 'completed' || order.invoiceId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a sales order that has already generated an invoice',
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({ success: true, salesOrder: order, message: 'Sales Order cancelled' });
  } catch (error) {
    next(error);
  }
};
