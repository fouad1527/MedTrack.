import React, { useState } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { ActiveRecallItem } from '../types';
import { 
  Brain, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Sparkles, 
  BookOpen, 
  X, 
  CheckSquare, 
  FileText,
  Flame,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const ActiveRecallView: React.FC = () => {
  const { user, activeRecallList, toggleActiveRecallItemReviewed, journeyMetrics } = useMedTrack();
  const t = translations[user.language] || translations['en'];

  const [selectedItem, setSelectedItem] = useState<ActiveRecallItem | null>(null);
  const [activeTab, setActiveTabFilter] = useState<'pending' | 'completed'>('pending');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter lectures whose review date has arrived (scheduledReviewDate <= today AND not reviewed)
  const pendingWeeklyReviews = activeRecallList.filter(
    item => !item.reviewed && item.scheduledReviewDate <= todayStr
  );

  // Future scheduled reviews (not yet due)
  const upcomingReviews = activeRecallList.filter(
    item => !item.reviewed && item.scheduledReviewDate > todayStr
  );

  // Completed reviews
  const completedReviews = activeRecallList.filter(item => item.reviewed);

  const handleMarkReviewed = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    toggleActiveRecallItemReviewed(itemId);
  };

  // Format date helper (e.g. "2026-07-30" -> "Jul 30, 2026")
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-indigo-500" /> Automatic Weekly Review
            </span>
            <span className="text-xs text-zinc-400">• Simple 7-Day Cycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            🧠 Weekly Review Page
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-2xl">
            Lectures automatically schedule for review <strong className="text-zinc-900 dark:text-white">exactly 7 days</strong> after you mark them Studied and Solved. No manual setup required.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400">Waiting For Review</p>
              <p className="text-sm font-extrabold text-zinc-900 dark:text-white font-mono">
                {pendingWeeklyReviews.length} Lecture{pendingWeeklyReviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-zinc-400">Completed Reviews</p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {completedReviews.length} Done
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Simple Workflow Rule Card */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                How Weekly Review Works
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Study → Solve Questions → After 7 Days → Review → Mark as Reviewed
              </p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl text-xs space-y-0.5">
            <p className="text-[11px] font-mono text-zinc-400">Medical Journey Score Weight</p>
            <p className="font-bold text-zinc-900 dark:text-white">
              Studied + Solved (70%) + Weekly Review (30%) = 100%
            </p>
          </div>
        </div>
      </div>

      {/* View Filter Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span>Ready for Review</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
            }`}>
              {pendingWeeklyReviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTabFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span>Completed Reviews</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
            }`}>
              {completedReviews.length}
            </span>
          </button>
        </div>

        {upcomingReviews.length > 0 && (
          <span className="text-xs font-mono text-zinc-500 hidden sm:inline-block">
            {upcomingReviews.length} upcoming review{upcomingReviews.length > 1 ? 's' : ''} scheduled for later
          </span>
        )}
      </div>

      {/* PENDING REVIEWS LIST */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingWeeklyReviews.length === 0 ? (
            <div className="p-10 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                🎉
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                  Great job!
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  You have completed all your weekly reviews.
                </p>
              </div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto pt-2">
                When you study and solve questions for new lectures in the Modules page, they will automatically appear here exactly 7 days later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingWeeklyReviews.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40 rounded-3xl p-6 transition-all shadow-sm flex flex-col justify-between space-y-5 relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {item.moduleName}
                        </span>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-2 leading-snug">
                          {item.lectureName}
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                        Review Due
                      </span>
                    </div>

                    {/* Meta Fields: Date Studied & Days Since Study */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                        <p className="text-[10px] font-mono text-zinc-400 uppercase">Date Originally Studied</p>
                        <p className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{formatDate(item.dateStudied)}</span>
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                        <p className="text-[10px] font-mono text-zinc-400 uppercase">Days Since Last Study</p>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.daysSinceStudy || 7} days ago</span>
                        </p>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                        <span className="font-bold text-zinc-400 text-[10px] block uppercase font-mono mb-0.5">Notes Preview:</span>
                        {item.notes}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>Review Now</span>
                    </button>

                    <button
                      onClick={(e) => handleMarkReviewed(e, item.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>✅ Reviewed</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLETED REVIEWS TAB */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedReviews.length === 0 ? (
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center text-xs text-zinc-400">
              No completed weekly reviews logged yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedReviews.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-3xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {item.moduleName}
                      </span>
                      <h4 className="font-bold text-base text-zinc-900 dark:text-white mt-0.5">
                        {item.lectureName}
                      </h4>
                    </div>

                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-extrabold bg-emerald-600 text-white shadow-sm flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Reviewed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-500/20 text-xs">
                    <div className="bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl">
                      <p className="text-[10px] font-mono text-zinc-400">Originally Studied</p>
                      <p className="font-bold text-zinc-900 dark:text-white font-mono">{formatDate(item.dateStudied)}</p>
                    </div>
                    <div className="bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-xl">
                      <p className="text-[10px] font-mono text-zinc-400">Date Reviewed</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatDate(item.reviewedDate || todayStr)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEW NOW LECTURE DETAILS MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121827] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {selectedItem.lectureName}
                  </h3>
                  <p className="text-xs text-indigo-500 font-mono">{selectedItem.moduleName}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lecture Notes & High Yield Review */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div>
                <p className="text-[10px] font-mono text-indigo-500 uppercase font-bold tracking-wider mb-1">Lecture Overview</p>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {selectedItem.lectureName}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block">Date Studied</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{formatDate(selectedItem.dateStudied)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block">Days Since Last Study</span>
                  <span className="font-bold text-indigo-500">{selectedItem.daysSinceStudy || 7} days ago</span>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                  <p className="text-[10px] font-mono text-zinc-400 uppercase font-bold">High-Yield Notes:</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                    {selectedItem.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-mono text-zinc-400">
                Scheduled 7 days after completion
              </span>

              <button
                onClick={(e) => {
                  handleMarkReviewed(e, selectedItem.id);
                  setSelectedItem(null);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✅ Mark as Reviewed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
