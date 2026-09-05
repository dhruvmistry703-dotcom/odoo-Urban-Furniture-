import React from 'react';
import { Sun, Moon, RotateCcw, User, Building } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { resetDemoData } = useData();
  const { showToast } = useToast();

  const handleReset = () => {
    resetDemoData();
    showToast({
      type: 'warning',
      title: 'Demo Data Reset',
      message: 'All local demo data has been restored to default initial state.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Settings & System Preferences"
        subtitle="Manage theme, user profile, and system settings"
      />

      {/* Theme Settings Card */}
      <Card title="Appearance & Visual Theme">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Theme Mode</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current selection: <span className="font-semibold capitalize">{theme} Mode</span>
            </p>
          </div>
          <Button
            variant="outline"
            icon={theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            onClick={toggleTheme}
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </div>
      </Card>

      {/* Profile Card */}
      <Card title="User Account Profile">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <User className="w-3.5 h-3.5" /> Role: {user?.role}
            </span>
          </div>
        </div>
      </Card>

      {/* Company Profile Card */}
      <Card title="Company Entity Profile">
        <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Entity:</span> Urban Furniture Systems Pvt Ltd
          </div>
          <div><span className="font-bold">GSTIN Registration:</span> 27AAACU9988P1Z8</div>
          <div><span className="font-bold">Fiscal Year:</span> April 1 — March 31</div>
          <div><span className="font-bold">Currency:</span> Indian Rupee (₹ INR)</div>
        </div>
      </Card>

      {/* Reset Demo Data Card */}
      <Card title="Database & Storage Operations" className="border-rose-200 dark:border-rose-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reset Demo Data</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restores initial products, contacts, orders, and journal entries.
            </p>
          </div>
          <Button variant="danger" icon={<RotateCcw className="w-4 h-4" />} onClick={handleReset}>
            Reset Demo Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
