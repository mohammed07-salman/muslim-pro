import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, User, Announcement, SystemAuditLog } from './types.js';
import { initialDuas } from './duaData.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbCache: DatabaseSchema | null = null;

function getInitialData(): DatabaseSchema {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('Admin@123456', adminSalt);

  const userSalt = bcrypt.genSaltSync(10);
  const userHash = bcrypt.hashSync('User@123456', userSalt);

  const adminUser: User = {
    id: 'usr-admin-1',
    name: 'Administrator',
    email: 'admin@muslimpro.app',
    passwordHash: adminHash,
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    city: 'Makkah',
    country: 'Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    calculationMethod: 'MuslimWorldLeague',
    madhab: 'shafi',
    notificationsEnabled: true,
    notificationSettings: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      suhoor: true,
      iftar: true,
      dailyDua: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const normalUser: User = {
    id: 'usr-demo-1',
    name: 'Tariq Al-Mansoor',
    email: 'user@muslimpro.app',
    passwordHash: userHash,
    role: 'user',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    city: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    calculationMethod: 'MuslimWorldLeague',
    madhab: 'shafi',
    notificationsEnabled: true,
    notificationSettings: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      suhoor: true,
      iftar: true,
      dailyDua: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Welcome to Muslim Pro Web Edition',
      content: 'Bismillah! Experience real-time prayer calculations, full Quran reader with audio recitation, live Qibla compass, authentic Duas, and digital Tasbih.',
      priority: 'important',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ann-2',
      title: 'Ramadan 1448 AH Planner Ready',
      content: 'Access the complete 30-day Ramadan calendar, fasting tracker, and daily Quran recitation goals in the Ramadan tab.',
      priority: 'normal',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  const initialLogs: SystemAuditLog[] = [
    {
      id: 'log-1',
      action: 'SYSTEM_BOOT',
      performedBy: 'System',
      timestamp: new Date().toISOString(),
      details: 'Database initialized with authentic Islamic dataset and admin credentials.'
    }
  ];

  return {
    users: [adminUser, normalUser],
    bookmarks: [
      {
        id: 'bm-1',
        userId: 'usr-demo-1',
        surahNumber: 1,
        ayahNumber: 1,
        surahNameEnglish: 'Al-Faatiha',
        surahNameArabic: 'الفاتحة',
        arabicText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        translationText: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        note: 'Daily reflection',
        createdAt: new Date().toISOString()
      }
    ],
    quranProgress: [
      {
        userId: 'usr-demo-1',
        surahNumber: 1,
        ayahNumber: 7,
        surahName: 'Al-Faatiha',
        lastReadAt: new Date().toISOString()
      }
    ],
    duas: initialDuas,
    favorites: [
      {
        id: 'fav-1',
        userId: 'usr-demo-1',
        duaId: 'dua-morning-1',
        createdAt: new Date().toISOString()
      }
    ],
    tasbihSessions: [
      {
        id: 'ts-1',
        userId: 'usr-demo-1',
        phrase: 'Subhanallah wa bihamdihi',
        count: 100,
        target: 100,
        completedAt: new Date().toISOString()
      }
    ],
    ramadanProgress: [
      {
        userId: 'usr-demo-1',
        year: 1448,
        days: {
          1: { day: 1, date: '2026-02-18', fasted: true, quranJuzCompleted: true, taraweehPrayed: true, notes: 'Day 1 completed alhamdulillah' },
          2: { day: 2, date: '2026-02-19', fasted: true, quranJuzCompleted: true, taraweehPrayed: true }
        }
      }
    ],
    announcements: sampleAnnouncements,
    auditLogs: initialLogs
  };
}

export function loadDatabase(): DatabaseSchema {
  if (dbCache) {
    return dbCache;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw) as DatabaseSchema;
      // Ensure missing tables are populated if schema evolved
      if (!dbCache.duas || dbCache.duas.length === 0) {
        dbCache.duas = initialDuas;
      }
      return dbCache;
    }
  } catch (err) {
    console.error('Error loading database file, reinitializing default:', err);
  }

  const initial = getInitialData();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(data: DatabaseSchema): void {
  dbCache = data;
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

export function logAudit(action: string, performedBy: string, details?: string) {
  const db = loadDatabase();
  const log: SystemAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    action,
    performedBy,
    timestamp: new Date().toISOString(),
    details
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}
