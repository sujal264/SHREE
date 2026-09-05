import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, KeyRound, Sparkles, BookOpen, Shield, ArrowRight, Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LandingPageProps {
  onContinueViewer: () => void;
  onLoginAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onContinueViewer,
  onLoginAdmin,
}) => {
  const { language, setLanguage } = useLanguage();
  const [showOptions, setShowOptions] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 2500; // 2.5 seconds
    const interval = 50;
    const step = 100 / (totalDuration / interval);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setShowOptions(true);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleSkipWait = () => {
    setShowOptions(true);
    setProgress(100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-slate-950 to-black text-slate-100 flex flex-col justify-between font-['Mukta',sans-serif] selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* Top Traditional Decorative Garland Border */}
      <div className="w-full h-3 sm:h-4 flex justify-between overflow-hidden opacity-90">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={`top-toran-${i}`}
            className="w-0 h-0 border-l-[7px] sm:border-l-[10px] border-l-transparent border-r-[7px] sm:border-r-[10px] border-r-transparent border-t-[9px] sm:border-t-[14px] border-t-amber-500 shrink-0"
          />
        ))}
      </div>

      {/* Top Bar: Establishment & Language Switcher */}
      <header className="px-4 sm:px-6 py-2.5 max-w-5xl mx-auto w-full flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 text-[11px] sm:text-xs">
            {language === 'mr' ? 'स्थापना: १९९०' : 'Est: 1990'}
          </span>
          <span className="hidden sm:inline text-amber-200/80">॥ श्री गजानन प्रसन्न ॥</span>
          <span className="bg-red-900/80 text-amber-200 px-2 py-0.5 rounded-full border border-red-500/40 text-[11px] sm:text-xs font-black">
            {language === 'mr' ? 'वर्ष: ३६ वे' : '36th Year'}
          </span>
        </div>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'mr' ? 'en' : 'mr')}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-amber-300 rounded-xl border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
          title="Change Language"
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'mr' ? 'English' : 'मराठी'}</span>
        </button>
      </header>

      {/* Main Content Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-2 sm:py-4 max-w-4xl mx-auto w-full text-center">
        {/* Mandal Grand Title */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 sm:mb-4"
        >
          <div className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-400 font-extrabold mb-1">
            • ॥ ॐ साईं राम • श्री गणेशाय नमः ॥ •
          </div>
          <h1
            className="text-2xl sm:text-4xl md:text-5xl font-black text-amber-300 tracking-tight leading-tight"
            style={{
              textShadow: '0 2px 10px rgba(245, 158, 11, 0.4), 0 0 20px rgba(217, 119, 6, 0.2)',
            }}
          >
            श्री साई मित्र मंडळ
          </h1>
          <div className="text-xs sm:text-sm md:text-base font-bold text-amber-200/90 mt-0.5">
            सार्वजनिक गणेशोत्सव २०२६ • कर्वेनगर, पुणे
          </div>
        </motion.div>

        {/* Banner Display: Chhatrapati Shivaji Maharaj & Sai Baba Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative group w-full max-w-xs sm:max-w-md md:max-w-lg mb-4 sm:mb-6"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-1000" />
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-400/80 bg-slate-900 shadow-2xl">
            <img
              src="/banner-shivaji-sai.jpg"
              alt="Shree Sai Mitra Mandal - Chhatrapati Shivaji Maharaj & Sai Baba Ganesh Utsav Banner"
              className="w-full max-h-[44vh] sm:max-h-[50vh] md:max-h-[55vh] object-contain mx-auto bg-amber-950/20"
              loading="eager"
            />
          </div>
        </motion.div>

        {/* 2-3 Second Countdown or Options */}
        <div className="w-full max-w-md px-2">
          {!showOptions ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2.5 py-1"
            >
              <div className="flex items-center justify-between text-xs text-amber-300/80 font-medium px-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>{language === 'mr' ? 'स्वागत आहे... कृपया थांबा' : 'Welcome... Loading options'}</span>
                </span>
                <button
                  onClick={handleSkipWait}
                  className="text-amber-400 hover:text-amber-200 underline font-bold cursor-pointer text-xs"
                >
                  {language === 'mr' ? 'आताच निवडा' : 'Select now'}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-amber-500/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-75 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <p className="text-xs sm:text-sm text-slate-300 font-bold mb-1">
                {language === 'mr'
                  ? 'कृपया पुढे जाण्यासाठी एक पर्याय निवडा:'
                  : 'Please select an option to continue:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Option 1: Continue as Viewer */}
                <button
                  id="continue-viewer-btn"
                  onClick={onContinueViewer}
                  className="group relative flex flex-col items-center sm:items-start text-left p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/60 hover:border-emerald-400 text-white shadow-lg hover:shadow-emerald-900/40 transition-all cursor-pointer min-h-[64px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                        <Eye className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black text-emerald-300">
                        {language === 'mr' ? 'सार्वजनिक वाचक' : 'Continue as Viewer'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-normal leading-snug">
                    {language === 'mr'
                      ? 'जमा-खर्च, देणगी पावत्या, दैनिक लेजर व अहवाल पहा'
                      : 'View donations, expenses, receipts, ledger & public reports'}
                  </p>
                </button>

                {/* Option 2: Login as Admin */}
                <button
                  id="login-admin-btn"
                  onClick={onLoginAdmin}
                  className="group relative flex flex-col items-center sm:items-start text-left p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 to-slate-900 border-2 border-amber-500/70 hover:border-amber-400 text-white shadow-lg hover:shadow-amber-900/40 transition-all cursor-pointer min-h-[64px]"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-black text-amber-300">
                        {language === 'mr' ? 'व्यवस्थापक लॉगिन' : 'Login as Admin'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 font-normal leading-snug">
                    {language === 'mr'
                      ? 'नवीन पावती फाडणे, खर्च नोंद व व्यवस्थापन (पासवर्ड आवश्यक)'
                      : 'Add/edit receipts, expenses, vouchers & mandal settings'}
                  </p>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-3 text-center text-[11px] text-slate-500 border-t border-slate-900">
        <div>
          सौजन्य: <strong className="text-slate-400">श्री साई कॉलनी, कर्वेनगर, पुणे</strong> • नोंदणी: MAH/PUN/2026/SSM-108
        </div>
      </footer>
    </div>
  );
};
