import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrayer } from '../context/PrayerContext';
import {
  User as UserIcon,
  Bell,
  Lock,
  Globe,
  Sliders,
  LogOut,
  Save,
  CheckCircle,
  AlertCircle,
  Bookmark,
  Heart,
  RotateCcw
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, token, updateProfile, updatePreferences, logout } = useAuth();
  const { calculationMethod, setCalculationMethod, madhab, setMadhab } = usePrayer();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [city, setCity] = useState(user?.city || 'Makkah');
  const [country, setCountry] = useState(user?.country || 'Saudi Arabia');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile save state
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true);
  const [notifSettings, setNotifSettings] = useState(
    user?.notificationSettings || {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
      suhoor: true,
      iftar: true,
      dailyDua: true
    }
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name, avatarUrl, city, country });
    if (success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage({ type: 'success', text: 'Password successfully changed!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch {
      setPwMessage({ type: 'error', text: 'Network error' });
    }
  };

  const handleToggleNotif = async (key: keyof typeof notifSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    await updatePreferences({ notificationSettings: updated });
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('Muslim Pro Notifications Enabled', {
          body: 'You will receive timely prayer and fasting reminders.',
          icon: '/favicon.ico'
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center text-2xl font-bold font-serif shadow-md">
              {name.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                {name || 'My Muslim Pro Account'}
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                user?.role === 'admin'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-slate-400">
              Location: {city}, {country}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Details & Location Settings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <UserIcon className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Profile Information
          </h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Avatar Image URL (Optional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {profileSaved && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Profile updated successfully!
              </span>
            )}
            <button
              type="submit"
              className="ml-auto py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Adhan & Prayer Reminder Notifications
            </h3>
          </div>
          <button
            onClick={requestBrowserPermission}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Enable Browser Alerts →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'fajr', label: 'Fajr (Dawn)' },
            { key: 'dhuhr', label: 'Dhuhr (Noon)' },
            { key: 'asr', label: 'Asr (Afternoon)' },
            { key: 'maghrib', label: 'Maghrib (Sunset)' },
            { key: 'isha', label: 'Isha (Night)' },
            { key: 'suhoor', label: 'Suhoor Reminder' },
            { key: 'iftar', label: 'Iftar Reminder' },
            { key: 'dailyDua', label: 'Daily Ayah / Dua' }
          ].map(item => {
            const active = (notifSettings as any)[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggleNotif(item.key as any)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-xs font-semibold block">{item.label}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                  {active ? 'Active ✓' : 'Muted'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Change Password Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Lock className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Security & Change Password
          </h3>
        </div>

        {pwMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              pwMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300'
                : 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300'
            }`}
          >
            {pwMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{pwMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
