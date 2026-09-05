import CustomerInvoice from '../models/CustomerInvoice.js';
import Contact from '../models/Contact.js';
import SalesOrder from '../models/SalesOrder.js';

// @desc    Get all invoices (with Contact data isolation)
// @route   GET /api/invoices
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getInvoices = async (req, res, next) => {
  try {
    let filter = {};

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      if (!req.user.contactId) {
        return res.status(200).json({
          success: true,
          count: 0,
          invoices: [],
        });
      }
      filter.customerId = req.user.contactId;
    } else {
      if (req.query.customerId) {
        filter.customerId = req.query.customerId;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
    }

    const invoices = await CustomerInvoice.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice by ID (with Contact data isolation)
// @route   GET /api/invoices/:id
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await CustomerInvoice.findById(req.params.id).populate(
      'customerId',
      'name email phone address taxId'
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      const invoiceCustomerId = invoice.customerId?._id
        ? invoice.customerId._id.toString()
        : invoice.customerId?.toString();

      if (!req.user.contactId || invoiceCustomerId !== req.user.contactId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to access this invoice.',
        });
      }
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Protected (ADMIN, ACCOUNTANT)
export const createInvoice = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      salesOrderId,
      invoiceDate,
      dueDate,
      items,
      notes,
    } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer and line items are required',
      });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxTotal = items.reduce(
      (sum, item) =>
        sum + item.quantity * item.unitPrice * ((item.taxRate || 18) / 100),
      0
    );
    const grandTotal = subtotal + taxTotal;

    const count = await CustomerInvoice.countDocuments();
    const invoiceNumber = `INV-${String(count + 48).padStart(5, '0')}`;

    const invoice = await CustomerInvoice.create({
      invoiceNumber,
      salesOrderId: salesOrderId || null,
      customerId,
      customerName: customerName || 'Customer',
      invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      outstandingAmount: grandTotal,
      status: 'pending',
      notes,
    });

    // Update Contact totalInvoiced & outstanding
    await Contact.findByIdAndUpdate(customerId, {
      $inc: { totalInvoiced: grandTotal, outstanding: grandTotal },
    });

    // If linked to SalesOrder, update SO
    if (salesOrderId) {
      await SalesOrder.findByIdAndUpdate(salesOrderId, {
        status: 'completed',
        invoiceId: invoice._id,
      });
    }

    res.status(201).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await CustomerInvoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const updated = await CustomerInvoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      invoice: updated,
    });
  } catch (error) {
    next(error);
  }
};
