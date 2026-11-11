import React, { useState } from 'react';
import { PresentationViewer } from '../components/PresentationViewer';
import {
  GraduationCap,
  BrainCircuit,
  Binary,
  Layers,
  Scale,
  Target,
  CheckCircle2,
  FileSpreadsheet,
  PieChart,
  ArrowRight,
  BookOpen,
  Sparkles,
  Presentation as PresentationIcon,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

interface EducationPageProps {
  onNavigate: (page: string) => void;
}

export const EducationPage: React.FC<EducationPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'species' | 'concepts' | 'presentation'>('species');
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<number>(0);

  const workflowSteps = [
    {
      title: 'Dataset',
      subtitle: 'Raw Botanical Data',
      icon: FileSpreadsheet,
      color: 'blue',
      badge: '150 Samples',
      description: 'The canonical Iris dataset comprises 150 flower specimens equally divided across 3 species (50 each: Iris setosa, Iris versicolor, Iris virginica). Introduced by Ronald Fisher in 1936, it is the benchmark supervised dataset in botanical taxonomy.',
      details: [
        'Total records: 150 instances (balanced, 33.3% per species)',
        'Zero missing values in canonical measurements',
        'Automatic ID column elimination to prevent spurious ordinal correlation'
      ]
    },
    {
      title: 'Features',
      subtitle: '4 Physical Dimensions',
      icon: Layers,
      color: 'iris',
      badge: '4 Features',
      description: 'Each flower is characterized by 4 numerical measurements (in cm): Sepal Length, Sepal Width, Petal Length, and Petal Width. Petal dimensions provide superior discriminating boundaries compared to sepals.',
      details: [
        'Sepal Length (cm) & Sepal Width (cm) - outer calyx structure',
        'Petal Length (cm) & Petal Width (cm) - inner floral petals',
        'Feature scaling is unnecessary for Decision Tree partitioning'
      ]
    },
    {
      title: '80/20 Split',
      subtitle: 'Stratified Partitioning',
      icon: Scale,
      color: 'amber',
      badge: '120 Train / 30 Test',
      description: 'The dataset is partitioned into 80% training data (120 samples) and 20% test data (30 samples) using stratified sampling to preserve equal 1:1:1 species balance in both subsets.',
      details: [
        'Training Set: 120 samples (40 Setosa, 40 Versicolor, 40 Virginica)',
        'Test Set: 30 unseen samples (10 of each species held out)',
        'Prevents biased accuracy estimates and guards against overfitting'
      ]
    },
    {
      title: 'Decision Tree',
      subtitle: 'Gini Splitting Criterion',
      icon: BrainCircuit,
      color: 'emerald',
      badge: 'Gini Impurity',
      description: 'The Decision Tree recursively splits nodes by finding the feature and threshold that maximizes purity (minimizing Gini impurity: Gini = 1 - sum(p_i^2)). Tree rules are fully transparent and auditable.',
      details: [
        'Root Split: Petal Length <= 2.45 cm isolates 100% of Setosa with Gini = 0.0',
        'Internal Split: Petal Width <= 1.75 cm separates Versicolor from Virginica',
        'Produces transparent IF-THEN rules with O(depth) inference speed'
      ]
    },
    {
      title: 'Prediction',
      subtitle: 'Inference & Tracing',
      icon: Target,
      color: 'purple',
      badge: 'Deterministic',
      description: 'New flower measurements traverse the tree from root to leaf, matching condition thresholds at each branch to yield the predicted species, class probabilities, and transparent decision path.',
      details: [
        'Outputs predicted species with class probabilities',
        'Traces exact conditional path through decision nodes',
        'Validates measurements against physical botanical ranges'
      ]
    },
    {
      title: 'Evaluation',
      subtitle: 'Rigorous Verification',
      icon: CheckCircle2,
      color: 'rose',
      badge: 'Dynamic Metrics',
      description: 'The trained model is rigorously evaluated on unseen test data using dynamic calculations for Accuracy, Precision, Recall, F1-Score, Confusion Matrix, and Gini Feature Importance.',
      details: [
        'Confusion Matrix: 3x3 grid contrasting ground-truth against predictions',
        'Classification Report: Weighted precision, recall, and harmonic F1-score',
        'Gini Feature Importance: Mean decrease in node impurity'
      ]
    }
  ];

  const mlConcepts = [
    {
      title: 'Machine Learning',
      badge: 'Core Concept',
      icon: BrainCircuit,
      summary: 'A domain of Artificial Intelligence focused on algorithms that learn patterns and rules directly from empirical data without being explicitly programmed.',
      explanation: 'Instead of manually authoring rigid conditional rules for thousands of plant variations, machine learning algorithms iteratively optimize mathematical parameters to map inputs (measurements) to outputs (species labels).'
    },
    {
      title: 'Supervised Learning',
      badge: 'Paradigm',
      icon: Layers,
      summary: 'A category of machine learning where the training dataset includes both input features (X) and ground-truth target outputs (y).',
      explanation: 'The algorithm learns a predictive mapping function y = f(X). During training, errors between predictions and actual labels are used to guide the algorithm toward optimal decision boundaries.'
    },
    {
      title: 'Classification',
      badge: 'Task Type',
      icon: Binary,
      summary: 'A supervised learning task where the target output variable belongs to discrete, categorical classes rather than continuous numbers.',
      explanation: 'Our project implements multi-class classification with 3 discrete botanical categories: Iris-setosa, Iris-versicolor, and Iris-virginica. It differs from regression, which predicts continuous numerical quantities (e.g., flower age or stem height).'
    },
    {
      title: 'Decision Trees',
      badge: 'Algorithm',
      icon: BrainCircuit,
      summary: 'A non-parametric supervised learning algorithm that makes decisions by recursively partitioning feature space into pure subsets.',
      explanation: 'A Decision Tree consists of a Root Node (top test), Internal Decision Nodes (intermediate checks), Branches (Yes/No outcomes), and Leaf Nodes (terminal species predictions). They offer unmatched visual interpretability and instant inference.'
    },
    {
      title: 'Gini Impurity Criterion',
      badge: 'Metric Formula',
      icon: Scale,
      summary: 'A metric measuring the probability of a randomly chosen element being incorrectly labeled if randomly classified according to class distribution.',
      explanation: 'Calculated as Gini = 1 - Σ(p_i²). A pure node containing only one species has Gini = 0.0. Maximum impurity for 3 equally balanced classes is 1 - 3*(1/3)² = 0.667. Gini is computationally faster than entropy because it avoids logarithmic operations.'
    },
    {
      title: 'Train / Test Split (80/20)',
      badge: 'Validation',
      icon: Scale,
      summary: 'Partitioning dataset samples into 80% training data and 20% unseen test data using stratified sampling.',
      explanation: 'Evaluating accuracy on the same data used for training produces biased, overly optimistic results. Holding out 20% (30 unseen flowers) ensures the reported performance reflects real-world generalization to new specimens.'
    },
    {
      title: 'Accuracy',
      badge: 'Metric',
      icon: Target,
      summary: 'The proportion of total correct predictions out of all predictions made: (TP + TN) / Total.',
      explanation: 'In balanced datasets like Iris (where each species accounts for exactly 33.3% of the samples), accuracy is a highly reliable single-number metric of overall model efficacy.'
    },
    {
      title: 'Precision',
      badge: 'Metric',
      icon: CheckCircle2,
      summary: 'Measures exactness: Out of all flowers predicted as species X, what fraction were truly species X: TP / (TP + FP).',
      explanation: 'High precision ensures that when the system identifies a flower as Iris-virginica, users can trust the prediction without fear of false positives.'
    },
    {
      title: 'Recall (Sensitivity)',
      badge: 'Metric',
      icon: CheckCircle2,
      summary: 'Measures completeness: Out of all actual species X flowers in the test set, what fraction did the model find: TP / (TP + FN).',
      explanation: 'High recall ensures that genuine specimens of a species are not missed or mistakenly categorized as another species (false negatives).'
    },
    {
      title: 'F1-Score',
      badge: 'Metric',
      icon: Scale,
      summary: 'The harmonic mean of Precision and Recall: 2 * (Precision * Recall) / (Precision + Recall).',
      explanation: 'The harmonic mean heavily penalizes extreme imbalances between precision and recall, providing a balanced single score of model robustness.'
    },
    {
      title: 'Confusion Matrix',
      badge: 'Evaluation Grid',
      icon: FileSpreadsheet,
      summary: 'A 3x3 table mapping predicted classes (columns) against true classes (rows).',
      explanation: 'Diagonal cells represent True Positives. Off-diagonal cells reveal specific points of confusion. In Iris, Setosa is 100% cleanly separated with 0 confusion, while any rare errors occur strictly between Versicolor and Virginica due to borderline petal dimensions.'
    },
    {
      title: 'Feature Importance',
      badge: 'Explainability',
      icon: PieChart,
      summary: 'The relative contribution of each measurement to decreasing Gini impurity across all tree splits.',
      explanation: 'In Decision Trees, Petal Length and Petal Width account for over 90% of total importance, while Sepal dimensions contribute under 10% because their natural distributions overlap significantly between species.'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-iris-500/10 text-iris-400 border border-iris-500/20">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Machine Learning Educational Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive reference of core concepts, supervised Decision Tree architecture, and the original internship review presentation.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveTab('species')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'species'
                ? 'bg-iris-600 text-white shadow-md shadow-iris-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Iris Species Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('concepts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'concepts'
                ? 'bg-iris-600 text-white shadow-md shadow-iris-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ML Concepts & Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab('presentation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'presentation'
                ? 'bg-iris-600 text-white shadow-md shadow-iris-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PresentationIcon className="w-4 h-4" />
            <span>Internship Review (Pooja V)</span>
          </button>
        </div>
      </div>

      {activeTab === 'concepts' ? (
        <>
          {/* Interactive Visual Workflow */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-iris-500/10 border border-iris-500/30 text-iris-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-iris-400" />
                <span>End-to-End Pipeline</span>
              </div>
              <h2 className="text-xl font-black text-white">
                Visual Supervised Machine Learning Workflow
              </h2>
              <p className="text-xs text-slate-400">
                Click any stage of the pipeline to inspect how botanical raw data transforms into an evaluated Decision Tree model.
              </p>
            </div>

            {/* Workflow Pipeline Steps */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = selectedWorkflowStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedWorkflowStep(idx)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group relative ${
                      isSelected
                        ? 'bg-iris-600/15 border-iris-500 shadow-lg shadow-iris-500/15'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-iris-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        0{idx + 1}
                      </span>
                    </div>

                    <div className="mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-iris-400 block">
                        {step.badge}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{step.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{step.subtitle}</p>
                    </div>

                    {idx < workflowSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Workflow Detail Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-950 border border-iris-500/30 text-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-iris-500/20 text-iris-300 border border-iris-500/30">
                    {React.createElement(workflowSteps[selectedWorkflowStep].icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-iris-400">
                      Step {selectedWorkflowStep + 1} of 6
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {workflowSteps[selectedWorkflowStep].title}: {workflowSteps[selectedWorkflowStep].subtitle}
                    </h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-iris-500/10 border border-iris-500/30 text-iris-300">
                  {workflowSteps[selectedWorkflowStep].badge}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed text-sm">
                {workflowSteps[selectedWorkflowStep].description}
              </p>

              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Implementation Highlights:
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {workflowSteps[selectedWorkflowStep].details.map((d, i) => (
                    <li key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Core ML Concepts Grid (12 Comprehensive Concept Cards) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Machine Learning & Evaluation Guide</h2>
                <p className="text-xs text-slate-400">
                  Definitive explanations of all theoretical concepts, criteria, and evaluation metrics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mlConcepts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3 bg-slate-900/50"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-xl bg-iris-500/10 text-iris-400 border border-iris-500/20">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {item.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">{item.title}</h3>
                      <p className="text-xs font-medium text-iris-300/90 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : activeTab === 'species' ? (
        /* Iris Botanical Species Information Tab */
        <div className="space-y-8">
          {/* Anatomy Banner */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Botanical Morphology & Anatomy</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Anatomy of the Iris Flower
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The genus <span className="italic font-semibold text-iris-400">Iris</span> (family <span className="font-semibold text-slate-200">Iridaceae</span>) displays unique botanical architecture. Unlike typical actinomorphic flowers, Iris blossoms feature two distinct sets of modified floral perianth segments:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Inner Floral Organs</span>
                  <h4 className="text-sm font-bold text-white">Petals (Standards)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The 3 inner petals stand erect or curve upwards. In machine learning, petal length and width provide over <span className="text-indigo-300 font-bold">90%</span> of distinguishing power between species.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-sky-500/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Outer Calyx Segments</span>
                  <h4 className="text-sm font-bold text-white">Sepals (Falls)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The 3 outer sepals droop or spread outward. They feature radiant golden "signal" nectar guides designed to direct pollinating bumblebees toward the reproductive organs.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950/80 p-2">
                <img
                  src="/images/iris_anatomy.svg"
                  alt="Iris Flower Anatomy Diagram"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>
            </div>
          </div>

          {/* Three Species Detailed Showcase */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">The Three Iris Species in Fisher's Dataset</h2>
              <p className="text-xs text-slate-400">
                Detailed botanical profiles, physical measurement ranges, and identification criteria for each class.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Species 1: Setosa */}
              <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 flex flex-col justify-between space-y-5 bg-gradient-to-b from-indigo-950/20 to-slate-950">
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    <img
                      src="/images/setosa.svg"
                      alt="Iris setosa botanical illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Species 01</span>
                    <h3 className="text-xl font-black text-white">Iris setosa</h3>
                    <p className="text-xs text-slate-400">Arctic Iris / Bristle-pointed Iris</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Native to subarctic shores and coastal bogs of Alaska and northeastern Asia. Its definitive hallmark is <span className="text-indigo-300 font-bold">diminutive, bristle-like inner petals</span> (standards) that are drastically smaller than both Versicolor and Virginica.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Typical Physical Dimensions</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Petal Length</span>
                        <span className="font-bold text-indigo-300">1.0 – 1.9 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Petal Width</span>
                        <span className="font-bold text-indigo-300">0.1 – 0.6 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sepal Length</span>
                        <span className="font-bold text-slate-200">4.3 – 5.8 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sepal Width</span>
                        <span className="font-bold text-slate-200">2.3 – 4.4 cm</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-200">
                  <span className="font-bold block text-white mb-0.5">Decision Tree Rule:</span>
                  Isolates instantly at Root Node: <code className="font-mono bg-indigo-950/80 px-1 py-0.5 rounded text-indigo-300">Petal Length &le; 2.45 cm</code> with 100% purity (Gini = 0.0).
                </div>
              </div>

              {/* Species 2: Versicolor */}
              <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col justify-between space-y-5 bg-gradient-to-b from-purple-950/20 to-slate-950">
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    <img
                      src="/images/versicolor.svg"
                      alt="Iris versicolor botanical illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Species 02</span>
                    <h3 className="text-xl font-black text-white">Iris versicolor</h3>
                    <p className="text-xs text-slate-400">Harlequin Blue Flag / Northern Blue Flag</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Native to eastern North American marshes and sedge meadows. Possesses <span className="text-purple-300 font-bold">intermediate-sized petals</span> with complex variegated patterns of rich violet, golden-green throat signals, and reddish-purple vein networks.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Typical Physical Dimensions</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Petal Length</span>
                        <span className="font-bold text-purple-300">3.0 – 5.1 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Petal Width</span>
                        <span className="font-bold text-purple-300">1.0 – 1.8 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sepal Length</span>
                        <span className="font-bold text-slate-200">4.9 – 7.0 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sepal Width</span>
                        <span className="font-bold text-slate-200">2.0 – 3.4 cm</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-[11px] text-purple-200">
                  <span className="font-bold block text-white mb-0.5">Decision Tree Rule:</span>
                  Satisfies <code className="font-mono bg-purple-950/80 px-1 py-0.5 rounded text-purple-300">Petal Length &gt; 2.45 cm</code> and <code className="font-mono bg-purple-950/80 px-1 py-0.5 rounded text-purple-300">Petal Width &le; 1.75 cm</code>.
                </div>
              </div>

              {/* Species 3: Virginica */}
              <div className="glass-panel p-6 rounded-3xl border border-violet-500/30 flex flex-col justify-between space-y-5 bg-gradient-to-b from-violet-950/20 to-slate-950">
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    <img
                      src="/images/virginica.svg"
                      alt="Iris virginica botanical illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Species 03</span>
                    <h3 className="text-xl font-black text-white">Iris virginica</h3>
                    <p className="text-xs text-slate-400">Virginia Iris / Southern Blue Flag</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Native to wetlands and coastal plains across southeastern North America. Exhibits the <span className="text-violet-300 font-bold">largest petals and broadest sepals</span> among all three, featuring elongated arching falls with a bold central golden crest.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Typical Physical Dimensions</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Petal Length</span>
                        <span className="font-bold text-violet-300">4.5 – 6.9 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Petal Width</span>
                        <span className="font-bold text-violet-300">1.4 – 2.5 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sepal Length</span>
                        <span className="font-bold text-slate-200">4.9 – 7.9 cm</span>
                      </div>
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sepal Width</span>
                        <span className="font-bold text-slate-200">2.2 – 3.8 cm</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-[11px] text-violet-200">
                  <span className="font-bold block text-white mb-0.5">Decision Tree Rule:</span>
                  Satisfies <code className="font-mono bg-violet-950/80 px-1 py-0.5 rounded text-violet-300">Petal Length &gt; 2.45 cm</code> and <code className="font-mono bg-violet-950/80 px-1 py-0.5 rounded text-violet-300">Petal Width &gt; 1.75 cm</code>.
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <h2 className="text-xl font-black text-white">Species Comparison & Differences Matrix</h2>
              <p className="text-xs text-slate-400">
                Direct side-by-side comparison of botanical traits, morphology, and Decision Tree boundary conditions.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 font-bold">Characteristic</th>
                    <th className="p-4 font-bold text-indigo-400">Iris setosa</th>
                    <th className="p-4 font-bold text-purple-400">Iris versicolor</th>
                    <th className="p-4 font-bold text-violet-400">Iris virginica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Common Name</td>
                    <td className="p-4 text-slate-300">Arctic / Bristle-pointed Iris</td>
                    <td className="p-4 text-slate-300">Harlequin Blue Flag</td>
                    <td className="p-4 text-slate-300">Virginia Iris / Southern Flag</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Petal Length Range (Mean)</td>
                    <td className="p-4 font-semibold text-indigo-300">1.0 – 1.9 cm (1.46 cm)</td>
                    <td className="p-4 font-semibold text-purple-300">3.0 – 5.1 cm (4.26 cm)</td>
                    <td className="p-4 font-semibold text-violet-300">4.5 – 6.9 cm (5.55 cm)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Petal Width Range (Mean)</td>
                    <td className="p-4 font-semibold text-indigo-300">0.1 – 0.6 cm (0.24 cm)</td>
                    <td className="p-4 font-semibold text-purple-300">1.0 – 1.8 cm (1.33 cm)</td>
                    <td className="p-4 font-semibold text-violet-300">1.4 – 2.5 cm (2.03 cm)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Sepal Length Range (Mean)</td>
                    <td className="p-4 text-slate-300">4.3 – 5.8 cm (5.01 cm)</td>
                    <td className="p-4 text-slate-300">4.9 – 7.0 cm (5.94 cm)</td>
                    <td className="p-4 text-slate-300">4.9 – 7.9 cm (6.59 cm)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Sepal Width Range (Mean)</td>
                    <td className="p-4 text-slate-300">2.3 – 4.4 cm (3.42 cm)</td>
                    <td className="p-4 text-slate-300">2.0 – 3.4 cm (2.77 cm)</td>
                    <td className="p-4 text-slate-300">2.2 – 3.8 cm (2.97 cm)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Key Distinguishing Feature</td>
                    <td className="p-4 text-slate-300">Diminutive inner petals (&lt; 2 cm)</td>
                    <td className="p-4 text-slate-300">Slender petals with green throat</td>
                    <td className="p-4 text-slate-300">Broadest petals (&gt; 1.8 cm)</td>
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-300">Separability in ML</td>
                    <td className="p-4 text-emerald-400 font-bold">Linearly separable (100% accuracy)</td>
                    <td className="p-4 text-amber-300">Slight boundary overlap with Virginica</td>
                    <td className="p-4 text-amber-300">Slight boundary overlap with Versicolor</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => onNavigate('predict')}
                className="px-5 py-2.5 bg-gradient-to-r from-iris-600 to-iris-500 hover:from-iris-500 hover:to-iris-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-iris-600/30 transition flex items-center gap-2"
              >
                <span>Predict Flower Species Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('model_training')}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                <span>View Decision Tree Model Training</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Internship Review Presentation Viewer */
        <PresentationViewer />
      )}
    </div>
  );
};
