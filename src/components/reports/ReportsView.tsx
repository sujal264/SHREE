import React from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, exportToCSV, exportToExcel } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    activeFestival,
    openingBalance,
    totalDonations,
    totalExpenses,
    currentBalance,
    totalDonorsCount,
    totalExpensesCount,
    donations,
    expenses,
    categorySpendings,
  } = useFinance();

  const {
    t,
    language,
    formatDateLocal,
    getExpenseCategoryLabel,
  } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  // Vendor-wise breakdown
  const vendorBreakdown = React.useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      map.set(e.vendorPaid, (map.get(e.vendorPaid) || 0) + Number(e.amount));
    });
    return Array.from(map.entries())
      .map(([vendor, total]) => ({ vendor, total }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportSummaryExcel = () => {
    const summaryRows = [
      { 'Metric': t.mandalName, 'Value': activeFestival?.name || t.mandalName },
      { 'Metric': 'Organizer', 'Value': activeFestival?.organizer || t.organizerDefault },
      { 'Metric': 'Festival Year', 'Value': activeFestival?.year || 2026 },
      { 'Metric': 'Location', 'Value': activeFestival?.location || t.locationDefault },
      { 'Metric': `${t.openingBalance} (₹)`, 'Value': openingBalance },
      { 'Metric': `${t.totalDonations} (₹)`, 'Value': totalDonations },
      { 'Metric': `${t.totalExpenses} (₹)`, 'Value': totalExpenses },
      { 'Metric': `${t.currentBalance} (₹)`, 'Value': currentBalance },
      { 'Metric': 'Total Donors Count', 'Value': totalDonorsCount },
      { 'Metric': 'Total Expense Records Count', 'Value': totalExpensesCount },
    ];
    exportToExcel(`${activeFestival?.name || 'Mandal'}_Annual_Balance_Sheet`, 'Balance_Report', summaryRows);
  };

  const handleExportSummaryCSV = () => {
    const summaryRows = [
      { 'Metric': t.mandalName, 'Value': activeFestival?.name || t.mandalName },
      { 'Metric': 'Organizer', 'Value': activeFestival?.organizer || t.organizerDefault },
      { 'Metric': 'Festival Year', 'Value': activeFestival?.year || 2026 },
      { 'Metric': 'Location', 'Value': activeFestival?.location || t.locationDefault },
      { 'Metric': `${t.openingBalance} (₹)`, 'Value': openingBalance },
      { 'Metric': `${t.totalDonations} (₹)`, 'Value': totalDonations },
      { 'Metric': `${t.totalExpenses} (₹)`, 'Value': totalExpenses },
      { 'Metric': `${t.currentBalance} (₹)`, 'Value': currentBalance },
      { 'Metric': 'Total Donors Count', 'Value': totalDonorsCount },
      { 'Metric': 'Total Expense Records Count', 'Value': totalExpensesCount },
    ];
    exportToCSV(`${activeFestival?.name || 'Mandal'}_Annual_Balance_Sheet`, summaryRows);
  };

  return (
    <div id="reports-view" className="space-y-6 font-['Mukta',sans-serif]">
      {/* Header Controls (Hidden during print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              {t.reports} ({t.reportsSub})
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-full">
              {language === 'mr' ? 'अधिकृत विवरण पत्रक' : 'Official Statement'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {language === 'mr'
              ? 'मंडळाचे अधिकृत जमा-खर्च पत्रक व प्रिंट अहवाल'
              : 'Official annual financial balance sheet and audit report'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportSummaryExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.exportExcel}</span>
          </button>

          <button
            onClick={handleExportSummaryCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t.exportCSV}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'mr' ? 'अधिकृत अहवाल प्रिंट करा' : 'Print Official Report'}</span>
          </button>
        </div>
      </div>

      {/* Printable Formal Statement Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm print-break-inside-avoid space-y-6">
        {/* Mandal Header */}
        <div className="text-center pb-6 border-b border-amber-200">
          <div className="flex items-center justify-between text-xs font-black text-amber-950 mb-3 px-2">
            <span className="bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">Est: 1990</span>
            <span className="font-extrabold text-amber-900 text-sm">|| Om Sai Ram ||</span>
            <span className="bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">36th Year</span>
          </div>

          <div className="text-center my-2">
            <h2
              className="text-2xl md:text-3xl font-black text-red-700 font-['Mukta',sans-serif]"
              style={{ textShadow: '1px 1px 0px #fff, 2px 2px 0px #7f1d1d' }}
            >
              {activeFestival?.name || t.mandalName}
            </h2>
            <div className="inline-block mt-1 px-4 py-0.5 bg-red-900 text-amber-100 rounded-full text-xs font-black border border-amber-300">
              • || Sarvajanik Ganeshotsav || •
            </div>
            <p className="text-xs font-extrabold text-red-900 mt-1">
              • Courtesy: <span className="underline">Shree Sai Colony, Karvenagar, Pune</span> •
            </p>
          </div>

          <p className="text-xs text-slate-500 mt-2 font-medium">
            Festival Year: {activeFestival?.year || 2026} • Report Date: {formatDateLocal(todayStr)}
          </p>
        </div>

        {/* Balance Sheet Summary */}
        <div className="space-y-6">
          <h3 className="text-base font-black text-slate-900">
            {language === 'mr' ? 'वार्षिक जमा-खर्च अधिकृत ताळेबंद पत्रक (Balance Sheet)' : 'Official Financial Balance Sheet'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 uppercase font-bold block">
                {t.openingBalance}
              </span>
              <span className="text-xl font-black text-slate-800">{formatINR(openingBalance)}</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-700 uppercase font-bold block">
                + {t.totalDonations}
              </span>
              <span className="text-xl font-black text-emerald-700">+{formatINR(totalDonations)}</span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-xs text-rose-700 uppercase font-bold block">
                - {t.totalExpenses}
              </span>
              <span className="text-xl font-black text-rose-700">-{formatINR(totalExpenses)}</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-300">
              <span className="text-xs text-blue-700 uppercase font-bold block">
                = {t.currentBalance}
              </span>
              <span className="text-xl font-black text-blue-900">{formatINR(currentBalance)}</span>
            </div>
          </div>

          {/* Metrics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
              <h4 className="font-black text-slate-800 uppercase text-[11px] tracking-wider">
                {language === 'mr' ? 'जमा व वर्गणी तपशील' : 'Donations & Inflow Details'}
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">{language === 'mr' ? 'एकूण देणगीदार संख्या:' : 'Total Donors Count:'}</span>
                <span className="font-bold text-slate-900">{totalDonorsCount} {language === 'mr' ? 'देणगीदार' : 'Donors'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">{language === 'mr' ? 'सरासरी देणगी रक्कम:' : 'Average Donation:'}</span>
                <span className="font-bold text-slate-900">
                  {totalDonorsCount > 0 ? formatINR(totalDonations / totalDonorsCount) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">{language === 'mr' ? 'अधिकृत पावत्या संख्या:' : 'Issued Receipts Count:'}</span>
                <span className="font-bold text-emerald-700">
                  {donations.filter(d => d.status === 'Received').length} {language === 'mr' ? 'पावत्या' : 'Receipts'}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
              <h4 className="font-black text-slate-800 uppercase text-[11px] tracking-wider">
                {language === 'mr' ? 'खर्च तपशील' : 'Expenditure Summary'}
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">{language === 'mr' ? 'एकूण खर्च नोंदी व बिले:' : 'Total Expense Invoices:'}</span>
                <span className="font-bold text-slate-900">{totalExpensesCount} {language === 'mr' ? 'बिले' : 'Invoices'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600 font-medium">{language === 'mr' ? 'सर्वात मोठा खर्च विभाग:' : 'Highest Expense Head:'}</span>
                <span className="font-bold text-slate-900">
                  {categorySpendings.sort((a, b) => b.spent - a.spent)[0]?.category
                    ? getExpenseCategoryLabel(categorySpendings.sort((a, b) => b.spent - a.spent)[0].category)
                    : '-'}{' '}
                  ({formatINR(categorySpendings.sort((a, b) => b.spent - a.spent)[0]?.spent || 0)})
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600 font-medium">{language === 'mr' ? 'एकूण विक्रेते / व्यावसायिक:' : 'Total Payees / Vendors:'}</span>
                <span className="font-bold text-slate-900">{vendorBreakdown.length} {language === 'mr' ? 'विक्रेते' : 'Vendors'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Sign-off Box */}
        <div className="mt-8 pt-8 border-t border-slate-300">
          <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-600">
            <div className="space-y-8">
              <div className="border-b border-slate-400 mx-auto w-32 pb-6" />
              <div>
                <p className="font-black text-slate-900">{t.presidentSign}</p>
                <p className="text-[10px] text-slate-500 font-medium">{activeFestival?.name || t.mandalName}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-slate-400 mx-auto w-32 pb-6" />
              <div>
                <p className="font-black text-slate-900">{t.treasurerSign}</p>
                <p className="text-[10px] text-slate-500 font-medium">{language === 'mr' ? 'हिशोब व वित्त विभाग' : 'Accounts & Finance'}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-b border-slate-400 mx-auto w-32 pb-6" />
              <div>
                <p className="font-black text-slate-900">{t.secretarySign}</p>
                <p className="text-[10px] text-slate-500 font-medium">{language === 'mr' ? 'दिनांक:' : 'Date:'} {formatDateLocal(todayStr)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
