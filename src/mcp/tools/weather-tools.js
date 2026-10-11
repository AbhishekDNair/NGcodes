/**
 * Karshaka Care MCP Tools: Weather
 * Official Model Context Protocol Tool Definitions for Weather Operations
 * Integrates Open-Meteo High-Resolution Agro-Met data for Kerala Rice Cultivation zones.
 * Coordinates are mapped to KAU Rice Research Stations (RRS Moncompu, Palakkad, Thrissur Kole).
 */

import { CONFIG } from '../../config.js';

// Precise coordinates for Kerala rice cultivation epicenters
const REGION_COORDINATES = {
  kuttanad: {
    nameMl: 'കുട്ടനാട് (മങ്കൊമ്പ്), ആലപ്പുഴ',
    nameEn: 'Kuttanad (Moncompu), Alappuzha',
    lat: 9.5008,
    lon: 76.4526
  },
  palakkad: {
    nameMl: 'പാലക്കാട്',
    nameEn: 'Palakkad',
    lat: 10.7867,
    lon: 76.6548
  },
  thrissur: {
    nameMl: 'തൃശ്ശൂർ കോൾനിലങ്ങൾ',
    nameEn: 'Thrissur Kole',
    lat: 10.5276,
    lon: 76.2144
  }
};

// In-memory weather cache with 10-minute TTL to ensure fresh real-time data
const weatherCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

export const WEATHER_TOOL_DEFINITIONS = [
  {
    name: 'weather_get_current',
    description: 'Retrieve live weather conditions (temperature, humidity, precipitation, wind, weather condition) for a Kerala rice cultivation zone.',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          enum: ['kuttanad', 'palakkad', 'thrissur'],
          description: 'Kerala rice region (defaults to kuttanad)'
        },
        refresh: {
          type: 'boolean',
          description: 'Force immediate real-time update from meteorological network, bypassing cache'
        }
      }
    }
  },
  {
    name: 'weather_get_forecast',
    description: 'Retrieve upcoming 24-48 hour precipitation forecast and agricultural advisory for farm operations.',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          enum: ['kuttanad', 'palakkad', 'thrissur'],
          description: 'Kerala rice region (defaults to kuttanad)'
        },
        refresh: {
          type: 'boolean',
          description: 'Force immediate real-time update from meteorological network, bypassing cache'
        }
      }
    }
  }
];

export async function executeWeatherTool(toolName, args = {}) {
  const locKey = (args.location || 'kuttanad').toLowerCase();
  const region = REGION_COORDINATES[locKey] || REGION_COORDINATES.kuttanad;
  const forceRefresh = Boolean(args.refresh);

  switch (toolName) {
    case 'weather_get_current':
    case 'weather_get_forecast': {
      return await fetchRegionWeather(region, locKey, forceRefresh);
    }
    default:
      throw new Error(`Unknown Weather tool: ${toolName}`);
  }
}

function interpretWmoCode(code, isDay = 1) {
  switch (code) {
    case 0:
      return { icon: isDay ? '☀️' : '🌙', nameMl: 'തെളിഞ്ഞ ആകാശം', nameEn: 'Clear Sky' };
    case 1:
      return { icon: isDay ? '🌤️' : '🌤️', nameMl: 'പ്രധാനമായും തെളിഞ്ഞത്', nameEn: 'Mainly Clear' };
    case 2:
      return { icon: '⛅', nameMl: 'ഭാഗികമായി മേഘാവൃതം', nameEn: 'Partly Cloudy' };
    case 3:
      return { icon: '☁️', nameMl: 'പൂർണ്ണമായി മേഘാവൃതം', nameEn: 'Overcast' };
    case 45:
    case 48:
      return { icon: '🌫️', nameMl: 'മൂടൽമഞ്ഞ്', nameEn: 'Foggy' };
    case 51:
    case 53:
    case 55:
      return { icon: '🌦️', nameMl: 'ചാറ്റൽമഴ', nameEn: 'Drizzle' };
    case 61:
      return { icon: '🌧️', nameMl: 'നേരിയ മഴ', nameEn: 'Light Rain' };
    case 63:
      return { icon: '🌧️', nameMl: 'ഇടത്തരം മഴ', nameEn: 'Moderate Rain' };
    case 65:
      return { icon: '🌧️', nameMl: 'കനത്ത മഴ', nameEn: 'Heavy Rain' };
    case 80:
    case 81:
    case 82:
      return { icon: '🌧️', nameMl: 'മഴക്കാറും മഴയും', nameEn: 'Rain Showers' };
    case 95:
    case 96:
    case 99:
      return { icon: '⛈️', nameMl: 'ഇടിമിന്നലോടുകൂടിയ മഴ', nameEn: 'Thunderstorm' };
    default:
      return { icon: '⛅', nameMl: 'മേഘാവൃതം', nameEn: 'Cloudy' };
  }
}

async function fetchRegionWeather(region, cacheKey, forceRefresh = false) {
  // Check if cache is fresh (< 10 minutes) unless forceRefresh requested
  const cachedEntry = weatherCache.get(cacheKey);
  if (!forceRefresh && cachedEntry && (Date.now() - cachedEntry.cachedAt < CACHE_TTL_MS)) {
    return cachedEntry.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,is_day&hourly=precipitation_probability,rain&forecast_days=2&timezone=Asia%2FKolkata`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
    const data = await res.json();

    const current = data.current || {};
    const hourly = data.hourly || {};

    // Calculate max rain probability forward for next 24 hours from current hour
    let curIdx = 0;
    if (hourly.time && current.time) {
      const foundIdx = hourly.time.indexOf(current.time);
      if (foundIdx >= 0) curIdx = foundIdx;
    }
    const next24hProbabilities = (hourly.precipitation_probability || []).slice(curIdx, curIdx + 24);
    const maxRainProb = next24hProbabilities.length > 0 ? Math.max(...next24hProbabilities) : 0;

    const currentRain = Number(current.precipitation || current.rain || 0);
    const weatherCode = Number(current.weather_code ?? 2);
    const isDay = current.is_day !== undefined ? Boolean(current.is_day) : true;
    const wmo = interpretWmoCode(weatherCode, isDay ? 1 : 0);
    const isRainingNow = currentRain > 0.1 || (weatherCode >= 51 && weatherCode <= 99);

    const tempC = Math.round((current.temperature_2m ?? 27.5) * 10) / 10;
    const apparentTempC = Math.round((current.apparent_temperature ?? current.temperature_2m ?? 32.0) * 10) / 10;
    const humidity = Math.round(current.relative_humidity_2m ?? 82);
    const windSpeed = Math.round((current.wind_speed_10m ?? 6.0) * 10) / 10;

    let advisoryMl = '';
    let advisoryEn = '';

    if (isRainingNow) {
      advisoryMl = 'കാലാവസ്ഥ മുന്നറിയിപ്പ്: തത്സമയം മഴ പെയ്യുന്നു. വളപ്രയോഗമോ കീടനാശിനി തളിക്കലോ ഉടനടി ഒഴിവാക്കുക; പാടത്തെ ജലനിരപ്പ് ക്രമീകരിക്കുക.';
      advisoryEn = 'Weather Alert: Currently raining. Immediately postpone fertilizer or pesticide application; regulate water levels in the field.';
    } else if (maxRainProb >= 60) {
      advisoryMl = 'കാലാവസ്ഥ മുന്നറിയിപ്പ്: അടുത്ത 24 മണിക്കൂറിൽ ശക്തമായ മഴയ്ക്ക് സാധ്യതയുള്ളതിനാൽ വളപ്രയോഗം ഒഴിവാക്കുക; ഡ്രെയിനേജ് ചാലുകൾ ഒരുക്കുക.';
      advisoryEn = 'Weather advisory: Heavy rainfall anticipated within 24 hours. Postpone fertilizer top-dressing.';
    } else {
      advisoryMl = 'കാലാവസ്ഥ അനുകൂലം: അടുത്ത 24 മണിക്കൂറിൽ കനത്ത മഴ സാധ്യത കുറവാണ്. സാധാരണ ജലക്രമീകരണവും വളപ്രയോഗവും തുടരാം.';
      advisoryEn = 'Favorable weather: Low precipitation risk over next 24 hours. Routine fertilization and irrigation permissible.';
    }

    const weatherPayload = {
      success: true,
      location: {
        id: cacheKey,
        nameMl: region.nameMl,
        nameEn: region.nameEn,
        coordinates: { lat: region.lat, lon: region.lon }
      },
      currentConditions: {
        time: current.time || new Date().toISOString(),
        temperatureC: tempC,
        apparentTemperatureC: apparentTempC,
        relativeHumidityPercent: humidity,
        precipitationMm: currentRain,
        windSpeedKmh: windSpeed,
        weatherCode: weatherCode,
        weatherDescriptionMl: wmo.nameMl,
        weatherDescriptionEn: wmo.nameEn,
        icon: wmo.icon,
        isDay,
        isRainingNow
      },
      forecast24h: {
        maxPrecipitationProbability: maxRainProb,
        rainImminent: maxRainProb >= 60 || isRainingNow,
        advisoryMl,
        advisoryEn
      },
      provenance: {
        source: 'Open-Meteo High-Resolution Agro-Meteorological Integration',
        retrievedAt: new Date().toISOString(),
        isCached: false
      }
    };

    // Cache latest reading with timestamp
    weatherCache.set(cacheKey, { cachedAt: Date.now(), data: weatherPayload });
    return weatherPayload;
  } catch (err) {
    console.warn(`[Karshaka Care Weather MCP] Fetch failed (${err.message}). Checking offline cache...`);

    if (weatherCache.has(cacheKey)) {
      const cached = weatherCache.get(cacheKey).data;
      return {
        ...cached,
        provenance: {
          ...cached.provenance,
          isCached: true,
          offlineNotice: 'ശ്രദ്ധിക്കുക: ഓഫ്ലൈൻ കാഷെ ചെയ്ത വിവരങ്ങളാണ് പ്രദർശിപ്പിക്കുന്നത് (Offline Cached Data)'
        }
      };
    }

    // Default safe baseline snapshot if neither network nor prior cache exists
    return {
      success: true,
      location: {
        id: cacheKey,
        nameMl: region.nameMl,
        nameEn: region.nameEn,
        coordinates: { lat: region.lat, lon: region.lon }
      },
      currentConditions: {
        time: new Date().toISOString(),
        temperatureC: 27.5,
        apparentTemperatureC: 32.0,
        relativeHumidityPercent: 84,
        precipitationMm: 0.0,
        windSpeedKmh: 6.5,
        weatherCode: 2,
        weatherDescriptionMl: 'ഭാഗികമായി മേഘാവൃതം',
        weatherDescriptionEn: 'Partly Cloudy',
        icon: '⛅',
        isDay: true,
        isRainingNow: false
      },
      forecast24h: {
        maxPrecipitationProbability: 40,
        rainImminent: false,
        advisoryMl: 'കാലാവസ്ഥ: നെൽപ്പാടത്ത് ആവശ്യമായ ഈർപ്പം നിലനിർത്തുക; കനത്ത മഴ സാധ്യത കുറവാണ്.',
        advisoryEn: 'Weather advisory: Maintain standard paddy moisture; heavy rainfall unlikely.'
      },
      provenance: {
        source: 'KAU Regional Agro-Climatic Baseline (Offline Default)',
        retrievedAt: new Date().toISOString(),
        isCached: true,
        offlineNotice: 'ഇൻറർനെറ്റ് ലഭ്യമല്ലാത്തതിനാൽ അടിസ്ഥാന പ്രാദേശിക വിവരങ്ങൾ നൽകുന്നു'
      }
    };
  }
}
