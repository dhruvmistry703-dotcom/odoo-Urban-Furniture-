import VendorBill from '../models/VendorBill.js';
import Contact from '../models/Contact.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

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

// @desc    Get single vendor bill by ID (with Contact data isolation)
// @route   GET /api/vendor-bills/:id
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getVendorBillById = async (req, res, next) => {
  try {
    const bill = await VendorBill.findById(req.params.id).populate(
      'vendorId',
      'name email phone address taxId'
    );

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

// @desc    Create vendor bill
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
    const billNumber = `BILL-${String(count + 14).padStart(5, '0')}`;

    const bill = await VendorBill.create({
      billNumber,
      purchaseOrderId: purchaseOrderId || null,
      vendorId,
      vendorName: vendorName || 'Vendor',
      billDate: billDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      items,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0,
      outstandingAmount: grandTotal,
      status: 'posted',
      notes,
    });

    // Update Contact totalInvoiced & outstanding
    await Contact.findByIdAndUpdate(vendorId, {
      $inc: { totalInvoiced: grandTotal, outstanding: grandTotal },
    });

    // If linked to PO, update PO status
    if (purchaseOrderId) {
      await PurchaseOrder.findByIdAndUpdate(purchaseOrderId, {
        status: 'received',
        billId: bill._id,
      });
    }

    res.status(201).json({
      success: true,
      bill,
    });
  } catch (error) {
    next(error);
  }
};
