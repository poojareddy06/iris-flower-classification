import React from 'react';
import { BarChart3, Info } from 'lucide-react';

interface FeatureImportanceProps {
  importances: Record<string, number>;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceProps> = ({ importances }) => {
  if (!importances || Object.keys(importances).length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 border border-slate-800 rounded-xl">
        No feature importance data calculated yet.
      </div>
    );
  }

  // Sort by importance descending
  const sorted = Object.entries(importances).sort((a, b) => b[1] - a[1]);
  const maxImportance = Math.max(...sorted.map(([_, v]) => v), 0.01);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-iris-400" />
          <h4 className="text-sm font-semibold text-slate-200">Gini Feature Importance</h4>
        </div>
        <span className="text-xs text-slate-400">Mean Decrease in Impurity</span>
      </div>

      <div className="space-y-3">
        {sorted.map(([feature, value], idx) => {
          const pct = (value * 100).toFixed(1);
          const barWidth = `${Math.max(4, (value / maxImportance) * 100)}%`;

          // Color palette based on rank
          const isTop = idx === 0;
          const barColor = isTop
            ? 'from-iris-500 to-iris-400'
            : idx === 1
            ? 'from-emerald-500 to-emerald-400'
            : 'from-slate-600 to-slate-500';

          return (
            <div key={feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-4 text-slate-500 text-[10px] font-mono">#{idx + 1}</span>
                  {feature}
                </span>
                <span className="font-semibold text-white font-mono">{pct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-iris-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Botanical Rationale: </strong>
          Petal dimensions exhibit the sharpest non-overlapping statistical separation between Iris species.
          Consequently, the Decision Tree assigns majority splitting weight to Petal Length and Petal Width.
        </p>
      </div>
    </div>
  );
};
