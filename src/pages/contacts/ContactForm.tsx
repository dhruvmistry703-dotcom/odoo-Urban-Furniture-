import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Check, ArrowLeft, User, Mail, Phone, MapPin, Building, ShieldCheck } from 'lucide-react';
import { ImageUploadBox } from '../../components/common/ImageUploadBox';
import { Badge } from '../../components/ui/Badge';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { ContactType } from '../../types';

export const ContactForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts, addContact, updateContact } = useData();
  const { showToast } = useToast();

  const isEditing = Boolean(id && id !== 'new');
  const existingContact = isEditing ? contacts.find(c => c.id === id) : null;

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<ContactType>('customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [image, setImage] = useState('');
  const [taxId, setTaxId] = useState('');

  // Sample presets for quick testing
  const avatarPresets = [
    { label: 'Rahul Sharma', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { label: 'Nimesh Pathak', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
    { label: 'Open Wood', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { label: 'Joey Willis', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200' },
  ];

  const resetForm = () => {
    setName('');
    setType('customer');
    setEmail('');
    setPhone('');
    setStreet('');
    setCity('');
    setState('');
    setCountry('India');
    setPincode('');
    setImage('');
    setTaxId('');
  };

  // Populate form when existing contact is loaded
  useEffect(() => {
    if (existingContact) {
      setName(existingContact.name || '');
      setType(existingContact.type || 'customer');
      setEmail(existingContact.email || '');
      setPhone(existingContact.phone || '');
      setStreet(existingContact.street || '');
      setCity(existingContact.city || '');
      setState(existingContact.state || '');
      setCountry(existingContact.country || 'India');
      setPincode(existingContact.pincode || '');
      setImage(existingContact.image || '');
      setTaxId(existingContact.taxId || '');
    } else {
      resetForm();
    }
  }, [id, existingContact]);

  const handleNewRecord = () => {
    resetForm();
    navigate('/contacts/new');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Contact Name is required.',
      });
      return;
    }

    const computedAddress = [street, city, state, pincode, country].filter(Boolean).join(', ');

    if (isEditing && id) {
      updateContact(id, {
        name,
        type,
        email,
        phone,
        street,
        city,
        state,
        country,
        pincode,
        image,
        taxId,
        address: computedAddress,
      });

      showToast({
        type: 'success',
        title: 'Contact Updated',
        message: `Changes to ${name} have been saved successfully.`,
      });
    } else {
      const created = addContact({
        name,
        type,
        email,
        phone,
        street,
        city,
        state,
        country,
        pincode,
        image,
        taxId,
        address: computedAddress,
        status: 'active',
      });

      showToast({
        type: 'success',
        title: 'Contact Created',
        message: `${created.name} was successfully created.`,
      });
      navigate(`/contacts/${created.id}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Bar (Matching Wireframe: [New] [Confirm] ... [Back]) */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleNewRecord}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-navy-700 transition-all active:scale-95"
            title="Open blank form view to enter new record"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
            <span>New</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all active:scale-95"
            title="Save and confirm contact details"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Confirm</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {existingContact && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs border border-slate-200 dark:border-navy-750">
              <span className="text-slate-400">Status:</span>
              <Badge status={existingContact.status} />
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate('/contacts')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-navy-700 transition-all active:scale-95"
            title="Back to Contact List View"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Form Card matching wireframe */}
      <div className="bg-white dark:bg-navy-850 rounded-2xl border border-slate-200/90 dark:border-navy-750 shadow-sm p-6 sm:p-8">
        <div className="mb-6 pb-4 border-b border-slate-100 dark:border-navy-750 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isEditing ? `Edit Contact: ${name || 'Saved Contact'}` : 'Contact Master Form View'}
            </h2>
            <p className="text-xs text-slate-400">
              Enter contact information, type categorization, address details, and profile photo.
            </p>
          </div>
          {isEditing && (
            <Badge status={type} />
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Center: Form Input Fields */}
            <div className="lg:col-span-8 space-y-5">
              {/* Contact Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Contact Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma, Nimesh Pathak, Open Wood..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
                />
              </div>

              {/* Contact Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Contact Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['customer', 'vendor', 'both'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setType(option)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border capitalize transition-all text-center ${
                        type === option
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                          : 'border-slate-200 dark:border-navy-700 bg-slate-50/70 dark:bg-navy-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {option === 'both' ? 'Both (Customer & Vendor)' : option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Unique Email"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Unique email for invoicing & portal login
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mobile / Phone</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 9090090909"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Detailed Address Block */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-navy-900/60 border border-slate-200 dark:border-navy-750 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Address Details</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Street
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    placeholder="Plot / Street / Building / Floor"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      placeholder="Pincode"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-navy-850 border border-slate-200 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tax ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>GSTIN / Tax ID</span>
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  placeholder="e.g. 27AABCA1234F1ZM"
                  className="w-full sm:w-1/2 px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono uppercase"
                />
              </div>
            </div>

            {/* Right Side: Upload Image Box matching screenshot */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end">
              <div className="w-full max-w-[240px] space-y-3">
                <ImageUploadBox
                  label="Profile Image"
                  image={image}
                  onChange={setImage}
                  presets={avatarPresets}
                  placeholderText="Upload Image"
                />
              </div>
            </div>
          </div>

          {/* Existing Financial Metrics Bar if editing */}
          {existingContact && (
            <div className="pt-6 border-t border-slate-100 dark:border-navy-750 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Invoiced</span>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  ₹{existingContact.totalInvoiced.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{existingContact.totalPaid.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Outstanding</span>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                  ₹{existingContact.outstanding.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
