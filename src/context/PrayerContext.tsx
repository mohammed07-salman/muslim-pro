import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PrayerTimesData, CityOption } from '../types';
import { useAuth } from './AuthContext';

interface PrayerContextType {
  prayerData: PrayerTimesData | null;
  loading: boolean;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  calculationMethod: string;
  madhab: 'shafi' | 'hanafi';
  remainingSeconds: number;
  formattedCountdown: string;
  popularCities: CityOption[];
  setLocation: (lat: number, lng: number, city?: string, country?: string) => void;
  setCalculationMethod: (method: string) => void;
  setMadhab: (madhab: 'shafi' | 'hanafi') => void;
  requestGeolocation: () => Promise<boolean>;
  geoPermissionState: 'prompt' | 'granted' | 'denied';
  refetchPrayerTimes: () => Promise<void>;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

export const PrayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updatePreferences } = useAuth();

  // Initial location (default Makkah or user's saved location)
  const [latitude, setLatitude] = useState<number>(() => user?.latitude || 21.4225);
  const [longitude, setLongitude] = useState<number>(() => user?.longitude || 39.8262);
  const [city, setCity] = useState<string>(() => user?.city || 'Makkah');
  const [country, setCountry] = useState<string>(() => user?.country || 'Saudi Arabia');
  const [calculationMethod, setCalcMethod] = useState<string>(() => user?.calculationMethod || 'MuslimWorldLeague');
  const [madhab, setMadhabState] = useState<'shafi' | 'hanafi'>(() => user?.madhab || 'shafi');

  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [geoPermissionState, setGeoPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [popularCities, setPopularCities] = useState<CityOption[]>([]);

  // Sync with user profile when logged in
  useEffect(() => {
    if (user) {
      if (user.latitude && user.longitude) {
        setLatitude(user.latitude);
        setLongitude(user.longitude);
      }
      if (user.city) setCity(user.city);
      if (user.country) setCountry(user.country);
      if (user.calculationMethod) setCalcMethod(user.calculationMethod);
      if (user.madhab) setMadhabState(user.madhab);
    }
  }, [user]);

  // Fetch popular cities once
  useEffect(() => {
    fetch('/api/prayers/cities')
      .then(res => res.json())
      .then(data => setPopularCities(data))
      .catch(err => console.error('Error fetching popular cities:', err));
  }, []);

  const fetchTimes = useCallback(async (lat: number, lng: number, method: string, m: string) => {
    try {
      setLoading(true);
      const url = `/api/prayers/times?lat=${lat}&lng=${lng}&method=${encodeURIComponent(method)}&madhab=${m}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: PrayerTimesData = await res.json();
        setPrayerData(data);
        setRemainingSeconds(Math.floor(data.timeToNextPrayerMs / 1000));
      }
    } catch (err) {
      console.error('Failed to fetch prayer times:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimes(latitude, longitude, calculationMethod, madhab);
  }, [latitude, longitude, calculationMethod, madhab, fetchTimes]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Re-fetch when countdown hits 0
          fetchTimes(latitude, longitude, calculationMethod, madhab);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [latitude, longitude, calculationMethod, madhab, fetchTimes]);

  const setLocation = (lat: number, lng: number, newCity?: string, newCountry?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (newCity) setCity(newCity);
    if (newCountry) setCountry(newCountry);

    if (user) {
      updatePreferences({
        latitude: lat,
        longitude: lng,
        city: newCity || city,
        country: newCountry || country
      });
    }
  };

  const setCalculationMethod = (method: string) => {
    setCalcMethod(method);
    if (user) {
      updatePreferences({ calculationMethod: method });
    }
  };

  const setMadhab = (m: 'shafi' | 'hanafi') => {
    setMadhabState(m);
    if (user) {
      updatePreferences({ madhab: m });
    }
  };

  const requestGeolocation = async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setGeoPermissionState('denied');
      return false;
    }

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude: lat, longitude: lng } = position.coords;
          setGeoPermissionState('granted');
          setLocation(lat, lng, 'My Location', 'Current GPS');
          resolve(true);
        },
        error => {
          console.warn('Geolocation denied or unavailable:', error);
          setGeoPermissionState('denied');
          resolve(false);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    });
  };

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <PrayerContext.Provider
      value={{
        prayerData,
        loading,
        latitude,
        longitude,
        city,
        country,
        calculationMethod,
        madhab,
        remainingSeconds,
        formattedCountdown,
        popularCities,
        setLocation,
        setCalculationMethod,
        setMadhab,
        requestGeolocation,
        geoPermissionState,
        refetchPrayerTimes: () => fetchTimes(latitude, longitude, calculationMethod, madhab)
      }}
    >
      {children}
    </PrayerContext.Provider>
  );
};

export const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
};
