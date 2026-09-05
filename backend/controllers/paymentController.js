import Payment from '../models/Payment.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Contact from '../models/Contact.js';
import JournalEntry from '../models/JournalEntry.js';
import Account from '../models/Account.js';

// @desc    Get all payments (with Contact data isolation)
// @route   GET /api/payments
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getPayments = async (req, res, next) => {
  try {
    let filter = {};

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      if (!req.user.contactId) {
        return res.status(200).json({
          success: true,
          count: 0,
          payments: [],
        });
      }
      filter.contactId = req.user.contactId;
    } else {
      if (req.query.contactId) {
        filter.contactId = req.query.contactId;
      }
      if (req.query.type) {
        filter.type = req.query.type;
      }
    }

    const payments = await Payment.find(filter)
      .populate('contactId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment by ID (with Contact data isolation)
// @route   GET /api/payments/:id
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      'contactId',
      'name email phone'
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Critical Contact Data Isolation
    if (req.user.role === 'CONTACT') {
      const paymentContactId = payment.contactId?._id
        ? payment.contactId._id.toString()
        : payment.contactId?.toString();

      if (!req.user.contactId || paymentContactId !== req.user.contactId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to access this payment record.',
        });
      }
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a payment
// @route   POST /api/payments
// @access  Protected (ADMIN, ACCOUNTANT, CONTACT)
export const createPayment = async (req, res, next) => {
  try {
    let {
      type,
      contactId,
      referenceId,
      referenceNumber,
      paymentDate,
      method,
      bankAccount,
      amount,
      referenceNo,
      notes,
    } = req.body;

    // Contact security: If Contact role, force contactId to their own ID
    if (req.user.role === 'CONTACT') {
      if (!req.user.contactId) {
        return res.status(403).json({
          success: false,
          message: 'Contact user is not linked to a valid contact record',
        });
      }
      contactId = req.user.contactId;
      type = 'customer_payment';
    }

    if (!contactId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact and valid payment amount are required',
      });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // If referenceId provided (e.g. paying an invoice), verify Contact ownership if role is CONTACT
    if (referenceId && req.user.role === 'CONTACT') {
      const targetInvoice = await CustomerInvoice.findById(referenceId);
      if (!targetInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Target invoice not found',
        });
      }
      const invCustomerId = targetInvoice.customerId?._id
        ? targetInvoice.customerId._id.toString()
        : targetInvoice.customerId.toString();

      if (invCustomerId !== req.user.contactId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot pay invoice belonging to another customer',
        });
      }
    }

    const count = await Payment.countDocuments();
    const paymentNumber = `PAY-${String(count + 35).padStart(5, '0')}`;
    const isCustomerPayment = type === 'customer_payment';

    // 1. Create Journal Entry automatically for accounting workflow
    const jeCount = await JournalEntry.countDocuments();
    const jeNumber = `JE-${String(jeCount + 58).padStart(5, '0')}`;

    // Find accounts for ledger integration
    const cashAccount = await Account.findOne({ code: '1001' });
    const bankAcc = await Account.findOne({ code: '1002' });
    const arAccount = await Account.findOne({ code: '1003' });
    const apAccount = await Account.findOne({ code: '2001' });

    const selectedAssetAcc = method === 'bank' ? (bankAcc || cashAccount) : (cashAccount || bankAcc);

    const journalLines = isCustomerPayment
      ? [
          {
            accountId: selectedAssetAcc?._id,
            accountCode: selectedAssetAcc?.code || '1002',
            accountName: selectedAssetAcc?.name || (bankAccount || 'HDFC Bank Account'),
            debit: amount,
            credit: 0,
            label: `Payment received from ${contact.name}`,
          },
          {
            accountId: arAccount?._id,
            accountCode: arAccount?.code || '1003',
            accountName: arAccount?.name || 'Accounts Receivable',
            debit: 0,
            credit: amount,
            label: `Clear invoice balance ${referenceNumber || ''}`,
          },
        ]
      : [
          {
            accountId: apAccount?._id,
            accountCode: apAccount?.code || '2001',
            accountName: apAccount?.name || 'Accounts Payable',
            debit: amount,
            credit: 0,
            label: `Vendor bill payout to ${contact.name}`,
          },
          {
            accountId: selectedAssetAcc?._id,
            accountCode: selectedAssetAcc?.code || '1002',
            accountName: selectedAssetAcc?.name || (bankAccount || 'HDFC Bank Account'),
            debit: 0,
            credit: amount,
            label: `Payout for ${referenceNumber || 'Vendor Bill'}`,
          },
        ];

    const journalEntry = await JournalEntry.create({
      entryNumber: jeNumber,
      date: paymentDate || new Date().toISOString().split('T')[0],
      reference: referenceNumber || referenceNo || 'Payment Record',
      journalName: method === 'bank' ? 'Bank Receipts & Payments' : 'Cash Journal',
      lines: journalLines,
      totalDebit: amount,
      totalCredit: amount,
      isBalanced: true,
      status: 'posted',
    });

    // 2. Create Payment Record
    const payment = await Payment.create({
      paymentNumber,
      type: type || 'customer_payment',
      contactId,
      contactName: contact.name,
      referenceId: referenceId || null,
      referenceNumber: referenceNumber || '',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      method: method || 'bank',
      bankAccount: bankAccount || 'HDFC Bank Main Account',
      amount,
      referenceNo: referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
      notes,
      journalEntryId: journalEntry._id,
      status: 'posted',
    });

    // 3. Update Invoice or Bill if referenced
    if (referenceId) {
      if (isCustomerPayment) {
        const inv = await CustomerInvoice.findById(referenceId);
        if (inv) {
          const newPaid = inv.paidAmount + amount;
          const newOutstanding = Math.max(0, inv.grandTotal - newPaid);
          inv.paidAmount = newPaid;
          inv.outstandingAmount = newOutstanding;
          inv.status = newOutstanding === 0 ? 'paid' : 'partially_paid';
          await inv.save();
        }
      } else {
        const bill = await VendorBill.findById(referenceId);
        if (bill) {
          const newPaid = bill.paidAmount + amount;
          const newOutstanding = Math.max(0, bill.grandTotal - newPaid);
          bill.paidAmount = newPaid;
          bill.outstandingAmount = newOutstanding;
          bill.status = newOutstanding === 0 ? 'paid' : 'partially_paid';
          await bill.save();
        }
      }
    }

    // 4. Update Contact Metrics
    contact.totalPaid = (contact.totalPaid || 0) + amount;
    contact.outstanding = Math.max(0, (contact.outstanding || 0) - amount);
    await contact.save();

    res.status(201).json({
      success: true,
      payment,
      journalEntry,
    });
  } catch (error) {
    next(error);
  }
};
