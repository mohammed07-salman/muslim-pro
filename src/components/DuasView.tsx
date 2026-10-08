import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dua } from '../types';
import {
  Heart,
  Search,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookMarked
} from 'lucide-react';

export const DuasView: React.FC = () => {
  const { user, token, setAuthModalOpen } = useAuth();
  const [duas, setDuas] = useState<Dua[]>([]);
  const [favorites, setFavorites] = useState<Dua[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'All Duas' },
    { id: 'favorites', label: 'My Favorites' },
    { id: 'morning', label: 'Morning Azkar' },
    { id: 'evening', label: 'Evening Azkar' },
    { id: 'prayer', label: 'After Prayer' },
    { id: 'sleeping', label: 'Sleep & Waking' },
    { id: 'daily', label: 'Daily Life' },
    { id: 'protection', label: 'Protection & Ruqyah' },
    { id: 'travel', label: 'Travel' },
    { id: 'eating', label: 'Eating & Drinking' },
    { id: 'ramadan', label: 'Ramadan Duas' }
  ];

  // Load all Duas
  useEffect(() => {
    fetch('/api/duas')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setDuas(data))
      .catch(err => console.error('Error fetching duas:', err));
  }, []);

  // Load user favorites
  useEffect(() => {
    if (token) {
      fetch('/api/duas/favorites', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => Array.isArray(data) && setFavorites(data))
        .catch(err => console.error('Error fetching favorite duas:', err));
    } else {
      setFavorites([]);
    }
  }, [token]);

  const toggleFavorite = async (dua: Dua) => {
    if (!user || !token) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/duas/favorites/${dua.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.favorited) {
        setFavorites(prev => [...prev, dua]);
      } else {
        setFavorites(prev => prev.filter(f => f.id !== dua.id));
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  const handleCopy = (dua: Dua) => {
    navigator.clipboard.writeText(`${dua.title}\n\n${dua.arabic}\n\nTransliteration: ${dua.transliteration}\n\nTranslation: "${dua.translation}"\n\nReference: ${dua.reference}`);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const incrementCount = (duaId: string, max: number) => {
    setCounts(prev => {
      const current = prev[duaId] || 0;
      if (current >= max) {
        return { ...prev, [duaId]: 0 }; // reset on complete
      }
      return { ...prev, [duaId]: current + 1 };
    });
  };

  const isFavorite = (duaId: string) => favorites.some(f => f.id === duaId);

  const displayedDuas = (selectedCategory === 'favorites' ? favorites : duas).filter(d => {
    const matchesCategory = selectedCategory === 'all' || selectedCategory === 'favorites' || d.category === selectedCategory;
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.translation.toLowerCase().includes(search.toLowerCase()) ||
      d.arabic.includes(search) ||
      d.transliteration.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Heart className="w-4 h-4" />
            <span>Hisnul Muslim & Authentic Azkar</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Daily Duas & Remembrance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authentic supplications from the Quran and Sunnah with diacritics, transliteration & repetitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            {displayedDuas.length} supplications available
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search duas by title, transliteration, or meaning..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
              {cat.id === 'favorites' && ` (${favorites.length})`}
            </button>
          );
        })}
      </div>

      {/* Duas List */}
      <div className="space-y-4">
        {displayedDuas.map(dua => {
          const fav = isFavorite(dua.id);
          const currentCount = counts[dua.id] || 0;
          const isComplete = currentCount >= dua.repeatCount;

          return (
            <div
              key={dua.id}
              className={`p-6 bg-white dark:bg-slate-900 border rounded-3xl transition-all shadow-xs space-y-4 ${
                isComplete && dua.repeatCount > 1
                  ? 'border-emerald-500/80 bg-emerald-50/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {dua.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    {dua.category}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Favorite Toggle */}
                  <button
                    onClick={() => toggleFavorite(dua)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      fav
                        ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={fav ? 'Favorited' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${fav ? 'fill-rose-500' : ''}`} />
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(dua)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title="Copy Dua"
                  >
                    {copiedId === dua.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Arabic Text */}
              <div className="text-right py-2">
                <p className="font-arabic text-2xl sm:text-3xl text-slate-900 dark:text-white leading-[2.6] font-normal">
                  {dua.arabic}
                </p>
              </div>

              {/* Transliteration */}
              {dua.transliteration && (
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Transliteration</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic font-mono leading-relaxed">
                    {dua.transliteration}
                  </p>
                </div>
              )}

              {/* Translation */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Translation</span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                  "{dua.translation}"
                </p>
              </div>

              {/* Footer: Reference & Interactive Repetition Tracker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span className="italic text-[11px] text-slate-400">
                  Ref: {dua.reference}
                </span>

                {/* Repetition Button */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-slate-400 font-medium">Recite:</span>
                  <button
                    onClick={() => incrementCount(dua.id, dua.repeatCount)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isComplete
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <span>{currentCount} / {dua.repeatCount}x</span>
                    {isComplete ? <Check className="w-3.5 h-3.5" /> : <RotateCcw className="w-3 h-3 text-emerald-600" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {displayedDuas.length === 0 && (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Duas Found</h4>
            <p className="text-xs text-slate-400">Try a different search term or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
