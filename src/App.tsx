import React, { useState, useEffect } from 'react';
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
  // Gate: All new visitors, incognito windows, and unchosen sessions strictly see Landing Page first
  const [hasSelectedEntry, setHasSelectedEntry] = useState<boolean>(() => {
    return sessionStorage.getItem('gu_entry_visited') === 'true';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const { selectedReceiptDonation, closeReceiptModal, activeFestival } = useFinance();
  const { isAuthModalOpen, openAuthModal, closeAuthModal, isAdmin } = useAuth();

  // If user becomes authenticated as admin, ensure entry gate is passed
  useEffect(() => {
    if (isAdmin) {
      setHasSelectedEntry(true);
      sessionStorage.setItem('gu_entry_visited', 'true');
    }
  }, [isAdmin]);

  // Donation Modal State
  const [isDonationModalOpen, setIsDonationModalOpen] = useState<boolean>(false);
  const [editingDonation, setEditingDonation] = useState<Donation | undefined>(undefined);

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const handleOpenDonationModal = (donation?: Donation) => {
    setEditingDonation(donation);
    setIsDonationModalOpen(true);
  };

  const handleOpenExpenseModal = (expense?: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSelectTab = (tab: string) => {
    if (tab === 'landing') {
      setHasSelectedEntry(false);
      sessionStorage.removeItem('gu_entry_visited');
      setIsMobileMenuOpen(false);
      return;
    }
    if (tab === 'settings' && !isAdmin) {
      setActiveTab('dashboard');
      setIsMobileMenuOpen(false);
      return;
    }
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueViewer = () => {
    setHasSelectedEntry(true);
    sessionStorage.setItem('gu_entry_visited', 'true');
    setActiveTab('dashboard');
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
                    onClick={() => setActiveTab('dashboard')}
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
