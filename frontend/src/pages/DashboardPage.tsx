import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { DashboardSummary } from '../types';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import {
  Target,
  Database,
  Cpu,
  CheckCircle,
  Clock,
  Camera,
  ArrowRight,
  Sparkles,
  Bot,
  BarChart3,
  UploadCloud,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.analytics.getDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-iris-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p>Loading platform dashboard...</p>
      </div>
    );
  }

  const accPercent = (data.model_accuracy * 100).toFixed(1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-iris-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-iris-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-iris-500/10 border border-iris-500/30 text-iris-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-iris-400" />
              <span>{t('dashboard_engine_badge')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('dashboard_hero_title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t('dashboard_hero_desc')}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('predict')}
              className="flex items-center gap-2 px-5 py-2.5 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition hover:scale-[1.02]"
            >
              <Target className="w-4 h-4" />
              <span>{t('btn_predict_species')}</span>
            </button>
            <button
              onClick={() => onNavigate('image_analyzer')}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{t('btn_image_vision')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title={t('stat_total_predictions')}
          value={data.total_predictions}
          subtitle="Inference operations"
          icon={Target}
          color="purple"
        />
        <StatCard
          title={t('stat_dataset_rows')}
          value={data.dataset_rows}
          subtitle="Iris botanical samples"
          icon={Database}
          color="blue"
        />
        <StatCard
          title={t('stat_model_accuracy')}
          value={`${accPercent}%`}
          subtitle="On unseen test data"
          icon={CheckCircle}
          color="emerald"
          trend="80/20 split"
        />
        <StatCard
          title={t('stat_current_model')}
          value="Decision Tree"
          subtitle="Criterion: Gini"
          icon={Cpu}
          color="amber"
        />
        <StatCard
          title={t('stat_last_prediction')}
          value={data.last_prediction?.species?.replace('Iris-', '') || 'None'}
          subtitle={
            data.last_prediction
              ? `${(data.last_prediction.confidence * 100).toFixed(0)}% confidence`
              : 'Awaiting run'
          }
          icon={Clock}
          color="purple"
        />
        <StatCard
          title={t('stat_uploaded_images')}
          value={data.uploaded_images}
          subtitle="Vision analyses"
          icon={Camera}
          color="emerald"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          {t('quick_actions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <button
            onClick={() => onNavigate('dataset_manager')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-iris-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_upload_dataset')}</span>
          </button>

          <button
            onClick={() => onNavigate('predict')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-iris-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-iris-500/10 text-iris-400 group-hover:scale-110 transition">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_predict_now')}</span>
          </button>

          <button
            onClick={() => onNavigate('image_analyzer')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-emerald-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_upload_image')}</span>
          </button>

          <button
            onClick={() => onNavigate('ai_assistant')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-iris-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_open_assistant')}</span>
          </button>

          <button
            onClick={() => onNavigate('dataset_manager')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-iris-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 group-hover:scale-110 transition">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_view_dataset')}</span>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-iris-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_model_analytics')}</span>
          </button>

          <button
            onClick={() => onNavigate('model_training')}
            className="p-3.5 glass-panel rounded-2xl border hover:border-emerald-500/50 flex flex-col items-center justify-center text-center gap-2 group transition"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-200">{t('btn_train_model')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Model Overview & Class Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Overview Section */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">{t('active_ml_model')}</h3>
              <p className="text-xs text-slate-400">{data.model_overview.model_name}</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-iris-400 hover:text-iris-300 font-semibold flex items-center gap-1"
            >
              <span>{t('deep_dive_analytics')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('algorithm_label')}
              </span>
              <p className="text-sm font-bold text-white mt-1">DecisionTreeClassifier</p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('criterion_label')}
              </span>
              <p className="text-sm font-bold text-iris-300 mt-1 uppercase font-mono">
                {data.model_overview.criterion} Impurity
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('split_label')}
              </span>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                {data.model_overview.train_test_split}
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('input_features_label')}
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {data.model_overview.features_count} Dimensions
              </p>
              <p className="text-[10px] text-slate-400">Sepal & Petal Dimensions</p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('target_classes_label')}
              </span>
              <p className="text-sm font-bold text-white mt-1">
                {data.model_overview.classes_count} Species
              </p>
              <p className="text-[10px] text-slate-400">Setosa, Versicolor, Virginica</p>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {t('overall_f1_label')}
              </span>
              <p className="text-sm font-bold text-emerald-400 mt-1">
                {(data.model_overview.f1_score * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Weighted Average</p>
            </div>
          </div>

          <div className="p-4 bg-iris-500/10 rounded-2xl border border-iris-500/20 text-xs text-iris-200 flex items-center justify-between">
            <p>
              <strong>{t('eval_note_title')} </strong>
              {t('eval_note_desc')}
            </p>
            <button
              onClick={() => onNavigate('model_training')}
              className="px-3 py-1.5 bg-iris-600 hover:bg-iris-500 text-white rounded-xl font-bold shrink-0 text-xs transition"
            >
              {t('retrain_model_btn')}
            </button>
          </div>
        </div>

        {/* Class Distribution Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white">{t('class_balance_title')}</h3>
            <p className="text-xs text-slate-400">{t('class_balance_desc')}</p>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(data.class_distribution).map(([species, count]) => {
              const total = Object.values(data.class_distribution).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';

              let barColor = 'from-iris-500 to-iris-400';
              if (species.toLowerCase().includes('setosa')) barColor = 'from-emerald-500 to-emerald-400';
              if (species.toLowerCase().includes('virginica')) barColor = 'from-blue-500 to-blue-400';

              return (
                <div key={species} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{species}</span>
                    <span className="text-slate-400 font-mono">
                      {count} rows ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            {t('class_balance_note')}
          </div>
        </div>
      </div>

      {/* Recent Predictions Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">{t('recent_inferences_title')}</h3>
            <p className="text-xs text-slate-400">{t('recent_inferences_desc')}</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-iris-400 hover:text-iris-300 font-semibold flex items-center gap-1"
          >
            <span>{t('view_all_history_btn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.recent_predictions && data.recent_predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('col_inference_id')}</th>
                  <th className="py-3 px-4">{t('col_species')}</th>
                  <th className="py-3 px-4">{t('col_confidence')}</th>
                  <th className="py-3 px-4">{t('col_dimensions')}</th>
                  <th className="py-3 px-4">{t('col_timestamp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recent_predictions.map(pred => (
                  <tr key={pred.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">#{pred.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white px-2 py-0.5 rounded-md bg-iris-500/10 border border-iris-500/20">
                        {pred.species}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold font-mono">
                        {(pred.confidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{pred.inputs}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(pred.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            {t('no_predictions_yet')}
          </div>
        )}
      </div>
    </div>
  );
};
