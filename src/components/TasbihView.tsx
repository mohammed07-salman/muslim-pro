import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TasbihSession } from '../types';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  History,
  Trash2,
  Award,
  Check
} from 'lucide-react';

export const TasbihView: React.FC = () => {
  const { user, token, setAuthModalOpen } = useAuth();

  const dhikrPresets = [
    { arabic: 'سُبْحَانَ اللَّهِ', transliteration: 'SubhanAllah', meaning: 'Glory be to Allah', defaultTarget: 33 },
    { arabic: 'الْحَمْدُ لِلَّهِ', transliteration: 'Alhamdulillah', meaning: 'All praise is due to Allah', defaultTarget: 33 },
    { arabic: 'اللَّهُ أَكْبَرُ', transliteration: 'Allahu Akbar', meaning: 'Allah is the Greatest', defaultTarget: 34 },
    { arabic: 'أَسْتَغْفِرُ اللَّهَ', transliteration: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah', defaultTarget: 100 },
    { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', transliteration: 'La ilaha illallah', meaning: 'There is no god but Allah', defaultTarget: 100 },
    { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'SubhanAllahi wa bihamdihi', meaning: 'Glory and praise be to Allah', defaultTarget: 100 },
    { arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allahumma Salli ala Muhammad', meaning: 'Send blessings upon the Prophet', defaultTarget: 100 }
  ];

  const [selectedDhikr, setSelectedDhikr] = useState(dhikrPresets[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [totalTaps, setTotalTaps] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [history, setHistory] = useState<TasbihSession[]>([]);
  const [customTargetInput, setCustomTargetInput] = useState<string>('');

  // Load user tasbih history from backend
  useEffect(() => {
    if (token) {
      fetch('/api/tasbih/history', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setHistory(data))
        .catch(err => console.error('Error fetching tasbih history:', err));
    }
  }, [token]);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setTotalTaps(prev => prev + 1);

    // Haptic feedback
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }

    playClickSound();

    // Reached target
    if (nextCount === target) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Save to backend if user is authenticated
      if (token) {
        fetch('/api/tasbih/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            phrase: selectedDhikr.transliteration,
            count: nextCount,
            target
          })
        })
          .then(res => res.json())
          .then(newSession => {
            setHistory(prev => [newSession, ...prev]);
          })
          .catch(err => console.error('Failed to save tasbih session:', err));
      }
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const deleteSession = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/tasbih/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const progressPercent = Math.min(100, (count / target) * 100);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <RotateCcw className="w-4 h-4" />
            <span>Digital Sebha & Remembrance Counter</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Digital Tasbih
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Count daily praises of Allah with haptic feedback, custom targets and persistent logs
          </p>
        </div>

        {/* Sound & Vibration toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                : 'border-slate-200 dark:border-slate-800 text-slate-400'
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Counter Stage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center">
        
        {/* Preset Selector */}
        <div className="w-full max-w-md mb-6">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 text-center">
            Choose Dhikr (الذكر)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dhikrPresets.slice(0, 6).map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSelectedDhikr(item);
                  setTarget(item.defaultTarget);
                  setCount(0);
                }}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedDhikr.transliteration === item.transliteration
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                }`}
              >
                <span className="font-arabic text-sm block leading-tight font-bold">{item.arabic}</span>
                <span className="text-[10px] text-slate-400 block truncate">{item.transliteration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Dhikr Display */}
        <div className="text-center my-3 max-w-md">
          <p className="font-arabic text-3xl sm:text-4xl text-emerald-800 dark:text-emerald-400 font-bold mb-1">
            {selectedDhikr.arabic}
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {selectedDhikr.transliteration}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 font-serif italic">
            "{selectedDhikr.meaning}"
          </p>
        </div>

        {/* Target Buttons */}
        <div className="flex items-center gap-2 my-4">
          <span className="text-xs text-slate-400 font-medium">Target:</span>
          {[33, 99, 100, 1000].map(t => (
            <button
              key={t}
              onClick={() => {
                setTarget(t);
                setCount(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                target === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Giant Interactive Tap Button */}
        <div className="relative my-6">
          {/* Progress ring around button */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-amber-500/20 flex items-center justify-center">
            
            <button
              onClick={handleTap}
              className="w-full h-full rounded-full bg-gradient-to-b from-emerald-600 to-teal-700 active:scale-95 text-white shadow-xl shadow-emerald-700/30 flex flex-col items-center justify-center transition-all cursor-pointer group hover:from-emerald-500 hover:to-teal-600 ring-8 ring-emerald-500/10"
            >
              <span className="text-[11px] uppercase tracking-widest text-emerald-200 font-bold">
                Tap to Count
              </span>
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight my-1 drop-shadow-sm">
                {count}
              </span>
              <span className="text-xs text-emerald-200 font-mono">
                Target: {target} ({Math.round(progressPercent)}%)
              </span>
            </button>
          </div>
        </div>

        {/* Reset & Session Stats */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Counter</span>
          </button>

          <span className="text-xs text-slate-400">
            Total taps today: <strong className="text-slate-700 dark:text-slate-200 font-mono">{totalTaps}</strong>
          </span>
        </div>
      </div>

      {/* History Log Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Saved Tasbih History</span>
          </div>

          {!user && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
            >
              Sign in to sync history →
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map(session => (
              <div key={session.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {session.phrase}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(session.completedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {session.count} / {session.target}
                  </span>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-6">
            Complete a full target round to automatically log your Tasbih session.
          </p>
        )}
      </div>
    </div>
  );
};
