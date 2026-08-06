import React, { useState } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { 
  HeartPulse, 
  Moon, 
  Dumbbell, 
  Droplets, 
  Coffee, 
  Smartphone, 
  Smile, 
  Meh, 
  Frown, 
  Sparkles, 
  Flame, 
  Sliders, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

export const LifestyleView: React.FC = () => {
  const { user, lifestyle, updateLifestyle, lifestyleScores } = useMedTrack();
  const t = translations[user.language] || translations['en'];

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto space-y-8 pb-24 md:pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t.lifestyle} Tracker & Cognitive Balance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor sleep, hydration, screen time, and stress. MedTrack correlates your lifestyle with academic recall.
        </p>
      </div>

      {/* SYSTEM-COMPUTED SCORES CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-caps text-slate-400">Lifestyle Score</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <HeartPulse className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {lifestyleScores.lifestyleScore} / 100
          </div>
          <p className="text-[11px] font-bold text-emerald-500 mt-1">
            Mental Readiness: {lifestyleScores.mentalReadiness}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-caps text-slate-400">Productivity Score</span>
            <span className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {lifestyleScores.productivityScore} / 100
          </div>
          <p className="text-[11px] text-slate-500 mt-1">High Focus Efficiency</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-caps text-slate-400">Discipline Score</span>
            <span className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {lifestyleScores.disciplineScore} / 100
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Habit Adherence: 92%</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-caps text-slate-400">Sleep Quality</span>
            <span className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <Moon className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {lifestyleScores.sleepQuality}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{lifestyle.sleepHours} Hours Logged</p>
        </div>
      </div>

      {/* AI LIFESTYLE CORRELATION INSIGHT */}
      <div className="ai-insight-border p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>AI Lifestyle & Academic Correlation Engine:</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          • Sleeping ≥7.0 hours increases your Active Recall retention score by +12% during morning study blocks.<br />
          • Reducing caffeine intake after 04:00 PM will improve REM sleep quality and memory consolidation before block exams.
        </p>
      </div>

      {/* DAILY CHECK-IN FORM */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <span>Daily Medical Lifestyle Check-In</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Log today's wellness variables to train your cognitive model.</p>
          </div>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sleep Hours */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-indigo-500" /> Sleep Duration (Hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="16"
              value={lifestyle.sleepHours}
              onChange={(e) => updateLifestyle({ sleepHours: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Exercise Minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-emerald-500" /> Exercise (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="300"
              value={lifestyle.exerciseMins}
              onChange={(e) => updateLifestyle({ exerciseMins: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Water Intake */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-500" /> Water Intake (Liters)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={lifestyle.waterIntakeLiters}
              onChange={(e) => updateLifestyle({ waterIntakeLiters: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Caffeine Cups */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-600" /> Caffeine Intake (Cups)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={lifestyle.caffeineCups}
              onChange={(e) => updateLifestyle({ caffeineCups: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone Screen Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-purple-500" /> Non-Study Screen Time (Hours)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="24"
              value={lifestyle.phoneUsageHours}
              onChange={(e) => updateLifestyle({ phoneUsageHours: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Perceived Stress Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <span>Perceived Stress Level</span>
              <span className="text-emerald-500 font-extrabold">{lifestyle.stressLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={lifestyle.stressLevel}
              onChange={(e) => updateLifestyle({ stressLevel: parseInt(e.target.value) || 1 })}
              className="w-full accent-emerald-500 cursor-pointer mt-2"
            />
          </div>

          {/* Mood Selector */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
            <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">Today's Mindset / Mood</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {[
                { id: 'great', label: 'Great & Focused', icon: <Smile className="w-4 h-4 text-emerald-500" /> },
                { id: 'good', label: 'Good Progress', icon: <Smile className="w-4 h-4 text-blue-500" /> },
                { id: 'neutral', label: 'Balanced', icon: <Meh className="w-4 h-4 text-amber-500" /> },
                { id: 'tired', label: 'Fatigued', icon: <Frown className="w-4 h-4 text-purple-500" /> },
                { id: 'stressed', label: 'Stressed / Exam Near', icon: <Frown className="w-4 h-4 text-red-500" /> },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateLifestyle({ mood: m.id as any })}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                    ${lifestyle.mood === m.id
                      ? 'bg-slate-900 text-white dark:bg-emerald-400 dark:text-slate-950 border-transparent shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }
                  `}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Save */}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 transition-colors shadow-md"
            >
              {t.logLifestyle}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
