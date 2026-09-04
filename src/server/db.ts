import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

// Password hashing utility using PBKDF2
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export const ADMIN_SALT = 'e9f4c3a1728564b90123456789abcdef';
export const ADMIN_HASH = hashPassword('Admin@2026', ADMIN_SALT);

// Interfaces
export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'viewer';
  phone?: string;
  passwordSalt?: string;
  passwordHash?: string;
  createdAt?: string;
}

export interface IFestival {
  id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  description?: string;
  initialBalance: number;
  openingBalance?: number;
  registrationNumber?: string;
  createdAt: string;
  createdBy: string;
}

export interface IDonation {
  id: string;
  festivalId: string;
  receiptNumber: string;
  donorName: string;
  mobileNumber?: string;
  email?: string;
  address?: string;
  amount: number;
  paymentMethod: string;
  date: string;
  receivedDate?: string;
  category: string;
  transactionRef?: string;
  notes?: string;
  status: 'Received' | 'Pending' | 'Cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IExpense {
  id: string;
  festivalId: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  vendorPaid?: string;
  paymentMethod: string;
  billNumber?: string;
  receiptFileUrl?: string;
  receiptFileName?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudget {
  id: string;
  festivalId: string;
  category: string;
  budgetedAmount: number;
  updatedAt: string;
}

export interface IMedia {
  id: string;
  label: string;
  name: string;
  type: string;
  url?: string;
  dataUrl?: string;
  description?: string;
  createdAt: string;
  uploadedBy: string;
}

export interface IMember {
  id: string;
  festivalId: string;
  userId?: string;
  name: string;
  email?: string;
  role: string;
  phone?: string;
  addedAt: string;
}

export interface IAuditLog {
  id: string;
  festivalId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  performedByName: string;
  performedByRole: string;
  timestamp: string;
}

// Schemas
const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  phone: { type: String },
  passwordSalt: { type: String },
  passwordHash: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const FestivalSchema = new Schema<IFestival>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  year: { type: Number, required: true },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  location: { type: String, default: '' },
  organizer: { type: String, default: '' },
  description: { type: String, default: '' },
  initialBalance: { type: Number, default: 0 },
  openingBalance: { type: Number, default: 0 },
  registrationNumber: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  createdBy: { type: String, default: 'user-admin' },
});

const DonationSchema = new Schema<IDonation>({
  id: { type: String, required: true, unique: true, index: true },
  festivalId: { type: String, required: true, index: true },
  receiptNumber: { type: String, required: true },
  donorName: { type: String, required: true },
  mobileNumber: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: String, required: true },
  receivedDate: { type: String, default: '' },
  category: { type: String, default: 'General' },
  transactionRef: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Received', 'Pending', 'Cancelled'], default: 'Received' },
  createdBy: { type: String, default: 'Admin' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

const ExpenseSchema = new Schema<IExpense>({
  id: { type: String, required: true, unique: true, index: true },
  festivalId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  vendorPaid: { type: String, default: '' },
  paymentMethod: { type: String, default: 'Cash' },
  billNumber: { type: String, default: '' },
  receiptFileUrl: { type: String, default: '' },
  receiptFileName: { type: String, default: '' },
  notes: { type: String, default: '' },
  createdBy: { type: String, default: 'Admin' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

const BudgetSchema = new Schema<IBudget>({
  id: { type: String, required: true, unique: true, index: true },
  festivalId: { type: String, required: true, index: true },
  category: { type: String, required: true },
  budgetedAmount: { type: Number, default: 0 },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

const MediaSchema = new Schema<IMedia>({
  id: { type: String, required: true, unique: true, index: true },
  label: { type: String, default: 'CHH Shivaji Maharaj and Sai Baba' },
  name: { type: String, default: 'CHH Shivaji Maharaj and Sai Baba' },
  type: { type: String, default: 'banner' },
  url: { type: String, default: '' },
  dataUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  uploadedBy: { type: String, default: 'admin' },
});

const MemberSchema = new Schema<IMember>({
  id: { type: String, required: true, unique: true, index: true },
  festivalId: { type: String, required: true, index: true },
  userId: { type: String, default: '' },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  role: { type: String, default: 'viewer' },
  phone: { type: String, default: '' },
  addedAt: { type: String, default: () => new Date().toISOString() },
});

const AuditLogSchema = new Schema<IAuditLog>({
  id: { type: String, required: true, unique: true, index: true },
  festivalId: { type: String, required: true, index: true },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, default: '' },
  details: { type: String, required: true },
  performedByName: { type: String, default: 'Admin' },
  performedByRole: { type: String, default: 'admin' },
  timestamp: { type: String, default: () => new Date().toISOString() },
});

// Models (with fallback if already registered)
export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const FestivalModel: Model<IFestival> = mongoose.models.Festival || mongoose.model<IFestival>('Festival', FestivalSchema);
export const DonationModel: Model<IDonation> = mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
export const ExpenseModel: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
export const BudgetModel: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);
export const MediaModel: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
export const MemberModel: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
export const AuditLogModel: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

// Connection Status State
let isConnected = false;
let dbHost = '127.0.0.1';
let dbName = 'ganesh_utsav_db';
let lastError: string | null = null;

export async function connectDB(customUri?: string): Promise<boolean> {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ganesh_utsav_db';

  try {
    // Avoid re-connecting if already connected
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    mongoose.connection.on('connected', () => {
      isConnected = true;
      lastError = null;
      dbHost = mongoose.connection.host || '127.0.0.1';
      dbName = mongoose.connection.name || 'ganesh_utsav_db';
      console.log(`[MongoDB] Connected successfully to ${dbHost}/${dbName}`);
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      lastError = err.message;
      console.error('[MongoDB] Connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Disconnected');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    dbHost = mongoose.connection.host || '127.0.0.1';
    dbName = mongoose.connection.name || 'ganesh_utsav_db';
    lastError = null;

    // Seed default baseline data if collections are empty
    await seedInitialData();

    return true;
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    console.error(`[MongoDB] Failed to connect to ${uri}:`, err.message);
    return false;
  }
}

export function getDbStatus() {
  const readyState = mongoose.connection.readyState;
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const connected = readyState === 1;

  return {
    connected,
    engine: 'MongoDB',
    host: connected ? mongoose.connection.host : dbHost,
    dbName: connected ? mongoose.connection.name : dbName,
    port: connected ? mongoose.connection.port : 27017,
    readyState,
    readyStateText: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][readyState] || 'Unknown',
    error: lastError,
    uriMasked: getMaskedUri(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ganesh_utsav_db'),
  };
}

function getMaskedUri(uri: string): string {
  try {
    return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
  } catch {
    return uri;
  }
}

// Auto-seed baseline data if database is fresh
export async function seedInitialData() {
  try {
    // 1. Seed Users (Admin & Viewer)
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      await UserModel.create([
        {
          id: 'user-admin',
          name: 'Mandal Admin',
          username: 'admin',
          email: 'admin@ganeshutsav.org',
          role: 'admin',
          phone: '+91 98765 43210',
          passwordSalt: ADMIN_SALT,
          passwordHash: ADMIN_HASH,
        },
        {
          id: 'user-viewer',
          name: 'Committee Viewer',
          username: 'viewer',
          email: 'viewer@ganeshutsav.org',
          role: 'viewer',
          phone: '+91 98900 67890',
          passwordSalt: '',
          passwordHash: '',
        },
      ]);
      console.log('[MongoDB] Seeded default Admin and Viewer users.');
    }

    // 2. Seed Default Festival (36th Year - 2026)
    const festivalCount = await FestivalModel.countDocuments();
    if (festivalCount === 0) {
      await FestivalModel.create({
        id: 'fest-2026',
        name: 'Shree Sai Mitra Mandal 2026',
        year: 2026,
        startDate: '2026-09-01',
        endDate: '2026-09-11',
        location: 'Shree Sai Colony, Karvenagar, Pune',
        organizer: 'Shree Sai Mitra Mandal',
        description: 'Shree Sai Mitra Mandal - 36th Year. Ganeshotsav festival finance, donations, vouchers, and ledger balance sheet.',
        initialBalance: 0,
        openingBalance: 0,
        registrationNumber: 'MAH/PUN/2026/SSM-108',
        createdAt: new Date().toISOString(),
        createdBy: 'user-admin',
      });
      console.log('[MongoDB] Seeded default 36th Year festival.');
    }

    // 3. Seed Default Media Banner
    const mediaCount = await MediaModel.countDocuments();
    if (mediaCount === 0) {
      await MediaModel.create({
        id: 'media-banner-1',
        label: 'CHH Shivaji Maharaj and Sai Baba',
        name: 'CHH Shivaji Maharaj and Sai Baba',
        type: 'banner',
        description: 'Official festival banner artwork featuring Chhatrapati Shivaji Maharaj and Shirdi Sai Baba for Shree Sai Mitra Mandal, Karvenagar, Pune (36th Year)',
        createdAt: new Date().toISOString(),
        uploadedBy: 'admin',
      });
      console.log('[MongoDB] Seeded default festival banner.');
    }
  } catch (err: any) {
    console.error('[MongoDB] Seed error:', err.message);
  }
}
