export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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

export interface QuranProgress {
  userId: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  lastReadAt: string;
}

export interface DuaItem {
  id: string;
  title: string;
  category: 'daily' | 'morning' | 'evening' | 'sleeping' | 'prayer' | 'travel' | 'eating' | 'protection' | 'ramadan';
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  repeatCount: number;
  isCustom?: boolean;
  createdAt: string;
}

export interface FavoriteDua {
  id: string;
  userId: string;
  duaId: string;
  createdAt: string;
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
  day: number; // 1 to 30
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

export interface SystemAuditLog {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface DatabaseSchema {
  users: User[];
  bookmarks: Bookmark[];
  quranProgress: QuranProgress[];
  duas: DuaItem[];
  favorites: FavoriteDua[];
  tasbihSessions: TasbihSession[];
  ramadanProgress: RamadanProgress[];
  announcements: Announcement[];
  auditLogs: SystemAuditLog[];
}
