import {
  LayoutDashboard,
  Coins,
  CreditCard,
  BookOpen,
  FileText,
  Settings,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/formatters';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDonationModal: () => void;
  onOpenExpenseModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDonationModal,
  onOpenExpenseModal,
}) => {
  const { activeFestival, currentBalance, festivals, setActiveFestivalId } = useFinance();
  const { isAdmin, canEdit } = useAuth();
  const { t, language } = useLanguage();

  const navItems = [
    {
      id: 'dashboard',
      label: t.dashboard,
      sublabel: t.dashboardSub,
      icon: LayoutDashboard,
    },
    {
      id: 'donations',
      label: t.donations,
      sublabel: t.donationsSub,
      icon: Coins,
    },
    {
      id: 'expenses',
      label: t.expenses,
      sublabel: t.expensesSub,
      icon: CreditCard,
    },
    {
      id: 'ledger',
      label: t.ledger,
      sublabel: t.ledgerSub,
      icon: BookOpen,
    },
    {
      id: 'reports',
      label: t.reports,
      sublabel: t.reportsSub,
      icon: FileText,
    },
    ...(isAdmin
      ? [
          {
            id: 'settings',
            label: t.settings,
            sublabel: t.settingsSub,
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none overflow-y-auto font-['Mukta',sans-serif]">
      {/* Top Mandal Branding */}
      <div>
        <div className="p-4 border-b border-slate-800 bg-gradient-to-b from-amber-950/40 via-slate-950/60 to-slate-950">
          {/* Top verse & Est badge */}
          <div className="flex items-center justify-between text-[10px] font-black text-amber-400 mb-2.5">
            <span className="bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">स्थापना १९९०</span>
            <span>॥ श्री गजानन प्रसन्न ॥</span>
            <span className="bg-red-900/90 text-amber-200 px-2 py-0.5 rounded border border-amber-500/40 font-black">वर्ष ३६ वे</span>
          </div>

          <div className="text-center py-1">
            <div className="flex justify-center mb-1.5">
              <img
                src="/favicon.png"
                alt="Shree Sai Mitra Mandal Logo"
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-md"
              />
            </div>
            <h1 className="text-sm font-black text-amber-300 truncate font-['Mukta',sans-serif] leading-tight drop-shadow">
              श्री साई मित्र मंडळ
            </h1>
            <div className="text-[9px] text-amber-200/70 font-semibold tracking-wider uppercase">
              SHREE SAI MITRA MANDAL
            </div>
            <div className="text-[10px] text-red-300 font-extrabold mt-0.5 font-['Mukta',sans-serif]">
              कर्वेनगर, पुणे
            </div>
          </div>

          {/* Active Festival Selector */}
          <div className="mt-3.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {t.selectFestivalYear}
            </label>
            <select
              value={activeFestival?.id}
              onChange={e => setActiveFestivalId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {festivals.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Action Buttons: Only shown if user has canEdit permissions */}
        {canEdit && (
          <div className="p-4 grid grid-cols-2 gap-2 border-b border-slate-800">
            <button
              onClick={onOpenDonationModal}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              title={t.addDonation}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{t.donationReceiptBtn}</span>
            </button>
            <button
              onClick={onOpenExpenseModal}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              title={t.addExpense}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>{t.expenseEntryBtn}</span>
            </button>
          </div>
        )}

        {/* Navigation Menu Links */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="text-left truncate">
                    <div className="font-['Mukta',sans-serif] text-xs font-bold leading-tight">
                      {item.label}
                    </div>
                    <div className={`text-[10px] ${isActive ? 'text-amber-200' : 'text-slate-500'} font-normal`}>
                      {item.sublabel}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Account Status & Live Treasury Snapshot */}
      <div className="p-3 space-y-2.5">
        {/* Live Treasury Snapshot */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {t.liveTreasury}
          </div>
          <div className={`text-base font-black font-heading mt-0.5 ${currentBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(currentBalance)}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {t.balanceCalculationHint}
          </p>
        </div>
      </div>
    </aside>
  );
};
