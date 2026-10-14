import React, { useState, useEffect } from 'react';
import { MLModel, Dataset } from '../types';
import { api } from '../api/client';
import { ConfusionMatrix } from '../components/ConfusionMatrix';
import { FeatureImportanceChart } from '../components/FeatureImportanceChart';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  Cpu,
  Play,
  Sliders,
  ArrowRight,
  BarChart,
  RefreshCw
} from 'lucide-react';

interface ModelTrainingPageProps {
  onNavigate: (page: string) => void;
}

export const ModelTrainingPage: React.FC<ModelTrainingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | undefined>();
  const [models, setModels] = useState<MLModel[]>([]);
  const [activeModel, setActiveModel] = useState<MLModel | null>(null);

  // Hyperparameters
  const [criterion, setCriterion] = useState<string>('gini');
  const [testSize, setTestSize] = useState<number>(0.2);
  const [randomState, setRandomState] = useState<number>(42);
  const [maxDepth, setMaxDepth] = useState<number | ''>('');
  const [minSamplesSplit, setMinSamplesSplit] = useState<number>(2);
  const [minSamplesLeaf, setMinSamplesLeaf] = useState<number>(1);
  const [modelName, setModelName] = useState<string>('Decision Tree Classifier (Gini 80/20)');

  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingStep, setTrainingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dsList = await api.datasets.getAll();
        setDatasets(dsList);
        if (dsList.length > 0) setSelectedDatasetId(dsList[0].id);

        const mList = await api.models.getAll();
        setModels(mList);
        if (mList.length > 0) {
          const act = mList.find(m => m.is_active) || mList[0];
          setActiveModel(act);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    fetchData();
  }, []);

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTraining(true);
    setErrorMsg(null);

    setTrainingStep(t('step_data_ingest'));
    await new Promise(r => setTimeout(r, 350));

    setTrainingStep(t('step_cleaning'));
    await new Promise(r => setTimeout(r, 350));

    setTrainingStep(t('step_split'));
    await new Promise(r => setTimeout(r, 400));

    setTrainingStep(t('step_tree_fit'));

    try {
      const trained = await api.models.train({
        dataset_id: selectedDatasetId,
        model_name: modelName || `Decision Tree (${criterion}, ${(1 - testSize) * 100}/${testSize * 100})`,
        criterion,
        test_size: testSize,
        random_state: randomState,
        max_depth: maxDepth === '' ? null : Number(maxDepth),
        min_samples_split: minSamplesSplit,
        min_samples_leaf: minSamplesLeaf,
      });

      setActiveModel(trained);
      setModels(prev => [trained, ...prev]);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#22c55e', '#38bdf8'],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Model training failed.');
    } finally {
      setIsTraining(false);
      setTrainingStep('');
    }
  };

  const pipelineSteps = [
    t('step_data_ingest'),
    t('step_cleaning'),
    t('step_features'),
    t('step_split'),
    t('step_tree_fit'),
    t('step_evaluation'),
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-iris-500/10 text-iris-400 border border-iris-500/20">
              <Cpu className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">{t('model_training_title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('model_training_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <BarChart className="w-3.5 h-3.5 text-iris-400" />
            <span>{t('btn_model_analytics')}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Visual Pipeline Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('pipeline_flow_title')}
          </span>
          <span className="text-[11px] text-iris-500 dark:text-iris-400 font-semibold">
            {t('active_engine')}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {pipelineSteps.map((step, idx, arr) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
                <span className="w-5 h-5 rounded-full bg-iris-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
              {idx < arr.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden md:block shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Grid: Hyperparameters Form + Live Model Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Training Configuration Form */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-iris-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('hyperparameters_config')}
            </h3>
          </div>

          <form onSubmit={handleTrain} className="space-y-4 text-xs">
            {/* Model Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">{t('param_model_name')}</label>
              <input
                type="text"
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iris-500"
              />
            </div>

            {/* Dataset Selector */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">{t('available_datasets')}</label>
              <select
                value={selectedDatasetId}
                onChange={e => setSelectedDatasetId(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iris-500"
              >
                {datasets.map(ds => (
                  <option key={ds.id} value={ds.id}>
                    {ds.filename} ({ds.row_count} rows)
                  </option>
                ))}
              </select>
            </div>

            {/* Criterion Selection */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>{t('param_criterion')}</span>
                <span className="text-[10px] text-iris-400 font-normal">Gini default</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCriterion('gini')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    criterion === 'gini'
                      ? 'bg-iris-600 text-white border-iris-500 shadow-md shadow-iris-600/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Gini Impurity
                </button>
                <button
                  type="button"
                  onClick={() => setCriterion('entropy')}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    criterion === 'entropy'
                      ? 'bg-iris-600 text-white border-iris-500 shadow-md shadow-iris-600/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  Entropy (Info Gain)
                </button>
              </div>
            </div>

            {/* Train/Test Split Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">{t('param_split')}</label>
                <span className="text-iris-400 font-mono font-bold">
                  {((1 - testSize) * 100).toFixed(0)}% / {(testSize * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={testSize}
                onChange={e => setTestSize(parseFloat(e.target.value))}
                className="w-full accent-iris-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>90/10</span>
                <span className="font-bold text-slate-300">80/20 ({t('split_label')})</span>
                <span>60/40</span>
              </div>
            </div>

            {/* Max Depth */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center justify-between">
                <span>{t('param_max_depth')}</span>
                <span className="text-[10px] text-slate-500">None</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Unlimited (None)"
                value={maxDepth}
                onChange={e => setMaxDepth(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iris-500"
              />
            </div>

            {/* Min Samples Split / Leaf */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">{t('param_min_samples_split')}</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={minSamplesSplit}
                  onChange={e => setMinSamplesSplit(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iris-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">{t('param_min_samples_leaf')}</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={minSamplesLeaf}
                  onChange={e => setMinSamplesLeaf(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iris-500"
                />
              </div>
            </div>

            {/* Random State */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">{t('param_random_state')}</label>
              <input
                type="number"
                value={randomState}
                onChange={e => setRandomState(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-iris-500 font-mono"
              />
            </div>

            {/* Train Submit Button */}
            <button
              type="submit"
              disabled={isTraining}
              className="w-full py-3 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-iris-600/30 transition hover:scale-[1.01] flex items-center justify-center gap-2 mt-4"
            >
              {isTraining ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('btn_training_in_progress')}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t('btn_start_training')}</span>
                </>
              )}
            </button>

            {isTraining && (
              <div className="p-3 bg-iris-500/10 rounded-xl border border-iris-500/30 text-iris-300 text-xs text-center animate-pulse">
                {trainingStep}
              </div>
            )}
          </form>
        </div>

        {/* Right: Trained Model Results */}
        {activeModel ? (
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{activeModel.model_name}</h2>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Fitted & Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Criterion: {activeModel.criterion.toUpperCase()} • Split: {(1 - activeModel.test_size) * 100}/{(activeModel.test_size * 100).toFixed(0)} • Random State: {activeModel.random_state}
                </p>
              </div>

              <button
                onClick={() => onNavigate('predict')}
                className="flex items-center gap-1.5 px-4 py-2 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition self-start"
              >
                <span>{t('btn_predict_now')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('metric_accuracy')}
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {(activeModel.accuracy * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">80/20 test split</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('metric_precision')}
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {(activeModel.precision * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">Weighted Average</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('metric_recall')}
                </span>
                <p className="text-2xl font-black text-white mt-1">
                  {(activeModel.recall * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">True positive rate</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('metric_f1')}
                </span>
                <p className="text-2xl font-black text-iris-300 mt-1">
                  {(activeModel.f1_score * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] text-slate-500">Harmonic mean</p>
              </div>
            </div>

            {/* Confusion Matrix & Feature Importance row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <ConfusionMatrix
                  matrix={activeModel.confusion_matrix}
                  labels={activeModel.target_names}
                />
              </div>

              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <FeatureImportanceChart importances={activeModel.feature_importances} />
              </div>
            </div>

            {/* Classification Report per Class */}
            {activeModel.classification_report && (
              <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t('tab_classification_report')}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">{t('col_species')}</th>
                        <th className="py-2 px-3">{t('metric_precision')}</th>
                        <th className="py-2 px-3">{t('metric_recall')}</th>
                        <th className="py-2 px-3">{t('metric_f1')}</th>
                        <th className="py-2 px-3">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {activeModel.target_names.map(cls => {
                        const rep = activeModel.classification_report[cls] || {};
                        return (
                          <tr key={cls}>
                            <td className="py-2 px-3 font-sans font-bold text-white">{cls}</td>
                            <td className="py-2 px-3 text-emerald-400">
                              {(rep['precision'] * 100 || 0).toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-iris-300">
                              {(rep['recall'] * 100 || 0).toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-white">
                              {(rep['f1-score'] * 100 || 0).toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-slate-400">{rep['support'] || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-slate-500 border border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3">
            <Cpu className="w-10 h-10 text-slate-600" />
            <p className="text-sm">Click "{t('btn_start_training')}" to execute the training pipeline.</p>
          </div>
        )}
      </div>
    </div>
  );
};
