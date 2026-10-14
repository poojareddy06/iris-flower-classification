import React, { useState } from 'react';

interface ConfusionMatrixProps {
  matrix: number[][];
  labels: string[];
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ matrix, labels }) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
    val: number;
  } | null>(null);

  if (!matrix || matrix.length === 0 || !labels || labels.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border border-slate-800 rounded-xl">
        No confusion matrix data available for this model.
      </div>
    );
  }

  // Calculate totals
  const totalSamples = matrix.reduce((acc, row) => acc + row.reduce((a, b) => a + b, 0), 0);
  const correctSamples = matrix.reduce((acc, row, i) => acc + (row[i] || 0), 0);
  const calculatedAccuracy = totalSamples > 0 ? (correctSamples / totalSamples) * 100 : 0;

  // Max value for cell opacity
  const maxVal = Math.max(...matrix.flatMap(r => r), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Confusion Matrix Heatmap</h4>
          <p className="text-xs text-slate-400">Actual (rows) vs. Predicted (columns)</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {correctSamples} / {totalSamples} Correct ({calculatedAccuracy.toFixed(1)}%)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* Header row: predicted labels */}
          <div className="flex items-center pl-32 pb-2">
            <div className="w-full text-center text-xs font-semibold text-iris-300 uppercase tracking-wider mb-1">
              Predicted Class →
            </div>
          </div>
          <div className="flex items-center pl-32 pb-2 gap-2">
            {labels.map((lbl, idx) => (
              <div
                key={idx}
                className="w-24 text-center text-xs font-medium text-slate-300 truncate px-1"
                title={lbl}
              >
                {lbl.replace('Iris-', '')}
              </div>
            ))}
          </div>

          {/* Rows: actual labels */}
          <div className="space-y-2">
            {matrix.map((row, rowIdx) => {
              const actualLabel = labels[rowIdx] || `Class ${rowIdx}`;
              return (
                <div key={rowIdx} className="flex items-center gap-2">
                  <div
                    className="w-32 text-right pr-3 text-xs font-medium text-slate-300 truncate"
                    title={`Actual: ${actualLabel}`}
                  >
                    <span className="text-[10px] text-slate-500 block uppercase">Actual</span>
                    {actualLabel.replace('Iris-', '')}
                  </div>

                  {row.map((val, colIdx) => {
                    const isDiagonal = rowIdx === colIdx;
                    const opacity = Math.max(0.15, val / maxVal);
                    const isHovered =
                      hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;

                    let bgStyle = '';
                    if (isDiagonal) {
                      bgStyle = `rgba(34, 197, 94, ${opacity})`;
                    } else if (val > 0) {
                      bgStyle = `rgba(239, 68, 68, ${Math.min(0.8, opacity + 0.3)})`;
                    } else {
                      bgStyle = 'rgba(30, 41, 59, 0.4)';
                    }

                    return (
                      <div
                        key={colIdx}
                        onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx, val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{ backgroundColor: bgStyle }}
                        className={`w-24 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer border ${
                          isHovered
                            ? 'border-white shadow-lg scale-105 z-10'
                            : isDiagonal
                            ? 'border-emerald-500/30'
                            : val > 0
                            ? 'border-rose-500/40'
                            : 'border-slate-800'
                        }`}
                      >
                        <span className="text-lg font-bold text-white tracking-tight">
                          {val}
                        </span>
                        <span className="text-[10px] text-slate-300 font-medium">
                          {totalSamples > 0 ? `${((val / totalSamples) * 100).toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover tooltip explanation banner */}
      <div className="min-h-[42px] px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-300">
        {hoveredCell ? (
          <div>
            <span className="font-semibold text-white">Cell Inspection: </span>
            Actual <span className="text-iris-400 font-semibold">{labels[hoveredCell.row]}</span> was predicted as{' '}
            <span className="text-iris-400 font-semibold">{labels[hoveredCell.col]}</span> in{' '}
            <span className="text-white font-bold">{hoveredCell.val}</span> test specimen(s).
            {hoveredCell.row === hoveredCell.col ? (
              <span className="text-emerald-400 ml-2 font-medium">✓ True Positive</span>
            ) : hoveredCell.val > 0 ? (
              <span className="text-rose-400 ml-2 font-medium">✗ Misclassification</span>
            ) : null}
          </div>
        ) : (
          <span className="text-slate-500 italic">
            Hover over any matrix cell above to view detailed prediction distribution counts.
          </span>
        )}
      </div>
    </div>
  );
};
