import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Product from '../models/Product.js';
import Account from '../models/Account.js';
import Journal from '../models/Journal.js';
import JournalEntry from '../models/JournalEntry.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Payment from '../models/Payment.js';
import AnalyticAccount from '../models/AnalyticAccount.js';
import Budget from '../models/Budget.js';

import { connectDB } from '../config/db.js';

dotenv.config();

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    const conn = await connectDB();
    if (!conn) {
      console.error('[Seed Error] Could not establish MongoDB connection. Please ensure MongoDB Atlas IP is whitelisted or MongoDB is running.');
      process.exit(1);
    }
    console.log('[Seed] MongoDB connected successfully.');

    // 1. Seed / Upsert Contacts
    let contactCustomer = await Contact.findOne({ email: 'customer@urbanfurniture.com' });
    if (!contactCustomer) {
      contactCustomer = await Contact.create({
        name: 'Royal Oak Interiors (Demo Customer)',
        type: 'customer',
        email: 'customer@urbanfurniture.com',
        phone: '+91 98765 43210',
        address: 'Plot 42, GIDC Industrial Estate, Surat, Gujarat - 395004',
        taxId: '24AABCU9603R1ZM',
        totalInvoiced: 240000,
        totalPaid: 85000,
        outstanding: 155000,
        status: 'active',
      });
      console.log('✓ Created Contact: Royal Oak Interiors');
    }

    let contactVendor = await Contact.findOne({ email: 'timber@teakcraft.com' });
    if (!contactVendor) {
      contactVendor = await Contact.create({
        name: 'Teak Craft Timber Suppliers (Demo Vendor)',
        type: 'vendor',
        email: 'timber@teakcraft.com',
        phone: '+91 98234 56789',
        address: 'Timber Yard 5, Bhavnagar Highway, Gujarat - 364001',
        taxId: '24AAXCT1204K1ZL',
        totalInvoiced: 120000,
        totalPaid: 0,
        outstanding: 120000,
        status: 'active',
      });
      console.log('✓ Created Contact: Teak Craft Timber Suppliers');
    }

    let otherCustomer = await Contact.findOne({ email: 'studio@luxeliving.com' });
    if (!otherCustomer) {
      otherCustomer = await Contact.create({
        name: 'Luxe Living Design Studio (Other Customer)',
        type: 'customer',
        email: 'studio@luxeliving.com',
        phone: '+91 98111 22233',
        address: 'Road 12, Banjara Hills, Hyderabad - 500034',
        taxId: '36AAACL4455Q1Z8',
        totalInvoiced: 350000,
        totalPaid: 100000,
        outstanding: 250000,
        status: 'active',
      });
      console.log('✓ Created Contact: Luxe Living Design Studio (Isolation Test)');
    }

    // 2. Seed / Upsert Users
    // Admin User
    const adminEmail = 'admin@urbanfurniture.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Business Owner (Admin)',
        email: adminEmail,
        password: 'Admin@123',
        role: 'ADMIN',
        isActive: true,
      });
      console.log(`✓ Created Admin User: ${adminEmail} (Password: Admin@123)`);
    } else {
      adminUser.role = 'ADMIN';
      adminUser.password = 'Admin@123';
      adminUser.isActive = true;
      await adminUser.save();
      console.log(`✓ Updated Admin User: ${adminEmail}`);
    }

    // Accountant User
    const accountantEmail = 'accountant@urbanfurniture.com';
    let accountantUser = await User.findOne({ email: accountantEmail });
    if (!accountantUser) {
      accountantUser = await User.create({
        name: 'Senior Accountant',
        email: accountantEmail,
        password: 'Accountant@123',
        role: 'ACCOUNTANT',
        isActive: true,
      });
      console.log(`✓ Created Accountant User: ${accountantEmail} (Password: Accountant@123)`);
    } else {
      accountantUser.role = 'ACCOUNTANT';
      accountantUser.password = 'Accountant@123';
      accountantUser.isActive = true;
      await accountantUser.save();
      console.log(`✓ Updated Accountant User: ${accountantEmail}`);
    }

    // Contact User (Linked to contactCustomer._id)
    const customerEmail = 'customer@urbanfurniture.com';
    let contactUser = await User.findOne({ email: customerEmail });
    if (!contactUser) {
      contactUser = await User.create({
        name: 'Royal Oak Representative',
        email: customerEmail,
        password: 'Customer@123',
        role: 'CONTACT',
        contactId: contactCustomer._id,
        isActive: true,
      });
      console.log(`✓ Created Contact User: ${customerEmail} (Password: Customer@123, Linked Contact: ${contactCustomer._id})`);
    } else {
      contactUser.role = 'CONTACT';
      contactUser.contactId = contactCustomer._id;
      contactUser.password = 'Customer@123';
      contactUser.isActive = true;
      await contactUser.save();
      console.log(`✓ Updated Contact User: ${customerEmail}`);
    }

    // 3. Seed Chart of Accounts if empty
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
      console.log('✓ Seeded Chart of Accounts');
    }

    // 4. Seed Journals if empty
    const journalsCount = await Journal.countDocuments();
    if (journalsCount === 0) {
      await Journal.create([
        { name: 'Customer Sales Journal', code: 'CSJ', type: 'sales', status: 'active' },
        { name: 'Vendor Purchase Journal', code: 'VPJ', type: 'purchase', status: 'active' },
        { name: 'Bank Receipts & Payments', code: 'BNK', type: 'bank', status: 'active' },
        { name: 'Workshop Cash Journal', code: 'CSH', type: 'cash', status: 'active' },
        { name: 'General Journal Entries', code: 'GEN', type: 'general', status: 'active' },
      ]);
      console.log('✓ Seeded Journals');
    }

    // 5. Seed Products if empty
    const productsCount = await Product.countDocuments();
    let sampleProduct1, sampleProduct2;
    if (productsCount === 0) {
      sampleProduct1 = await Product.create({
        name: 'Solid Teak Wood Executive Desk (6x3 ft)',
        sku: 'DSK-TEAK-001',
        type: 'goods',
        category: 'Office Desks',
        salesPrice: 45000,
        purchasePrice: 22000,
        stock: 12,
        status: 'active',
        description: 'Handcrafted seasoned Burma teak wood executive study desk with brass handles',
      });

      sampleProduct2 = await Product.create({
        name: 'Ergonomic Leather Lounge Armchair',
        sku: 'CHR-LNG-004',
        type: 'goods',
        category: 'Seating',
        salesPrice: 28000,
        purchasePrice: 14000,
        stock: 20,
        status: 'active',
        description: 'Premium distressed tan leather armchair with reinforced oak wood legs',
      });
      console.log('✓ Seeded Products');
    } else {
      sampleProduct1 = await Product.findOne({ sku: 'DSK-TEAK-001' });
      sampleProduct2 = await Product.findOne({ sku: 'CHR-LNG-004' });
    }

    // 6. Seed Invoices for Contact Data Isolation
    const invoiceCount = await CustomerInvoice.countDocuments();
    if (invoiceCount === 0) {
      // Invoices for Royal Oak Interiors (customer@urbanfurniture.com)
      await CustomerInvoice.create({
        invoiceNumber: 'INV-00045',
        customerId: contactCustomer._id,
        customerName: contactCustomer.name,
        invoiceDate: '2026-08-15',
        dueDate: '2026-09-15',
        items: [
          {
            productId: sampleProduct1?._id,
            productName: sampleProduct1?.name || 'Solid Teak Wood Executive Desk',
            quantity: 3,
            unitPrice: 45000,
            taxRate: 18,
            taxAmount: 24300,
            total: 159300,
          },
        ],
        subtotal: 135000,
        taxTotal: 24300,
        grandTotal: 159300,
        paidAmount: 0,
        outstandingAmount: 159300,
        status: 'pending',
        notes: 'Invoice for 3x Executive Desks delivery to Surat branch',
      });

      await CustomerInvoice.create({
        invoiceNumber: 'INV-00046',
        customerId: contactCustomer._id,
        customerName: contactCustomer.name,
        invoiceDate: '2026-07-10',
        dueDate: '2026-08-10',
        items: [
          {
            productId: sampleProduct2?._id,
            productName: sampleProduct2?.name || 'Ergonomic Leather Lounge Armchair',
            quantity: 2,
            unitPrice: 28000,
            taxRate: 18,
            taxAmount: 10080,
            total: 66080,
          },
        ],
        subtotal: 56000,
        taxTotal: 10080,
        grandTotal: 66080,
        paidAmount: 66080,
        outstandingAmount: 0,
        status: 'paid',
        notes: 'Paid in full via Bank NEFT',
      });

      // Invoice for Luxe Living (Other Customer - MUST BE ISOLATED AND NOT VISIBLE TO Royal Oak)
      await CustomerInvoice.create({
        invoiceNumber: 'INV-00047',
        customerId: otherCustomer._id,
        customerName: otherCustomer.name,
        invoiceDate: '2026-08-20',
        dueDate: '2026-09-20',
        items: [
          {
            productId: sampleProduct1?._id,
            productName: sampleProduct1?.name || 'Solid Teak Wood Executive Desk',
            quantity: 5,
            unitPrice: 45000,
            taxRate: 18,
            taxAmount: 40500,
            total: 265500,
          },
        ],
        subtotal: 225000,
        taxTotal: 40500,
        grandTotal: 265500,
        paidAmount: 0,
        outstandingAmount: 265500,
        status: 'pending',
        notes: 'Confidential invoice for Luxe Living Hyderabad project',
      });

      console.log('✓ Seeded Sample Invoices with Data Isolation pairs');
    }

    // 7. Seed Vendor Bills
    const billCount = await VendorBill.countDocuments();
    if (billCount === 0) {
      await VendorBill.create({
        billNumber: 'BILL-00012',
        vendorId: contactVendor._id,
        vendorName: contactVendor.name,
        billDate: '2026-08-05',
        dueDate: '2026-09-05',
        items: [
          {
            productName: 'Raw Teak Wood Timber Logs (50 cu. ft.)',
            quantity: 50,
            unitPrice: 2000,
            taxRate: 18,
            taxAmount: 18000,
            total: 118000,
          },
        ],
        subtotal: 100000,
        taxTotal: 18000,
        grandTotal: 118000,
        paidAmount: 0,
        outstandingAmount: 118000,
        status: 'posted',
        notes: 'Delivery received at GIDC workshop warehouse',
      });
      console.log('✓ Seeded Vendor Bills');
    }

    // 8. Seed Payments
    const payCount = await Payment.countDocuments();
    if (payCount === 0) {
      await Payment.create({
        paymentNumber: 'PAY-00034',
        type: 'customer_payment',
        contactId: contactCustomer._id,
        contactName: contactCustomer.name,
        referenceNumber: 'INV-00046',
        paymentDate: '2026-07-15',
        method: 'bank',
        bankAccount: 'HDFC Bank Main Current Account',
        amount: 66080,
        referenceNo: 'TXN-984210',
        notes: 'Advance receipt for Armchairs order',
        status: 'posted',
      });
      console.log('✓ Seeded Payments');
    }

    // 9. Seed Analytics & Budgets if empty
    const anaCount = await AnalyticAccount.countDocuments();
    if (anaCount === 0) {
      const ana1 = await AnalyticAccount.create({
        code: 'ANA-WS-01',
        name: 'Surat Central Carpentry Workshop',
        type: 'expense',
        description: 'Manufacturing expenses and power utilities for Surat wood workshop',
        status: 'active',
      });

      await Budget.create({
        name: 'Q3 Workshop Tooling & Consumables Budget',
        analyticAccountId: ana1._id,
        analyticAccountName: ana1.name,
        period: '2026-Q3',
        planned: 150000,
        actual: 45000,
        remaining: 105000,
        utilization: 30,
        status: 'active',
      });
      console.log('✓ Seeded Analytic Accounts & Budgets');
    }

    console.log('\n======================================================');
    console.log('🎉 URBAN FURNITURE RBAC SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials Ready:');
    console.log('1. ADMIN:      admin@urbanfurniture.com      / Admin@123');
    console.log('2. ACCOUNTANT: accountant@urbanfurniture.com / Accountant@123');
    console.log('3. CONTACT:    customer@urbanfurniture.com   / Customer@123 (Royal Oak Interiors)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
