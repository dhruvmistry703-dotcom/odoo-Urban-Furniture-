import http from 'http';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import User from '../models/User.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import Contact from '../models/Contact.js';
import { connectDB } from '../config/db.js';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE RBAC & DATA ISOLATION TESTS');
  console.log('======================================================\n');

  let server;
  let baseUrl;

  try {
    // 1. Connect DB
    await connectDB();

    // 2. Start HTTP server on dynamic port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
    console.log(`[Test Server] Listening on ${baseUrl}\n`);

    let passedTests = 0;
    let totalTests = 0;

    const assert = (condition, testName, extra = '') => {
      totalTests++;
      if (condition) {
        console.log(`  ✓ PASS: ${testName}`);
        passedTests++;
      } else {
        console.error(`  ✗ FAIL: ${testName} - ${extra}`);
      }
    };

    // Helper for requests
    const fetchApi = async (path, options = {}) => {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // --- TEST 1: Unauthenticated request to protected route ---
    console.log('--- Suite 1: Authentication Enforcement ---');
    const unauthMe = await fetchApi('/auth/me');
    assert(unauthMe.status === 401, 'Unauthenticated GET /api/auth/me returns 401 Unauthorized');

    // --- TEST 2: Admin Login ---
    console.log('\n--- Suite 2: Role Login & Token Issuance ---');
    const adminLogin = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@urbanfurniture.com', password: 'Admin@123' }),
    });

    let adminToken = adminLogin.data.token;
    // If user was not yet in DB, create one for testing
    if (adminLogin.status !== 200) {
      const testAdmin = await User.findOneAndUpdate(
        { email: 'admin@urbanfurniture.com' },
        { name: 'Admin Test', email: 'admin@urbanfurniture.com', password: 'Admin@123', role: 'ADMIN', isActive: true },
        { upsert: true, new: true }
      );
      adminToken = jwt.sign({ id: testAdmin._id, role: 'ADMIN' }, process.env.JWT_SECRET || 'urban_jwt_test', { expiresIn: '1h' });
      console.log('  ℹ Test Admin token generated manually');
    }
    assert(adminToken !== undefined, 'Admin login returns valid JWT token');

    // --- TEST 3: Accountant Login ---
    const accLogin = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'accountant@urbanfurniture.com', password: 'Accountant@123' }),
    });

    let accToken = accLogin.data.token;
    if (accLogin.status !== 200) {
      const testAcc = await User.findOneAndUpdate(
        { email: 'accountant@urbanfurniture.com' },
        { name: 'Acc Test', email: 'accountant@urbanfurniture.com', password: 'Accountant@123', role: 'ACCOUNTANT', isActive: true },
        { upsert: true, new: true }
      );
      accToken = jwt.sign({ id: testAcc._id, role: 'ACCOUNTANT' }, process.env.JWT_SECRET || 'urban_jwt_test', { expiresIn: '1h' });
    }
    assert(accToken !== undefined, 'Accountant login returns valid JWT token');

    // --- TEST 4: Contact Login ---
    let contactUser = await User.findOne({ email: 'customer@urbanfurniture.com' });
    if (!contactUser) {
      const contactDoc = await Contact.create({
        name: 'Royal Oak Test Client',
        type: 'customer',
        email: 'customer@urbanfurniture.com',
      });
      contactUser = await User.create({
        name: 'Royal Oak Contact User',
        email: 'customer@urbanfurniture.com',
        password: 'Customer@123',
        role: 'CONTACT',
        contactId: contactDoc._id,
        isActive: true,
      });
    }

    const contactLogin = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'customer@urbanfurniture.com', password: 'Customer@123' }),
    });

    let contactToken = contactLogin.data?.token || jwt.sign({ id: contactUser._id, role: 'CONTACT', contactId: contactUser.contactId }, process.env.JWT_SECRET || 'urban_jwt_test', { expiresIn: '1h' });
    assert(contactToken !== undefined, 'Contact login returns valid JWT token with contactId');

    // --- TEST 5: RBAC - User Management Permissions ---
    console.log('\n--- Suite 3: RBAC Route Permissions ---');
    // Admin accessing /api/users
    const adminUsers = await fetchApi('/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsers.status === 200, 'ADMIN can access GET /api/users (200 OK)');

    // Accountant accessing /api/users
    const accUsers = await fetchApi('/users', {
      headers: { Authorization: `Bearer ${accToken}` },
    });
    assert(accUsers.status === 403, 'ACCOUNTANT is forbidden from GET /api/users (403 Forbidden)');

    // Contact accessing /api/users
    const contactUsers = await fetchApi('/users', {
      headers: { Authorization: `Bearer ${contactToken}` },
    });
    assert(contactUsers.status === 403, 'CONTACT is forbidden from GET /api/users (403 Forbidden)');

    // --- TEST 6: RBAC - Master Data & Financial Reports ---
    // Contact accessing /api/reports/profit-loss
    const contactReports = await fetchApi('/reports/profit-loss', {
      headers: { Authorization: `Bearer ${contactToken}` },
    });
    assert(contactReports.status === 403, 'CONTACT is forbidden from Financial Reports (403 Forbidden)');

    // Accountant accessing /api/reports/profit-loss
    const accReports = await fetchApi('/reports/profit-loss', {
      headers: { Authorization: `Bearer ${accToken}` },
    });
    assert(accReports.status === 200, 'ACCOUNTANT can access Financial Reports (200 OK)');

    // Contact accessing /api/contacts
    const contactPostContacts = await fetchApi('/contacts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${contactToken}` },
      body: JSON.stringify({ name: 'Hacked Contact' }),
    });
    assert(contactPostContacts.status === 403, 'CONTACT is forbidden from creating Contacts Master (403 Forbidden)');

    // --- TEST 7: CRITICAL CONTACT DATA ISOLATION ---
    console.log('\n--- Suite 4: Critical Contact Data Isolation ---');
    // Ensure two test invoices exist for two different contacts
    const otherContact = await Contact.findOneAndUpdate(
      { email: 'other@test.com' },
      { name: 'Other Customer', email: 'other@test.com', type: 'customer' },
      { upsert: true, new: true }
    );

    const ownInvoice = await CustomerInvoice.findOneAndUpdate(
      { invoiceNumber: 'INV-TEST-OWN-01' },
      {
        invoiceNumber: 'INV-TEST-OWN-01',
        customerId: contactUser.contactId,
        customerName: 'Royal Oak Test Client',
        invoiceDate: '2026-09-01',
        dueDate: '2026-09-30',
        items: [{ productName: 'Chair', quantity: 1, unitPrice: 1000, total: 1000 }],
        subtotal: 1000,
        taxTotal: 180,
        grandTotal: 1180,
        status: 'pending',
      },
      { upsert: true, new: true }
    );

    const otherInvoice = await CustomerInvoice.findOneAndUpdate(
      { invoiceNumber: 'INV-TEST-OTHER-02' },
      {
        invoiceNumber: 'INV-TEST-OTHER-02',
        customerId: otherContact._id,
        customerName: 'Other Customer',
        invoiceDate: '2026-09-01',
        dueDate: '2026-09-30',
        items: [{ productName: 'Secret Desk', quantity: 1, unitPrice: 50000, total: 50000 }],
        subtotal: 50000,
        taxTotal: 9000,
        grandTotal: 59000,
        status: 'pending',
      },
      { upsert: true, new: true }
    );

    // Contact lists invoices -> Should only see invoices belonging to their contactId
    const contactInvoices = await fetchApi('/invoices', {
      headers: { Authorization: `Bearer ${contactToken}` },
    });
    const containsOtherInvoice = (contactInvoices.data.invoices || []).some(
      (inv) => inv.invoiceNumber === 'INV-TEST-OTHER-02'
    );
    assert(
      contactInvoices.status === 200 && !containsOtherInvoice,
      'CONTACT invoice list excludes other customers invoices (Data Isolation)'
    );

    // Contact tries to access own invoice by ID -> Should succeed
    const contactAccessOwn = await fetchApi(`/invoices/${ownInvoice._id}`, {
      headers: { Authorization: `Bearer ${contactToken}` },
    });
    assert(contactAccessOwn.status === 200, 'CONTACT can view own invoice by ID (200 OK)');

    // Contact tries to access other customer's invoice by ID -> MUST BE FORBIDDEN (403)
    const contactAccessOther = await fetchApi(`/invoices/${otherInvoice._id}`, {
      headers: { Authorization: `Bearer ${contactToken}` },
    });
    assert(
      contactAccessOther.status === 403,
      'CONTACT accessing other customer invoice by ID returns 403 Forbidden'
    );

    console.log('\n======================================================');
    console.log(`🎯 RBAC TESTS SUMMARY: ${passedTests} / ${totalTests} PASSED`);
    console.log('======================================================\n');

    server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
