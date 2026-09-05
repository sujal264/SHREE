import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  Receipt,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Phone,
  AlertCircle,
  X,
} from 'lucide-react';
import { Donation, DonationStatus } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR, exportToCSV, exportToExcel, getTodayDateString } from '../../utils/formatters';

interface DonationsViewProps {
  onOpenDonationModal: (donation?: Donation) => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({ onOpenDonationModal }) => {
  const { donations, deleteDonation, updateDonationStatus, openReceiptModal, activeFestival } = useFinance();
  const { canEdit } = useAuth();
  const {
    t,
    language,
    formatDateLocal,
    getPaymentMethodLabel,
    getDonationCategoryLabel,
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'receipt-asc' | 'receipt-desc' | 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('receipt-asc');
  const [selectedDonationForDelete, setSelectedDonationForDelete] = useState<Donation | null>(null);
  const [statusConfirmState, setStatusConfirmState] = useState<{
    donation: Donation;
    targetStatus: DonationStatus;
    receivedDate: string;
  } | null>(null);

  const now = new Date();
  const todayStr = getTodayDateString();

  const filteredDonations = useMemo(() => {
    return donations
      .filter(d => {
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = d.donorName.toLowerCase().includes(query);
          const matchesPhone = d.mobileNumber?.toLowerCase().includes(query);
          const matchesReceipt = d.receiptNumber.toLowerCase().includes(query);
          const matchesRef = d.transactionRef?.toLowerCase().includes(query);
          const matchesNotes = d.notes?.toLowerCase().includes(query);
          if (!matchesName && !matchesPhone && !matchesReceipt && !matchesRef && !matchesNotes) {
            return false;
          }
        }

        // Status
        if (statusFilter !== 'ALL' && d.status !== statusFilter) {
          return false;
        }

        // Payment method
        if (paymentFilter !== 'ALL' && d.paymentMethod !== paymentFilter) {
          return false;
        }

        // Category
        if (categoryFilter !== 'ALL' && d.category !== categoryFilter) {
          return false;
        }

        // Date Range
        if (dateFilter === 'TODAY') {
          if (d.date !== todayStr) return false;
        } else if (dateFilter === 'WEEK') {
          const dDate = new Date(d.date);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (dDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'MONTH') {
          const dDate = new Date(d.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          if (dDate < thirtyDaysAgo) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (startDate && d.date < startDate) return false;
          if (endDate && d.date > endDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'receipt-asc') {
          return (parseInt(a.receiptNumber, 10) || 0) - (parseInt(b.receiptNumber, 10) || 0);
        }
        if (sortBy === 'receipt-desc') {
          return (parseInt(b.receiptNumber, 10) || 0) - (parseInt(a.receiptNumber, 10) || 0);
        }
        if (sortBy === 'date-desc') {
          const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (diff !== 0) return diff;
          return (parseInt(b.receiptNumber, 10) || 0) - (parseInt(a.receiptNumber, 10) || 0);
        }
        if (sortBy === 'date-asc') {
          const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (diff !== 0) return diff;
          return (parseInt(a.receiptNumber, 10) || 0) - (parseInt(b.receiptNumber, 10) || 0);
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [donations, searchQuery, statusFilter, paymentFilter, categoryFilter, dateFilter, startDate, endDate, sortBy, todayStr]);

  const filteredTotal = useMemo(() => {
    return filteredDonations
      .filter(d => d.status === 'Received')
      .reduce((sum, d) => sum + d.amount, 0);
  }, [filteredDonations]);

  const handleExportCSV = () => {
    const rows = filteredDonations.map(d => ({
      'Receipt No': d.receiptNumber,
      'Donor Name': d.donorName,
      'Mobile': d.mobileNumber || '',
      'Amount (₹)': d.amount,
      'Payment Method': getPaymentMethodLabel(d.paymentMethod),
      'Date': d.date,
      'Received Date': d.status === 'Received' ? (d.receivedDate || d.date) : '—',
      'Category': getDonationCategoryLabel(d.category),
      'Status': d.status === 'Received' ? t.statusReceived : d.status === 'Pending' ? t.statusPending : t.statusCancelled,
      'Ref No': d.transactionRef || '',
      'Notes': d.notes || '',
    }));
    exportToCSV(`${activeFestival?.name || 'Mandal'}_Donations_${todayStr}`, rows);
  };

  const handleExportExcel = () => {
    const rows = filteredDonations.map(d => ({
      'Receipt No': d.receiptNumber,
      'Donor Name': d.donorName,
      'Mobile': d.mobileNumber || '',
      'Amount (₹)': d.amount,
      'Payment Method': getPaymentMethodLabel(d.paymentMethod),
      'Date': d.date,
      'Received Date': d.status === 'Received' ? (d.receivedDate || d.date) : '—',
      'Category': getDonationCategoryLabel(d.category),
      'Status': d.status === 'Received' ? t.statusReceived : d.status === 'Pending' ? t.statusPending : t.statusCancelled,
      'Ref No': d.transactionRef || '',
      'Notes': d.notes || '',
    }));
    exportToExcel(`${activeFestival?.name || 'Mandal'}_Donations_${todayStr}`, 'Donations', rows);
  };

  const confirmDelete = () => {
    if (selectedDonationForDelete) {
      deleteDonation(selectedDonationForDelete.id);
      setSelectedDonationForDelete(null);
    }
  };

  return (
    <div id="donations-view" className="space-y-5">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 font-['Mukta',sans-serif]">
              {t.donations} ({t.donationsSub})
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full">
              {filteredDonations.length} {language === 'mr' ? 'पावत्या' : 'Receipts'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium font-['Mukta',sans-serif]">
            {language === 'mr'
              ? 'वर्गणीदारांची नोंद करा, त्वरित पावती प्रिंट करा व व्हॉट्सॲपवर पाठवा'
              : 'Record donor contributions, instant receipt print & WhatsApp sharing'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors font-['Mukta',sans-serif]"
            title="Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.exportExcel}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-['Mukta',sans-serif]"
            title="CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{t.exportCSV}</span>
          </button>

          {canEdit && (
            <button
              id="add-donation-btn"
              onClick={() => onOpenDonationModal()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 transition-all font-['Mukta',sans-serif] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ {t.donationReceiptBtn}</span>
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
              placeholder={language === 'mr' ? 'नाव, पावती क्र., मोबाईल शोधा...' : 'Search by name, receipt, mobile...'}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
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

          {/* Date Filter */}
          <div className="md:col-span-3">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
            >
              <option value="ALL">{language === 'mr' ? 'सर्व दिनांक (All Dates)' : 'All Dates'}</option>
              <option value="TODAY">{language === 'mr' ? 'आजची जमा (Today)' : 'Today'}</option>
              <option value="WEEK">{language === 'mr' ? 'मागील ७ दिवस (Last 7 Days)' : 'Last 7 Days'}</option>
              <option value="MONTH">{language === 'mr' ? 'मागील ३० दिवस (Last 30 Days)' : 'Last 30 Days'}</option>
              <option value="CUSTOM">{language === 'mr' ? 'विशिष्ट कालावधी (Custom Range)...' : 'Custom Date Range...'}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
            >
              <option value="ALL">{language === 'mr' ? 'सर्व वर्गवारी (All Categories)' : 'All Categories'}</option>
              <option value="General">{language === 'mr' ? 'सर्वसाधारण (General)' : 'General'}</option>
              <option value="Other">{language === 'mr' ? 'इतर (Other)' : 'Other'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="Received">{t.statusReceived}</option>
              <option value="Pending">{t.statusPending}</option>
              <option value="Cancelled">{t.statusCancelled}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-1">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-2 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
              title="Sort"
            >
              <option value="receipt-asc">{language === 'mr' ? 'पावती क्र. (लहान ते मोठा)' : 'Receipt # (401 → 429)'}</option>
              <option value="receipt-desc">{language === 'mr' ? 'पावती क्र. (मोठा ते लहान)' : 'Receipt # (429 → 401)'}</option>
              <option value="date-desc">{language === 'mr' ? 'नवीनतम' : 'Newest'}</option>
              <option value="date-asc">{language === 'mr' ? 'जुने' : 'Oldest'}</option>
              <option value="amount-desc">{language === 'mr' ? 'जास्त ₹' : 'High ₹'}</option>
              <option value="amount-asc">{language === 'mr' ? 'कमी ₹' : 'Low ₹'}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers if active */}
        {dateFilter === 'CUSTOM' && (
          <div className="flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs">
            <span className="font-bold text-amber-900">{language === 'mr' ? 'पासून:' : 'From:'}</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg"
            />
            <span className="font-bold text-amber-900">{language === 'mr' ? 'पर्यंत:' : 'To:'}</span>
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
            {language === 'mr' ? 'एकूण नोंदी:' : 'Total Records:'} <strong>{filteredDonations.length}</strong> •{' '}
            {language === 'mr' ? 'एकूण जमा रक्कम:' : 'Total Received:'}{' '}
            <strong className="text-emerald-700 font-black">{formatINR(filteredTotal)}</strong>
          </span>
          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || dateFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setDateFilter('ALL');
              }}
              className="text-amber-700 hover:text-amber-800 font-bold underline"
            >
              {language === 'mr' ? 'फिल्टर साफ करा (Reset)' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Donations Data Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Mobile View: High-contrast touch-friendly Cards (Hidden on md+) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredDonations.length > 0 ? (
            filteredDonations.map(d => (
              <div key={`mobile-${d.id}`} className="p-4 space-y-2.5 hover:bg-amber-50/20 transition-colors">
                {/* Header: Receipt # & Amount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md text-xs border border-amber-300/80">
                      #{d.receiptNumber}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {formatDateLocal(d.date)}
                    </span>
                  </div>
                  <span className="font-black text-emerald-700 text-base">
                    +{formatINR(d.amount)}
                  </span>
                </div>

                {/* Donor Name & Category */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{d.donorName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {d.category === 'Other' ? (language === 'mr' ? 'इतर' : 'Other') : (language === 'mr' ? 'सर्वसाधारण' : 'General')}
                      </span>
                      {d.status === 'Received' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          ✓ {language === 'mr' ? 'जमा' : 'Received'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          ⏳ {language === 'mr' ? 'प्रलंबित' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Action Buttons Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    onClick={() => openReceiptModal(d)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-700" />
                    <span>{language === 'mr' ? 'पावती पहा / शेअर' : 'Receipt / Share'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <select
                      id={`mobile-status-select-${d.receiptNumber}`}
                      value={d.status}
                      onChange={e => {
                        const newStatus = e.target.value as DonationStatus;
                        if (newStatus === d.status) return;
                        setStatusConfirmState({
                          donation: d,
                          targetStatus: newStatus,
                          receivedDate: d.receivedDate || getTodayDateString(),
                        });
                      }}
                      className="text-[11px] font-bold rounded-lg px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700"
                    >
                      <option value="Pending">⏳ {t.statusPending}</option>
                      <option value="Received">✓ {t.statusReceived}</option>
                      <option value="Cancelled">✕ {t.statusCancelled}</option>
                    </select>

                    {canEdit && (
                      <>
                        <button
                          onClick={() => onOpenDonationModal(d)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                          title={t.edit}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedDonationForDelete(d)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-bold">
                {language === 'mr' ? 'या निकषाशी जुळणारी जमा पावती आढळली नाही.' : 'No donation receipts found for this filter.'}
              </p>
            </div>
          )}
        </div>

        {/* Desktop View: Full Table (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs font-['Mukta',sans-serif]">
            <thead className="bg-slate-50/90 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.receiptNumber}</th>
                <th className="py-3.5 px-4">{t.donorName}</th>
                <th className="py-3.5 px-4">{t.category}</th>
                <th className="py-3.5 px-4">{t.date}</th>
                <th className="py-3.5 px-4">{language === 'mr' ? 'जमा दिनांक' : 'Received Date'}</th>
                <th className="py-3.5 px-4 text-right">{t.amount}</th>
                <th className="py-3.5 px-4 text-center">{t.status}</th>
                <th className="py-3.5 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length > 0 ? (
                filteredDonations.map(d => (
                  <tr key={d.id} className="hover:bg-amber-50/40 transition-colors">
                    {/* Receipt No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                      {d.receiptNumber}
                    </td>

                    {/* Donor Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{d.donorName}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 font-bold bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-[11px]">
                        {d.category === 'Other' ? (language === 'mr' ? 'इतर (Other)' : 'Other') : (language === 'mr' ? 'सर्वसाधारण (General)' : 'General')}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {formatDateLocal(d.date)}
                    </td>

                    {/* Received Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {d.status === 'Received' ? (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{formatDateLocal(d.receivedDate || d.date)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs pl-2" title="Pending - Not yet received">—</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                      +{formatINR(d.amount)}
                    </td>

                    {/* Status (Interactive Switcher with Confirmation) */}
                    <td className="py-3.5 px-4 text-center">
                      <select
                        id={`donation-status-select-${d.receiptNumber}`}
                        value={d.status}
                        onChange={e => {
                          const newStatus = e.target.value as DonationStatus;
                          if (newStatus === d.status) return;
                          setStatusConfirmState({
                            donation: d,
                            targetStatus: newStatus,
                            receivedDate: d.receivedDate || getTodayDateString(),
                          });
                        }}
                        className={`text-[11px] font-black rounded-xl px-2.5 py-1 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                          d.status === 'Received'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                            : d.status === 'Pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                        }`}
                        title={language === 'mr' ? 'स्थिती बदला' : 'Change status'}
                      >
                        <option value="Pending">⏳ {t.statusPending}</option>
                        <option value="Received">✓ {t.statusReceived}</option>
                        <option value="Cancelled">✕ {t.statusCancelled}</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReceiptModal(d)}
                          className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title={language === 'mr' ? 'पावती पहा / प्रिंट करा' : 'View / Print Receipt'}
                        >
                          <Receipt className="w-4 h-4" />
                        </button>

                        {canEdit && (
                          <>
                            <button
                              onClick={() => onOpenDonationModal(d)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title={t.edit}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setSelectedDonationForDelete(d)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title={t.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold">
                      {language === 'mr' ? 'या निकषाशी जुळणारी जमा पावती आढळली नाही.' : 'No donation receipts found for this filter.'}
                    </p>
                    <p className="text-xs mt-1 font-medium">
                      {language === 'mr' ? 'कृपया नवीन पावती नोंदवा किंवा फिल्टर तपासा.' : 'Please add a new receipt or reset filters.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {selectedDonationForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-['Mukta',sans-serif]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              {language === 'mr' ? 'जमा पावती हटवण्याची खात्री करा' : 'Confirm Delete Receipt'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === 'mr' ? (
                <>
                  तुम्हाला खात्री आहे का की आपण{' '}
                  <strong className="text-slate-900">{selectedDonationForDelete.donorName}</strong> यांची{' '}
                  <strong className="text-slate-900">{formatINR(selectedDonationForDelete.amount)}</strong> ची पावती क्र.{' '}
                  <strong className="text-slate-900">{selectedDonationForDelete.receiptNumber}</strong> कायमची हटवू इच्छिता?
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete receipt #{' '}
                  <strong className="text-slate-900">{selectedDonationForDelete.receiptNumber}</strong> for{' '}
                  <strong className="text-slate-900">{selectedDonationForDelete.donorName}</strong> ({formatINR(selectedDonationForDelete.amount)})?
                </>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDonationForDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer"
              >
                {t.deleteConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Popup */}
      {statusConfirmState && (
        <div
          id="status-change-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-['Mukta',sans-serif]"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-amber-600">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === 'mr' ? 'स्थिती बदलण्याची खात्री करा' : 'Confirm Status Change'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {language === 'mr' ? 'चुकून स्थिती बदलू नये म्हणून पुष्टीकरण' : 'Confirmation required before updating status'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">{t.receiptNumber}:</span>
                <span className="font-mono font-black text-amber-950">#{statusConfirmState.donation.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">{t.donorName}:</span>
                <span className="font-bold text-slate-900">{statusConfirmState.donation.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">{t.amount}:</span>
                <span className="font-black text-emerald-700">{formatINR(statusConfirmState.donation.amount)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-bold">Status Change:</span>
                <div className="flex items-center gap-2 font-black">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                    statusConfirmState.donation.status === 'Received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {statusConfirmState.donation.status}
                  </span>
                  <span className="text-slate-400">➔</span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                    statusConfirmState.targetStatus === 'Received' ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500' : 'bg-amber-100 text-amber-900 ring-2 ring-amber-500'
                  }`}>
                    {statusConfirmState.targetStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Received Date Input when changing to Received */}
            {statusConfirmState.targetStatus === 'Received' && (
              <div className="space-y-1.5 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                  {language === 'mr' ? 'रक्कम जमा झालेली तारीख (Received Date)' : 'Received Date'} *
                </label>
                <input
                  id="confirm-received-date-input"
                  type="date"
                  value={statusConfirmState.receivedDate}
                  onChange={e => setStatusConfirmState({ ...statusConfirmState, receivedDate: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg font-bold text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-emerald-800 font-medium">
                  {language === 'mr' ? 'आजची तारीख आपोआप भरली आहे' : 'Real-time current date fetched automatically'}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-700 font-black">
              {language === 'mr'
                ? 'तुम्हाला खात्री आहे का की आपण ही स्थिती बदलू इच्छिता?'
                : 'Are you sure you want to change the status?'}
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                id="cancel-status-change-btn"
                type="button"
                onClick={() => setStatusConfirmState(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                id="confirm-status-change-btn"
                type="button"
                onClick={() => {
                  const { donation, targetStatus, receivedDate } = statusConfirmState;
                  const finalDate = targetStatus === 'Received' ? (receivedDate || getTodayDateString()) : '';
                  updateDonationStatus(donation.id, targetStatus, finalDate);
                  setStatusConfirmState(null);
                }}
                className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {language === 'mr' ? 'होय, स्थिती बदला' : 'Yes, Change Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
