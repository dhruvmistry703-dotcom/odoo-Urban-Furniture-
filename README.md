
# 🪑 Urban Furniture ERP

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Fast_Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens)
![Recharts](https://img.shields.io/badge/Recharts-Analytics-8884D8?style=for-the-badge)
![License](https://img.shields.io/badge/License-Proprietary-blue?style=for-the-badge)

### Full-Stack Furniture Business ERP & Accounting System

Urban Furniture ERP is a full-stack enterprise resource planning and accounting system designed for furniture manufacturing, carpentry, and furniture businesses.

The system brings business operations and financial management into a centralized platform for managing customers, vendors, products, sales orders, purchases, invoices, vendor bills, payments, accounting, budgets, analytics, users, and financial reports.



## 📌 Overview

Furniture and carpentry businesses require coordination between customers, vendors, products, sales, purchases, payments, and accounting.

Urban Furniture ERP provides a centralized application to manage these operations and provides financial visibility through accounting and reporting modules.

### Workflow

```text
Customer / Vendor
       ↓
Sales / Purchase
       ↓
Invoice / Vendor Bill
       ↓
Payment
       ↓
Accounting
       ↓
Financial Reports
       ↓
Business Analysis
````

---

## ✨ Features

* 📊 Business dashboard and analytics
* 👥 Customer and vendor management
* 🪑 Product and inventory management
* 🧾 Sales order management
* 💰 Customer invoice management
* 🛒 Purchase order management
* 📄 Vendor bill management
* 💳 Payment management
* 📚 Chart of accounts
* 📖 Accounting journals and journal entries
* 📈 Analytic accounts
* 💼 Budget management
* 📊 Profit and Loss reporting
* 🏦 Balance Sheet reporting
* 📉 Budget vs Actual reporting
* 📒 Ledger reporting
* 👤 Role-based user management
* 🌐 Customer portal
* ⚙️ Application settings

---

## 🛠️ Tech Stack

| Technology    | Purpose                       |
| ------------- | ----------------------------- |
| React 19      | Frontend UI                   |
| TypeScript    | Type-safe development         |
| Vite          | Frontend build tool           |
| React Router  | Routing and protected routes  |
| Tailwind CSS  | UI styling                    |
| Recharts      | Charts and analytics          |
| Lucide React  | Icons                         |
| Node.js       | Backend runtime               |
| Express       | REST API                      |
| MongoDB Atlas | Persistent database           |
| Mongoose      | MongoDB ODM                   |
| JWT           | Authentication                |
| bcryptjs      | Password hashing              |
| CORS          | Cross-origin request handling |
| cookie-parser | Cookie handling               |

---

## 🏗️ Application Architecture

Urban Furniture ERP uses a full-stack client-server architecture.

```text
┌─────────────────────────────────┐
│          React Frontend         │
│                                 │
│ React + TypeScript + Vite       │
│ React Router + Tailwind CSS     │
└────────────────┬────────────────┘
                 │
                 │ REST API
                 ▼
┌─────────────────────────────────┐
│         Express Backend         │
│                                 │
│ Routes → Middleware             │
│ Controllers → Business Logic    │
└────────────────┬────────────────┘
                 │
                 │ Mongoose
                 ▼
┌─────────────────────────────────┐
│          MongoDB Atlas          │
│                                 │
│ Users • Invoices • Bills        │
│ Payments • Budgets • Accounting │
└─────────────────────────────────┘
```

---

## 🔄 Business Workflow

### Sales Workflow

```text
Customer
   ↓
Sales Order
   ↓
Customer Invoice
   ↓
Payment
   ↓
Accounting
```

### Purchase Workflow

```text
Vendor
   ↓
Purchase Order
   ↓
Vendor Bill
   ↓
Payment
   ↓
Accounting
```

### Financial Workflow

```text
Invoices + Vendor Bills + Payments
                  ↓
             Accounting
                  ↓
        Journals / Ledger
                  ↓
          Financial Reports
```

---

## 👥 User Roles

Urban Furniture ERP provides role-based access control.

### ADMIN

Provides full system access.

* Manage users
* Manage system settings
* Access business operations
* Access accounting
* Access financial reports
* Manage administrative functionality

### ACCOUNTANT

Provides access to accounting and permitted business operations.

* Manage invoices
* Manage vendor bills
* Manage payments
* Access accounting
* Manage budgets
* View financial reports

Accountants cannot manage application users.

### CONTACT

Provides restricted external customer access through the customer portal.

* View own invoices
* View own bills
* View own payments
* Manage/view own profile

Contacts cannot access internal accounting or administrative screens.

---

## 💼 Main Modules

### 📊 Dashboard

Provides an overview of business performance, financial information, and analytics.

### 👥 Contacts

Manages customers, vendors, and other business contacts.

### 🪑 Products & Inventory

Manages furniture products and inventory-related information.

### 🧾 Sales Orders

Handles customer sales orders and related business operations.

### 💰 Customer Invoices

Manages invoices issued to customers and their financial information.

### 🛒 Purchase Orders

Manages purchasing activities and vendor procurement.

### 📄 Vendor Bills

Manages bills received from vendors and related payable information.

### 💳 Payments

Manages payment records associated with customers, vendors, and financial transactions.

### 📚 Chart of Accounts

Provides the accounting structure used for financial transactions and reporting.

### 📖 Journals & Journal Entries

Manages accounting journals and journal entries used for recording financial activity.

### 📈 Analytic Accounts

Provides analytical accounting structures for tracking and analyzing business activity.

### 💼 Budgets

Manages financial budgets and budget-related information.

### 📊 Financial Reports

Provides:

* Profit and Loss
* Balance Sheet
* Budget vs Actual
* Ledger

### 🌐 Customer Portal

Provides customers and external contacts with controlled access to their own financial information.

### ⚙️ Settings

Provides system and application configuration for authorized users.

---

## 📊 Financial Reporting

Urban Furniture ERP provides backend-powered financial reports.

### Profit & Loss

The Profit and Loss report uses:

* Customer invoices
* Vendor bills
* Income accounts
* Expense accounts

Date filters can be applied using:

```text
from
to
```

### Balance Sheet

The Balance Sheet uses financial information related to:

* Assets
* Liabilities
* Capital
* Customer invoices
* Vendor bills

### Budget vs Actual

The Budget report uses:

* Budget data
* Analytic account data
* Available financial activity

### Ledger

The Ledger report provides accounting transaction information derived from backend financial data.

Financial reports require authentication and are available to authorized `ADMIN` and `ACCOUNTANT` users.

---

## 🔐 Authentication

Authentication is implemented using JWT and MongoDB-backed user accounts.

```text
Login
  ↓
Express Authentication API
  ↓
User Verification
  ↓
JWT Authentication
  ↓
Protected Routes
  ↓
Role Authorization
  ↓
Application Access
```

Passwords are securely hashed using `bcryptjs`.

The application uses authentication and role-based authorization to restrict access to protected functionality.

---

## 🗄️ Database

Urban Furniture ERP uses **MongoDB Atlas** as its persistent backend database.

Mongoose is used as the object data modeling layer.

Backend-managed data includes areas such as:

```text
Users
Invoices
Vendor Bills
Payments
Accounting Data
Budgets
Analytic Accounts
Financial Reporting Data
```

---

## 🔄 Hybrid Data Architecture

The current application uses a hybrid data architecture.

### MongoDB / Backend-Connected

The following functionality is connected to the Express backend and MongoDB:

* Authentication
* User sessions
* Customer invoices
* Vendor bills
* Payments
* Financial reports
* Accounting-related financial data
* Budgets
* Analytic accounts

### Frontend / Local Data

Some older operational modules continue to use `DataContext`, frontend data, and browser `localStorage`.

These include parts of:

* Contacts
* Products
* Sales orders
* Purchase orders
* Legacy operational workflows

Therefore, the application is currently **not entirely MongoDB-backed**. Backend integration can be progressively extended to the remaining operational modules.

---

## 📂 Project Structure

```text
Urban-Furniture-ERP/
│
├── src/                           # React frontend
│   │
│   ├── components/               # Reusable UI components
│   │
│   ├── context/
│   │   ├── AuthContext.tsx        # Authentication & user session
│   │   └── DataContext.tsx        # Frontend data & business actions
│   │
│   ├── data/
│   │   └── mockData.ts            # Legacy/demo frontend data
│   │
│   ├── pages/                     # Application pages
│   │
│   ├── services/
│   │   └── api.ts                 # Backend API client
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript models
│   │
│   ├── App.tsx                    # Routes & protected routes
│   └── ...
│
├── backend/                       # Express backend
│   │
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   │
│   ├── controllers/               # Backend business logic
│   │
│   ├── middleware/                # Authentication & authorization
│   │
│   ├── models/                    # Mongoose schemas
│   │
│   ├── routes/                    # REST API routes
│   │
│   ├── seed/
│   │   └── seedUsers.js           # Database seed utility
│   │
│   ├── app.js                     # Express application
│   └── server.js                  # Backend startup
│
├── package.json
├── .env
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the project directory:

```bash
cd Urban-Furniture-ERP
```

---

### 2. Install Frontend Dependencies

```bash
npm install
```

---

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

---

### 4. Configure Environment Variables

Create a `.env` file containing the required environment configuration.

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
VITE_API_URL=http://localhost:5001/api
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8
```

Do not commit environment files containing real credentials or secrets.

---

## ▶️ Running the Application

Start the application using the project's configured development command:

```bash
npm run dev
```

The default local configuration uses:

```text
Frontend
http://localhost:5173

Backend
http://localhost:5001

API
http://localhost:5001/api
```

---

## 🌐 Routes

| Route                    | Module                     |
| ------------------------ | -------------------------- |
| `/login`                 | Login                      |
| `/dashboard`             | Dashboard                  |
| `/users`                 | User Management            |
| `/contacts`              | Contacts                   |
| `/products`              | Products & Inventory       |
| `/sales-orders`          | Sales Orders               |
| `/invoices`              | Customer Invoices          |
| `/purchase-orders`       | Purchase Orders            |
| `/vendor-bills`          | Vendor Bills               |
| `/payments`              | Payments                   |
| `/accounts`              | Chart of Accounts          |
| `/journals`              | Journals & Journal Entries |
| `/analytic-accounts`     | Analytic Accounts          |
| `/budgets`               | Budgets                    |
| `/reports/profit-loss`   | Profit & Loss              |
| `/reports/balance-sheet` | Balance Sheet              |
| `/reports/budget`        | Budget vs Actual           |
| `/reports/ledger`        | Ledger                     |
| `/portal`                | Customer Portal            |
| `/settings`              | Settings                   |

> Route names may vary depending on the current frontend route configuration.

---

## 🔌 API

All backend APIs are exposed under:

```text
/api/*
```

### Health

```http
GET /api/health
```

### Authentication

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Financial Data

```http
GET /api/invoices
GET /api/vendor-bills
GET /api/payments
```

### Financial Reports

```http
GET /api/reports/profit-loss
GET /api/reports/balance-sheet
GET /api/reports/budget
GET /api/reports/ledger
```

Financial report APIs require authentication and appropriate role authorization.

---

## 🔗 API Data Flow

Backend-connected features follow this architecture:

```text
React Page
     ↓
API Service
     ↓
Express Route
     ↓
Authentication Middleware
     ↓
Role Authorization
     ↓
Controller
     ↓
Mongoose Model
     ↓
MongoDB Atlas
     ↓
API Response
     ↓
React UI
```

Legacy frontend-managed features may follow:

```text
React Page
     ↓
DataContext
     ↓
Local State
     ↓
Browser localStorage
```

---

## 🔒 Security

The application includes:

* JWT-based authentication
* Password hashing with bcryptjs
* Protected frontend routes
* Backend authentication middleware
* Role-based authorization
* Restricted financial reports
* CORS configuration
* Environment-based secret management
* MongoDB-backed user authentication

For production deployment, use HTTPS, strong secrets, secure authentication configuration, restricted MongoDB access, and appropriate CORS policies.

---

## 🚀 Production Considerations

Before deploying to production:

* Configure a production MongoDB Atlas database
* Use strong and unique authentication secrets
* Configure production API URLs
* Restrict CORS to trusted domains
* Enable HTTPS
* Secure MongoDB network access
* Keep environment variables outside source control
* Configure secure authentication cookies
* Deploy the frontend using a production build
* Deploy the backend on a suitable Node.js environment
* Complete backend integration for remaining legacy frontend-managed modules

---

## 🔮 Future Improvements

Potential improvements include:

* 🔄 Complete MongoDB integration for remaining operational modules
* 📦 Advanced inventory management
* 🪚 Furniture manufacturing and production workflows
* 📋 Material and raw-stock management
* 📊 Advanced business analytics
* 🧾 Invoice and document export
* 📚 Enhanced accounting workflows
* 🔍 Audit trails and activity logs
* 📈 Advanced financial dashboards
* 🔔 Notifications and alerts
* 📑 Expanded reporting capabilities
* ☁️ Production cloud deployment
* 🔐 Advanced permissions and access controls

---

## 🎯 Project Goal

The goal of Urban Furniture ERP is to provide furniture and carpentry businesses with a centralized system for managing their operations, accounting, and financial information.

```text
Manage
   ↓
Organize
   ↓
Account
   ↓
Analyze
   ↓
Grow
```

---

## 👥 Team Project

Urban Furniture ERP is developed as a collaborative team project.

```
```
