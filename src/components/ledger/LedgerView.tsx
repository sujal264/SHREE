import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, exportToCSV, exportToExcel } from '../../utils/formatters';

export const LedgerView: React.FC = () => {
  const {
    ledgerEntries,
    activeFestival,
    openingBalance,
    currentBalance,
    totalDonations,
    totalExpenses,
  } = useFinance();
  const {
    t,
    language,
    formatDateLocal,
    getPaymentMethodLabel,
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Donation' | 'Expense' | 'Opening Balance'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter(entry => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = entry.description.toLowerCase().includes(q);
        const matchesPerson = entry.personOrVendor.toLowerCase().includes(q);
        const matchesMode = entry.paymentMethod?.toLowerCase().includes(q);
        if (!matchesDesc && !matchesPerson && !matchesMode) return false;
      }

      // Type Filter
      if (typeFilter !== 'ALL' && entry.type !== typeFilter) {
        return false;
      }

      // Date Range
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;

      return true;
    });
  }, [ledgerEntries, searchQuery, typeFilter, startDate, endDate]);

  const handleExportCSV = () => {
    const rows = filteredLedger.map(e => ({
      'Date': e.date,
      'Type': e.type === 'Donation' ? (language === 'mr' ? 'जमा (+)' : 'Donation (+)') : e.type === 'Expense' ? (language === 'mr' ? 'खर्च (-)' : 'Expense (-)') : (language === 'mr' ? 'सुरुवातीची शिल्लक' : 'Opening Balance'),
      'Description': e.description,
      'Person / Vendor': e.personOrVendor,
      'Payment Method': e.paymentMethod ? getPaymentMethodLabel(e.paymentMethod as any) : '-',
      'Flow & Amount': `${e.flow}₹${e.amount}`,
      'Running Balance': `₹${e.balanceAfter}`,
    }));
    exportToCSV(`${activeFestival?.name || 'Mandal'}_Ledger_${todayStr}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filteredLedger.map(e => ({
      'Date': e.date,
      'Type': e.type === 'Donation' ? (language === 'mr' ? 'जमा (+)' : 'Donation (+)') : e.type === 'Expense' ? (language === 'mr' ? 'खर्च (-)' : 'Expense (-)') : (language === 'mr' ? 'सुरुवातीची शिल्लक' : 'Opening Balance'),
      'Description': e.description,
      'Person / Vendor': e.personOrVendor,
      'Payment Method': e.paymentMethod ? getPaymentMethodLabel(e.paymentMethod as any) : '-',
      'Amount (₹)': e.type === 'Expense' ? -e.amount : e.amount,
      'Running Balance (₹)': e.balanceAfter,
    }));
    exportToExcel(`${activeFestival?.name || 'Mandal'}_Ledger_${todayStr}`, 'Ledger', rows);
  };

  return (
    <div id="ledger-view" className="space-y-5 font-['Mukta',sans-serif]">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              {t.ledger} ({t.ledgerSub})
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
              {language === 'mr' ? 'तारीखवार संपूर्ण हिशोब' : 'Running Balance'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {language === 'mr'
              ? 'प्रत्येक जमा व खर्चाच्या नोंदीनंतर शिल्लक रकमेचा अचूक हिशोब (Running Balance Ledger)'
              : 'Complete chronological audit log with automated balance calculation after each transaction'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.exportExcel}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t.exportCSV}</span>
          </button>
        </div>
      </div>

      {/* Summary Equation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-center">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-[11px] uppercase font-bold text-slate-500 block">
            {t.openingBalance}
          </span>
          <span className="text-base font-black text-slate-800">{formatINR(openingBalance)}</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-[11px] uppercase font-bold text-emerald-800 block">
            + {t.totalDonations}
          </span>
          <span className="text-base font-black text-emerald-700">+{formatINR(totalDonations)}</span>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
          <span className="text-[11px] uppercase font-bold text-rose-800 block">
            - {t.totalExpenses}
          </span>
          <span className="text-base font-black text-rose-700">-{formatINR(totalExpenses)}</span>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
          <span className="text-[11px] uppercase font-bold text-blue-800 block">
            = {t.currentBalance}
          </span>
          <span className="text-base font-black text-blue-900">{formatINR(currentBalance)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'mr' ? 'वर्णन, व्यक्ती, किंवा विक्रेत्याचे नाव शोधा...' : 'Search description, person, or vendor...'}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
            >
              <option value="ALL">{language === 'mr' ? 'सर्व नोंदी (All Transactions)' : 'All Transactions'}</option>
              <option value="Donation">{language === 'mr' ? 'केवळ जमा (+)' : 'Donations only (+)'}</option>
              <option value="Expense">{language === 'mr' ? 'केवळ खर्च (-)' : 'Expenses only (-)'}</option>
              <option value="Opening Balance">{t.openingBalance}</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              title={language === 'mr' ? 'आरंभ दिनांक' : 'Start Date'}
            />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              title={language === 'mr' ? 'अंतिम दिनांक' : 'End Date'}
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-black uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{t.date}</th>
                <th className="py-3.5 px-4">{t.type}</th>
                <th className="py-3.5 px-4">{t.description}</th>
                <th className="py-3.5 px-4">{language === 'mr' ? 'व्यक्ती / विक्रेता' : 'Person / Payee'}</th>
                <th className="py-3.5 px-4">{t.paymentMethod}</th>
                <th className="py-3.5 px-4 text-right">{t.amount}</th>
                <th className="py-3.5 px-4 text-right">{language === 'mr' ? 'हिशोबानंतर शिल्लक' : 'Running Balance'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length > 0 ? (
                filteredLedger.map((entry, idx) => {
                  const isDonation = entry.type === 'Donation';
                  const isExpense = entry.type === 'Expense';
                  const isOpening = entry.type === 'Opening Balance';

                  return (
                    <tr
                      key={entry.id || idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOpening ? 'bg-amber-50/40 font-bold' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {formatDateLocal(entry.date)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isDonation
                              ? 'bg-emerald-100 text-emerald-800'
                              : isExpense
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isDonation && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
                          {isExpense && <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                          {isOpening && <Wallet className="w-3 h-3 text-amber-600" />}
                          <span>
                            {isDonation
                              ? (language === 'mr' ? 'जमा (+)' : 'Income (+)')
                              : isExpense
                              ? (language === 'mr' ? 'खर्च (-)' : 'Expense (-)')
                              : t.openingBalance}
                          </span>
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {entry.description}
                      </td>

                      {/* Person/Vendor */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {entry.personOrVendor}
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {entry.paymentMethod ? getPaymentMethodLabel(entry.paymentMethod as any) : '-'}
                      </td>

                      {/* Amount In/Out */}
                      <td
                        className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${
                          isDonation
                            ? 'text-emerald-700'
                            : isExpense
                            ? 'text-rose-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {isExpense ? `-${formatINR(entry.amount)}` : `+${formatINR(entry.amount)}`}
                      </td>

                      {/* Balance After */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm whitespace-nowrap bg-slate-50/50">
                        {formatINR(entry.balanceAfter)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {language === 'mr' ? 'कोणतीही रोजकीर्द नोंद आढळली नाही.' : 'No ledger records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
