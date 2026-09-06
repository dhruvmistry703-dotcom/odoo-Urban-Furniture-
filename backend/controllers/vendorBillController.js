import mongoose from 'mongoose';
import VendorBill from '../models/VendorBill.js';
import Contact from '../models/Contact.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import { createVendorBillJournalEntry } from '../services/accountingEngine.js';

// @desc    Get all vendor bills (with Contact data isolation)
// @route   GET /api/vendor-bills
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getVendorBills = async (req, res, next) => {
  try {
    let filter = {};

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      if (!req.user.contactId) {
        return res.status(200).json({
          success: true,
          count: 0,
          bills: [],
        });
      }
      filter.vendorId = req.user.contactId;
    } else {
      if (req.query.vendorId) {
        filter.vendorId = req.query.vendorId;
      }
      if (req.query.status) {
        filter.status = req.query.status;
      }
    }

    const bills = await VendorBill.find(filter)
      .populate('vendorId', 'name email phone')
      .populate('purchaseOrderId', 'poNumber orderDate status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single vendor bill by ID or billNumber (with Contact data isolation)
// @route   GET /api/vendor-bills/:id
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getVendorBillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let bill = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      bill = await VendorBill.findById(id)
        .populate('vendorId', 'name email phone address taxId')
        .populate('purchaseOrderId', 'poNumber orderDate status');
    }

    if (!bill) {
      bill = await VendorBill.findOne({
        $or: [{ billNumber: id }, { billNumber: new RegExp(`^${id}$`, 'i') }],
      })
        .populate('vendorId', 'name email phone address taxId')
        .populate('purchaseOrderId', 'poNumber orderDate status');
    }

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Vendor Bill not found',
      });
    }

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      const billVendorId = bill.vendorId?._id
        ? bill.vendorId._id.toString()
        : bill.vendorId?.toString();

      if (!req.user.contactId || billVendorId !== req.user.contactId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to access this vendor bill.',
        });
      }
    }

    res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create vendor bill manually
// @route   POST /api/vendor-bills
// @access  Protected (ADMIN, ACCOUNTANT)
export const createVendorBill = async (req, res, next) => {
  try {
    const {
      vendorId,
      vendorName,
      purchaseOrderId,
      billDate,
      dueDate,
      items,
      notes,
    } = req.body;

    if (!vendorId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vendor and line items are required',
      });
    }

    const vendor = await Contact.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor contact not found' });
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

    const count = await VendorBill.countDocuments();
    const billNumber = `BILL-${String(count + 1).padStart(5, '0')}`;

    const bill = await VendorBill.create({
      billNumber,
      purchaseOrderId: purchaseOrderId || null,
      vendorId: vendor._id,
      vendorName: vendor.name,
      billDate: billDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      outstandingAmount: grandTotal,
      status: 'posted',
      notes: notes || '',
    });

    // Update Contact metrics
    await Contact.findByIdAndUpdate(vendor._id, {
      $inc: { totalInvoiced: grandTotal, outstanding: grandTotal },
    });

    // If linked to PO, update PO status
    if (purchaseOrderId) {
      await PurchaseOrder.findByIdAndUpdate(purchaseOrderId, {
        status: 'received',
        billId: bill._id,
      });
    }

    // Automatically generate Journal Entry for accounting workflow
    let journalEntry = null;
    try {
      journalEntry = await createVendorBillJournalEntry(bill);
    } catch (jeError) {
      console.error('[Accounting Engine Error] Failed to generate Journal Entry for Vendor Bill:', jeError.message);
    }

    res.status(201).json({
      success: true,
      bill,
      journalEntry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Convert Purchase Order to Vendor Bill
// @route   POST /api/vendor-bills/from-po/:poId
// @access  Protected (ADMIN, ACCOUNTANT)
export const convertPOToVendorBill = async (req, res, next) => {
  try {
    const { poId } = req.params;
    const po = await PurchaseOrder.findById(poId);

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    if (po.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot convert a cancelled Purchase Order into a Vendor Bill.',
      });
    }

    if (po.billId) {
      return res.status(400).json({
        success: false,
        message: 'This Purchase Order has already been converted into a Vendor Bill.',
      });
    }

    const count = await VendorBill.countDocuments();
    const billNumber = `BILL-${String(count + 1).padStart(5, '0')}`;

    const billDate = new Date().toISOString().split('T')[0];
    const dueDate = po.dueDate || billDate;

    const bill = await VendorBill.create({
      billNumber,
      purchaseOrderId: po._id,
      vendorId: po.vendorId,
      vendorName: po.vendorName,
      billDate,
      dueDate,
      items: po.items,
      subtotal: po.subtotal,
      taxTotal: po.taxTotal,
      grandTotal: po.grandTotal,
      paidAmount: 0,
      outstandingAmount: po.grandTotal,
      status: 'posted',
      notes: `Converted from Purchase Order ${po.poNumber}`,
    });

    // Update PO reference and status
    po.status = 'received';
    po.billId = bill._id;
    await po.save();

    // Update Contact metrics
    await Contact.findByIdAndUpdate(po.vendorId, {
      $inc: { totalInvoiced: po.grandTotal, outstanding: po.grandTotal },
    });

    // Automatically generate Journal Entry for accounting engine
    let journalEntry = null;
    try {
      journalEntry = await createVendorBillJournalEntry(bill);
    } catch (jeError) {
      console.error('[Accounting Engine Error] Failed to generate Journal Entry for converted Vendor Bill:', jeError.message);
    }

    res.status(201).json({
      success: true,
      message: `Purchase Order ${po.poNumber} successfully converted to Vendor Bill ${bill.billNumber}`,
      bill,
      journalEntry,
    });
  } catch (error) {
    next(error);
  }
};
