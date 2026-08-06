import React, { useState, useEffect } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { AcademicResult } from '../types';
import { 
  Plus, 
  Trash2, 
  X, 
  BarChart2, 
  CheckCircle2, 
  Filter,
  GraduationCap
} from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { user, academicResults, addAcademicResult, deleteAcademicResult } = useMedTrack();
  const t = translations[user.language] || translations['en'];

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('All');
  const [animateBars, setAnimateBars] = useState(false);

  // Form State
  const [moduleName, setModuleName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [customYearInput, setCustomYearInput] = useState('');
  const [percentage, setPercentage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Trigger progress bar fill animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateBars(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Helper to get fill color according to strict percentage brackets:
  // 60% – 74.99%: Yellow
  // 75% – 84.99%: Blue
  // 85% – 100%: Green
  // < 60%: Rose
  const getProgressBarColor = (pct: number) => {
    if (pct >= 85) {
      return {
        fill: 'bg-emerald-500',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        label: 'Exceptional',
      };
    } else if (pct >= 75) {
      return {
        fill: 'bg-blue-500',
        badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        label: 'Solid',
      };
    } else if (pct >= 60) {
      return {
        fill: 'bg-amber-500',
        badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        label: 'Pass',
      };
    } else {
      return {
        fill: 'bg-rose-500',
        badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        label: 'Needs Review',
      };
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalYear = customYearInput.trim() || academicYear;
    const parsedPct = parseFloat(percentage);

    if (!moduleName.trim() || isNaN(parsedPct)) return;

    setSubmitting(true);
    await addAcademicResult({
      moduleName: moduleName.trim(),
      academicYear: finalYear,
      percentage: Math.min(100, Math.max(0, parsedPct)),
    });
    setSubmitting(false);

    // Reset Form
    setModuleName('');
    setPercentage('');
    setCustomYearInput('');
    setShowAddModal(false);
  };

  // Get unique academic years for filtering
  const uniqueYears = Array.from(
    new Set(academicResults.map((r) => r.academicYear))
  ).filter(Boolean);

  // Helper to extract year numeric prefix for sorting newest -> oldest
  const parseYearForSorting = (yearStr: string) => {
    const match = yearStr.match(/\d{4}/);
    if (match) return parseInt(match[0], 10);
    const digitMatch = yearStr.match(/\d+/);
    if (digitMatch) return parseInt(digitMatch[0], 10) + 2020;
    return 0;
  };

  // Sorted results (Newest academic year to oldest)
  const sortedResults = [...academicResults].sort((a, b) => {
    const yearA = parseYearForSorting(a.academicYear);
    const yearB = parseYearForSorting(b.academicYear);
    if (yearB !== yearA) return yearB - yearA;
    return new Date(b.dateLogged || 0).getTime() - new Date(a.dateLogged || 0).getTime();
  });

  // Filtered results
  const filteredResults = selectedYearFilter === 'All'
    ? sortedResults
    : sortedResults.filter((r) => r.academicYear === selectedYearFilter);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Academic Records
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Academic Performance
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Store previous module results and visualize score distribution cleanly.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Result</span>
        </button>
      </div>

      {/* Filter Bar & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Academic Year Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono text-zinc-400 shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Year:
          </span>
          <button
            onClick={() => setSelectedYearFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedYearFilter === 'All'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Years ({academicResults.length})
          </button>
          {uniqueYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYearFilter(yr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedYearFilter === yr
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 pt-2 sm:pt-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>85% – 100%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>75% – 84.99%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>60% – 74.99%</span>
          </span>
        </div>
      </div>

      {/* RESULT CARDS GRID */}
      {filteredResults.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mx-auto text-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-white">No results found</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {selectedYearFilter !== 'All' 
              ? `No module results logged for ${selectedYearFilter}.` 
              : 'Add your first academic module result to track performance over time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((res) => {
            const style = getProgressBarColor(res.percentage);
            const clampedPct = Math.min(100, Math.max(0, res.percentage));

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-5 relative group flex flex-col justify-between"
              >
                {/* Card Top Header */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                        {res.moduleName}
                      </h3>
                      <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1">
                        {res.academicYear}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteAcademicResult(res.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Delete Result"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Score & Progress Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white font-mono tracking-tight">
                      {res.percentage.toFixed(2)}%
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${style.badgeBg}`}>
                      {style.label}
                    </span>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${style.fill}`}
                      style={{
                        width: animateBars ? `${clampedPct}%` : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD RESULT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121827] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Add Academic Result
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResult} className="space-y-4">
              {/* Academic Year Field */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Academic Year
                </label>
                <div className="mt-1 space-y-2">
                  <select
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value);
                      if (e.target.value !== 'custom') {
                        setCustomYearInput('');
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                    <option value="custom">Custom Academic Year...</option>
                  </select>

                  {academicYear === 'custom' && (
                    <input
                      type="text"
                      required
                      value={customYearInput}
                      onChange={(e) => setCustomYearInput(e.target.value)}
                      placeholder="e.g. 2022-2023 or Year 5"
                      className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>

              {/* Module Name Field */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Module Name
                </label>
                <input
                  type="text"
                  required
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  placeholder="e.g. Cardiology Block Exam"
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Final Percentage Field (supports decimals e.g. 87.53) */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 flex justify-between">
                  <span>Final Percentage (%)</span>
                  <span className="text-[10px] text-zinc-400 font-normal">Supports decimals e.g. 87.53%</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="e.g. 87.53"
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Result</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
