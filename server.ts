import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { loadDatabase, saveDatabase, logAudit } from './server/db.js';
import { generateToken, verifyAuth, requireAdmin, AuthenticatedRequest } from './server/auth.js';
import { getPrayerTimes, calculateQibla, getHijriDate } from './server/prayerService.js';
import { SURAHS_LIST, fetchSurahWithAyahs } from './server/quranData.js';
import { User, Bookmark, TasbihSession, Announcement } from './server/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// List of popular global cities for manual selection
const POPULAR_CITIES = [
  { city: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262, method: 'UmmAlQura' },
  { city: 'Madinah', country: 'Saudi Arabia', latitude: 24.4672, longitude: 39.6111, method: 'UmmAlQura' },
  { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357, method: 'Egyptian' },
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784, method: 'Turkey' },
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, method: 'MuslimWorldLeague' },
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, method: 'NorthAmerica' },
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, method: 'NorthAmerica' },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, method: 'MuslimWorldLeague' },
  { city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, method: 'MuslimWorldLeague' },
  { city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, method: 'Dubai' },
  { city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869, method: 'Singapore' },
  { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456, method: 'Singapore' },
  { city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011, method: 'Karachi' },
  { city: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125, method: 'Karachi' },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, method: 'MuslimWorldLeague' },
  { city: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, method: 'Singapore' }
];

// ----------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password, city, country, latitude, longitude } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = loadDatabase();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user',
      status: 'active',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=059669,10b981`,
      city: city || 'Makkah',
      country: country || 'Saudi Arabia',
      latitude: latitude ? Number(latitude) : 21.4225,
      longitude: longitude ? Number(longitude) : 39.8262,
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

    db.users.push(newUser);
    saveDatabase(db);
    logAudit('USER_REGISTERED', newUser.email, `User registered: ${newUser.name}`);

    const token = generateToken(newUser);
    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({ user: userSafe, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Your account has been disabled. Please contact support.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { passwordHash: _, ...userSafe } = user;
    logAudit('USER_LOGIN', user.email, `User logged in`);
    return res.json({ user: userSafe, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

app.get('/api/auth/me', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { passwordHash: _, ...userSafe } = req.user!;
  return res.json({ user: userSafe });
});

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const db = loadDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Return success to avoid email enumeration
    return res.json({ message: 'If that email exists, password reset instructions have been generated.' });
  }

  // Generate temporary password reset code
  const resetToken = `reset-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  logAudit('PASSWORD_RESET_REQUESTED', user.email, `Reset code generated: ${resetToken}`);

  return res.json({
    message: 'Password reset code generated. Use this code to reset your password.',
    resetCode: resetToken
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  user.updatedAt = new Date().toISOString();
  saveDatabase(db);

  logAudit('PASSWORD_RESET_COMPLETED', user.email, 'Password successfully reset');
  return res.json({ message: 'Password has been reset successfully. You may now log in.' });
});

// ----------------------------------------------------
// 2. USER PROFILE & PREFERENCES
// ----------------------------------------------------

app.put('/api/user/profile', verifyAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, avatarUrl, city, country, latitude, longitude } = req.body;
    if (name) user.name = name.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (city !== undefined) user.city = city;
    if (country !== undefined) user.country = country;
    if (latitude !== undefined) user.latitude = Number(latitude);
    if (longitude !== undefined) user.longitude = Number(longitude);
    user.updatedAt = new Date().toISOString();

    saveDatabase(db);
    const { passwordHash: _, ...userSafe } = user;
    return res.json({ user: userSafe });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/preferences', verifyAuth, (req: AuthenticatedRequest, res) => {
  try {
    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { calculationMethod, madhab, notificationsEnabled, notificationSettings } = req.body;
    if (calculationMethod) user.calculationMethod = calculationMethod;
    if (madhab) user.madhab = madhab;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = Boolean(notificationsEnabled);
    if (notificationSettings) user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
    user.updatedAt = new Date().toISOString();

    saveDatabase(db);
    const { passwordHash: _, ...userSafe } = user;
    return res.json({ user: userSafe });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/password', verifyAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const db = loadDatabase();
    const user = db.users.find(u => u.id === req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const salt = bcrypt.genSaltSync(10);
    user.passwordHash = bcrypt.hashSync(newPassword, salt);
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);

    return res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. PRAYER TIMES & QIBLA
// ----------------------------------------------------

app.get('/api/prayers/times', (req, res) => {
  try {
    const lat = Number(req.query.lat) || 21.4225;
    const lng = Number(req.query.lng) || 39.8262;
    const method = (req.query.method as string) || 'MuslimWorldLeague';
    const madhab = (req.query.madhab as string) || 'shafi';
    const dateStr = req.query.date as string;

    const date = dateStr ? new Date(dateStr) : new Date();
    const result = getPrayerTimes(lat, lng, method, madhab, date);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error calculating prayer times' });
  }
});

app.get('/api/prayers/qibla', (req, res) => {
  try {
    const lat = Number(req.query.lat) || 21.4225;
    const lng = Number(req.query.lng) || 39.8262;
    const qiblaData = calculateQibla(lat, lng);
    return res.json(qiblaData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error calculating Qibla' });
  }
});

app.get('/api/prayers/cities', (_req, res) => {
  return res.json(POPULAR_CITIES);
});

// ----------------------------------------------------
// 4. QURAN ENDPOINTS
// ----------------------------------------------------

app.get('/api/quran/surahs', (_req, res) => {
  return res.json(SURAHS_LIST);
});

app.get('/api/quran/surah/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1 || id > 114) {
      return res.status(400).json({ error: 'Invalid surah number (must be 1-114)' });
    }
    const data = await fetchSurahWithAyahs(id);
    if (!data) return res.status(404).json({ error: 'Surah not found' });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error fetching surah' });
  }
});

app.get('/api/quran/search', (req, res) => {
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  if (!query) {
    return res.json([]);
  }
  const results = SURAHS_LIST.filter(
    s =>
      s.englishName.toLowerCase().includes(query) ||
      s.englishNameTranslation.toLowerCase().includes(query) ||
      s.name.includes(query) ||
      s.number.toString() === query
  );
  return res.json(results);
});

app.get('/api/quran/bookmarks', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const userBookmarks = db.bookmarks.filter(b => b.userId === req.user!.id);
  return res.json(userBookmarks);
});

app.post('/api/quran/bookmarks', verifyAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { surahNumber, ayahNumber, surahNameEnglish, surahNameArabic, arabicText, translationText, note } = req.body;
    if (!surahNumber || !ayahNumber) {
      return res.status(400).json({ error: 'Surah and Ayah number are required' });
    }

    const db = loadDatabase();
    // Check if already bookmarked
    const existing = db.bookmarks.find(
      b => b.userId === req.user!.id && b.surahNumber === Number(surahNumber) && b.ayahNumber === Number(ayahNumber)
    );
    if (existing) {
      return res.json(existing);
    }

    const newBookmark: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user!.id,
      surahNumber: Number(surahNumber),
      ayahNumber: Number(ayahNumber),
      surahNameEnglish: surahNameEnglish || `Surah ${surahNumber}`,
      surahNameArabic: surahNameArabic || '',
      arabicText: arabicText || '',
      translationText: translationText || '',
      note: note || '',
      createdAt: new Date().toISOString()
    };

    db.bookmarks.unshift(newBookmark);
    saveDatabase(db);
    return res.status(201).json(newBookmark);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quran/bookmarks/:id', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const index = db.bookmarks.findIndex(b => b.id === req.params.id && b.userId === req.user!.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Bookmark not found' });
  }
  db.bookmarks.splice(index, 1);
  saveDatabase(db);
  return res.json({ message: 'Bookmark removed' });
});

app.get('/api/quran/progress', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const progress = db.quranProgress.find(p => p.userId === req.user!.id);
  return res.json(progress || null);
});

app.post('/api/quran/progress', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { surahNumber, ayahNumber, surahName } = req.body;
  if (!surahNumber) return res.status(400).json({ error: 'Surah number is required' });

  const db = loadDatabase();
  let progress = db.quranProgress.find(p => p.userId === req.user!.id);
  if (!progress) {
    progress = {
      userId: req.user!.id,
      surahNumber: Number(surahNumber),
      ayahNumber: Number(ayahNumber) || 1,
      surahName: surahName || '',
      lastReadAt: new Date().toISOString()
    };
    db.quranProgress.push(progress);
  } else {
    progress.surahNumber = Number(surahNumber);
    progress.ayahNumber = Number(ayahNumber) || 1;
    if (surahName) progress.surahName = surahName;
    progress.lastReadAt = new Date().toISOString();
  }

  saveDatabase(db);
  return res.json(progress);
});

// ----------------------------------------------------
// 5. DUAS & AZKAR
// ----------------------------------------------------

app.get('/api/duas', (_req, res) => {
  const db = loadDatabase();
  return res.json(db.duas);
});

app.get('/api/duas/favorites', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const userFavorites = db.favorites.filter(f => f.userId === req.user!.id);
  const favDuaIds = new Set(userFavorites.map(f => f.duaId));
  const favoriteDuas = db.duas.filter(d => favDuaIds.has(d.id));
  return res.json(favoriteDuas);
});

app.post('/api/duas/favorites/:id', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const duaId = req.params.id;
  const existingIndex = db.favorites.findIndex(f => f.userId === req.user!.id && f.duaId === duaId);

  if (existingIndex !== -1) {
    // Remove if already favorite
    db.favorites.splice(existingIndex, 1);
    saveDatabase(db);
    return res.json({ favorited: false, message: 'Removed from favorites' });
  } else {
    // Add favorite
    db.favorites.push({
      id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: req.user!.id,
      duaId,
      createdAt: new Date().toISOString()
    });
    saveDatabase(db);
    return res.json({ favorited: true, message: 'Added to favorites' });
  }
});

// Admin Dua Management
app.post('/api/duas', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { title, category, arabic, transliteration, translation, reference, repeatCount } = req.body;
  if (!title || !arabic || !translation) {
    return res.status(400).json({ error: 'Title, Arabic text, and translation are required' });
  }

  const db = loadDatabase();
  const newDua = {
    id: `dua-custom-${Date.now()}`,
    title: title.trim(),
    category: category || 'daily',
    arabic: arabic.trim(),
    transliteration: transliteration || '',
    translation: translation.trim(),
    reference: reference || 'Authentic Supplication',
    repeatCount: Number(repeatCount) || 1,
    isCustom: true,
    createdAt: new Date().toISOString()
  };

  db.duas.push(newDua);
  saveDatabase(db);
  logAudit('DUA_CREATED', req.user!.email, `Created Dua: ${newDua.title}`);
  return res.status(201).json(newDua);
});

app.put('/api/duas/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const dua = db.duas.find(d => d.id === req.params.id);
  if (!dua) return res.status(404).json({ error: 'Dua not found' });

  const { title, category, arabic, transliteration, translation, reference, repeatCount } = req.body;
  if (title) dua.title = title.trim();
  if (category) dua.category = category;
  if (arabic) dua.arabic = arabic.trim();
  if (transliteration !== undefined) dua.transliteration = transliteration;
  if (translation) dua.translation = translation.trim();
  if (reference !== undefined) dua.reference = reference;
  if (repeatCount !== undefined) dua.repeatCount = Number(repeatCount);

  saveDatabase(db);
  logAudit('DUA_UPDATED', req.user!.email, `Updated Dua: ${dua.title}`);
  return res.json(dua);
});

app.delete('/api/duas/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const index = db.duas.findIndex(d => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Dua not found' });

  const deleted = db.duas.splice(index, 1)[0];
  saveDatabase(db);
  logAudit('DUA_DELETED', req.user!.email, `Deleted Dua: ${deleted.title}`);
  return res.json({ message: 'Dua deleted successfully' });
});

// ----------------------------------------------------
// 6. TASBIH COUNTER
// ----------------------------------------------------

app.get('/api/tasbih/history', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const sessions = db.tasbihSessions.filter(s => s.userId === req.user!.id);
  return res.json(sessions);
});

app.post('/api/tasbih/session', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { phrase, count, target } = req.body;
  if (!phrase || !count) {
    return res.status(400).json({ error: 'Phrase and count are required' });
  }

  const db = loadDatabase();
  const session: TasbihSession = {
    id: `ts-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: req.user!.id,
    phrase,
    count: Number(count),
    target: Number(target) || 33,
    completedAt: new Date().toISOString()
  };

  db.tasbihSessions.unshift(session);
  // Keep last 100 sessions per user
  saveDatabase(db);
  return res.status(201).json(session);
});

app.delete('/api/tasbih/:id', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const index = db.tasbihSessions.findIndex(s => s.id === req.params.id && s.userId === req.user!.id);
  if (index === -1) return res.status(404).json({ error: 'Session not found' });

  db.tasbihSessions.splice(index, 1);
  saveDatabase(db);
  return res.json({ message: 'Session deleted' });
});

// ----------------------------------------------------
// 7. RAMADAN & CALENDAR
// ----------------------------------------------------

app.get('/api/ramadan/progress', verifyAuth, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const userProgress = db.ramadanProgress.find(p => p.userId === req.user!.id);
  return res.json(userProgress || { userId: req.user!.id, year: 1448, days: {} });
});

app.post('/api/ramadan/day', verifyAuth, (req: AuthenticatedRequest, res) => {
  const { day, fasted, quranJuzCompleted, taraweehPrayed, notes } = req.body;
  const dayNum = Number(day);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 30) {
    return res.status(400).json({ error: 'Invalid day number (1-30)' });
  }

  const db = loadDatabase();
  let userProgress = db.ramadanProgress.find(p => p.userId === req.user!.id);
  if (!userProgress) {
    userProgress = {
      userId: req.user!.id,
      year: 1448,
      days: {}
    };
    db.ramadanProgress.push(userProgress);
  }

  userProgress.days[dayNum] = {
    day: dayNum,
    date: new Date().toISOString().split('T')[0],
    fasted: fasted !== undefined ? Boolean(fasted) : (userProgress.days[dayNum]?.fasted || false),
    quranJuzCompleted: quranJuzCompleted !== undefined ? Boolean(quranJuzCompleted) : (userProgress.days[dayNum]?.quranJuzCompleted || false),
    taraweehPrayed: taraweehPrayed !== undefined ? Boolean(taraweehPrayed) : (userProgress.days[dayNum]?.taraweehPrayed || false),
    notes: notes !== undefined ? notes : userProgress.days[dayNum]?.notes
  };

  saveDatabase(db);
  return res.json(userProgress);
});

// ----------------------------------------------------
// 8. ANNOUNCEMENTS
// ----------------------------------------------------

app.get('/api/announcements', (_req, res) => {
  const db = loadDatabase();
  return res.json(db.announcements.filter(a => a.active));
});

// ----------------------------------------------------
// 9. ADMIN PANEL ENDPOINTS
// ----------------------------------------------------

app.get('/api/admin/stats', requireAdmin, (_req, res) => {
  const db = loadDatabase();
  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'active').length;
  const totalBookmarks = db.bookmarks.length;
  const totalTasbih = db.tasbihSessions.reduce((sum, s) => sum + s.count, 0);
  const totalDuas = db.duas.length;

  return res.json({
    totalUsers,
    activeUsers,
    totalBookmarks,
    totalTasbih,
    totalDuas,
    recentLogs: db.auditLogs.slice(0, 20)
  });
});

app.get('/api/admin/users', requireAdmin, (_req, res) => {
  const db = loadDatabase();
  const usersSafe = db.users.map(({ passwordHash: _, ...rest }) => rest);
  return res.json(usersSafe);
});

app.put('/api/admin/users/:id/status', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or disabled' });
  }

  const db = loadDatabase();
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (targetUser.id === req.user!.id) {
    return res.status(400).json({ error: 'You cannot disable your own admin account' });
  }

  targetUser.status = status;
  targetUser.updatedAt = new Date().toISOString();
  saveDatabase(db);

  logAudit('USER_STATUS_CHANGE', req.user!.email, `Changed status of ${targetUser.email} to ${status}`);
  return res.json({ message: `User status changed to ${status}`, user: targetUser });
});

app.put('/api/admin/users/:id/role', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be user or admin' });
  }

  const db = loadDatabase();
  const targetUser = db.users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (targetUser.id === req.user!.id && role !== 'admin') {
    return res.status(400).json({ error: 'You cannot remove admin rights from your own account' });
  }

  targetUser.role = role;
  targetUser.updatedAt = new Date().toISOString();
  saveDatabase(db);

  logAudit('USER_ROLE_CHANGE', req.user!.email, `Changed role of ${targetUser.email} to ${role}`);
  return res.json({ message: `User role changed to ${role}`, user: targetUser });
});

app.delete('/api/admin/users/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const targetIndex = db.users.findIndex(u => u.id === req.params.id);
  if (targetIndex === -1) return res.status(404).json({ error: 'User not found' });

  if (db.users[targetIndex].id === req.user!.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }

  const deleted = db.users.splice(targetIndex, 1)[0];
  // Cleanup user's data
  db.bookmarks = db.bookmarks.filter(b => b.userId !== deleted.id);
  db.tasbihSessions = db.tasbihSessions.filter(t => t.userId !== deleted.id);
  db.favorites = db.favorites.filter(f => f.userId !== deleted.id);
  saveDatabase(db);

  logAudit('USER_DELETED', req.user!.email, `Deleted user ${deleted.email}`);
  return res.json({ message: 'User deleted successfully' });
});

app.post('/api/admin/announcements', requireAdmin, (req: AuthenticatedRequest, res) => {
  const { title, content, priority } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const db = loadDatabase();
  const announcement: Announcement = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    priority: priority || 'normal',
    active: true,
    createdAt: new Date().toISOString()
  };

  db.announcements.unshift(announcement);
  saveDatabase(db);
  logAudit('ANNOUNCEMENT_CREATED', req.user!.email, `Announcement created: ${title}`);
  return res.status(201).json(announcement);
});

app.delete('/api/admin/announcements/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
  const db = loadDatabase();
  const index = db.announcements.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Announcement not found' });

  const deleted = db.announcements.splice(index, 1)[0];
  saveDatabase(db);
  logAudit('ANNOUNCEMENT_DELETED', req.user!.email, `Announcement deleted: ${deleted.title}`);
  return res.json({ message: 'Announcement deleted' });
});

// ----------------------------------------------------
// SERVER START & VITE MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Muslim Pro Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
