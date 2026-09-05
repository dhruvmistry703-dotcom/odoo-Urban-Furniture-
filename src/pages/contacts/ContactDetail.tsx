import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, FileText, CreditCard, ShoppingBag } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts, invoices, payments, salesOrders, bills } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'orders'>('overview');

  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Contact not found</h2>
        <Button className="mt-4" onClick={() => navigate('/contacts')}>Back to Contacts</Button>
      </div>
    );
  }

  const contactInvoices = invoices.filter(i => i.customerId === contact.id);
  const contactBills = bills.filter(b => b.vendorId === contact.id);
  const contactPayments = payments.filter(p => p.contactId === contact.id);
  const contactOrders = salesOrders.filter(s => s.customerId === contact.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={contact.name}
        subtitle={`${contact.type.toUpperCase()} • Tax ID: ${contact.taxId || 'N/A'}`}
        action={
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/contacts')}>
            Back to Contacts
          </Button>
        }
        breadcrumbs={[{ label: 'Contacts', href: '/contacts' }, { label: contact.name }]}
      />

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-navy-800 dark:to-navy-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Invoiced</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{contact.totalInvoiced.toLocaleString('en-IN')}
          </h3>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-navy-800 dark:to-navy-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Paid</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{contact.totalPaid.toLocaleString('en-IN')}
          </h3>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-navy-800 dark:to-navy-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
          <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            ₹{contact.outstanding.toLocaleString('en-IN')}
          </h3>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-navy-700 flex gap-4">
        {[
          { key: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
          { key: 'invoices', label: `Invoices & Bills (${contactInvoices.length + contactBills.length})`, icon: <FileText className="w-4 h-4" /> },
          { key: 'payments', label: `Payments (${contactPayments.length})`, icon: <CreditCard className="w-4 h-4" /> },
          { key: 'orders', label: `Sales Orders (${contactOrders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Contact Metadata">
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Email:</span> {contact.email || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Phone:</span> {contact.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Address:</span> {contact.address || 'N/A'}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-navy-700 flex items-center gap-2">
                <span className="font-semibold text-slate-500">Status:</span>
                <Badge status={contact.status} />
              </div>
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-3 text-xs">
              {contactInvoices.length > 0 ? (
                contactInvoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-navy-900">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                      <span className="text-slate-500 text-[10px] block">{inv.invoiceDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">₹{inv.grandTotal.toLocaleString('en-IN')}</span>
                      <Badge status={inv.status} className="ml-2" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No recent transactions recorded for this contact.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'invoices' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                <tr>
                  <th className="px-4 py-3">Document #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                {contactInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-bold">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 font-semibold">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 font-semibold text-rose-600">₹{inv.outstandingAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3"><Badge status={inv.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/invoices/${inv.id}`)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
                <tr>
                  <th className="px-4 py-3">Payment #</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700">
                {contactPayments.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-bold">{p.paymentNumber}</td>
                    <td className="px-4 py-3">{p.referenceNumber || '—'}</td>
                    <td className="px-4 py-3">{p.paymentDate}</td>
                    <td className="px-4 py-3 font-semibold uppercase">{p.method}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
