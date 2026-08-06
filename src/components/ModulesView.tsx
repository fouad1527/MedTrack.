import React, { useState } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { Module, Lecture } from '../types';
import { 
  Plus, 
  CheckSquare, 
  Square, 
  FileText, 
  Trash2, 
  Brain, 
  Sparkles, 
  X, 
  Heart, 
  Activity, 
  Droplet, 
  Wind, 
  Layers,
  BookOpen,
  CheckCircle2,
  Clock,
  BarChart3,
  Search,
  Filter,
  Check
} from 'lucide-react';

export const ModulesView: React.FC = () => {
  const { 
    user, 
    modules, 
    lectures, 
    addModule, 
    deleteModule, 
    addLecture, 
    toggleLectureStudied, 
    toggleLectureSolved, 
    deleteLecture 
  } = useMedTrack();

  const t = translations[user.language] || translations['en'];

  const [selectedModuleId, setSelectedModuleId] = useState<string>(modules[0]?.id || 'mod-cardio');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddLectureModal, setShowAddLectureModal] = useState(false);
  const [activeNotesLecture, setActiveNotesLecture] = useState<Lecture | null>(null);

  // New Module Form State (includes Module Name & Total Number of Lectures)
  const [newModName, setNewModName] = useState('');
  const [newTotalLectures, setNewTotalLectures] = useState<number | ''>(42);
  const [newModColor, setNewModColor] = useState('#6366F1');
  const [newModDesc, setNewModDesc] = useState('');
  const [newModStatus, setNewModStatus] = useState<'ACTIVE' | 'OPEN' | 'UPCOMING'>('ACTIVE');

  // New Lecture Form State
  const [newLecName, setNewLecName] = useState('');
  const [newLecDifficulty, setNewLecDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'High-Yield'>('High-Yield');
  const [newLecNotes, setNewLecNotes] = useState('');
  const [newLecStudied, setNewLecStudied] = useState(false);
  const [newLecSolved, setNewLecSolved] = useState(false);

  // Search / Filter inside active module
  const [lectureSearch, setLectureSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  const selectedModule = modules.find(m => m.id === selectedModuleId) || modules[0];
  const moduleLectures = lectures.filter(l => l.moduleId === selectedModuleId);

  // Filtered lectures list
  const filteredLectures = moduleLectures.filter(lec => {
    const matchesSearch = lec.name.toLowerCase().includes(lectureSearch.toLowerCase()) || 
                          (lec.notes && lec.notes.toLowerCase().includes(lectureSearch.toLowerCase()));
    const matchesDiff = difficultyFilter === 'ALL' || lec.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  // Calculate live module statistics
  const currentTotal = selectedModule ? (selectedModule.totalLectures || 1) : 1;
  const currentCompleted = selectedModule ? (selectedModule.completedLectures || 0) : 0;
  const completionPercentage = Math.min(100, Math.round((currentCompleted / currentTotal) * 100));
  const remainingLectures = Math.max(0, currentTotal - currentCompleted);

  // Handle Module Creation
  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName.trim()) return;

    const totalLecsNum = typeof newTotalLectures === 'number' && newTotalLectures > 0 ? newTotalLectures : 30;

    addModule({
      name: newModName.trim(),
      icon: 'layers',
      totalLectures: totalLecsNum,
      status: newModStatus,
      color: newModColor,
      description: newModDesc.trim() || 'Medical Curriculum Block',
      estimatedCompletionDate: 'TBD',
    });

    setNewModName('');
    setNewTotalLectures(42);
    setNewModDesc('');
    setShowAddModuleModal(false);
  };

  // Handle Lecture Creation for specific module
  const handleCreateLecture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecName.trim() || !selectedModuleId) return;

    addLecture({
      moduleId: selectedModuleId,
      name: newLecName.trim(),
      studied: newLecStudied,
      solved: newLecSolved,
      studyDate: new Date().toISOString().split('T')[0],
      notes: newLecNotes.trim(),
      difficulty: newLecDifficulty,
    });

    setNewLecName('');
    setNewLecNotes('');
    setNewLecStudied(false);
    setNewLecSolved(false);
    setShowAddLectureModal(false);
  };

  const renderModuleIcon = (icon: string) => {
    switch (icon) {
      case 'favorite': return <Heart className="w-5 h-5 text-red-500" />;
      case 'psychology': return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'water_drop': return <Droplet className="w-5 h-5 text-rose-500" />;
      case 'air': return <Wind className="w-5 h-5 text-sky-500" />;
      case 'water': return <Activity className="w-5 h-5 text-emerald-500" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Syllabus Manager
            </span>
            <span className="text-xs text-zinc-400">• Linear & Notion Style</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
            Medical Modules & Lectures
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set total lecture targets per module. Studied lectures dynamically update your progress and Medical Journey Score.
          </p>
        </div>

        <button
          onClick={() => setShowAddModuleModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all hover:shadow-indigo-500/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Module</span>
        </button>
      </div>

      {/* MODULE CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {modules.map((m) => {
          const isSelected = selectedModule && m.id === selectedModule.id;
          const totalLecs = m.totalLectures || 1;
          const completedLecs = m.completedLectures || 0;
          const pct = Math.min(100, Math.round((completedLecs / totalLecs) * 100));
          const rem = Math.max(0, totalLecs - completedLecs);

          return (
            <div
              key={m.id}
              onClick={() => setSelectedModuleId(m.id)}
              className={`
                p-5 rounded-3xl cursor-pointer transition-all duration-200 border relative group flex flex-col justify-between shadow-sm
                ${isSelected 
                  ? 'bg-white dark:bg-[#121214] border-indigo-500 ring-2 ring-indigo-500/30' 
                  : 'bg-white dark:bg-[#121214]/60 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50">
                  {renderModuleIcon(m.icon)}
                </div>
                <span className={`
                  text-[10px] font-mono px-2 py-0.5 rounded-full font-bold
                  ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : ''}
                  ${m.status === 'OPEN' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' : ''}
                  ${m.status === 'COMPLETED' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' : ''}
                  ${m.status === 'UPCOMING' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500' : ''}
                `}>
                  {m.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{m.name}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                  {m.description || 'Medical curriculum module'}
                </p>
              </div>

              {/* Module Progress Section */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    Completed Lectures: <strong className="text-zinc-900 dark:text-white">{completedLecs} / {totalLecs}</strong>
                  </span>
                  <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800/90 rounded-full overflow-hidden p-0.5 border border-zinc-200/40 dark:border-zinc-700/40">
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${pct}%`, backgroundColor: m.color || '#6366F1' }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>{rem} remaining</span>
                  <span>{pct === 100 ? '🎉 Module Finished!' : `${pct}% completed`}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED MODULE DETAILED DASHBOARD */}
      {selectedModule && (
        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          
          {/* HERO PROGRESS BANNER */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-50 via-zinc-100/50 to-indigo-50/30 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-indigo-950/20 border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                  {renderModuleIcon(selectedModule.icon)}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                    {selectedModule.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {selectedModule.description || 'Medical curriculum module'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddLectureModal(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Lecture</span>
                </button>

                <button
                  onClick={() => deleteModule(selectedModule.id)}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete Module"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Comprehensive Progress Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Card 1: Completed Lectures */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>Completed Lectures</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                  {currentCompleted} <span className="text-sm font-normal text-zinc-400">/ {currentTotal}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Mark "Studied" to count towards completion
                </p>
              </div>

              {/* Card 2: Completion Percentage */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>Progress Rate</span>
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {completionPercentage}%
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {completionPercentage === 100 ? 'Module 100% Mastered!' : `${100 - completionPercentage}% remaining to goal`}
                </p>
              </div>

              {/* Card 3: Remaining Lectures */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>Remaining Lectures</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {remainingLectures}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Lectures left to finish this module
                </p>
              </div>
            </div>

            {/* Main Animated Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                <span>Overall Module Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400">{currentCompleted} / {currentTotal} ({completionPercentage}%)</span>
              </div>
              <div className="w-full h-3.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-300/50 dark:border-zinc-700">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-600 to-emerald-500 shadow-md"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* LECTURES SECTION HEADER WITH SEARCH & FILTERS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Module Lectures</span>
                  <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full text-zinc-700 dark:text-zinc-300">
                    {moduleLectures.length} Created
                  </span>
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Check <strong className="text-zinc-900 dark:text-white">Studied</strong> to update progress counter instantly. Check <strong className="text-zinc-900 dark:text-white">Solved</strong> for practice questions.
                </p>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={lectureSearch}
                    onChange={(e) => setLectureSearch(e.target.value)}
                    placeholder="Search lectures..."
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                >
                  <option value="ALL">All Yields</option>
                  <option value="High-Yield">High-Yield</option>
                  <option value="Hard">Hard</option>
                  <option value="Medium">Medium</option>
                  <option value="Easy">Easy</option>
                </select>
              </div>
            </div>

            {/* LECTURE ITEMS LIST */}
            <div className="space-y-3">
              {filteredLectures.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 mx-auto text-zinc-400/60" />
                  <p className="font-semibold">No lectures found in {selectedModule.name}</p>
                  <p className="text-[11px] text-zinc-500">Click "Add Lecture" to add lectures to this module syllabus.</p>
                </div>
              ) : (
                filteredLectures.map((lec) => {
                  const isBothChecked = lec.studied && lec.solved;

                  return (
                    <div
                      key={lec.id}
                      className={`
                        p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                        ${isBothChecked 
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30' 
                          : lec.studied 
                            ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/30' 
                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800'
                        }
                      `}
                    >
                      {/* Left: Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          <span className={`
                            text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border
                            ${lec.difficulty === 'High-Yield' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : ''}
                            ${lec.difficulty === 'Hard' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : ''}
                            ${lec.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : ''}
                            ${lec.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : ''}
                          `}>
                            {lec.difficulty}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-bold text-sm ${lec.studied ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                              {lec.name}
                            </p>
                            {lec.studied && (
                              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Studied (+1 Progress)
                              </span>
                            )}
                            {isBothChecked && (
                              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                                <Brain className="w-3 h-3" /> Active Recall Triggered
                              </span>
                            )}
                          </div>

                          {lec.notes && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 italic">
                              "{lec.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-200/80 dark:border-zinc-800 shrink-0">
                        {/* Checkbox 1: Studied */}
                        <button
                          type="button"
                          onClick={() => toggleLectureStudied(lec.id)}
                          className={`
                            flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border
                            ${lec.studied 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }
                          `}
                        >
                          {lec.studied ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4 text-zinc-400" />}
                          <span>Studied</span>
                        </button>

                        {/* Checkbox 2: Solved */}
                        <button
                          type="button"
                          onClick={() => toggleLectureSolved(lec.id)}
                          className={`
                            flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border
                            ${lec.solved 
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }
                          `}
                        >
                          {lec.solved ? <CheckSquare className="w-4 h-4 text-white" /> : <Square className="w-4 h-4 text-zinc-400" />}
                          <span>Solved</span>
                        </button>

                        {/* Edit Notes */}
                        <button
                          onClick={() => setActiveNotesLecture(lec)}
                          className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                          title="Lecture Notes"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteLecture(lec.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 rounded-xl hover:bg-red-500/10 cursor-pointer"
                          title="Delete Lecture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW MODULE MODAL */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121827] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Create New Module</h3>
              </div>
              <button 
                onClick={() => setShowAddModuleModal(false)} 
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="space-y-4">
              {/* Module Name */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Module Name *
                </label>
                <input
                  type="text"
                  required
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  placeholder="e.g. Physiology"
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Total Number of Lectures */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    Total Number of Lectures *
                  </label>
                  <span className="text-[10px] font-mono text-indigo-500">Target Syllabus Size</span>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max="300"
                  value={newTotalLectures}
                  onChange={(e) => setNewTotalLectures(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="e.g. 42"
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono font-bold"
                />
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  Example: Enter <strong className="text-zinc-900 dark:text-white">42</strong> for 42 lectures total. Progress will start at <span className="font-mono font-bold">0 / 42</span>.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Description / Topic Overview
                </label>
                <textarea
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                  placeholder="e.g. Nerve impulse conduction, muscle contraction, cardiac action potentials..."
                  rows={2}
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              {/* Module Status */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Initial Status
                </label>
                <select
                  value={newModStatus}
                  onChange={(e: any) => setNewModStatus(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Current Focus)</option>
                  <option value="OPEN">OPEN (In Progress)</option>
                  <option value="UPCOMING">UPCOMING (Future Term)</option>
                </select>
              </div>

              {/* Accent Color */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Module Color Code
                </label>
                <div className="flex gap-2.5 mt-2">
                  {['#6366F1', '#10B981', '#EF4444', '#0EA5E9', '#F59E0B', '#8B5CF6'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewModColor(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${newModColor === col ? 'border-zinc-900 dark:border-white scale-110 shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LECTURE MODAL */}
      {showAddLectureModal && selectedModule && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121827] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Add Lecture</h3>
                <p className="text-xs text-indigo-500 font-mono">Module: {selectedModule.name}</p>
              </div>
              <button 
                onClick={() => setShowAddLectureModal(false)} 
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLecture} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Lecture Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLecName}
                  onChange={(e) => setNewLecName(e.target.value)}
                  placeholder="e.g. Action Potential & Synaptic Transmission"
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Yield Category
                </label>
                <select
                  value={newLecDifficulty}
                  onChange={(e: any) => setNewLecDifficulty(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none font-mono"
                >
                  <option value="High-Yield">🔥 High-Yield (Exam Core)</option>
                  <option value="Hard">Hard</option>
                  <option value="Medium">Medium</option>
                  <option value="Easy">Easy</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${newLecStudied ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  <input
                    type="checkbox"
                    checked={newLecStudied}
                    onChange={(e) => setNewLecStudied(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-xs">Studied</span>
                </label>

                <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer ${newLecSolved ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                  <input
                    type="checkbox"
                    checked={newLecSolved}
                    onChange={(e) => setNewLecSolved(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-xs">Solved</span>
                </label>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  Optional Notes
                </label>
                <textarea
                  value={newLecNotes}
                  onChange={(e) => setNewLecNotes(e.target.value)}
                  placeholder="Key concepts, diagrams, mnemonics..."
                  rows={2}
                  className="w-full mt-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddLectureModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Add Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LECTURE NOTES VIEW MODAL */}
      {activeNotesLecture && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121827] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-zinc-200 dark:border-zinc-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate">
                {activeNotesLecture.name} Notes
              </h3>
              <button 
                onClick={() => setActiveNotesLecture(null)} 
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto border border-zinc-200/80 dark:border-zinc-800">
              {activeNotesLecture.notes || 'No notes added yet for this lecture.'}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveNotesLecture(null)}
                className="px-5 py-2 bg-zinc-900 text-white dark:bg-zinc-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
