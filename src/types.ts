export type UserRole = 'admin' | 'treasurer' | 'viewer' | 'Admin' | 'Treasurer' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Festival {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  description?: string;
  initialBalance: number; // Opening balance
  openingBalance?: number; // Alias for initialBalance
  logoUrl?: string;
  registrationNumber?: string;
  createdAt: string;
  createdBy: string;
}

export interface FestivalMember {
  id: string;
  festivalId: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  addedAt: string;
}

export type CommitteeMember地理 = FestivalMember;
export type CommitteeMember = FestivalMember;

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';

export type DonationCategory =
  | 'General'
  | 'Other'
  | 'General Donation'
  | 'Aarti / Pooja'
  | 'Prasad / Food'
  | 'Silver / Gold Sponsor'
  | 'Maha Aarti'
  | 'Visarjan'
  | 'Advertisement';

export type DonationStatus = 'Received' | 'Pending' | 'Cancelled';

export interface Donation {
  id: string;
  festivalId: string;
  receiptNumber: string;
  donorName: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  receivedDate?: string;
  category: DonationCategory;
  transactionRef?: string;
  notes?: string;
  status: DonationStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donor {
  id: string;
  festivalId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalDonated: number;
  donationCount: number;
  lastDonationDate: string;
  firstDonationDate: string;
}

export type ExpenseCategory =
  | 'Decoration'
  | 'Idol'
  | 'Lighting'
  | 'Sound System'
  | 'Stage'
  | 'Flowers'
  | 'Prasad/Food'
  | 'Pooja Materials'
  | 'Advertising'
  | 'Printing'
  | 'Electricity'
  | 'Transportation'
  | 'Security'
  | 'Cleaning'
  | 'Cultural Events'
  | 'Charity'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  festivalId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendorPaid: string;
  paymentMethod: PaymentMethod;
  billNumber?: string;
  receiptFileUrl?: string; // Data URL or storage path
  receiptFileName?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBudget {
  id: string;
  festivalId: string;
  category: ExpenseCategory;
  budgetedAmount: number;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  festivalId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'EXPORT' | 'RESTORE';
  entityType: 'Donation' | 'Expense' | 'Budget' | 'Festival' | 'Member' | 'System';
  entityId?: string;
  details: string;
  performedByName: string;
  performedByRole: UserRole;
  timestamp: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'Opening Balance' | 'Donation' | 'Expense';
  description: string;
  personOrVendor: string;
  paymentMethod?: string;
  amount: number;
  flow: '+' | '-';
  balanceAfter: number;
  referenceId?: string;
  status?: DonationStatus;
}
