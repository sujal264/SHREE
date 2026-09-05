import React from 'react';
import { motion } from 'motion/react';
import { Eye, KeyRound, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  onContinueViewer: () => void;
  onLoginAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onContinueViewer,
  onLoginAdmin,
}) => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between font-['Mukta',sans-serif] selection:bg-amber-500 selection:text-white overflow-x-hidden">
      {/* Top Traditional Decorative Garland Border */}
      <div className="w-full h-3 sm:h-4 flex justify-between overflow-hidden opacity-90">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={`top-toran-${i}`}
            className="w-0 h-0 border-l-[7px] sm:border-l-[10px] border-l-transparent border-r-[7px] sm:border-r-[10px] border-r-transparent border-t-[9px] sm:border-t-[14px] border-t-amber-500 shrink-0"
          />
        ))}
      </div>

      {/* Top Bar: Establishment Badges */}
      <header className="px-4 sm:px-6 py-3 max-w-5xl mx-auto w-full flex items-center justify-center text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-amber-900">
          <span className="bg-amber-100 text-amber-900 px-3 py-0.5 rounded-full border border-amber-300 text-[11px] sm:text-xs font-black">
            {language === 'mr' ? 'स्थापना: १९९०' : 'Est: 1990'}
          </span>
          <span className="text-amber-800 px-1 font-extrabold">॥ श्री गजानन प्रसन्न ॥</span>
          <span className="bg-red-100 text-red-900 px-3 py-0.5 rounded-full border border-red-300 text-[11px] sm:text-xs font-black">
            {language === 'mr' ? 'वर्ष: ३६ वे' : '36th Year'}
          </span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-10 max-w-2xl mx-auto w-full text-center">
        {/* Logo Emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <img
            src="/favicon.png"
            alt="Shree Sai Mitra Mandal Emblem"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-amber-400 shadow-xl shadow-amber-500/10 mx-auto"
          />
        </motion.div>

        {/* Mandal Grand Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="text-xs uppercase tracking-widest text-amber-700 font-extrabold mb-1">
            • ॥ ॐ साईं राम • श्री गणेशाय नमः ॥ •
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-950 tracking-tight leading-tight drop-shadow-xs">
            श्री साई मित्र मंडळ
          </h1>
          <div className="text-sm sm:text-base font-bold text-slate-600 mt-1">
            सार्वजनिक गणेशोत्सव २०२६ • कर्वेनगर, पुणे
          </div>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md space-y-3"
        >
          <p className="text-xs sm:text-sm text-slate-500 font-bold mb-2">
            {language === 'mr'
              ? 'कृपया पुढे जाण्यासाठी एक पर्याय निवडा:'
              : 'Please select an option to continue:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {/* Option 1: Continue as Viewer */}
            <button
              id="continue-viewer-btn"
              onClick={onContinueViewer}
              className="group relative flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-400 text-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[56px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-emerald-950">
                  {language === 'mr' ? 'सार्वजनिक वाचक' : 'Continue as Viewer'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* Option 2: Login */}
            <button
              id="login-admin-btn"
              onClick={onLoginAdmin}
              className="group relative flex items-center justify-between p-4 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border-2 border-amber-400 text-slate-900 shadow-sm hover:shadow-md transition-all cursor-pointer min-h-[56px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-amber-950">
                  {language === 'mr' ? 'लॉगिन' : 'Login'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-3.5 text-center text-xs text-slate-500 border-t border-slate-200 bg-slate-50">
        <div>
          सौजन्य: <strong className="text-slate-700">श्री साई कॉलनी, कर्वेनगर, पुणे</strong>
        </div>
      </footer>
    </div>
  );
};
