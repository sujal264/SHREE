import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import {
  connectDB,
  getDbStatus,
  seedInitialData,
  hashPassword,
  ADMIN_SALT,
  ADMIN_HASH,
  UserModel,
  FestivalModel,
  DonationModel,
  ExpenseModel,
  BudgetModel,
  MediaModel,
  MemberModel,
  AuditLogModel,
} from './src/server/db';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Active server sessions: token -> { userId, role, expiresAt }
interface SessionData {
  userId: string;
  role: 'admin' | 'viewer';
  expiresAt: number;
}
const activeSessions = new Map<string, SessionData>();

// Secret key for HMAC signed session tokens
const SESSION_SECRET = process.env.SESSION_SECRET || 'mandal_sai_secret_key_2026_finance_pune_karvenagar';

function generateSessionToken(userId: string, role: 'admin' | 'viewer', expiresAt: number): string {
  const payload = `${userId}:${role}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64url');
}

function verifySessionToken(tokenStr: string): SessionData | null {
  if (!tokenStr) return null;
  // 1. Check in-memory session cache first
  const cached = activeSessions.get(tokenStr);
  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached;
    }
    activeSessions.delete(tokenStr);
  }

  // 2. Decode and verify stateless signed token
  try {
    const decoded = Buffer.from(tokenStr, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) return null;
    const [userId, role, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Date.now()) return null;
    if (role !== 'admin' && role !== 'viewer') return null;

    const payload = `${userId}:${role}:${expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      const sessionData: SessionData = { userId, role: role as 'admin' | 'viewer', expiresAt };
      activeSessions.set(tokenStr, sessionData); // warm memory cache
      return sessionData;
    }
  } catch {
    // invalid token format
  }
  return null;
}

// RBAC Middleware:
// Extracts session token from Authorization: Bearer <token>
// Validates session cryptographically.
// Unauthenticated visitors are STRICTLY assigned 'viewer' role with no mutation rights.
function rbacAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  let role: 'admin' | 'viewer' = 'viewer';
  let userId = 'guest';

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = verifySessionToken(token);
    if (session && session.expiresAt > Date.now()) {
      role = session.role;
      userId = session.userId;
    }
  }

  (req as any).userRole = role;
  (req as any).userId = userId;
  next();
}

// Admin-Only Route Guard:
// Strictly rejects any mutation or Mandal Settings access from Viewer accounts with HTTP 403 Forbidden.
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const role = (req as any).userRole;
  if (role === 'admin') {
    return next();
  }

  res.status(403).json({
    success: false,
    error: 'Forbidden: Mandal Settings and administrative actions are strictly restricted to Administrator accounts.',
    code: 'ADMIN_ROLE_REQUIRED',
  });
}

app.use(rbacAuthMiddleware);

// --- API Endpoints ---

// 0. Database Status Endpoint
app.get('/api/db-status', (_req: Request, res: Response) => {
  res.json(getDbStatus());
});

// 1. Auth & Users
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}, { passwordSalt: 0, passwordHash: 0 }).lean();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Secure Login: Requires username/email AND password. Passwords verified via PBKDF2 hash.
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const identifier = (username || email || '').trim().toLowerCase();

  // 1. Validate that password is provided
  if (!password || typeof password !== 'string' || !password.trim()) {
    res.status(400).json({
      success: false,
      error: 'Password is required. No login is possible without a valid password.',
    });
    return;
  }

  if (!identifier) {
    res.status(400).json({
      success: false,
      error: 'Username or email is required.',
    });
    return;
  }

  try {
    // 2. Find user by email or username in MongoDB
    let user = await UserModel.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } },
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } },
      ],
    }).lean();

    // Master Admin credentials: Only sujal310126 with password Sujaldhm@#12
    const isMasterAdminIdentifier = identifier === 'sujal310126' || identifier === 'sujal310126@ganeshutsav.org';
    const isMasterAdminPassword = password === 'Sujaldhm@#12';

    if (!user && isMasterAdminIdentifier && isMasterAdminPassword) {
      user = {
        id: 'user-admin',
        name: 'Mandal Admin',
        username: 'sujal310126',
        email: 'sujal310126@ganeshutsav.org',
        role: 'admin',
        phone: '+91 98765 43210',
        passwordSalt: ADMIN_SALT,
        passwordHash: ADMIN_HASH,
      } as any;
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid username/email or password.',
      });
      return;
    }

    // 3. Verify password hash or master admin password
    const salt = user.passwordSalt || ADMIN_SALT;
    const computedHash = hashPassword(password, salt);
    const isPasswordValid = computedHash === user.passwordHash || (isMasterAdminIdentifier && isMasterAdminPassword);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid username/email or password.',
      });
      return;
    }

    // 4. Create cryptographically secure signed session token (24 hour lifetime)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const token = generateSessionToken(user.id, user.role, expiresAt);
    activeSessions.set(token, {
      userId: user.id,
      role: user.role,
      expiresAt,
    });

    res.json({
      success: true,
      token,
      role: user.role,
      expiresAt,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Current User verification from token
app.get('/api/auth/me', async (req: Request, res: Response) => {
  const role = (req as any).userRole || 'viewer';
  const userId = (req as any).userId;

  if (role === 'admin' && userId && userId !== 'guest') {
    try {
      const user = await UserModel.findOne({ id: userId }, { passwordSalt: 0, passwordHash: 0 }).lean();
      if (user) {
        res.json({
          authenticated: true,
          role: 'admin',
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
        });
        return;
      }

      if (userId === 'user-admin') {
        res.json({
          authenticated: true,
          role: 'admin',
          user: {
            id: 'user-admin',
            name: 'Mandal Admin',
            username: 'sujal310126',
            email: 'sujal310126@ganeshutsav.org',
            role: 'admin',
            phone: '+91 98765 43210',
          },
        });
        return;
      }
    } catch {
      // ignore
    }
  }

  res.json({
    authenticated: false,
    role: 'viewer',
    user: {
      id: 'guest',
      name: 'अतिथी / वाचक (Guest Viewer)',
      email: 'viewer@ganeshutsav.org',
      role: 'viewer',
    },
  });
});

// Logout: Revoke session token
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 2. Full Database Backup (MongoDB Snapshot - Admin Only)
async function createDatabaseBackupPayload() {
  const [festivals, donations, expenses, budgets, mediaLibrary, members, auditLogs] = await Promise.all([
    FestivalModel.find().lean(),
    DonationModel.find().lean(),
    ExpenseModel.find().lean(),
    BudgetModel.find().lean(),
    MediaModel.find().lean(),
    MemberModel.find().lean(),
    AuditLogModel.find().lean(),
  ]);

  return {
    version: '2.5.0',
    engine: 'MongoDB',
    timestamp: new Date().toISOString(),
    festivalYear: '36th Year (२०२६)',
    mandalName: 'श्री साई मित्र मंडळ, कर्वेनगर, पुणे',
    data: {
      festivals,
      donations,
      expenses,
      budgets,
      mediaLibrary,
      members,
      auditLogs,
    },
  };
}

let configuredGdriveWebhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbztA1UjkU_935MXBK2bPJEk_Loo8lcNifL5V8KXcgGuk7AmVOj7PSXBet3DDUYP_xooNg/exec';

async function syncBackupToGoogleDrive(targetWebhookUrl?: string): Promise<{ success: boolean; message: string; timestamp: string }> {
  const webhookUrl = targetWebhookUrl || configuredGdriveWebhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error('Google Drive Webhook URL is not configured. Please paste your Google Apps Script URL in Settings.');
  }

  const payload = await createDatabaseBackupPayload();
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Google Drive webhook responded with HTTP ${response.status}: ${response.statusText}`);
  }

  return {
    success: true,
    message: 'Database backup uploaded to Google Drive successfully!',
    timestamp: payload.timestamp,
  };
}

app.get('/api/backup', requireAdmin, async (_req: Request, res: Response) => {
  try {
    const backup = await createDatabaseBackupPayload();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=mandal_finance_backup_${Date.now()}.json`);
    res.json(backup);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create backup', details: err.message });
  }
});

// Google Drive Backup Configuration & Sync
app.get('/api/backup/gdrive-config', requireAdmin, (_req: Request, res: Response) => {
  const currentUrl = configuredGdriveWebhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL || '';
  res.json({
    configured: !!currentUrl,
    webhookUrlMasked: currentUrl ? currentUrl.substring(0, 35) + '...' : '',
  });
});

app.post('/api/backup/gdrive-config', requireAdmin, (req: Request, res: Response) => {
  const { webhookUrl } = req.body;
  if (webhookUrl && typeof webhookUrl === 'string') {
    configuredGdriveWebhookUrl = webhookUrl.trim();
  }
  res.json({ success: true, message: 'Google Drive Webhook URL saved successfully.' });
});

app.post('/api/backup/gdrive-sync', requireAdmin, async (req: Request, res: Response) => {
  const { webhookUrl } = req.body;
  try {
    if (webhookUrl && typeof webhookUrl === 'string') {
      configuredGdriveWebhookUrl = webhookUrl.trim();
    }
    const result = await syncBackupToGoogleDrive(webhookUrl);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Media Library
app.get('/api/media', async (_req: Request, res: Response) => {
  try {
    const media = await MediaModel.find().sort({ createdAt: -1 }).lean();
    res.json(media);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/media', requireAdmin, async (req: Request, res: Response) => {
  const { label, name, type, url, dataUrl, description } = req.body;
  try {
    const newMedia = await MediaModel.create({
      id: 'media-' + Date.now(),
      label: label || 'CHH Shivaji Maharaj and Sai Baba',
      name: name || 'CHH Shivaji Maharaj and Sai Baba',
      type: type || 'banner',
      url,
      dataUrl,
      description: description || 'Uploaded image for festival banner',
      createdAt: new Date().toISOString(),
      uploadedBy: (req as any).userRole || 'admin',
    });
    res.status(201).json(newMedia);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Festivals (with Cascade Delete Functionality)
app.get('/api/festivals', async (_req: Request, res: Response) => {
  try {
    const festivals = await FestivalModel.find().sort({ year: -1, createdAt: -1 }).lean();
    res.json(festivals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/festivals', requireAdmin, async (req: Request, res: Response) => {
  try {
    const newFestival = await FestivalModel.create({
      ...req.body,
      id: req.body.id || 'fest-' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: (req as any).userRole || 'admin',
    });
    res.status(201).json(newFestival);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/festivals/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await FestivalModel.findOneAndUpdate({ id }, req.body, { returnDocument: 'after' }).lean();
    if (!updated) {
      res.status(404).json({ error: 'Festival not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Festival Year: Cascade deletes all donations, expenses, budgets for this year
app.delete('/api/festivals/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const festival = await FestivalModel.findOne({ id });
    if (!festival) {
      res.status(404).json({ error: 'Festival not found' });
      return;
    }

    await Promise.all([
      FestivalModel.deleteOne({ id }),
      DonationModel.deleteMany({ festivalId: id }),
      ExpenseModel.deleteMany({ festivalId: id }),
      BudgetModel.deleteMany({ festivalId: id }),
      MemberModel.deleteMany({ festivalId: id }),
      AuditLogModel.deleteMany({ festivalId: id }),
    ]);

    res.json({
      success: true,
      message: `Festival ${id} and all related donations, expenses, budgets, and members deleted successfully.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Donations (Admin only for POST, PUT, DELETE)
app.get('/api/donations', async (req: Request, res: Response) => {
  const { festivalId } = req.query;
  const filter: any = {};
  if (festivalId) {
    filter.festivalId = festivalId;
  }
  try {
    const donations = await DonationModel.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json(donations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/donations', requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    const newDonation = await DonationModel.create({
      ...req.body,
      id: req.body.id || 'don-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: req.body.createdAt || now,
      updatedAt: now,
      createdBy: (req as any).userRole === 'admin' ? 'Admin' : req.body.createdBy || 'Admin',
    });
    res.status(201).json(newDonation);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/donations/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.id;

    let updated = await DonationModel.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();

    if (!updated && mongoose.Types.ObjectId.isValid(id)) {
      updated = await DonationModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).lean();
    }

    if (!updated) {
      res.status(404).json({ error: 'Donation not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/donations/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await DonationModel.deleteOne({ id });
    if (result.deletedCount === 0 && mongoose.Types.ObjectId.isValid(id)) {
      await DonationModel.deleteOne({ _id: id });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Expenses (Admin only for POST, PUT, DELETE)
app.get('/api/expenses', async (req: Request, res: Response) => {
  const { festivalId } = req.query;
  const filter: any = {};
  if (festivalId) {
    filter.festivalId = festivalId;
  }
  try {
    const expenses = await ExpenseModel.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    const newExpense = await ExpenseModel.create({
      ...req.body,
      id: req.body.id || 'exp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: req.body.createdAt || now,
      updatedAt: now,
      createdBy: (req as any).userRole === 'admin' ? 'Admin' : req.body.createdBy || 'Admin',
    });
    res.status(201).json(newExpense);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/expenses/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.id;

    let updated = await ExpenseModel.findOneAndUpdate(
      { id },
      { ...updateData, updatedAt: new Date().toISOString() },
      { new: true }
    ).lean();

    if (!updated && mongoose.Types.ObjectId.isValid(id)) {
      updated = await ExpenseModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date().toISOString() },
        { new: true }
      ).lean();
    }

    if (!updated) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await ExpenseModel.deleteOne({ id });
    if (result.deletedCount === 0 && mongoose.Types.ObjectId.isValid(id)) {
      await ExpenseModel.deleteOne({ _id: id });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Budgets
app.get('/api/budgets', async (req: Request, res: Response) => {
  const { festivalId } = req.query;
  const filter: any = {};
  if (festivalId) {
    filter.festivalId = festivalId;
  }
  try {
    const budgets = await BudgetModel.find(filter).lean();
    res.json(budgets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', requireAdmin, async (req: Request, res: Response) => {
  const { category, festivalId, budgetedAmount } = req.body;
  try {
    const now = new Date().toISOString();
    const updated = await BudgetModel.findOneAndUpdate(
      { category, festivalId },
      {
        id: req.body.id || 'b-' + Date.now(),
        category,
        festivalId,
        budgetedAmount: Number(budgetedAmount) || 0,
        updatedAt: now,
      },
      { upsert: true, returnDocument: 'after' }
    ).lean();
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Committee Members
app.get('/api/members', async (req: Request, res: Response) => {
  const { festivalId } = req.query;
  const filter: any = {};
  if (festivalId) {
    filter.festivalId = festivalId;
  }
  try {
    const members = await MemberModel.find(filter).sort({ addedAt: -1 }).lean();
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/members', requireAdmin, async (req: Request, res: Response) => {
  try {
    const newMember = await MemberModel.create({
      ...req.body,
      id: req.body.id || 'mem-' + Date.now(),
      addedAt: new Date().toISOString(),
    });
    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/members/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await MemberModel.deleteOne({ id });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Audit Logs
app.get('/api/audit-logs', async (req: Request, res: Response) => {
  const { festivalId } = req.query;
  const filter: any = {};
  if (festivalId) {
    filter.festivalId = festivalId;
  }
  try {
    const logs = await AuditLogModel.find(filter).sort({ timestamp: -1 }).limit(100).lean();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req: Request, res: Response) => {
  try {
    const newLog = await AuditLogModel.create({
      ...req.body,
      id: req.body.id || 'log-' + Date.now(),
      timestamp: req.body.timestamp || new Date().toISOString(),
    });
    res.status(201).json(newLog);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Batch Data Sync (Allows uploading localStorage records directly into MongoDB)
app.post('/api/sync/batch', requireAdmin, async (req: Request, res: Response) => {
  const { donations, expenses, budgets, members, auditLogs } = req.body;
  try {
    let insertedDonations = 0;
    let insertedExpenses = 0;

    if (Array.isArray(donations) && donations.length > 0) {
      for (const d of donations) {
        if (!d.id) continue;
        await DonationModel.findOneAndUpdate({ id: d.id }, d, { upsert: true });
        insertedDonations++;
      }
    }

    if (Array.isArray(expenses) && expenses.length > 0) {
      for (const e of expenses) {
        if (!e.id) continue;
        await ExpenseModel.findOneAndUpdate({ id: e.id }, e, { upsert: true });
        insertedExpenses++;
      }
    }

    if (Array.isArray(budgets) && budgets.length > 0) {
      for (const b of budgets) {
        if (!b.category || !b.festivalId) continue;
        await BudgetModel.findOneAndUpdate({ category: b.category, festivalId: b.festivalId }, b, { upsert: true });
      }
    }

    res.json({
      success: true,
      message: `Batch sync complete. Processed ${insertedDonations} donations, ${insertedExpenses} expenses.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Clear Demo Data Endpoint
app.post('/api/clear-demo', requireAdmin, async (_req: Request, res: Response) => {
  try {
    await Promise.all([
      DonationModel.deleteMany({}),
      ExpenseModel.deleteMany({}),
      BudgetModel.deleteMany({}),
      MemberModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      FestivalModel.deleteMany({}),
    ]);

    // Re-seed clean 36th festival year & default banner
    await seedInitialData();

    res.json({
      success: true,
      message: 'All demo and placeholder data cleared in MongoDB. Clean 36th festival year ready for real entries.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Automatic Google Drive Backup Scheduler
// Runs in background: triggers automatically once per day (or at 23:00-23:59 IST)
let lastAutoBackupDay = '';
setInterval(async () => {
  try {
    const webhookUrl = configuredGdriveWebhookUrl || process.env.GOOGLE_DRIVE_WEBHOOK_URL;
    if (!webhookUrl) return;

    const now = new Date();
    // Indian Standard Time (IST) is UTC + 5 hours 30 minutes
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffsetMs);
    const dayStr = istDate.toISOString().split('T')[0];
    const hour = istDate.getUTCHours();

    // Run automatically once per day at 23:00 IST or once per day
    if ((hour === 23 || !lastAutoBackupDay) && lastAutoBackupDay !== dayStr) {
      console.log(`[Auto-Backup] Running automated daily backup to Google Drive for ${dayStr}...`);
      await syncBackupToGoogleDrive();
      lastAutoBackupDay = dayStr;
      console.log(`[Auto-Backup] Automated daily backup to Google Drive finished successfully.`);
    }
  } catch (err: any) {
    console.warn('[Auto-Backup] Notice:', err.message);
  }
}, 15 * 60 * 1000); // Check every 15 minutes

// Vite middleware / Static Serving
async function startServer() {
  console.log('[Startup] Connecting to MongoDB...');
  const dbConnected = await connectDB();
  if (dbConnected) {
    console.log('[Startup] MongoDB connection established.');
  } else {
    console.warn('[Startup] Warning: MongoDB failed to connect. Running in degraded mode. Check MONGODB_URI in .env.');
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shree Sai Mitra Mandal Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
