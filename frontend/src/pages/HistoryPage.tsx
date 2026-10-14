import React, { useState, useEffect } from 'react';
import { PredictionResult, ImageAnalysisResult } from '../types';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import {
  History,
  Download,
  Trash2,
  Search,
  Camera,
  Target,
  Eye,
  X
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'predictions' | 'images'>('predictions');
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [images, setImages] = useState<ImageAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionResult | null>(null);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const pList = await api.predictions.getHistory(undefined, sortBy);
      setPredictions(pList);

      const iList = await api.image.getHistory();
      setImages(iList);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [sortBy]);

  const handleDeletePrediction = async (id?: number) => {
    if (!id) return;
    try {
      await api.predictions.deleteRecord(id);
      setPredictions(prev => prev.filter(p => p.id !== id));
      if (selectedPrediction?.id === id) setSelectedPrediction(null);
    } catch (err) {
      alert('Failed to delete prediction record.');
    }
  };

  const handleDeleteImage = async (id?: number) => {
    if (!id) return;
    try {
      await api.image.delete(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      alert('Failed to delete image record.');
    }
  };

  const handleClearAllPredictions = async () => {
    if (!confirm('Are you sure you want to clear all your prediction records?')) return;
    try {
      await api.predictions.clearAll();
      setPredictions([]);
    } catch (err) {
      alert('Failed to clear records.');
    }
  };

  const filteredPredictions = predictions.filter(
    p =>
      p.predicted_species.toLowerCase().includes(search.toLowerCase()) ||
      p.model_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredImages = images.filter(img =>
    img.predicted_species.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-iris-500/10 text-iris-400 border border-iris-500/20">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">{t('history_title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('history_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={api.export.predictionsCSVUrl()}
            download
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-iris-400" />
            <span>{t('btn_export_csv')}</span>
          </a>

          {predictions.length > 0 && tab === 'predictions' && (
            <button
              onClick={handleClearAllPredictions}
              className="flex items-center gap-1 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('btn_clear_history')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search / Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setTab('predictions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'predictions'
                ? 'bg-iris-600 text-white shadow-md shadow-iris-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>{t('tab_flower_predictions')} ({predictions.length})</span>
          </button>

          <button
            onClick={() => setTab('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'images'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t('tab_image_analyses')} ({images.length})</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('search_history_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-iris-500 w-44"
            />
          </div>

          {tab === 'predictions' && (
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-iris-500"
            >
              <option value="newest">{t('sort_newest')}</option>
              <option value="oldest">{t('sort_oldest')}</option>
              <option value="confidence">{t('sort_confidence_high')}</option>
            </select>
          )}
        </div>
      </div>

      {/* Predictions Table Tab */}
      {tab === 'predictions' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          {filteredPredictions.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{t('col_inference_id')}</th>
                    <th className="py-3 px-4">{t('col_species')}</th>
                    <th className="py-3 px-4">{t('col_confidence')}</th>
                    <th className="py-3 px-4">{t('sepal_length')} / W</th>
                    <th className="py-3 px-4">{t('petal_length')} / W</th>
                    <th className="py-3 px-4">{t('stat_current_model')}</th>
                    <th className="py-3 px-4">{t('col_timestamp')}</th>
                    <th className="py-3 px-4 text-right">{t('col_action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredPredictions.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-slate-500 font-sans">#{p.id}</td>
                      <td className="py-3 px-4 font-sans font-bold text-white">
                        <span className="px-2 py-0.5 rounded-md bg-iris-500/10 text-iris-300 border border-iris-500/20">
                          {p.predicted_species}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">
                        {(p.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {p.inputs['Sepal Length']} / {p.inputs['Sepal Width']} cm
                      </td>
                      <td className="py-3 px-4 text-slate-200">
                        {p.inputs['Petal Length']} / {p.inputs['Petal Width']} cm
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-sans truncate max-w-[140px]">
                        {p.model_name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-sans">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPrediction(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Inspect Decision Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePrediction(p.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-2xl">
              {t('no_history_records')}
            </div>
          )}
        </div>
      )}

      {/* Image Analyses History Tab */}
      {tab === 'images' && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          {filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredImages.map(img => (
                <div
                  key={img.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col justify-between"
                >
                  <div className="h-44 bg-slate-950 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={img.image_url}
                      alt="Analyzed flower"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-emerald-400 border border-emerald-500/30">
                      {(img.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{img.predicted_species}</h4>
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {img.flower_info?.common_name && (
                      <p className="text-xs text-iris-300">{img.flower_info.common_name}</p>
                    )}

                    {img.possible_disease?.issue_detected && (
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                        <span className="text-[10px] text-slate-500 uppercase block">{t('foliar_health_title')}</span>
                        {img.possible_disease.issue_detected}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      {img.created_at ? new Date(img.created_at).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 border border-slate-800 rounded-2xl">
              {t('no_history_records')}
            </div>
          )}
        </div>
      )}

      {/* Decision Path Inspect Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-iris-500/40 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-iris-400" />
                <h3 className="text-base font-bold text-white">{t('why_this_prediction')}</h3>
              </div>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">{t('predicted_species_label')}</span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                {selectedPrediction.predicted_species}
              </h2>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                {t('confidence_label')}: {(selectedPrediction.confidence * 100).toFixed(1)}%
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {selectedPrediction.explanation}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {Object.entries(selectedPrediction.inputs).map(([k, v]) => (
                <div key={k} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">{k}</span>
                  <span className="font-bold text-white">{v} cm</span>
                </div>
              ))}
            </div>

            {/* Decision Path */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                {t('decision_rules_trace')}
              </span>
              <div className="space-y-1.5">
                {selectedPrediction.decision_path?.map(step => (
                  <div
                    key={step.step}
                    className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-200 font-mono">
                      #{step.step}: {step.description}
                    </span>
                    {step.condition_met !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-400">
                        {step.condition_met ? 'Branch ≤' : 'Branch >'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedPrediction(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
