import React, { useState, useEffect } from 'react';
import { MLModel } from '../types';
import { api } from '../api/client';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { DecisionTreeViewer } from '../components/DecisionTreeViewer';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  BarChart3,
  Download,
  Sparkles,
  Printer,
  FileText,
  PieChart as PieChartIcon,
  CheckCircle2,
  FileSpreadsheet
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

  const handleExportJSON = async () => {
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
        <p>Loading model intelligence analytics...</p>
      </div>
    );
  }

  // Format distributions for Recharts
  const classDistData = modelAnalytics?.class_distribution
    ? Object.entries(modelAnalytics.class_distribution).map(([name, count]) => ({
        species: name.replace('Iris-', ''),
        count: Number(count),
      }))
    : [
        { species: 'setosa', count: 50 },
        { species: 'versicolor', count: 50 },
        { species: 'virginica', count: 50 },
      ];

  const predDistData = modelAnalytics?.prediction_distribution
    ? Object.entries(modelAnalytics.prediction_distribution).map(([name, count]) => ({
        name: name.replace('Iris-', ''),
        value: Number(count),
      }))
    : [
        { name: 'setosa', value: 10 },
        { name: 'versicolor', value: 8 },
        { name: 'virginica', value: 12 },
      ];

  const SPECIES_COLORS = ['#10b981', '#8b5cf6', '#38bdf8', '#f59e0b'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
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
            Real-time model intelligence, dynamic metrics verification, distribution charts, and local export center.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          {/* Export Center Actions */}
          {selectedModelId && (
            <>
              <a
                href={api.export.modelReportPDFUrl(selectedModelId)}
                download
                className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/25 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </a>

              <a
                href={api.export.modelReportHtmlUrl(selectedModelId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5 text-iris-400" />
                <span>Print / HTML</span>
              </a>

              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                title="Download JSON Report"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </>
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
              <p className="text-xs text-slate-500 mt-1">Unseen test partition</p>
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

          {/* Row 1: Confusion Matrix & Feature Importance */}
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

          {/* Row 2: Class Distribution & Prediction Distribution (Recharts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Distribution Recharts BarChart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Dataset Class Distribution</h3>
                </div>
                <span className="text-xs text-slate-400">Ground-truth counts</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="species" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {classDistData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Balanced distribution: 50 specimens each of *Setosa*, *Versicolor*, and *Virginica*.
              </p>
            </div>

            {/* Prediction Distribution Recharts PieChart */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Prediction Distribution</h3>
                </div>
                <span className="text-xs text-slate-400">Inference breakdown</span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={predDistData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {predDistData.map((_, index) => (
                        <Cell key={`pie-cell-${index}`} fill={SPECIES_COLORS[index % SPECIES_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Proportion of classified specimens across all user inference operations.
              </p>
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
