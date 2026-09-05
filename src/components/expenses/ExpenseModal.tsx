import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
  initialData?: Expense | null;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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
  'Prize/Trophy',
  'Cultural Program',
  'Police/Permissions',
  'Miscellaneous',
];

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit,
  initialData,
}) => {
  const targetExpense = expenseToEdit || initialData;
  const { addExpense, updateExpense } = useFinance();
  const {
    t,
    language,
    formatAmountInWords,
    getExpenseCategoryLabel,
    getPaymentMethodLabel,
  } = useLanguage();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Decoration');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (targetExpense) {
      setTitle(targetExpense.title);
      setCategory(targetExpense.category);
      setAmount(targetExpense.amount);
      setDate(targetExpense.date);
      setPaymentMethod(targetExpense.paymentMethod);
      setNotes(targetExpense.notes || '');
    } else {
      setTitle('');
      setCategory('Decoration');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Cash');
      setNotes('');
    }
    setErrors({});
  }, [targetExpense, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = language === 'mr' ? 'कृपया योग्य रक्कम टाका' : 'Please enter a valid amount';
    }
    if (!date) {
      newErrors.date = language === 'mr' ? 'कृपया दिनांक निवडा' : 'Please select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalTitle = title.trim() || getExpenseCategoryLabel(category);
    const finalVendor = targetExpense?.vendorPaid || (language === 'mr' ? 'मंडळ' : 'Mandal');

    if (targetExpense) {
      updateExpense({
        ...targetExpense,
        title: finalTitle,
        category,
        amount: Number(amount),
        date,
        vendorPaid: finalVendor,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addExpense({
        title: finalTitle,
        category,
        amount: Number(amount),
        date,
        vendorPaid: finalVendor,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="expense-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto font-['Mukta',sans-serif]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-rose-700 to-rose-600 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg sm:text-xl shrink-0">
                🧾
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  {targetExpense
                    ? (language === 'mr' ? 'खर्च नोंद संपादित करा' : 'Edit Expense Voucher')
                    : (language === 'mr' ? 'नवीन खर्च नोंदवा' : 'New Expense Voucher')}
                </h3>
                <p className="text-[11px] sm:text-xs text-rose-100 font-medium">
                  {language === 'mr' ? 'मंडळ अधिकृत पावती/व्हाउचर नोंद' : 'Official mandal expense ledger voucher'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-rose-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.expenseTitle} *
                </label>
                <input
                  id="expense-title-input"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. मंडप सजावट व कमान काम' : 'e.g. Stage Mandap & lighting'}
                  className={`w-full px-3.5 py-2 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium ${
                    errors.title ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.title && <p className="text-xs text-rose-600 font-bold mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.amount} (₹) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600 font-black text-base">
                    ₹
                  </span>
                  <input
                    id="expense-amount-input"
                    type="number"
                    min="1"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={language === 'mr' ? 'उदा. ८०००' : 'e.g. 8000'}
                    className={`w-full pl-8 pr-3 py-2 text-sm bg-white border rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      errors.amount ? 'border-rose-500 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-xs text-rose-600 font-bold mt-1">{errors.amount}</p>}
              </div>
            </div>

            {/* Amount in Words preview */}
            {typeof amount === 'number' && amount > 0 && (
              <p className="text-xs text-rose-900 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {t.amountInWords}: {formatAmountInWords(amount)}
              </p>
            )}

            {/* Category & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.category} *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-800"
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {getExpenseCategoryLabel(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.paymentMethod} *
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-800"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>
                      {getPaymentMethodLabel(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                {t.date} *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.notes} ({language === 'mr' ? 'ऐच्छिक' : 'Optional'})
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={language === 'mr' ? 'उदा. ४ हॅलोजन दिवे, २० एलईडी पट्ट्या व ३ दिवसांचे मजुरी शुल्क' : 'e.g. 4 halogen lights and 3-day labor charges'}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                id="save-expense-button"
                type="submit"
                className="px-6 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{targetExpense ? t.saveChanges : (language === 'mr' ? 'खर्च नोंदवा' : 'Save Expense')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
