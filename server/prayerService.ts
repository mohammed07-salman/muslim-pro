import { Coordinates, CalculationMethod, PrayerTimes, Madhab, Qibla } from 'adhan';

export interface PrayerTimesResult {
  date: string;
  hijri: {
    day: number;
    month: { number: number; en: string; ar: string };
    year: number;
    designation: string;
    formatted: string;
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
  };
  rawTimings: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  currentPrayer: string;
  nextPrayer: string;
  timeToNextPrayerMs: number;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    method: string;
    madhab: string;
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

const HIJRI_MONTHS = [
  { number: 1, en: "Muharram", ar: "مُحَرَّم" },
  { number: 2, en: "Safar", ar: "صَفَر" },
  { number: 3, en: "Rabi' al-Awwal", ar: "رَبِيع الأَوَّل" },
  { number: 4, en: "Rabi' al-Thani", ar: "رَبِيع الآخِر" },
  { number: 5, en: "Jumada al-Awwal", ar: "جُمَادَى الأُولَى" },
  { number: 6, en: "Jumada al-Thani", ar: "جُمَادَى الآخِرَة" },
  { number: 7, en: "Rajab", ar: "رَجَب" },
  { number: 8, en: "Sha'ban", ar: "شَعْبَان" },
  { number: 9, en: "Ramadan", ar: "رَمَضَان" },
  { number: 10, en: "Shawwal", ar: "شَوَّال" },
  { number: 11, en: "Dhu al-Qi'dah", ar: "ذُو القَعْدَة" },
  { number: 12, en: "Dhu al-Hijjah", ar: "ذُو الحِجَّة" }
];

export function getHijriDate(date: Date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
    const monthNum = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '1448', 10);
    const month = HIJRI_MONTHS[monthNum - 1] || HIJRI_MONTHS[0];

    return {
      day,
      month,
      year,
      designation: 'AH',
      formatted: `${day} ${month.en} ${year} AH (${month.ar})`
    };
  } catch {
    // Fallback approximation
    return {
      day: 26,
      month: HIJRI_MONTHS[2], // Rabi' al-Awwal
      year: 1448,
      designation: 'AH',
      formatted: `26 Rabi' al-Awwal 1448 AH`
    };
  }
}

export function calculateQibla(latitude: number, longitude: number) {
  const coords = new Coordinates(latitude, longitude);
  const qiblaDirection = Qibla(coords);

  // Mecca coordinates
  const MECCA_LAT = 21.422487;
  const MECCA_LNG = 39.826206;

  // Great-circle distance using Haversine formula
  const R = 6371; // km
  const dLat = (MECCA_LAT - latitude) * Math.PI / 180;
  const dLon = (MECCA_LNG - longitude) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(latitude * Math.PI / 180) * Math.cos(MECCA_LAT * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);
  const distanceMiles = Math.round(distanceKm * 0.621371);

  return {
    qiblaBearing: Math.round(qiblaDirection * 10) / 10,
    distanceKm,
    distanceMiles,
    meccaCoords: { latitude: MECCA_LAT, longitude: MECCA_LNG }
  };
}

export function getCalculationParameters(methodName: string = 'MuslimWorldLeague') {
  switch (methodName.toLowerCase()) {
    case 'isna':
    case 'northamerica':
      return CalculationMethod.NorthAmerica();
    case 'egypt':
    case 'egyptian':
      return CalculationMethod.Egyptian();
    case 'makkah':
    case 'ummalqura':
      return CalculationMethod.UmmAlQura();
    case 'karachi':
      return CalculationMethod.Karachi();
    case 'tehran':
      return CalculationMethod.Tehran();
    case 'kuwait':
      return CalculationMethod.Kuwait();
    case 'qatar':
      return CalculationMethod.Qatar();
    case 'singapore':
      return CalculationMethod.Singapore();
    case 'turkey':
      return CalculationMethod.Turkey();
    case 'dubai':
      return CalculationMethod.Dubai();
    case 'mwl':
    case 'muslimworldleague':
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

export function getPrayerTimes(
  lat: number,
  lng: number,
  method: string = 'MuslimWorldLeague',
  madhab: string = 'shafi',
  date: Date = new Date()
): PrayerTimesResult {
  const coords = new Coordinates(lat, lng);
  const params = getCalculationParameters(method);

  if (madhab.toLowerCase() === 'hanafi') {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }

  const prayers = new PrayerTimes(coords, date, params);

  // Timings map
  const timings = {
    Fajr: formatTime(prayers.fajr),
    Sunrise: formatTime(prayers.sunrise),
    Dhuhr: formatTime(prayers.dhuhr),
    Asr: formatTime(prayers.asr),
    Maghrib: formatTime(prayers.maghrib),
    Isha: formatTime(prayers.isha),
    Imsak: formatTime(new Date(prayers.fajr.getTime() - 10 * 60 * 1000)),
    Midnight: formatTime(new Date(prayers.maghrib.getTime() + (prayers.fajr.getTime() + 86400000 - prayers.maghrib.getTime()) / 2))
  };

  const rawTimings = {
    fajr: prayers.fajr.toISOString(),
    sunrise: prayers.sunrise.toISOString(),
    dhuhr: prayers.dhuhr.toISOString(),
    asr: prayers.asr.toISOString(),
    maghrib: prayers.maghrib.toISOString(),
    isha: prayers.isha.toISOString()
  };

  const now = date.getTime();
  const schedule = [
    { name: 'Fajr', time: prayers.fajr.getTime() },
    { name: 'Sunrise', time: prayers.sunrise.getTime() },
    { name: 'Dhuhr', time: prayers.dhuhr.getTime() },
    { name: 'Asr', time: prayers.asr.getTime() },
    { name: 'Maghrib', time: prayers.maghrib.getTime() },
    { name: 'Isha', time: prayers.isha.getTime() }
  ];

  let currentPrayer = 'Isha';
  let nextPrayer = 'Fajr';
  let nextPrayerTime = schedule[0].time + 86400000;

  for (let i = 0; i < schedule.length; i++) {
    if (now >= schedule[i].time) {
      currentPrayer = schedule[i].name;
      if (i + 1 < schedule.length) {
        nextPrayer = schedule[i + 1].name;
        nextPrayerTime = schedule[i + 1].time;
      } else {
        // Next is tomorrow's Fajr
        nextPrayer = 'Fajr';
        const tomorrow = new Date(date);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowPrayers = new PrayerTimes(coords, tomorrow, params);
        nextPrayerTime = tomorrowPrayers.fajr.getTime();
      }
    }
  }

  // If before Fajr today
  if (now < schedule[0].time) {
    currentPrayer = 'Isha (from yesterday)';
    nextPrayer = 'Fajr';
    nextPrayerTime = schedule[0].time;
  }

  const timeToNextPrayerMs = Math.max(0, nextPrayerTime - now);

  return {
    date: date.toISOString().split('T')[0],
    hijri: getHijriDate(date),
    timings,
    rawTimings,
    currentPrayer,
    nextPrayer,
    timeToNextPrayerMs,
    location: {
      latitude: lat,
      longitude: lng,
      method,
      madhab
    }
  };
}
