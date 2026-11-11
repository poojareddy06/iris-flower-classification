import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { LanguageKey } from '../locales';
import {
  Sparkles,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  LogOut,
  Presentation,
  ShieldCheck,
  ChevronDown,
  Layers
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, isAuthenticated, isDemoMode, logout, enableDemoMode } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 group text-left"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-iris-600 via-iris-500 to-emerald-400 p-0.5 shadow-lg shadow-iris-600/25 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-iris-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                Iris<span className="text-iris-400"> AI</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-iris-500/20 text-iris-300 px-2 py-0.5 rounded-full border border-iris-500/30">
                Decision Tree ML
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {t('app_subtitle')}
            </p>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Demo Mode Badge */}
        {isDemoMode ? (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('demo_mode')}</span>
          </span>
        ) : !isAuthenticated ? (
          <button
            onClick={enableDemoMode}
            className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-xl border border-slate-700 transition"
          >
            {t('try_demo')}
          </button>
        ) : null}

        {/* Language selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition"
          >
            <Globe className="w-3.5 h-3.5 text-iris-400" />
            <span className="hidden md:inline">{languages[language]?.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                {t('select_language')}
              </div>
              {(Object.keys(languages) as LanguageKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => {
                    setLanguage(key);
                    setIsLangOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                    language === key ? 'text-iris-400 font-bold bg-iris-500/10' : 'text-slate-300'
                  }`}
                >
                  <span>{languages[key].label}</span>
                  <span className="text-[11px] text-slate-400">{languages[key].native}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* User Auth / Profile */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs text-white transition"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-iris-500 to-emerald-400 flex items-center justify-center text-[11px] font-bold text-slate-950">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline font-semibold max-w-[100px] truncate">
                {user?.full_name || 'User'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-iris-400 bg-iris-500/10 px-2 py-0.5 rounded-full border border-iris-500/20">
                    Role: {user?.role || 'User'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('nav_settings')}</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      onNavigate('landing');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('login')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              {t('nav_login')}
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-3 py-1.5 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition"
            >
              {t('nav_register')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
