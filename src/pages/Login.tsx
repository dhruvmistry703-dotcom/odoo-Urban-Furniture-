import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('accountant@urbanfurniture.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'Admin' | 'Accountant'>('Accountant');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-navy-800/90 border border-navy-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 mb-4">
            <Armchair className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Urban Furniture</h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1">
            Accounting & ERP System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Role Access
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('Accountant')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  role === 'Accountant'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500'
                    : 'bg-navy-900 text-slate-400 border-navy-700 hover:text-white'
                }`}
              >
                Accountant
              </button>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  role === 'Admin'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500'
                    : 'bg-navy-900 text-slate-400 border-navy-700 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4 py-2.5">
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-navy-700/60 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Demo Mode Enabled • Auto-fill ready
          </p>
        </div>
      </div>
    </div>
  );
};
