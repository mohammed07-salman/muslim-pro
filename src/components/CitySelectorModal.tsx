import React, { useState } from 'react';
import { usePrayer } from '../context/PrayerContext';
import { X, MapPin, Navigation, Search, Check, Globe } from 'lucide-react';

interface CitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitySelectorModal: React.FC<CitySelectorModalProps> = ({ isOpen, onClose }) => {
  const { popularCities, setLocation, city: currentCity, requestGeolocation } = usePrayer();
  const [search, setSearch] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');

  if (!isOpen) return null;

  const filteredCities = popularCities.filter(c =>
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c: typeof popularCities[0]) => {
    setLocation(c.latitude, c.longitude, c.city, c.country);
    onClose();
  };

  const handleGps = async () => {
    setGpsLoading(true);
    const success = await requestGeolocation();
    setGpsLoading(false);
    if (success) {
      onClose();
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation(lat, lng, customCity || 'Custom Location', 'Custom Coordinates');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Location</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accurate prayer times & Qibla for your city</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <button
            onClick={handleGps}
            disabled={gpsLoading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
            {gpsLoading ? 'Detecting GPS Location...' : 'Use My Current GPS Location'}
          </button>

          {!customMode ? (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search global city or country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="City Name"
                value={customCity}
                onChange={e => setCustomCity(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g. 21.42)"
                  value={customLat}
                  onChange={e => setCustomLat(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g. 39.82)"
                  value={customLng}
                  onChange={e => setCustomLng(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Apply Coordinates
              </button>
            </form>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setCustomMode(!customMode)}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
            >
              {customMode ? '← Back to City List' : 'Enter Custom Coordinates / Lat Long →'}
            </button>
          </div>
        </div>

        {/* City list */}
        {!customMode && (
          <div className="overflow-y-auto p-4 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCities.map((c, i) => {
              const isSelected = currentCity.toLowerCase() === c.city.toLowerCase();
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-semibold">{c.city}</div>
                      <div className="text-[11px] text-slate-400">{c.country}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </button>
              );
            })}
            {filteredCities.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">No matching cities found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
