import React, { useState } from 'react';
import { TreeNode } from '../types';
import { GitFork, ChevronDown, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DecisionTreeNodeProps {
  node: TreeNode;
  isRoot?: boolean;
}

const TreeNodeItem: React.FC<{ node: TreeNode; isLeft?: boolean; isRoot?: boolean }> = ({ node, isLeft, isRoot }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const isLeaf = node.type === 'leaf';

  const speciesColor = (species?: string) => {
    if (!species) return 'bg-slate-700 text-slate-300 border-slate-600';
    if (species.toLowerCase().includes('setosa')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    }
    if (species.toLowerCase().includes('versicolor')) {
      return 'bg-iris-500/15 text-iris-300 border-iris-500/40';
    }
    return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
  };

  return (
    <div className="relative pl-6 py-1.5 border-l-2 border-slate-800 ml-4 group">
      {/* Node card */}
      <div
        className={`inline-block p-3 rounded-xl border transition-all duration-200 text-xs ${
          isLeaf
            ? speciesColor(node.predicted_class)
            : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:border-iris-500/50'
        }`}
      >
        <div className="flex items-center gap-2">
          {!isLeaf ? (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-slate-800 rounded transition"
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}

          <div>
            {!isLeaf ? (
              <div className="flex items-center gap-2 font-mono font-semibold text-iris-300">
                <GitFork className="w-3.5 h-3.5" />
                <span>{node.rule}</span>
              </div>
            ) : (
              <div className="font-bold text-sm">
                Prediction: <span className="underline">{node.predicted_class}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
              <span>Samples: <strong className="text-slate-200">{node.samples}</strong></span>
              <span>Gini: <strong className="text-slate-200">{node.impurity.toFixed(3)}</strong></span>
              {node.class_counts && (
                <span className="font-mono text-[10px] text-slate-500">
                  [{Object.values(node.class_counts).join(', ')}]
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children branches */}
      {!isLeaf && !collapsed && (
        <div className="mt-2 space-y-1">
          {node.left && (
            <div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-2">
                True (≤)
              </span>
              <TreeNodeItem node={node.left} isLeft={true} />
            </div>
          )}
          {node.right && (
            <div className="mt-2">
              <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 ml-2">
                False (&gt;)
              </span>
              <TreeNodeItem node={node.right} isLeft={false} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const DecisionTreeViewer: React.FC<DecisionTreeNodeProps> = ({ node }) => {
  if (!node) {
    return (
      <div className="p-6 text-center text-slate-500 border border-slate-800 rounded-xl">
        No tree structure available. Train a model to inspect its decision hierarchy.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Hierarchical Decision Tree Flow</h4>
          <p className="text-xs text-slate-400">
            Interactive branching rules from root node (top) to leaf classifications (terminal).
          </p>
        </div>
        <span className="text-[11px] font-mono text-iris-400 bg-iris-500/10 px-2 py-0.5 rounded-full border border-iris-500/20">
          Criterion: Gini Impurity
        </span>
      </div>

      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto max-h-[500px]">
        <TreeNodeItem node={node} isRoot={true} />
      </div>
    </div>
  );
};
