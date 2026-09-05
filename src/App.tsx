import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

import { ContactsList } from './pages/contacts/ContactsList';
import { ContactDetail } from './pages/contacts/ContactDetail';
import { ContactForm } from './pages/contacts/ContactForm';

import { ProductsList } from './pages/products/ProductsList';
import { ProductForm } from './pages/products/ProductForm';

import { ChartOfAccounts } from './pages/accounting/ChartOfAccounts';
import { Journals } from './pages/accounting/Journals';
import { JournalEntryDetail } from './pages/accounting/JournalEntryDetail';
import { JournalEntries } from './pages/accounting/JournalEntries';
import { AnalyticAccounts } from './pages/accounting/AnalyticAccounts';

import { SalesOrdersList } from './pages/sales/SalesOrdersList';
import { CreateSalesOrder } from './pages/sales/CreateSalesOrder';
import { SalesOrderDetail } from './pages/sales/SalesOrderDetail';

import { InvoicesList } from './pages/invoices/InvoicesList';
import { InvoiceDetail } from './pages/invoices/InvoiceDetail';

import { PurchaseOrdersList } from './pages/purchases/PurchaseOrdersList';
import { CreatePurchaseOrder } from './pages/purchases/CreatePurchaseOrder';
import { PurchaseOrderDetail } from './pages/purchases/PurchaseOrderDetail';

import { VendorBillsList } from './pages/bills/VendorBillsList';
import { VendorBillDetail } from './pages/bills/VendorBillDetail';

import { PaymentsList } from './pages/payments/PaymentsList';
import { RecordPayment } from './pages/payments/RecordPayment';

import { BudgetsList } from './pages/budgets/BudgetsList';

import { ProfitLossReport } from './pages/reports/ProfitLossReport';
import { BalanceSheetReport } from './pages/reports/BalanceSheetReport';
import { BudgetReport } from './pages/reports/BudgetReport';

import { Settings } from './pages/Settings';
import { UserManagement } from './pages/users/UserManagement';

import { MyInvoices } from './pages/portal/MyInvoices';
import { MyBills } from './pages/portal/MyBills';
import { MyPayments } from './pages/portal/MyPayments';
import { ContactProfile } from './pages/portal/ContactProfile';

const getUserRole = (user: any): 'ADMIN' | 'ACCOUNTANT' | 'CONTACT' => {
  if (!user) return 'ACCOUNTANT';
  const r = String(user.role || '').toUpperCase();
  const e = String(user.email || '').toLowerCase();
  if (r === 'CONTACT' || e.includes('customer')) return 'CONTACT';
  if (r === 'ADMIN' || e.includes('admin')) return 'ADMIN';
  return 'ACCOUNTANT';
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'ACCOUNTANT' | 'CONTACT')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-emerald-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase">Loading Urban Furniture...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getUserRole(user);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'CONTACT') {
      return <Navigate to="/my-invoices" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DefaultRedirect: React.FC = () => {
  const { user } = useAuth();
  const role = getUserRole(user);
  if (role === 'CONTACT') {
    return <Navigate to="/my-invoices" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DefaultRedirect />} />

                  {/* Dashboard - ADMIN & ACCOUNTANT ONLY */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* User Management - ADMIN ONLY */}
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />

                  {/* Contact Portal Views - Strictly CONTACT Only */}
                  <Route
                    path="my-invoices"
                    element={
                      <ProtectedRoute allowedRoles={['CONTACT']}>
                        <MyInvoices />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="my-bills"
                    element={
                      <ProtectedRoute allowedRoles={['CONTACT']}>
                        <MyBills />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="my-payments"
                    element={
                      <ProtectedRoute allowedRoles={['CONTACT']}>
                        <MyPayments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <ProtectedRoute allowedRoles={['CONTACT', 'ADMIN', 'ACCOUNTANT']}>
                        <ContactProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Master Data - Contacts */}
                  <Route
                    path="contacts"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ContactsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="contacts/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ContactForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="contacts/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ContactForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Products */}
                  <Route
                    path="products"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ProductsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="products/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ProductForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="products/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ProductForm />
                      </ProtectedRoute>
                    }
                  />

                  {/* Chart of Accounts & Journals */}
                  <Route
                    path="accounts"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ChartOfAccounts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="accounts/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ChartOfAccounts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="accounts/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ChartOfAccounts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="journals"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <Journals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="journals/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <Journals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="journals/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <Journals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="journal-entries"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <JournalEntries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="journal-entries/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <JournalEntries />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="journal-entries/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <JournalEntries />
                      </ProtectedRoute>
                    }
                  />

                  {/* Sales Orders & Customer Invoices */}
                  <Route
                    path="sales-orders"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <SalesOrdersList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="sales-orders/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <CreateSalesOrder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="sales-orders/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <SalesOrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="invoices"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <InvoicesList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="invoices/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <CreateSalesOrder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="invoices/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <InvoiceDetail />
                      </ProtectedRoute>
                    }
                  />

                  {/* Purchase Orders & Vendor Bills */}
                  <Route
                    path="purchase-orders"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <PurchaseOrdersList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="purchase-orders/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <CreatePurchaseOrder />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="purchase-orders/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <PurchaseOrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="vendor-bills"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <VendorBillsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="vendor-bills/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <VendorBillDetail />
                      </ProtectedRoute>
                    }
                  />

                  {/* Payments Register */}
                  <Route
                    path="payments"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <PaymentsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="payments/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <RecordPayment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="payments/:id"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <PaymentsList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Analytics & Budgets */}
                  <Route
                    path="analytic-accounts"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <AnalyticAccounts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="budgets"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <BudgetsList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="budgets/new"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <BudgetsList />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reports */}
                  <Route
                    path="reports/profit-loss"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <ProfitLossReport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reports/balance-sheet"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <BalanceSheetReport />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reports/budget"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <BudgetReport />
                      </ProtectedRoute>
                    }
                  />

                  {/* Settings */}
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTANT']}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<DefaultRedirect />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
