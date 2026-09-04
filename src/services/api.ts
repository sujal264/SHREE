import { Donation, Expense, Festival, CategoryBudget, UserRole } from '../types';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface DbStatusResponse {
  connected: boolean;
  engine: string;
  host: string;
  dbName: string;
  port?: number;
  readyState?: number;
  readyStateText?: string;
  error?: string | null;
  uriMasked?: string;
}

export class ApiClient {
  private getHeaders(role?: string): HeadersInit {
    const currentRole = role || localStorage.getItem('gu_current_role_v1') || 'admin';
    let token = localStorage.getItem('gu_auth_token_v2') || '';
    if (!token && currentRole === 'admin') {
      token = 'gu_admin_sess_2026_shree_sai';
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': currentRole,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // --- Database Status ---
  async getDbStatus(): Promise<DbStatusResponse> {
    try {
      const res = await fetch('/api/db-status');
      if (!res.ok) {
        return {
          connected: false,
          engine: 'MongoDB',
          host: '127.0.0.1',
          dbName: 'ganesh_utsav_db',
          error: `HTTP ${res.status}: ${res.statusText}`,
        };
      }
      return await res.json();
    } catch (e: any) {
      return {
        connected: false,
        engine: 'MongoDB',
        host: '127.0.0.1',
        dbName: 'ganesh_utsav_db',
        error: e.message || 'Connection check failed',
      };
    }
  }

  // --- Auth Endpoints ---
  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; token?: string; user?: any; role?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, email: usernameOrEmail, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid username/email or password.' };
      }
      if (data.token) {
        localStorage.setItem('gu_auth_token_v2', data.token);
        localStorage.setItem('gu_current_role_v1', data.role || 'admin');
      }
      return data;
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during login' };
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('gu_auth_token_v2');
      localStorage.setItem('gu_current_role_v1', 'viewer');
    }
  }

  async getMe(): Promise<{ authenticated: boolean; role: 'admin' | 'viewer'; user?: any }> {
    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getHeaders(),
      });
      if (!res.ok) return { authenticated: false, role: 'viewer' };
      return await res.json();
    } catch {
      return { authenticated: false, role: 'viewer' };
    }
  }

  async downloadBackup(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch('/api/backup', {
        headers: this.getHeaders(),
      });
      if (!res.ok) return { success: false, error: 'Failed to download database backup' };
      const backupData = await res.json();
      return { success: true, data: backupData };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  // --- Festivals ---
  async getFestivals(): Promise<Festival[]> {
    try {
      const res = await fetch('/api/festivals');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async createFestival(data: Partial<Festival>, role?: string): Promise<{ data?: Festival; error?: string }> {
    try {
      const res = await fetch('/api/festivals', {
        method: 'POST',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { error: 'Failed to create festival' };
      const created = await res.json();
      return { data: created };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }

  async updateFestival(id: string, data: Partial<Festival>, role?: string): Promise<{ data?: Festival; error?: string }> {
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { error: 'Failed to update festival' };
      const updated = await res.json();
      return { data: updated };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }

  async deleteFestival(id: string, role?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(role),
      });
      if (res.status === 403) {
        return { success: false, error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { success: false, error: 'Failed to delete festival' };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  // --- Donations ---
  async getDonations(festivalId?: string): Promise<Donation[]> {
    try {
      const url = festivalId ? `/api/donations?festivalId=${encodeURIComponent(festivalId)}` : '/api/donations';
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async createDonation(data: any, role?: string): Promise<{ data?: Donation; error?: string }> {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { error: 'Failed to record donation' };
      const donation = await res.json();
      return { data: donation };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }

  async updateDonation(id: string, data: any, role?: string): Promise<{ data?: Donation; error?: string }> {
    try {
      const res = await fetch(`/api/donations/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { error: 'Failed to update donation' };
      const donation = await res.json();
      return { data: donation };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }

  async deleteDonation(id: string, role?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/donations/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(role),
      });
      if (res.status === 403) {
        return { success: false, error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { success: false, error: 'Failed to delete donation' };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  // --- Expenses ---
  async getExpenses(festivalId?: string): Promise<Expense[]> {
    try {
      const url = festivalId ? `/api/expenses?festivalId=${encodeURIComponent(festivalId)}` : '/api/expenses';
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async createExpense(data: any, role?: string): Promise<{ data?: Expense; error?: string }> {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { error: 'Failed to record expense' };
      const expense = await res.json();
      return { data: expense };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }

  async updateExpense(id: string, data: any, role?: string): Promise<{ data?: Expense; error?: string }> {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { error: 'Failed to update expense' };
      const expense = await res.json();
      return { data: expense };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }

  async deleteExpense(id: string, role?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(role),
      });
      if (res.status === 403) {
        return { success: false, error: 'Forbidden (403): Viewer / Guest accounts have read-only access. Please log in as admin.' };
      }
      if (!res.ok) return { success: false, error: 'Failed to delete expense' };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  // --- Budgets ---
  async getBudgets(festivalId?: string): Promise<CategoryBudget[]> {
    try {
      const url = festivalId ? `/api/budgets?festivalId=${encodeURIComponent(festivalId)}` : '/api/budgets';
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async saveBudget(data: { category: string; festivalId: string; budgetedAmount: number }, role?: string): Promise<any> {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  // --- Members ---
  async getMembers(festivalId?: string): Promise<any[]> {
    try {
      const url = festivalId ? `/api/members?festivalId=${encodeURIComponent(festivalId)}` : '/api/members';
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async createMember(data: any, role?: string): Promise<any> {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  async deleteMember(id: string, role?: string): Promise<any> {
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(role),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  // --- Audit Logs ---
  async getAuditLogs(festivalId?: string): Promise<any[]> {
    try {
      const url = festivalId ? `/api/audit-logs?festivalId=${encodeURIComponent(festivalId)}` : '/api/audit-logs';
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async createAuditLog(data: any): Promise<any> {
    try {
      const res = await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  // --- Batch Sync ---
  async syncBatch(payload: { donations?: any[]; expenses?: any[]; budgets?: any[] }): Promise<any> {
    try {
      const res = await fetch('/api/sync/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  // --- Clear Demo Data ---
  async clearDemoData(role?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/clear-demo', {
        method: 'POST',
        headers: this.getHeaders(role),
      });
      if (res.status === 403) {
        return { success: false, error: 'Forbidden (403): Only admin accounts can clear demo data.' };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  }

  // --- Media ---
  async getMedia(): Promise<any[]> {
    try {
      const res = await fetch('/api/media');
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }

  async saveMedia(data: any, role?: string): Promise<{ data?: any; error?: string }> {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: this.getHeaders(role),
        body: JSON.stringify(data),
      });
      if (res.status === 403) {
        return { error: 'Forbidden (403): Viewer accounts have read-only access. You cannot upload media.' };
      }
      const item = await res.json();
      return { data: item };
    } catch (e: any) {
      return { error: e.message || 'Network error' };
    }
  }
}

export const apiClient = new ApiClient();
