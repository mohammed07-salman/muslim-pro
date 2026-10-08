import React, { useState, useEffect } from 'react';
import { usePrayer } from '../context/PrayerContext';
import { useAuth } from '../context/AuthContext';
import { RamadanProgress } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Moon,
  Sun,
  Sunset,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Heart,
  Award
} from 'lucide-react';

export const RamadanView: React.FC = () => {
  const { user, token, setAuthModalOpen } = useAuth();
  const { prayerData, city } = usePrayer();

  const [ramadanProgress, setRamadanProgress] = useState<RamadanProgress>({
    userId: '',
    year: 1448,
    days: {}
  });

  // Load user Ramadan progress
  useEffect(() => {
    if (token) {
      fetch('/api/ramadan/progress', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => data && setRamadanProgress(data))
        .catch(err => console.error('Failed to load ramadan progress:', err));
    }
  }, [token]);

  const toggleDayStatus = async (dayNum: number, field: 'fasted' | 'quranJuzCompleted' | 'taraweehPrayed') => {
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }

    const currentDay = ramadanProgress.days[dayNum] || {
      day: dayNum,
      date: `2026-02-${String(17 + dayNum).padStart(2, '0')}`,
      fasted: false,
      quranJuzCompleted: false,
      taraweehPrayed: false
    };

    const updatedVal = !currentDay[field];

    if (field === 'fasted' && updatedVal) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    const updatedDay = {
      ...currentDay,
      [field]: updatedVal
    };

    setRamadanProgress(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [dayNum]: updatedDay
      }
    }));

    try {
      await fetch('/api/ramadan/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          day: dayNum,
          ...updatedDay
        })
      });
    } catch (err) {
      console.error('Failed to update ramadan day:', err);
    }
  };

  const totalFasted = Object.values(ramadanProgress.days).filter(d => d.fasted).length;
  const totalJuz = Object.values(ramadanProgress.days).filter(d => d.quranJuzCompleted).length;

  const ramadanDuas = [
    {
      title: 'Dua When Breaking the Fast (Iftar)',
      arabic: 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
      transliteration: "Dhahabadh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha'Allah.",
      translation: 'The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.',
      ref: 'Sunan Abi Dawud 2357'
    },
    {
      title: 'Intention for Fasting (Suhoor / Niyyah)',
      arabic: 'وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
      transliteration: 'Wa bisawmi ghadin nawaytu min shahri Ramadan.',
      translation: 'I intend to keep the fast tomorrow in the month of Ramadan.',
      ref: 'Sunnah Tradition'
    },
    {
      title: 'Dua for Laylat al-Qadr (Night of Decree)',
      arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      transliteration: "Allahumma innaka 'Afuwwun tuhibbul-'afwa fa'fu 'anni.",
      translation: 'O Allah, You are Most Forgiving, and You love forgiveness; so forgive me.',
      ref: 'Jami` at-Tirmidhi 3513'
    }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Ramadan Mubarak 1448 AH</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Ramadan Hub & Fasting Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete daily Imsakiah schedule, fasting goals and blessed supplications for {city}
          </p>
        </div>

        {/* Total fasts completed badge */}
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl">
          <Award className="w-5 h-5 text-amber-500" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">
              {totalFasted} / 30 Days Fasted
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              {totalJuz} / 30 Quran Juz Completed
            </span>
          </div>
        </div>
      </div>

      {/* Suhoor & Iftar Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/40 rounded-3xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-widest">
              Suhoor (Imsak)
            </span>
            <Moon className="w-5 h-5 text-indigo-300" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {prayerData?.timings.Imsak || '04:35 AM'}
          </div>
          <p className="text-xs text-indigo-200/80 mt-1">
            Stop eating 10 minutes prior to Fajr ({prayerData?.timings.Fajr})
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-950 to-emerald-950 border border-amber-900/40 rounded-3xl text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
              Iftar (Maghrib)
            </span>
            <Sunset className="w-5 h-5 text-amber-300" />
          </div>
          <div className="text-3xl font-bold font-mono text-white">
            {prayerData?.timings.Maghrib || '06:15 PM'}
          </div>
          <p className="text-xs text-amber-200/80 mt-1">
            Time to break the fast at sunset adhan
          </p>
        </div>
      </div>

      {/* Ramadan Duas Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Essential Ramadan Supplications
        </h3>

        <div className="space-y-3">
          {ramadanDuas.map((dua, i) => (
            <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                {dua.title}
              </span>
              <p className="font-arabic text-xl text-right text-slate-900 dark:text-white leading-loose font-normal">
                {dua.arabic}
              </p>
              <p className="text-xs text-slate-500 italic font-mono">
                {dua.transliteration}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-serif">
                "{dua.translation}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Ramadan Tracker Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              30-Day Fasting & Quran Progress Calendar
            </h3>
            <p className="text-xs text-slate-400">
              Track each day's fast, Juz recitation, and Taraweeh prayers
            </p>
          </div>

          {!user && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
            >
              Sign in to save progress →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 30 }, (_, idx) => {
            const dayNum = idx + 1;
            const status = ramadanProgress.days[dayNum] || {
              day: dayNum,
              date: `Day ${dayNum}`,
              fasted: false,
              quranJuzCompleted: false,
              taraweehPrayed: false
            };

            return (
              <div
                key={dayNum}
                className={`p-3.5 rounded-2xl border transition-all ${
                  status.fasted
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Day {dayNum} of Ramadan
                  </span>
                  {status.fasted && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Fasted ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => toggleDayStatus(dayNum, 'fasted')}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      status.fasted
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    Fasting
                  </button>
                  <button
                    onClick={() => toggleDayStatus(dayNum, 'quranJuzCompleted')}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                      status.quranJuzCompleted
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                    title="Juz completed"
                  >
                    Juz {dayNum}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
