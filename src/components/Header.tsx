import React, { useState } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { Language } from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Sun, 
  Moon, 
  Globe, 
  Menu, 
  User, 
  LogOut, 
  ShieldCheck 
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, updateUser, logout, setActiveTab, insights, journeyMetrics } = useMedTrack();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const t = translations[user.language] || translations['en'];
  const totalPendingReviews = journeyMetrics.pendingWeeklyReviewsCount;

  const toggleTheme = () => {
    updateUser({ theme: user.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleLanguageChange = (lang: Language) => {
    updateUser({ language: lang });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 flex items-center justify-between gap-4 md:ml-[260px]">
      {/* Mobile Menu Trigger & Logo Branding */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobileMenu}
          className="md:hidden text-zinc-700 dark:text-zinc-200 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="md:hidden flex items-center gap-2">
          <img src="/medtrack-logo.svg" alt="MedTrack Logo" className="w-7 h-7 object-contain" />
          <span className="font-extrabold text-sm text-zinc-900 dark:text-white tracking-tight">MedTrack</span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-48 sm:w-72 md:w-96 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-10 py-1.5 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex gap-0.5">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">K</kbd>
          </div>
        </div>
      </div>

      {/* Trailing Controls & User Menu */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sync Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">System Sync: Optimal</span>
        </div>

        {/* Language Selector */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-mono">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span className="uppercase font-bold">{user.language}</span>
          </button>
          
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block w-36 bg-white dark:bg-[#121214] rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50">
            <button 
              onClick={() => handleLanguageChange('en')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${user.language === 'en' ? 'font-bold text-indigo-500' : ''}`}
            >
              English
            </button>
            <button 
              onClick={() => handleLanguageChange('ar')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${user.language === 'ar' ? 'font-bold text-indigo-500' : ''}`}
            >
              العربية (Fusha)
            </button>
            <button 
              onClick={() => handleLanguageChange('ar-eg')}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 ${user.language === 'ar-eg' ? 'font-bold text-indigo-500' : ''}`}
            >
              مصري (Egyptian)
            </button>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title={user.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {user.theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-zinc-700" />}
        </button>

        {/* AI Insight Trigger */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-zinc-900 dark:text-white text-xs font-semibold hover:border-indigo-500/50 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {totalPendingReviews > 0 ? (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-mono font-extrabold bg-rose-500 text-white rounded-full ring-2 ring-white dark:ring-zinc-950">
                {totalPendingReviews}
              </span>
            ) : (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Notifications & Alerts</h4>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-bold">
                  {totalPendingReviews} Pending
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {journeyMetrics.pendingWeeklyReviewsCount > 0 && (
                  <div 
                    onClick={() => { setActiveTab('active-recall'); setShowNotifications(false); }}
                    className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1 cursor-pointer hover:bg-indigo-500/20 transition-all"
                  >
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                      <span>🧠 You have {journeyMetrics.pendingWeeklyReviewsCount} lecture{journeyMetrics.pendingWeeklyReviewsCount > 1 ? 's' : ''} waiting for review</span>
                      <span className="text-[10px] font-mono bg-indigo-500 text-white px-1.5 py-0.5 rounded">Weekly Review</span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-[11px]">
                      Click here to complete your 7-day weekly reviews now.
                    </p>
                  </div>
                )}

                {insights.map((insight) => (
                  <div key={insight.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-xs space-y-1">
                    <p className="font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                      <span>{insight.title}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{insight.date}</span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="rounded-full hover:opacity-80 transition-opacity focus:outline-none"
          >
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="w-8 h-8" textClassName="text-xs font-bold" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50">
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
              </div>

              <button
                onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span>Profile Settings</span>
              </button>

              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
