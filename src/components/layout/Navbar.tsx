import React, { useState } from 'react';
import {
  Menu,
  KeyRound,
  Shield,
  LogOut,
  Eye,
  RotateCw,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onGoLanding?: () => void;
  onOpenDonationModal?: () => void;
  onOpenExpenseModal?: () => void;
  activeTab?: string;
  onBack?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onGoLanding,
  activeTab,
  onBack,
}) => {
  const { isAdmin, openAuthModal, logout } = useAuth();
  const { refreshData, showToast } = useFinance();
  const { language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast(
        'success',
        language === 'mr' ? 'माहिती अद्ययावत केली' : 'Data Refreshed',
        language === 'mr'
          ? 'सर्व जमा, खर्च व लेजर नोंदी अद्ययावत केल्या आहेत.'
          : 'Latest donations, expenses, and ledger entries synced.'
      );
    } catch {
      showToast(
        'error',
        language === 'mr' ? 'रिफ्रेश अयशस्वी' : 'Refresh Failed',
        language === 'mr' ? 'कृपया पुन्हा प्रयत्न करा.' : 'Please try again.'
      );
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getTabLabel = (tab?: string) => {
    switch (tab) {
      case 'donations':
        return language === 'mr' ? 'वर्गणी' : 'Donations';
      case 'expenses':
        return language === 'mr' ? 'खर्च' : 'Expenses';
      case 'ledger':
        return language === 'mr' ? 'खतावणी' : 'Ledger';
      case 'reports':
        return language === 'mr' ? 'अहवाल' : 'Reports';
      case 'settings':
        return language === 'mr' ? 'सेटिंग्ज' : 'Settings';
      default:
        return '';
    }
  };

  const currentTabName = getTabLabel(activeTab);

  return (
    <header className="h-16 bg-white border-b border-amber-200/80 px-2.5 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs font-['Mukta',sans-serif]">
      {/* Left: Mobile hamburger, Back button & Mandal Title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
        {/* On-screen Back button: always visible when inside any subpage (expenses, donations, etc.) */}
        {activeTab && activeTab !== 'dashboard' && (
          <button
            id="navbar-back-btn"
            onClick={onBack}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            title={language === 'mr' ? 'मागे जा / डॅशबोर्ड (Go Back to Dashboard)' : 'Go Back to Dashboard'}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'mr' ? 'मागे' : 'Back'}</span>
          </button>
        )}

        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden cursor-pointer shrink-0"
          title="Open Menu"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={onGoLanding}
          className="flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity min-w-0"
          title="Go to Welcome Banner Screen"
        >
          <img
            src="/favicon.png"
            alt="Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-amber-300 shadow-xs shrink-0"
          />

          <div className="min-w-0 font-['Mukta',sans-serif]">
            <div className="flex items-center gap-1.5">
              <div className="text-xs sm:text-sm font-black text-amber-950 truncate max-w-[120px] xs:max-w-[150px] sm:max-w-xs md:max-w-md leading-tight">
                श्री साई मित्र मंडळ २०२६
              </div>
              {currentTabName && (
                <span className="hidden sm:inline-block text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                  {currentTabName}
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5 font-medium truncate">
              <span className="text-amber-800 font-bold">स्थापना: १९९०</span>
              <span>•</span>
              <span className="text-red-700 font-extrabold">कर्वेनगर, पुणे</span>
              <span>•</span>
              <span className="text-amber-900 font-black bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">वर्ष ३६ वे</span>
            </div>
          </div>
        </button>
      </div>

      {/* Right: Refresh button + Login / Admin status */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Refresh button - Visible to BOTH Admin and Viewer */}
        <button
          id="navbar-refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:border-amber-300 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          title={language === 'mr' ? 'माहिती ताजी करा (Refresh Data)' : 'Refresh latest data'}
        >
          <RotateCw className={`w-3.5 h-3.5 text-amber-600 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-bold">
            {language === 'mr' ? 'रिफ्रेश' : 'Refresh'}
          </span>
        </button>
        {isAdmin ? (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
              title="Admin Session Active"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="font-extrabold">Admin</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-bold border border-slate-200">
              <Eye className="w-3 h-3 text-slate-400" />
              <span>{language === 'mr' ? 'वाचक' : 'Viewer'}</span>
            </div>
            <button
              id="navbar-login-btn"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors cursor-pointer"
              title="Login"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-200" />
              <span>{language === 'mr' ? 'लॉगिन' : 'Login'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
