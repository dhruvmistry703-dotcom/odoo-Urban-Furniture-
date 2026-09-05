import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ContactProfile: React.FC = () => {
  const { user } = useAuth();
  const [contactDetails, setContactDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      if (user?.contactId) {
        try {
          const res = await api.getContactById(user.contactId);
          if (res && res.contact) {
            setContactDetails(res.contact);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchContactInfo();
  }, [user]);

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Client Profile & Account Details"
        description="Your registered business contact information on Urban Furniture ERP."
        breadcrumbs={[
          { label: 'Portal', path: '/my-invoices' },
          { label: 'Profile', path: '/profile' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-600/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.email}</p>
            <div className="mt-2.5">
              <Badge variant="warning">Role: CONTACT PORTAL</Badge>
            </div>
          </div>
          <div className="w-full pt-4 border-t border-slate-200 dark:border-navy-800 text-left text-xs space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Status: <strong>Active & Verified</strong></span>
            </div>
          </div>
        </Card>

        {/* Contact Master Details Card */}
        <Card className="md:col-span-2 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-navy-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-500" /> Business Contact Record
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Company / Entity Name</label>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-semibold">
                {contactDetails?.name || user?.name}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">GST / Tax Identification</label>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-mono">
                {contactDetails?.taxId || '24AABCU9603R1ZM'}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Primary Phone</label>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200">
                {contactDetails?.phone || '+91 98765 43210'}
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Registered Email</label>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 font-mono">
                {contactDetails?.email || user?.email}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-400 font-semibold block mb-1">Registered Workshop / Billing Address</label>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200">
                {contactDetails?.address || 'Plot 42, GIDC Industrial Estate, Surat, Gujarat - 395004'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
