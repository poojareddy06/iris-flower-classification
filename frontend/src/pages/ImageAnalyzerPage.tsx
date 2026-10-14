import React, { useState, useRef } from 'react';
import { ImageAnalysisResult } from '../types';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Droplets,
  ShieldAlert,
  Info,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const ImageAnalyzerPage: React.FC = () => {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await api.image.analyze(selectedFile);
      setAnalysis(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Image analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUnrelated = analysis && (!analysis.is_suitable || analysis.alert?.is_unrelated);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Camera className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">{t('image_analyzer_title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('image_analyzer_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Pipeline: Dedicated CV Service
          </span>
        </div>
      </div>

      {/* Prominent Alert Notification when Wrong / Unrelated Image is Detected */}
      {isUnrelated && (
        <div className="p-5 bg-gradient-to-r from-rose-950/80 via-rose-900/50 to-slate-900 border-2 border-rose-500/50 rounded-3xl text-rose-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl shadow-rose-950/50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0 shadow-lg">
              <ShieldAlert className="w-7 h-7 animate-pulse text-rose-400" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  {analysis.alert?.title || t('alert_unrelated_image_title')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-500/50">
                  {t('badge_unrecognized_image')}
                </span>
              </div>
              <p className="text-rose-200/95 leading-relaxed max-w-2xl text-xs">
                {analysis.alert?.message || t('alert_unrelated_image_desc')}
              </p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shrink-0 transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('btn_try_another_photo')}</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Main Grid: Upload & Preview + Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload & Preview Area */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-900/40 hover:border-slate-500'
              }`}
            >
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <UploadCloud className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {t('drag_drop_image')}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {t('supported_formats')}
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                {t('btn_browse_files')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-[360px] bg-slate-950 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Flower preview"
                  className="max-h-[360px] w-auto object-contain rounded-2xl"
                />
                {isUnrelated && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-rose-950/90 border border-rose-500/50 rounded-full text-[11px] font-bold text-rose-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{t('badge_unrecognized_image')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  {t('btn_clear_image')}
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition hover:scale-[1.02]"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('btn_analyzing_vision')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{t('btn_run_vision')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Architecture Separation Box */}
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-slate-200 block">Architecture Separation:</span>
            <p>
              {t('disclaimer_disease')}
            </p>
          </div>
        </div>

        {/* Right: Analysis & Diagnostics Results */}
        <div className="space-y-6">
          {analysis ? (
            isUnrelated ? (
              /* Dedicated Rejection & Alert Notification Card */
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border-2 border-rose-500/40 space-y-6 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 shadow-2xl animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-rose-500/20">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Analysis Alert Notification</span>
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      {analysis.alert?.title || t('alert_unrelated_image_title')}
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                    Confidence: 0%
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-2">
                  <span className="font-bold text-rose-100 block text-xs">
                    Rejection Reason:
                  </span>
                  <p className="leading-relaxed">
                    {analysis.alert?.message || t('alert_unrelated_image_desc')}
                  </p>
                </div>

                {/* Upload Requirements Guide */}
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-200 font-bold">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>{t('alert_requirements_title')}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {t('alert_requirements_guide')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-iris-400 block font-bold uppercase">Iris setosa</span>
                      <span className="text-[11px] text-slate-300 mt-0.5 block">Arctic/Bristle Iris, compact standards</span>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-iris-400 block font-bold uppercase">Iris versicolor</span>
                      <span className="text-[11px] text-slate-300 mt-0.5 block">Harlequin Blue Flag, yellow throat</span>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-iris-400 block font-bold uppercase">Iris virginica</span>
                      <span className="text-[11px] text-slate-300 mt-0.5 block">Virginia Iris, large arching sepals</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{t('btn_try_another_photo')}</span>
                  </button>
                  <span className="text-[10px] text-slate-500">
                    Pipeline: {analysis.model_pipeline}
                  </span>
                </div>
              </div>
            ) : (
              /* Normal Valid Flower Analysis Card */
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-6 bg-gradient-to-br from-slate-900/95 via-slate-900/70 to-slate-950">
                {/* Species Identification */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t('botanical_id_title')}
                  </span>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {analysis.predicted_species}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {(analysis.confidence * 100).toFixed(0)}% {t('confidence_score_label')}
                    </span>
                  </div>
                  {analysis.flower_info?.common_name && (
                    <p className="text-xs text-iris-300 font-semibold mt-1">
                      {analysis.flower_info.common_name} •{' '}
                      <span className="italic font-normal">{analysis.flower_info.scientific_name}</span>
                    </p>
                  )}
                </div>

                {/* Botanical Characteristics */}
                {analysis.flower_info?.general_characteristics && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-400 block text-[11px]">
                      {t('observed_features')}
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {analysis.flower_info.general_characteristics}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">{t('petal_length')}</span>
                        <span className="font-bold text-white mt-0.5 block">
                          {analysis.flower_info.typical_appearance?.petal_length}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block uppercase">{t('sepal_length')}</span>
                        <span className="font-bold text-white mt-0.5 block">
                          {analysis.flower_info.typical_appearance?.sepal_length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span>Native Habitat: {analysis.flower_info.native_habitat}</span>
                    </div>
                  </div>
                )}

                {/* Foliar Problem / Disease Inspection */}
                {analysis.possible_disease && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                        {t('foliar_health_title')}
                      </span>
                      {analysis.possible_disease.confidence_score && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {t('confidence_score_label')}: {(analysis.possible_disease.confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2">
                        {analysis.possible_disease.issue_detected.includes('No Visible') ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="font-bold text-xs text-white">
                          {analysis.possible_disease.issue_detected}
                        </span>
                      </div>

                      {/* Visual Indicators */}
                      <div className="space-y-1 pl-6">
                        {analysis.possible_disease.visual_indicators?.map((ind, idx) => (
                          <p key={idx} className="text-[11px] text-slate-300">
                            • {ind}
                          </p>
                        ))}
                      </div>

                      {/* Disclaimer Banner */}
                      <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                        {analysis.possible_disease.disclaimer}
                      </div>

                      {/* Next Steps / Recommendations */}
                      {analysis.possible_disease.suggested_actions && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            {t('recommended_care')}
                          </span>
                          <ul className="space-y-1 text-[11px] text-slate-300">
                            {analysis.possible_disease.suggested_actions.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Pipeline: {analysis.model_pipeline}</span>
                  <span>{t('col_timestamp')}: {analysis.created_at ? new Date(analysis.created_at).toLocaleString() : ''}</span>
                </div>
              </div>
            )
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Camera className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t('image_analyzer_title')}</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {t('image_analyzer_desc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
