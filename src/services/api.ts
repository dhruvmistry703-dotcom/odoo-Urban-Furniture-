const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface ApiError {
  message: string;
  status?: number;
}

export const getToken = (): string | null => {
  return localStorage.getItem('urban_furniture_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('urban_furniture_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('urban_furniture_token');
  localStorage.removeItem('urban_furniture_user');
};

export const request = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      if (!endpoint.includes('/auth/login')) {
        removeToken();
      }
    }
    const error: ApiError = new Error(data.message || `Request failed with status ${response.status}`) as any;
    error.status = response.status;
    throw error;
  }

  return data as T;
};

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  register: (userData: any) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),

  // User Management (Admin only)
  getUsers: () => request('/users'),
  getUserById: (id: string) => request(`/users/${id}`),
  createUser: (userData: any) =>
    request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id: string, userData: any) =>
    request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  toggleUserStatus: (id: string) =>
    request(`/users/${id}/status`, { method: 'PATCH' }),

  // Contacts
  getContacts: (params?: { status?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/contacts${query ? `?${query}` : ''}`);
  },
  getContactById: (id: string) => request(`/contacts/${id}`),
  createContact: (contactData: any) =>
    request('/contacts', { method: 'POST', body: JSON.stringify(contactData) }),
  updateContact: (id: string, updates: any) =>
    request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  archiveContact: (id: string) =>
    request(`/contacts/${id}/archive`, { method: 'PATCH' }),

  // Invoices (Data Isolated for Contact role)
  getInvoices: (params?: { customerId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/invoices${query ? `?${query}` : ''}`);
  },
  getInvoiceById: (id: string) => request(`/invoices/${id}`),
  createInvoice: (invoiceData: any) =>
    request('/invoices', { method: 'POST', body: JSON.stringify(invoiceData) }),
  updateInvoice: (id: string, updates: any) =>
    request(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  // Vendor Bills (Data Isolated for Contact role)
  getVendorBills: (params?: { vendorId?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/vendor-bills${query ? `?${query}` : ''}`);
  },
  getVendorBillById: (id: string) => request(`/vendor-bills/${id}`),
  createVendorBill: (billData: any) =>
    request('/vendor-bills', { method: 'POST', body: JSON.stringify(billData) }),

  // Payments (Data Isolated for Contact role)
  getPayments: (params?: { contactId?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/payments${query ? `?${query}` : ''}`);
  },
  getPaymentById: (id: string) => request(`/payments/${id}`),
  createPayment: (paymentData: any) =>
    request('/payments', { method: 'POST', body: JSON.stringify(paymentData) }),

  // Products
  getProducts: () => request('/products'),
  getCategories: () => request('/products/categories'),
  createProduct: (data: any) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, updates: any) =>
    request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  archiveProduct: (id: string) => request(`/products/${id}/archive`, { method: 'PATCH' }),

  // Accounts
  getAccounts: () => request('/accounts'),
  createAccount: (data: any) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, updates: any) =>
    request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  archiveAccount: (id: string) => request(`/accounts/${id}/archive`, { method: 'PATCH' }),

  // Journals & Journal Entries
  getJournals: () => request('/journals'),
  createJournal: (data: any) => request('/journals', { method: 'POST', body: JSON.stringify(data) }),
  updateJournal: (id: string, updates: any) =>
    request(`/journals/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  archiveJournal: (id: string) => request(`/journals/${id}/archive`, { method: 'PATCH' }),
  getJournalEntries: () => request('/journal-entries'),
  createJournalEntry: (data: any) =>
    request('/journal-entries', { method: 'POST', body: JSON.stringify(data) }),

  // Sales Orders & Purchases
  getSalesOrders: () => request('/sales'),
  createSalesOrder: (data: any) => request('/sales', { method: 'POST', body: JSON.stringify(data) }),
  getPurchaseOrders: () => request('/purchases'),
  createPurchaseOrder: (data: any) => request('/purchases', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics & Budgets
  getAnalytics: (params?: { status?: string; type?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/analytics${query ? `?${query}` : ''}`);
  },
  getAnalyticById: (id: string) => request(`/analytics/${id}`),
  getAnalyticBudgets: (id: string) => request(`/analytics/${id}/budgets`),
  createAnalytics: (data: any) => request('/analytics', { method: 'POST', body: JSON.stringify(data) }),
  updateAnalytic: (id: string, updates: any) =>
    request(`/analytics/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  archiveAnalytic: (id: string) => request(`/analytics/${id}/archive`, { method: 'PATCH' }),
  deleteAnalytic: (id: string) => request(`/analytics/${id}`, { method: 'DELETE' }),

  getBudgets: (params?: { status?: string; analyticAccountId?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/budgets${query ? `?${query}` : ''}`);
  },
  getBudgetById: (id: string) => request(`/budgets/${id}`),
  getBudgetTransactions: (id: string) => request(`/budgets/${id}/transactions`),
  createBudget: (data: any) => request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  updateBudget: (id: string, updates: any) =>
    request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  confirmBudget: (id: string) => request(`/budgets/${id}/confirm`, { method: 'PATCH' }),
  reviseBudget: (id: string, data: { planned: number; notes?: string; newName?: string }) =>
    request(`/budgets/${id}/revise`, { method: 'POST', body: JSON.stringify(data) }),
  cancelBudget: (id: string) => request(`/budgets/${id}/cancel`, { method: 'PATCH' }),
  archiveBudget: (id: string) => request(`/budgets/${id}/archive`, { method: 'PATCH' }),
  deleteBudget: (id: string) => request(`/budgets/${id}`, { method: 'DELETE' }),

  // Reports
  getProfitLoss: (params?: { from?: string; to?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request(`/reports/profit-loss${query ? `?${query}` : ''}`);
  },
  getBalanceSheet: () => request('/reports/balance-sheet'),
  getBudgetReport: () => request('/reports/budget'),
  getLedger: () => request('/reports/ledger'),
};
