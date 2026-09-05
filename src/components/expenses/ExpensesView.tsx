import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Eye,
  X,
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, getCategoryBadgeColor, exportToCSV, exportToExcel } from '../../utils/formatters';

interface ExpensesViewProps {
  onOpenExpenseModal: (expense?: Expense) => void;
}

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Decoration',
  'Idol',
  'Lighting',
  'Sound System',
  'Stage',
  'Flowers',
  'Prasad/Food',
  'Pooja Materials',
  'Advertising',
  'Printing',
  'Electricity',
  'Transportation',
  'Security',
  'Cleaning',
  'Cultural Events',
  'Charity',
  'Miscellaneous',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ onOpenExpenseModal }) => {
  const { expenses, deleteExpense, activeFestival } = useFinance();
  const { canEdit } = useAuth();
  const {
    t,
    language,
    formatDateLocal,
    getExpenseCategoryLabel,
    getPaymentMethodLabel,
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [selectedExpenseForDelete, setSelectedExpenseForDelete] = useState<Expense | null>(null);
  const [previewReceiptFile, setPreviewReceiptFile] = useState<{ url: string; name: string } | null>(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = e.title.toLowerCase().includes(query);
          const matchesVendor = e.vendorPaid.toLowerCase().includes(query);
          const matchesBill = e.billNumber?.toLowerCase().includes(query);
          const matchesNotes = e.notes?.toLowerCase().includes(query);
          if (!matchesTitle && !matchesVendor && !matchesBill && !matchesNotes) {
            return false;
          }
        }

        // Category
        if (categoryFilter !== 'ALL' && e.category !== categoryFilter) {
          return false;
        }

        // Payment
        if (paymentFilter !== 'ALL' && e.paymentMethod !== paymentFilter) {
          return false;
        }

        // Date
        if (dateFilter === 'TODAY') {
          if (e.date !== todayStr) return false;
        } else if (dateFilter === 'WEEK') {
          const eDate = new Date(e.date);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (eDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'MONTH') {
          const eDate = new Date(e.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (eDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (startDate && e.date < startDate) return false;
          if (endDate && e.date > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, searchQuery, categoryFilter, paymentFilter, dateFilter, startDate, endDate, sortBy, todayStr]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleExportCSV = () => {
    const rows = filteredExpenses.map(e => ({
      'Title': e.title,
      'Category': getExpenseCategoryLabel(e.category),
      'Amount (₹)': e.amount,
      'Date': e.date,
      'Paid To / Vendor': e.vendorPaid,
      'Payment Method': getPaymentMethodLabel(e.paymentMethod),
      'Bill / Voucher No': e.billNumber || '',
      'Notes': e.notes || '',
    }));
    exportToCSV(`${activeFestival?.name || 'Mandal'}_Expenses_${todayStr}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filteredExpenses.map(e => ({
      'Title': e.title,
      'Category': getExpenseCategoryLabel(e.category),
      'Amount (₹)': e.amount,
      'Date': e.date,
      'Paid To / Vendor': e.vendorPaid,
      'Payment Method': getPaymentMethodLabel(e.paymentMethod),
      'Bill / Voucher No': e.billNumber || '',
      'Notes': e.notes || '',
    }));
    exportToExcel(`${activeFestival?.name || 'Mandal'}_Expenses_${todayStr}`, 'Expenses', rows);
  };

  const confirmDelete = () => {
    if (selectedExpenseForDelete) {
      deleteExpense(selectedExpenseForDelete.id);
      setSelectedExpenseForDelete(null);
    }
  };

  return (
    <div id="expenses-view" className="space-y-5">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs font-['Mukta',sans-serif]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              {t.expenses} ({t.expensesSub})
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 rounded-full">
              {filteredExpenses.length} {language === 'mr' ? 'नोंदी' : 'Entries'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {language === 'mr'
              ? 'मंडप, रोषणाई, प्रसाद, मूर्ती व सर्व साहित्य खर्चाची बिले व हिशोब नोंदवा'
              : 'Log decoration, sound, prasad, lighting & logistics invoices and cash vouchers'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
            title="Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-rose-600" />
            <span>{t.exportExcel}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t.exportCSV}</span>
          </button>

          {canEdit && (
            <button
              id="add-expense-btn"
              onClick={() => onOpenExpenseModal()}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ {t.expenseEntryBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 font-['Mukta',sans-serif]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'mr' ? 'खर्च नाव, दुकानदार, बिल क्र. शोधा...' : 'Search expense, vendor, bill #...'}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-700"
            >
              <option value="ALL">{t.allCategories}</option>
              {ALL_EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {getExpenseCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="md:col-span-2">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-700"
            >
              <option value="ALL">{language === 'mr' ? 'सर्व दिनांक (All Dates)' : 'All Dates'}</option>
              <option value="TODAY">{language === 'mr' ? 'आजचा खर्च (Today)' : 'Today'}</option>
              <option value="WEEK">{language === 'mr' ? 'मागील ७ दिवस (Last 7 Days)' : 'Last 7 Days'}</option>
              <option value="MONTH">{language === 'mr' ? 'मागील ३० दिवस (Last 30 Days)' : 'Last 30 Days'}</option>
              <option value="CUSTOM">{language === 'mr' ? 'विशिष्ट कालावधी (Custom)...' : 'Custom Range...'}</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="md:col-span-2">
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-700"
            >
              <option value="ALL">{t.allPaymentMethods}</option>
              <option value="Cash">{t.cash}</option>
              <option value="UPI">{t.upi}</option>
              <option value="Bank Transfer">{t.bankTransfer}</option>
              <option value="Cheque">{t.cheque}</option>
              <option value="Other">{t.other}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-1">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-700"
              title="Sort"
            >
              <option value="date-desc">{language === 'mr' ? 'नवीनतम' : 'Newest'}</option>
              <option value="date-asc">{language === 'mr' ? 'जुने' : 'Oldest'}</option>
              <option value="amount-desc">{language === 'mr' ? 'जास्त ₹' : 'High ₹'}</option>
              <option value="amount-asc">{language === 'mr' ? 'कमी ₹' : 'Low ₹'}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers if active */}
        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-3 p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-xs">
            <span className="font-bold text-rose-900">{language === 'mr' ? 'पासून:' : 'From:'}</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg"
            />
            <span className="font-bold text-rose-900">{language === 'mr' ? 'पर्यंत:' : 'To:'}</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg"
            />
          </div>
        )}

        {/* Filter Summary Pill */}
        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 font-medium">
          <span>
            {language === 'mr' ? 'एकूण नोंदी:' : 'Total Records:'} <strong>{filteredExpenses.length}</strong> •{' '}
            {language === 'mr' ? 'एकूण झालेला खर्च:' : 'Total Expenses:'}{' '}
            <strong className="text-rose-700 font-black">{formatINR(filteredTotal)}</strong>
          </span>
          {(searchQuery || categoryFilter !== 'ALL' || paymentFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setPaymentFilter('ALL');
                setDateFilter('ALL');
              }}
              className="text-rose-700 hover:text-rose-800 font-bold underline"
            >
              {language === 'mr' ? 'फिल्टर साफ करा (Reset)' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Expenses Data Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: High-contrast touch-friendly Cards (Hidden on md+) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map(e => {
              const badge = getCategoryBadgeColor(e.category);
              return (
                <div key={`mobile-${e.id}`} className="p-4 space-y-2.5 hover:bg-rose-50/20 transition-colors">
                  {/* Header: Date & Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {formatDateLocal(e.date)}
                    </span>
                    <span className="font-black text-rose-700 text-base">
                      -{formatINR(e.amount)}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{e.title}</h3>
                    {e.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">"{e.notes}"</p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 font-bold rounded-md text-[10px] ${badge.bg} ${badge.text} ${badge.border}`}>
                        {getExpenseCategoryLabel(e.category)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {getPaymentMethodLabel(e.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div>
                      {e.receiptFileUrl ? (
                        <button
                          onClick={() =>
                            setPreviewReceiptFile({
                              url: e.receiptFileUrl!,
                              name: e.receiptFileName || e.title,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'बिल पहा' : 'View Bill'}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">बिल जोडलेले नाही</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => onOpenExpenseModal(e)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title={t.edit}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedExpenseForDelete(e)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-bold">
                {language === 'mr' ? 'या निकषाशी जुळणारा खर्च आढळला नाही.' : 'No expenses found for this filter.'}
              </p>
            </div>
          )}
        </div>

        {/* Desktop View: Full Table (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-['Mukta',sans-serif]">
            <thead className="bg-slate-50/90 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.expenseTitle}</th>
                <th className="py-3.5 px-4">{t.category}</th>
                <th className="py-3.5 px-4">{t.date}</th>
                <th className="py-3.5 px-4 text-right">{t.amount}</th>
                <th className="py-3.5 px-4 text-center">{language === 'mr' ? 'बिल' : 'Invoice'}</th>
                <th className="py-3.5 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map(e => {
                  const badge = getCategoryBadgeColor(e.category);
                  return (
                    <tr key={e.id} className="hover:bg-rose-50/30 transition-colors">
                      {/* Title & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{e.title}</div>
                        {e.notes && (
                          <p className="text-[11px] text-slate-500 italic truncate max-w-xs mt-0.5 font-medium">
                            "{e.notes}"
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 font-bold rounded-lg border text-[11px] ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {getExpenseCategoryLabel(e.category)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                        {formatDateLocal(e.date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-rose-700 text-sm whitespace-nowrap">
                        -{formatINR(e.amount)}
                      </td>

                      {/* Receipt File */}
                      <td className="py-3.5 px-4 text-center">
                        {e.receiptFileUrl ? (
                          <button
                            onClick={() =>
                              setPreviewReceiptFile({
                                url: e.receiptFileUrl!,
                                name: e.receiptFileName || e.title,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                            title="Preview Attachment"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'mr' ? 'बिल पहा' : 'View Bill'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEdit ? (
                            <>
                              <button
                                onClick={() => onOpenExpenseModal(e)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title={t.edit}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setSelectedExpenseForDelete(e)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title={t.delete}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-semibold px-2">
                              {language === 'mr' ? 'केवळ वाचक' : 'Read-only'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">
                      {language === 'mr' ? 'कोणताही खर्च आढळला नाही.' : 'No expenses recorded.'}
                    </p>
                    <p className="text-xs mt-1 font-medium">
                      {language === 'mr' ? 'नवीन खर्च नोंदवण्यासाठी "+ नवीन खर्च नोंदवा" वर क्लिक करा.' : 'Click "+ Add Expense" to record a new expenditure.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Attachment Preview Modal */}
      {previewReceiptFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Mukta',sans-serif]">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">{previewReceiptFile.name}</h3>
              <button
                onClick={() => setPreviewReceiptFile(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-auto flex items-center justify-center bg-slate-50 p-2 rounded-xl">
              {previewReceiptFile.url.startsWith('data:image') ? (
                <img
                  src={previewReceiptFile.url}
                  alt="Bill Voucher"
                  className="max-h-80 w-auto rounded object-contain"
                />
              ) : (
                <iframe
                  src={previewReceiptFile.url}
                  title="Document Preview"
                  className="w-full h-80 rounded"
                />
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewReceiptFile(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedExpenseForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-['Mukta',sans-serif]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {language === 'mr' ? 'खर्च नोंद हटवण्याची खात्री करा' : 'Confirm Delete Expense'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === 'mr' ? (
                <>
                  तुम्हाला खात्री आहे का की आपण{' '}
                  <strong className="text-slate-900">"{selectedExpenseForDelete.title}"</strong> खर्चाची{' '}
                  <strong className="text-slate-900">{formatINR(selectedExpenseForDelete.amount)}</strong> ची नोंद हटवू इच्छिता?
                  यामुळे मंडळ शिल्लक रक्कम आपोआप पूर्ववत वाढेल.
                </>
              ) : (
                <>
                  Are you sure you want to delete expense{' '}
                  <strong className="text-slate-900">"{selectedExpenseForDelete.title}"</strong> for{' '}
                  <strong className="text-slate-900">{formatINR(selectedExpenseForDelete.amount)}</strong>?
                  This will restore the amount to the available balance.
                </>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedExpenseForDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                {t.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
