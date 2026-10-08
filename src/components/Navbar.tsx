import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrayer } from '../context/PrayerContext';
import {
  Moon,
  Clock,
  Compass,
  BookOpen,
  Heart,
  RotateCcw,
  Calendar,
  Sparkles,
  User,
  Shield,
  MapPin,
  Menu,
  X,
  LogOut,
  Bell
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCitySelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenCitySelector }) => {
  const { user, setAuthModalOpen, setAuthModalMode, logout } = useAuth();
  const { city, formattedCountdown, prayerData } = usePrayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Moon },
    { id: 'prayers', label: 'Prayer Times', icon: Clock },
    { id: 'qibla', label: 'Qibla', icon: Compass },
    { id: 'quran', label: 'Quran', icon: BookOpen },
    { id: 'duas', label: 'Duas & Azkar', icon: Heart },
    { id: 'tasbih', label: 'Tasbih', icon: RotateCcw },
    { id: 'ramadan', label: 'Ramadan', icon: Sparkles },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20">
                <span className="font-serif font-bold text-xl leading-none tracking-tight">☪</span>
              </div>
              <div>
                <span className="text-lg font-extrabold font-serif tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  Muslim Pro
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Pro
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Islamic Companion & Prayer Hub
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Admin Panel button if role is admin */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 ring-1 ring-amber-400/40'
                      : 'text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Admin Panel</span>
                </button>
              )}
            </nav>

            {/* Right Side: Location badge + Next Prayer countdown + User actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Location indicator button */}
              <button
                onClick={onOpenCitySelector}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Change location"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{city}</span>
              </button>

              {/* Next Prayer countdown snippet */}
              {prayerData && (
                <div
                  onClick={() => setActiveTab('prayers')}
                  className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 rounded-lg text-xs cursor-pointer hover:bg-emerald-100/60 transition-colors"
                >
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                    {prayerData.nextPrayer}:
                  </span>
                  <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                    {formattedCountdown}
                  </span>
                </div>
              )}

              {/* User Account / Profile */}
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      activeTab === 'profile'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="max-w-[70px] truncate hidden sm:inline">{user.name.split(' ')[0]}</span>
                  </button>

                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-1 animate-fade-in shadow-xl">
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300/40"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Admin Dashboard
                </span>
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">Staff</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-emerald-600" />
                Profile Settings
              </button>
            )}
          </div>
        )}
      </header>

      {/* Bottom Navigation for Mobile (Mobile-First Experience) */}
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-3 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {[
            { id: 'home', label: 'Home', icon: Moon },
            { id: 'prayers', label: 'Prayers', icon: Clock },
            { id: 'qibla', label: 'Qibla', icon: Compass },
            { id: 'quran', label: 'Quran', icon: BookOpen },
            { id: 'tasbih', label: 'Tasbih', icon: RotateCcw },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
