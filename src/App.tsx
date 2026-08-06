import React, { useState } from 'react';
import { MedTrackProvider, useMedTrack } from './store/useMedTrackStore';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { DashboardView } from './components/DashboardView';
import { ModulesView } from './components/ModulesView';
import { ActiveRecallView } from './components/ActiveRecallView';
import { ResultsView } from './components/ResultsView';
import { PerformanceView } from './components/PerformanceView';
import { LifestyleView } from './components/LifestyleView';
import { SettingsView } from './components/SettingsView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, authLoading, activeTab } = useMedTrack();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#071B34] flex flex-col items-center justify-center text-white relative overflow-hidden select-none">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1A6BFF]/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* MedTrack Logo */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-blue-500/30 rounded-3xl blur-xl animate-pulse" />
            <img 
              src="/medtrack-logo.svg" 
              alt="MedTrack Logo" 
              className="w-16 h-16 rounded-2xl relative shadow-2xl object-contain bg-transparent border border-white/10" 
            />
          </div>

          {/* Brand Slogan */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white">MedTrack</h1>
            <p className="text-xs font-semibold text-blue-400 font-mono tracking-widest uppercase">
              Track Your Med Way
            </p>
          </div>

          {/* Apple-Inspired Smooth Circular Spinner */}
          <div className="relative w-8 h-8 mt-2">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 border-r-blue-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Protected Route Check: Unauthenticated users are redirected directly to LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'modules':
        return <ModulesView />;
      case 'active-recall':
        return <ActiveRecallView />;
      case 'results':
        return <ResultsView />;
      case 'performance':
        return <PerformanceView />;
      case 'lifestyle':
        return <LifestyleView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onCloseMobile={() => setMobileSidebarOpen(false)} 
      />

      {/* Top Header Bar */}
      <Header 
        onOpenMobileMenu={() => setMobileSidebarOpen(true)} 
      />

      {/* Main View Area */}
      <main className="md:ml-[260px] min-h-[calc(100vh-64px)] transition-all duration-300">
        {renderActiveTabContent()}
      </main>
    </div>
  );
};

export function App() {
  return (
    <MedTrackProvider>
      <MainLayout />
    </MedTrackProvider>
  );
}

export default App;
