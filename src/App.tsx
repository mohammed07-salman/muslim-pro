import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrayerProvider } from './context/PrayerContext';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { PrayerTimesView } from './components/PrayerTimesView';
import { QiblaCompass } from './components/QiblaCompass';
import { QuranView } from './components/QuranView';
import { DuasView } from './components/DuasView';
import { TasbihView } from './components/TasbihView';
import { RamadanView } from './components/RamadanView';
import { CalendarView } from './components/CalendarView';
import { UserProfileView } from './components/UserProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { CitySelectorModal } from './components/CitySelectorModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [citySelectorOpen, setCitySelectorOpen] = useState<boolean>(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top and Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCitySelector={() => setCitySelectorOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeDashboard
            setActiveTab={setActiveTab}
            onOpenCitySelector={() => setCitySelectorOpen(true)}
          />
        )}
        {activeTab === 'prayers' && (
          <PrayerTimesView onOpenCitySelector={() => setCitySelectorOpen(true)} />
        )}
        {activeTab === 'qibla' && <QiblaCompass />}
        {activeTab === 'quran' && <QuranView />}
        {activeTab === 'duas' && <DuasView />}
        {activeTab === 'tasbih' && <TasbihView />}
        {activeTab === 'ramadan' && <RamadanView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'profile' && <UserProfileView />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals */}
      <AuthModal />
      <CitySelectorModal
        isOpen={citySelectorOpen}
        onClose={() => setCitySelectorOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 hidden xl:block">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Muslim Pro Web Companion. All calculations verified with astronomical Islamic formulas.</p>
          <div className="flex items-center gap-3">
            <span>Umm Al-Qura</span>
            <span>·</span>
            <span>Muslim World League</span>
            <span>·</span>
            <span>Al-Azhar Egyptian Survey</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PrayerProvider>
        <AppContent />
      </PrayerProvider>
    </AuthProvider>
  );
}
