import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  Camera,
  Database,
  Cpu,
  BarChart3,
  History,
  Bot,
  Presentation,
  BookOpen,
  Settings,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();
  const { user, isDemoMode } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { id: 'predict', label: t('nav_predict'), icon: Target, badge: t('badge_live_ml') },
    { id: 'image_analyzer', label: t('nav_image_analyzer'), icon: Camera, badge: t('badge_vision') },
    { id: 'dataset_manager', label: t('nav_dataset_manager'), icon: Database },
    { id: 'model_training', label: t('nav_model_training'), icon: Cpu },
    { id: 'analytics', label: t('nav_analytics'), icon: BarChart3 },
    { id: 'history', label: t('nav_history'), icon: History },
    { id: 'ai_assistant', label: t('nav_ai_assistant'), icon: Bot, highlight: true },
    { id: 'settings', label: t('nav_settings'), icon: Settings },
  ];

  const showAdmin = user?.role === 'admin' || isDemoMode;
  if (showAdmin) {
    navItems.push({ id: 'admin', label: t('nav_admin'), icon: ShieldAlert, badge: t('badge_admin') });
  }

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex h-[calc(100vh-65px)] sticky top-[65px]">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            {t('main_features')}
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-iris-600 text-white shadow-md shadow-iris-600/30'
                    : item.highlight
                    ? 'text-iris-300 hover:bg-iris-500/10 hover:text-white'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-iris-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === t('badge_vision')
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-iris-500/15 text-iris-300 border border-iris-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ML Engine Status Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-iris-500/20 text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-iris-400">
            {t('stat_current_model')}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">Gini 80/20</span>
        </div>
        <p className="font-bold text-slate-200 text-xs">{t('active_engine')}</p>
        <p className="text-[11px] text-slate-400">80/20 Train-Test Split</p>
      </div>
    </aside>
  );
};
