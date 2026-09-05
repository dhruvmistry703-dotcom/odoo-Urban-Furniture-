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

import { ProductsList } from './pages/products/ProductsList';

import { ChartOfAccounts } from './pages/accounting/ChartOfAccounts';
import { Journals } from './pages/accounting/Journals';
import { JournalEntryDetail } from './pages/accounting/JournalEntryDetail';
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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
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
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />

                  {/* Contacts */}
                  <Route path="contacts" element={<ContactsList />} />
                  <Route path="contacts/new" element={<ContactsList />} />
                  <Route path="contacts/:id" element={<ContactDetail />} />

                  {/* Products */}
                  <Route path="products" element={<ProductsList />} />
                  <Route path="products/new" element={<ProductsList />} />

                  {/* Chart of Accounts & Journals */}
                  <Route path="accounts" element={<ChartOfAccounts />} />
                  <Route path="accounts/new" element={<ChartOfAccounts />} />
                  <Route path="journals" element={<Journals />} />
                  <Route path="journals/:id" element={<JournalEntryDetail />} />

                  {/* Sales Orders & Customer Invoices */}
                  <Route path="sales-orders" element={<SalesOrdersList />} />
                  <Route path="sales-orders/new" element={<CreateSalesOrder />} />
                  <Route path="sales-orders/:id" element={<SalesOrderDetail />} />
                  <Route path="invoices" element={<InvoicesList />} />
                  <Route path="invoices/new" element={<CreateSalesOrder />} />
                  <Route path="invoices/:id" element={<InvoiceDetail />} />

                  {/* Purchase Orders & Vendor Bills */}
                  <Route path="purchase-orders" element={<PurchaseOrdersList />} />
                  <Route path="purchase-orders/new" element={<CreatePurchaseOrder />} />
                  <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
                  <Route path="vendor-bills" element={<VendorBillsList />} />
                  <Route path="vendor-bills/:id" element={<VendorBillDetail />} />

                  {/* Payments Register */}
                  <Route path="payments" element={<PaymentsList />} />
                  <Route path="payments/new" element={<RecordPayment />} />
                  <Route path="payments/:id" element={<PaymentsList />} />

                  {/* Analytics & Budgets */}
                  <Route path="analytic-accounts" element={<AnalyticAccounts />} />
                  <Route path="budgets" element={<BudgetsList />} />
                  <Route path="budgets/new" element={<BudgetsList />} />

                  {/* Reports */}
                  <Route path="reports/profit-loss" element={<ProfitLossReport />} />
                  <Route path="reports/balance-sheet" element={<BalanceSheetReport />} />
                  <Route path="reports/budget" element={<BudgetReport />} />

                  {/* Settings */}
                  <Route path="settings" element={<Settings />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
