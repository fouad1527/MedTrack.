import React from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  LineChart, 
  Line 
} from 'recharts';
import { TrendingUp, Award, Brain, Target, Activity } from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { user, journeyMetrics, prediction, modules } = useMedTrack();
  const t = translations[user.language] || translations['en'];

  // Growth Trend Data
  const growthData = [
    { month: 'May', score: 62, step2: 230 },
    { month: 'Jun', score: 68, step2: 238 },
    { month: 'Jul', score: 74, step2: 245 },
    { month: 'Aug', score: 78, step2: 250 },
    { month: 'Sep', score: 82, step2: 258 },
    { month: 'Oct', score: journeyMetrics.journeyScore, step2: 262 },
  ];

  // Spaced Repetition Retention Curve
  const retentionCurveData = [
    { day: 'Day 1', retention: 100 },
    { day: 'Day 3', retention: 92 },
    { day: 'Day 7', retention: 88 },
    { day: 'Day 14', retention: 85 },
    { day: 'Day 30', retention: 94 },
    { day: 'Day 60', retention: 96 },
  ];

  // Module Comparison Radar
  const moduleRadarData = modules.map(m => ({
    module: m.name,
    completion: Math.round(((m.completedLectures || 0) / (m.totalLectures || 1)) * 100),
    questionsSolved: Math.round(((m.completedLectures || 0) / (m.totalLectures || 1)) * 95),
  }));

  // Weekly Study Consistency
  const consistencyData = [
    { day: 'Mon', hours: 7.5, questions: 45 },
    { day: 'Tue', hours: 8.0, questions: 50 },
    { day: 'Wed', hours: 6.5, questions: 35 },
    { day: 'Thu', hours: 9.0, questions: 60 },
    { day: 'Fri', hours: 7.0, questions: 40 },
    { day: 'Sat', hours: 5.5, questions: 30 },
    { day: 'Sun', hours: 8.5, questions: 55 },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t.performance} Analytics & Predictive Models
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Interactive data visualizations tracking academic growth, exam readiness, and memory retention trends.
        </p>
      </div>

      {/* TOP SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-400">Predicted Academic Grade</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{prediction.predictedGrade} ({prediction.predictedExamScore}%)</span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Top 5%</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Target Grade: {prediction.targetGradeOrScore}</p>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-400">Total Solved Questions</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{journeyMetrics.solvedQuestionsTotal}</span>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">+180 this week</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Question Bank Yield Rate: 88%</p>
        </div>

        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-xs font-semibold uppercase text-zinc-400">Study Consistency</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{journeyMetrics.studyConsistencyPercentage}%</span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Daily Study Average: 7.4 hrs</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <p className="text-xs font-mono-caps text-slate-400">Active Recall Retention</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">94%</span>
            <span className="text-xs font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">High Memory</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Leitner Algorithm Active</p>
        </div>
      </div>

      {/* CHARTS GRID 1: Academic Growth Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Academic Journey Score Growth
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">6-Month weighted performance trajectory</p>
            </div>
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Spaced Repetition Retention Curve */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Active Recall Retention Curve
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Leitner algorithm vs passive forgetting curve</p>
            </div>
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Brain className="w-5 h-5" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
                <Line type="monotone" dataKey="retention" stroke="#6366F1" strokeWidth={3} dot={{ r: 5, fill: '#6366F1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: Weekly Consistency & Module Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 3: Weekly Study Hours & Solved Questions */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Weekly Study Volume & Solved Questions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily hours and question block counts</p>
            </div>
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Activity className="w-5 h-5" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="hours" name="Study Hours" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="questions" name="Solved Questions" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Module Comparison Radar */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Curriculum Mastery Radar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-module coverage comparison</p>
            </div>
            <span className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
              <Target className="w-5 h-5" />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={moduleRadarData}>
                <PolarGrid strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="module" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Completion %" dataKey="completion" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Radar name="Questions Solved %" dataKey="questionsSolved" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
