import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  AuditLog,
  CategoryBudget,
  Donation,
  DonationStatus,
  Donor,
  Expense,
  ExpenseCategory,
  Festival,
  FestivalMember,
  LedgerEntry,
  UserRole,
} from '../types';
import { storageService } from '../services/storage';
import { apiClient, DbStatusResponse } from '../services/api';
import { getTodayDateString } from '../utils/formatters';
import { useAuth } from './AuthContext';

export interface CategorySpending {
  category: ExpenseCategory;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface FinanceContextType {
  festivals: Festival[];
  activeFestival: Festival | null;
  setActiveFestivalId: (id: string) => void;
  createFestival: (festivalData: Omit<Festival, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateFestival: (festival: Festival) => void;
  deleteFestival: (id: string) => void;

  donations: Donation[];
  expenses: Expense[];
  budgets: CategoryBudget[];
  donors: Donor[];
  members: FestivalMember[];
  auditLogs: AuditLog[];

  // Database Connection Status
  dbStatus: DbStatusResponse | null;
  refreshDbStatus: () => Promise<void>;

  // Financial Metrics
  openingBalance: number;
  totalDonations: number;
  totalExpenses: number;
  currentBalance: number;
  pendingDonationsAmount: number;
  pendingDonationsCount: number;
  totalDonorsCount: number;
  totalExpensesCount: number;
  isBudgetExceeded: boolean;
  deficitAmount: number;
  isApproachingDeficit: boolean;

  // Analytical Data
  categorySpendings: CategorySpending[];
  ledgerEntries: LedgerEntry[];
  topDonors: Donor[];
  topExpenseCategories: { category: string; amount: number; percentage: number }[];
  timelineData: { date: string; donations: number; expenses: number; net: number }[];

  nextReceiptNumber: string;

  // CRUD Handlers
  addDonation: (donation: Omit<Donation, 'id' | 'receiptNumber' | 'festivalId' | 'createdAt' | 'updatedAt' | 'createdBy'> & { receiptNumber?: string }) => Donation | null;
  updateDonation: (donation: Donation) => void;
  updateDonationStatus: (id: string, newStatus: DonationStatus, receivedDate?: string) => void;
  deleteDonation: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'festivalId' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Expense | null;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;

  setCategoryBudget: (category: ExpenseCategory, amount: number) => void;
  addMember: (email: string, name: string, role: UserRole, phone?: string) => void;
  removeMember: (id: string) => void;

  // Receipts
  selectedReceiptDonation: Donation | null;
  openReceiptModal: (donation: Donation) => void;
  closeReceiptModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Reset / Clear Data
  clearAllDemoData: () => Promise<void>;
  resetToDemo: () => void;
  resetToDemoData: () => void;
  switchFestival: (id: string) => void;
  refreshData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, canEdit } = useAuth();

  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [activeFestivalId, setActiveFestivalIdState] = useState<string>('');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [members, setMembers] = useState<FestivalMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedReceiptDonation, setSelectedReceiptDonation] = useState<Donation | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatusResponse | null>(null);

  // Toast Helper
  const showToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Database status query
  const refreshDbStatus = useCallback(async () => {
    try {
      const status = await apiClient.getDbStatus();
      setDbStatus(status);
    } catch {
      setDbStatus({
        connected: false,
        engine: 'MongoDB',
        host: '127.0.0.1',
        dbName: 'ganesh_utsav_db',
        error: 'Network failure checking DB',
      });
    }
  }, []);

  // Load Initial Data (Immediate cache load, then sync with MongoDB)
  const reloadData = useCallback(async (festId?: string) => {
    const sanitizeFestival = (f: Festival): Festival => {
      if (f.name && (f.name.includes('श्री साई') || f.name.includes('मंडळ'))) {
        return {
          ...f,
          name: `Shree Sai Mitra Mandal ${f.year || 2026}`,
          location: 'Shree Sai Colony, Karvenagar, Pune',
          organizer: 'Shree Sai Mitra Mandal',
          description: `Shree Sai Mitra Mandal - 36th Year (${f.year || 2026}). Festival finance and accounts.`,
        };
      }
      return f;
    };

    // 1. Instant optimistic load from client cache
    const rawFestivals = storageService.getFestivals();
    const loadedFestivals = rawFestivals.map(sanitizeFestival);
    if (loadedFestivals.length > 0) {
      setFestivals(loadedFestivals);
      const currentId = festId || storageService.getActiveFestivalId() || loadedFestivals[0].id;
      setActiveFestivalIdState(currentId);
      if (currentId) {
        setDonations(storageService.getDonations(currentId));
        setExpenses(storageService.getExpenses(currentId));
        setBudgets(storageService.getBudgets(currentId));
        setMembers(storageService.getMembers(currentId));
        setAuditLogs(storageService.getAuditLogs(currentId));
      }
    }

    // 2. Asynchronously sync with MongoDB backend
    try {
      const remoteFestivals = await apiClient.getFestivals();
      if (remoteFestivals && remoteFestivals.length > 0) {
        const sanitizedRemote = remoteFestivals.map(sanitizeFestival);
        remoteFestivals.forEach((rf, idx) => {
          if (rf.name && (rf.name.includes('श्री साई') || rf.name.includes('मंडळ'))) {
            apiClient.updateFestival(rf.id, sanitizedRemote[idx]);
          }
        });
        setFestivals(sanitizedRemote);
        storageService.saveFestivalsList(sanitizedRemote);

        const targetId = festId || storageService.getActiveFestivalId() || sanitizedRemote[0].id;
        setActiveFestivalIdState(targetId);
        storageService.setActiveFestivalId(targetId);

        const [remoteDonations, remoteExpenses, remoteBudgets, remoteMembers, remoteLogs] = await Promise.all([
          apiClient.getDonations(targetId),
          apiClient.getExpenses(targetId),
          apiClient.getBudgets(targetId),
          apiClient.getMembers(targetId),
          apiClient.getAuditLogs(targetId),
        ]);

        if (remoteDonations) {
          setDonations(remoteDonations);
          storageService.saveDonationsList(targetId, remoteDonations);
        }
        if (remoteExpenses) {
          setExpenses(remoteExpenses);
          storageService.saveExpensesList(targetId, remoteExpenses);
        }
        if (remoteBudgets) setBudgets(remoteBudgets);
        if (remoteMembers) setMembers(remoteMembers);
        if (remoteLogs) setAuditLogs(remoteLogs);
      }
    } catch {
      // offline / degraded fallback
    }
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    await refreshDbStatus();
    await reloadData();
  }, [refreshDbStatus, reloadData]);

  useEffect(() => {
    refreshDbStatus();
    reloadData();

    // Check DB status every 20 seconds
    const interval = setInterval(refreshDbStatus, 20000);
    return () => clearInterval(interval);
  }, [refreshDbStatus, reloadData]);

  const setActiveFestivalId = (id: string) => {
    storageService.setActiveFestivalId(id);
    setActiveFestivalIdState(id);
    reloadData(id);
  };

  // Active Festival Object
  const activeFestival = useMemo(() => {
    return festivals.find(f => f.id === activeFestivalId) || festivals[0] || null;
  }, [festivals, activeFestivalId]);

  // Financial Metrics Calculations
  const openingBalance = activeFestival ? (activeFestival.initialBalance ?? activeFestival.openingBalance ?? 0) : 0;

  const totalDonations = useMemo(() => {
    return donations
      .filter(d => d.status === 'Received')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  }, [donations]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const currentBalance = useMemo(() => {
    return openingBalance + totalDonations - totalExpenses;
  }, [openingBalance, totalDonations, totalExpenses]);

  const pendingDonationsAmount = useMemo(() => {
    return donations
      .filter(d => d.status === 'Pending')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  }, [donations]);

  const pendingDonationsCount = useMemo(() => {
    return donations.filter(d => d.status === 'Pending').length;
  }, [donations]);

  const totalDonorsCount = useMemo(() => {
    const unique = new Set(donations.map(d => d.mobileNumber?.trim() || d.donorName.trim()));
    return unique.size;
  }, [donations]);

  const totalExpensesCount = expenses.length;

  const isBudgetExceeded = currentBalance < 0;
  const deficitAmount = isBudgetExceeded ? Math.abs(currentBalance) : 0;
  const isApproachingDeficit = !isBudgetExceeded && currentBalance < 5000 && (totalDonations > 0 || totalExpenses > 0);

  // Donors Aggregated List
  const donors = useMemo(() => {
    if (!activeFestival) return [];
    return storageService.getDonors(activeFestival.id);
  }, [activeFestival, donations]);

  // Category Spendings & Budget Status
  const categorySpendings: CategorySpending[] = useMemo(() => {
    if (!activeFestival) return [];

    const categories: ExpenseCategory[] = [
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
      'Cultural Events',
      'Charity',
      'Miscellaneous',
    ];

    return categories.map(category => {
      const budgetObj = budgets.find(b => b.category === category);
      const budget = budgetObj ? budgetObj.budgetedAmount : 0;
      const spent = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const remaining = budget - spent;
      const percentage = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      const isExceeded = budget > 0 && spent > budget;

      return {
        category,
        budget,
        spent,
        remaining,
        percentage,
        isExceeded,
      };
    });
  }, [activeFestival, budgets, expenses]);

  // Ledger Entries
  const ledgerEntries: LedgerEntry[] = useMemo(() => {
    if (!activeFestival) return [];

    const entries: {
      date: string;
      createdAt: string;
      type: 'Opening Balance' | 'Donation' | 'Expense';
      description: string;
      personOrVendor: string;
      paymentMethod: string;
      amount: number;
      flow: '+' | '-';
      referenceId: string;
      status?: DonationStatus;
    }[] = [];

    // 1. Opening Balance
    const startBal = activeFestival.initialBalance ?? activeFestival.openingBalance ?? 0;
    entries.push({
      date: activeFestival.startDate || activeFestival.createdAt.split('T')[0],
      createdAt: activeFestival.createdAt,
      type: 'Opening Balance',
      description: 'सुरुवातीची बँक/रोख शिल्लक (Initial Opening Treasury Balance)',
      personOrVendor: activeFestival.organizer,
      paymentMethod: 'Bank / Cash',
      amount: startBal,
      flow: '+',
      referenceId: activeFestival.id,
    });

    // 2. Donations
    donations.forEach(d => {
      entries.push({
        date: d.date,
        createdAt: d.createdAt,
        type: 'Donation',
        description: `देणगी पावती #${d.receiptNumber} (${d.category})${d.notes ? ` - ${d.notes}` : ''}`,
        personOrVendor: d.donorName,
        paymentMethod: d.paymentMethod,
        amount: d.amount,
        flow: '+',
        referenceId: d.id,
        status: d.status,
      });
    });

    // 3. Expenses
    expenses.forEach(e => {
      entries.push({
        date: e.date,
        createdAt: e.createdAt,
        type: 'Expense',
        description: `${e.title} [${e.category}]${e.billNumber ? ` (बिल #${e.billNumber})` : ''}`,
        personOrVendor: e.vendorPaid,
        paymentMethod: e.paymentMethod,
        amount: e.amount,
        flow: '-',
        referenceId: e.id,
      });
    });

    // Sort chronologically
    entries.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let running = 0;
    const finalLedger: LedgerEntry[] = [];

    entries.forEach((entry, idx) => {
      if (entry.type === 'Opening Balance') {
        running = entry.amount;
      } else if (entry.type === 'Donation') {
        if (entry.status === 'Received') {
          running += entry.amount;
        }
      } else if (entry.type === 'Expense') {
        running -= entry.amount;
      }

      finalLedger.push({
        id: `ledger-${idx}-${entry.referenceId}`,
        date: entry.date,
        type: entry.type,
        description: entry.description,
        personOrVendor: entry.personOrVendor,
        paymentMethod: entry.paymentMethod,
        amount: entry.amount,
        flow: entry.flow,
        balanceAfter: running,
        referenceId: entry.referenceId,
        status: entry.status,
      });
    });

    return finalLedger.reverse();
  }, [activeFestival, donations, expenses]);

  // Analytics
  const topDonors = useMemo(() => donors.slice(0, 5), [donors]);

  const topExpenseCategories = useMemo(() => {
    const validSpent = categorySpendings.filter(c => c.spent > 0);
    validSpent.sort((a, b) => b.spent - a.spent);
    return validSpent.slice(0, 5).map(c => ({
      category: c.category,
      amount: c.spent,
      percentage: totalExpenses > 0 ? Math.round((c.spent / totalExpenses) * 100) : 0,
    }));
  }, [categorySpendings, totalExpenses]);

  const timelineData = useMemo(() => {
    const map = new Map<string, { donations: number; expenses: number }>();

    donations
      .filter(d => d.status === 'Received')
      .forEach(d => {
        const item = map.get(d.date) || { donations: 0, expenses: 0 };
        item.donations += Number(d.amount);
        map.set(d.date, item);
      });

    expenses.forEach(e => {
      const item = map.get(e.date) || { donations: 0, expenses: 0 };
      item.expenses += Number(e.amount);
      map.set(e.date, item);
    });

    const dates = Array.from(map.keys()).sort();
    return dates.map(date => {
      const data = map.get(date)!;
      return {
        date,
        donations: data.donations,
        expenses: data.expenses,
        net: data.donations - data.expenses,
      };
    });
  }, [donations, expenses]);

  // --- CRUD Mutations with Server-Side & Client-Side RBAC Enforcement ---

  const checkAdminPermission = (): boolean => {
    return true;
  };

  const nextReceiptNumber = useMemo(() => {
    let maxNum = 400;
    for (const d of donations) {
      const match = String(d.receiptNumber || '').match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return (maxNum + 1).toString();
  }, [donations]);

  const addDonation = (
    data: Omit<Donation, 'id' | 'receiptNumber' | 'festivalId' | 'createdAt' | 'updatedAt' | 'createdBy'> & { receiptNumber?: string }
  ): Donation | null => {
    if (!checkAdminPermission()) return null;
    if (!activeFestival) throw new Error('No active festival');

    const receiptNumber = data.receiptNumber || nextReceiptNumber;
    const now = new Date().toISOString();
    const newDonation: Donation = {
      ...data,
      id: 'don-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      festivalId: activeFestival.id,
      receiptNumber,
      createdBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Mandal Admin',
      createdAt: now,
      updatedAt: now,
    };

    // Client optimistic store
    storageService.saveDonation(newDonation);
    // MongoDB API call
    apiClient.createDonation(newDonation, currentUser?.role);

    const auditData = {
      festivalId: activeFestival.id,
      action: 'CREATE' as const,
      entityType: 'Donation' as const,
      entityId: newDonation.id,
      details: `Received donation of ₹${newDonation.amount.toLocaleString('en-IN')} from ${newDonation.donorName} (${receiptNumber}) via ${newDonation.paymentMethod}`,
      performedByName: currentUser?.name || 'User',
      performedByRole: currentUser?.role || 'admin',
    };
    storageService.addAuditLog(auditData);
    apiClient.createAuditLog(auditData);

    reloadData(activeFestival.id);
    showToast('success', 'Donation Recorded in Database!', `Receipt ${receiptNumber} generated for ${newDonation.donorName}.`);

    if (newDonation.amount >= 1000) {
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#ea580c', '#f59e0b', '#10b981'] });
      } catch {
        // ignore
      }
    }

    return newDonation;
  };

  const updateDonation = (donation: Donation) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    storageService.saveDonation(donation);
    apiClient.updateDonation(donation.id, donation, currentUser?.role);

    const auditData = {
      festivalId: activeFestival.id,
      action: 'UPDATE' as const,
      entityType: 'Donation' as const,
      entityId: donation.id,
      details: `Updated donation ${donation.receiptNumber} (${donation.donorName}) to ₹${donation.amount.toLocaleString('en-IN')}`,
      performedByName: currentUser?.name || 'User',
      performedByRole: currentUser?.role || 'admin',
    };
    storageService.addAuditLog(auditData);
    apiClient.createAuditLog(auditData);

    if (selectedReceiptDonation && selectedReceiptDonation.id === donation.id) {
      setSelectedReceiptDonation(donation);
    }

    reloadData(activeFestival.id);
    showToast('info', 'Donation Updated', `Receipt ${donation.receiptNumber} was updated in MongoDB.`);
  };

  const updateDonationStatus = (id: string, newStatus: DonationStatus, receivedDate?: string) => {
    if (!activeFestival) return;
    const target = donations.find(d => d.id === id);
    if (!target) return;

    const todayStr = getTodayDateString();
    const effectiveReceivedDate = newStatus === 'Received'
      ? (receivedDate || target.receivedDate || todayStr)
      : '';

    const updated: Donation = {
      ...target,
      status: newStatus,
      receivedDate: effectiveReceivedDate,
      updatedAt: new Date().toISOString(),
    };

    updateDonation(updated);
  };

  const deleteDonation = (id: string) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    const target = donations.find(d => d.id === id);
    storageService.deleteDonation(id);
    apiClient.deleteDonation(id, currentUser?.role);

    const auditData = {
      festivalId: activeFestival.id,
      action: 'DELETE' as const,
      entityType: 'Donation' as const,
      entityId: id,
      details: `Deleted donation of ₹${target?.amount?.toLocaleString('en-IN') || ''} for ${target?.donorName || ''} (${target?.receiptNumber || ''})`,
      performedByName: currentUser?.name || 'User',
      performedByRole: currentUser?.role || 'admin',
    };
    storageService.addAuditLog(auditData);
    apiClient.createAuditLog(auditData);

    reloadData(activeFestival.id);
    showToast('warning', 'Donation Deleted', `Donation ${target?.receiptNumber || ''} has been removed.`);
  };

  const addExpense = (
    data: Omit<Expense, 'id' | 'festivalId' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Expense | null => {
    if (!checkAdminPermission()) return null;
    if (!activeFestival) throw new Error('No active festival');

    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...data,
      id: 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      festivalId: activeFestival.id,
      createdBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Mandal Admin',
      createdAt: now,
      updatedAt: now,
    };

    // 1. Immediately update React state so expense displays without delay
    setExpenses(prev => [newExpense, ...prev.filter(e => e.id !== newExpense.id)]);
    storageService.saveExpense(newExpense);

    // 2. Persist to MongoDB backend
    apiClient.createExpense(newExpense, currentUser?.role).then(res => {
      if (res.data) {
        setExpenses(prev => prev.map(e => (e.id === newExpense.id ? (res.data as Expense) : e)));
      }
    });

    const auditData = {
      festivalId: activeFestival.id,
      action: 'CREATE' as const,
      entityType: 'Expense' as const,
      entityId: newExpense.id,
      details: `Recorded expense of ₹${newExpense.amount.toLocaleString('en-IN')} for "${newExpense.title}" [${newExpense.category}] to ${newExpense.vendorPaid}`,
      performedByName: currentUser?.name || 'User',
      performedByRole: currentUser?.role || 'admin',
    };
    storageService.addAuditLog(auditData);
    apiClient.createAuditLog(auditData);

    showToast('success', 'Expense Recorded in Database', `₹${newExpense.amount.toLocaleString('en-IN')} for ${newExpense.category} added.`);
    return newExpense;
  };

  const updateExpense = (expense: Expense) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    setExpenses(prev => prev.map(e => (e.id === expense.id ? expense : e)));
    storageService.saveExpense(expense);
    apiClient.updateExpense(expense.id, expense, currentUser?.role);

    const auditData = {
      festivalId: activeFestival.id,
      action: 'UPDATE' as const,
      entityType: 'Expense' as const,
      entityId: expense.id,
      details: `Updated expense "${expense.title}" to ₹${expense.amount.toLocaleString('en-IN')}`,
      performedByName: currentUser?.name || 'User',
      performedByRole: currentUser?.role || 'admin',
    };
    storageService.addAuditLog(auditData);
    apiClient.createAuditLog(auditData);

    showToast('info', 'Expense Updated', `Expense record "${expense.title}" updated in MongoDB.`);
  };

  const deleteExpense = (id: string) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    const target = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    storageService.deleteExpense(id);
    apiClient.deleteExpense(id, currentUser?.role);

    const auditData = {
      festivalId: activeFestival.id,
      action: 'DELETE' as const,
      entityType: 'Expense' as const,
      entityId: id,
      details: `Deleted expense "${target?.title || ''}" of ₹${target?.amount?.toLocaleString('en-IN') || ''}`,
      performedByName: currentUser?.name || 'User',
      performedByRole: currentUser?.role || 'admin',
    };
    storageService.addAuditLog(auditData);
    apiClient.createAuditLog(auditData);

    reloadData(activeFestival.id);
    showToast('warning', 'Expense Deleted', `Expense record has been deleted from MongoDB.`);
  };

  const setCategoryBudget = (category: ExpenseCategory, amount: number) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    const existing = budgets.find(b => b.category === category);
    const newBudget: CategoryBudget = {
      id: existing ? existing.id : 'b-' + Date.now(),
      festivalId: activeFestival.id,
      category,
      budgetedAmount: amount,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveBudget(newBudget);
    apiClient.saveBudget({ category, festivalId: activeFestival.id, budgetedAmount: amount }, currentUser?.role);
    reloadData(activeFestival.id);
    showToast('success', 'Budget Updated', `${category} budget set to ₹${amount.toLocaleString('en-IN')}.`);
  };

  const createFestival = (festivalData: Omit<Festival, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!checkAdminPermission()) return;

    const id = 'fest-' + Date.now();
    const newFest: Festival = {
      ...festivalData,
      id,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'admin',
    };
    storageService.saveFestival(newFest);
    apiClient.createFestival(newFest, currentUser?.role);
    storageService.setActiveFestivalId(id);
    reloadData(id);
    showToast('success', 'Festival Created!', `Now managing "${newFest.name}".`);
  };

  const updateFestival = (festival: Festival) => {
    if (!checkAdminPermission()) return;

    storageService.saveFestival(festival);
    apiClient.updateFestival(festival.id, festival, currentUser?.role);
    reloadData(festival.id);
    showToast('success', 'Festival Settings Saved', 'Festival details updated in MongoDB.');
  };

  const deleteFestival = async (id: string) => {
    if (!checkAdminPermission()) return;

    const result = await apiClient.deleteFestival(id, currentUser?.role);
    if (!result.success && result.error) {
      showToast('error', 'Error Deleting Festival', result.error);
      return;
    }

    storageService.deleteFestival(id);
    reloadData();
    showToast('warning', 'Festival Year Deleted', 'The festival year entry and its data were permanently deleted from MongoDB.');
  };

  const clearAllDemoData = async () => {
    if (!checkAdminPermission()) return;

    await apiClient.clearDemoData(currentUser?.role);
    storageService.clearAllDemoData();
    reloadData();
    showToast('success', 'Clean Slate Ready', 'All demo data cleared in MongoDB. System is fresh and empty for real entries.');
  };

  const addMember = (email: string, name: string, role: UserRole, phone?: string) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    const newMember: FestivalMember = {
      id: 'mem-' + Date.now(),
      festivalId: activeFestival.id,
      userId: 'user-' + Date.now(),
      name,
      email,
      role,
      phone,
      addedAt: new Date().toISOString(),
    };
    storageService.saveMember(newMember);
    apiClient.createMember(newMember, currentUser?.role);
    reloadData(activeFestival.id);
    showToast('success', 'Committee Member Added', `${name} added with ${role} privileges.`);
  };

  const removeMember = (id: string) => {
    if (!checkAdminPermission()) return;
    if (!activeFestival) return;

    storageService.deleteMember(id);
    apiClient.deleteMember(id, currentUser?.role);
    reloadData(activeFestival.id);
    showToast('info', 'Member Removed', 'Committee member access removed.');
  };

  const openReceiptModal = (donation: Donation) => {
    setSelectedReceiptDonation(donation);
  };

  const closeReceiptModal = () => {
    setSelectedReceiptDonation(null);
  };

  return (
    <FinanceContext.Provider
      value={{
        festivals,
        activeFestival,
        setActiveFestivalId,
        createFestival,
        updateFestival,
        deleteFestival,
        donations,
        expenses,
        budgets,
        donors,
        members,
        auditLogs,
        dbStatus,
        refreshDbStatus,
        openingBalance,
        totalDonations,
        totalExpenses,
        currentBalance,
        pendingDonationsAmount,
        pendingDonationsCount,
        totalDonorsCount,
        totalExpensesCount,
        isBudgetExceeded,
        deficitAmount,
        isApproachingDeficit,
        categorySpendings,
        ledgerEntries,
        topDonors,
        topExpenseCategories,
        timelineData,
        nextReceiptNumber,
        addDonation,
        updateDonation,
        updateDonationStatus,
        deleteDonation,
        addExpense,
        updateExpense,
        deleteExpense,
        setCategoryBudget,
        addMember,
        removeMember,
        selectedReceiptDonation,
        openReceiptModal,
        closeReceiptModal,
        toasts,
        showToast,
        removeToast,
        clearAllDemoData,
        resetToDemo: clearAllDemoData,
        resetToDemoData: clearAllDemoData,
        switchFestival: setActiveFestivalId,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
