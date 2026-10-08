import React, { useState } from 'react';
import { usePrayer } from '../context/PrayerContext';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { prayerData } = usePrayer();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const islamicEvents = [
    {
      id: 1,
      hijriDate: '1 Muharram 1448 AH',
      gregorianDate: 'June 16, 2026',
      title: 'Islamic New Year (Al-Hijra)',
      category: 'Holiday',
      description: 'Commemorates the historic migration (Hijrah) of the Prophet Muhammad ﷺ and the early Muslim community from Mecca to Medina in 622 CE, marking the inception of the Islamic lunar calendar.',
      recommended: 'Reflect upon the spiritual journey of Hijrah, engage in extra personal du’a, and set intentional goals for the year ahead.'
    },
    {
      id: 2,
      hijriDate: '10 Muharram 1448 AH',
      gregorianDate: 'June 25, 2026',
      title: 'Day of Ashura',
      category: 'Sunnah Fast',
      description: 'The blessed day when Allah saved Prophet Musa (Moses) and the Children of Israel from Pharaoh and the Red Sea. Prophet Muhammad ﷺ fasted this day and instructed believers to fast Ashura along with the 9th or 11th.',
      recommended: 'Fasting on the 9th and 10th of Muharram (expiates the minor sins of the preceding year).'
    },
    {
      id: 3,
      hijriDate: '12 Rabi al-Awwal 1448 AH',
      gregorianDate: 'August 25, 2026',
      title: 'Mawlid an-Nabi (Birth of the Prophet ﷺ)',
      category: 'Commemoration',
      description: 'Commemoration of the birth of the final Prophet and Mercy to all Mankind, Muhammad ﷺ. A time for reciting salawat and studying his noble Seerah.',
      recommended: 'Recitation of abundant Durood and Salawat upon the Messenger ﷺ and feeding the poor.'
    },
    {
      id: 4,
      hijriDate: '27 Rajab 1448 AH',
      gregorianDate: 'January 6, 2027',
      title: 'Al-Isra wal-Mi\'raj (The Night Journey & Ascension)',
      category: 'Historical',
      description: 'The miraculous night journey of the Prophet ﷺ from Mecca to Jerusalem (Masjid al-Aqsa) and ascension through the seven heavens, where the five daily prayers (Salah) were gifted to the Ummah.',
      recommended: 'Performing voluntary night prayers (Tahajjud), seeking forgiveness, and cherishing the gift of Salah.'
    },
    {
      id: 5,
      hijriDate: '1 Ramadan 1448 AH',
      gregorianDate: 'February 18, 2027',
      title: 'Start of Holy Ramadan',
      category: 'Fasting Pillar',
      description: 'The sacred month of fasting, intense devotion, Quran recitation, and charity. The month in which the Quran was revealed.',
      recommended: 'Obligatory fasting from dawn to sunset, night Taraweeh prayers, daily Quran recitation, and charity.'
    },
    {
      id: 6,
      hijriDate: '27 Ramadan 1448 AH',
      gregorianDate: 'March 16, 2027',
      title: 'Laylat al-Qadr (Night of Power)',
      category: 'Most Sacred Night',
      description: 'The blessed night that is better than a thousand months (83 years of worship). The night when the Quran was first sent down.',
      recommended: 'I’tikaf in the mosque, abundant recitation of "Allahumma innaka ‘afuwwun tuhibbul ‘afwa fa’fu ‘anni", and standing in prayer throughout the night.'
    },
    {
      id: 7,
      hijriDate: '1 Shawwal 1448 AH',
      gregorianDate: 'March 20, 2027',
      title: 'Eid al-Fitr',
      category: 'Major Celebration',
      description: 'The festive day marking the joyous completion of the blessed month of Ramadan. Begins with the communal Eid prayer and paying Zakat al-Fitr.',
      recommended: 'Paying Zakat al-Fitr before the Eid prayer, wearing clean clothes, eating dates before prayer, greeting family and community.'
    },
    {
      id: 8,
      hijriDate: '9 Dhu al-Hijjah 1448 AH',
      gregorianDate: 'May 26, 2027',
      title: 'Day of Arafah',
      category: 'Peak of Hajj & Sunnah Fast',
      description: 'The climactic pinnacle of the Hajj pilgrimage where pilgrims gather on Mount Arafat. For non-pilgrims, fasting on this day expiates sins for two years.',
      recommended: 'Fasting for non-pilgrims, making extensive dua, seeking forgiveness, and glorifying Allah with Takbeer.'
    },
    {
      id: 9,
      hijriDate: '10 Dhu al-Hijjah 1448 AH',
      gregorianDate: 'May 27, 2027',
      title: 'Eid al-Adha (Feast of Sacrifice)',
      category: 'Major Celebration',
      description: 'Honors the willing devotion of Prophet Ibrahim (Abraham) to sacrifice his son in obedience to God. Involves performing Qurbani/Udhiyah sacrifice and distributing meat to the needy.',
      recommended: 'Eid prayer, Qurbani sacrifice, distributing one-third of the meat to the poor, one-third to neighbors, and one-third for the family.'
    }
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>Umm Al-Qura Lunar Calendar</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Islamic Calendar & Holy Dates
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gregorian to Hijri date conversion and essential Islamic events
          </p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl text-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">Today's Date</span>
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {prayerData?.hijri?.formatted}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Islamic Events Timeline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Key Islamic Dates & Holy Events (1448 AH)
        </h3>

        <div className="space-y-3">
          {islamicEvents.map(evt => (
            <div
              key={evt.id}
              onClick={() => setSelectedEvent(selectedEvent === evt.id ? null : evt.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedEvent === evt.id
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {evt.title}
                    </h4>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      {evt.hijriDate} · <span className="text-slate-400">{evt.gregorianDate}</span>
                    </span>
                  </div>
                </div>

                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-bold uppercase self-start sm:self-auto">
                  {evt.category}
                </span>
              </div>

              {/* Expanded details */}
              {selectedEvent === evt.id && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2 animate-fade-in">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {evt.description}
                  </p>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                    <strong className="block text-[11px] mb-0.5 text-emerald-800 dark:text-emerald-300">
                      Recommended Sunnah Actions:
                    </strong>
                    {evt.recommended}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
