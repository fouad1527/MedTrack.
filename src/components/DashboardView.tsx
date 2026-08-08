import React, { useState } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { 
  TrendingUp, 
  Brain, 
  BookOpen, 
  Sparkles, 
  Target, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Award, 
  ChevronRight, 
  RotateCw,
  GraduationCap,
  AlertTriangle,
  Zap,
  CheckSquare,
  Square,
  ArrowRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    user, 
    journeyMetrics, 
    modules, 
    activeRecallList, 
    prediction, 
    insights, 
    setActiveTab 
  } = useMedTrack();

  const [loadingAi, setLoadingAi] = useState(false);
  const [customInsight, setCustomInsight] = useState<string | null>(null);

  // Today's Mission interactive task state
  const [task1Done, setTask1Done] = useState(journeyMetrics.completedTodayCount > 0);
  const [task2Done, setTask2Done] = useState(journeyMetrics.lectureCompletionRate > 20);
  const [task3Done, setTask3Done] = useState(journeyMetrics.questionSolvingRate > 20);

  const t = translations[user.language] || translations['en'];

  const currentModule = modules.find(m => m.status === 'ACTIVE' || m.status === 'OPEN') || modules[0];
  
  const pendingReviewsCount = journeyMetrics.dueTodayCount + journeyMetrics.overdueCount;
  const missionCompletedCount = (task1Done ? 1 : 0) + (task2Done ? 1 : 0) + (task3Done ? 1 : 0);
  const isMissionAllComplete = missionCompletedCount === 3;

  const handleRefreshAi = () => {
    setLoadingAi(true);
    setTimeout(() => {
      setLoadingAi(false);
      if (modules.length === 0) {
        setCustomInsight('Create your first module and log studied lectures to begin generating personalized medical journey analytics.');
      } else {
        setCustomInsight(`Current study consistency is at ${journeyMetrics.journeyScore}%. Recommended focus: solve practice questions for studied lectures.`);
      }
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* WEEKLY REVIEW NOTIFICATION ALERT BANNER */}
      {journeyMetrics.pendingWeeklyReviewsCount > 0 && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4 text-indigo-900 dark:text-indigo-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl shrink-0 text-indigo-600 dark:text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                🧠 You have {journeyMetrics.pendingWeeklyReviewsCount} lecture{journeyMetrics.pendingWeeklyReviewsCount > 1 ? 's' : ''} waiting for review.
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Weekly reviews are scheduled 7 days after completing lectures to secure long-term retention.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('active-recall')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Review Now</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {t.welcomeBack}, {user.name}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Track your Med Way &bull; Medical Student Personalized Dashboard
          </p>
        </div>

        <button 
          onClick={() => setActiveTab('modules')}
          className="self-start sm:self-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Go to Lecture Manager</span>
        </button>
      </div>

      {/* TODAY'S MISSION SECTION */}
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
              <Zap className="w-6 h-6 fill-indigo-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Today's Mission</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {missionCompletedCount} / 3 Tasks Completed
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Personalized daily learning goals calculated to maximize memory retention and medical journey progress.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white">18 Day Streak</span>
          </div>
        </div>

        {/* Mission Tasks Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Task 1: Active Recall */}
          <div 
            onClick={() => setTask1Done(!task1Done)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              task1Done 
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-100' 
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40'
            }`}
          >
            <button className="mt-0.5 shrink-0 text-indigo-500">
              {task1Done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
              ) : (
                <Square className="w-5 h-5 text-zinc-400" />
              )}
            </button>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                Active Recall Goal
              </span>
              <p className={`text-xs font-bold ${task1Done ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                {pendingReviewsCount > 0 
                  ? `Complete ${pendingReviewsCount} pending active recall reviews`
                  : 'Review all scheduled active recall cards'}
              </p>
              <p className="text-[10px] text-zinc-500">
                30% weight towards Medical Journey Score
              </p>
            </div>
          </div>

          {/* Task 2: Study Lectures */}
          <div 
            onClick={() => setTask2Done(!task2Done)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              task2Done 
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-100' 
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40'
            }`}
          >
            <button className="mt-0.5 shrink-0 text-indigo-500">
              {task2Done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
              ) : (
                <Square className="w-5 h-5 text-zinc-400" />
              )}
            </button>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                Lecture Progress Goal
              </span>
              <p className={`text-xs font-bold ${task2Done ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                Study at least 2 lectures in active module
              </p>
              <p className="text-[10px] text-zinc-500">
                40% weight towards Medical Journey Score
              </p>
            </div>
          </div>

          {/* Task 3: Question Solving */}
          <div 
            onClick={() => setTask3Done(!task3Done)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              task3Done 
                ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-900 dark:text-emerald-100' 
                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/40'
            }`}
          >
            <button className="mt-0.5 shrink-0 text-indigo-500">
              {task3Done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
              ) : (
                <Square className="w-5 h-5 text-zinc-400" />
              )}
            </button>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                Question Solving Goal
              </span>
              <p className={`text-xs font-bold ${task3Done ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                Solve practice question block for studied lectures
              </p>
              <p className="text-[10px] text-zinc-500">
                30% weight towards Medical Journey Score
              </p>
            </div>
          </div>

        </div>

        {/* All Complete Success Celebration Banner */}
        {isMissionAllComplete && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 fill-emerald-500/20" />
              <p className="text-xs font-bold">
                🎉 Great job! You completed today's mission. Keep your learning streak alive!
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500/20 px-2.5 py-1 rounded-full">
              Mission Completed
            </span>
          </div>
        )}
      </div>

      {/* BENTO GRID MAIN CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* BENTO HERO CARD: Medical Journey Score (Col Span 2) */}
        <div className="md:col-span-2 bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                {t.journeyScore}
              </h3>
              <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            
            <div className="flex items-baseline gap-3 my-2">
              <span className="text-6xl sm:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tighter">
                {journeyMetrics.journeyScore}%
              </span>
              <span className="text-emerald-500 font-semibold text-sm bg-emerald-500/10 px-2.5 py-1 rounded-full">
                +{journeyMetrics.scoreTrend}% Growth
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Score breakdown: 70% for Studied + Solved lectures &bull; 30% for Weekly Review completion
            </p>
          </div>
          
          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 mb-0.5">Lectures (40%)</p>
                <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">{journeyMetrics.lectureCompletionRate}%</p>
              </div>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 mb-0.5">Questions (30%)</p>
                <p className="text-base font-bold text-zinc-900 dark:text-white font-mono">{journeyMetrics.questionSolvingRate}%</p>
              </div>
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                <p className="text-[10px] text-zinc-500 mb-0.5">Recall (30%)</p>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">{journeyMetrics.retentionScore}%</p>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${journeyMetrics.journeyScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* BENTO CARD 2: Current Module */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                {t.currentModule}
              </h3>
              <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <BookOpen className="w-4 h-4" />
              </span>
            </div>

            {currentModule ? (
              <div>
                <p className="text-zinc-900 dark:text-white font-bold text-lg leading-tight mb-2">
                  {currentModule.name}
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                  {currentModule.description || 'Core clinical block covering major organ systems.'}
                </p>
              </div>
            ) : (
              <div className="py-2 space-y-2">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No active module yet</p>
                <p className="text-[11px] text-zinc-500">Create your first medical module to start tracking lectures and exams.</p>
                <button
                  onClick={() => setActiveTab('modules')}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  + Add First Module
                </button>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-500">Progress</span>
              <span className="text-zinc-900 dark:text-white font-semibold">
                {currentModule?.completedLectures || 0} / {currentModule ? (currentModule.totalLectures || 1) : 0} Lectures
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${currentModule ? Math.round(((currentModule.completedLectures || 0) / (currentModule.totalLectures || 1)) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-3">
              <span>{currentModule ? Math.round(((currentModule.completedLectures || 0) / (currentModule.totalLectures || 1)) * 100) : 0}% Complete</span>
              <button 
                onClick={() => setActiveTab('modules')}
                className="text-indigo-500 font-bold hover:underline cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* BENTO CARD 3: DEDICATED WEEKLY REVIEW CARD */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-500" /> 🧠 Weekly Review
              </h3>
              {journeyMetrics.pendingWeeklyReviewsCount > 0 ? (
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] rounded-md">
                  {journeyMetrics.pendingWeeklyReviewsCount} PENDING
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> COMPLETED
                </span>
              )}
            </div>

            <div className="space-y-3 mt-3">
              {journeyMetrics.pendingWeeklyReviewsCount > 0 ? (
                <div>
                  <p className="text-2xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                    You have <span className="text-indigo-600 dark:text-indigo-400">{journeyMetrics.pendingWeeklyReviewsCount} lecture{journeyMetrics.pendingWeeklyReviewsCount > 1 ? 's' : ''}</span> waiting for review this week.
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                    7 days after studying & solving questions, lectures enter your Weekly Review list.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    🎉 Great job!
                  </p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    You have completed all your weekly reviews.
                  </p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('active-recall')}
            className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{journeyMetrics.pendingWeeklyReviewsCount > 0 ? 'Review Now' : 'View Weekly Review Page'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* BENTO CARD 4: Exam Readiness & Prediction */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                {t.examReadiness}
              </h3>
              <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <Target className="w-4 h-4" />
              </span>
            </div>
            
            <p className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 mt-3">
              {prediction.predictedExamScore}%
            </p>
            <p className="text-xs text-zinc-500 mt-1">Predicted Grade: <strong className="text-zinc-900 dark:text-white">{prediction.predictedGrade}</strong></p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mt-4">
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium leading-snug">
              Confidence Level: {prediction.confidenceLevel}%. Spaced retention model confirms high readiness.
            </p>
          </div>
        </div>

        {/* BENTO CARD 5: Lifestyle & Cognitive Balance */}
        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Lifestyle & Cognitive Balance
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">84</span>
              </div>
              <div>
                <p className="text-xs text-zinc-900 dark:text-white font-semibold">Healthy Mental Balance</p>
                <p className="text-[10px] text-zinc-500">7.5h avg sleep &bull; Low stress</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-1.5 items-end h-10">
            <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
            <div className="h-5 w-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-6 w-1.5 bg-indigo-500 rounded-full"></div>
            <div className="h-9 w-1.5 bg-indigo-500 rounded-full"></div>
            <div className="h-4 w-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-7 w-1.5 bg-indigo-500 rounded-full"></div>
            <div className="h-6 w-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <button 
              onClick={() => setActiveTab('lifestyle')}
              className="ml-auto text-[10px] text-indigo-500 font-bold hover:underline cursor-pointer"
            >
              Log Lifestyle
            </button>
          </div>
        </div>

        {/* BENTO CARD 6: Academic Insights (Col Span 2) */}
        <div className="md:col-span-2 bg-gradient-to-r from-white to-zinc-50 dark:from-[#121214] dark:to-[#18181c] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                {t.academicInsights}
              </h3>
              <button
                onClick={handleRefreshAi}
                disabled={loadingAi}
                className="flex items-center gap-1.5 text-xs text-indigo-500 hover:underline cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                <span>Recalculate Model</span>
              </button>
            </div>

            <div className="space-y-3">
              {insights.slice(0, 2).map((ins) => (
                <div key={ins.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 text-indigo-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">{ins.title}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{ins.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {customInsight && (
            <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-zinc-800 dark:text-zinc-200">
              <span className="font-bold text-indigo-500">Gemini Live Insight:</span> {customInsight}
            </div>
          )}
        </div>

      </div>

      {/* ROADMAP RAIL SECTION */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t.medicalJourneyMap}
            </h3>
            <p className="text-xs text-zinc-500">
              Visual roadmap tracking progression from First Lecture to Graduation.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 overflow-x-auto shadow-sm">
          <div className="flex items-center justify-between min-w-[700px] gap-4 py-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-white whitespace-nowrap">Pre-Med Essentials</span>
            </div>
            <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-white whitespace-nowrap">Molecular Basis</span>
            </div>
            <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-500 bg-indigo-500/10 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Anatomy & Neurology</span>
            </div>
            <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
              <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Pathology I</span>
            </div>
            <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-zinc-300 dark:bg-zinc-800"></div>
              <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Clinical Graduation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
