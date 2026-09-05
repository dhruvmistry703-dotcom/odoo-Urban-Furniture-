import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { MasterToolbar } from '../../components/common/MasterToolbar';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { ContactType } from '../../types';

export const ContactsList: React.FC = () => {
  const { contacts } = useData();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContactType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredContacts = contacts.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.city && c.city.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term));

    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredContacts.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isAllSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every(c => selectedIds.includes(c.id));

  return (
    <div className="space-y-4">
      {/* Top Header & Master Toolbar matching screenshot wireframe */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contact Master
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeView === 'list' ? 'Contact List View (Default)' : 'Contact Kanban View'} • Manage customers, vendors, and partners
          </p>
        </div>

        {/* Quick Type Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-750 text-xs">
          {(['all', 'customer', 'vendor', 'both'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                typeFilter === t
                  ? 'bg-white dark:bg-navy-700 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Contacts' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Reusable Master Toolbar */}
      <MasterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search contacts by name, email, phone, city..."
        activeView={activeView}
        onViewChange={setActiveView}
        onNewClick={() => navigate('/contacts/new')}
        onBackClick={() => navigate('/dashboard')}
        newButtonText="New"
        selectedCount={selectedIds.length}
      />

      {/* VIEW 1: CONTACT LIST VIEW (DEFAULT) */}
      {activeView === 'list' && (
        <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 dark:bg-navy-900/90 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-navy-700 select-none">
                <tr>
                  <th className="w-10 px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="w-16 px-3 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-700/60">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => {
                    const isSelected = selectedIds.includes(contact.id);
                    return (
                      <tr
                        key={contact.id}
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                            : 'hover:bg-slate-50/80 dark:hover:bg-navy-800/50'
                        }`}
                      >
                        <td
                          className="px-4 py-3 text-center"
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleSelect(contact.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(contact.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-navy-750 flex items-center justify-center border border-slate-200 dark:border-navy-700 shrink-0 shadow-2xs">
                            {contact.image ? (
                              <img
                                src={contact.image}
                                alt={contact.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                                {contact.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {contact.name}
                          </div>
                          {contact.taxId && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              GST: {contact.taxId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge status={contact.type} />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {contact.email || '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                          {contact.phone || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                          {contact.city
                            ? `${contact.city}${contact.state ? `, ${contact.state}` : ''}${contact.pincode ? ` - ${contact.pincode}` : ''}`
                            : contact.address || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge status={contact.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No contacts found matching &ldquo;{searchTerm}&rdquo;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CONTACT KANBAN VIEW */}
      {activeView === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => navigate(`/contacts/${contact.id}`)}
                className="group bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-4 hover:border-emerald-500/60 hover:shadow-lg dark:hover:shadow-navy-950/50 transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center gap-3.5"
              >
                {/* Left Side: Avatar / Profile Image box */}
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-navy-750 flex items-center justify-center shrink-0 border border-slate-200 dark:border-navy-700 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                  {contact.image ? (
                    <img
                      src={contact.image}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                      {contact.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Right Side: Contact Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {contact.name}
                    </h3>
                    <Badge status={contact.type} />
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 truncate text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{contact.email || 'No email provided'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{contact.phone || 'No phone provided'}</span>
                    </div>
                    {(contact.city || contact.address) && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {contact.city || contact.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/80 dark:border-navy-750">
              No contacts found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
