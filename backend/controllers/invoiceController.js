import mongoose from 'mongoose';
import CustomerInvoice from '../models/CustomerInvoice.js';
import Contact from '../models/Contact.js';
import SalesOrder from '../models/SalesOrder.js';
import Product from '../models/Product.js';
import { createCustomerInvoiceJournalEntry } from '../services/accountingEngine.js';

// @desc    Get all invoices (with Contact data isolation)
// @route   GET /api/invoices
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getInvoices = async (req, res, next) => {
  try {
    let filter = {};

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      let contactId = req.user.contactId;

      // Fallback resolution by email if contactId was not set
      if (!contactId && req.user.email) {
        const matchedContact = await Contact.findOne({ email: req.user.email.toLowerCase() });
        if (matchedContact) {
          contactId = matchedContact._id.toString();
        }
      }

      if (contactId) {
        filter = {
          $or: [
            { customerId: contactId },
            { customerName: { $regex: req.user.name || '', $options: 'i' } }
          ]
        };
      } else {
        filter = { customerName: { $regex: req.user.name || '', $options: 'i' } };
      }
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
      .populate('salesOrderId', 'orderNumber orderDate status')
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

// @desc    Get single invoice by ID or invoiceNumber (with Contact data isolation)
// @route   GET /api/invoices/:id
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoice = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      invoice = await CustomerInvoice.findById(id)
        .populate('customerId', 'name email phone address taxId')
        .populate('salesOrderId', 'orderNumber orderDate status');
    }

    if (!invoice) {
      invoice = await CustomerInvoice.findOne({
        $or: [{ invoiceNumber: id }, { invoiceNumber: new RegExp(`^${id}$`, 'i') }],
      })
        .populate('customerId', 'name email phone address taxId')
        .populate('salesOrderId', 'orderNumber orderDate status');
    }

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

      let userContactId = req.user.contactId;
      if (!userContactId && req.user.email) {
        const matchedContact = await Contact.findOne({ email: req.user.email.toLowerCase() });
        if (matchedContact) userContactId = matchedContact._id.toString();
      }

      const matchesName = invoice.customerName && req.user.name &&
        invoice.customerName.toLowerCase().includes(req.user.name.toLowerCase());

      if (invoiceCustomerId !== userContactId && !matchesName) {
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

// @desc    Create invoice manually
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

    const customer = await Contact.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer contact not found' });
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
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

    const invoice = await CustomerInvoice.create({
      invoiceNumber,
      salesOrderId: salesOrderId || null,
      customerId: customer._id,
      customerName: customer.name,
      invoiceDate: invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      outstandingAmount: grandTotal,
      status: 'pending',
      notes: notes || '',
    });

    // Update Contact metrics
    await Contact.findByIdAndUpdate(customer._id, {
      $inc: { totalInvoiced: grandTotal, outstanding: grandTotal },
    });

    // If linked to Sales Order, update SO
    if (salesOrderId) {
      await SalesOrder.findByIdAndUpdate(salesOrderId, {
        status: 'completed',
        invoiceId: invoice._id,
      });
    }

    // Automatically generate Journal Entry for accounting engine
    let journalEntry = null;
    try {
      journalEntry = await createCustomerInvoiceJournalEntry(invoice);
    } catch (jeError) {
      console.error('[Accounting Engine Error] Failed to generate Journal Entry for Invoice:', jeError.message);
    }

    res.status(201).json({
      success: true,
      invoice,
      journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Customer Invoice from Sales Order
// @route   POST /api/invoices/from-so/:soId
// @access  Protected (ADMIN, ACCOUNTANT)
export const convertSOToInvoice = async (req, res, next) => {
  try {
    const { soId } = req.params;
    const so = await SalesOrder.findById(soId);

    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    if (so.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate an invoice from a cancelled Sales Order.',
      });
    }

    if (so.invoiceId) {
      return res.status(400).json({
        success: false,
        message: 'An invoice has already been generated for this Sales Order.',
      });
    }

    const count = await CustomerInvoice.countDocuments();
    const invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;

    const invoiceDate = new Date().toISOString().split('T')[0];
    const dueDate = so.dueDate || invoiceDate;

    const invoice = await CustomerInvoice.create({
      invoiceNumber,
      salesOrderId: so._id,
      customerId: so.customerId,
      customerName: so.customerName,
      invoiceDate,
      dueDate,
      items: so.items,
      subtotal: so.subtotal,
      taxTotal: so.taxTotal,
      grandTotal: so.grandTotal,
      paidAmount: 0,
      outstandingAmount: so.grandTotal,
      status: 'pending',
      notes: `Generated from Sales Order ${so.orderNumber}`,
    });

    // Update SO reference and status
    so.status = 'completed';
    so.invoiceId = invoice._id;
    await so.save();

    // Update Contact metrics
    await Contact.findByIdAndUpdate(so.customerId, {
      $inc: { totalInvoiced: so.grandTotal, outstanding: so.grandTotal },
    });

    // Automatically generate Journal Entry for accounting engine
    let journalEntry = null;
    try {
      journalEntry = await createCustomerInvoiceJournalEntry(invoice);
    } catch (jeError) {
      console.error('[Accounting Engine Error] Failed to generate Journal Entry for converted Invoice:', jeError.message);
    }

    res.status(201).json({
      success: true,
      message: `Sales Order ${so.orderNumber} successfully converted to Invoice ${invoice.invoiceNumber}`,
      invoice,
      journalEntry,
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
