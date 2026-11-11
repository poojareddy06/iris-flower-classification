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
  BarChart3,
  Globe2,
  CheckCircle2,
  GraduationCap,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { enableDemoMode } = useAuth();
  const { t } = useLanguage();

  const handleStartAnalyzing = () => {
    enableDemoMode();
    onNavigate('dashboard');
  };

  const handleExploreProject = () => {
    onNavigate('education');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-iris-500/30 selection:text-iris-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-12 pb-20 px-6 max-w-7xl mx-auto w-full">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-iris-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-40 right-10 w-[380px] h-[280px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute top-52 left-10 w-[320px] h-[240px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-iris-500/10 border border-iris-500/30 text-iris-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-iris-400" />
            <span>Supervised Machine Learning • Decision Tree Classifier</span>
          </div>

          {/* Required Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            See the Flower.{' '}
            <span className="bg-gradient-to-r from-iris-400 via-iris-300 to-emerald-400 bg-clip-text text-transparent">
              Understand the Pattern.
            </span>{' '}
            Discover the Species.
          </h1>

          {/* Required Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            An intelligent flower classification and analysis platform powered by machine learning.
          </p>

          {/* Call to Actions: Start Analyzing & Explore Project */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleStartAnalyzing}
              className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 text-white rounded-2xl text-sm font-bold shadow-lg shadow-iris-600/30 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleExploreProject}
              className="flex items-center gap-2 px-7 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02]"
            >
              <GraduationCap className="w-4 h-4 text-iris-400" />
              <span>Explore Project</span>
            </button>
          </div>

          {/* Trust & Scientific Methodology Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 80/20 Stratified Partitioning
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Gini Impurity Criterion
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dynamic Decision Path Tracing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Mandatory Paid API Keys
            </span>
          </div>
        </div>

        {/* 6 Required Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {/* Card 1: Smart Iris Classification */}
          <div
            onClick={() => onNavigate('predict')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-iris-500/40 transition-all duration-300 space-y-3 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-iris-500/10 text-iris-400 flex items-center justify-center border border-iris-500/20 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-iris-300 transition-colors">
              Smart Iris Classification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supervised classification using 4 botanical measurements (Sepal Length, Sepal Width, Petal Length, Petal Width) with scikit-learn Decision Trees and real-time decision path explanation.
            </p>
          </div>

          {/* Card 2: Dataset Intelligence */}
          <div
            onClick={() => onNavigate('dataset_manager')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition-all duration-300 space-y-3 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              Dataset Intelligence
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dataset Lab with drag-and-drop CSV upload, validation against canonical Iris requirements, duplicate checking, missing value analysis, and interactive table sorting and search.
            </p>
          </div>

          {/* Card 3: Flower Image Analysis */}
          <div
            onClick={() => onNavigate('image_analyzer')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 space-y-3 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              Flower Image Analysis
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated, local computer-vision screening separate from the tabular Decision Tree model. Identifies Iris species from floral photographs and screens for foliar leaf spots or chlorosis.
            </p>
          </div>

          {/* Card 4: AI Project Assistant */}
          <div
            onClick={() => onNavigate('ai_assistant')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all duration-300 space-y-3 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              AI Project Assistant
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly domain-restricted Iris AI assistant operating offline without API keys. Explains Decision Trees, Gini impurity, confusion matrices, and project-specific findings.
            </p>
          </div>

          {/* Card 5: Model Performance Analytics */}
          <div
            onClick={() => onNavigate('analytics')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 space-y-3 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
              Model Performance Analytics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamic verification of Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Gini Feature Importance charts rendered with local Recharts.
            </p>
          </div>

          {/* Card 6: Multilingual Experience */}
          <div
            onClick={() => onNavigate('settings')}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 space-y-3 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/70"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
              Multilingual Experience
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete native translation dictionaries across 5 languages: English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), and Kannada (ಕನ್ನಡ) without external translation APIs.
            </p>
          </div>
        </div>

        {/* Educational Workflow Banner */}
        <div className="mt-12 glass-panel p-8 rounded-3xl border border-iris-500/20 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-900/60 to-slate-950">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-iris-400">
              Interactive ML Architecture
            </span>
            <h4 className="text-xl font-bold text-white">
              Decision Tree Supervised Learning Pipeline
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Dataset → Features → 80/20 Stratified Split → Decision Tree (Gini) → Prediction → Evaluation.
              Explore our comprehensive educational modules and original slide deck.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('education')}
              className="px-5 py-2.5 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition flex items-center gap-2 hover:scale-[1.02]"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Explore ML Concepts</span>
            </button>
            <button
              onClick={() => onNavigate('model_training')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <span>Train Model</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        <p>
          Iris AI – Intelligent Flower Classification and Analysis Platform • Original Project: Iris Flower Species Classification Using Decision Tree by Pooja V (Edu Tantr)
        </p>
      </footer>
    </div>
  );
};
