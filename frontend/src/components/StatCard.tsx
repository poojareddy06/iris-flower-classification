import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'purple' | 'emerald' | 'blue' | 'amber' | 'rose';
  trend?: string;
}

const colorMap = {
  purple: {
    bg: 'bg-iris-500/10 text-iris-400 border-iris-500/20',
    iconBg: 'bg-iris-500/20 text-iris-300',
    border: 'hover:border-iris-500/40',
  },
  emerald: {
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
    border: 'hover:border-emerald-500/40',
  },
  blue: {
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconBg: 'bg-blue-500/20 text-blue-300',
    border: 'hover:border-blue-500/40',
  },
  amber: {
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconBg: 'bg-amber-500/20 text-amber-300',
    border: 'hover:border-amber-500/40',
  },
  rose: {
    bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    iconBg: 'bg-rose-500/20 text-rose-300',
    border: 'hover:border-rose-500/40',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'purple',
  trend,
}) => {
  const c = colorMap[color];

  return (
    <div
      className={`glass-panel p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${c.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
          {trend && (
            <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
