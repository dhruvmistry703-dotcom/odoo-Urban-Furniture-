import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Contact from '../models/Contact.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import { createBalancedJournalEntry, getAccountByCodeOrType } from '../services/accountingEngine.js';

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
      .populate('journalEntryId', 'entryNumber totalDebit totalCredit status')
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
    const payment = await Payment.findById(req.params.id)
      .populate('contactId', 'name email phone')
      .populate('journalEntryId');

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

// @desc    Record a unified payment (Customer Invoice or Vendor Bill)
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

    // Contact security: If Contact role, force contactId to their own ID & customer payment
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

    const payAmount = Number(amount);
    if (!contactId || isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact and a valid payment amount greater than zero are required',
      });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    const isCustomerPayment = type === 'customer_payment';
    let targetInvoice = null;
    let targetBill = null;

    // Validate reference & check overpayment limits
    if (referenceId) {
      if (isCustomerPayment) {
        targetInvoice = await CustomerInvoice.findById(referenceId);
        if (!targetInvoice) {
          return res.status(404).json({ success: false, message: 'Target customer invoice not found' });
        }

        // Check ownership if CONTACT role
        if (req.user.role === 'CONTACT') {
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

        // STRICT OVERPAYMENT VALIDATION
        const currentOutstanding = targetInvoice.outstandingAmount ?? (targetInvoice.grandTotal - targetInvoice.paidAmount);
        if (payAmount > currentOutstanding + 0.01) {
          return res.status(400).json({
            success: false,
            message: `Payment amount (₹${payAmount.toLocaleString()}) cannot exceed the outstanding balance (₹${currentOutstanding.toLocaleString()}) on invoice ${targetInvoice.invoiceNumber}.`,
          });
        }
      } else {
        targetBill = await VendorBill.findById(referenceId);
        if (!targetBill) {
          return res.status(404).json({ success: false, message: 'Target vendor bill not found' });
        }

        // STRICT OVERPAYMENT VALIDATION
        const currentOutstanding = targetBill.outstandingAmount ?? (targetBill.grandTotal - targetBill.paidAmount);
        if (payAmount > currentOutstanding + 0.01) {
          return res.status(400).json({
            success: false,
            message: `Payment amount (₹${payAmount.toLocaleString()}) cannot exceed the outstanding balance (₹${currentOutstanding.toLocaleString()}) on bill ${targetBill.billNumber}.`,
          });
        }
      }
    }

    // Generate Payment Number
    const count = await Payment.countDocuments();
    const paymentNumber = `PAY-${String(count + 1).padStart(5, '0')}`;

    // Select Chart of Accounts
    const cashAccount = await getAccountByCodeOrType('1001', 'asset');
    const bankAcc = await getAccountByCodeOrType('1002', 'asset');
    const arAccount = await getAccountByCodeOrType('1003', 'asset');
    const apAccount = await getAccountByCodeOrType('2001', 'liability');

    const assetAcc = method === 'cash' ? (cashAccount || bankAcc) : (bankAcc || cashAccount);

    // Build balanced double-entry accounting lines
    const journalLines = isCustomerPayment
      ? [
          {
            accountId: assetAcc?._id,
            accountCode: assetAcc?.code || (method === 'cash' ? '1001' : '1002'),
            accountName: assetAcc?.name || (method === 'cash' ? 'Petty Cash Workshop' : 'HDFC Bank Account'),
            debit: payAmount,
            credit: 0,
            label: `Customer payment received from ${contact.name}`,
          },
          {
            accountId: arAccount?._id,
            accountCode: arAccount?.code || '1003',
            accountName: arAccount?.name || 'Accounts Receivable (Trade Debtors)',
            debit: 0,
            credit: payAmount,
            label: `Clear invoice balance ${targetInvoice ? targetInvoice.invoiceNumber : referenceNumber || ''}`,
          },
        ]
      : [
          {
            accountId: apAccount?._id,
            accountCode: apAccount?.code || '2001',
            accountName: apAccount?.name || 'Accounts Payable (Trade Creditors)',
            debit: payAmount,
            credit: 0,
            label: `Vendor bill payout to ${contact.name}`,
          },
          {
            accountId: assetAcc?._id,
            accountCode: assetAcc?.code || (method === 'cash' ? '1001' : '1002'),
            accountName: assetAcc?.name || (method === 'cash' ? 'Petty Cash Workshop' : 'HDFC Bank Account'),
            debit: 0,
            credit: payAmount,
            label: `Payout for ${targetBill ? targetBill.billNumber : referenceNumber || 'Vendor Bill'}`,
          },
        ];

    // Create balanced Journal Entry via Accounting Engine
    const journalEntry = await createBalancedJournalEntry({
      entryNumberPrefix: 'JE-PY',
      date: paymentDate || new Date().toISOString().split('T')[0],
      reference: referenceNumber || targetInvoice?.invoiceNumber || targetBill?.billNumber || paymentNumber,
      journalName: method === 'cash' ? 'Workshop Cash Journal' : 'Bank Receipts & Payments',
      lines: journalLines,
    });

    // Create Payment record
    const payment = await Payment.create({
      paymentNumber,
      type: isCustomerPayment ? 'customer_payment' : 'vendor_payment',
      contactId: contact._id,
      contactName: contact.name,
      referenceId: referenceId || null,
      referenceNumber: referenceNumber || targetInvoice?.invoiceNumber || targetBill?.billNumber || '',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      method: method || 'bank',
      bankAccount: bankAccount || (method === 'cash' ? 'Workshop Cash Drawer' : 'HDFC Bank Main Current Account'),
      amount: payAmount,
      referenceNo: referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
      notes: notes || '',
      journalEntryId: journalEntry._id,
      status: 'posted',
    });

    // Update target Customer Invoice or Vendor Bill status & balance
    if (targetInvoice) {
      const newPaid = targetInvoice.paidAmount + payAmount;
      const newOutstanding = Math.max(0, targetInvoice.grandTotal - newPaid);
      targetInvoice.paidAmount = newPaid;
      targetInvoice.outstandingAmount = newOutstanding;
      targetInvoice.status = newOutstanding === 0 ? 'paid' : 'partially_paid';
      await targetInvoice.save();
    } else if (targetBill) {
      const newPaid = targetBill.paidAmount + payAmount;
      const newOutstanding = Math.max(0, targetBill.grandTotal - newPaid);
      targetBill.paidAmount = newPaid;
      targetBill.outstandingAmount = newOutstanding;
      targetBill.status = newOutstanding === 0 ? 'paid' : 'partially_paid';
      await targetBill.save();
    }

    // Update Contact metrics
    contact.totalPaid = (contact.totalPaid || 0) + payAmount;
    contact.outstanding = Math.max(0, (contact.outstanding || 0) - payAmount);
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded and journal entry posted successfully',
      payment,
      journalEntry,
    });
  } catch (error) {
    if (error.statusCode === 400 || error.message.includes('not balanced')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
