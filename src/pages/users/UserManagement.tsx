import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Shield, CheckCircle, XCircle, AlertCircle, RefreshCw, Key, Mail, User } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';

interface UserItem {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ACCOUNTANT' | 'CONTACT';
  contactId?: { _id: string; name: string; email: string } | null;
  isActive: boolean;
  createdAt?: string;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'ACCOUNTANT' | 'CONTACT'>('ACCOUNTANT');
  const [contactId, setContactId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.getContacts();
      if (res && res.contacts) {
        setContacts(res.contacts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchContacts();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createUser({
        name,
        email,
        password,
        role,
        contactId: role === 'CONTACT' ? contactId : undefined,
      });
      showToast({ type: 'success', title: 'User Created', message: `${name} has been added as ${role}` });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('ACCOUNTANT');
      setContactId('');
      fetchUsers();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Creation Failed', message: err.message || 'Could not create user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await api.toggleUserStatus(userId);
      showToast({ type: 'success', title: 'Status Updated', message: res.message || 'User status changed' });
      fetchUsers();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Action Failed', message: err.message || 'Could not change user status' });
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r?.toUpperCase()) {
      case 'ADMIN':
        return <Badge variant="danger">ADMIN (Full Access)</Badge>;
      case 'ACCOUNTANT':
        return <Badge variant="primary">ACCOUNTANT</Badge>;
      case 'CONTACT':
        return <Badge variant="warning">CONTACT (Isolated)</Badge>;
      default:
        return <Badge variant="default">{r}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Management"
        description="Admin dashboard to manage system users, roles, credentials, and Contact portal logins."
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'User Management', path: '/users' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1.5" /> Create New User
            </Button>
          </div>
        }
      />

      {/* Security Banner */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between text-emerald-300 text-xs">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Role-Based Access Control (RBAC) Active:</strong> All user actions and API endpoints are strictly validated against verified JWT token roles.
          </span>
        </div>
      </div>

      {/* Users List Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Linked Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-navy-800">
              {users.map(u => {
                const isSelf = u._id === currentUser?.id || u.id === currentUser?.id;
                return (
                  <tr key={u._id || u.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{u.name}</div>
                        {isSelf && <span className="text-[10px] text-emerald-400 font-bold">(You)</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {u.contactId ? (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {typeof u.contactId === 'object' ? u.contactId.name : u.contactId}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">None (Internal Staff)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSelf && (
                        <Button
                          variant={u.isActive ? 'danger' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(u._id || u.id!)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New System User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. John Doe"
          />

          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@urbanfurniture.com"
          />

          <Input
            label="Initial Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />

          <Select
            label="Assigned Role"
            value={role}
            onChange={e => setRole(e.target.value as any)}
            options={[
              { value: 'ACCOUNTANT', label: 'Invoicing User / Accountant (No Archive, Full Ledger)' },
              { value: 'ADMIN', label: 'Admin / Business Owner (Complete Authority)' },
              { value: 'CONTACT', label: 'Contact Portal User (Strict Data Isolation)' },
            ]}
          />

          {role === 'CONTACT' && (
            <Select
              label="Link to Contact Master"
              required
              value={contactId}
              onChange={e => setContactId(e.target.value)}
              options={[
                { value: '', label: '-- Select a Contact / Client --' },
                ...contacts.map(c => ({
                  value: c._id || c.id,
                  label: `${c.name} (${c.type})`,
                })),
              ]}
            />
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-navy-700">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating User...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
