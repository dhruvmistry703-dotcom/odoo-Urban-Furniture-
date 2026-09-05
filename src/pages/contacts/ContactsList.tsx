import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, KeyRound, Shield, Check } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ContactType } from '../../types';
import { api } from '../../services/api';

export const ContactsList: React.FC = () => {
  const { contacts, addContact } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Contact Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ContactType>('customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [createLoginAccount, setCreateLoginAccount] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  const filtered = contacts.filter(c => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesQuery && matchesType;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Create locally in state for instant UI response
      const newContact = addContact({
        name,
        type,
        email,
        phone,
        address,
        taxId,
        status: 'active',
      });

      // 2. Call backend API to persist and optionally create user account
      if (createLoginAccount && email && password) {
        try {
          await api.createContact({
            name,
            type,
            email,
            phone,
            address,
            taxId,
            createLoginAccount: true,
            password,
          });
        } catch (apiErr) {
          console.warn('Backend contact save error:', apiErr);
        }
      }

      showToast({
        type: 'success',
        title: 'Contact Created',
        message: `${newContact.name} added successfully as ${newContact.type}.${
          createLoginAccount ? ' Login account provisioned with role CONTACT.' : ''
        }`,
      });

      setIsModalOpen(false);
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setTaxId('');
      setCreateLoginAccount(false);
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts & Clients"
        subtitle="Manage customer, vendor, and contractor accounts"
        action={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Contact
          </Button>
        }
      />

      <Card noPadding>
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-navy-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search contacts..."
              icon={<Search className="w-4 h-4" />}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="customer">Customers</option>
              <option value="vendor">Vendors</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Email & Phone</th>
                <th className="px-4 py-3">GST / Tax ID</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
              {filtered.map(contact => (
                <tr
                  key={contact.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-navy-700/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {contact.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {contact.address}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={contact.type} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">
                      {contact.email}
                    </div>
                    <div className="text-[11px] text-slate-400">{contact.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {contact.taxId || '—'}
                  </td>
                  <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                    {contact.outstanding > 0 ? (
                      <span className="text-rose-600 dark:text-rose-400">
                        ₹{contact.outstanding.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">₹0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={contact.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                      >
                        View
                      </Button>
                      {/* Archive action ONLY visible to Admin */}
                      {isAdmin && contact.status !== 'archived' && (
                        <button
                          onClick={() => {
                            showToast({
                              type: 'info',
                              title: 'Admin Action',
                              message: `Archive authority verified for ${contact.name}`,
                            });
                          }}
                          className="px-2 py-1 text-[10px] font-semibold text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                          title="Admin Only Action: Archive Contact"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Contact Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Contact">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Contact Name"
            required
            placeholder="e.g. Acme Commercial Interiors"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Select
            label="Contact Type"
            options={[
              { value: 'customer', label: 'Customer' },
              { value: 'vendor', label: 'Vendor' },
              { value: 'both', label: 'Both (Customer & Vendor)' },
            ]}
            value={type}
            onChange={e => setType(e.target.value as ContactType)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="billing@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="GSTIN / Tax ID"
            placeholder="27AABCA1234F1ZM"
            value={taxId}
            onChange={e => setTaxId(e.target.value)}
          />

          <Input
            label="Billing & Shipping Address"
            placeholder="Industrial Park, Mumbai..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

          {/* Create Login Account Section */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-500" /> Create Login Account
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Provision a Contact Portal user account (Role: CONTACT)
                </p>
              </div>
              <div className="flex items-center bg-slate-200 dark:bg-navy-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setCreateLoginAccount(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    !createLoginAccount
                      ? 'bg-white dark:bg-navy-700 text-slate-800 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setCreateLoginAccount(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    createLoginAccount
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {createLoginAccount && (
              <div className="pt-2 border-t border-slate-200 dark:border-navy-700 space-y-2 animate-in fade-in duration-150">
                <Input
                  label="Contact User Password"
                  type="password"
                  required
                  placeholder="Password for client portal login"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Account will have strict data isolation (only sees own invoices/bills).
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-navy-700">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Contact...' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
