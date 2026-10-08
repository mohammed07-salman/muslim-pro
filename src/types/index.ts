export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  avatarUrl?: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  calculationMethod: string;
  madhab: 'shafi' | 'hanafi';
  notificationsEnabled: boolean;
  notificationSettings: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    suhoor: boolean;
    iftar: boolean;
    dailyDua: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrayerTimesData {
  date: string;
  hijri: {
    day: number;
    month: { number: number; en: string; ar: string };
    year: number;
    designation: string;
    formatted: string;
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
  };
  rawTimings: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  currentPrayer: string;
  nextPrayer: string;
  timeToNextPrayerMs: number;
  location: {
    latitude: number;
    longitude: number;
    method: string;
    madhab: string;
  };
}

export interface QiblaData {
  qiblaBearing: number;
  distanceKm: number;
  distanceMiles: number;
  meccaCoords: { latitude: number; longitude: number };
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  audio?: string;
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

export interface Bookmark {
  id: string;
  userId: string;
  surahNumber: number;
  ayahNumber: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  arabicText: string;
  translationText: string;
  note?: string;
  createdAt: string;
}

export interface Dua {
  id: string;
  title: string;
  category: 'daily' | 'morning' | 'evening' | 'sleeping' | 'prayer' | 'travel' | 'eating' | 'protection' | 'ramadan';
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  repeatCount: number;
  isCustom?: boolean;
}

export interface TasbihSession {
  id: string;
  userId: string;
  phrase: string;
  count: number;
  target: number;
  completedAt: string;
}

export interface RamadanDayProgress {
  day: number;
  date: string;
  fasted: boolean;
  quranJuzCompleted: boolean;
  taraweehPrayed: boolean;
  notes?: string;
}

export interface RamadanProgress {
  userId: string;
  year: number;
  days: Record<number, RamadanDayProgress>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important';
  active: boolean;
  createdAt: string;
}

export interface CityOption {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  method: string;
}
