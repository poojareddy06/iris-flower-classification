import React, { useState, useEffect, useRef } from 'react';
import { Dataset } from '../types';
import { api } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Play,
  Search,
  Database,
  RefreshCw
} from 'lucide-react';

interface DatasetManagerProps {
  onNavigate: (page: string) => void;
}

export const DatasetManagerPage: React.FC<DatasetManagerProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDatasets = async () => {
    try {
      setIsLoading(true);
      const list = await api.datasets.getAll();
      setDatasets(list);
      if (list.length > 0) {
        const detailed = await api.datasets.getById(list[0].id, 50);
        setSelectedDataset(detailed);
      }
    } catch (err: any) {
      console.error('Failed to load datasets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleSelectDataset = async (ds: Dataset) => {
    try {
      const detailed = await api.datasets.getById(ds.id, 50);
      setSelectedDataset(detailed);
    } catch (err) {
      console.error('Failed to fetch dataset details:', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Only CSV files are supported.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const uploaded = await api.datasets.upload(file);
      const detailed = await api.datasets.getById(uploaded.id, 50);
      setDatasets(prev => [uploaded, ...prev]);
      setSelectedDataset(detailed);
    } catch (err: any) {
      setUploadError(err.message || 'Dataset upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await api.datasets.delete(id);
      setDatasets(prev => prev.filter(d => d.id !== id));
      if (selectedDataset?.id === id) {
        const remaining = datasets.filter(d => d.id !== id);
        if (remaining.length > 0) {
          handleSelectDataset(remaining[0]);
        } else {
          setSelectedDataset(null);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete dataset.');
    }
  };

  const filteredRows = selectedDataset?.rows_preview
    ? selectedDataset.rows_preview.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(tableSearch.toLowerCase())
        )
      )
    : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">{t('dataset_manager_title')}</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t('dataset_manager_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-iris-600 hover:bg-iris-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition"
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{isUploading ? t('btn_uploading_csv') : t('upload_csv_title')}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <p>{uploadError}</p>
        </div>
      )}

      {/* Upload Drag & Drop Dropzone */}
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
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 ${
          isDragging
            ? 'border-iris-400 bg-iris-500/10'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500'
        }`}
      >
        <div className="p-4 rounded-2xl bg-iris-500/10 text-iris-400 border border-iris-500/20">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{t('drag_drop_csv')}</h3>
          <p className="text-xs text-slate-400 mt-1">
            Supports standard Iris columns (Sepal Length, Sepal Width, Petal Length, Petal Width, Species).
          </p>
        </div>
      </div>

      {/* Main Grid: Dataset List + Selected Dataset Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dataset List */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider px-1">
            {t('available_datasets')} ({datasets.length})
          </h3>
          <div className="space-y-2">
            {datasets.map(ds => {
              const isSelected = selectedDataset?.id === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => handleSelectDataset(ds)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-iris-500/15 border-iris-500/50 shadow-md shadow-iris-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[170px]">
                      {ds.filename}
                    </span>
                    {ds.is_default && (
                      <span className="text-[9px] font-bold text-iris-400 bg-iris-500/10 px-2 py-0.5 rounded-full border border-iris-500/20">
                        Benchmark
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>{ds.row_count} rows • {ds.col_count} cols</span>
                    <span
                      className={`font-semibold ${
                        ds.is_valid ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ds.is_valid ? `✓ ${t('dataset_valid')}` : `✗ ${t('dataset_invalid')}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Dataset Deep-Dive */}
        {selectedDataset ? (
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{selectedDataset.filename}</h2>
                  {selectedDataset.is_valid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('dataset_valid')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" /> {t('dataset_invalid')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {t('col_timestamp')}: {new Date(selectedDataset.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={api.datasets.downloadUrl(selectedDataset.id)}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('btn_download_csv')}</span>
                </a>

                {selectedDataset.is_valid && (
                  <button
                    onClick={() => onNavigate('model_training')}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-iris-600 hover:bg-iris-500 text-white rounded-xl text-xs font-bold shadow-md shadow-iris-600/30 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{t('btn_train_with_this')}</span>
                  </button>
                )}

                {!selectedDataset.is_default && (
                  <button
                    onClick={() => handleDelete(selectedDataset.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition"
                    title={t('btn_delete_dataset')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Validation Explanation Box */}
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                selectedDataset.is_valid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-200'
              }`}
            >
              {selectedDataset.is_valid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block mb-0.5">
                  {selectedDataset.is_valid ? t('dataset_valid') : t('dataset_invalid')}
                </span>
                <p className="leading-relaxed">{selectedDataset.validation_message}</p>
              </div>
            </div>

            {/* Metadata Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t('metric_rows')}
                </span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {selectedDataset.row_count}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t('metric_cols')}
                </span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {selectedDataset.col_count}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t('metric_duplicates')}
                </span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {selectedDataset.duplicate_rows}
                </p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t('metric_nulls')}
                </span>
                <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {Object.values(selectedDataset.missing_values || {}).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>

            {/* Columns Inspection & Types */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('dataset_diagnostics')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {selectedDataset.columns_info?.map((col, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">{col.name}</span>
                      <span className="text-[10px] font-mono text-iris-400">{col.type}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">
                      {t('metric_nulls')}: {col.null_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table Preview with Search */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('preview_rows_title')}
                </h4>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('search_table_placeholder')}
                    value={tableSearch}
                    onChange={e => setTableSearch(e.target.value)}
                    className="bg-slate-900/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-iris-500 w-48"
                  />
                </div>
              </div>

              {filteredRows.length > 0 ? (
                <div className="overflow-x-auto max-h-[360px] rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="sticky top-0 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        {Object.keys(filteredRows[0]).map(key => (
                          <th key={key} className="py-2.5 px-4 font-semibold whitespace-nowrap">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/60 font-mono">
                      {filteredRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40 transition">
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} className="py-2 px-4 whitespace-nowrap">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 border border-slate-800 rounded-2xl">
                  No records found.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
