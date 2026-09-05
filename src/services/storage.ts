import {
  AuditLog,
  CategoryBudget,
  Donation,
  Donor,
  Expense,
  ExpenseCategory,
  Festival,
  FestivalMember,
  LedgerEntry,
  User,
} from '../types';

export interface MediaItem {
  id: string;
  label: string;
  name: string;
  type: string;
  url?: string;
  dataUrl?: string;
  description?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: 'gu_users_v2',
  CURRENT_USER: 'gu_current_user_v2',
  CURRENT_ROLE: 'gu_current_role_v1',
  FESTIVALS: 'gu_festivals_v2',
  ACTIVE_FESTIVAL_ID: 'gu_active_festival_id_v2',
  DONATIONS: 'gu_donations_v2',
  EXPENSES: 'gu_expenses_v2',
  BUDGETS: 'gu_budgets_v2',
  MEMBERS: 'gu_members_v2',
  AUDIT_LOGS: 'gu_audit_logs_v2',
  MEDIA: 'gu_media_v2',
  IS_FRESH_INITIALIZED: 'gu_fresh_v2',
};

// Clean fresh starting Festival (36th Year - Est 1990)
const DEFAULT_FESTIVALS: Festival[] = [
  {
    id: 'fest-2026',
    name: 'Shree Sai Mitra Mandal 2026',
    year: 2026,
    startDate: '2026-09-01',
    endDate: '2026-09-11',
    location: 'Shree Sai Colony, Karvenagar, Pune',
    organizer: 'Shree Sai Mitra Mandal',
    description: 'Shree Sai Mitra Mandal - 36th Year. Ganeshotsav festival finance, donations, vouchers, and ledger balance sheet.',
    initialBalance: 0, // Clean starting balance
    registrationNumber: 'MAH/PUN/2026/SSM-108',
    createdAt: new Date().toISOString(),
    createdBy: 'user-admin',
  },
];

// Role-Based Access Users: Admin & Viewer
const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Mandal Admin',
    email: 'admin@ganeshutsav.org',
    phone: '+91 98765 43210',
    role: 'admin',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'user-viewer',
    name: 'Committee Viewer',
    email: 'viewer@ganeshutsav.org',
    phone: '+91 98900 67890',
    role: 'viewer',
    createdAt: '2026-08-10T00:00:00.000Z',
  },
];

// Media Library with the user-provided banner labeled "CHH Shivaji Maharaj and Sai Baba"
const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'media-banner-shivaji-sai',
    label: 'CHH Shivaji Maharaj and Sai Baba',
    name: 'CHH Shivaji Maharaj and Sai Baba',
    type: 'banner',
    description: 'Official festival banner artwork with Chhatrapati Shivaji Maharaj and Shirdi Sai Baba for Shree Sai Mitra Mandal, Karvenagar, Pune (36th Year)',
    createdAt: new Date().toISOString(),
  },
];

class StorageService {
  constructor() {
    this.ensureFreshInitialState();
  }

  private ensureFreshInitialState() {
    // If running for the first time with v2 keys, wipe old dummy data from v1
    try {
      if (!localStorage.getItem(STORAGE_KEYS.IS_FRESH_INITIALIZED)) {
        // Clear all previous dummy storage items
        localStorage.removeItem('gu_donations_v1');
        localStorage.removeItem('gu_expenses_v1');
        localStorage.removeItem('gu_festivals_v1');
        localStorage.removeItem('gu_audit_logs_v1');
        localStorage.removeItem('gu_budgets_v1');
        localStorage.removeItem('gu_users_v1');
        localStorage.removeItem('gu_members_v1');

        // Set clean defaults - strictly start as Viewer / Guest
        localStorage.setItem(STORAGE_KEYS.FESTIVALS, JSON.stringify(DEFAULT_FESTIVALS));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_FESTIVAL_ID, JSON.stringify(DEFAULT_FESTIVALS[0].id));
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, 'viewer');
        localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(DEFAULT_MEDIA));
        localStorage.setItem(STORAGE_KEYS.IS_FRESH_INITIALIZED, 'true');
      }
    } catch {
      // localStorage may fail in sandboxed or server environments
    }
  }

  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  // --- Auth & Users ---
  getUsers(): User[] {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    if (!users.length) {
      this.set(STORAGE_KEYS.USERS, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return users;
  }

  getCurrentUser(): User | null {
    const user = this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (user) return user;
    return null;
  }

  setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, 'viewer');
    } else {
      this.set(STORAGE_KEYS.CURRENT_USER, user);
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, user.role);
    }
  }

  // Switch role between 'admin' and 'viewer'
  switchUserRole(role: 'admin' | 'viewer'): User | null {
    if (role === 'viewer') {
      this.setCurrentUser(null);
      return null;
    }
    const users = this.getUsers();
    const target = users.find(u => u.role.toLowerCase() === 'admin') || DEFAULT_USERS[0];
    this.setCurrentUser(target);
    return target;
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.set(STORAGE_KEYS.USERS, users);
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  // --- Media Library ---
  getMedia(): MediaItem[] {
    const media = this.get<MediaItem[]>(STORAGE_KEYS.MEDIA, []);
    if (!media.length) {
      this.set(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
      return DEFAULT_MEDIA;
    }
    return media;
  }

  saveMediaItem(item: MediaItem): void {
    const all = this.getMedia();
    const index = all.findIndex(m => m.id === item.id || m.label === item.label);
    if (index >= 0) {
      all[index] = item;
    } else {
      all.unshift(item);
    }
    this.set(STORAGE_KEYS.MEDIA, all);
  }

  // --- Festivals ---
  getFestivals(): Festival[] {
    const festivals = this.get<Festival[]>(STORAGE_KEYS.FESTIVALS, []);
    if (!festivals.length) {
      this.set(STORAGE_KEYS.FESTIVALS, DEFAULT_FESTIVALS);
      return DEFAULT_FESTIVALS;
    }
    return festivals;
  }

  getActiveFestivalId(): string {
    const id = this.get<string | null>(STORAGE_KEYS.ACTIVE_FESTIVAL_ID, null);
    if (!id) {
      const defaultId = DEFAULT_FESTIVALS[0].id;
      this.setActiveFestivalId(defaultId);
      return defaultId;
    }
    return id;
  }

  setActiveFestivalId(id: string): void {
    this.set(STORAGE_KEYS.ACTIVE_FESTIVAL_ID, id);
  }

  saveFestivalsList(festivals: Festival[]): void {
    this.set(STORAGE_KEYS.FESTIVALS, festivals);
  }

  saveFestival(festival: Festival): void {
    const festivals = this.getFestivals();
    const index = festivals.findIndex(f => f.id === festival.id);
    if (index >= 0) {
      festivals[index] = festival;
    } else {
      festivals.unshift(festival);
    }
    this.set(STORAGE_KEYS.FESTIVALS, festivals);
  }

  deleteFestival(id: string): void {
    const festivals = this.getFestivals().filter(f => f.id !== id);
    this.set(STORAGE_KEYS.FESTIVALS, festivals);

    // Clean up donations, expenses, budgets for the deleted festival
    const allDonations = this.get<Donation[]>(STORAGE_KEYS.DONATIONS, []).filter(d => d.festivalId !== id);
    this.set(STORAGE_KEYS.DONATIONS, allDonations);

    const allExpenses = this.get<Expense[]>(STORAGE_KEYS.EXPENSES, []).filter(e => e.festivalId !== id);
    this.set(STORAGE_KEYS.EXPENSES, allExpenses);

    const allBudgets = this.get<CategoryBudget[]>(STORAGE_KEYS.BUDGETS, []).filter(b => b.festivalId !== id);
    this.set(STORAGE_KEYS.BUDGETS, allBudgets);

    // If active festival was deleted, switch to the remaining one or fallback
    if (this.getActiveFestivalId() === id) {
      if (festivals.length > 0) {
        this.setActiveFestivalId(festivals[0].id);
      } else {
        // Recreate default 36th year if all deleted
        this.set(STORAGE_KEYS.FESTIVALS, DEFAULT_FESTIVALS);
        this.setActiveFestivalId(DEFAULT_FESTIVALS[0].id);
      }
    }
  }

  // --- Members ---
  getMembers(festivalId: string): FestivalMember[] {
    const all = this.get<FestivalMember[]>(STORAGE_KEYS.MEMBERS, []);
    return all.filter(m => m.festivalId === festivalId);
  }

  saveMember(member: FestivalMember): void {
    const all = this.get<FestivalMember[]>(STORAGE_KEYS.MEMBERS, []);
    const index = all.findIndex(m => m.id === member.id);
    if (index >= 0) {
      all[index] = member;
    } else {
      all.push(member);
    }
    this.set(STORAGE_KEYS.MEMBERS, all);
  }

  deleteMember(id: string): void {
    const all = this.get<FestivalMember[]>(STORAGE_KEYS.MEMBERS, []).filter(m => m.id !== id);
    this.set(STORAGE_KEYS.MEMBERS, all);
  }

  // --- Donations ---
  getDonations(festivalId: string): Donation[] {
    const all = this.get<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    return all.filter(d => d.festivalId === festivalId);
  }

  saveDonation(donation: Donation): void {
    const all = this.get<Donation[]>(STORAGE_KEYS.DONATIONS, []);
    const index = all.findIndex(d => d.id === donation.id);
    if (index >= 0) {
      all[index] = { ...donation, updatedAt: new Date().toISOString() };
    } else {
      all.unshift(donation);
    }
    this.set(STORAGE_KEYS.DONATIONS, all);
  }

  saveDonationsList(festivalId: string, donations: Donation[]): void {
    const other = this.get<Donation[]>(STORAGE_KEYS.DONATIONS, []).filter(d => d.festivalId !== festivalId);
    this.set(STORAGE_KEYS.DONATIONS, [...donations, ...other]);
  }

  deleteDonation(id: string): void {
    const all = this.get<Donation[]>(STORAGE_KEYS.DONATIONS, []).filter(d => d.id !== id);
    this.set(STORAGE_KEYS.DONATIONS, all);
  }

  // --- Expenses ---
  getExpenses(festivalId: string): Expense[] {
    const all = this.get<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    return all.filter(e => e.festivalId === festivalId);
  }

  saveExpense(expense: Expense): void {
    const all = this.get<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const index = all.findIndex(e => e.id === expense.id);
    if (index >= 0) {
      all[index] = { ...expense, updatedAt: new Date().toISOString() };
    } else {
      all.unshift(expense);
    }
    this.set(STORAGE_KEYS.EXPENSES, all);
  }

  saveExpensesList(festivalId: string, expenses: Expense[]): void {
    const other = this.get<Expense[]>(STORAGE_KEYS.EXPENSES, []).filter(e => e.festivalId !== festivalId);
    this.set(STORAGE_KEYS.EXPENSES, [...expenses, ...other]);
  }

  deleteExpense(id: string): void {
    const all = this.get<Expense[]>(STORAGE_KEYS.EXPENSES, []).filter(e => e.id !== id);
    this.set(STORAGE_KEYS.EXPENSES, all);
  }

  // --- Budgets ---
  getBudgets(festivalId: string): CategoryBudget[] {
    const all = this.get<CategoryBudget[]>(STORAGE_KEYS.BUDGETS, []);
    return all.filter(b => b.festivalId === festivalId);
  }

  saveBudget(budget: CategoryBudget): void {
    const all = this.get<CategoryBudget[]>(STORAGE_KEYS.BUDGETS, []);
    const index = all.findIndex(b => b.id === budget.id || (b.festivalId === budget.festivalId && b.category === budget.category));
    if (index >= 0) {
      all[index] = { ...budget, updatedAt: new Date().toISOString() };
    } else {
      all.push(budget);
    }
    this.set(STORAGE_KEYS.BUDGETS, all);
  }

  // --- Audit Logs ---
  getAuditLogs(festivalId: string): AuditLog[] {
    const all = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    return all.filter(l => l.festivalId === festivalId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const all = this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    const newLog: AuditLog = {
      ...log,
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
    };
    all.unshift(newLog);
    if (all.length > 500) all.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, all);
  }

  // --- Donors Aggregator (derived from donations) ---
  getDonors(festivalId: string): Donor[] {
    const donations = this.getDonations(festivalId).filter(d => d.status === 'Received');
    const donorMap = new Map<string, Donor>();

    for (const d of donations) {
      const key = (d.mobileNumber.trim() || d.donorName.trim()).toLowerCase();
      if (!key) continue;

      if (!donorMap.has(key)) {
        donorMap.set(key, {
          id: 'donor-' + key.replace(/[^a-z0-9]/g, '-'),
          festivalId,
          name: d.donorName,
          phone: d.mobileNumber,
          email: d.email,
          address: d.address,
          totalDonated: d.amount,
          donationCount: 1,
          lastDonationDate: d.date,
          firstDonationDate: d.date,
        });
      } else {
        const existing = donorMap.get(key)!;
        existing.totalDonated += d.amount;
        existing.donationCount += 1;
        if (!existing.email && d.email) existing.email = d.email;
        if (!existing.address && d.address) existing.address = d.address;
        if (new Date(d.date) > new Date(existing.lastDonationDate)) {
          existing.lastDonationDate = d.date;
        }
        if (new Date(d.date) < new Date(existing.firstDonationDate)) {
          existing.firstDonationDate = d.date;
        }
      }
    }

    return Array.from(donorMap.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  }

  // --- Next Receipt Number Generator (Starts at 401 and continues upwards) ---
  getNextReceiptNumber(festivalId: string, _year?: number): string {
    const donations = this.getDonations(festivalId);
    let maxNum = 400;
    for (const d of donations) {
      const match = d.receiptNumber?.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    return (maxNum + 1).toString();
  }

  // --- Clear Demo / Placeholder Data to start Fresh & Empty ---
  clearAllDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.FESTIVALS, JSON.stringify(DEFAULT_FESTIVALS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FESTIVAL_ID, JSON.stringify(DEFAULT_FESTIVALS[0].id));
    localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(DEFAULT_MEDIA));
  }
}

export const storageService = new StorageService();
