import React, { useState, useEffect } from 'react';
import { MLModel } from '../types';
import { api } from '../api/client';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { DecisionTreeViewer } from '../components/DecisionTreeViewer';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3,
  Download,
  Sparkles,
  Printer
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { t } = useLanguage();
  const [models, setModels] = useState<MLModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [modelAnalytics, setModelAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const list = await api.models.getAll();
        setModels(list);
        if (list.length > 0) {
          const act = list.find(m => m.is_active) || list[0];
          setSelectedModelId(act.id);
          const an = await api.analytics.getModelAnalytics(act.id);
          setModelAnalytics(an);
        }
      } catch (err) {
        console.error('Failed to load models:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleModelChange = async (id: number) => {
    setSelectedModelId(id);
    try {
      const an = await api.analytics.getModelAnalytics(id);
      setModelAnalytics(an);
    } catch (err) {
      console.error('Failed to load model analytics:', err);
    }
  };

  const handleExportReport = async () => {
    if (!selectedModelId) return;
    try {
      const report = await api.export.getModelReport(selectedModelId);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `iris_model_report_${selectedModelId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export model audit report.');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-iris-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">{t('analytics_title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('analytics_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {models.length > 1 && (
            <select
              value={selectedModelId || ''}
              onChange={e => handleModelChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-iris-500"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>
                  {m.model_name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-iris-400" />
            <span>{t('btn_download_report')}</span>
          </button>

          {selectedModelId && (
            <a
              href={api.export.modelReportHtmlUrl(selectedModelId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('btn_print_pdf')}</span>
            </a>
          )}
        </div>
      </div>

      {modelAnalytics ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('metric_accuracy')}
              </span>
              <p className="text-3xl font-black text-emerald-400 mt-1">
                {(modelAnalytics.accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">80/20 test split</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('metric_precision')}
              </span>
              <p className="text-3xl font-black text-white mt-1">
                {(modelAnalytics.precision * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Weighted exactness</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('metric_recall')}
              </span>
              <p className="text-3xl font-black text-white mt-1">
                {(modelAnalytics.recall * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">True positive rate</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t('metric_f1')}
              </span>
              <p className="text-3xl font-black text-iris-300 mt-1">
                {(modelAnalytics.f1_score * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Harmonic mean</p>
            </div>
          </div>

          {/* Plain Language Interpretation Banner */}
          <div className="p-4 bg-gradient-to-r from-iris-500/10 via-iris-500/5 to-transparent rounded-2xl border border-iris-500/30 text-xs flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-iris-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">{t('interpretation_title')}:</span>
              <p className="text-slate-300 leading-relaxed">{modelAnalytics.interpretation}</p>
            </div>
          </div>

          {/* Charts Row: Confusion Matrix + Feature Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
              <ConfusionMatrix
                matrix={modelAnalytics.confusion_matrix}
                labels={modelAnalytics.target_names}
              />
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
              <FeatureImportanceChart importances={modelAnalytics.feature_importances} />
            </div>
          </div>

          {/* Interactive Decision Tree Visualization */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <DecisionTreeViewer node={modelAnalytics.tree_rules} />
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-3xl">
          No trained model found. Please train a Decision Tree model first.
        </div>
      )}
    </div>
  );
};
