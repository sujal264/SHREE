import React from 'react';
import { motion } from 'motion/react';
import {
  Receipt,
  ChevronRight,
  AlertOctagon,
  FileText,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, getCategoryBadgeColor } from '../../utils/formatters';
import { MandalBanner } from '../common/MandalBanner';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenDonationModal: () => void;
  onOpenExpenseModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenDonationModal,
  onOpenExpenseModal,
}) => {
  const { canEdit } = useAuth();
  const {
    activeFestival,
    openingBalance,
    totalDonations,
    totalExpenses,
    currentBalance,
    pendingDonationsAmount,
    pendingDonationsCount,
    totalExpensesCount,
    isBudgetExceeded,
    deficitAmount,
    donations,
    expenses,
    openReceiptModal,
  } = useFinance();

  const {
    t,
    language,
    formatDateLocal,
    getPaymentMethodLabel,
    getDonationCategoryLabel,
    getExpenseCategoryLabel,
  } = useLanguage();

  const recentDonations = donations.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const confirmedDonationsCount = donations.filter(d => d.status === 'Received').length;

  // Calculate festival year number (Est 1990 -> 2026 is 36th year)
  const festivalYearNumber = 36;

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Banner: Authentic Mandal Banner with Shivaji Maharaj, Sai Baba, Est 1990 & 36th Year */}
      <MandalBanner
        showActions={canEdit}
        onOpenDonation={canEdit ? onOpenDonationModal : undefined}
        onOpenExpense={canEdit ? onOpenExpenseModal : undefined}
        festivalYearNumber={festivalYearNumber}
      />

      {/* Critical Warnings / Alert Banners */}
      {isBudgetExceeded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-rose-50 border-2 border-rose-500/80 rounded-2xl text-rose-900 shadow-sm"
        >
          <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0" />
          <div className="flex-1 text-sm">
            <strong className="font-bold">
              {language === 'mr'
                ? `🔴 मंडळ खर्च शिल्लक रकमेपेक्षा जास्त झाला आहे (${formatINR(deficitAmount)} तूट)!`
                : `🔴 Mandal expenses exceed available funds (${formatINR(deficitAmount)} deficit)!`}
            </strong>
            <p className="text-xs text-rose-700 mt-0.5 font-medium">
              {language === 'mr'
                ? 'एकूण खर्च उपलब्ध शिल्लक व जमा रकमेपेक्षा जास्त झाला आहे. कृपया खर्चाची नोंद तपासा.'
                : 'Total expenses have exceeded opening balance and collections. Please review entries.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('expenses')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            {t.expenses}
          </button>
        </motion.div>
      )}



      {/* Financial Equation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-xs">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
          <span className="font-['Mukta',sans-serif]">{t.balanceCalculationFormula}</span>
          <span className="text-[11px] text-slate-500 font-medium">
            {language === 'mr' ? 'स्वयंचलित थेट हिशोब' : 'Automated live calculation'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 uppercase block font-['Mukta',sans-serif]">
              {t.openingBalance}
            </span>
            <span className="text-lg md:text-xl font-black text-slate-800 font-['Mukta',sans-serif]">
              {formatINR(openingBalance)}
            </span>
          </div>

          <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block font-['Mukta',sans-serif]">
              + {t.totalDonations}
            </span>
            <span className="text-lg md:text-xl font-black text-emerald-700 font-['Mukta',sans-serif]">
              {formatINR(totalDonations)}
            </span>
          </div>

          <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 uppercase block font-['Mukta',sans-serif]">
              - {t.totalExpenses}
            </span>
            <span className="text-lg md:text-xl font-black text-rose-700 font-['Mukta',sans-serif]">
              {formatINR(totalExpenses)}
            </span>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              currentBalance >= 0
                ? 'bg-blue-50/90 border-blue-300 text-blue-900'
                : 'bg-rose-100 border-rose-400 text-rose-900'
            }`}
          >
            <span className="text-[11px] font-bold uppercase block tracking-wider font-['Mukta',sans-serif]">
              = {t.currentBalance}
            </span>
            <span className="text-xl md:text-2xl font-black font-['Mukta',sans-serif]">
              {formatINR(currentBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Donations */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Mukta',sans-serif]">
              {t.totalDonations}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              💰
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl md:text-3xl font-black text-emerald-700 font-['Mukta',sans-serif]">
              {formatINR(totalDonations)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-700 font-bold">{confirmedDonationsCount}</span>{' '}
              {language === 'mr' ? 'पावत्या जमा झाल्या' : 'receipts collected'}
            </p>
          </div>
          <div className="h-1 w-full bg-emerald-500 rounded-full mt-4" />
        </div>

        {/* Card 2: Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Mukta',sans-serif]">
              {t.totalExpenses}
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg">
              🧾
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl md:text-3xl font-black text-rose-700 font-['Mukta',sans-serif]">
              {formatINR(totalExpenses)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {language === 'mr' ? (
                <>
                  एकूण <strong className="text-slate-800">{totalExpensesCount}</strong> बिले व व्हाउचर नोंदी
                </>
              ) : (
                <>
                  Total <strong className="text-slate-800">{totalExpensesCount}</strong> bills & voucher entries
                </>
              )}
            </p>
          </div>
          <div className="h-1 w-full bg-rose-500 rounded-full mt-4" />
        </div>

        {/* Card 3: Current Available Balance */}
        <div
          className={`p-5 rounded-2xl border shadow-xs relative overflow-hidden ${
            currentBalance >= 0 ? 'bg-white border-blue-100' : 'bg-rose-50 border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Mukta',sans-serif]">
              {t.currentBalance}
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
              🏦
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-2xl md:text-3xl font-black font-['Mukta',sans-serif] ${
                currentBalance >= 0 ? 'text-blue-700' : 'text-rose-700'
              }`}
            >
              {formatINR(currentBalance)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {currentBalance >= 0
                ? (language === 'mr' ? 'मंडळाच्या तिजोरीत उपलब्ध शिल्लक' : 'Available balance in treasury')
                : (language === 'mr' ? 'तूट / अधिक निधी आवश्यक' : 'Deficit / Funds required')}
            </p>
          </div>
          <div className={`h-1 w-full rounded-full mt-4 ${currentBalance >= 0 ? 'bg-blue-600' : 'bg-rose-600'}`} />
        </div>

        {/* Card 4: Total Donations Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Mukta',sans-serif]">
              {language === 'mr' ? 'एकूण जमा पावत्या' : 'Total Receipts Count'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg">
              📜
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-['Mukta',sans-serif]">
              {donations.length}
            </h3>
            <button
              onClick={() => onNavigate('donations')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold mt-1 inline-flex items-center gap-1 font-['Mukta',sans-serif]"
            >
              {language === 'mr' ? 'सर्व पावत्या पहा' : 'View all receipts'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 5: Expense Records */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Mukta',sans-serif]">
              {language === 'mr' ? 'एकूण खर्च नोंदी' : 'Total Expense Count'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-lg">
              📊
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 font-['Mukta',sans-serif]">
              {totalExpensesCount}
            </h3>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs text-purple-700 hover:text-purple-800 font-bold mt-1 inline-flex items-center gap-1 font-['Mukta',sans-serif]"
            >
              {language === 'mr' ? 'सर्व खर्च यादी पहा' : 'View all expenses'} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 6: Pending Donations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-['Mukta',sans-serif]">
              {t.pendingAmount}
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-lg">
              ⏳
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl md:text-3xl font-black text-orange-600 font-['Mukta',sans-serif]">
              {formatINR(pendingDonationsAmount)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium font-['Mukta',sans-serif]">
              {pendingDonationsCount} {language === 'mr' ? 'धनादेश / व्यवहार प्रलंबित' : 'cheques / pending txns'}
            </p>
          </div>
        </div>
      </div>



      {/* Dual Column: Recent Donations & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                💰
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Mukta',sans-serif]">
                  {t.recentDonations}
                </h3>
                <p className="text-xs text-slate-500 font-medium font-['Mukta',sans-serif]">
                  {language === 'mr' ? 'शेवटच्या जमा पावत्यांची यादी' : 'Latest donation receipts logged'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('donations')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 font-['Mukta',sans-serif]"
            >
              {language === 'mr' ? `सर्व पहा (${donations.length})` : `View All (${donations.length})`} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDonations.length > 0 ? (
              recentDonations.map(d => (
                <div
                  key={d.id}
                  className="p-3.5 md:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 truncate font-['Mukta',sans-serif]">
                        {d.donorName}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 rounded border border-amber-200">
                        {getPaymentMethodLabel(d.paymentMethod)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                      <span>{formatDateLocal(d.date)}</span>
                      <span>•</span>
                      <span className="font-mono font-bold text-slate-700">{d.receiptNumber}</span>
                      <span>•</span>
                      <span className="font-['Mukta',sans-serif]">{getDonationCategoryLabel(d.category)}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span className="text-sm font-black text-emerald-700 font-['Mukta',sans-serif] block">
                        +{formatINR(d.amount)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          d.status === 'Received' ? 'text-emerald-600' : 'text-orange-500'
                        }`}
                      >
                        {d.status === 'Received' ? t.statusReceived : t.statusPending}
                      </span>
                    </div>
                    <button
                      onClick={() => openReceiptModal(d)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title={language === 'mr' ? 'पावती पहा / प्रिंट करा' : 'View / Print Receipt'}
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-400 font-['Mukta',sans-serif]">
                {language === 'mr' ? 'अद्याप जमा पावती नोंद झालेली नाही.' : 'No donations recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Recent Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                🧾
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-['Mukta',sans-serif]">
                  {t.recentExpenses}
                </h3>
                <p className="text-xs text-slate-500 font-medium font-['Mukta',sans-serif]">
                  {language === 'mr' ? 'व्हाउचर व बिल पेमेंट तपशील' : 'Voucher & bill disbursement summary'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 font-['Mukta',sans-serif]"
            >
              {language === 'mr' ? `सर्व पहा (${expenses.length})` : `View All (${expenses.length})`} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentExpenses.length > 0 ? (
              recentExpenses.map(e => {
                const badge = getCategoryBadgeColor(e.category);
                return (
                  <div
                    key={e.id}
                    className="p-3.5 md:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate font-['Mukta',sans-serif]">
                          {e.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {getExpenseCategoryLabel(e.category)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 font-medium">
                        <span>{formatDateLocal(e.date)}</span>
                        <span>•</span>
                        <span>
                          {t.vendorPaid}: <strong className="text-slate-700 font-['Mukta',sans-serif]">{e.vendorPaid}</strong>
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-rose-700 font-['Mukta',sans-serif] block">
                        -{formatINR(e.amount)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {getPaymentMethodLabel(e.paymentMethod)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-slate-400 font-['Mukta',sans-serif]">
                {language === 'mr' ? 'अद्याप खर्चाची नोंद झालेली नाही.' : 'No expenses recorded yet.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('ledger')}
          className="p-4 bg-white border border-slate-200/80 hover:border-amber-400 rounded-2xl flex items-center justify-between transition-all group text-left shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Mukta',sans-serif] group-hover:text-amber-700">
                {t.ledger} ({t.ledgerSub})
              </h4>
              <p className="text-xs text-slate-500 font-medium font-['Mukta',sans-serif]">
                {language === 'mr'
                  ? 'तारखेनुसार संपूर्ण जमा-खर्च हिशोब व शिल्लक रक्कम'
                  : 'Chronological double-entry cashflow transactions'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-700 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="p-4 bg-white border border-slate-200/80 hover:border-amber-400 rounded-2xl flex items-center justify-between transition-all group text-left shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Mukta',sans-serif] group-hover:text-blue-700">
                {t.reports} ({t.reportsSub})
              </h4>
              <p className="text-xs text-slate-500 font-medium font-['Mukta',sans-serif]">
                {language === 'mr'
                  ? 'मंडळाचे अधिकृत ताळेबंद पत्रक व प्रिंट अहवाल'
                  : 'Official balance sheet, audit breakdown & export'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-700 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
