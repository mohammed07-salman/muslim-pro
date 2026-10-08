import React, { useState, useEffect } from 'react';
import { usePrayer } from '../context/PrayerContext';
import { QiblaData } from '../types';
import {
  Compass,
  MapPin,
  RotateCw,
  Navigation,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const QiblaCompass: React.FC = () => {
  const { latitude, longitude, city, country, onOpenCitySelector: _ } = usePrayer() as any;
  const [qiblaData, setQiblaData] = useState<QiblaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [sensorSupported, setSensorSupported] = useState<boolean | null>(null);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Fetch exact Qibla bearing and distance from server
  useEffect(() => {
    setLoading(true);
    fetch(`/api/prayers/qibla?lat=${latitude}&lng=${longitude}`)
      .then(res => res.json())
      .then(data => {
        setQiblaData(data);
      })
      .catch(err => console.error('Failed to fetch Qibla data:', err))
      .finally(() => setLoading(false));
  }, [latitude, longitude]);

  // Sensor listener for mobile compass / deviceorientation
  useEffect(() => {
    let handleOrientation: (event: DeviceOrientationEvent) => void;

    if (window.DeviceOrientationEvent) {
      handleOrientation = (event: DeviceOrientationEvent) => {
        let heading: number | null = null;
        // iOS webkitCompassHeading
        if ('webkitCompassHeading' in event && typeof (event as any).webkitCompassHeading === 'number') {
          heading = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
          // Standard compass heading (approximate without absolute orientation)
          heading = 360 - event.alpha;
        }

        if (heading !== null && !isNaN(heading)) {
          setDeviceHeading(Math.round(heading));
          setSensorSupported(true);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
      setSensorSupported(false);
    }

    return () => {
      if (handleOrientation) {
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, []);

  const requestSensorPermission = async () => {
    // iOS 13+ requires user gesture permission request
    if (
      typeof (DeviceOrientationEvent as any) !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorSupported(true);
        } else {
          setSensorSupported(false);
        }
      } catch (err) {
        console.warn('Sensor permission error:', err);
        setSensorSupported(false);
      }
    } else {
      setIsCalibrating(true);
      setTimeout(() => setIsCalibrating(false), 1500);
    }
  };

  const activeHeading = sensorSupported ? deviceHeading : manualHeading;
  const qiblaBearing = qiblaData?.qiblaBearing || 0;
  // Calculate relative angle to turn device towards Kaaba
  const relativeAngle = (qiblaBearing - activeHeading + 360) % 360;
  const isAligned = Math.abs(relativeAngle) < 4 || Math.abs(relativeAngle - 360) < 4;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Compass className="w-4 h-4" />
            <span>Mecca Direction Finder</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Qibla Compass
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Facing the Holy Kaaba (Al-Masjid Al-Haram, Makkah al-Mukarramah)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-2xl text-xs">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{city}, {country}</span>
            <div className="text-[10px] text-slate-500 font-mono">
              Lat: {latitude.toFixed(2)}° · Lng: {longitude.toFixed(2)}°
            </div>
          </div>
        </div>
      </div>

      {/* Main Compass Stage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center">
        
        {/* Alignment Status Banner */}
        <div
          className={`mb-6 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            isAligned
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {isAligned ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Perfect! You are facing the Kaaba</span>
            </>
          ) : (
            <>
              <RotateCw className="w-4 h-4 text-emerald-600" />
              <span>Turn {relativeAngle > 180 ? 'left' : 'right'} by {Math.round(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle)}° to face Mecca</span>
            </>
          )}
        </div>

        {/* Circular Compass Visual */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-4">
          
          {/* Compass Outer Ring with Degree Marks */}
          <div
            className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-inner transition-transform duration-300"
            style={{ transform: `rotate(${-activeHeading}deg)` }}
          >
            {/* Cardinal points */}
            <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-xs text-rose-600">N</span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-xs text-slate-400">S</span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">E</span>
            <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">W</span>

            {/* Dial Tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
              <div
                key={deg}
                className="absolute w-full top-1/2 left-0 -translate-y-1/2 pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="w-2.5 h-0.5 bg-slate-300 dark:bg-slate-700 ml-1" />
              </div>
            ))}

            {/* KAABA Indicator on Dial at exact Qibla Bearing */}
            <div
              className="absolute inset-0 flex items-start justify-center pointer-events-none"
              style={{ transform: `rotate(${qiblaBearing}deg)` }}
            >
              <div className="flex flex-col items-center -mt-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border-2 border-amber-400 shadow-md flex items-center justify-center text-amber-300 text-[11px] font-bold">
                  🕋
                </div>
                <div className="w-1.5 h-3 bg-emerald-500 rounded-b" />
              </div>
            </div>
          </div>

          {/* Compass Center Pointer / Fixed Needle */}
          <div className="relative z-10 w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-2 border-emerald-500/30 shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
              Qibla
            </span>
            <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {qiblaBearing}°
            </span>
            <span className="text-[10px] text-slate-400">from North</span>
          </div>

          {/* Forward direction arrow */}
          <div className="absolute top-0 w-3 h-3 bg-rose-500 rotate-45 -translate-y-2 z-20" />
        </div>

        {/* Bearing stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mt-6 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Qibla Bearing</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {loading ? '...' : `${qiblaBearing}°`}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block">Current Heading</span>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
              {activeHeading}°
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 block">Distance to Mecca</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {loading ? '...' : `${qiblaData?.distanceKm.toLocaleString()} km`}
            </span>
          </div>
        </div>

        {/* Device Sensor Controls / Desktop Fallback Slider */}
        <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3">
          {sensorSupported ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Real-time device magnetic compass active</span>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  Manual Heading Dial (Rotate your phone or test on desktop):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{manualHeading}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={manualHeading}
                onChange={e => setManualHeading(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}

          <button
            onClick={requestSensorPermission}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin' : ''}`} />
            <span>{isCalibrating ? 'Calibrating...' : 'Enable Compass Sensors / Calibrate'}</span>
          </button>
        </div>
      </div>

      {/* Kaaba and Mecca Information Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          <Info className="w-4 h-4" />
          <span>About the Kaaba & Qibla Direction</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The Qibla is the direction that Muslims face during ritual prayer (Salah). It points directly toward the Holy Kaaba inside Masjid al-Haram in Mecca, Saudi Arabia (Coordinates: 21.4225° N, 39.8262° E). Our Qibla algorithm calculates the precise great-circle geodesic azimuth from your current coordinates.
        </p>
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>Calibration Tip:</strong> To calibrate device sensors, wave your mobile phone in a figure-8 motion away from large magnetic or metallic objects.
          </span>
        </div>
      </div>
    </div>
  );
};
