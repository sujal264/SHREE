import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { LanguageProvider } from './context/LanguageContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { DonationsView } from './components/donations/DonationsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { LedgerView } from './components/ledger/LedgerView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { LandingPage } from './components/landing/LandingPage';
import { DonationModal } from './components/donations/DonationModal';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { ReceiptModal } from './components/receipts/ReceiptModal';
import { AuthModal } from './components/common/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Donation, Expense } from './types';
import { X, ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const getInitialTab = (): string => {
    const hash = window.location.hash.replace('#', '').split('?')[0];
    const validTabs = ['dashboard', 'donations', 'expenses', 'ledger', 'reports', 'settings'];
    if (validTabs.includes(hash)) return hash;
    return 'dashboard';
  };

  // Gate: All new visitors, incognito windows, and unchosen sessions strictly see Landing Page first
  const [hasSelectedEntry, setHasSelectedEntry] = useState<boolean>(() => {
    const hash = window.location.hash.replace('#', '').split('?')[0];
    if (hash === 'landing') return false;
    return sessionStorage.getItem('gu_entry_visited') === 'true';
  });
  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const { selectedReceiptDonation, closeReceiptModal, activeFestival } = useFinance();
  const { isAuthModalOpen, openAuthModal, closeAuthModal, isAdmin } = useAuth();

  // Donation Modal State
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [editingDonation, setEditingDonation] = useState<Donation | undefined>(undefined);

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  // Check if any modal or overlay drawer is currently open
  const isAnyModalOpen =
    isMobileMenuOpen ||
    isDonationModalOpen ||
    isExpenseModalOpen ||
    Boolean(selectedReceiptDonation) ||
    isAuthModalOpen;

  // History tracking refs to prevent loop & duplicate popstate actions
  const modalOpenCountRef = useRef<number>(0);
  const isPoppingRef = useRef<boolean>(false);
  const isProgrammaticPopRef = useRef<boolean>(false);
  const prevAnyModalOpenRef = useRef<boolean>(false);

  // Synchronize history state on initial mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '').split('?')[0];
    const validTabs = ['dashboard', 'donations', 'expenses', 'ledger', 'reports', 'settings'];

    if (!hasSelectedEntry) {
      window.history.replaceState({ tab: 'landing', hasSelectedEntry: false }, '', '#landing');
    } else {
      const currentTab = validTabs.includes(hash) ? hash : activeTab;
      window.history.replaceState({ tab: currentTab, hasSelectedEntry: true }, '', `#${currentTab}`);
    }
  }, []);

  // If user becomes authenticated as admin, ensure entry gate is passed
  useEffect(() => {
    if (isAdmin) {
      setHasSelectedEntry(true);
      sessionStorage.setItem('gu_entry_visited', 'true');
      if (!window.location.hash || window.location.hash === '#landing') {
        window.history.replaceState({ tab: 'dashboard', hasSelectedEntry: true }, '', '#dashboard');
      }
    }
  }, [isAdmin]);

  // Modal open/close history synchronization:
  // When a modal opens, push a history entry so the phone's back button will close it instead of leaving the website
  useEffect(() => {
    if (isAnyModalOpen && !prevAnyModalOpenRef.current) {
      // Modal opened: push state
      modalOpenCountRef.current = 1;
      window.history.pushState({ isModal: true }, '', window.location.hash);
    } else if (!isAnyModalOpen && prevAnyModalOpenRef.current) {
      // All modals closed: if closed programmatically (X button, cancel, submit), pop the history entry
      if (!isPoppingRef.current && modalOpenCountRef.current > 0) {
        modalOpenCountRef.current = 0;
        isProgrammaticPopRef.current = true;
        window.history.back();
      }
    }
    prevAnyModalOpenRef.current = isAnyModalOpen;
  }, [isAnyModalOpen]);

  // Listen to popstate events (mobile hardware back button, swipe back gesture, browser back button)
  useEffect(() => {
    const handlePopState = () => {
      // If triggered by our programmatic window.history.back(), skip handling
      if (isProgrammaticPopRef.current) {
        isProgrammaticPopRef.current = false;
        return;
      }

      // Priority 1: If any modal or drawer is open, close it! User stays on current page
      if (isAnyModalOpen || modalOpenCountRef.current > 0) {
        isPoppingRef.current = true;
        modalOpenCountRef.current = 0;

        setIsMobileMenuOpen(false);
        setIsDonationModalOpen(false);
        setEditingDonation(undefined);
        setIsExpenseModalOpen(false);
        setEditingExpense(undefined);
        closeReceiptModal();
        closeAuthModal();

        setTimeout(() => {
          isPoppingRef.current = false;
        }, 50);
        return;
      }

      // Priority 2: Navigate tabs / landing page based on history state / hash
      const hash = window.location.hash.replace('#', '').split('?')[0];
      const validTabs = ['dashboard', 'donations', 'expenses', 'ledger', 'reports', 'settings'];

      if (hash === 'landing' || (!hash && sessionStorage.getItem('gu_entry_visited') !== 'true')) {
        setHasSelectedEntry(false);
        return;
      }

      if (validTabs.includes(hash)) {
        setHasSelectedEntry(true);
        setActiveTab(hash);
        return;
      }

      // Fallback: If hash is empty but session is visited, show dashboard
      if (sessionStorage.getItem('gu_entry_visited') === 'true') {
        setHasSelectedEntry(true);
        setActiveTab('dashboard');
      } else {
        setHasSelectedEntry(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isAnyModalOpen,
    closeReceiptModal,
    closeAuthModal,
  ]);

  const handleOpenDonationModal = (donation?: Donation) => {
    setEditingDonation(donation);
    setIsDonationModalOpen(true);
  };

  const handleOpenExpenseModal = (expense?: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSelectTab = useCallback((tab: string, pushHistory = true) => {
    if (tab === 'landing') {
      setHasSelectedEntry(false);
      sessionStorage.removeItem('gu_entry_visited');
      setIsMobileMenuOpen(false);
      if (pushHistory) {
        window.history.pushState({ tab: 'landing', hasSelectedEntry: false }, '', '#landing');
      }
      return;
    }

    const targetTab = (tab === 'settings' && !isAdmin) ? 'dashboard' : tab;
    setHasSelectedEntry(true);
    sessionStorage.setItem('gu_entry_visited', 'true');
    setActiveTab(targetTab);
    setIsMobileMenuOpen(false);

    if (pushHistory) {
      const currentHash = window.location.hash.replace('#', '').split('?')[0];
      if (currentHash !== targetTab) {
        window.history.pushState({ tab: targetTab, hasSelectedEntry: true }, '', `#${targetTab}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAdmin]);

  const handleGoBack = useCallback(() => {
    if (isAnyModalOpen) {
      setIsMobileMenuOpen(false);
      setIsDonationModalOpen(false);
      setEditingDonation(undefined);
      setIsExpenseModalOpen(false);
      setEditingExpense(undefined);
      closeReceiptModal();
      closeAuthModal();
      return;
    }

    if (activeTab !== 'dashboard') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        handleSelectTab('dashboard', true);
      }
    } else {
      handleSelectTab('landing', true);
    }
  }, [isAnyModalOpen, activeTab, handleSelectTab, closeReceiptModal, closeAuthModal]);

  const handleContinueViewer = () => {
    setHasSelectedEntry(true);
    sessionStorage.setItem('gu_entry_visited', 'true');
    setActiveTab('dashboard');
    window.history.pushState({ tab: 'dashboard', hasSelectedEntry: true }, '', '#dashboard');
  };

  const handleLoginAdminFromLanding = () => {
    openAuthModal();
  };

  // If visitor hasn't completed entry choice, display the grand landing page with Chhatrapati Shivaji Maharaj & Sai Baba banner
  if (!hasSelectedEntry) {
    return (
      <>
        <LandingPage
          onContinueViewer={handleContinueViewer}
          onLoginAdmin={handleLoginAdminFromLanding}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
        />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-['Mukta',sans-serif] text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          onOpenDonationModal={() => handleOpenDonationModal()}
          onOpenExpenseModal={() => handleOpenExpenseModal()}
        />
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-slate-900 h-full flex flex-col z-10 shadow-2xl">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onOpenDonationModal={() => {
                setIsMobileMenuOpen(false);
                handleOpenDonationModal();
              }}
              onOpenExpenseModal={() => {
                setIsMobileMenuOpen(false);
                handleOpenExpenseModal();
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onGoLanding={() => handleSelectTab('landing')}
          onOpenDonationModal={() => handleOpenDonationModal()}
          onOpenExpenseModal={() => handleOpenExpenseModal()}
          activeTab={activeTab}
          onBack={handleGoBack}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigate={handleSelectTab}
                onOpenDonationModal={() => handleOpenDonationModal()}
                onOpenExpenseModal={() => handleOpenExpenseModal()}
              />
            )}
            {activeTab === 'donations' && (
              <DonationsView onOpenDonationModal={handleOpenDonationModal} />
            )}
            {activeTab === 'expenses' && (
              <ExpensesView onOpenExpenseModal={handleOpenExpenseModal} />
            )}
            {activeTab === 'ledger' && <LedgerView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'settings' && (
              isAdmin ? (
                <SettingsView />
              ) : (
                <div className="p-6 sm:p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm max-w-lg mx-auto mt-8 sm:mt-12 space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">प्रवेश प्रतिबंधित (Access Restricted)</h2>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    मंडळ सेटिंग्ज केवळ अधिकृत व्यवस्थापकांसाठी राखीव आहेत. बदल करण्यासाठी कृपया लॉगिन करा.
                  </p>
                  <button
                    onClick={() => handleSelectTab('dashboard')}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                  >
                    डॅशबोर्डवर परत जा (Return to Dashboard)
                  </button>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* Modals & Portals */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false);
          setEditingDonation(undefined);
        }}
        initialData={editingDonation}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(undefined);
        }}
        initialData={editingExpense}
      />

      <ReceiptModal
        donation={selectedReceiptDonation}
        festival={activeFestival}
        onClose={closeReceiptModal}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <LanguageProvider>
          <MainLayout />
        </LanguageProvider>
      </FinanceProvider>
    </AuthProvider>
  );
}
