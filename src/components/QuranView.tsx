import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Surah, SurahDetail, Bookmark } from '../types';
import {
  BookOpen,
  Search,
  Bookmark as BookmarkIcon,
  Play,
  Pause,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Volume2,
  BookmarkCheck,
  History,
  Sparkles
} from 'lucide-react';

export const QuranView: React.FC = () => {
  const { user, token, setAuthModalOpen } = useAuth();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSurahId, setSelectedSurahId] = useState<number | null>(null);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [activeTab, setActiveTab] = useState<'surahs' | 'bookmarks'>('surahs');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [continueReading, setContinueReading] = useState<{ surahNumber: number; ayahNumber: number; surahName: string } | null>(null);

  // Audio recitation state
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Font size setting
  const [arabicFontSize, setArabicFontSize] = useState<number>(24);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Load all 114 Surahs list
  useEffect(() => {
    fetch('/api/quran/surahs')
      .then(res => res.json())
      .then(data => setSurahs(data))
      .catch(err => console.error('Error fetching surahs:', err));
  }, []);

  // Load user bookmarks & continue reading progress
  useEffect(() => {
    if (token) {
      fetch('/api/quran/bookmarks', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setBookmarks(data))
        .catch(err => console.error('Error fetching bookmarks:', err));

      fetch('/api/quran/progress', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => data && setContinueReading(data))
        .catch(err => console.error('Error fetching progress:', err));
    }
  }, [token]);

  // Load selected Surah details
  useEffect(() => {
    if (!selectedSurahId) {
      setSurahDetail(null);
      return;
    }

    setLoadingSurah(true);
    fetch(`/api/quran/surah/${selectedSurahId}`)
      .then(res => res.json())
      .then(data => {
        setSurahDetail(data);
        // Save progress if logged in
        if (token && data) {
          fetch('/api/quran/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ surahNumber: data.number, ayahNumber: 1, surahName: data.englishName })
          }).then(() => {
            setContinueReading({ surahNumber: data.number, ayahNumber: 1, surahName: data.englishName });
          });
        }
      })
      .catch(err => console.error('Error loading surah details:', err))
      .finally(() => setLoadingSurah(false));
  }, [selectedSurahId, token]);

  const toggleAyahAudio = (audioUrl?: string, ayahNum?: number) => {
    if (!audioUrl || !ayahNum) return;

    if (playingAyahNumber === ayahNum && audioPlayer) {
      audioPlayer.pause();
      setPlayingAyahNumber(null);
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    const newAudio = new Audio(audioUrl);
    newAudio.onended = () => setPlayingAyahNumber(null);
    newAudio.play().catch(e => console.warn('Audio play restricted:', e));
    setAudioPlayer(newAudio);
    setPlayingAyahNumber(ayahNum);
  };

  const toggleBookmark = async (ayahNumber: number, text: string, translation: string) => {
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }

    if (!surahDetail) return;

    const existing = bookmarks.find(
      b => b.surahNumber === surahDetail.number && b.ayahNumber === ayahNumber
    );

    if (existing) {
      // Remove bookmark
      try {
        await fetch(`/api/quran/bookmarks/${existing.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookmarks(prev => prev.filter(b => b.id !== existing.id));
      } catch (err) {
        console.error('Failed to remove bookmark:', err);
      }
    } else {
      // Add bookmark
      try {
        const res = await fetch('/api/quran/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            surahNumber: surahDetail.number,
            ayahNumber,
            surahNameEnglish: surahDetail.englishName,
            surahNameArabic: surahDetail.name,
            arabicText: text,
            translationText: translation
          })
        });
        if (res.ok) {
          const newBm = await res.json();
          setBookmarks(prev => [newBm, ...prev]);
        }
      } catch (err) {
        console.error('Failed to save bookmark:', err);
      }
    }
  };

  const handleCopyAyah = (arabic: string, translation: string, surahName: string, num: number) => {
    navigator.clipboard.writeText(`${arabic}\n"${translation}"\n- ${surahName} [${num}]`);
    setCopiedAyah(num);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.number.toString() === search
  );

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* If reading a specific Surah */}
      {selectedSurahId && surahDetail ? (
        <div className="space-y-4">
          
          {/* Top Surah Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedSurahId(null);
                  if (audioPlayer) audioPlayer.pause();
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                    {surahDetail.number}. {surahDetail.englishName}
                  </h2>
                  <span className="font-arabic text-xl text-emerald-700 dark:text-emerald-400 font-bold">
                    ({surahDetail.name})
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {surahDetail.englishNameTranslation} · {surahDetail.numberOfAyahs} Verses · {surahDetail.revelationType}
                </p>
              </div>
            </div>

            {/* Font size + Surah Navigation */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setArabicFontSize(prev => Math.max(18, prev - 2))}
                  className="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold"
                  title="Smaller Arabic font"
                >
                  A-
                </button>
                <button
                  onClick={() => setArabicFontSize(prev => Math.min(36, prev + 2))}
                  className="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 font-bold"
                  title="Larger Arabic font"
                >
                  A+
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={surahDetail.number <= 1}
                  onClick={() => setSelectedSurahId(surahDetail.number - 1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
                  title="Previous Surah"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={surahDetail.number >= 114}
                  onClick={() => setSelectedSurahId(surahDetail.number + 1)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 rounded-xl transition-colors cursor-pointer"
                  title="Next Surah"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bismillah Header (Except Surah At-Tawbah 9) */}
          {surahDetail.number !== 9 && (
            <div className="p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl text-center shadow-md">
              <p className="font-arabic text-3xl font-normal tracking-wide">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <p className="text-xs text-emerald-200 mt-2 font-serif italic">
                In the name of Allah, the Entirely Merciful, the Especially Merciful
              </p>
            </div>
          )}

          {/* Ayahs Stream */}
          <div className="space-y-3">
            {surahDetail.ayahs.map(ayah => {
              const isBookmarked = bookmarks.some(
                b => b.surahNumber === surahDetail.number && b.ayahNumber === ayah.numberInSurah
              );
              const isPlaying = playingAyahNumber === ayah.numberInSurah;

              return (
                <div
                  key={ayah.numberInSurah}
                  id={`ayah-${ayah.numberInSurah}`}
                  className={`p-6 bg-white dark:bg-slate-900 border rounded-3xl transition-all ${
                    isPlaying
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Ayah Header info & Action controls */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-mono font-bold">
                      {ayah.numberInSurah}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Play Ayah Audio */}
                      <button
                        onClick={() => toggleAyahAudio(ayah.audio, ayah.numberInSurah)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-emerald-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                        title="Listen to recitation"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      {/* Bookmark Ayah */}
                      <button
                        onClick={() => toggleBookmark(ayah.numberInSurah, ayah.text, ayah.translation)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Ayah'}
                      >
                        <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Copy Ayah */}
                      <button
                        onClick={() => handleCopyAyah(ayah.text, ayah.translation, surahDetail.englishName, ayah.numberInSurah)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
                        title="Copy verse"
                      >
                        {copiedAyah === ayah.numberInSurah ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="text-right py-2">
                    <p
                      className="font-arabic text-slate-900 dark:text-white leading-[2.6]"
                      style={{ fontSize: `${arabicFontSize}px` }}
                    >
                      {ayah.text}{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-mono mr-2">
                        ﴿{ayah.numberInSurah}﴾
                      </span>
                    </p>
                  </div>

                  {/* English Translation */}
                  <div className="pt-3 border-t border-slate-50 dark:border-slate-800/80">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                      {ayah.translation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Surahs Catalog / Bookmarks List */
        <div className="space-y-6">
          
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Noble Quran (القرآن الكريم)</span>
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                Surah Index & Reading
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                All 114 Surahs with authentic Uthmani script and Sahih International translation
              </p>
            </div>

            {/* Tab switch: Surahs vs Bookmarks */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab('surahs')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'surahs'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All 114 Surahs
              </button>
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bookmarks'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Bookmarks ({bookmarks.length})</span>
              </button>
            </div>
          </div>

          {/* Continue reading alert if user has active progress */}
          {continueReading && (
            <div
              onClick={() => setSelectedSurahId(continueReading.surahNumber)}
              className="p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow border border-emerald-800"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-800/80 rounded-xl text-amber-300">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 uppercase tracking-widest font-semibold block">
                    Continue Reading
                  </span>
                  <span className="text-base font-bold">
                    Surah {continueReading.surahName} (Ayah {continueReading.ayahNumber})
                  </span>
                </div>
              </div>
              <span className="text-xs bg-emerald-600 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1">
                Resume <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}

          {activeTab === 'surahs' ? (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search by Surah name in English or Arabic, number, or meaning..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {/* Surah List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredSurahs.map(s => (
                  <div
                    key={s.number}
                    onClick={() => setSelectedSurahId(s.number)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 rounded-2xl transition-all cursor-pointer group shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-mono font-bold transition-colors">
                        {s.number}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {s.englishName}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {s.englishNameTranslation}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-arabic text-lg text-emerald-800 dark:text-emerald-300 font-bold block">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {s.numberOfAyahs} ayahs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Bookmarks Tab */
            <div className="space-y-3">
              {!user ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
                  <BookmarkIcon className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Save Your Quran Bookmarks</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Sign in to sync and access your favorite Quran verses across all your devices securely.
                  </p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Sign In to View Bookmarks
                  </button>
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-xs">
                  No bookmarked verses yet. Click the bookmark icon on any ayah while reading!
                </div>
              ) : (
                bookmarks.map(bm => (
                  <div
                    key={bm.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <BookmarkIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Surah {bm.surahNameEnglish} : Ayah {bm.ayahNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedSurahId(bm.surahNumber)}
                        className="text-xs text-emerald-600 hover:underline font-semibold cursor-pointer"
                      >
                        Read in Context →
                      </button>
                    </div>

                    <p className="font-arabic text-lg text-right text-slate-900 dark:text-white leading-loose">
                      {bm.arabicText}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-serif italic">
                      "{bm.translationText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
