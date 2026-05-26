import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Smartphone, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  Timer, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Flame, 
  MoreHorizontal, 
  Home, 
  Key, 
  User, 
  Volume2, 
  Compass, 
  Play, 
  AlertCircle 
} from 'lucide-react';
import { ShieldSettings, BlockSchedule, BlockAttempt } from '../types';
import { FOCUS_QUOTES, INSTAGRAM_POSTS, INSTAGRAM_REELS, YOUTUBE_VIDEOS, YOUTUBE_SHORTS, FACEBOOK_POSTS, FACEBOOK_REELS } from '../utils/mockData';

interface PhoneSimulatorProps {
  settings: ShieldSettings;
  schedule: BlockSchedule;
  isShieldOn: boolean;
  isForceFocusOn: boolean;
  timerSecondsRemaining: number;
  timerIsActive: boolean;
  masterPin: string;
  frictionSeconds: number;
  onRecordAttempt: (app: 'Instagram' | 'Facebook' | 'YouTube', type: 'Reels Feed' | 'App Start', quote: string) => void;
  onSuccessBypass: () => void;
}

type AppId = 'launcher' | 'instagram' | 'facebook' | 'youtube' | 'companion';

export default function PhoneSimulator({
  settings,
  schedule,
  isShieldOn,
  isForceFocusOn,
  timerSecondsRemaining,
  timerIsActive,
  masterPin,
  frictionSeconds,
  onRecordAttempt,
  onSuccessBypass
}: PhoneSimulatorProps) {
  // Simulator State
  const [currentApp, setCurrentApp] = useState<AppId>('launcher');
  const [igTab, setIgTab] = useState<'feed' | 'reels'>('feed');
  const [ytTab, setYtTab] = useState<'home' | 'shorts'>('home');
  const [fbTab, setFbTab] = useState<'feed' | 'reels'>('feed');
  
  // Simulated Reels Scroll Indices
  const [igReelIndex, setIgReelIndex] = useState(0);
  const [ytShortIndex, setYtShortIndex] = useState(0);
  const [fbReelIndex, setFbReelIndex] = useState(0);

  // Active Override / Bypass Logic inside the Simulator
  const [isBypassed, setIsBypassed] = useState(false);
  const [bypassSecondsLeft, setBypassSecondsLeft] = useState(0);
  const [frictionActive, setFrictionActive] = useState(false);
  const [frictionCount, setFrictionCount] = useState(0);
  const [showPinInput, setShowPinInput] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeQuote, setActiveQuote] = useState('');

  // Notifications or toast alerts in device
  const [deviceToast, setDeviceToast] = useState<string | null>(null);

  // Date representation
  const [timeStr, setTimeStr] = useState('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync quotes when a block hits
  const selectRandomQuote = () => {
    const idx = Math.floor(Math.random() * FOCUS_QUOTES.length);
    setActiveQuote(FOCUS_QUOTES[idx]);
  };

  // Helper: Checks if focus filter is actually blocking right now
  const isFocusFilterActive = () => {
    if (!isShieldOn) return false;
    
    // Checked if forced manually via companion simulator toggle
    if (isForceFocusOn) return true;

    // Checked if Pomodoro active timer running
    if (timerIsActive && timerSecondsRemaining > 0) return true;

    // Checked if within scheduled work hours
    const now = new Date();
    const day = now.getDay();
    if (!schedule.days.includes(day) || !schedule.enabled) return false;

    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    return currentMins >= startMins && currentMins <= endMins;
  };

  const isBlocked = (app: 'Instagram' | 'Facebook' | 'YouTube', location: 'start' | 'reels'): boolean => {
    if (isBypassed) return false;
    if (!isFocusFilterActive()) return false;

    if (location === 'start') {
      return settings.restrictFullApp;
    }

    // Reels tab
    if (app === 'Instagram' && settings.instagramReels) return true;
    if (app === 'YouTube' && settings.youtubeShorts) return true;
    if (app === 'Facebook' && settings.facebookReels) return true;

    return false;
  };

  // Effect: Log attempts when a state triggers a new block
  const prevBlockedRef = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    const isIgStartBlocked = isBlocked('Instagram', 'start');
    const isIgReelsBlocked = igTab === 'reels' && isBlocked('Instagram', 'reels');
    const isYtStartBlocked = isBlocked('YouTube', 'start');
    const isYtShortsBlocked = ytTab === 'shorts' && isBlocked('YouTube', 'reels');
    const isFbStartBlocked = isBlocked('Facebook', 'start');
    const isFbReelsBlocked = fbTab === 'reels' && isBlocked('Facebook', 'reels');

    const blockStatus = {
      igStart: isIgStartBlocked && currentApp === 'instagram',
      igReels: isIgReelsBlocked && currentApp === 'instagram',
      ytStart: isYtStartBlocked && currentApp === 'youtube',
      ytShorts: isYtShortsBlocked && currentApp === 'youtube',
      fbStart: isFbStartBlocked && currentApp === 'facebook',
      fbReels: isFbReelsBlocked && currentApp === 'facebook'
    };

    // Logging trigger whenever any distinct blocking screen loads
    if (blockStatus.igStart && !prevBlockedRef.current.igStart) {
      onRecordAttempt('Instagram', 'App Start', activeQuote || FOCUS_QUOTES[0]);
      selectRandomQuote();
    }
    if (blockStatus.igReels && !prevBlockedRef.current.igReels) {
      onRecordAttempt('Instagram', 'Reels Feed', activeQuote || FOCUS_QUOTES[0]);
      selectRandomQuote();
    }
    if (blockStatus.ytStart && !prevBlockedRef.current.ytStart) {
      onRecordAttempt('YouTube', 'App Start', activeQuote || FOCUS_QUOTES[0]);
      selectRandomQuote();
    }
    if (blockStatus.ytShorts && !prevBlockedRef.current.ytShorts) {
      onRecordAttempt('YouTube', 'Reels Feed', activeQuote || FOCUS_QUOTES[0]);
      selectRandomQuote();
    }
    if (blockStatus.fbStart && !prevBlockedRef.current.fbStart) {
      onRecordAttempt('Facebook', 'App Start', activeQuote || FOCUS_QUOTES[0]);
      selectRandomQuote();
    }
    if (blockStatus.fbReels && !prevBlockedRef.current.fbReels) {
      onRecordAttempt('Facebook', 'Reels Feed', activeQuote || FOCUS_QUOTES[0]);
      selectRandomQuote();
    }

    prevBlockedRef.current = blockStatus;
  }, [currentApp, igTab, ytTab, fbTab, isShieldOn, isForceFocusOn, timerSecondsRemaining, isBypassed, settings]);

  // Handle temporary bypass expiration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBypassed && bypassSecondsLeft > 0) {
      interval = setInterval(() => {
        setBypassSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsBypassed(false);
            showDeviceToast('🔐 Bypass expired. Shield engaged.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBypassed, bypassSecondsLeft]);

  // Handle friction wait countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (frictionActive && frictionCount > 0) {
      interval = setInterval(() => {
        setFrictionCount((prev) => {
          if (prev <= 1) {
            setFrictionActive(false);
            setShowPinInput(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [frictionActive]);

  const showDeviceToast = (msg: string) => {
    setDeviceToast(msg);
    setTimeout(() => setDeviceToast(null), 3000);
  };

  // UI Action triggers
  const launchApp = (app: AppId) => {
    // Reset specific states
    setEnteredPin('');
    setPinError('');
    setFrictionActive(false);
    setShowPinInput(false);
    selectRandomQuote();

    if (app === 'instagram') {
      setIgTab('feed');
    } else if (app === 'facebook') {
      setFbTab('feed');
    } else if (app === 'youtube') {
      setYtTab('home');
    }
    setCurrentApp(app);
  };

  const handleStartBypassFlow = () => {
    if (frictionSeconds > 0) {
      setFrictionActive(true);
      setFrictionCount(frictionSeconds);
      setShowPinInput(false);
    } else {
      setShowPinInput(true);
    }
  };

  const handlePinSubmit = (val: string) => {
    if (val === masterPin) {
      // Success! Grant 120 seconds of viewing
      setIsBypassed(true);
      setBypassSecondsLeft(120);
      setEnteredPin('');
      setPinError('');
      setShowPinInput(false);
      showDeviceToast('🔓 Bypass granted. Feed unlocked for 2m.');
      onSuccessBypass();
    } else {
      setPinError('Invalid PIN code. Try again!');
      setEnteredPin('');
    }
  };

  // Formatted bypass timer
  const formatBypassTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative mx-auto w-full max-w-[360px] aspect-[9/19.5] rounded-[48px] bg-neutral-950 p-3.5 shadow-2xl ring-[14px] ring-neutral-900 ring-offset-4 ring-offset-neutral-800 transition-all">
      {/* Speaker slit */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 h-1.5 w-16 rounded-full bg-neutral-850 z-50"></div>
      
      {/* Front camera pinhole */}
      <div className="absolute top-5.5 left-1/3 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-neutral-900 border border-neutral-750 z-50"></div>

      {/* Screen container */}
      <div id="emulator-screen" className="relative w-full h-full rounded-[38px] bg-slate-900 overflow-hidden flex flex-col font-sans select-none text-white text-sm">
        
        {/* Status Bar */}
        <div className="h-7 px-5 pt-1.5 flex justify-between items-center text-[11.5px] font-medium tracking-tight bg-slate-950/40 backdrop-blur-xs z-40 text-neutral-350 shrink-0">
          <div>{timeStr}</div>
          <div className="flex items-center gap-1.5">
            {isFocusFilterActive() && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" title="Shield Active"></span>
              </span>
            )}
            {isFocusFilterActive() && <Shield className="w-3.5 h-3.5 text-emerald-405" />}
            {isBypassed && <Unlock className="w-3.5 h-3.5 text-amber-500" />}
            <span className="bg-neutral-850 text-[9px] px-1 rounded-sm border border-neutral-750">LTE</span>
            <span>89%</span>
          </div>
        </div>

        {/* Temporary Unlocked Notification Banner */}
        {isBypassed && (
          <div className="bg-amber-600/90 text-slate-950 px-3 py-1 text-center font-semibold text-[11px] flex items-center justify-center gap-1.5 select-none z-30 shrink-0 animate-pulse">
            <Unlock className="w-3.5 h-3.5 shrink-0" />
            <span>EXPIRED FEEDS ACTIVE — {formatBypassTime(bypassSecondsLeft)} LEFT</span>
          </div>
        )}

        {/* App Workspace Area */}
        <div className="flex-1 relative flex flex-col min-h-0 bg-neutral-900 overflow-hidden">
          
          {/* TOAST OVERLAY */}
          {deviceToast && (
            <div className="absolute top-4 left-4 right-4 bg-slate-950 border border-neutral-850 p-2.5 rounded-lg z-50 text-xs font-medium flex items-center gap-2 shadow-lg animate-bounce text-emerald-400">
              <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{deviceToast}</span>
            </div>
          )}

          {/* APP: HOME LAUNCHER */}
          {currentApp === 'launcher' && (
            <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 via-neutral-900 to-slate-950 overflow-y-auto">
              <div className="mt-8 text-center">
                <div className="text-2xl font-light tracking-wide text-neutral-200">Reels Shield</div>
                <div className="text-[11px] text-neutral-450 mt-1">Companion Screen Device Sandbox</div>
                
                {/* Active state widget in Mobile Launcher */}
                <div className="mt-5 mx-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/60 text-left flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-350">Shield Status</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                      {isFocusFilterActive() ? '🚨 Enforcing focus guards' : '🟢 Ready (Offline/Allowed)'}
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-lg ${isFocusFilterActive() ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-950/40 text-red-400'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Grid of Apps */}
              <div className="grid grid-cols-3 gap-y-7 gap-x-4 my-auto px-1 justify-items-center">
                {/* Instagram app icon */}
                <button 
                  onClick={() => launchApp('instagram')}
                  id="app-icon-instagram"
                  className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-[15px] bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    <span className="text-white text-2xl font-extrabold tracking-tighter">ig</span>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">Instagram</span>
                </button>

                {/* YouTube app icon */}
                <button 
                  onClick={() => launchApp('youtube')}
                  id="app-icon-youtube"
                  className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-[15px] bg-red-650 flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    <span className="text-white text-2xl font-black">▶</span>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">YouTube</span>
                </button>

                {/* Facebook app icon */}
                <button 
                  onClick={() => launchApp('facebook')}
                  id="app-icon-facebook"
                  className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-[15px] bg-blue-700 flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    <span className="text-white text-3xl font-black font-sans -mb-1">f</span>
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">Facebook</span>
                </button>

                {/* Companion Client */}
                <button 
                  onClick={() => launchApp('companion')}
                  id="app-icon-shield"
                  className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <div className="w-[52px] h-[52px] rounded-[15px] bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-medium text-neutral-300">Shield Mgr</span>
                </button>
              </div>

              {/* Sticky bottom search bar mock */}
              <div className="w-full bg-slate-950/50 backdrop-blur-xs py-2 px-3 rounded-full border border-slate-800/40 text-neutral-400 flex items-center justify-between text-xs mb-3">
                <span>Say "Ok Google"</span>
                <span>🎙️</span>
              </div>
            </div>
          )}

          {/* APP: INSTAGRAM */}
          {currentApp === 'instagram' && (
            <div className="flex-1 flex flex-col bg-black">
              {/* Instagram top bar */}
              <div className="h-11 px-3 flex justify-between items-center bg-black border-b border-neutral-900 tracking-tight shrink-0">
                <div className="font-serif italic text-lg text-white tracking-widest flex items-center gap-1.5">
                  <span className="font-extrabold not-italic text-sm">📸</span> Instagram
                </div>
                <div className="flex items-center gap-3.5 text-neutral-300">
                  <span className="text-lg">⊕</span>
                  <span className="text-lg">❤️</span>
                  <span className="text-sm">💬</span>
                </div>
              </div>

              {/* Feed Block Checker */}
              {isBlocked('Instagram', 'start') ? (
                <BlockOverlayScreen app="Instagram" currentApp="instagram" onBypass={handleStartBypassFlow} activeQuote={activeQuote} frictionActive={frictionActive} frictionCount={frictionCount} showPinInput={showPinInput} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onPinSubmit={handlePinSubmit} pinError={pinError} onBack={() => launchApp('launcher')} />
              ) : igTab === 'reels' && isBlocked('Instagram', 'reels') ? (
                <BlockOverlayScreen app="Instagram" currentApp="instagram" onBypass={handleStartBypassFlow} activeQuote={activeQuote} frictionActive={frictionActive} frictionCount={frictionCount} showPinInput={showPinInput} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onPinSubmit={handlePinSubmit} pinError={pinError} onBack={() => setIgTab('feed')} />
              ) : (
                // NORMAL SCREEN
                <div className="flex-1 flex flex-col min-h-0 bg-black text-neutral-200">
                  {igTab === 'feed' ? (
                    // INSTAGRAM FEED
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                      {/* Active stories slider */}
                      <div className="flex gap-2.5 pb-2 border-b border-neutral-900 overflow-x-auto scrollbar-none text-[9.5px]">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 to-purple-600">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs">👤</div>
                          </div>
                          <span>Your Story</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 to-purple-600">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs">☕</div>
                          </div>
                          <span>coffee_dev</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-yellow-500 to-purple-600">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs">🐈</div>
                          </div>
                          <span>cat_bytes</span>
                        </div>
                      </div>

                      {/* Posts */}
                      {INSTAGRAM_POSTS.map((post) => (
                        <div key={post.id} className="border border-neutral-950 rounded-xl bg-neutral-950 p-2.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-semibold">
                              <span>{post.avatar}</span>
                              <span>{post.author}</span>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                          </div>
                          {post.image ? (
                            <div className="aspect-video w-full rounded-lg bg-cover" style={{ backgroundImage: post.image }}></div>
                          ) : (
                            <div className="aspect-video w-full rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-600">
                              [Image Placeholder]
                            </div>
                          )}
                          <div className="text-xs leading-relaxed mt-1 text-neutral-350">{post.content}</div>
                          <div className="flex justify-between text-[11px] text-neutral-500 pt-1">
                            <span>❤️ {post.likes} likes</span>
                            <span>💬 {post.commentsCount} comments</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // INSTAGRAM REELS
                    <div className="flex-1 relative flex flex-col bg-slate-950 min-h-0">
                      {/* Interactive short vertical slider */}
                      <div className={`flex-1 flex flex-col justify-between p-4 bg-gradient-to-br ${INSTAGRAM_REELS[igReelIndex].bgGradient} transition-colors duration-500`}>
                        {/* Feed stats / warning */}
                        <div className="flex justify-between items-center text-xs bg-black/40 backdrop-blur-xs p-1.5 rounded-lg text-neutral-300">
                          <span className="flex items-center gap-1 text-[10px]">
                            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 
                            REELS MODE (UNGUARDED MINUTES ACTIVE)
                          </span>
                          <span className="text-[10px] text-neutral-400">Idx {igReelIndex + 1}/{INSTAGRAM_REELS.length}</span>
                        </div>

                        {/* Middle video visual screen */}
                        <div className="my-auto text-center space-y-2">
                          <span className="text-6xl filter drop-shadow-md animate-bounce inline-block">{INSTAGRAM_REELS[igReelIndex].emoji}</span>
                          <div className="text-white text-xs font-medium tracking-tight px-4 underline">
                            [Simulating Looping Mobile MP4 Video]
                          </div>
                        </div>

                        {/* Bottom overlays & comments */}
                        <div className="space-y-3">
                          <div className="flex items-end justify-between bg-black/50 p-2.5 rounded-xl border border-white/5 backdrop-blur-xs">
                            <div className="space-y-1.5 text-xs max-w-[80%]">
                              <span className="font-bold flex items-center gap-1.5 bg-neutral-900/40 py-0.5 px-2 rounded-full w-fit">
                                {INSTAGRAM_REELS[igReelIndex].avatar} {INSTAGRAM_REELS[igReelIndex].creator}
                              </span>
                              <p className="text-[11px] leading-relaxed text-neutral-200">{INSTAGRAM_REELS[igReelIndex].caption}</p>
                            </div>
                            <div className="flex flex-col gap-2.5 items-center text-center text-[10px] text-neutral-100 shrink-0 font-bold">
                              <div className="flex flex-col items-center cursor-pointer">
                                <span>❤️</span>
                                <span>{INSTAGRAM_REELS[igReelIndex].likes}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span>💬</span>
                                <span>{INSTAGRAM_REELS[igReelIndex].comments}</span>
                              </div>
                              <div className="p-1 cursor-pointer" onClick={() => setIgReelIndex((prev) => (prev + 1) % INSTAGRAM_REELS.length)}>
                                <span className="bg-emerald-500 hover:bg-emerald-600 text-[9px] text-slate-950 px-1.5 py-1 rounded-sm block">NEXT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Navigation */}
                  <div className="h-10 border-t border-neutral-900 bg-black flex justify-around items-center text-neutral-450 text-xs tracking-tighter select-none shrink-0">
                    <button onClick={() => setIgTab('feed')} className={`flex-1 flex flex-col items-center focus:outline-none cursor-pointer ${igTab === 'feed' ? 'text-white font-bold' : ''}`}>
                      <span className="text-sm">🏠</span>
                      <span className="text-[9px]">Home</span>
                    </button>
                    <button onClick={() => setIgTab('reels')} className={`flex-1 flex flex-col items-center focus:outline-none cursor-pointer ${igTab === 'reels' ? 'text-pink-500 font-bold' : ''}`}>
                      <span className="text-sm">🎬</span>
                      <span className="text-[9px]">Reels</span>
                    </button>
                    <button onClick={() => launchApp('launcher')} className="flex-1 flex flex-col items-center focus:outline-none cursor-pointer text-neutral-500">
                      <span className="text-sm">⏹</span>
                      <span className="text-[9px]">Exit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* APP: YOUTUBE */}
          {currentApp === 'youtube' && (
            <div className="flex-1 flex flex-col bg-stone-900">
              {/* YouTube Header */}
              <div className="h-11 px-3 flex justify-between items-center bg-zinc-900/90 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-red-500 font-extrabold text-base">▶️</span>
                  <span className="font-extrabold text-sm tracking-tight text-white">YouTube</span>
                </div>
                <div className="flex items-center gap-3.5 text-zinc-350 text-xs">
                  <span>📺</span>
                  <span>🔔</span>
                  <span>🔍</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-[9px] text-emerald-100">U</span>
                </div>
              </div>

              {/* Feed Block Checker */}
              {isBlocked('YouTube', 'start') ? (
                <BlockOverlayScreen app="YouTube" currentApp="youtube" onBypass={handleStartBypassFlow} activeQuote={activeQuote} frictionActive={frictionActive} frictionCount={frictionCount} showPinInput={showPinInput} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onPinSubmit={handlePinSubmit} pinError={pinError} onBack={() => launchApp('launcher')} />
              ) : ytTab === 'shorts' && isBlocked('YouTube', 'reels') ? (
                <BlockOverlayScreen app="YouTube" currentApp="youtube" onBypass={handleStartBypassFlow} activeQuote={activeQuote} frictionActive={frictionActive} frictionCount={frictionCount} showPinInput={showPinInput} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onPinSubmit={handlePinSubmit} pinError={pinError} onBack={() => setYtTab('home')} />
              ) : (
                // NORMAL SCREEN
                <div className="flex-1 flex flex-col min-h-0 bg-stone-950 text-neutral-100">
                  {ytTab === 'home' ? (
                    // YOUTUBE HOME FEED (Allowed/Long Form - constructive)
                    <div className="flex-1 overflow-y-auto space-y-4 p-2">
                      <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-tight py-1 px-1 border-b border-zinc-800">
                        🎓 Long-Form Video Feeds (Accessible)
                      </div>
                      
                      {YOUTUBE_VIDEOS.map((vid) => (
                        <div key={vid.id} className="group cursor-pointer select-none border-b border-stone-900 pb-3">
                          {/* Mock Thumbnail */}
                          <div className={`aspect-video w-full rounded-lg ${vid.thumbnailColor} relative flex items-center justify-center overflow-hidden border border-zinc-805`}>
                            <div className="bg-slate-950/60 p-2.5 rounded-full border border-white/10">
                              <span className="text-xl">📺</span>
                            </div>
                            <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1 text-[9.5px] font-bold rounded-sm">
                              {vid.duration}
                            </span>
                          </div>
                          {/* Info */}
                          <div className="mt-2.5 flex gap-2.5 px-1.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs">🎓</div>
                            <div>
                              <h4 className="text-[11.5px] font-medium leading-tight text-neutral-200 group-hover:text-red-400">
                                {vid.title}
                              </h4>
                              <div className="text-[10px] text-neutral-400 mt-1 flex gap-1.5 flex-wrap">
                                <span>{vid.channel}</span>
                                <span>•</span>
                                <span>{vid.views}</span>
                                <span>•</span>
                                <span>{vid.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // YOUTUBE SHORTS (Short-form Dopamine Trigger, Locked)
                    <div className="flex-1 relative flex flex-col bg-black min-h-0">
                      {/* Short vertical simulator */}
                      <div className={`flex-1 flex flex-col justify-between p-4 bg-gradient-to-br ${YOUTUBE_SHORTS[ytShortIndex].bgGradient} transition-colors duration-500`}>
                        <div className="flex justify-between items-center text-xs bg-black/40 backdrop-blur-xs p-1.5 rounded-lg text-neutral-300">
                          <span className="flex items-center gap-1 text-[10px]">
                            <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> 
                            YOUTUBE SHORTS (🔓 LOCK SUSPENDED)
                          </span>
                          <span className="text-[10px] text-zinc-400">Idx {ytShortIndex + 1}/{YOUTUBE_SHORTS.length}</span>
                        </div>

                        <div className="my-auto text-center space-y-2">
                          <span className="text-6xl drop-shadow-md animate-bounce inline-block">{YOUTUBE_SHORTS[ytShortIndex].emoji}</span>
                          <div className="text-white text-xs font-semibold px-4 tracking-wide bg-black/20 py-1.5 rounded-lg">
                            [Simulating Interactive YouTube Shorts Player]
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-end justify-between bg-black/50 p-2.5 rounded-xl border border-white/5 backdrop-blur-xs">
                            <div className="space-y-1.5 text-xs max-w-[80%]">
                              <span className="font-bold bg-neutral-900/60 py-0.5 px-2 rounded text-[10px]">
                                {YOUTUBE_SHORTS[ytShortIndex].avatar} {YOUTUBE_SHORTS[ytShortIndex].creator}
                              </span>
                              <p className="text-[11px] leading-relaxed text-zinc-200">{YOUTUBE_SHORTS[ytShortIndex].caption}</p>
                            </div>
                            <div className="flex flex-col gap-2.5 items-center text-[10px] font-bold text-neutral-100 shrink-0">
                              <div className="flex flex-col items-center">
                                <span>👍</span>
                                <span>{YOUTUBE_SHORTS[ytShortIndex].likes}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span>💬</span>
                                <span>{YOUTUBE_SHORTS[ytShortIndex].comments}</span>
                              </div>
                              <div className="p-1 cursor-pointer" onClick={() => setYtShortIndex((prev) => (prev + 1) % YOUTUBE_SHORTS.length)}>
                                <span className="bg-red-500 hover:bg-red-650 text-[9px] text-white px-2 py-1 rounded-sm block">NEXT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* YouTube Bottom Navigation */}
                  <div className="h-10 border-t border-zinc-800 bg-zinc-950 flex justify-around items-center text-zinc-450 text-xs tracking-tighter shrink-0 select-none">
                    <button onClick={() => setYtTab('home')} className={`flex-1 flex flex-col items-center focus:outline-none cursor-pointer ${ytTab === 'home' ? 'text-white' : ''}`}>
                      <span className="text-sm">🏠</span>
                      <span className="text-[9px]">Home</span>
                    </button>
                    <button onClick={() => setYtTab('shorts')} className={`flex-1 flex flex-col items-center focus:outline-none cursor-pointer ${ytTab === 'shorts' ? 'text-red-500 font-bold' : ''}`}>
                      <span className="text-sm">🔴</span>
                      <span className="text-[9px]">Shorts</span>
                    </button>
                    <button onClick={() => launchApp('launcher')} className="flex-1 flex flex-col items-center focus:outline-none cursor-pointer text-zinc-550">
                      <span className="text-sm">⏹</span>
                      <span className="text-[9px]">Exit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* APP: FACEBOOK */}
          {currentApp === 'facebook' && (
            <div className="flex-1 flex flex-col bg-zinc-900">
              {/* Facebook Header */}
              <div className="h-11 px-3 flex justify-between items-center bg-zinc-850 border-b border-zinc-800 shrink-0">
                <div className="font-sans font-black text-blue-550 text-lg tracking-tight">facebook</div>
                <div className="flex items-center gap-3.5 text-zinc-330 text-xs">
                  <span>➕</span>
                  <span>🔍</span>
                  <span>💬</span>
                </div>
              </div>

              {/* Feed Block Checker */}
              {isBlocked('Facebook', 'start') ? (
                <BlockOverlayScreen app="Facebook" currentApp="facebook" onBypass={handleStartBypassFlow} activeQuote={activeQuote} frictionActive={frictionActive} frictionCount={frictionCount} showPinInput={showPinInput} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onPinSubmit={handlePinSubmit} pinError={pinError} onBack={() => launchApp('launcher')} />
              ) : fbTab === 'reels' && isBlocked('Facebook', 'reels') ? (
                <BlockOverlayScreen app="Facebook" currentApp="facebook" onBypass={handleStartBypassFlow} activeQuote={activeQuote} frictionActive={frictionActive} frictionCount={frictionCount} showPinInput={showPinInput} enteredPin={enteredPin} setEnteredPin={setEnteredPin} onPinSubmit={handlePinSubmit} pinError={pinError} onBack={() => setFbTab('feed')} />
              ) : (
                // NORMAL SCREEN
                <div className="flex-1 flex flex-col min-h-0 bg-neutral-900 text-neutral-200">
                  {fbTab === 'feed' ? (
                    // FACEBOOK NEWS FEED
                    <div className="flex-1 overflow-y-auto p-3 space-y-4">
                      {/* What's on your mind? */}
                      <div className="bg-zinc-850 p-2.5 rounded-xl border border-zinc-800 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs">👤</div>
                          <input 
                            type="text" 
                            placeholder="What's on your mind?" 
                            className="bg-zinc-800 rounded-full px-3 py-1 flex-1 text-xs border border-zinc-700 text-neutral-300 focus:outline-none"
                            disabled
                          />
                        </div>
                        <div className="flex justify-between text-[11px] pt-1.5 border-t border-zinc-800 text-neutral-400">
                          <span className="flex items-center gap-1">🎥 Live</span>
                          <span className="flex items-center gap-1">🖼️ Photo</span>
                          <button onClick={() => setFbTab('reels')} className="flex items-center gap-1 text-blue-400 font-bold">🎬 Reel Card</button>
                        </div>
                      </div>

                      {/* Posts */}
                      {FACEBOOK_POSTS.map((post) => (
                        <div key={post.id} className="bg-zinc-850 p-3 rounded-xl border border-zinc-800 space-y-2.5">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-sm">{post.avatar}</span>
                            <div>
                              <div className="font-semibold">{post.author}</div>
                              <div className="text-[9px] text-zinc-500">{post.timestamp}</div>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-350 leading-relaxed">{post.content}</p>
                          <div className="flex justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 font-semibold">
                            <span>👍 Like ({post.likes})</span>
                            <span>💬 Comment ({post.commentsCount})</span>
                            <span>↩ Share</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // FACEBOOK REELS
                    <div className="flex-1 relative flex flex-col bg-slate-950 min-h-0">
                      {/* Interactive block overlay inside */}
                      <div className={`flex-1 flex flex-col justify-between p-4 bg-gradient-to-br ${FACEBOOK_REELS[fbReelIndex].bgGradient} transition-colors duration-500`}>
                        <div className="flex justify-between items-center text-xs bg-black/40 backdrop-blur-xs p-1.5 rounded-lg text-neutral-300">
                          <span className="flex items-center gap-1 text-[10px]">
                            <Flame className="w-3.5 h-3.5 text-blue-500 fill-blue-550" /> 
                            FACEBOOK REELS (BYPASS STATE ACTIVE)
                          </span>
                          <span className="text-[10px] text-neutral-400">Index {fbReelIndex + 1}/{FACEBOOK_REELS.length}</span>
                        </div>

                        <div className="my-auto text-center space-y-2">
                          <span className="text-5xl filter drop-shadow animate-bounce inline-block">{FACEBOOK_REELS[fbReelIndex].emoji}</span>
                          <div className="text-white text-xs font-semibold px-4 tracking-tight py-2 bg-slate-950/20 border border-white/5 rounded-lg">
                            [Simulating Loop FB Video Card Content]
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-end justify-between bg-black/50 p-2.5 rounded-xl border border-white/5 backdrop-blur-xs">
                            <div className="space-y-1.5 text-xs max-w-[80%]">
                              <span className="font-bold bg-neutral-900/60 py-0.5 px-2 rounded text-[10px]">
                                {FACEBOOK_REELS[fbReelIndex].avatar} {FACEBOOK_REELS[fbReelIndex].creator}
                              </span>
                              <p className="text-[11px] leading-relaxed text-zinc-200">{FACEBOOK_REELS[fbReelIndex].caption}</p>
                            </div>
                            <div className="flex flex-col gap-2.5 items-center text-[10px] font-bold text-neutral-150 shrink-0">
                              <div className="flex flex-col items-center">
                                <span>👍</span>
                                <span>{FACEBOOK_REELS[fbReelIndex].likes}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span>💬</span>
                                <span>{FACEBOOK_REELS[fbReelIndex].comments}</span>
                              </div>
                              <div className="p-1 cursor-pointer" onClick={() => setFbReelIndex((prev) => (prev + 1) % FACEBOOK_REELS.length)}>
                                <span className="bg-blue-600 hover:bg-blue-750 text-[9px] text-white px-2 py-1 rounded shadow block">NEXT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Facebook Bottom Tabs */}
                  <div className="h-10 border-t border-zinc-800 bg-zinc-950 flex justify-around items-center text-zinc-450 text-xs tracking-tighter shrink-0 select-none">
                    <button onClick={() => setFbTab('feed')} className={`flex-1 flex flex-col items-center focus:outline-none cursor-pointer ${fbTab === 'feed' ? 'text-white' : ''}`}>
                      <span className="text-sm">🏠</span>
                      <span className="text-[9px]">Home</span>
                    </button>
                    <button onClick={() => setFbTab('reels')} className={`flex-1 flex flex-col items-center focus:outline-none cursor-pointer ${fbTab === 'reels' ? 'text-blue-400 font-bold' : ''}`}>
                      <span className="text-sm">🎬</span>
                      <span className="text-[9px]">Reels</span>
                    </button>
                    <button onClick={() => launchApp('launcher')} className="flex-1 flex flex-col items-center focus:outline-none cursor-pointer text-zinc-550">
                      <span className="text-sm">⏹</span>
                      <span className="text-[9px]">Exit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* APP: COMPANION DEVICE CONFIG */}
          {currentApp === 'companion' && (
            <div className="flex-1 flex flex-col bg-slate-950 p-4 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mt-1 justify-between shrink-0">
                <div className="flex items-center gap-1.5 focus:outline-none cursor-pointer text-xs" onClick={() => launchApp('launcher')}>
                  <ArrowLeft className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-neutral-300">Device Client Manager</span>
                </div>
                <div className="bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded text-[8.5px]">v1.4 PWA</div>
              </div>

              <div className="space-y-3.5 mt-2">
                <div className="text-center p-3 rounded-xl bg-slate-900 border border-slate-850 space-y-1.5">
                  <Shield className="w-8 h-8 mx-auto text-emerald-400" />
                  <h4 className="text-xs font-semibold text-neutral-150">Reels Shield Companion Client</h4>
                  <p className="text-[10px] text-neutral-400 leading-normal">This client connects to the system-level intercept service on Android to block specific video feeds like Instagram / YouTube / Facebook.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-850 space-y-2">
                  <h5 className="text-[10.5px] font-bold text-slate-300 tracking-tight">Active Intercept Rules</h5>
                  <div className="space-y-1.5 text-[10px] text-neutral-400">
                    <div className="flex justify-between">
                      <span>Instagram Reels Intercept</span>
                      <span className={settings.instagramReels ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{settings.instagramReels ? 'ACTIVE' : 'OFF'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>YouTube Shorts Intercept</span>
                      <span className={settings.youtubeShorts ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{settings.youtubeShorts ? 'ACTIVE' : 'OFF'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Facebook Reels Intercept</span>
                      <span className={settings.facebookReels ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>{settings.facebookReels ? 'ACTIVE' : 'OFF'}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-850 pt-1.5 font-semibold text-neutral-305">
                      <span>Strict Mode App Intercept</span>
                      <span className={settings.restrictFullApp ? 'text-emerald-400' : 'text-amber-500'}>{settings.restrictFullApp ? 'FULL BLOCK' : 'FEEDS ONLY'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1">
                  <h5 className="text-[10.5px] font-bold text-slate-300">How to load on your phone:</h5>
                  <ol className="text-[10px] text-neutral-400 space-y-1 list-decimal pl-3.5 leading-snug">
                    <li>Load the web address inside Chrome browser on Android.</li>
                    <li>Click the 3-dots Chrome menu and select "Add to Home Screen".</li>
                    <li>Open custom Reels Shield app direct from home screen.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Outer Simulated Android Gesture Handle / Navigation Bar */}
        <div className="h-9 bg-neutral-950 flex justify-center items-center shrink-0 border-t border-neutral-900/20">
          <div className="w-24 h-1 rounded-full bg-neutral-700 hover:bg-neutral-500 cursor-pointer" onClick={() => launchApp('launcher')} title="Go Home"></div>
        </div>
      </div>
    </div>
  );
}

// SIMULATED INTERACTIVE BLOCK OVERLAY COMPONENT
interface BlockOverlayProps {
  app: 'Instagram' | 'Facebook' | 'YouTube';
  currentApp: string;
  onBypass: () => void;
  activeQuote: string;
  frictionActive: boolean;
  frictionCount: number;
  showPinInput: boolean;
  enteredPin: string;
  setEnteredPin: (p: string) => void;
  onPinSubmit: (p: string) => void;
  pinError: string;
  onBack: () => void;
}

function BlockOverlayScreen({
  app,
  currentApp,
  onBypass,
  activeQuote,
  frictionActive,
  frictionCount,
  showPinInput,
  enteredPin,
  setEnteredPin,
  onPinSubmit,
  pinError,
  onBack
}: BlockOverlayProps) {
  return (
    <div className="flex-1 bg-slate-950 flex flex-col justify-between p-4 text-center overflow-y-auto">
      
      {/* Back to feed button */}
      <div className="text-left">
        <button onClick={onBack} className="text-xs text-neutral-400 flex items-center gap-1 focus:outline-none cursor-pointer bg-neutral-900/60 py-1 px-2 rounded hover:text-white border border-neutral-800">
          <ArrowLeft className="w-3.5 h-3.5 text-rose-500" />
          <span>Go Back</span>
        </button>
      </div>

      <div className="my-auto space-y-4 px-2">
        {/* Pulsing visual core */}
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center animate-pulse">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">{app} Secured</h3>
          <p className="text-[11px] text-rose-400 font-semibold uppercase tracking-widest text-center">FOCUS SYSTEM ACTIVATED</p>
        </div>

        {/* Reflective Dopamine Friction Quote */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl italic text-xs leading-relaxed text-neutral-350 shadow-inner">
          "{activeQuote || 'Short-term reels delay long-term development.'}"
        </div>

        {/* Temporary Overrides and Impulsive Control with friction screen */}
        <div className="space-y-2 mt-4">
          {!frictionActive && !showPinInput ? (
            <button 
              onClick={onBypass}
              id="bypass-request-btn"
              className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 py-2 rounded-xl text-neutral-300 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Unlock Feed (Temporary Bypass)</span>
            </button>
          ) : frictionActive ? (
            <div className="bg-rose-950/40 border border-rose-900/60 p-3.5 rounded-xl space-y-2 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold animate-pulse">
                <Clock className="w-4 h-4 text-rose-400" />
                <span>Patience Impulsive Friction Barrier</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal">Slow down your impulses! Let the core prefrontal cortex cool down. Wait to enter password:</p>
              <div className="text-xl font-mono font-bold text-rose-500 mt-1">{frictionCount}s</div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-805 p-3 rounded-xl space-y-2.5 text-left">
              <div className="flex justify-between items-center text-[10.5px] font-bold text-amber-500 border-b border-slate-800 pb-1.5">
                <span>Enter Admin Password Key</span>
                <span className="text-[9.5px] font-normal text-neutral-400">(Default: 1234)</span>
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="password"
                  placeholder="PIN code"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onPinSubmit(enteredPin);
                  }}
                  className="bg-neutral-950 border border-neutral-800 text-center font-mono font-bold text-white py-1 px-2.5 rounded text-sm w-full tracking-wider focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button 
                  onClick={() => onPinSubmit(enteredPin)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 font-bold px-3 py-1 rounded text-xs cursor-pointer"
                >
                  OK
                </button>
              </div>

              {pinError && (
                <p className="text-[9.5px] font-semibold text-rose-400 text-center mt-1">⚠️ {pinError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Encouraging statistic widget on footer */}
      <div className="text-[10px] text-neutral-500 pt-2 border-t border-slate-900">
        Focus Shield App client is securing this mobile window.
      </div>

    </div>
  );
}
