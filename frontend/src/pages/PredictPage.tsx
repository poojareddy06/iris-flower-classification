import React, { useState } from 'react';
import { PredictionResult } from '../types';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  Target,
  Sparkles,
  GitFork,
  Info,
  Sliders,
  Flower2,
  RefreshCw
} from 'lucide-react';

interface Preset {
  id: string;
  nameKey: string;
  defaultName: string;
  species: string;
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
}

const PRESETS: Preset[] = [
  {
    id: 'setosa',
    nameKey: 'typical_setosa',
    defaultName: 'Typical Setosa',
    species: 'Iris-setosa',
    sepal_length: 5.1,
    sepal_width: 3.5,
    petal_length: 1.4,
    petal_width: 0.2,
  },
  {
    id: 'versicolor',
    nameKey: 'typical_versicolor',
    defaultName: 'Typical Versicolor',
    species: 'Iris-versicolor',
    sepal_length: 5.9,
    sepal_width: 3.0,
    petal_length: 4.2,
    petal_width: 1.5,
  },
  {
    id: 'virginica',
    nameKey: 'typical_virginica',
    defaultName: 'Typical Virginica',
    species: 'Iris-virginica',
    sepal_length: 6.5,
    sepal_width: 3.0,
    petal_length: 5.5,
    petal_width: 1.8,
  },
];

export const PredictPage: React.FC = () => {
  const { t } = useLanguage();
  const [sepalLength, setSepalLength] = useState<number>(5.1);
  const [sepalWidth, setSepalWidth] = useState<number>(3.5);
  const [petalLength, setPetalLength] = useState<number>(1.4);
  const [petalWidth, setPetalWidth] = useState<number>(0.2);

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPredicting(true);
    setErrorMsg(null);

    try {
      const res = await api.predictions.predict({
        sepal_length: Number(sepalLength),
        sepal_width: Number(sepalWidth),
        petal_length: Number(petalLength),
        petal_width: Number(petalWidth),
      });
      setPrediction(res);

      if (res.confidence > 0.8) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#22c55e'],
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Prediction failed.');
    } finally {
      setIsPredicting(false);
    }
  };

  const loadPreset = (p: Preset) => {
    setSepalLength(p.sepal_length);
    setSepalWidth(p.sepal_width);
    setPetalLength(p.petal_length);
    setPetalWidth(p.petal_width);
  };

  const getSpeciesBadge = (species: string) => {
    if (species.toLowerCase().includes('setosa')) {
      return {
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        text: 'text-emerald-400',
        label: 'Iris setosa (Arctic Iris)',
      };
    }
    if (species.toLowerCase().includes('versicolor')) {
      return {
        bg: 'bg-iris-500/15 text-iris-300 border-iris-500/30',
        text: 'text-iris-400',
        label: 'Iris versicolor (Northern Blue Flag)',
      };
    }
    return {
      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      text: 'text-blue-400',
      label: 'Iris virginica (Virginia Iris)',
    };
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-iris-500/10 text-iris-400 border border-iris-500/20">
              <Target className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">{t('predict_title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('predict_subtitle')}
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">{t('quick_presets')}:</span>
          {PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              {t(p.nameKey, p.defaultName)}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Input Form + Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input Form with Synchronized Sliders */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-iris-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t('input_dimensions_label')} (cm)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">0.1 - 10.0 cm</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-6">
            {/* Sepal Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">{t('sepal_length')}</label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={sepalLength}
                    onChange={e => setSepalLength(parseFloat(e.target.value) || 1.0)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-right font-bold text-white text-xs focus:outline-none focus:border-iris-500"
                  />
                  <span className="text-slate-500">cm</span>
                </div>
              </div>
              <input
                type="range"
                min="4.0"
                max="8.0"
                step="0.1"
                value={sepalLength}
                onChange={e => setSepalLength(parseFloat(e.target.value))}
                className="w-full accent-iris-500 cursor-pointer"
              />
            </div>

            {/* Sepal Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">{t('sepal_width')}</label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="6.0"
                    value={sepalWidth}
                    onChange={e => setSepalWidth(parseFloat(e.target.value) || 1.0)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-right font-bold text-white text-xs focus:outline-none focus:border-iris-500"
                  />
                  <span className="text-slate-500">cm</span>
                </div>
              </div>
              <input
                type="range"
                min="2.0"
                max="4.5"
                step="0.1"
                value={sepalWidth}
                onChange={e => setSepalWidth(parseFloat(e.target.value))}
                className="w-full accent-iris-500 cursor-pointer"
              />
            </div>

            {/* Petal Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <span>{t('petal_length')}</span>
                  <span className="text-[10px] text-iris-400 bg-iris-500/10 px-1.5 rounded">
                    Key Metric
                  </span>
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="8.0"
                    value={petalLength}
                    onChange={e => setPetalLength(parseFloat(e.target.value) || 0.5)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-right font-bold text-white text-xs focus:outline-none focus:border-iris-500"
                  />
                  <span className="text-slate-500">cm</span>
                </div>
              </div>
              <input
                type="range"
                min="1.0"
                max="7.0"
                step="0.1"
                value={petalLength}
                onChange={e => setPetalLength(parseFloat(e.target.value))}
                className="w-full accent-iris-500 cursor-pointer"
              />
            </div>

            {/* Petal Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <span>{t('petal_width')}</span>
                  <span className="text-[10px] text-iris-400 bg-iris-500/10 px-1.5 rounded">
                    Key Metric
                  </span>
                </label>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="4.0"
                    value={petalWidth}
                    onChange={e => setPetalWidth(parseFloat(e.target.value) || 0.1)}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-right font-bold text-white text-xs focus:outline-none focus:border-iris-500"
                  />
                  <span className="text-slate-500">cm</span>
                </div>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.6"
                step="0.1"
                value={petalWidth}
                onChange={e => setPetalWidth(parseFloat(e.target.value))}
                className="w-full accent-iris-500 cursor-pointer"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPredicting}
              className="w-full py-3.5 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-iris-600/30 transition hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {isPredicting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('btn_identifying')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('btn_identify_flower')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Live Prediction Output & Decision Path */}
        <div className="space-y-6">
          {prediction ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-iris-500/30 space-y-5 bg-gradient-to-br from-white dark:from-slate-900/95 via-slate-50 dark:via-slate-900/70 to-slate-100 dark:to-slate-950">
              {/* Predicted Species Title Card */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-iris-600 dark:text-iris-400 block">
                  {t('predicted_species_label')}
                </span>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {prediction.predicted_species}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      getSpeciesBadge(prediction.predicted_species).bg
                    }`}
                  >
                    {(prediction.confidence * 100).toFixed(1)}% {t('confidence_label')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getSpeciesBadge(prediction.predicted_species).label}
                </p>
              </div>

              {/* Input Values Grid */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('input_dimensions_label')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-3 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t('sepal_length')}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{prediction.inputs?.["Sepal Length"] ?? sepalLength} cm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t('sepal_width')}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{prediction.inputs?.["Sepal Width"] ?? sepalWidth} cm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t('petal_length')}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{prediction.inputs?.["Petal Length"] ?? petalLength} cm</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t('petal_width')}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{prediction.inputs?.["Petal Width"] ?? petalWidth} cm</strong>
                  </div>
                </div>
              </div>

              {/* Class Probability Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t('class_probabilities_title')}
                </span>
                <div className="space-y-2">
                  {Object.entries(prediction.probabilities || {}).map(([sp, prob]) => {
                    const isWinner = sp === prediction.predicted_species;
                    const pct = (prob * 100).toFixed(1);
                    return (
                      <div key={sp} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-semibold ${isWinner ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {sp}
                          </span>
                          <span className={`font-mono ${isWinner ? 'text-emerald-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isWinner ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Why this prediction? */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-iris-500" />
                  <span>{t('why_this_prediction')}</span>
                </span>
                <div className="p-3.5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>{prediction.explanation}</p>
                </div>
              </div>

              {/* Decision Path Trace */}
              {prediction.decision_path && prediction.decision_path.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-iris-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {t('decision_rules_trace')}
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {prediction.decision_path.map(step => (
                      <div
                        key={step.step}
                        className="p-3 bg-white dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-iris-500/20 text-iris-600 dark:text-iris-300 flex items-center justify-center font-bold text-[10px] font-mono">
                            {step.step}
                          </span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">{step.description}</span>
                        </div>
                        {step.condition_met !== undefined && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              step.condition_met
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {step.condition_met ? 'Branch: Left (True)' : 'Branch: Right (False)'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Footer */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span><strong>{t('stat_current_model')}:</strong> {prediction.model_name}</span>
                <span><strong>{t('col_timestamp')}:</strong> {prediction.created_at ? new Date(prediction.created_at).toLocaleString() : 'Just now'}</span>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
              <div className="p-4 rounded-3xl bg-iris-500/10 text-iris-500 dark:text-iris-400 border border-iris-500/20">
                <Flower2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('awaiting_inputs')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                  {t('adjust_sliders_hint')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
