import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, ShieldCheck, Lock, Mail, AlertCircle, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@urbanfurniture.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        const role = result.user.role?.toUpperCase();
        if (role === 'CONTACT') {
          navigate('/my-invoices');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to authentication server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-navy-800/95 border border-navy-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 mb-3">
            <Armchair className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Urban Furniture</h1>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1">
            Accounting & ERP System
          </p>
        </div>

        {/* Demo Quick-Fill Roles */}
        <div className="mb-6 bg-navy-900/90 rounded-xl p-3 border border-navy-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Demo Accounts Quick-Select
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@urbanfurniture.com', 'Admin@123')}
              className="px-2 py-2 rounded-lg bg-navy-800 hover:bg-emerald-950/60 border border-navy-700 hover:border-emerald-500/50 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-emerald-400">Admin</div>
              <div className="text-[9px] text-slate-400 truncate">Full Access</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('accountant@urbanfurniture.com', 'Accountant@123')}
              className="px-2 py-2 rounded-lg bg-navy-800 hover:bg-blue-950/60 border border-navy-700 hover:border-blue-500/50 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-blue-400">Accountant</div>
              <div className="text-[9px] text-slate-400 truncate">No Archive</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('customer@urbanfurniture.com', 'Customer@123')}
              className="px-2 py-2 rounded-lg bg-navy-800 hover:bg-amber-950/60 border border-navy-700 hover:border-amber-500/50 text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-amber-400">Contact</div>
              <div className="text-[9px] text-slate-400 truncate">Own Data Only</div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@urbanfurniture.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full mt-4 py-2.5 flex items-center justify-center gap-2 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In with Role'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-navy-700/60 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> JWT Protected • Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
};
