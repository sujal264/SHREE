import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, Eye, EyeOff, Lock, LogOut, CheckCircle2, AlertCircle, KeyRound, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, login, logout, isAdmin, isViewer } = useAuth();
  const { language } = useLanguage();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usernameOrEmail.trim()) {
      setErrorMessage(
        language === 'mr' ? 'कृपया युझरनेम किंवा ईमेल प्रविष्ट करा.' : 'Please enter your username or email.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        language === 'mr' ? 'कृपया पासवर्ड प्रविष्ट करा.' : 'Please enter your password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(usernameOrEmail.trim(), password);
      if (result.success) {
        setUsernameOrEmail('');
        setPassword('');
        onClose();
      } else {
        setErrorMessage(
          result.error ||
            (language === 'mr'
              ? 'अवैध युझरनेम किंवा पासवर्ड. कृपया पुन्हा प्रयत्न करा.'
              : 'Invalid username/email or password.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-['Mukta',sans-serif]">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-200">
              {isAdmin
                ? (language === 'mr' ? 'व्यवस्थापक सत्र सक्रिय' : 'Admin Session Active')
                : (language === 'mr' ? 'सुरक्षित प्रवेश' : 'Secure Login')}
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              {isAdmin
                ? (language === 'mr' ? 'खाते माहिती व अधिकार' : 'Account & Permissions')
                : (language === 'mr' ? 'लॉगिन' : 'Login')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAdmin
                ? (language === 'mr'
                    ? 'तुम्ही व्यवस्थापक म्हणून लॉगिन आहात. सर्व हक्क (CRUD) चालू आहेत.'
                    : 'You are logged in as Admin with full add, edit, and delete permissions.')
                : (language === 'mr'
                    ? 'अतिथी/वाचक केवळ माहिती पाहू शकतात. बदल करण्यासाठी लॉगिन आवश्यक आहे.'
                    : 'Guests have read-only access. Enter credentials to log in.')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            title={language === 'mr' ? 'बंद करा' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* If Admin is already Logged In */}
        {isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-amber-50/50 border border-emerald-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'mr' ? 'सक्रिय खाते:' : 'Currently Logged In:'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'व्यवस्थापक (Admin)' : 'Admin'}</span>
                </span>
              </div>

              <div className="mt-2.5">
                <div className="text-sm font-black text-slate-900">{currentUser?.name}</div>
                <div className="text-xs text-slate-600 font-mono mt-0.5">{currentUser?.email}</div>
              </div>

              <div className="mt-3 text-[11px] text-emerald-800 bg-white/90 p-2.5 rounded-xl border border-emerald-200 font-medium">
                ✓ {language === 'mr'
                  ? 'सत्र टोकन वैध आहे (२४ तास). तुम्ही पावत्या, खर्च, उत्सव वर्ष आणि हिशोब व्यवस्थापित करू शकता.'
                  : 'Session token is active. Full administrative privileges granted.'}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'mr' ? 'डॅशबोर्डवर परत जा' : 'Back to Dashboard'}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'mr' ? 'लॉगआउट करा' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Admin Login Form with Username & Password */
          <div className="space-y-4">
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              {/* Username / Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'mr' ? 'युझरनेम किंवा ईमेल' : 'Username or Email'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username-input"
                    type="text"
                    autoComplete="username"
                    value={usernameOrEmail}
                    onChange={e => setUsernameOrEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {language === 'mr' ? 'पासवर्ड' : 'Password'} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="submit-admin-login"
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>
                  {isLoading
                    ? (language === 'mr' ? 'पडताळणी चालू आहे...' : 'Verifying...')
                    : (language === 'mr' ? 'लॉगिन करा' : 'Log In')}
                </span>
              </button>
            </form>

            {/* Continue as Guest Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onClose}
                className="text-slate-600 hover:text-slate-900 font-bold underline"
              >
                {language === 'mr' ? 'अतिथी / वाचक म्हणून चालू ठेवा (केवळ पाहणे)' : 'Continue as Guest (Read-Only Mode)'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
              >
                {language === 'mr' ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
