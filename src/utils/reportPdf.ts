import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type PdfDocument = jsPDF & {
  lastAutoTable?: { finalY: number };
};

const green = [5, 150, 105] as [number, number, number];
const navy = [15, 23, 42] as [number, number, number];
const slate = [71, 85, 105] as [number, number, number];
const lightGreen = [236, 253, 245] as [number, number, number];
const lightBlue = [239, 246, 255] as [number, number, number];

const currency = (value: number | undefined | null) =>
  `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const addHeader = (doc: PdfDocument, title: string, subtitle: string, accent = green) => {
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('URBAN FURNITURE SYSTEMS PVT LTD', 14, 14);
  doc.setFontSize(12);
  doc.setTextColor(...accent);
  doc.text(title, 14, 23);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(subtitle, 14, 29);
  doc.setTextColor(...slate);
  doc.setFontSize(8);
  doc.text(`Generated ${new Date().toLocaleDateString('en-IN')}`, 196, 29, { align: 'right' });
};

const addSummary = (doc: PdfDocument, items: Array<{ label: string; value: string; color?: [number, number, number] }>, y: number) => {
  const width = 182 / items.length;
  items.forEach((item, index) => {
    const x = 14 + index * width;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, width - 4, 22, 2, 2, 'F');
    doc.setTextColor(...slate);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(item.label.toUpperCase(), x + 5, y + 8);
    doc.setTextColor(...(item.color || navy));
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(item.value, x + 5, y + 17);
  });
};

const finish = (doc: PdfDocument, filename: string) => {
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 285, 196, 285);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Urban Furniture ERP | Financial Report', 14, 291);
  doc.text('Confidential', 196, 291, { align: 'right' });
  doc.save(filename);
};

export const exportProfitLossPdf = (report: any, period: string) => {
  const doc = new jsPDF() as PdfDocument;
  const incomeRows = [
    ['Furniture Sales Revenue', currency(report.totalIncome)],
    ['Assembly & Service Income', currency(report.otherIncome)],
  ];
  const expenseRows = [
    ['Raw Material & Timber Purchase Expense', currency(report.bills?.reduce((sum: number, bill: any) => sum + (bill.subtotal || 0), 0))],
    ['Account-based operating expenses', currency(report.expenseAccounts?.reduce((sum: number, account: any) => sum + (account.balance || 0), 0))],
  ];

  addHeader(doc, 'STATEMENT OF PROFIT AND LOSS', `Reporting period: ${period}`);
  addSummary(doc, [
    { label: 'Total income', value: currency(report.totalIncome), color: green },
    { label: 'Total expenses', value: currency(report.totalExpense), color: [225, 29, 72] },
    { label: 'Net result', value: currency(report.netProfit), color: report.netProfit >= 0 ? green : [225, 29, 72] },
  ], 44);

  autoTable(doc, {
    startY: 76,
    head: [['Income & Revenue', 'Amount']],
    body: [...incomeRows, [{ content: 'TOTAL INCOME', styles: { fontStyle: 'bold' } }, { content: currency(report.totalIncome), styles: { fontStyle: 'bold' } }]],
    theme: 'grid',
    headStyles: { fillColor: green, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 1: { halign: 'right' } },
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 76) + 12,
    head: [['Operating Expenses', 'Amount']],
    body: [...expenseRows, [{ content: 'TOTAL EXPENSES', styles: { fontStyle: 'bold' } }, { content: currency(report.totalExpense), styles: { fontStyle: 'bold' } }]],
    theme: 'grid',
    headStyles: { fillColor: [225, 29, 72], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 241, 242] },
    columnStyles: { 1: { halign: 'right' } },
  });

  finish(doc, `profit-loss-${period.replace(/[^0-9]+/g, '-')}.pdf`);
};

export const exportBalanceSheetPdf = (report: any) => {
  const doc = new jsPDF() as PdfDocument;
  const assetAccounts = report.assetAccounts || [];
  const liabilityAccounts = report.liabilityAccounts || [];
  const capitalAccounts = report.capitalAccounts || [];

  const accountsReceivable = report.accountsReceivable || 0;
  const accountsPayable = report.accountsPayable || 0;

  const totalAssets = assetAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0) + accountsReceivable;
  const totalLiabilities = liabilityAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0) + accountsPayable;
  const totalCapital = capitalAccounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0);
  const netProfit = report.netProfit ?? ((report.totalIncome || 0) - (report.totalExpense || 0));
  const totalEquity = totalCapital + netProfit;

  const assetRows = [
    ['Accounts Receivable', currency(accountsReceivable)],
    ...assetAccounts.map((acc: any) => [acc.name, currency(acc.balance)]),
  ];

  const liabilityRows = [
    ['Accounts Payable', currency(accountsPayable)],
    ...liabilityAccounts.map((acc: any) => [acc.name, currency(acc.balance)]),
    ...capitalAccounts.map((acc: any) => [acc.name, currency(acc.balance)]),
    ['Current Net Operating Result', currency(netProfit)],
  ];

  addHeader(doc, 'STATEMENT OF FINANCIAL POSITION', 'Live Data from MongoDB Atlas', [59, 130, 246]);
  addSummary(doc, [
    { label: 'Total assets', value: currency(totalAssets), color: green },
    { label: 'Total liabilities', value: currency(totalLiabilities), color: [225, 29, 72] },
    { label: 'Total equity', value: currency(totalEquity), color: [37, 99, 235] },
  ], 44);

  autoTable(doc, {
    startY: 76,
    head: [['Assets', 'Amount']],
    body: [
      ...assetRows,
      [{ content: 'TOTAL ASSETS', styles: { fontStyle: 'bold' } }, { content: currency(totalAssets), styles: { fontStyle: 'bold' } }],
    ],
    theme: 'grid',
    headStyles: { fillColor: green, textColor: 255 },
    alternateRowStyles: { fillColor: lightGreen },
    columnStyles: { 1: { halign: 'right' } },
  });

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 76) + 12,
    head: [['Liabilities & Equity', 'Amount']],
    body: [
      ...liabilityRows,
      [{ content: 'TOTAL LIABILITIES & EQUITY', styles: { fontStyle: 'bold' } }, { content: currency(totalLiabilities + totalEquity), styles: { fontStyle: 'bold' } }],
    ],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: lightBlue },
    columnStyles: { 1: { halign: 'right' } },
  });

  finish(doc, 'balance-sheet-mongodb.pdf');
};

export const exportBudgetReportPdf = (budgets: any[]) => {
  const doc = new jsPDF() as PdfDocument;
  const rows = budgets.map(budget => {
    const planned = Number(budget.planned) || 0;
    const actual = Number(budget.actual) || 0;
    return [
      budget.name || 'Unnamed budget',
      budget.analyticAccountName || '—',
      budget.period || `${budget.startDate || ''} - ${budget.endDate || ''}`,
      currency(planned),
      currency(actual),
      currency(planned - actual),
      budget.status || 'Draft',
    ];
  });
  const totalPlanned = budgets.reduce((sum, budget) => sum + (Number(budget.planned) || 0), 0);
  const totalActual = budgets.reduce((sum, budget) => sum + (Number(budget.actual) || 0), 0);

  addHeader(doc, 'BUDGET VS ACTUAL REPORT', 'Budget performance and variance overview', [14, 165, 233]);
  addSummary(doc, [
    { label: 'Budgets', value: String(budgets.length), color: [14, 165, 233] },
    { label: 'Planned', value: currency(totalPlanned), color: [37, 99, 235] },
    { label: 'Actual', value: currency(totalActual), color: green },
  ], 44);

  autoTable(doc, {
    startY: 76,
    head: [['Budget', 'Analytic Account', 'Period', 'Planned', 'Actual', 'Variance', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 249, 255] },
    styles: { fontSize: 8 },
    columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
  });

  finish(doc, 'budget-vs-actual-report.pdf');
};
