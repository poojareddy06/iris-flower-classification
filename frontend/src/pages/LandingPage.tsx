import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  Database,
  BrainCircuit,
  Camera,
  Bot,
  BarChart,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { enableDemoMode } = useAuth();
  const { t } = useLanguage();

  const handleStartAnalysis = () => {
    enableDemoMode();
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-iris-500/30 selection:text-iris-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-iris-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[350px] h-[250px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center relative z-10 space-y-6 max-w-3xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-iris-500/10 border border-iris-500/30 text-iris-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-iris-400" />
            <span>{t('app_subtitle')} • {t('card_model_title')}</span>
          </div>

          {/* Hero Titles */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Understand. Classify.{' '}
            <span className="bg-gradient-to-r from-iris-400 via-iris-300 to-emerald-400 bg-clip-text text-transparent">
              Discover.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            An AI-powered Iris flower classification and botanical analysis platform. Built with
            authentic scikit-learn Decision Tree pipelines, Gini impurity criteria, computer vision
            screening, and domain-restricted conversational intelligence.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStartAnalysis}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-iris-600/30 hover:scale-[1.02] transition-all"
            >
              <span>{t('btn_identify_flower')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('model_training')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <BrainCircuit className="w-4 h-4 text-iris-400" />
              <span>{t('menu_training')}</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 80/20 Train-Test Split
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gini Impurity Criterion
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-Time Decision Path Tracing
            </span>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: Machine Learning */}
          <div
            onClick={() => onNavigate('predict')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-iris-500/40 transition-all duration-300 space-y-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-iris-500/10 text-iris-400 flex items-center justify-center border border-iris-500/20 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-iris-300 transition-colors">
              {t('card_model_title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supervised classification using 4 physical flower measurements. Calculate genuine
              accuracy, confusion matrix, precision, recall, F1, and feature importance.
            </p>
          </div>

          {/* Card 2: Computer Vision */}
          <div
            onClick={() => onNavigate('image_analyzer')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 space-y-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              {t('menu_image_analyzer')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated computer vision pipeline separate from the tabular model. Identifies Iris
              species from floral photographs and screens for visible foliar leaf spots or chlorosis.
            </p>
          </div>

          {/* Card 3: AI Assistant */}
          <div
            onClick={() => onNavigate('ai_assistant')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-iris-500/40 transition-all duration-300 space-y-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-iris-500/10 text-iris-300 flex items-center justify-center border border-iris-500/20 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-iris-300 transition-colors">
              {t('menu_ai_assistant')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly restricted AI assistant answering queries exclusively about this machine
              learning project, Decision Trees, Iris biology, and model evaluations.
            </p>
          </div>
        </div>

        {/* Feature Deep Dive Architecture Banner */}
        <div className="mt-12 glass-panel p-8 rounded-3xl border border-iris-500/20 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900/60 to-slate-950">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-iris-400">
              {t('stat_current_model')}
            </span>
            <h4 className="text-xl font-bold text-white">
              Production Machine Learning Architecture
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Empowering botanical classification with real-time decision trees, rule trajectory
              explanations, dataset diagnostics, and comparative model analytics.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('datasets')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Database className="w-4 h-4 text-iris-400" />
              <span>{t('menu_datasets')}</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="px-5 py-2.5 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-iris-600/30 transition flex items-center gap-1.5"
            >
              <BarChart className="w-4 h-4" />
              <span>{t('menu_analytics')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>
          © 2026 Iris Flower Species Classification Platform • Supervised Machine Learning with Decision Trees
        </p>
      </footer>
    </div>
  );
};

