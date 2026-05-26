import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Clock, 
  Settings, 
  Lock, 
  Unlock, 
  Sliders, 
  Flame, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Calendar, 
  Smartphone, 
  AlertTriangle 
} from 'lucide-react';
import { ShieldSettings, BlockSchedule, FocusTimer, PasswordProtection, BlockAttempt, AppStats } from '../types';

interface DashboardProps {
  settings: ShieldSettings;
  setSettings: (s: ShieldSettings) => void;
  schedule: BlockSchedule;
  setSchedule: (s: BlockSchedule) => void;
  isShieldOn: boolean;
  setIsShieldOn: (b: boolean) => void;
  isForceFocusOn: boolean;
  setIsForceFocusOn: (b: boolean) => void;
  timer: FocusTimer;
  setTimer: (t: FocusTimer) => void;
  passwordProtect: PasswordProtection;
  setPasswordProtect: (p: PasswordProtection) => void;
  attempts: BlockAttempt[];
  onClearAttempts: () => void;
  stats: AppStats;
  onResetStats: () => void;
}

const WEEDAYS = [
  { label: 'S', day: 0 },
  { label: 'M', day: 1 },
  { label: 'T', day: 2 },
  { label: 'W', day: 3 },
  { label: 'T', day: 4 },
  { label: 'F', day: 5 },
  { label: 'S', day: 6 },
];

export default function Dashboard({
  settings,
  setSettings,
  schedule,
  setSchedule,
  isShieldOn,
  setIsShieldOn,
  isForceFocusOn,
  setIsForceFocusOn,
  timer,
  setTimer,
  passwordProtect,
  setPasswordProtect,
  attempts,
  onClearAttempts,
  stats,
  onResetStats
}: DashboardProps) {
  
  // Local form inputs to avoid state lagging
  const [pinInput, setPinInput] = useState(passwordProtect.hash);
  const [pinHint, setPinHint] = useState(passwordProtect.hint);
  const [timerInput, setTimerInput] = useState(timer.durationMinutes);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const toggleDay = (day: number) => {
    let updated: number[];
    if (schedule.days.includes(day)) {
      updated = schedule.days.filter(d => d !== day);
    } else {
      updated = [...schedule.days, day].sort();
    }
    setSchedule({ ...schedule, days: updated });
    triggerToast('Schedule Weekdays Changed');
  };

  const triggerToast = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const applySchedulePreset = (preset: 'work' | 'evening' | 'weekend') => {
    if (preset === 'work') {
      setSchedule({
        enabled: true,
        startTime: '09:00',
        endTime: '17:00',
        days: [1, 2, 3, 4, 5],
      });
      triggerToast('Schedule Preset: Work Hours Applied');
    } else if (preset === 'evening') {
      setSchedule({
        enabled: true,
        startTime: '18:00',
        endTime: '22:00',
        days: [1, 2, 3, 4, 5],
      });
      triggerToast('Preset Applied: Evening Detox');
    } else if (preset === 'weekend') {
      setSchedule({
        enabled: true,
        startTime: '08:00',
        endTime: '23:00',
        days: [0, 6],
      });
      triggerToast('Preset Applied: Weekend Restriction');
    }
  };

  // Timer actions
  const startFocusTimer = () => {
    setTimer({
      ...timer,
      isActive: true,
      isPaused: false,
    });
    triggerToast('🔥 Focus timer started on phone simulator!');
  };

  const pauseFocusTimer = () => {
    setTimer({
      ...timer,
      isPaused: true,
    });
  };

  const resetFocusTimer = () => {
    setTimer({
      durationMinutes: timerInput,
      secondsRemaining: timerInput * 60,
      isActive: false,
      isPaused: false,
    });
    triggerToast('Timer reset to ' + timerInput + ' minutes.');
  };

  const handleTimerMinutesChange = (newMins: number) => {
    const clamped = Math.max(1, Math.min(180, newMins));
    setTimerInput(clamped);
    setTimer({
      ...timer,
      durationMinutes: clamped,
      secondsRemaining: clamped * 60,
      isActive: false,
      isPaused: false,
    });
  };

  // Password Actions
  const handleSavePassword = () => {
    if (!pinInput) {
      alert('Password cannot be empty!');
      return;
    }
    setPasswordProtect({
      ...passwordProtect,
      hash: pinInput,
      hint: pinHint
    });
    triggerToast('🔒 Security Override Settings Updated!');
  };

  // Shield settings helpers
  const toggleShieldCheckbox = (key: keyof ShieldSettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
    triggerToast(`Blocking Rules updated.`);
  };

  const formatTimerMinutes = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 text-neutral-100 flex flex-col justify-start">
      
      {/* Toast Alert Success inside configuration page */}
      {saveSuccess && (
        <div id="dashboard-toast" className="fixed top-4 left-4 bg-zinc-950 border border-emerald-500/30 px-4 py-2.5 rounded-lg text-emerald-400 font-semibold shadow-xl text-xs flex items-center gap-2 z-50">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Hero Overview Row */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-inner space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-emerald-950/80 text-emerald-400 font-bold px-3 py-1 rounded-full text-[10px] tracking-wider uppercase inline-block border border-emerald-900/40">
              Android Focus Shield
            </span>
            <h1 className="text-xl md:text-2xl font-black text-neutral-50 tracking-tight mt-1.5 flex items-center gap-2">
              Reels & Focus Blocker <span className="text-xs font-normal text-slate-500 font-mono">Companion Hub</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Configure system blockers, schedules, and active delays. Interact with the sandbox phone to see it in action!
            </p>
          </div>

          {/* Master Intercept Shield Toggle Switch */}
          <div className="flex items-center gap-3.5 bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-right">
              <span className="text-xs font-bold block text-neutral-200">Guard Mode</span>
              <span className={`text-[10px] font-bold ${isShieldOn ? 'text-emerald-405' : 'text-rose-405'}`}>
                {isShieldOn ? '● ARM SECURITY ON' : '○ SHIELD DISABLED'}
              </span>
            </div>
            <button
              onClick={() => {
                setIsShieldOn(!isShieldOn);
                triggerToast(isShieldOn ? 'Shield system un-armed' : '🔒 Shield successfully armed!');
              }}
              id="master-shield-toggle"
              className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isShieldOn ? 'bg-emerald-500' : 'bg-rose-505'}`}
            >
              <span className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isShieldOn ? 'translate-x-5.5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Demo Assistant State Widget to easily debug/test without waiting */}
        <div className="bg-emerald-955/20 border border-emerald-900/30 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> SIMULATOR ASSIST:
            </span>
            <p className="text-neutral-350 text-[11px] leading-relaxed">
              Force focus boundaries inside the mock phone screen to test the block and PIN overlay mechanisms instantly.
            </p>
          </div>
          <button
            onClick={() => {
              setIsForceFocusOn(!isForceFocusOn);
              triggerToast(isForceFocusOn ? 'Forced focus simulation off' : '⚡ Simulation initialized on sandbox!');
            }}
            id="force-simulation-toggle"
            className={`px-4 py-2 font-bold rounded-lg cursor-pointer transition-colors shrink-0 text-center ${isForceFocusOn ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-neutral-300 border border-slate-700'}`}
          >
            {isForceFocusOn ? '🛡️ Force Active ON (Armed)' : '⚡ Simulate Work Mode'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION: FEEDS BLOCK RULES */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="font-bold text-sm tracking-tight">Active Social Feeds Intercept</h3>
                <p className="text-[10px] text-neutral-450">Select platforms and elements you wish to deter</p>
              </div>
            </div>

            {/* Checkbox Rows */}
            <div className="space-y-3.5">
              
              {/* Instagram block */}
              <div 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-900/90 transition-colors"
                onClick={() => toggleShieldCheckbox('instagramReels')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 px-1.5 rounded-lg bg-pink-700/20 text-pink-400 text-xs font-bold">ig</div>
                  <div>
                    <span className="text-xs font-bold block">Block Instagram Reels</span>
                    <span className="text-[10px] text-neutral-400">Blocks bottom visual tabs & short video player paths</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.instagramReels} 
                  onChange={() => {}} 
                  className="rounded border-slate-705 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" 
                />
              </div>

              {/* YouTube Shorts block */}
              <div 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-900/90 transition-colors"
                onClick={() => toggleShieldCheckbox('youtubeShorts')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 px-1.5 rounded-lg bg-red-700/20 text-red-500 text-xs font-bold">yt</div>
                  <div>
                    <span className="text-xs font-bold block">Block YouTube Shorts</span>
                    <span className="text-[10px] text-neutral-400">Restricts video-scroller and mobile Shorts buttons</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.youtubeShorts} 
                  onChange={() => {}} 
                  className="rounded border-slate-705 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" 
                />
              </div>

              {/* Facebook Reels block */}
              <div 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-900/90 transition-colors"
                onClick={() => toggleShieldCheckbox('facebookReels')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 px-1.5 rounded-lg bg-blue-700/20 text-blue-400 text-xs font-bold">fb</div>
                  <div>
                    <span className="text-xs font-bold block">Block Facebook Reels</span>
                    <span className="text-[10px] text-neutral-400">Hides watch chips and native short feed access points</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.facebookReels} 
                  onChange={() => {}} 
                  className="rounded border-slate-705 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" 
                />
              </div>

              {/* App Startup Strict block altogether */}
              <div 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 cursor-pointer select-none hover:bg-slate-900/90 transition-colors"
                onClick={() => toggleShieldCheckbox('restrictFullApp')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1 px-1.5 rounded-lg bg-slate-800 text-neutral-400 text-xs font-bold">⚔️</div>
                  <div>
                    <span className="text-xs font-bold block text-amber-400">Strict App Restrictor</span>
                    <span className="text-[10px] text-neutral-400">Block entire social app on startup during focus hours</span>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.restrictFullApp} 
                  onChange={() => {}} 
                  className="rounded border-slate-705 text-emerald-500 focus:ring-emerald-500 h-4 w-4 shrink-0" 
                />
              </div>

            </div>
          </div>

          <div className="text-[10.5px] text-neutral-500 leading-normal bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 mt-4">
            💡 <strong>Dopamine Protection:</strong> Feeds are blocked only during work hours or when the Focus Session timer is ticking down.
          </div>
        </div>

        {/* SECTION: WORK SCHEDULER */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Focus Work Hours Scheduler</h3>
                  <p className="text-[10px] text-neutral-450">Establish days and intervals to enforce shield barriers</p>
                </div>
              </div>
              <button 
                onClick={() => setSchedule({ ...schedule, enabled: !schedule.enabled })}
                className={`text-[9.5px] font-bold px-2 py-1 rounded border ${schedule.enabled ? 'bg-emerald-950 text-emerald-400 border-emerald-900/30' : 'bg-slate-900 text-slate-500 border-slate-800'}`}
              >
                {schedule.enabled ? 'ACTIVE SCHEDULE' : 'DISABLED'}
              </button>
            </div>

            {/* Presets Row */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 uppercase font-mono">Presets:</span>
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => applySchedulePreset('work')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] px-2.5 py-1 rounded text-slate-300 transition-colors">
                  💼 Work (9-5)
                </button>
                <button onClick={() => applySchedulePreset('evening')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] px-2.5 py-1 rounded text-slate-300 transition-colors">
                  🌆 Evening detox
                </button>
                <button onClick={() => applySchedulePreset('weekend')} className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] px-2.5 py-1 rounded text-slate-300 transition-colors">
                  🗓️ Weekends
                </button>
              </div>
            </div>

            {/* Time range selection */}
            <div className="grid grid-cols-2 gap-3.5 bg-slate-900/30 p-3 rounded-xl border border-slate-900">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Start Time (24h)</label>
                <input 
                  type="time" 
                  value={schedule.startTime}
                  onChange={(e) => {
                    setSchedule({ ...schedule, startTime: e.target.value });
                    triggerToast(`Start time updated to ${e.target.value}`);
                  }}
                  className="bg-slate-900 border border-slate-800 text-xs py-1.5 px-2.5 rounded w-full text-white text-extrabold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">End Time (24h)</label>
                <input 
                  type="time" 
                  value={schedule.endTime}
                  onChange={(e) => {
                    setSchedule({ ...schedule, endTime: e.target.value });
                    triggerToast(`End time updated to ${e.target.value}`);
                  }}
                  className="bg-slate-900 border border-slate-800 text-xs py-1.5 px-2.5 rounded w-full text-white text-extrabold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Day Selector Chips */}
            <div>
              <label className="text-[10.5px] uppercase font-bold text-neutral-400 block mb-2">Repeat Scheduling Days</label>
              <div className="flex justify-between items-center bg-slate-905 p-1 rounded-xl gap-1">
                {WEEDAYS.map((w) => {
                  const isActive = schedule.days.includes(w.day);
                  return (
                    <button
                      key={w.day}
                      onClick={() => toggleDay(w.day)}
                      title={`Toggle schedule for day idx ${w.day}`}
                      className={`h-9 flex-1 rounded-lg text-xs font-bold transition-all border ${
                        isActive 
                          ? 'bg-emerald-950 border-emerald-900/60 text-emerald-400 shadow-sm' 
                          : 'bg-slate-900/50 border-slate-800/40 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="text-[10.5px] text-neutral-500 leading-normal flex items-center gap-1 bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 mt-4 shrink-0">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Currently configured focus window: <strong>{schedule.startTime} - {schedule.endTime}</strong>.</span>
          </div>
        </div>

        {/* SECTION: CUSTOM FOCUS TIMER */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Clock className="w-5 h-5 text-emerald-450" />
              <div>
                <h3 className="font-bold text-sm tracking-tight">Customizable Focus Timer</h3>
                <p className="text-[10px] text-neutral-450">Spawn high-intensity concentration segments manually</p>
              </div>
            </div>

            {/* Quick adjust timer inputs */}
            <div className="flex items-center gap-3 bg-slate-900/50 p-3.5 rounded-xl border border-slate-850">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Session Minutes:</span>
                <input 
                  type="number" 
                  min="1"
                  max="180"
                  value={timerInput}
                  onChange={(e) => handleTimerMinutesChange(Number(e.target.value))}
                  className="bg-neutral-950 text-emerald-400 border border-slate-800 text-center font-mono font-black text-base py-1 px-3 rounded w-full focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                {[15, 25, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleTimerMinutesChange(mins)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10.5px] px-2.5 py-1 rounded font-bold text-slate-350 transition-colors"
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Mini countdown timer display */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Live Focus Countdown</span>
                <span className={`text-2xl font-mono font-black ${timer.isActive && !timer.isPaused ? 'text-emerald-400 animate-pulse' : 'text-neutral-550'}`}>
                  {formatTimerMinutes(timer.secondsRemaining)}
                </span>
              </div>
              <div className="flex gap-2">
                {!timer.isActive || timer.isPaused ? (
                  <button 
                    onClick={startFocusTimer}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold flex items-center justify-center gap-1 px-3 text-xs transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Start</span>
                  </button>
                ) : (
                  <button 
                    onClick={pauseFocusTimer}
                    className="p-2 rounded-lg bg-amber-500 hover:bg-amber-605 text-slate-950 font-bold flex items-center justify-center gap-1 px-3 text-xs transition-colors cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Pause</span>
                  </button>
                )}

                <button 
                  onClick={resetFocusTimer}
                  title="Reset Timer"
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10.5px] text-neutral-500 bg-slate-900 p-2.5 rounded-xl border border-slate-850/60 mt-4 leading-normal">
            ⚙️ <strong>Timer Intercept Rules:</strong> Social Reels are blocked 100% of the time as long as this focus timer is active.
          </p>
        </div>

        {/* SECTION: PASSWORD PROTECTION & IMPULSE FRICTION */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Lock className="w-5 h-5 text-amber-550" />
              <div>
                <h3 className="font-bold text-sm tracking-tight">Security & Impulse Delays</h3>
                <p className="text-[10px] text-neutral-450">Limit bypass privileges during focus slots</p>
              </div>
            </div>

            {/* Pin and hint configs */}
            <div className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-850">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Admin Code Key</label>
                  <input 
                    type="text" 
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="e.g. 1234"
                    maxLength={12}
                    className="bg-neutral-950 border border-slate-800 text-center font-mono font-extrabold text-sm py-1 px-2.5 rounded w-full focus:outline-none focus:border-amber-500 text-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Passcode Hint</label>
                  <input 
                    type="text" 
                    value={pinHint}
                    onChange={(e) => setPinHint(e.target.value)}
                    placeholder="Humble reminder..."
                    className="bg-neutral-950 border border-slate-800 text-xs py-1 px-2.5 rounded w-full focus:outline-none focus:border-amber-500 text-neutral-300"
                  />
                </div>
              </div>

              {/* Slider for patience barrier */}
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between text-xs font-bold leading-none">
                  <span className="text-neutral-305 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    Impulsive Delay Wait Timer
                  </span>
                  <span className="text-rose-450 font-mono text-[11px]">{passwordProtect.frictionSeconds} seconds</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="30"
                  value={passwordProtect.frictionSeconds}
                  onChange={(e) => {
                    setPasswordProtect({
                      ...passwordProtect,
                      frictionSeconds: Number(e.target.value)
                    });
                  }}
                  className="w-full h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                
                <p className="text-[9.5px] text-neutral-400 leading-normal">
                  <strong>Why delay?</strong> A 5-30 second cooling period discourages easy "impulse taps," allowing logic and willpower to intercept the scrolling cycle before typing the password.
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button 
                  onClick={handleSavePassword}
                  id="save-passcode-settings-btn"
                  className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-neutral-200 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Update Pass Settings</span>
                </button>
              </div>

            </div>
          </div>

          <div className="bg-slate-900 text-amber-500/90 text-[10px] leading-normal p-2.5 rounded-xl border border-slate-850/60 mt-4 leading-relaxed flex items-start gap-1.5 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>To prevent unauthorized bypass, changing settings requires correct administrative verification keys on bypass requests inside the emulator.</span>
          </div>
        </div>

      </div>

      {/* SECTION: INTERCEPT ATTEMPTS LOG & METRICS TIMELINE */}
      <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm tracking-tight">Shield Intercept Timeline Logs</h3>
              <p className="text-[10px] text-neutral-450">Audit log database tracking blocked mobile scroll incidents</p>
            </div>
          </div>
          <button 
            onClick={onClearAttempts}
            className="text-[10px] text-zinc-400 hover:text-rose-450 flex items-center gap-1 bg-slate-900 border border-slate-805 px-2.5 py-1 rounded cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Logs</span>
          </button>
        </div>

        {/* Audit Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/30 p-2 border border-slate-900 rounded-xl">
          <div className="p-3 bg-slate-950/90 rounded-lg text-center border border-slate-900">
            <span className="text-[10.5px] uppercase font-bold text-zinc-550 block">Instagram</span>
            <span className="text-xl font-bold font-mono text-pink-400">{stats.instagramBlocks}</span>
            <span className="text-[9px] text-neutral-500 block">swipes blocked</span>
          </div>
          <div className="p-3 bg-slate-950/90 rounded-lg text-center border border-slate-900">
            <span className="text-[10.5px] uppercase font-bold text-zinc-550 block">YouTube</span>
            <span className="text-xl font-bold font-mono text-red-500">{stats.youtubeBlocks}</span>
            <span className="text-[9px] text-neutral-500 block">shorts deterred</span>
          </div>
          <div className="p-3 bg-slate-950/90 rounded-lg text-center border border-slate-900">
            <span className="text-[10.5px] uppercase font-bold text-zinc-550 block">Facebook</span>
            <span className="text-xl font-bold font-mono text-blue-400">{stats.facebookBlocks}</span>
            <span className="text-[9px] text-neutral-500 block">feeds caught</span>
          </div>
          <div className="p-3 bg-slate-950/90 rounded-lg text-center border border-slate-900">
            <span className="text-[10.5px] uppercase font-bold text-zinc-550 block">Focus Minutes</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{stats.totalFocusMinutes}m</span>
            <span className="text-[9px] text-slate-500 block">deep concentration</span>
          </div>
        </div>

        {/* Log Entries vertical timelines */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {attempts.length === 0 ? (
            <div className="p-8 text-center text-zinc-550 italic text-xs">
              No blocked attempts recorded today yet. Use the system sandbox on the right and open "Reels" / "Shorts" to trigger intercept events!
            </div>
          ) : (
            attempts.map((attempt) => (
              <div key={attempt.id} className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-start gap-3 text-xs leading-normal">
                {/* Platform color dot sticker */}
                <div className="mt-1 h-5.5 w-5.5 rounded-full flex items-center justify-center shrink-0 border border-slate-700 bg-slate-950">
                  {attempt.app === 'Instagram' && <span className="text-[10px] text-pink-400 font-bold">ig</span>}
                  {attempt.app === 'YouTube' && <span className="text-[10px] text-red-500 font-bold">yt</span>}
                  {attempt.app === 'Facebook' && <span className="text-[10px] text-blue-400 font-bold">fb</span>}
                </div>
                {/* Text specifics */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-neutral-200 font-mono text-[11px]">
                      {attempt.app} {attempt.attemptType === 'App Start' ? 'Full App Start' : 'Reels Swiped'} blocked
                    </span>
                    <span className="text-[9.5px] text-neutral-500 font-mono shrink-0">
                      {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[10.5px] truncate mt-1">"{attempt.quote}"</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}
