import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface MandalBannerProps {
  className?: string;
  showActions?: boolean;
  onOpenDonation?: () => void;
  onOpenExpense?: () => void;
  festivalYearNumber?: number;
  compact?: boolean;
}

export const MandalBanner: React.FC<MandalBannerProps> = ({
  className = '',
  showActions = false,
  onOpenDonation,
  onOpenExpense,
  festivalYearNumber = 36,
  compact = false,
}) => {
  const { t, language } = useLanguage();
  const { canEdit } = useAuth();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-xl border-2 border-amber-400 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-900 select-none ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(254, 240, 138, 0.95), rgba(251, 191, 36, 0.92)), repeating-radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.04) 0, rgba(217, 119, 6, 0.04) 20px, transparent 20px, transparent 40px)`,
      }}
    >
      {/* Top Traditional Triangular Toran Border */}
      <div className="w-full h-3 flex justify-between overflow-hidden opacity-80">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={`top-tri-${i}`}
            className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-800 shrink-0"
          />
        ))}
      </div>

      {/* Main Banner Content */}
      <div className={`px-4 sm:px-6 md:px-8 ${compact ? 'py-3' : 'py-4 md:py-6'} relative z-10`}>
        {/* Top Mini Header: Est 1990 | Shree Gajanan Prasanna | Year 36th */}
        <div className="flex items-center justify-between text-xs sm:text-sm md:text-base font-black text-amber-950 font-['Mukta',sans-serif] px-1 sm:px-4 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-900/15 px-2.5 py-0.5 rounded-md border border-amber-900/20 text-amber-950 font-black">
              स्थापना: १९९०
            </span>
          </div>

          <div className="text-center font-extrabold tracking-wider text-amber-950 text-sm sm:text-base md:text-lg drop-shadow-xs">
            ॥ श्री गजानन प्रसन्न ॥
          </div>

          <div className="flex items-center gap-1.5">
            <span className="bg-red-800 text-amber-100 px-3 py-0.5 rounded-md border border-amber-300 font-black shadow-xs">
              वर्ष ३६ वे
            </span>
          </div>
        </div>

        {/* Center Row: Mandal Grand Title & Calligraphy */}
        <div className="text-center my-2 sm:my-3">
          {/* 3D Main Title "श्री साई मित्र मंडळ" */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight font-['Mukta',sans-serif] text-red-700 leading-none drop-shadow-[0_2px_2px_rgba(255,255,255,0.9)]"
            style={{
              textShadow:
                '2px 2px 0px #ffffff, 4px 4px 0px #7f1d1d, 5px 5px 6px rgba(0, 0, 0, 0.4)',
              fontFamily: `'Mukta', 'Yatra One', sans-serif`,
            }}
          >
            श्री साई मित्र मंडळ
          </h1>

          {/* Sub-label */}
          <div className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase tracking-widest text-amber-950 mt-1 opacity-90 font-['Mukta',sans-serif]">
            KARVENAGAR, PUNE
          </div>

          {/* Maroon Pill Banner */}
          <div className="inline-flex items-center justify-center mt-2 px-6 sm:px-10 py-1 sm:py-1.5 bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white rounded-full border-2 border-amber-300 shadow-md">
            <span className="text-sm sm:text-base md:text-lg font-black tracking-wide font-['Mukta',sans-serif] text-amber-100">
              • ॥ सार्वजनिक गणेशोत्सव ॥ •
            </span>
          </div>

          {/* Courtesy Footer */}
          <div className="mt-2 text-xs sm:text-sm md:text-base font-extrabold text-red-900 font-['Mukta',sans-serif]">
            • Courtesy: <span className="text-red-950 underline decoration-amber-500 underline-offset-2">Shree Sai Colony, Karvenagar, Pune</span> •
          </div>
        </div>

        {/* Quick Action Buttons: STRICTLY only rendered if user has admin/canEdit permissions */}
        {canEdit && showActions && (
          <div className="mt-3 pt-2.5 border-t border-amber-900/20 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{t.personalFinanceBadge}</span>
              <span className="text-amber-800 font-medium hidden md:inline">| {t.personalFinanceSub}</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenDonation && (
                <button
                  onClick={onOpenDonation}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>+</span>
                  <span>{t.donationReceiptBtn}</span>
                </button>
              )}
              {onOpenExpense && (
                <button
                  onClick={onOpenExpense}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>+</span>
                  <span>{t.expenseEntryBtn}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Traditional Triangular Toran Border */}
      <div className="w-full h-3 flex justify-between overflow-hidden opacity-80">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={`bot-tri-${i}`}
            className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-amber-800 shrink-0"
          />
        ))}
      </div>
    </div>
  );
};
