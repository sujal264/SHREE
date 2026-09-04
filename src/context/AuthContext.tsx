import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { storageService } from '../services/storage';
import { apiClient } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone?: string) => void;
  canEdit: boolean;
  isAdmin: boolean;
  isTreasurer: boolean;
  isViewer: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gu_auth_token_v2'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Validate server session on startup
  useEffect(() => {
    const checkServerSession = async () => {
      const storedToken = localStorage.getItem('gu_auth_token_v2');
      if (storedToken) {
        const me = await apiClient.getMe();
        if (me.authenticated && me.role === 'admin') {
          const adminUser = storageService.getUsers().find(u => u.role === 'admin') || me.user;
          setCurrentUser(adminUser);
          setToken(storedToken);
          localStorage.setItem('gu_current_role_v1', 'admin');
          return;
        }
      }
      // If stored role is viewer or no valid admin session, set as viewer
      const savedRole = localStorage.getItem('gu_current_role_v1');
      if (savedRole === 'viewer') {
        const viewerUser = storageService.getUsers().find(u => u.role === 'viewer') || null;
        setCurrentUser(viewerUser);
        return;
      }
      const adminUser = storageService.getUsers().find(u => u.role === 'admin') || storageService.getUsers()[0];
      setCurrentUser(adminUser);
      localStorage.setItem('gu_current_role_v1', 'admin');
    };

    checkServerSession();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!password || !password.trim()) {
      return {
        success: false,
        error: 'Password is required. No login is possible without a password.',
      };
    }

    if (!usernameOrEmail || !usernameOrEmail.trim()) {
      return {
        success: false,
        error: 'Username or email is required.',
      };
    }

    const res = await apiClient.login(usernameOrEmail.trim(), password);
    if (!res.success || !res.token) {
      return {
        success: false,
        error: res.error || 'Invalid username/email or password.',
      };
    }

    setToken(res.token);
    const adminUser: User = {
      id: res.user?.id || 'user-admin',
      name: res.user?.name || 'Mandal Admin',
      email: res.user?.email || usernameOrEmail.trim(),
      role: 'admin',
      phone: res.user?.phone,
      createdAt: new Date().toISOString(),
    };

    storageService.setCurrentUser(adminUser);
    setCurrentUser(adminUser);
    localStorage.setItem('gu_current_role_v1', 'admin');
    return { success: true };
  };

  const logout = async () => {
    await apiClient.logout();
    setToken(null);
    const viewer = storageService.getUsers().find(u => u.role === 'viewer') || null;
    storageService.setCurrentUser(viewer);
    setCurrentUser(viewer);
    localStorage.removeItem('gu_auth_token_v2');
    localStorage.setItem('gu_current_role_v1', 'viewer');
  };

  const updateProfile = (name: string, phone?: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name, phone };
    storageService.saveUser(updated);
    setCurrentUser(updated);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isViewer = !currentUser || currentUser?.role === 'viewer';
  const isTreasurer = currentUser?.role === 'treasurer';
  const canEdit = isAdmin || isTreasurer;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        token,
        login,
        logout,
        updateProfile,
        canEdit,
        isAdmin,
        isTreasurer,
        isViewer,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
