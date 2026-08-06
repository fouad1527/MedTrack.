import React from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { ActiveTab } from '../types';
import { translations } from '../translations';
import { UserAvatar } from './UserAvatar';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  BarChart2, 
  TrendingUp, 
  HeartPulse, 
  Settings, 
  ShieldCheck,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, user, journeyMetrics, logout } = useMedTrack();
  const t = translations[user.language] || translations['en'];

  const pendingReviewsCount = journeyMetrics.pendingWeeklyReviewsCount;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'modules', label: t.modules, icon: <BookOpen className="w-5 h-5" /> },
    { id: 'active-recall', label: t.activeRecall, icon: <Brain className="w-5 h-5" />, badge: pendingReviewsCount },
    { id: 'results', label: t.results, icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'performance', label: t.performance, icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'lifestyle', label: t.lifestyle, icon: <HeartPulse className="w-5 h-5" /> },
    { id: 'settings', label: t.settings, icon: <Settings className="w-5 h-5" /> },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen w-[260px] bg-white/95 dark:bg-[#09090b] backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-800 z-50 flex flex-col py-6 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Brand Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabClick('dashboard')}>
            <img 
              src="/medtrack-logo.svg" 
              alt="MedTrack Logo" 
              className="w-9 h-9 rounded-xl object-contain bg-transparent shrink-0 shadow-sm" 
            />
            <div>
              <h1 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-none tracking-tight">
                MedTrack
              </h1>
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 font-mono tracking-wider uppercase mt-1">
                Track Your Med Way
              </p>
            </div>
          </div>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-white font-semibold border border-zinc-200 dark:border-zinc-700/60 shadow-sm' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-white'
                  }
                `}
              >
                <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold font-mono bg-indigo-600 text-white rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer CTA & Profile */}
        <div className="px-4 mt-auto pt-4 space-y-3">
          <div className="bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3.5 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {t.myWorkspace || 'Personal Workspace'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
              Custom medical curriculum environment
            </p>
          </div>

          <button 
            onClick={() => handleTabClick('settings')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-xs font-medium transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.helpCenter}</span>
          </button>

          {/* User profile & Logout */}
          <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="w-8 h-8" textClassName="text-[11px] font-bold" />
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title={t.signOut || "Sign Out"}
              className="p-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
