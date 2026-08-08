import React, { useState, useRef, useEffect } from 'react';
import { useMedTrack } from '../store/useMedTrackStore';
import { translations } from '../translations';
import { Language } from '../types';
import { UserAvatar } from './UserAvatar';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Globe, 
  Menu, 
  User, 
  LogOut, 
  ShieldCheck,
  BookOpen,
  FileText,
  Award,
  RotateCcw,
  X
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { 
    user, 
    updateUser, 
    logout, 
    setActiveTab, 
    journeyMetrics,
    modules,
    lectures,
    academicResults,
    activeRecallList
  } = useMedTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const t = translations[user.language] || translations['en'];
  const totalPendingReviews = journeyMetrics.pendingWeeklyReviewsCount;

  const toggleTheme = () => {
    updateUser({ theme: user.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleLanguageChange = (lang: Language) => {
    updateUser({ language: lang });
  };

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items based on query
  const trimmedQuery = searchQuery.trim().toLowerCase();

  const matchingModules = trimmedQuery ? modules.filter(m => 
    m.name.toLowerCase().includes(trimmedQuery) || 
    m.code.toLowerCase().includes(trimmedQuery) ||
    (m.description && m.description.toLowerCase().includes(trimmedQuery))
  ) : [];

  const matchingLectures = trimmedQuery ? lectures.filter(l => 
    l.title.toLowerCase().includes(trimmedQuery) || 
    l.moduleName.toLowerCase().includes(trimmedQuery) ||
    (l.summary && l.summary.toLowerCase().includes(trimmedQuery))
  ) : [];

  const matchingResults = trimmedQuery ? academicResults.filter(r => 
    r.moduleName.toLowerCase().includes(trimmedQuery) || 
    r.examName.toLowerCase().includes(trimmedQuery) ||
    r.percentage.toString().includes(trimmedQuery)
  ) : [];

  const matchingRecall = trimmedQuery ? activeRecallList.filter(ar => 
    ar.lectureName.toLowerCase().includes(trimmedQuery) || 
    ar.moduleName.toLowerCase().includes(trimmedQuery)
  ) : [];

  const totalResultsCount = matchingModules.length + matchingLectures.length + matchingResults.length + matchingRecall.length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 md:px-8 flex items-center justify-between gap-4 md:ml-[260px]">
      {/* Mobile Menu Trigger & Logo Branding */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
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
        <div ref={searchContainerRef} className="relative w-full max-w-md hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchModal(true);
              }}
              onFocus={() => setShowSearchModal(true)}
              placeholder={t.searchPlaceholder || "Search modules, lectures, exam results..."}
              className="w-full pl-9 pr-9 py-1.5 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchModal(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* SEARCH RESULTS FLOATING DROPDOWN */}
          {showSearchModal && trimmedQuery.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 z-50 max-h-96 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 font-medium">
                <span>Search results for "{searchQuery}"</span>
                <span className="font-bold text-indigo-500">{totalResultsCount} items</span>
              </div>

              {totalResultsCount === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500 space-y-1">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300">No matching items found</p>
                  <p>Try searching for a module name, lecture title, or exam score.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Modules */}
                  {matchingModules.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-indigo-500" />
                        <span>Modules ({matchingModules.length})</span>
                      </p>
                      {matchingModules.map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setActiveTab('modules');
                            setShowSearchModal(false);
                          }}
                          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-white">{m.name}</span>
                            <span className="text-[10px] text-zinc-400 ml-2 font-mono">[{m.code}]</span>
                          </div>
                          <span className="text-[10px] text-indigo-500 font-semibold">{m.completedLectures}/{m.totalLectures} lectures</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lectures */}
                  {matchingLectures.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span>Lectures ({matchingLectures.length})</span>
                      </p>
                      {matchingLectures.map(l => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setActiveTab('modules');
                            setShowSearchModal(false);
                          }}
                          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-medium text-zinc-800 dark:text-zinc-200">{l.title}</p>
                            <p className="text-[10px] text-zinc-400">{l.moduleName}</p>
                          </div>
                          <div className="flex gap-1">
                            {l.studied && <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/10 text-blue-500 rounded font-bold">Studied</span>}
                            {l.solved && <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 text-emerald-500 rounded font-bold">Solved</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Exam Results */}
                  {matchingResults.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-amber-500" />
                        <span>Exam Results ({matchingResults.length})</span>
                      </p>
                      {matchingResults.map(r => (
                        <div
                          key={r.id}
                          onClick={() => {
                            setActiveTab('results');
                            setShowSearchModal(false);
                          }}
                          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-white">{r.examName}</p>
                            <p className="text-[10px] text-zinc-400">{r.moduleName}</p>
                          </div>
                          <span className="font-extrabold text-xs text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">{r.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Active Recall */}
                  {matchingRecall.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                        <RotateCcw className="w-3 h-3 text-emerald-500" />
                        <span>Active Recall ({matchingRecall.length})</span>
                      </p>
                      {matchingRecall.map(ar => (
                        <div
                          key={ar.id}
                          onClick={() => {
                            setActiveTab('active-recall');
                            setShowSearchModal(false);
                          }}
                          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-medium text-zinc-800 dark:text-zinc-200">{ar.lectureName}</p>
                            <p className="text-[10px] text-zinc-400">{ar.moduleName}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ar.reviewed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {ar.reviewed ? 'Reviewed' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trailing Controls & User Menu */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sync Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">Workspace Active</span>
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
                {journeyMetrics.pendingWeeklyReviewsCount > 0 ? (
                  <div 
                    onClick={() => { setActiveTab('active-recall'); setShowNotifications(false); }}
                    className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1 cursor-pointer hover:bg-indigo-500/20 transition-all"
                  >
                    <p className="font-bold text-indigo-600 dark:text-indigo-400">Weekly Spaced Repetition Due</p>
                    <p className="text-zinc-600 dark:text-zinc-300">You have {journeyMetrics.pendingWeeklyReviewsCount} lecture reviews scheduled for today.</p>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No pending notifications at this time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#121214] rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50">
              <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.email || 'Medical Student'}</p>
              </div>

              <button
                onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-zinc-400" />
                <span>Workspace Settings</span>
              </button>

              <button
                onClick={() => { logout(); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
