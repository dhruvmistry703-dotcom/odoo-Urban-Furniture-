import 'dotenv/config';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 RUNNING ANALYTIC ACCOUNT & BUDGET LIFECYCLE TESTS');
  console.log('======================================================\n');

  let server;
  let baseUrl;

  try {
    await connectDB();

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
        console.error(`  ✗ FAIL: ${testName} - status: ${extra?.status}, data: ${JSON.stringify(extra?.data)}`);
      }
    };

    const fetchApi = async (path, options = {}) => {
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, data };
    };

    // 1. Authenticate Admin
    console.log('--- Suite 1: Authentication & Setup ---');
    const adminLogin = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@urbanfurniture.com', password: 'Admin@123' }),
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login succeeds and returns token');
    const adminToken = adminLogin.data.token;
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // 2. Analytic Accounts CRUD & Creation
    console.log('\n--- Suite 2: Analytic Accounts CRUD & Creation ---');
    const timestamp = Date.now();

    // Create Income Analytic Account
    const createIncome = await fetchApi('/analytics', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Custom Wooden Craft Projects ${timestamp}`,
        type: 'Income',
        code: `ANA-INC-${timestamp.toString().slice(-4)}`,
        description: 'Revenue from bespoke dining tables and custom wood carvings',
      }),
    });
    assert(createIncome.status === 201 && createIncome.data.analyticAccount?.type === 'Income', 'Create Income Analytic Account (201 Created)', createIncome);
    const analyticIncomeId = createIncome.data.analyticAccount?._id;

    // Create Expense Analytic Account
    const createExpense = await fetchApi('/analytics', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Workshop Machinery Maintenance & Power ${timestamp}`,
        type: 'Expenses',
        code: `ANA-EXP-${timestamp.toString().slice(-4)}`,
        description: 'Maintenance, power, and tooling replacement for workshop CNC routers',
      }),
    });
    assert(createExpense.status === 201 && createExpense.data.analyticAccount?.type === 'Expenses', 'Create Expense Analytic Account (201 Created)', createExpense);
    const analyticExpenseId = createExpense.data.analyticAccount?._id;

    // Fetch list
    const listRes = await fetchApi('/analytics', { headers: authHeaders });
    assert(listRes.status === 200 && listRes.data.analyticAccounts.length >= 2, 'Get Analytic Accounts List (200 OK)');

    // Fetch single
    const getSingleRes = await fetchApi(`/analytics/${analyticIncomeId}`, { headers: authHeaders });
    assert(getSingleRes.status === 200 && getSingleRes.data.analyticAccount?._id === analyticIncomeId, 'Get Analytic Account By ID (200 OK)');

    // Update
    const updateRes = await fetchApi(`/analytics/${analyticIncomeId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ description: 'Updated description for wooden craft projects' }),
    });
    assert(updateRes.status === 200 && updateRes.data.analyticAccount?.description === 'Updated description for wooden craft projects', 'Update Analytic Account (200 OK)');

    // 3. Budget Validations
    console.log('\n--- Suite 3: Budget Validation Rules ---');
    const invalidDateBudget = await fetchApi('/budgets', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Invalid Date Range Budget',
        analyticAccountId: analyticExpenseId,
        startDate: '2026-12-31',
        endDate: '2026-01-01',
        planned: 50000,
      }),
    });
    assert(invalidDateBudget.status === 400, 'Rejects Budget with End Date earlier than Start Date (400 Bad Request)');

    const invalidAmountBudget = await fetchApi('/budgets', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Invalid Amount Budget',
        analyticAccountId: analyticExpenseId,
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        planned: -5000,
      }),
    });
    assert(invalidAmountBudget.status === 400, 'Rejects Budget with planned amount <= 0 (400 Bad Request)');

    // 4. Budget Creation & Lifecycle Transitions
    console.log('\n--- Suite 4: Budget Lifecycle Transitions (NEW -> CONFIRMED -> REVISED -> CANCELLED) ---');

    // Create Budget in NEW state
    const createBudgetRes = await fetchApi('/budgets', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Q1 CNC Router Tooling & Workshop Power ${timestamp}`,
        analyticAccountId: analyticExpenseId,
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        planned: 150000,
        notes: 'Initial planned budget for workshop tooling',
      }),
    });
    assert(
      createBudgetRes.status === 201 &&
      createBudgetRes.data.budget?.status === 'NEW' &&
      createBudgetRes.data.budget?.planned === 150000,
      'Budget created in NEW state (201 Created)'
    );
    const testBudgetId = createBudgetRes.data.budget?._id;

    // Edit budget while in NEW state
    const editNewRes = await fetchApi(`/budgets/${testBudgetId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        planned: 160000,
        notes: 'Adjusted initial plan before confirmation',
      }),
    });
    assert(
      editNewRes.status === 200 &&
      editNewRes.data.budget?.planned === 160000 &&
      editNewRes.data.budget?.originalPlanned === 160000,
      'Edit budget allowed when in NEW state (200 OK)'
    );

    // Transition: NEW -> CONFIRMED
    const confirmRes = await fetchApi(`/budgets/${testBudgetId}/confirm`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(confirmRes.status === 200 && confirmRes.data.budget?.status === 'CONFIRMED', 'Transition NEW -> CONFIRMED (200 OK)');

    // Transition: CONFIRMED -> REVISED (Spawns new revised budget and marks previous as REVISED)
    const reviseRes1 = await fetchApi(`/budgets/${testBudgetId}/revise`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        planned: 180000,
        notes: 'Increased scope due to extra carpentry shifts and cutter wear',
      }),
    });
    assert(
      reviseRes1.status === 200 &&
      reviseRes1.data.previousBudget?.status === 'REVISED' &&
      reviseRes1.data.budget?.planned === 180000 &&
      reviseRes1.data.budget?.originalBudgetId === testBudgetId,
      'Transition CONFIRMED -> REVISED with new revised budget and linked baseline (200 OK)'
    );

    const revisedNewBudgetId = reviseRes1.data.budget?._id;

    // Second Revision from newly confirmed budget
    const reviseRes2 = await fetchApi(`/budgets/${revisedNewBudgetId}/revise`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        planned: 195000,
        notes: 'Additional safety gear and emergency lubricant supply',
      }),
    });
    assert(
      reviseRes2.status === 200 &&
      reviseRes2.data.previousBudget?.status === 'REVISED' &&
      reviseRes2.data.budget?.planned === 195000,
      'Second Revision creates secondary revised budget with full linkage (200 OK)'
    );

    // Transition: REVISED -> CANCELLED
    const cancelRes = await fetchApi(`/budgets/${testBudgetId}/cancel`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    assert(cancelRes.status === 200 && cancelRes.data.budget?.status === 'CANCELLED', 'Transition to CANCELLED state (200 OK)');

    // 5. Budget List & Detail Fetch
    console.log('\n--- Suite 5: Budget Retrieval & Verification ---');
    const getBudgetsRes = await fetchApi('/budgets', { headers: authHeaders });
    assert(getBudgetsRes.status === 200 && getBudgetsRes.data.budgets.length >= 1, 'Get all budgets with populated analytics (200 OK)');

    const getBudgetDetailRes = await fetchApi(`/budgets/${testBudgetId}`, { headers: authHeaders });
    assert(
      getBudgetDetailRes.status === 200 &&
      getBudgetDetailRes.data.budget?._id === testBudgetId &&
      getBudgetDetailRes.data.budget?.status === 'CANCELLED' &&
      getBudgetDetailRes.data.budget?.revisions?.length >= 1,
      'Get Budget by ID returns full data with populated references and revisions (200 OK)'
    );

    // 6. Analytic Account Budget Usage Relationship
    console.log('\n--- Suite 6: Analytic Account Associated Budgets ---');
    const getAnalyticBudgetsRes = await fetchApi(`/analytics/${analyticExpenseId}/budgets`, { headers: authHeaders });
    assert(
      getAnalyticBudgetsRes.status === 200 &&
      Array.isArray(getAnalyticBudgetsRes.data.budgets) &&
      getAnalyticBudgetsRes.data.budgets.some((b) => b._id === testBudgetId),
      'GET /api/analytics/:id/budgets returns all budgets linked to the Analytic Account (200 OK)'
    );

    const getEmptyAnalyticBudgetsRes = await fetchApi(`/analytics/${analyticIncomeId}/budgets`, { headers: authHeaders });
    assert(
      getEmptyAnalyticBudgetsRes.status === 200 &&
      Array.isArray(getEmptyAnalyticBudgetsRes.data.budgets) &&
      !getEmptyAnalyticBudgetsRes.data.budgets.some((b) => b._id === testBudgetId),
      'GET /api/analytics/:id/budgets excludes unrelated budgets (Data Isolation / Relationship verification)'
    );

    console.log('\n======================================================');
    console.log(`🎯 ANALYTIC & BUDGET TESTS SUMMARY: ${passedTests} / ${totalTests} PASSED`);
    console.log('======================================================\n');

    server.close();
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (err) {
    console.error('Test error:', err);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
