import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { exportBalanceSheetPdf } from '../../utils/reportPdf';

export const BalanceSheetReport: React.FC = () => {
  const { showToast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = () => {
    setLoading(true);
    setError('');
    api.getBalanceSheet()
      .then(response => {
        if (response && response.report) {
          setReport(response.report);
        } else {
          setReport(response);
        }
      })
      .catch(err => {
        const msg = err.message || 'Unable to fetch Balance Sheet from API';
        setError(msg);
        showToast({ type: 'error', title: 'Unable to load Balance Sheet', message: msg });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) return <div className="p-8 text-sm text-slate-500">Loading balance sheet from MongoDB...</div>;
  if (!report) return (
    <div className="p-8 space-y-3">
      <p className="text-sm text-rose-600">The Balance Sheet report could not be loaded.</p>
      {error && <p className="text-xs text-slate-500">{error}</p>}
      <Button variant="outline" onClick={loadReport}>Retry</Button>
    </div>
  );

  const assetAccounts = report.assetAccounts || [];
  const liabilityAccounts = report.liabilityAccounts || [];
  const capitalAccounts = report.capitalAccounts || [];
  const accountsReceivable = report.accountsReceivable || 0;
  const accountsPayable = report.accountsPayable || 0;

  const totalAssets = (assetAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0)) + accountsReceivable;
  const totalLiabilities = (liabilityAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0)) + accountsPayable;
  const totalCapital = capitalAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
  const netProfit = report.netProfit ?? ((report.totalIncome || 0) - (report.totalExpense || 0));
  const totalEquity = totalCapital + netProfit;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const handleExportPDF = () => {
    exportBalanceSheetPdf(report);
    showToast({
      type: 'info',
      title: 'Exporting Balance Sheet',
      message: 'Balance Sheet PDF downloaded.',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Sheet"
        subtitle="Statement of Financial Position (MongoDB Atlas Live Data)"
        action={
          <Button variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleExportPDF}>
            Export PDF
          </Button>
        }
        breadcrumbs={[{ label: 'Reports' }, { label: 'Balance Sheet' }]}
      />

      <Card className="p-8 border-2 border-slate-200 dark:border-navy-700">
        <div className="text-center pb-6 border-b border-slate-200 dark:border-navy-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Urban Furniture Systems Pvt Ltd
          </h2>
          <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Statement of Financial Position (Balance Sheet)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Live Data from MongoDB Atlas</p>
        </div>

        {/* 2-Column Balance Sheet Financial Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 text-xs">
          {/* ASSETS COLUMN */}
          <div className="space-y-4">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase border-b border-emerald-300 pb-1 flex justify-between text-sm">
              <span>ASSETS</span>
              <span>Amount (₹)</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                Current & Non-Current Asset Accounts (MongoDB)
              </span>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 pl-2">
                <span>Accounts Receivable (Customer Outstandings)</span>
                <span className="font-mono">₹{accountsReceivable.toLocaleString('en-IN')}</span>
              </div>
              {assetAccounts.map((acc: any) => (
                <div key={acc._id || acc.id || acc.code} className="flex justify-between text-slate-700 dark:text-slate-300 pl-2">
                  <span>{acc.code ? `${acc.code} - ${acc.name}` : acc.name}</span>
                  <span className="font-mono">₹{(acc.balance || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-800 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white mt-6">
              <span>TOTAL ASSETS</span>
              <span className="font-mono text-emerald-600">₹{totalAssets.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY COLUMN */}
          <div className="space-y-4">
            <div className="font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase border-b border-blue-300 pb-1 flex justify-between text-sm">
              <span>LIABILITIES & EQUITY</span>
              <span>Amount (₹)</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                Liability Accounts (MongoDB)
              </span>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 pl-2">
                <span>Accounts Payable (Supplier Bills)</span>
                <span className="font-mono">₹{accountsPayable.toLocaleString('en-IN')}</span>
              </div>
              {liabilityAccounts.map((acc: any) => (
                <div key={acc._id || acc.id || acc.code} className="flex justify-between text-slate-700 dark:text-slate-300 pl-2">
                  <span>{acc.code ? `${acc.code} - ${acc.name}` : acc.name}</span>
                  <span className="font-mono">₹{(acc.balance || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-navy-700">
                <span>Total Liabilities</span>
                <span className="font-mono">₹{totalLiabilities.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
                Owner's Equity & Retained Profits
              </span>
              {capitalAccounts.map((acc: any) => (
                <div key={acc._id || acc.id || acc.code} className="flex justify-between text-slate-700 dark:text-slate-300 pl-2">
                  <span>{acc.code ? `${acc.code} - ${acc.name}` : acc.name}</span>
                  <span className="font-mono">₹{(acc.balance || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="flex justify-between text-slate-700 dark:text-slate-300 pl-2">
                <span>Current Net Operating Result</span>
                <span className="font-mono text-emerald-600">₹{netProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-navy-700">
                <span>Total Equity</span>
                <span className="font-mono">₹{totalEquity.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-300 dark:border-blue-800 flex justify-between font-extrabold text-sm text-slate-900 dark:text-white mt-6">
              <span>TOTAL LIABILITIES & EQUITY</span>
              <span className="font-mono text-blue-600">₹{totalLiabilitiesAndEquity.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
