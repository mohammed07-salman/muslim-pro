import React, { useState } from 'react';
import { usePrayer } from '../context/PrayerContext';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  MapPin,
  Sliders,
  Sunrise,
  Sun,
  Sunset,
  Volume2,
  VolumeX,
  Calendar,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface PrayerTimesViewProps {
  onOpenCitySelector: () => void;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({ onOpenCitySelector }) => {
  const { user } = useAuth();
  const {
    prayerData,
    loading,
    city,
    country,
    calculationMethod,
    setCalculationMethod,
    madhab,
    setMadhab,
    formattedCountdown,
    refetchPrayerTimes
  } = usePrayer();

  const [isPlayingAdhan, setIsPlayingAdhan] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [viewMode, setViewMode] = useState<'today' | 'weekly'>('today');

  const methods = [
    { id: 'MuslimWorldLeague', name: 'Muslim World League (MWL)', desc: 'Standard across Europe & parts of Asia' },
    { id: 'NorthAmerica', name: 'Islamic Society of North America (ISNA)', desc: 'Standard across USA & Canada' },
    { id: 'Egyptian', name: 'Egyptian General Authority of Survey', desc: 'Standard across Egypt & Arab world' },
    { id: 'UmmAlQura', name: 'Umm Al-Qura University, Makkah', desc: 'Standard in Saudi Arabia & Gulf' },
    { id: 'Karachi', name: 'University of Islamic Sciences, Karachi', desc: 'Standard across Pakistan, India, Bangladesh' },
    { id: 'Dubai', name: 'Dubai / UAE Awqaf', desc: 'Standard in UAE' },
    { id: 'Turkey', name: 'Diyanet İşleri Başkanlığı, Turkey', desc: 'Standard in Turkey' },
    { id: 'Singapore', name: 'MUIS Singapore / Malaysia', desc: 'Southeast Asia' },
    { id: 'Tehran', name: 'Institute of Geophysics, Tehran', desc: 'Standard in Iran' }
  ];

  const prayers = prayerData ? [
    { name: 'Fajr', time: prayerData.timings.Fajr, icon: Sunrise, desc: 'Dawn Prayer (Pre-sunrise)' },
    { name: 'Sunrise', time: prayerData.timings.Sunrise, icon: Sunrise, desc: 'Solar sunrise (End of Fajr)' },
    { name: 'Dhuhr', time: prayerData.timings.Dhuhr, icon: Sun, desc: 'Midday Prayer (Post-zenith)' },
    { name: 'Asr', time: prayerData.timings.Asr, icon: Sun, desc: 'Afternoon Prayer' },
    { name: 'Maghrib', time: prayerData.timings.Maghrib, icon: Sunset, desc: 'Sunset Prayer (Iftar time)' },
    { name: 'Isha', time: prayerData.timings.Isha, icon: Clock, desc: 'Night Prayer' }
  ] : [];

  const toggleAdhan = () => {
    if (isPlayingAdhan && audioElement) {
      audioElement.pause();
      setIsPlayingAdhan(false);
    } else {
      const audio = new Audio('https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3');
      audio.onended = () => setIsPlayingAdhan(false);
      audio.play().catch(e => console.warn('Audio restrict:', e));
      setAudioElement(audio);
      setIsPlayingAdhan(true);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header & Location Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Clock className="w-4 h-4" />
            <span>Astronomical Prayer Calculations</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Prayer Times Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {prayerData?.hijri?.formatted} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCitySelector}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{city}, {country}</span>
          </button>

          <button
            onClick={refetchPrayerTimes}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh calculations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Next Prayer Spotlight Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-widest">
              Upcoming Prayer
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1">
              {prayerData?.nextPrayer || 'Fajr'}
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              Currently in: <span className="font-semibold text-white">{prayerData?.currentPrayer || 'Isha'}</span> window
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-emerald-300 uppercase tracking-wider block">Time Remaining</span>
            <div className="text-3xl sm:text-4xl font-mono font-bold mt-1 text-white">
              {loading ? '--:--:--' : formattedCountdown}
            </div>
            <button
              onClick={toggleAdhan}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-700/80 rounded-xl text-xs font-medium text-emerald-100 transition-colors cursor-pointer border border-emerald-600/40"
            >
              {isPlayingAdhan ? <VolumeX className="w-3.5 h-3.5 text-amber-300" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingAdhan ? 'Stop Adhan' : 'Listen to Adhan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle: Today vs Weekly */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Today's Prayers
          </button>
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Weekly Schedule
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {madhab === 'hanafi' ? 'Hanafi Asr' : 'Standard Shafi/Maliki/Hanbali Asr'}
        </span>
      </div>

      {/* Prayers List Cards */}
      {viewMode === 'today' ? (
        <div className="space-y-2.5">
          {prayers.map((p, idx) => {
            const isNext = prayerData?.nextPrayer === p.name;
            const isCurrent = prayerData?.currentPrayer === p.name;
            const Icon = p.icon;

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isNext
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-xs'
                    : isCurrent
                    ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-400/80'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isNext
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</span>
                      {isNext && (
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                          Next
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{p.desc}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                    {p.time}
                  </span>
                  <span className="block text-[11px] text-slate-400">Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Weekly Schedule Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 overflow-x-auto shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Day</th>
                <th className="py-2.5 px-3">Fajr</th>
                <th className="py-2.5 px-3">Sunrise</th>
                <th className="py-2.5 px-3">Dhuhr</th>
                <th className="py-2.5 px-3">Asr</th>
                <th className="py-2.5 px-3">Maghrib</th>
                <th className="py-2.5 px-3">Isha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map((d, index) => (
                <tr key={index} className={index === 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold' : ''}>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{d}</td>
                  <td className="py-2.5 px-3 font-mono">{prayerData?.timings.Fajr}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{prayerData?.timings.Sunrise}</td>
                  <td className="py-2.5 px-3 font-mono">{prayerData?.timings.Dhuhr}</td>
                  <td className="py-2.5 px-3 font-mono">{prayerData?.timings.Asr}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">{prayerData?.timings.Maghrib}</td>
                  <td className="py-2.5 px-3 font-mono">{prayerData?.timings.Isha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calculation Settings Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Calculation Method & Madhab Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Calculation Authority
            </label>
            <select
              value={calculationMethod}
              onChange={e => setCalculationMethod(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {methods.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Controls Fajr and Isha astronomical sun depression angles.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Juristic Method (Madhab for Asr)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMadhab('shafi')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  madhab === 'shafi'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {madhab === 'shafi' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                Standard (Shafi'i)
              </button>
              <button
                type="button"
                onClick={() => setMadhab('hanafi')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  madhab === 'hanafi'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {madhab === 'hanafi' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                Hanafi (Shadow x2)
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Shafi'i/Maliki/Hanbali calculates Asr at 1x shadow; Hanafi at 2x shadow.
            </p>
          </div>
        </div>

        {user && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Your preferences are automatically saved to your profile in the database.
          </p>
        )}
      </div>
    </div>
  );
};
