import React, { useState, useEffect } from 'react';
import { SlideData } from '../types';
import { api } from '../api/client';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Search,
  BookOpen,
  Award,
  Layers
} from 'lucide-react';

export const PresentationViewer: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const resp = await api.presentation.getSlides();
        setSlides(resp.slides);
      } catch (err) {
        console.error('Failed to load slides:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const filteredSlides = searchQuery
    ? slides.filter(
        s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : slides;

  const currentSlide = slides[currentIdx] || slides[0];

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (currentIdx < slides.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 glass-panel rounded-2xl">
        <div className="animate-spin w-8 h-8 border-2 border-iris-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p>Loading internship slide deck...</p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto'
          : ''
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-4 rounded-2xl border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-iris-500/20 text-iris-300 border border-iris-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Internship PowerPoint Presentation</h3>
            <p className="text-xs text-slate-400">
              Pooja V (24691A31H0) • Edu Tantr, Bangalore • Machine Learning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search slides..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-900/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-iris-500 w-44"
            />
          </div>

          {/* Download Original PPTX */}
          <a
            href={api.presentation.downloadPPTXUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-iris-400" />
            <span>Download .PPTX</span>
          </a>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      {currentSlide && (
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-iris-500/20 relative min-h-[460px] flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950">
          {/* Top metadata tags */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-iris-400 bg-iris-500/10 px-3 py-1 rounded-full border border-iris-500/20">
                {currentSlide.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Slide {currentSlide.slide_number} of {slides.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Edu Tantr ML Review</span>
            </div>
          </div>

          {/* Slide Body */}
          <div className="my-8 max-w-4xl space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {currentSlide.title}
              </h2>
              {currentSlide.subtitle && (
                <p className="text-sm font-medium text-iris-300 mt-1">
                  {currentSlide.subtitle}
                </p>
              )}
            </div>

            {/* Bullet points */}
            <div className="space-y-3.5">
              {currentSlide.content.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-iris-400 mt-2 shrink-0 shadow-sm shadow-iris-500" />
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* Slide speaker notes */}
            {currentSlide.notes && (
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                <span className="font-semibold text-iris-400 uppercase tracking-wider block mb-1">
                  Presenter Notes
                </span>
                {currentSlide.notes}
              </div>
            )}
          </div>

          {/* Slide Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Progress indicators */}
            <div className="flex items-center gap-1 overflow-x-auto px-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === currentIdx
                      ? 'w-6 bg-iris-400 shadow-sm shadow-iris-400'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIdx === slides.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-iris-600 hover:bg-iris-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-xl text-xs font-semibold shadow-md shadow-iris-600/30 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Thumbnails strip */}
      <div className="glass-panel p-4 rounded-2xl border overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max">
          <div className="flex items-center gap-1 text-xs text-slate-400 pr-2 border-r border-slate-800">
            <Layers className="w-3.5 h-3.5" />
            <span>Thumbnails</span>
          </div>
          {filteredSlides.map((s, idx) => {
            const originalIdx = slides.findIndex(orig => orig.slide_number === s.slide_number);
            const isActive = originalIdx === currentIdx;
            return (
              <button
                key={s.slide_number}
                onClick={() => setCurrentIdx(originalIdx)}
                className={`w-36 h-20 p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ${
                  isActive
                    ? 'border-iris-500 bg-iris-500/15 shadow-md shadow-iris-500/20 scale-105'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-slate-400">#{s.slide_number}</span>
                  <span className="text-[9px] text-iris-400 truncate max-w-[80px]">
                    {s.category}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-200 truncate w-full">
                  {s.title}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
