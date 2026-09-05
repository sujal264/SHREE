import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { Donation, DonationCategory, DonationStatus, PaymentMethod } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, getTodayDateString } from '../../utils/formatters';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationToEdit?: Donation | null;
  initialData?: Donation | null;
}

const PRESET_AMOUNTS = [101, 251, 501, 1001, 2100, 2501, 5001, 11000];

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  donationToEdit,
  initialData,
}) => {
  const targetDonation = donationToEdit || initialData;
  const { addDonation, updateDonation, openReceiptModal, nextReceiptNumber } = useFinance();
  const {
    t,
    language,
    getDonationCategoryLabel,
  } = useLanguage();

  const [receiptNumber, setReceiptNumber] = useState('');
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('2026-09-01');
  const [receivedDate, setReceivedDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<DonationCategory>('General');
  const [status, setStatus] = useState<DonationStatus>('Pending');
  const [autoOpenReceipt, setAutoOpenReceipt] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const CATEGORIES: DonationCategory[] = ['General', 'Other'];

  useEffect(() => {
    const today = getTodayDateString();
    if (targetDonation) {
      setReceiptNumber(targetDonation.receiptNumber);
      setDonorName(targetDonation.donorName);
      setAmount(targetDonation.amount);
      setDate(targetDonation.date || '2026-09-01');
      setReceivedDate(targetDonation.receivedDate || today);
      setCategory(targetDonation.category === 'Other' ? 'Other' : 'General');
      setStatus(targetDonation.status);
    } else {
      setReceiptNumber(nextReceiptNumber);
      setDonorName('');
      setAmount('');
      setDate('2026-09-01');
      setReceivedDate(today);
      setCategory('General');
      setStatus('Pending');
    }
    setErrors({});
  }, [targetDonation, isOpen, nextReceiptNumber]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!receiptNumber.trim()) {
      newErrors.receiptNumber = language === 'mr' ? 'कृपया पावती क्रमांक टाका' : 'Please enter receipt number';
    }
    if (!donorName.trim()) {
      newErrors.donorName = language === 'mr' ? 'कृपया वर्गणीदार / देणगीदाराचे नाव टाका' : 'Please enter donor name';
    }
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = language === 'mr' ? 'कृपया योग्य रक्कम टाका' : 'Please enter a valid amount';
    }
    if (!date) {
      newErrors.date = language === 'mr' ? 'कृपया दिनांक निवडा' : 'Please select a date';
    }
    if (status === 'Received' && !receivedDate) {
      newErrors.receivedDate = language === 'mr' ? 'कृपया रक्कम जमा झालेली तारीख निवडा' : 'Please select received date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const trimmedReceipt = receiptNumber.trim() || nextReceiptNumber;
    const finalReceivedDate = status === 'Received' ? (receivedDate || date) : '';

    if (targetDonation) {
      updateDonation({
        ...targetDonation,
        receiptNumber: trimmedReceipt,
        donorName: donorName.trim(),
        amount: Number(amount),
        date,
        receivedDate: finalReceivedDate,
        category,
        status,
      });
      onClose();
    } else {
      const created = addDonation({
        receiptNumber: trimmedReceipt,
        donorName: donorName.trim(),
        amount: Number(amount),
        paymentMethod: 'Cash',
        date,
        receivedDate: finalReceivedDate,
        category,
        status,
      });

      onClose();
      if (autoOpenReceipt && created) {
        openReceiptModal(created);
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        id="donation-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto font-['Mukta',sans-serif]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                🪔
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  {targetDonation
                    ? (language === 'mr' ? 'जमा पावती दुरुस्त करा' : 'Edit Donation Receipt')
                    : (language === 'mr' ? 'नवीन जमा पावती नोंदवा' : 'New Donation Entry')}
                </h3>
                <p className="text-[11px] sm:text-xs text-amber-100 font-medium">
                  {language === 'mr' ? 'पावती क्र.' : 'Receipt #'}: {receiptNumber || nextReceiptNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-amber-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Row 1: Manual Receipt Number & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
              {/* Receipt Number (Manual & Editable) */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === 'mr' ? 'पावती क्रमांक (Receipt #)' : 'Receipt Number'} *
                </label>
                <input
                  id="donation-receipt-number-input"
                  type="text"
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  placeholder="e.g. 430"
                  className={`w-full px-3.5 py-2.5 bg-amber-50/50 border rounded-xl font-mono font-black text-base text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                    errors.receiptNumber ? 'border-rose-500 bg-rose-50/30' : 'border-amber-300'
                  }`}
                />
                {errors.receiptNumber && <p className="text-xs text-rose-600 font-bold mt-1">{errors.receiptNumber}</p>}
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'mr' ? 'हा क्रमांक बदलू शकता' : 'Editable manual receipt #'}
                </p>
              </div>

              {/* Amount Input */}
              <div className="sm:col-span-7">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.amount} (₹) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600 font-black text-base">
                    ₹
                  </div>
                  <input
                    id="donation-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={language === 'mr' ? 'रक्कम टाका (उदा. २५०१)' : 'Enter amount (e.g. 2501)'}
                    className={`w-full pl-9 pr-4 py-2.5 bg-amber-50/40 border rounded-xl font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all ${
                      errors.amount ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-xs text-rose-600 font-bold mt-1">{errors.amount}</p>}
              </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_AMOUNTS.map(preset => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    amount === preset
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>

            {/* Donor Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                {t.donorName} *
              </label>
              <input
                id="donor-name-input"
                type="text"
                value={donorName}
                onChange={e => setDonorName(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. श्री. राजेश पाटील' : 'e.g. Mr. Rajesh Patil'}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-900 ${
                  errors.donorName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.donorName && <p className="text-xs text-rose-600 font-bold mt-1">{errors.donorName}</p>}
            </div>

            {/* Category, Date, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.category} *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as DonationCategory)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 cursor-pointer"
                >
                  <option value="General">{language === 'mr' ? 'सर्वसाधारण (General)' : 'General'}</option>
                  <option value="Other">{language === 'mr' ? 'इतर (Other)' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.date} *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.status} *
                </label>
                <select
                  id="donation-status-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as DonationStatus)}
                  className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-black cursor-pointer ${
                    status === 'Received'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <option value="Pending">⏳ {t.statusPending}</option>
                  <option value="Received">✓ {t.statusReceived}</option>
                  <option value="Cancelled">✕ {t.statusCancelled}</option>
                </select>
              </div>
            </div>

            {/* Received Date input (visible when status is Received) */}
            {status === 'Received' && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                  {language === 'mr' ? 'रक्कम जमा झालेली तारीख (Received Date)' : 'Received Date'} *
                </label>
                <input
                  id="donation-received-date-input"
                  type="date"
                  value={receivedDate}
                  onChange={e => setReceivedDate(e.target.value)}
                  className={`w-full sm:w-1/2 px-3 py-2 text-xs bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-900 ${
                    errors.receivedDate ? 'border-rose-500' : 'border-emerald-300'
                  }`}
                />
                {errors.receivedDate && <p className="text-xs text-rose-600 font-bold">{errors.receivedDate}</p>}
                <p className="text-[11px] text-emerald-800 font-medium">
                  {language === 'mr' ? 'रक्कम प्रत्यक्षात कधी मिळाली तो दिनांक निवडा' : 'Select the date money was received'}
                </p>
              </div>
            )}

            {!targetDonation && (
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={autoOpenReceipt}
                  onChange={e => setAutoOpenReceipt(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">
                  {language === 'mr'
                    ? 'नोंदवल्यानंतर लगेच अधिकृत पावती प्रिंट / पाहण्यासाठी उघडा'
                    : 'Open printable receipt immediately after saving'}
                </span>
              </label>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t.cancel}
              </button>
              <button
                id="save-donation-button"
                type="submit"
                className="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{targetDonation ? t.saveChanges : (language === 'mr' ? 'जमा नोंदवा व पावती बनवा' : 'Save Donation & Generate Receipt')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
