import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Contact from '../models/Contact.js';
import Product from '../models/Product.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import VendorBill from '../models/VendorBill.js';
import SalesOrder from '../models/SalesOrder.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import Payment from '../models/Payment.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import JournalEntry from '../models/JournalEntry.js';
import { connectDB } from '../config/db.js';
import { createVendorBillJournalEntry, createCustomerInvoiceJournalEntry, createBalancedJournalEntry, getAccountByCodeOrType } from '../services/accountingEngine.js';

dotenv.config();

export const runWorkflows = async () => {
  try {
    console.log('\n======================================================');
    console.log('🚀 EXECUTING DATABASE WORKFLOWS: 7.2 (PURCHASE) & 7.3 (SALE)');
    console.log('======================================================\n');

    await connectDB();

    // ----------------------------------------------------------------
    // 0. Ensure Chart of Accounts & Journals exist
    // ----------------------------------------------------------------
    const accountsCount = await Account.countDocuments();
    if (accountsCount === 0) {
      await Account.create([
        { code: '1001', name: 'Petty Cash Workshop', type: 'asset', balance: 25000, status: 'active' },
        { code: '1002', name: 'HDFC Bank Main Current Account', type: 'asset', balance: 540000, status: 'active' },
        { code: '1003', name: 'Accounts Receivable (Trade Debtors)', type: 'asset', balance: 405000, status: 'active' },
        { code: '1004', name: 'Raw Material Inventory (Wood & Hardware)', type: 'asset', balance: 320000, status: 'active' },
        { code: '2001', name: 'Accounts Payable (Trade Creditors)', type: 'liability', balance: 120000, status: 'active' },
        { code: '2002', name: 'GST Output Tax Payable (18%)', type: 'liability', balance: 45000, status: 'active' },
        { code: '3001', name: 'Owner Equity & Retained Earnings', type: 'capital', balance: 750000, status: 'active' },
        { code: '4001', name: 'Furniture Sales & Custom Joinery Revenue', type: 'income', balance: 650000, status: 'active' },
        { code: '5001', name: 'Cost of Timber & Raw Materials', type: 'expense', balance: 210000, status: 'active' },
        { code: '5002', name: 'Carpentry Tools & Workshop Utilities', type: 'expense', balance: 65000, status: 'active' },
      ]);
      console.log('✓ Initialized Chart of Accounts');
    }

    const journalsCount = await Journal.countDocuments();
    if (journalsCount === 0) {
      await Journal.create([
        { name: 'Customer Sales Journal', code: 'CSJ', type: 'sales', status: 'active' },
        { name: 'Vendor Purchase Journal', code: 'VPJ', type: 'purchase', status: 'active' },
        { name: 'Bank Receipts & Payments', code: 'BNK', type: 'bank', status: 'active' },
        { name: 'Workshop Cash Journal', code: 'CSH', type: 'cash', status: 'active' },
        { name: 'General Journal Entries', code: 'GEN', type: 'general', status: 'active' },
      ]);
      console.log('✓ Initialized Journals');
    }

    // ----------------------------------------------------------------
    // 1. Ensure "Azure Furniture" (Vendor) and "Nimesh Pathak" (Customer) exist
    // ----------------------------------------------------------------
    let azureVendor = await Contact.findOne({ name: { $regex: /azure furniture/i } });
    if (!azureVendor) {
      azureVendor = await Contact.create({
        name: 'Azure Furniture',
        type: 'vendor',
        email: 'azure.furniture@timbercorp.in',
        phone: '+91 98334 11223',
        street: 'Plot 12, Industrial Area Phase II',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        pincode: '560058',
        address: 'Plot 12, Industrial Area Phase II, Peenya, Bengaluru, KA - 560058',
        taxId: '29AAACF8899P1ZQ',
        totalInvoiced: 0,
        totalPaid: 0,
        outstanding: 0,
        status: 'active',
      });
      console.log('✓ Created Vendor in DB: Azure Furniture (_id: ' + azureVendor._id + ')');
    } else {
      console.log('✓ Found Existing Vendor: Azure Furniture (_id: ' + azureVendor._id + ')');
    }

    let nimeshCustomer = await Contact.findOne({ name: { $regex: /nimesh pathak/i } });
    if (!nimeshCustomer) {
      nimeshCustomer = await Contact.create({
        name: 'Nimesh Pathak',
        type: 'customer',
        email: 'nimesh.pathak@urbanliving.com',
        phone: '+91 99300 54321',
        street: 'B-402, Highstreet Residency, Baner',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        pincode: '411045',
        address: 'B-402, Highstreet Residency, Baner, Pune, Maharashtra 411045',
        taxId: '27AAACN5678G1Z2',
        totalInvoiced: 0,
        totalPaid: 0,
        outstanding: 0,
        status: 'active',
      });
      console.log('✓ Created Customer in DB: Nimesh Pathak (_id: ' + nimeshCustomer._id + ')');
    } else {
      console.log('✓ Found Existing Customer: Nimesh Pathak (_id: ' + nimeshCustomer._id + ')');
    }

    // ----------------------------------------------------------------
    // 2. Ensure "Office Chair" product exists
    // ----------------------------------------------------------------
    let officeChair = await Product.findOne({ name: { $regex: /office chair/i } });
    if (!officeChair) {
      officeChair = await Product.create({
        name: 'Office Chair',
        sku: 'FURN-CHR-001',
        type: 'goods',
        category: 'Seating',
        salesPrice: 12500,
        purchasePrice: 7200,
        stock: 50,
        status: 'active',
        description: 'Ergonomic high-back office chair with lumbar support and pneumatic height adjustment.',
      });
      console.log('✓ Created Product in DB: Office Chair (_id: ' + officeChair._id + ')');
    } else {
      console.log('✓ Found Existing Product: Office Chair (_id: ' + officeChair._id + ')');
    }

    // Ensure Teak Raw Material product exists for Azure Furniture purchase
    let rawTimber = await Product.findOne({ sku: 'RAW-TEAK-001' });
    if (!rawTimber) {
      rawTimber = await Product.create({
        name: 'Raw Seasoned Teak Wood Planks (Cubic Ft)',
        sku: 'RAW-TEAK-001',
        type: 'goods',
        category: 'Raw Materials',
        salesPrice: 4500,
        purchasePrice: 2800,
        stock: 100,
        status: 'active',
        description: 'Grade-A kiln seasoned teak wood timber planks for luxury furniture construction.',
      });
    }

    // ================================================================
    // WORKFLOW 7.2: RECORD A PURCHASE
    // 1. Create Purchase Order for Azure Furniture
    // 2. Convert Purchase Order into Vendor Bill upon goods receipt
    // 3. Record Payment through Bank
    // ================================================================
    console.log('\n------------------------------------------------------');
    console.log('📦 WORKFLOW 7.2: RECORD A PURCHASE (Azure Furniture)');
    console.log('------------------------------------------------------');

    const poCount = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${String(poCount + 101).padStart(5, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const poItems = [
      {
        productId: rawTimber._id,
        productName: rawTimber.name,
        quantity: 10,
        unitPrice: rawTimber.purchasePrice || 2800,
        taxRate: 18,
        taxAmount: (10 * 2800) * 0.18,
        total: (10 * 2800) * 1.18,
      },
    ];
    const poSubtotal = 10 * 2800; // 28000
    const poTaxTotal = poSubtotal * 0.18; // 5040
    const poGrandTotal = poSubtotal + poTaxTotal; // 33040

    // Step 1: Create Purchase Order in DB
    const purchaseOrder = await PurchaseOrder.create({
      poNumber,
      vendorId: azureVendor._id,
      vendorName: azureVendor.name,
      orderDate: today,
      dueDate: today,
      items: poItems,
      subtotal: poSubtotal,
      taxTotal: poTaxTotal,
      grandTotal: poGrandTotal,
      status: 'confirmed',
      notes: 'Purchase Order for Seasoned Teak Wood from Azure Furniture',
    });
    console.log(`[Step 1] ✓ Created Purchase Order ${purchaseOrder.poNumber} for ${azureVendor.name} - Total: ₹${poGrandTotal}`);

    // Step 2: Convert Purchase Order to Vendor Bill (Goods Received)
    const billCount = await VendorBill.countDocuments();
    const billNumber = `BILL-${String(billCount + 101).padStart(5, '0')}`;

    const vendorBill = await VendorBill.create({
      billNumber,
      purchaseOrderId: purchaseOrder._id,
      vendorId: azureVendor._id,
      vendorName: azureVendor.name,
      billDate: today,
      dueDate: today,
      items: poItems,
      subtotal: poSubtotal,
      taxTotal: poTaxTotal,
      grandTotal: poGrandTotal,
      paidAmount: 0,
      outstandingAmount: poGrandTotal,
      status: 'posted',
      notes: `Vendor Bill converted from ${purchaseOrder.poNumber} upon goods receipt.`,
    });

    // Link Bill to PO and mark PO received
    purchaseOrder.status = 'received';
    purchaseOrder.billId = vendorBill._id;
    await purchaseOrder.save();

    // Update Contact totalInvoiced & outstanding
    await Contact.findByIdAndUpdate(azureVendor._id, {
      $inc: { totalInvoiced: poGrandTotal, outstanding: poGrandTotal },
    });

    // Generate Journal Entry for Vendor Bill
    try {
      await createVendorBillJournalEntry(vendorBill);
    } catch (e) {
      console.warn('JE creation for bill:', e.message);
    }
    console.log(`[Step 2] ✓ Converted PO to Vendor Bill ${vendorBill.billNumber} (Status: Posted, Outstanding: ₹${vendorBill.outstandingAmount})`);

    // Step 3: Record Payment through Bank for Vendor Bill
    const paymentCount = await Payment.countDocuments();
    const paymentNumber = `PAY-${String(paymentCount + 101).padStart(5, '0')}`;

    const vendorPayment = await Payment.create({
      paymentNumber,
      type: 'vendor_payment',
      contactId: azureVendor._id,
      contactName: azureVendor.name,
      referenceId: vendorBill._id,
      referenceNumber: vendorBill.billNumber,
      paymentDate: today,
      method: 'bank',
      bankAccount: 'HDFC Bank Main Current Account',
      amount: poGrandTotal,
      referenceNo: `NEFT-AZURE-${Date.now().toString().slice(-6)}`,
      notes: `Full settlement for Vendor Bill ${vendorBill.billNumber} via HDFC Bank`,
      status: 'posted',
    });

    // Update Vendor Bill paidAmount & outstandingAmount
    vendorBill.paidAmount = poGrandTotal;
    vendorBill.outstandingAmount = 0;
    vendorBill.status = 'paid';
    await vendorBill.save();

    // Update Vendor outstanding balance
    await Contact.findByIdAndUpdate(azureVendor._id, {
      $inc: { totalPaid: poGrandTotal, outstanding: -poGrandTotal },
    });

    // Create Balanced Journal Entry for Vendor Payment (Debit: Accounts Payable, Credit: HDFC Bank)
    try {
      const apAccount = await getAccountByCodeOrType('2001', 'liability');
      const bankAccount = await getAccountByCodeOrType('1002', 'asset');
      const bankJournal = await Journal.findOne({ type: 'bank' }) || await Journal.findOne();

      if (apAccount && bankAccount && bankJournal) {
        const je = await createBalancedJournalEntry({
          entryDate: today,
          reference: `${vendorPayment.paymentNumber} / ${vendorBill.billNumber}`,
          journalId: bankJournal._id,
          notes: `Bank Payment to ${azureVendor.name} for ${vendorBill.billNumber}`,
          items: [
            {
              accountId: apAccount._id,
              accountCode: apAccount.code,
              accountName: apAccount.name,
              label: `Settlement AP - ${azureVendor.name}`,
              debit: poGrandTotal,
              credit: 0,
            },
            {
              accountId: bankAccount._id,
              accountCode: bankAccount.code,
              accountName: bankAccount.name,
              label: `HDFC Bank Disbursement - ${vendorBill.billNumber}`,
              debit: 0,
              credit: poGrandTotal,
            },
          ],
        });
        vendorPayment.journalEntryId = je._id;
        await vendorPayment.save();
      }
    } catch (e) {
      console.warn('JE creation for vendor payment:', e.message);
    }
    console.log(`[Step 3] ✓ Recorded Bank Payment ${vendorPayment.paymentNumber} of ₹${poGrandTotal} -> Bill is now PAID!`);

    // ================================================================
    // WORKFLOW 7.3: RECORD A SALE
    // 1. Create Sales Order for Nimesh Pathak for 5 Office Chairs
    // 2. Generate Customer Invoice from Sales Order
    // 3. Record Payment through Bank/Cash
    // ================================================================
    console.log('\n------------------------------------------------------');
    console.log('🪑 WORKFLOW 7.3: RECORD A SALE (Nimesh Pathak - 5 Office Chairs)');
    console.log('------------------------------------------------------');

    const soCount = await SalesOrder.countDocuments();
    const orderNumber = `SO-${String(soCount + 101).padStart(5, '0')}`;

    const unitPrice = officeChair.salesPrice || 12500;
    const quantity = 5;
    const soSubtotal = quantity * unitPrice; // 5 * 12500 = 62500
    const soTaxTotal = soSubtotal * 0.18; // 11250
    const soGrandTotal = soSubtotal + soTaxTotal; // 73750

    const soItems = [
      {
        productId: officeChair._id,
        productName: officeChair.name,
        quantity: 5,
        unitPrice: unitPrice,
        taxRate: 18,
        taxAmount: soTaxTotal,
        total: soGrandTotal,
      },
    ];

    // Step 1: Create Sales Order in DB for Nimesh Pathak for 5 Office Chairs
    const salesOrder = await SalesOrder.create({
      orderNumber,
      customerId: nimeshCustomer._id,
      customerName: nimeshCustomer.name,
      orderDate: today,
      dueDate: today,
      items: soItems,
      subtotal: soSubtotal,
      taxTotal: soTaxTotal,
      grandTotal: soGrandTotal,
      status: 'confirmed',
      notes: 'Sales Order for 5x Ergonomic Office Chairs for Nimesh Pathak office setup',
    });
    console.log(`[Step 1] ✓ Created Sales Order ${salesOrder.orderNumber} for ${nimeshCustomer.name} (5x ${officeChair.name}) - Total: ₹${soGrandTotal}`);

    // Step 2: Generate Customer Invoice from Sales Order
    const invoiceCount = await CustomerInvoice.countDocuments();
    const invoiceNumber = `INV-${String(invoiceCount + 101).padStart(5, '0')}`;

    const customerInvoice = await CustomerInvoice.create({
      invoiceNumber,
      salesOrderId: salesOrder._id,
      customerId: nimeshCustomer._id,
      customerName: nimeshCustomer.name,
      invoiceDate: today,
      dueDate: today,
      items: soItems,
      subtotal: soSubtotal,
      taxTotal: soTaxTotal,
      grandTotal: soGrandTotal,
      paidAmount: 0,
      outstandingAmount: soGrandTotal,
      status: 'pending',
      notes: `Tax Invoice generated from Sales Order ${salesOrder.orderNumber}`,
    });

    // Link Invoice to SO and mark SO completed
    salesOrder.status = 'completed';
    salesOrder.invoiceId = customerInvoice._id;
    await salesOrder.save();

    // Deduct stock for 5 Office Chairs
    await Product.findByIdAndUpdate(officeChair._id, {
      $inc: { stock: -5 },
    });

    // Update Customer metrics
    await Contact.findByIdAndUpdate(nimeshCustomer._id, {
      $inc: { totalInvoiced: soGrandTotal, outstanding: soGrandTotal },
    });

    // Generate Journal Entry for Customer Invoice
    try {
      await createCustomerInvoiceJournalEntry(customerInvoice);
    } catch (e) {
      console.warn('JE creation for invoice:', e.message);
    }
    console.log(`[Step 2] ✓ Generated Customer Invoice ${customerInvoice.invoiceNumber} (Status: Pending, Outstanding: ₹${customerInvoice.outstandingAmount})`);

    // Step 3: Record Payment through Bank/Cash for Customer Invoice
    const payCount2 = await Payment.countDocuments();
    const customerPaymentNumber = `PAY-${String(payCount2 + 101).padStart(5, '0')}`;

    const customerPayment = await Payment.create({
      paymentNumber: customerPaymentNumber,
      type: 'customer_payment',
      contactId: nimeshCustomer._id,
      contactName: nimeshCustomer.name,
      referenceId: customerInvoice._id,
      referenceNumber: customerInvoice.invoiceNumber,
      paymentDate: today,
      method: 'bank',
      bankAccount: 'HDFC Bank Main Current Account',
      amount: soGrandTotal,
      referenceNo: `UPI-NIMESH-${Date.now().toString().slice(-6)}`,
      notes: `Full payment received for Customer Invoice ${customerInvoice.invoiceNumber} via NetBanking/UPI`,
      status: 'posted',
    });

    // Update Customer Invoice paidAmount & outstandingAmount
    customerInvoice.paidAmount = soGrandTotal;
    customerInvoice.outstandingAmount = 0;
    customerInvoice.status = 'paid';
    await customerInvoice.save();

    // Update Customer outstanding balance
    await Contact.findByIdAndUpdate(nimeshCustomer._id, {
      $inc: { totalPaid: soGrandTotal, outstanding: -soGrandTotal },
    });

    // Create Balanced Journal Entry for Customer Payment (Debit: HDFC Bank, Credit: Accounts Receivable)
    try {
      const arAccount = await getAccountByCodeOrType('1003', 'asset');
      const bankAccount = await getAccountByCodeOrType('1002', 'asset');
      const bankJournal = await Journal.findOne({ type: 'bank' }) || await Journal.findOne();

      if (arAccount && bankAccount && bankJournal) {
        const je = await createBalancedJournalEntry({
          entryDate: today,
          reference: `${customerPayment.paymentNumber} / ${customerInvoice.invoiceNumber}`,
          journalId: bankJournal._id,
          notes: `Customer Payment from ${nimeshCustomer.name} for ${customerInvoice.invoiceNumber}`,
          items: [
            {
              accountId: bankAccount._id,
              accountCode: bankAccount.code,
              accountName: bankAccount.name,
              label: `HDFC Bank Receipt - ${customerInvoice.invoiceNumber}`,
              debit: soGrandTotal,
              credit: 0,
            },
            {
              accountId: arAccount._id,
              accountCode: arAccount.code,
              accountName: arAccount.name,
              label: `Clear Accounts Receivable - ${nimeshCustomer.name}`,
              debit: 0,
              credit: soGrandTotal,
            },
          ],
        });
        customerPayment.journalEntryId = je._id;
        await customerPayment.save();
      }
    } catch (e) {
      console.warn('JE creation for customer payment:', e.message);
    }
    console.log(`[Step 3] ✓ Recorded Bank/Cash Payment ${customerPayment.paymentNumber} of ₹${soGrandTotal} -> Invoice is now PAID!`);

    console.log('\n======================================================');
    console.log('✅ ALL DATABASE WORKFLOWS EXECUTED AND RECORDED IN MONGODB ATLAS!');
    console.log('======================================================\n');

    return {
      purchaseOrder,
      vendorBill,
      vendorPayment,
      salesOrder,
      customerInvoice,
      customerPayment,
    };
  } catch (error) {
    console.error('❌ Error executing database workflows:', error);
    throw error;
  }
};

// If run directly via node
if (process.argv[1]?.endsWith('executeWorkflows.js')) {
  runWorkflows().then(() => process.exit(0)).catch(() => process.exit(1));
}
