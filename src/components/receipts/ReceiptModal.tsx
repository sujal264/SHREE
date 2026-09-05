import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Share2, Check, AlertCircle } from 'lucide-react';
import { Donation, Festival, DonationStatus } from '../../types';
import { formatINR, getTodayDateString } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';

interface ReceiptModalProps {
  donation: Donation | null;
  festival: Festival | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ donation, festival, onClose }) => {
  const { showToast, updateDonationStatus } = useFinance();
  const {
    t,
    language,
    formatDateLocal,
  } = useLanguage();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [confirmToggleStatus, setConfirmToggleStatus] = React.useState<DonationStatus | null>(null);

  if (!donation || !festival) return null;

  const handlePrint = () => {
    window.print();
  };

  const getSummaryText = () => {
    const catLabel = donation.category === 'Other' ? 'Other' : 'General';
    const statusLabel = donation.status === 'Received' ? t.statusReceived : t.statusPending;
    const recDateLine = donation.status === 'Received'
      ? `${language === 'mr' ? 'जमा दिनांक' : 'Received Date'}: ${formatDateLocal(donation.receivedDate || donation.date)}\n`
      : '';

    return `🪔 *${t.mandalName}*
*|| Om Sai Ram || • Est: 1990 • 36th Year*
*${t.receiptTitle}*
━━━━━━━━━━━━━━━━━━
${t.receiptNumber}: ${donation.receiptNumber}
${t.donorName}: ${donation.donorName}
${t.category}: ${catLabel}
${t.date}: ${formatDateLocal(donation.date)}
${recDateLine}${t.amount}: ${formatINR(donation.amount)}/-
${t.status}: ${statusLabel}
━━━━━━━━━━━━━━━━━━
• Courtesy: Shree Sai Colony, Karvenagar, Pune •
${t.receiptBlessing} 🙏
We are deeply grateful for your generous contribution!`;
  };

  const handleCopySummary = () => {
    const text = getSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast(
        'success',
        language === 'mr' ? 'पावती कॉपी झाली' : 'Receipt Copied',
        language === 'mr' ? 'व्हॉट्सॲपवर पाठवण्यासाठी पावतीचा तपशील कॉपी केला आहे.' : 'Receipt details copied to clipboard for WhatsApp sharing.'
      );
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    const text = getSummaryText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div
        id="receipt-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto font-['Mukta',sans-serif]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200"
        >
          {/* Modal Header Controls (Hidden during print) */}
          <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 bg-slate-900 text-white no-print shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base shrink-0">
                🪔
              </div>
              <div className="truncate">
                <h3 className="text-xs sm:text-sm font-black tracking-tight truncate">{t.receiptTitle}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-mono">#{donation.receiptNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                title={language === 'mr' ? 'व्हॉट्सॲपवर पाठवण्यासाठी कॉपी करा' : 'Copy summary for WhatsApp'}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? (language === 'mr' ? 'कॉपी झाली' : 'Copied') : (language === 'mr' ? 'WhatsApp शेअर' : 'WhatsApp Share')}</span>
                <span className="sm:hidden">{copied ? '✓' : 'Share'}</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.printReceipt}</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Paper Container */}
          <div className="p-3 sm:p-6 md:p-8 bg-amber-50/40 overflow-y-auto flex-1">
            <div
              ref={receiptRef}
              id="printable-receipt-card"
              className="bg-white border-2 border-amber-500/60 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm relative overflow-hidden print-break-inside-avoid"
            >
              {/* Decorative Background Watermarks */}
              <div className="absolute -right-8 -top-8 text-9xl opacity-5 select-none pointer-events-none">
                🕉️
              </div>
              <div className="absolute -left-8 -bottom-8 text-9xl opacity-5 select-none pointer-events-none">
                🪔
              </div>

              {/* Decorative top header line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 rounded-full mb-4"></div>

              {/* Mandal Authentic Header (Clean - No portraits) */}
              <div className="pb-4 border-b border-amber-300">
                {/* Top subtitle: Est 1990 | Om Sai Ram | Year 36th */}
                <div className="flex items-center justify-between text-[11px] font-black text-amber-950 px-1 mb-2">
                  <span className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Est: 1990</span>
                  <span className="font-extrabold text-amber-900">|| Om Sai Ram ||</span>
                  <span className="bg-amber-100 px-2 py-0.5 rounded border border-amber-300">36th Year</span>
                </div>

                <div className="text-center py-1">
                  <h1
                    className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight leading-none"
                    style={{
                      textShadow: '1px 1px 0px #ffffff, 2px 2px 0px #7f1d1d',
                    }}
                  >
                    SHREE SAI MITRA MANDAL
                  </h1>
                  <div className="text-[10px] sm:text-[11px] font-bold text-amber-900 uppercase tracking-wider mt-0.5">
                    SHREE SAI MITRA MANDAL • {festival.location || 'Pune'}
                  </div>

                  <div className="inline-block mt-1.5 px-4 py-0.5 bg-red-900 text-amber-100 rounded-full border border-amber-300 text-[11px] font-black">
                    • || Sarvajanik Ganeshotsav || •
                  </div>

                  <p className="text-[11px] font-bold text-red-900 mt-1">
                    • Courtesy: <span className="font-black underline">Shree Sai Colony, Karvenagar, Pune</span> •
                  </p>
                </div>

                <div className="text-center mt-2 pt-1 border-t border-amber-100">
                  <span className="text-xs font-black text-amber-950 tracking-wider bg-amber-100/80 px-3 py-0.5 rounded-md">
                    {t.receiptTitle}
                  </span>
                </div>
              </div>

              {/* Simplified Receipt Fields: Receipt No., Donor Name, Category, Date, Amount, Status */}
              <div className="py-4 space-y-3.5 text-xs font-['Mukta',sans-serif]">
                {/* 1. Receipt No. & Date / Received Date */}
                <div className="grid grid-cols-2 gap-4 pb-3 border-b border-dashed border-amber-200">
                  <div>
                    <span className="text-slate-500 font-bold block">{t.receiptNumber}:</span>
                    <p className="font-mono font-black text-amber-900 text-base">{donation.receiptNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-bold block">{t.date}:</span>
                    <p className="font-bold text-slate-800 text-sm">{formatDateLocal(donation.date)}</p>
                    {donation.status === 'Received' && (
                      <div className="mt-1">
                        <span className="text-slate-500 font-bold text-[11px] block">{language === 'mr' ? 'जमा दिनांक' : 'Received Date'}:</span>
                        <p className="font-black text-emerald-800 text-xs">✓ {formatDateLocal(donation.receivedDate || donation.date)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Donor Name */}
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1 border-b border-dashed border-amber-200">
                  <span className="text-slate-500 font-bold">{t.donorName}:</span>
                  <span className="text-base font-black text-slate-900">{donation.donorName}</span>
                </div>

                {/* 3. Category (General / Other) */}
                <div className="flex items-center justify-between py-1 border-b border-dashed border-amber-200">
                  <span className="text-slate-500 font-bold">{t.category}:</span>
                  <span className="font-black text-amber-950 px-3 py-0.5 bg-amber-100/90 rounded-lg border border-amber-300">
                    {donation.category === 'Other' ? (language === 'mr' ? 'इतर (Other)' : 'Other') : (language === 'mr' ? 'सर्वसाधारण (General)' : 'General')}
                  </span>
                </div>

                {/* 4. Amount & Status Box */}
                <div className="my-2 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider block">
                      {t.amount}
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-amber-950">
                      {formatINR(donation.amount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-0.5">
                      {t.status}
                    </span>
                    <span className={`inline-block px-3 py-1 text-xs font-black rounded-full border ${
                      donation.status === 'Received'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      ✓ {donation.status === 'Received' ? t.statusReceived : t.statusPending}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thank you note */}
              <div className="mt-4 pt-3 border-t border-dashed border-amber-200 text-center">
                <p className="text-xs md:text-sm font-black text-amber-900">
                  {t.receiptBlessing} Thank you for your generous contribution and support! 🙏
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  • Courtesy: Shree Sai Colony, Karvenagar, Pune •
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="px-6 py-3 bg-slate-100 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 no-print">
            <div className="flex items-center gap-2">
              <span className="font-bold">{t.status}:</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${
                donation.status === 'Received' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {donation.status === 'Received' ? t.statusReceived : t.statusPending}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Quick Status Toggle Button */}
              {donation.status === 'Pending' ? (
                <button
                  id="receipt-mark-received-btn"
                  onClick={() => setConfirmToggleStatus('Received')}
                  className="px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'रक्कम जमा झाली' : 'Mark as Received'}</span>
                </button>
              ) : (
                <button
                  id="receipt-mark-pending-btn"
                  onClick={() => setConfirmToggleStatus('Pending')}
                  className="px-3 py-1.5 text-xs font-black bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>⏳ {language === 'mr' ? 'प्रलंबित (Pending) ठेवा' : 'Mark as Pending'}</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-black text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'mr' ? 'प्रिंट' : 'Print'}</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>

          {/* Confirm Status Toggle Modal Inside Receipt View */}
          {confirmToggleStatus && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Mukta',sans-serif]">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-2.5 text-amber-600">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {language === 'mr' ? 'स्थिती बदलण्याची खात्री करा' : 'Confirm Status Change'}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {language === 'mr' ? (
                    <>
                      तुम्हाला खात्री आहे का की आपण पावती क्र.{' '}
                      <strong className="text-slate-900">#{donation.receiptNumber}</strong> ({donation.donorName}) यांची स्थिती{' '}
                      <strong className="text-amber-700">{donation.status}</strong> वरून{' '}
                      <strong className="text-emerald-700">{confirmToggleStatus}</strong> करू इच्छिता?
                    </>
                  ) : (
                    <>
                      Are you sure you want to change the status of receipt{' '}
                      <strong className="text-slate-900">#{donation.receiptNumber}</strong> ({donation.donorName}) from{' '}
                      <strong className="text-amber-700">{donation.status}</strong> to{' '}
                      <strong className="text-emerald-700">{confirmToggleStatus}</strong>?
                    </>
                  )}
                </p>

                {confirmToggleStatus === 'Received' && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-medium">
                    ✓ {language === 'mr' ? 'आजची खरी तारीख जमा दिनांक म्हणून नोंदवली जाईल.' : `Received Date will be set to real-time system date: ${formatDateLocal(getTodayDateString())}.`}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setConfirmToggleStatus(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    id="receipt-confirm-status-btn"
                    type="button"
                    onClick={() => {
                      const finalDate = confirmToggleStatus === 'Received' ? getTodayDateString() : '';
                      updateDonationStatus(donation.id, confirmToggleStatus, finalDate);
                      setConfirmToggleStatus(null);
                    }}
                    className="px-4 py-2 text-xs font-black text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md cursor-pointer"
                  >
                    {language === 'mr' ? 'होय, स्थिती बदला' : 'Yes, Change Status'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
