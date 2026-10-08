import React, { useState, useEffect } from 'react';
import { usePrayer } from '../context/PrayerContext';
import { useAuth } from '../context/AuthContext';
import { Announcement } from '../types';
import {
  Clock,
  Compass,
  BookOpen,
  Heart,
  RotateCcw,
  Sparkles,
  Calendar,
  Volume2,
  VolumeX,
  MapPin,
  ChevronRight,
  Sun,
  Sunset,
  Sunrise,
  Share2,
  Check,
  Info
} from 'lucide-react';

interface HomeDashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenCitySelector: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ setActiveTab, onOpenCitySelector }) => {
  const { user, setAuthModalOpen } = useAuth();
  const { prayerData, city, country, formattedCountdown, loading } = usePrayer();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [copiedVerse, setCopiedVerse] = useState(false);

  // Fetch announcements
  useEffect(() => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error('Error fetching announcements:', err));
  }, []);

  const toggleAdhan = () => {
    if (isPlayingAdhan && audioElement) {
      audioElement.pause();
      setIsPlayingAdhan(false);
    } else {
      // High quality authentic Adhan audio stream
      const audio = new Audio('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3');
      audio.onended = () => setIsPlayingAdhan(false);
      audio.play().catch(e => console.warn('Audio play restricted:', e));
      setAudioElement(audio);
      setIsPlayingAdhan(true);
    }
  };

  const todayGregorian = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const dailyVerse = {
    arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    surah: "Surah Al-Baqarah 2:186"
  };

  const handleCopyVerse = () => {
    navigator.clipboard.writeText(`${dailyVerse.arabic}\n"${dailyVerse.translation}"\n- ${dailyVerse.surah}`);
    setCopiedVerse(true);
    setTimeout(() => setCopiedVerse(false), 2000);
  };

  const prayersList = prayerData ? [
    { name: 'Fajr', time: prayerData.timings.Fajr, icon: Sunrise },
    { name: 'Sunrise', time: prayerData.timings.Sunrise, icon: Sun },
    { name: 'Dhuhr', time: prayerData.timings.Dhuhr, icon: Sun },
    { name: 'Asr', time: prayerData.timings.Asr, icon: Sun },
    { name: 'Maghrib', time: prayerData.timings.Maghrib, icon: Sunset },
    { name: 'Isha', time: prayerData.timings.Isha, icon: Clock }
  ] : [];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Active System Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-2">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className={`p-3.5 rounded-2xl flex items-start gap-3 text-xs border ${
                ann.priority === 'important'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1">
                <span className="font-bold">{ann.title}: </span>
                <span>{ann.content}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Islamic Banner & Live Prayer Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl border border-emerald-800/40">
        
        {/* Subtle geometric background pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          
          {/* Header Row: Date & Location */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-800/50">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
                <span>Islamic Calendar</span>
                <span>·</span>
                <span>{prayerData?.hijri?.formatted || '1448 AH'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                {todayGregorian}
              </h2>
            </div>

            <button
              onClick={onOpenCitySelector}
              className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-700/50 text-xs font-medium text-emerald-100 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{city}, {country}</span>
              <span className="text-[10px] text-emerald-300 underline">Change</span>
            </button>
          </div>

          {/* Centerpiece: Next Prayer Countdown */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-700/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next Prayer: {prayerData?.nextPrayer || 'Fajr'}</span>
              </div>

              <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-white drop-shadow-sm">
                {loading ? '--:--:--' : formattedCountdown}
              </div>

              <p className="text-xs text-emerald-300/90 mt-2">
                Current active prayer period:{' '}
                <strong className="text-white font-semibold">{prayerData?.currentPrayer || 'None'}</strong>
              </p>
            </div>

            {/* Quick Action in Hero: Listen to Adhan / Fasting info */}
            <div className="bg-emerald-900/60 border border-emerald-700/40 rounded-2xl p-4 flex flex-col justify-between gap-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 block">Today's Fasting Window</span>
                  <span className="text-sm font-semibold text-white">
                    Suhoor (Imsak) {prayerData?.timings.Imsak || '--'} · Iftar {prayerData?.timings.Maghrib || '--'}
                  </span>
                </div>
                <button
                  onClick={toggleAdhan}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-colors flex items-center gap-2 text-xs font-medium cursor-pointer"
                  title="Play/Stop Recitation"
                >
                  {isPlayingAdhan ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isPlayingAdhan ? 'Pause' : 'Adhan'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-800/60 text-xs">
                <span className="text-emerald-300">Method: {prayerData?.location.method || 'MWL'}</span>
                <button
                  onClick={() => setActiveTab('prayers')}
                  className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1 cursor-pointer"
                >
                  Full Schedule <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Prayer Timeline Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Today's Prayer Schedule
          </h3>
          <button
            onClick={() => setActiveTab('prayers')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Adjust Calculation Settings →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {prayersList.map((p, idx) => {
            const isNext = prayerData?.nextPrayer === p.name;
            const isCurrent = prayerData?.currentPrayer === p.name;
            const Icon = p.icon;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isNext
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${isNext ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {p.name}
                  </span>
                  <Icon className={`w-4 h-4 ${isNext ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`} />
                </div>
                <div className="text-lg font-bold font-mono tracking-tight">
                  {p.time || '--:--'}
                </div>
                <div className="mt-1 text-[10px] font-medium">
                  {isNext ? (
                    <span className="text-amber-300 font-bold">Upcoming</span>
                  ) : isCurrent ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Current</span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">Daily</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Grid (Islamic Core Features) */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 px-1">
          Explore Islamic Features
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div
            onClick={() => setActiveTab('quran')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">The Holy Quran</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">114 Surahs with translation & audio</p>
          </div>

          <div
            onClick={() => setActiveTab('qibla')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Qibla Direction</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mecca compass with gyro sensors</p>
          </div>

          <div
            onClick={() => setActiveTab('duas')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Duas & Azkar</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Authentic morning & evening adhkar</p>
          </div>

          <div
            onClick={() => setActiveTab('tasbih')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Digital Tasbih</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tap counter with vibration & target history</p>
          </div>

          <div
            onClick={() => setActiveTab('ramadan')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Ramadan Planner</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">30-day fasting calendar & Iftar timer</p>
          </div>

          <div
            onClick={() => setActiveTab('calendar')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Islamic Calendar</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hijri date converter & holy dates</p>
          </div>

          <div
            onClick={() => setActiveTab('prayers')}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Prayer Calculation</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">MWL, ISNA, Makkah, Hanafi/Shafi</p>
          </div>

          <div
            onClick={() => {
              if (user) {
                setActiveTab('profile');
              } else {
                setAuthModalOpen(true);
              }
            }}
            className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 rounded-2xl transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {user ? 'My Saved Journal' : 'Sync Account'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {user ? 'Bookmarks & Tasbih Logs' : 'Sign in to save progress'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Verse of the Day Card */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <span>Ayah of the Day</span>
          </div>
          <button
            onClick={handleCopyVerse}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            {copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedVerse ? 'Copied!' : 'Share / Copy'}</span>
          </button>
        </div>

        <div className="text-right py-2">
          <p className="font-arabic text-2xl sm:text-3xl text-slate-900 dark:text-white leading-loose font-normal">
            {dailyVerse.arabic}
          </p>
        </div>

        <div className="pt-2">
          <p className="text-sm text-slate-700 dark:text-slate-300 italic font-serif">
            "{dailyVerse.translation}"
          </p>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2 block">
            — {dailyVerse.surah}
          </span>
        </div>
      </div>
    </div>
  );
};
