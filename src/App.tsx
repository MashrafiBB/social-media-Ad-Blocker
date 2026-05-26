import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Sparkles, 
  Info, 
  Flame, 
  TrendingUp, 
  Compass, 
  Trophy, 
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { ShieldSettings, BlockSchedule, FocusTimer, PasswordProtection, BlockAttempt, AppStats } from './types';
import { persistence } from './utils/persistence';
import Dashboard from './components/Dashboard';
import PhoneSimulator from './components/PhoneSimulator';

export default function App() {
  // State variables loaded from local storage persistence
  const [settings, setSettings] = useState<ShieldSettings>(() => persistence.getShieldSettings());
  const [schedule, setSchedule] = useState<BlockSchedule>(() => persistence.getScheduleOnly());
  const [timer, setTimer] = useState<FocusTimer>(() => persistence.getTimer());
  const [passwordProtect, setPasswordProtect] = useState<PasswordProtection>(() => persistence.getPassword());
  const [attempts, setAttempts] = useState<BlockAttempt[]>(() => persistence.getAttempts());
  const [stats, setStats] = useState<AppStats>(() => persistence.getStats());

  // App-level state
  const [isShieldOn, setIsShieldOn] = useState(true);
  const [isForceFocusOn, setIsForceFocusOn] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebratedMinutes, setCelebratedMinutes] = useState(0);

  // Sync state mutations to persistence storage
  const handleSetSettings = (newSettings: ShieldSettings) => {
    setSettings(newSettings);
    persistence.saveShieldSettings(newSettings);
  };

  const handleSetSchedule = (newSchedule: BlockSchedule) => {
    setSchedule(newSchedule);
    persistence.saveSchedule(newSchedule);
  };

  const handleSetTimer = (newTimer: FocusTimer) => {
    setTimer(newTimer);
    persistence.saveTimer(newTimer);
  };

  const handleSetPasswordProtect = (newPassword: PasswordProtection) => {
    setPasswordProtect(newPassword);
    persistence.savePassword(newPassword);
  };

  const handleClearAttempts = () => {
    setAttempts([]);
    persistence.saveAttempts([]);
    
    // Also reset block stats
    const resetStats: AppStats = {
      instagramBlocks: 0,
      youtubeBlocks: 0,
      facebookBlocks: 0,
      totalFocusMinutes: stats.totalFocusMinutes
    };
    setStats(resetStats);
    persistence.saveStats(resetStats);
  };

  // Log and increment blocks when attempts are triggered in the phone
  const handleRecordAttempt = (app: 'Instagram' | 'Facebook' | 'YouTube', type: 'Reels Feed' | 'App Start', quote: string) => {
    const newAttempt: BlockAttempt = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      app,
      attemptType: type,
      quote
    };

    const updatedAttempts = [newAttempt, ...attempts].slice(0, 100); // Limit logs to 100 entries
    setAttempts(updatedAttempts);
    persistence.saveAttempts(updatedAttempts);

    // Increment numeric counters
    setStats((prev) => {
      const updated = {
        ...prev,
        instagramBlocks: app === 'Instagram' ? prev.instagramBlocks + 1 : prev.instagramBlocks,
        youtubeBlocks: app === 'YouTube' ? prev.youtubeBlocks + 1 : prev.youtubeBlocks,
        facebookBlocks: app === 'Facebook' ? prev.facebookBlocks + 1 : prev.facebookBlocks
      };
      persistence.saveStats(updated);
      return updated;
    });
  };

  const handleSuccessBypass = () => {
    // Record that bypass was typed successfully
    const newAttempt: BlockAttempt = {
      id: 'bypass-' + Date.now().toString(),
      timestamp: new Date().toISOString(),
      app: 'Instagram',
      attemptType: 'Reels Feed',
      quote: '🔐 Security PIN bypass entered. Feed temporary override active.'
    };
    const updatedAttempts = [newAttempt, ...attempts].slice(0, 100);
    setAttempts(updatedAttempts);
    persistence.saveAttempts(updatedAttempts);
  };

  // Timer interval countdown handler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer.isActive && !timer.isPaused && timer.secondsRemaining > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev.secondsRemaining <= 1) {
            // Completed focus session!
            const addedMinutes = prev.durationMinutes;
            
            // Add focus minutes to analytics
            setStats((oldStats) => {
              const updated = {
                ...oldStats,
                totalFocusMinutes: oldStats.totalFocusMinutes + addedMinutes,
              };
              persistence.saveStats(updated);
              return updated;
            });

            // Trigger PWA Celebration Dialog overlay
            setCelebratedMinutes(addedMinutes);
            setShowCelebrationModal(true);

            const clearedTimer = {
              ...prev,
              secondsRemaining: 0,
              isActive: false,
              isPaused: false,
            };
            persistence.saveTimer(clearedTimer);
            return clearedTimer;
          }

          const updated = {
            ...prev,
            secondsRemaining: prev.secondsRemaining - 1,
          };
          persistence.saveTimer(updated);
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isActive, timer.isPaused]);

  return (
    <div className="min-h-screen bg-zinc-900 text-neutral-100 flex flex-col font-sans transition-color selection:bg-emerald-500/35">
      
      {/* Header Bar */}
      <header className="sticky top-0 bg-zinc-950/95 border-b border-zinc-800/80 z-20 backdrop-blur-xs shrink-0 py-3.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-500 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black tracking-tight text-neutral-100 uppercase text-sm">Reels Blocker & Guard</span>
                <span className="bg-amber-500/10 text-amber-500 text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 font-bold tracking-wider">SANDBOX</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-none mt-1">Designated Mobile Impulse Blocker Dashboard</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-neutral-450 font-mono">
            <span>Status: <strong className="text-emerald-400">● Live Preview Link</strong></span>
            <span>Local Node: <strong className="text-neutral-300">Active</strong></span>
          </div>

        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 flex flex-col items-center">
        
        {/* Android PWA Quick Setup Guide Top Card */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 leading-relaxed">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/60 text-sky-400 shrink-0 border border-sky-900/30 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-xl">
              <h3 className="text-xs font-bold text-neutral-100">Android Phone Integration (PWA installation)</h3>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Save this dashboard straight as a mobile app. On your Android phone, open this shared URL inside Google Chrome, open the menu (three dots) and tap <strong>Add to Home screen</strong>. It secures your scrolling sandbox in full screen!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-550 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-neutral-350">Android Mockup Verified</span>
          </div>
        </div>

        {/* Dynamic Split Layout: (Dashboard / Sandbox) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Core Controller Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Dashboard 
              settings={settings}
              setSettings={handleSetSettings}
              schedule={schedule}
              setSchedule={handleSetSchedule}
              isShieldOn={isShieldOn}
              setIsShieldOn={setIsShieldOn}
              isForceFocusOn={isForceFocusOn}
              setIsForceFocusOn={setIsForceFocusOn}
              timer={timer}
              setTimer={handleSetTimer}
              passwordProtect={passwordProtect}
              setPasswordProtect={handleSetPasswordProtect}
              attempts={attempts}
              onClearAttempts={handleClearAttempts}
              stats={stats}
              onResetStats={() => {}}
            />
          </div>

          {/* RIGHT: Live Android Device Shell (5 cols) */}
          <div className="lg:col-span-12 xl:col-span-5 lg:sticky lg:top-24 py-2 flex flex-col items-center">
            
            {/* Simulation Header banner */}
            <div className="mb-4 text-center">
              <span className="text-[10px] tracking-widest font-black uppercase text-neutral-450 block space-x-1">
                📱 SYSTEM TESTING SANDBOX
              </span>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Interact with the mobile screen. Switch tabs, click and view mock Instagram, Facebook, and YouTube apps!
              </p>
            </div>

            <PhoneSimulator 
              settings={settings}
              schedule={schedule}
              isShieldOn={isShieldOn}
              isForceFocusOn={isForceFocusOn}
              timerSecondsRemaining={timer.secondsRemaining}
              timerIsActive={timer.isActive}
              masterPin={passwordProtect.hash}
              frictionSeconds={passwordProtect.frictionSeconds}
              onRecordAttempt={handleRecordAttempt}
              onSuccessBypass={handleSuccessBypass}
            />

            {/* Quick Helper Tips Panel below phone */}
            <div className="mt-6 w-full max-w-[340px] bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-left">
              <h4 className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                Quick Sandbox Instructions:
              </h4>
              <ul className="text-[10px] text-zinc-400 space-y-1 list-disc pl-3.5 leading-relaxed">
                <li>Turn **Simulate Work Mode** ON left inside the Dashboard.</li>
                <li>Tap **Instagram**, then click on the **Reels** bottom icon.</li>
                <li>Watch the **Secured Block** trigger automatically.</li>
                <li>Click **Unlock Feed**, wait for patience cooldown, and enter **1234** to test momentary override!</li>
              </ul>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER BAR */}
      <footer className="mt-14 border-t border-zinc-800/80 bg-zinc-950 py-5 text-center shrink-0">
        <p className="text-[11px] text-zinc-500">
          Reels & Focus Blocker • Guard client sandbox model. Secure attention spans, block quick dopamine. Built in 2026.
        </p>
      </footer>

      {/* CELEBRATION MODAL OVERLAY (IFRAME-SAFE CELEBRATION) */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-xl relative overflow-hidden animate-zoomIn">
            
            {/* Visual celebration effects background gradient card */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500"></div>

            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900/30 border border-emerald-505 flex items-center justify-center text-3xl">
              🌟
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-base">Session Completed!</h3>
              <p className="text-xs text-emerald-400 font-semibold font-mono tracking-wider">🎉 CONGRATULATIONS 🎉</p>
            </div>

            <p className="text-xs text-zinc-350 leading-relaxed">
              You focused undisturbed for <strong>{celebratedMinutes} minutes</strong> without scrolling social Reels or Shorts! That is a massive triumph for your attention span.
            </p>

            <div className="bg-slate-950 p-2.5 rounded-xl text-[11px] text-zinc-455">
              📈 Your total focus logging is successfully updated.
            </div>

            <button 
              onClick={() => setShowCelebrationModal(false)}
              className="w-full bg-emerald-550 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-xl text-xs transition-transform transform active:scale-95 cursor-pointer"
            >
              Excellent, Thank You!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
