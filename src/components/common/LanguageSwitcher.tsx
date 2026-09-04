import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'buttons' | 'minimal';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = () => {
  return null;
};

  if (variant === 'buttons') {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('mr')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
            language === 'mr'
              ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🇮🇳</span>
          <div className="text-left">
            <div className="font-black">मराठी (Marathi)</div>
            <div className="text-[10px] text-slate-500">स्थानिक भाषा</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold text-xs transition-all ${
            language === 'en'
              ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="text-base">🌐</span>
          <div className="text-left">
            <div className="font-black">English</div>
            <div className="text-[10px] text-slate-500">Universal</div>
          </div>
        </button>
      </div>
    );
  }

  // Default 'pill' variant for Navbar & Headers
  return (
    <div
      className={`inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/90 text-xs shadow-2xs ${className}`}
      title="भाषा बदला / Change Language"
    >
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5 shrink-0 hidden sm:block" />
      <button
        onClick={() => setLanguage('mr')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'mr'
            ? 'bg-amber-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        मराठी
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-amber-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
        }`}
      >
        English
      </button>
    </div>
  );
};
