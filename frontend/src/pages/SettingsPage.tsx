import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, Theme } from '../context/ThemeContext';
import { LanguageKey, LANGUAGES } from '../locales';
import { api } from '../api/client';
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Laptop,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  Database,
  Camera,
  History,
  Bot
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isDemoMode, logout } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [privacyMsg, setPrivacyMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      if (user && user.id > 0) {
        await api.auth.updateSettings({
          theme,
          language,
        });
      }
      setSaveSuccess('Preferences saved successfully!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePredictions = async () => {
    if (!confirm('Are you sure you want to delete your entire prediction history?')) return;
    setIsDeleting('predictions');
    try {
      await api.predictions.clearAll();
      setPrivacyMsg({ text: 'Prediction history successfully cleared.' });
      setTimeout(() => setPrivacyMsg(null), 3500);
    } catch (err: any) {
      setPrivacyMsg({ text: err.message || 'Failed to clear predictions.', isError: true });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteDatasets = async () => {
    if (!confirm('Are you sure you want to delete all datasets you uploaded? Default canonical dataset will remain.')) return;
    setIsDeleting('datasets');
    try {
      await api.datasets.clearUserDatasets();
      setPrivacyMsg({ text: 'All your uploaded custom datasets were removed.' });
      setTimeout(() => setPrivacyMsg(null), 3500);
    } catch (err: any) {
      setPrivacyMsg({ text: err.message || 'Failed to delete datasets.', isError: true });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteImageHistory = async () => {
    if (!confirm('Are you sure you want to delete your flower vision image history?')) return;
    setIsDeleting('images');
    try {
      await api.image.clearHistory();
      setPrivacyMsg({ text: 'Flower image analysis history successfully cleared.' });
      setTimeout(() => setPrivacyMsg(null), 3500);
    } catch (err: any) {
      setPrivacyMsg({ text: err.message || 'Failed to clear image history.', isError: true });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('WARNING: Are you sure you want to permanently delete your account and all associated models, datasets, and history? This action cannot be undone.')) return;
    setIsDeleting('account');
    try {
      await api.auth.deleteAccount();
      alert('Your account has been deleted. Returning to login.');
      logout();
    } catch (err: any) {
      setPrivacyMsg({ text: err.message || 'Failed to delete account.', isError: true });
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-iris-500/10 text-iris-500 dark:text-iris-400 border border-iris-500/20">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Application Settings</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your account preferences, localization, display themes, and privacy retention.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{saveSuccess}</span>
          </div>
        )}
      </div>

      {privacyMsg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-2.5 transition-all ${
          privacyMsg.isError
            ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
        }`}>
          {privacyMsg.isError ? (
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          )}
          <span>{privacyMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <User className="w-4 h-4 text-iris-500 dark:text-iris-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              User Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || 'Guest / Reviewer'}
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-300 opacity-90"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'reviewer@irislab.ai'}
                className="w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-300 opacity-90 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-slate-400">User Role</label>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-iris-500/10 text-iris-600 dark:text-iris-300 border border-iris-500/20">
                  {user?.role === 'admin' ? 'Administrator' : 'Standard Researcher'}
                </span>
                {isDemoMode && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Demo Mode Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Display Theme */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Sun className="w-4 h-4 text-iris-500 dark:text-iris-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Appearance
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred color theme or match your operating system preferences.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                theme === 'light'
                  ? 'bg-iris-600 text-white border-iris-500 shadow-md shadow-iris-600/30'
                  : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-white' : 'text-amber-500'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">Light</p>
                <p className="text-[10px] opacity-80">Daytime botanical view</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                theme === 'dark'
                  ? 'bg-iris-600 text-white border-iris-500 shadow-md shadow-iris-600/30'
                  : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-amber-400'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">Dark</p>
                <p className="text-[10px] opacity-80">High-contrast research UI</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition ${
                theme === 'system'
                  ? 'bg-iris-600 text-white border-iris-500 shadow-md shadow-iris-600/30'
                  : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Laptop className={`w-5 h-5 ${theme === 'system' ? 'text-white' : 'text-iris-400'}`} />
              <div className="text-left">
                <p className="text-xs font-bold">System</p>
                <p className="text-[10px] opacity-80">Match OS settings</p>
              </div>
            </button>
          </div>
        </div>

        {/* Localization & Language */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <Globe className="w-4 h-4 text-iris-500 dark:text-iris-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Language
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred display language. Navigation, charts, predictions, and Iris AI will adapt.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(Object.keys(languages) as LanguageKey[]).map(key => {
              const isSelected = language === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setLanguage(key)}
                  className={`p-3 rounded-2xl border text-center transition ${
                    isSelected
                      ? 'bg-iris-600 text-white border-iris-500 shadow-md shadow-iris-600/30 font-bold'
                      : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{languages[key].label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5">{languages[key].native}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy & Data Management */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-iris-500 dark:text-iris-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Privacy & Data Retention
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exercise complete control over your private experimental records, uploaded files, and account data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <History className="w-4 h-4 text-iris-500" />
                  <span>Prediction History</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Permanently delete all your recorded flower classification test inferences.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeletePredictions}
                disabled={isDeleting === 'predictions'}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
              >
                {isDeleting === 'predictions' ? 'Deleting...' : 'Delete prediction history'}
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>Uploaded Datasets</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Remove all custom CSV datasets you have uploaded from server storage.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteDatasets}
                disabled={isDeleting === 'datasets'}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
              >
                {isDeleting === 'datasets' ? 'Deleting...' : 'Delete uploaded datasets'}
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Image History</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Clear all analyzed flower photographs and foliar screening history.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteImageHistory}
                disabled={isDeleting === 'images'}
                className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
              >
                {isDeleting === 'images' ? 'Deleting...' : 'Delete image history'}
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Delete Account</span>
                </div>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                  Irreversibly delete your account, credentials, and all tied assets.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting === 'account'}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                {isDeleting === 'account' ? 'Deleting Account...' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

