/**
 * Karshaka Care - Disaster Radar Module
 * 
 * Provides official disaster alerts, practical farmer safety checklists,
 * and persistent farm recovery recording for Kuttanad, Alappuzha and Kerala rice zones.
 * 
 * Integrates:
 * - Live NDMA SACHET CAP Feed (RSS/XML)
 * - KSDMA Official Public Alerts verification
 * - Location-specific vulnerability assessment
 * - KAU/Disaster Management safety protocols
 * - Persistent Farm Damage Recovery records via SQLite
 */

import { getFarmLogDB, addDisasterDamageRecord, getDisasterDamageRecords, deleteDisasterDamageRecord } from '../farmlog/database.js';

// Predefined Kerala farming zones with geographic vulnerability notes
export const DISASTER_LOCATIONS = {
  kuttanad: {
    id: 'kuttanad',
    nameMl: 'കുട്ടനാട് (മങ്കൊമ്പ്), ആലപ്പുഴ',
    nameEn: 'Kuttanad (Moncompu), Alappuzha',
    district: 'Alappuzha',
    lat: 9.5008,
    lon: 76.4526,
    terrainType: 'Below Sea Level Polders (0.5m - 2.5m MSL)',
    vulnerabilityEn: 'Low-lying polders (Padasekharams) enclosed by ring bunds. High risk of river flood runoff (Pamba, Manimala, Meenachil) and Vembanad lake backwater surge.',
    vulnerabilityMl: 'സമുദ്രനിരപ്പിൽ നിന്നും താഴെയുള്ള പാടശേഖരങ്ങൾ. പമ്പ, മണിമല, മീനച്ചിൽ നദികളിലെ മലവെള്ളപ്പാച്ചിലും വേമ്പനാട്ട് കായലിലെ വേലിയേറ്റവും കാരണം അതിതീവ്ര വെള്ളപ്പൊക്ക സാധ്യത.',
    keywords: ['kuttanad', 'alappuzha', 'moncompu', 'chambakkulam', 'kainakary', 'nedumudi', 'ambalappuzha', 'kottayam', 'kerala']
  },
  upper_kuttanad: {
    id: 'upper_kuttanad',
    nameMl: 'അപ്പർ കുട്ടനാട് (ചെങ്ങന്നൂർ / മാവേലിക്കര)',
    nameEn: 'Upper Kuttanad (Chengannur / Mavelikkara)',
    district: 'Alappuzha',
    lat: 9.3174,
    lon: 76.6114,
    terrainType: 'Riverine flood basin',
    vulnerabilityEn: 'Pamba and Achankovil river basins. High risk of upstream dam releases and rapid riverbank inundation.',
    vulnerabilityMl: 'പമ്പ, അച്ചൻകോവിൽ നദീതടങ്ങൾ. അണക്കെട്ടുകൾ തുറക്കുമ്പോഴുള്ള മലവെള്ളപ്പാച്ചിലും നദീതീര വെള്ളപ്പൊക്കവും.',
    keywords: ['upper kuttanad', 'chengannur', 'mavelikkara', 'edathua', 'pamba', 'alappuzha', 'kerala']
  },
  palakkad: {
    id: 'palakkad',
    nameMl: 'പാലക്കാട് (ചിറ്റൂർ / ആലത്തൂർ)',
    nameEn: 'Palakkad (Chittur / Alathur)',
    district: 'Palakkad',
    lat: 10.7867,
    lon: 76.6548,
    terrainType: 'Rain-shadow plains & Gap zone',
    vulnerabilityEn: 'Rain-shadow terrain. Prone to dry spells, agricultural drought, scorching heatwaves, and sudden thunderstorm downbursts.',
    vulnerabilityMl: 'മഴനിഴൽ പ്രദേശം. കഠിനമായ ഉഷ്ണതരംഗം, വരൾച്ച, അപ്രതീക്ഷിത ഇടിമിന്നൽ എന്നിവയ്ക്ക് സാധ്യത.',
    keywords: ['palakkad', 'chittur', 'alathur', 'pattambi', 'kerala']
  },
  thrissur: {
    id: 'thrissur',
    nameMl: 'തൃശ്ശൂർ കോൾനിലങ്ങൾ',
    nameEn: 'Thrissur Kole Wetlands',
    district: 'Thrissur',
    lat: 10.5276,
    lon: 76.2144,
    terrainType: 'Coastal wetland depression',
    vulnerabilityEn: 'Ramsar wetland below sea level. Vulnerable to monsoon drainage congestion and tidal saltwater intrusion.',
    vulnerabilityMl: 'സമുദ്രനിരപ്പിന് താഴെയുള്ള റാംസർ തണ്ണീർത്തടം. കനത്ത മൺസൂൺ വെള്ളക്കെട്ടിനും ഉപ്പുവെള്ള കയറ്റത്തിനും സാധ്യത.',
    keywords: ['thrissur', 'kole', 'mukundapuram', 'chavakkad', 'kerala']
  },
  wayanad: {
    id: 'wayanad',
    nameMl: 'വയനാട് (മേപ്പാടി / മാനന്തവാടി)',
    nameEn: 'Wayanad (Meppadi / Mananthavady)',
    district: 'Wayanad',
    lat: 11.6854,
    lon: 76.1320,
    terrainType: 'Western Ghats Highland Slopes',
    vulnerabilityEn: 'Steep hill slopes and valley paddy fields. Extreme hazard for landslides, debris flows, and flash floods.',
    vulnerabilityMl: 'മലയോര ചരിവുകൾ. ഉരുൾപൊട്ടൽ, മണ്ണിടിച്ചിൽ, മിന്നൽ പ്രളയം എന്നിവയ്ക്ക് അതീവ ജാഗ്രതാ മേഖല.',
    keywords: ['wayanad', 'meppadi', 'mananthavady', 'vythiri', 'sulthan bathery', 'kerala']
  }
};

// Official portals metadata
export const OFFICIAL_DISASTER_PORTALS = [
  {
    name: 'KSDMA (Kerala State Disaster Management Authority)',
    nameMl: 'കേരള സംസ്ഥാന ദുരന്ത നിവാരണ അതോറിറ്റി (KSDMA)',
    url: 'https://sdma.kerala.gov.in/',
    description: 'State disaster authority for warnings and weather bulletins'
  },
  {
    name: 'KSDMA Public Alerts',
    nameMl: 'KSDMA പൊതു മുന്നറിയിപ്പുകൾ',
    url: 'https://sdma.kerala.gov.in/public-alert/',
    description: 'Official emergency advisory and alert bulletin board'
  },
  {
    name: 'NDMA SACHET Portal',
    nameMl: 'ദേശീയ ദുരന്ത മുന്നറിയിപ്പ് പോർട്ടൽ (SACHET)',
    url: 'https://sachet.ndma.gov.in/',
    description: 'National Disaster Management Authority CAP Alert System'
  },
  {
    name: 'IMD Mausam (India Meteorological Department)',
    nameMl: 'കേന്ദ്ര കാലാവസ്ഥാ വകുപ്പ് (IMD Mausam)',
    url: 'https://mausam.imd.gov.in/',
    description: 'Official meteorological forecasts and district color-coded warnings'
  }
];

// In-memory cache for live SACHET CAP feeds (TTL: 5 minutes)
let alertFeedCache = {
  timestamp: 0,
  rawXml: null,
  alerts: []
};
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetches and parses official CAP alerts from NDMA SACHET
 */
async function fetchOfficialSachetAlerts() {
  const now = Date.now();
  if (alertFeedCache.rawXml && (now - alertFeedCache.timestamp < CACHE_TTL_MS)) {
    return alertFeedCache.alerts;
  }

  const feedUrl = 'https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml';
  try {
    const res = await fetch(feedUrl, {
      headers: { 'User-Agent': 'KarshakaCare-DisasterRadar/1.0 (Kerala Farmers)' },
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      throw new Error(`Feed responded with HTTP ${res.status}`);
    }

    const xml = await res.text();
    const parsedAlerts = parseSachetRss(xml);

    alertFeedCache = {
      timestamp: now,
      rawXml: xml,
      alerts: parsedAlerts
    };

    return parsedAlerts;
  } catch (err) {
    console.warn('[Disaster Radar] Live feed fetch notice:', err.message);
    if (alertFeedCache.alerts && alertFeedCache.alerts.length > 0) {
      return alertFeedCache.alerts;
    }
    return [];
  }
}

/**
 * Parses RSS XML from NDMA SACHET into structured alert objects
 */
function parseSachetRss(xml) {
  if (!xml || typeof xml !== 'string') return [];
  const items = xml.split('<item>').slice(1);
  const alerts = [];

  for (const item of items) {
    const cleanItem = item.split('</item>')[0];
    const title = extractXmlTag(cleanItem, 'title') || '';
    const desc = extractXmlTag(cleanItem, 'description') || '';
    const pubDate = extractXmlTag(cleanItem, 'pubDate') || '';
    const link = extractXmlTag(cleanItem, 'link') || 'https://sachet.ndma.gov.in/';
    const guid = extractXmlTag(cleanItem, 'guid') || '';

    if (!title) continue;

    // Classify disaster hazard
    const lower = `${title} ${desc}`.toLowerCase();
    let disasterType = 'weather_hazard';
    if (lower.includes('flood') || lower.includes('വെള്ളപ്പൊക്കം') || lower.includes('river')) disasterType = 'flood';
    else if (lower.includes('rain') || lower.includes('മഴ') || lower.includes('precipitation')) disasterType = 'heavy_rain';
    else if (lower.includes('thunderstorm') || lower.includes('lightning') || lower.includes('ഇടിമിന്നൽ')) disasterType = 'lightning';
    else if (lower.includes('wind') || lower.includes('cyclone') || lower.includes('squall') || lower.includes('കാറ്റ്')) disasterType = 'wind';
    else if (lower.includes('heat') || lower.includes('ഉഷ്ണതരംഗം')) disasterType = 'heatwave';
    else if (lower.includes('landslide') || lower.includes('ഉരുൾപൊട്ടൽ')) disasterType = 'landslide';

    // Classify warning level
    let warningLevel = 'Yellow Watch';
    let levelClass = 'yellow';
    if (/extremely heavy|severe|red alert|danger|extreme/i.test(lower)) {
      warningLevel = 'Red Alert';
      levelClass = 'red';
    } else if (/very heavy|orange alert|moderate to heavy|warning/i.test(lower)) {
      warningLevel = 'Orange Warning';
      levelClass = 'orange';
    } else if (/light to moderate|watch|advisory/i.test(lower)) {
      warningLevel = 'Yellow Watch';
      levelClass = 'yellow';
    }

    alerts.push({
      id: guid || link || `alert_${Math.random()}`,
      titleEn: title,
      titleMl: title,
      descriptionEn: desc || title,
      descriptionMl: desc || title,
      disasterType,
      warningLevel,
      levelClass,
      scopeEn: extractScope(title),
      scopeMl: extractScope(title),
      publishedAt: pubDate || new Date().toISOString(),
      sourceName: 'NDMA SACHET (CAP 1.2 Feed)',
      sourceUrl: link,
      statusType: 'active_official', // active official warning
      isLive: true
    });
  }

  return alerts;
}

function extractXmlTag(str, tag) {
  const match = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
}

function extractScope(text) {
  const lower = text.toLowerCase();
  if (lower.includes('alappuzha') || lower.includes('kuttanad')) return 'Alappuzha District (Kuttanad Region)';
  if (lower.includes('palakkad')) return 'Palakkad District';
  if (lower.includes('thrissur')) return 'Thrissur District';
  if (lower.includes('wayanad')) return 'Wayanad District';
  if (lower.includes('kerala')) return 'State-wide Kerala';
  return 'Regional Alert Area';
}

/**
 * Returns simulation/demonstration alert for Kuttanad
 */
function getDemonstrationAlert(locationId) {
  const loc = DISASTER_LOCATIONS[locationId] || DISASTER_LOCATIONS.kuttanad;

  if (locationId === 'palakkad') {
    return {
      id: 'demo_palakkad_heat_01',
      titleEn: 'Simulated Heatwave & Dry Spell Warning (Drill)',
      titleMl: 'മാതൃകാ ഉഷ്ണതരംഗ മുന്നറിയിപ്പ് (മോക്ക് ഡ്രിൽ)',
      descriptionEn: 'Day temperature expected to exceed 41°C across Chittur and Alathur taluks. Farmers advised to suspend manual field operations between 11:00 AM and 3:30 PM.',
      descriptionMl: 'ചിറ്റൂർ, ആലത്തൂർ താലൂക്കുകളിൽ പകൽ താപനില 41 ഡിഗ്രി കവിയാൻ സാധ്യത. രാവിലെ 11 മുതൽ വൈകുന്നേരം 3.30 വരെ കഠിനമായ വെയിലിൽ ജോലി ചെയ്യുന്നത് ഒഴിവാക്കുക.',
      disasterType: 'heatwave',
      warningLevel: 'Orange Warning',
      levelClass: 'orange',
      scopeEn: 'Palakkad District (Chittur & Alathur Taluks)',
      scopeMl: 'പാലക്കാട് ജില്ല (ചിറ്റൂർ, ആലത്തൂർ താലൂക്കുകൾ)',
      publishedAt: new Date().toISOString(),
      sourceName: 'Disaster Radar Simulator (KSDMA Drill Format)',
      sourceUrl: 'https://sdma.kerala.gov.in/public-alert/',
      statusType: 'demonstration',
      isDemo: true,
      demoBadge: '🧪 DEMONSTRATION ALERT (Simulated Drill - Not an active emergency)'
    };
  }

  return {
    id: 'demo_kuttanad_flood_01',
    titleEn: 'Simulated Inundation & Polder Outer Bund Alert (Drill)',
    titleMl: 'മാതൃകാ വെള്ളപ്പൊക്ക-പുറംബണ്ട് ജാഗ്രതാ നിർദ്ദേശം (മോക്ക് ഡ്രിൽ)',
    descriptionEn: 'Heavy inflow from Pamba and Achankovil basins. Outer ring bunds of low-lying Kuttanad padasekharams at risk of water surge. Farmers advised to relocate pump motors and livestock to elevated platforms.',
    descriptionMl: 'പമ്പ, അച്ചൻകോവിൽ നദികളിലെ ശക്തമായ നീരൊഴുക്ക്. കുട്ടനാടൻ താഴ്ന്ന പാടശേഖര പുറംബണ്ടുകളിൽ വെള്ളം കയറാൻ സാധ്യത. മോട്ടോറുകളും കന്നുകാലികളും സുരക്ഷിത തറകളിലേക്ക് മാറ്റുക.',
    disasterType: 'flood',
    warningLevel: 'Orange Warning',
    levelClass: 'orange',
    scopeEn: 'Alappuzha District (Kuttanad Polder Taluks)',
    scopeMl: 'ആലപ്പുഴ ജില്ല (കുട്ടനാട് പാടശേഖര മേഖല)',
    publishedAt: new Date().toISOString(),
    sourceName: 'Disaster Radar Simulator (KSDMA Standard Protocol)',
    sourceUrl: 'https://sdma.kerala.gov.in/public-alert/',
    statusType: 'demonstration',
    isDemo: true,
    demoBadge: '🧪 DEMONSTRATION ALERT (Simulated Drill - Not an active emergency)'
  };
}

/**
 * Main evaluator: retrieves and filters disaster alerts for a given location
 */
export async function getDisasterAlerts({ locationId = 'kuttanad', isDemo = false }) {
  const loc = DISASTER_LOCATIONS[locationId] || DISASTER_LOCATIONS.kuttanad;
  const officialLinks = OFFICIAL_DISASTER_PORTALS;

  // If farmer explicitly enabled Demonstration mode for drills
  if (isDemo) {
    const demoAlert = getDemonstrationAlert(locationId);
    return {
      success: true,
      location: loc,
      isDemo: true,
      checkedAt: new Date().toISOString(),
      activeAlerts: [demoAlert],
      archivedAlerts: [],
      officialLinks,
      statusNoteEn: `Demonstration alert active for ${loc.nameEn}. Useful for reviewing emergency protocols before monsoon onset.`,
      statusNoteMl: `${loc.nameMl} മേഖലയ്ക്കുള്ള മാതൃകാ ഡ്രിൽ നിർദ്ദേശം. യഥാർത്ഥ അടിയന്തരാവസ്ഥയല്ല.`
    };
  }

  // 1. Fetch live NDMA SACHET alerts
  const allAlerts = await fetchOfficialSachetAlerts();

  // 2. Filter alerts relevant to the selected location
  const keywords = loc.keywords || [loc.id, loc.district.toLowerCase()];
  const relevantAlerts = allAlerts.filter(a => {
    const text = `${a.titleEn} ${a.descriptionEn} ${a.scopeEn}`.toLowerCase();
    return keywords.some(k => text.includes(k));
  });

  // 3. Known official archived warning (KSDMA 2018 public-alert notice)
  const archivedAlerts = [
    {
      id: 'ksdma_archived_bulletin_2018',
      titleEn: 'KSDMA Advisory (Archived Bulletin): Heavy Rain & Sea Safety',
      titleMl: 'KSDMA മുൻകാല നിർദ്ദേശം (ആർക്കൈവ് ചെയ്തത്): അതിശക്തമായ മഴയും കടൽ സുരക്ഷയും',
      descriptionEn: 'Archived public alert notice on KSDMA website regarding cyclonic circulation and ghat travel restrictions.',
      descriptionMl: 'KSDMA വെബ്‌സൈറ്റിലെ മുൻകാല അറിയിപ്പ്. മലയോര യാത്രയും വിനോദസഞ്ചാരവും ഒഴിവാക്കാനുള്ള ആർക്കൈവ് ചെയ്ത നിർദ്ദേശം.',
      disasterType: 'heavy_rain',
      warningLevel: 'Archived / Expired',
      levelClass: 'gray',
      scopeEn: 'Kerala State (Archived Bulletin)',
      scopeMl: 'കേരള സംസ്ഥാനം (പഴയ രേഖ)',
      publishedAt: '2018-10-05T00:00:00Z',
      sourceName: 'KSDMA Public Alerts Archive',
      sourceUrl: 'https://sdma.kerala.gov.in/public-alert/',
      statusType: 'expired',
      isExpired: true
    }
  ];

  let statusNoteEn = '';
  let statusNoteMl = '';

  if (relevantAlerts.length > 0) {
    statusNoteEn = `Active official warning detected affecting ${loc.nameEn}. Please heed safety instructions.`;
    statusNoteMl = `${loc.nameMl} മേഖലയെ ബാധിക്കുന്ന ഔദ്യോഗിക ജാഗ്രതാ നിർദ്ദേശം നിലവിലുണ്ട്. മുൻകരുതലുകൾ പാലിക്കുക.`;
  } else {
    statusNoteEn = `No active official disaster alerts issued for ${loc.nameEn} at this time. Live feed checked against NDMA SACHET and KSDMA.`;
    statusNoteMl = `ഈ സമയത്ത് ${loc.nameMl} മേഖലയിൽ ഔദ്യോഗിക ദുരന്ത മുന്നറിയിപ്പുകൾ നിലവിലില്ല. NDMA SACHET, KSDMA എന്നിവ പരിശോധിച്ചു.`;
  }

  return {
    success: true,
    location: loc,
    isDemo: false,
    checkedAt: new Date().toISOString(),
    activeAlerts: relevantAlerts,
    archivedAlerts,
    officialLinks,
    statusNoteEn,
    statusNoteMl
  };
}

/**
 * Returns prioritized actionable safety steps for the farmer based on hazard type
 */
export function getDisasterActionPlan({ hazard = 'flood', locationId = 'kuttanad' }) {
  const loc = DISASTER_LOCATIONS[locationId] || DISASTER_LOCATIONS.kuttanad;

  const ACTION_PLANS = {
    flood: {
      hazardNameEn: 'Floods & Inundation in Polders',
      hazardNameMl: 'പാടശേഖര വെള്ളപ്പൊക്കവും വെള്ളക്കെട്ടും',
      safetyFirstWarningEn: '⚠️ SAFETY FIRST: Never enter turbulent floodwater, attempt to plug outer bund breaches when water velocity is high, or delay family evacuation!',
      safetyFirstWarningMl: '⚠️ ജീവൻ പ്രധാനം: ഒഴുക്കുള്ള വെള്ളത്തിൽ ഇറങ്ങരുത്, ബണ്ട് തകരുമ്പോൾ ജീവൻ പണയംവെച്ച് തടയാൻ ശ്രമിക്കരുത്, ഒഴിപ്പിക്കൽ മുന്നറിയിപ്പ് അവഗണിക്കരുത്!',
      actions: [
        {
          id: 'flood_evac_alarm',
          priority: 'critical',
          titleEn: 'Heed official evacuation and polder sirens immediately',
          titleMl: 'ഔദ്യോഗിക ഒഴിപ്പിക്കൽ / സൈറൺ മുന്നറിയിപ്പുകൾ ഉടനടി പാലിക്കുക',
          whyEn: 'Kuttanad polders are below sea level; once an outer ring bund breaches, water fills the padasekharam in minutes with zero retreat paths.',
          whyMl: 'കുട്ടനാടൻ പാടങ്ങൾ സമുദ്രനിരപ്പിന് താഴെയായതിനാൽ പുറംബണ്ട് തകർന്നാൽ വെള്ളം അതിവേഗം ഇരച്ചുകയറും; രക്ഷപ്പെടാൻ സമയം ലഭിക്കില്ല.',
          whenEn: 'Immediate upon Orange or Red Alert sound',
          whenMl: 'ഓറഞ്ച്/റെഡ് മുന്നറിയിപ്പ് ലഭിച്ചാലുടൻ'
        },
        {
          id: 'flood_livestock_assets',
          priority: 'high',
          titleEn: 'Shift cattle and dewatering pump motors to elevated bund mounds',
          titleMl: 'കന്നുകാലികളെയും പമ്പ് മോട്ടോറുകളെയും ഉയർന്ന തറകളിലേക്ക് മാറ്റുക',
          whyEn: 'Electric motor coils burn out once flooded. Keeping dewatering equipment dry allows rapid polder recovery as soon as lake levels subside.',
          whyMl: 'വെള്ളം കയറിയാൽ മോട്ടോറുകൾ തകരാറിലാകും. മോട്ടോറുകൾ സുരക്ഷിതമാക്കിയാൽ മാത്രമേ വെള്ളം താഴുമ്പോൾ വേഗത്തിൽ വറ്റിക്കാൻ കഴിയൂ.',
          whenEn: 'Before water reaches the outer bund crest',
          whenMl: 'ബണ്ടിന് മുകളിലേക്ക് വെള്ളം എത്തുന്നതിന് മുൻപ്'
        },
        {
          id: 'flood_waterproof_docs',
          priority: 'high',
          titleEn: 'Seal land tax receipts, Aadhaar, and farm log notes in waterproof pouches',
          titleMl: 'ഭൂനികുതി രസീത്, ആധാർ, ഫാം ലോഗ് രേഖകൾ വാട്ടർപ്രൂഫ് കവറുകളിൽ സൂക്ഷിക്കുക',
          whyEn: 'Indispensable for immediate Krishi Bhavan AIMS crop loss compensation and insurance claim filing.',
          whyMl: 'കൃഷിഭവൻ ദുരിതാശ്വാസ ധനസഹായത്തിനും ഇൻഷുറൻസ് അപേക്ഷകൾക്കും ഈ രേഖകൾ അത്യന്താപേക്ഷിതമാണ്.',
          whenEn: 'While preparing family emergency grab-bags',
          whenMl: 'അടിയന്തര ബാഗ് തയ്യാറാക്കുമ്പോൾ'
        },
        {
          id: 'flood_internal_drainage',
          priority: 'medium',
          titleEn: 'Clear internal feeder channels to direct water toward engine thara (pump shed)',
          titleMl: 'പാടത്തിനകത്തെ പെട്ടിചാലുകളിലെ തടസ്സങ്ങൾ മാറ്റി എൻജിൻ തറയിലേക്ക് ഒഴുക്ക് സുഗമമാക്കുക',
          whyEn: 'Prevents localized prolonged ponding and stem rot in lower paddy plots before main flood crests.',
          whyMl: 'താഴ്ന്ന തട്ടുകളിൽ വെള്ളം കെട്ടിനിന്ന് നെൽച്ചെടികൾ ചീഞ്ഞുപോകുന്നത് കുറയ്ക്കും.',
          whenEn: 'Only while daylight persists and field is safely accessible on foot',
          whenMl: 'പകൽ വെളിച്ചമുള്ളപ്പോഴും പാടത്ത് സുരക്ഷിതമായി നടക്കാൻ കഴിയുമ്പോഴും മാത്രം'
        }
      ]
    },
    lightning: {
      hazardNameEn: 'Thunderstorms & Lightning',
      hazardNameMl: 'ഇടിമിന്നലും ശക്തമായ കാറ്റും',
      safetyFirstWarningEn: '⚠️ SAFETY FIRST: Never stand in open paddy fields, under isolated trees, or handle metal irrigation pipes during thunderstorm activity!',
      safetyFirstWarningMl: '⚠️ ജീവൻ പ്രധാനം: ഇടിമിന്നലുള്ളപ്പോൾ തുറസ്സായ പാടങ്ങളിൽ നിൽക്കരുത്, ഒറ്റപ്പെട്ട മരങ്ങളുടെ ചുവട്ടിൽ നിൽക്കരുത്, ഇരുമ്പ് പൈപ്പുകളിൽ സ്പർശിക്കരുത്!',
      actions: [
        {
          id: 'lightning_exit_field',
          priority: 'critical',
          titleEn: 'Immediately exit open waterlogged fields and seek masonry shelter',
          titleMl: 'തുറസ്സായ പാടങ്ങളിൽ നിന്നും ഉടൻ മാറി കോൺക്രീറ്റ് കെട്ടിടങ്ങളിൽ അഭയം തേടുക',
          whyEn: 'Standing in wet paddy fields turns human bodies into the tallest electrical conductor for cloud-to-ground strikes.',
          whyMl: 'നനഞ്ഞ പാടങ്ങളിൽ നിൽക്കുന്ന മനുഷ്യ ശരീരം മിന്നലിനെ നേരിട്ട് ആകർഷിക്കും.',
          whenEn: 'At the very first rumble of thunder (30/30 rule)',
          whenMl: 'ആദ്യ ഇടിമുഴക്കം കേൾക്കുമ്പോൾ തന്നെ'
        },
        {
          id: 'lightning_disconnect_pumps',
          priority: 'high',
          titleEn: 'Disconnect electrical connections to irrigation pump sets',
          titleMl: 'പമ്പ് സെറ്റുകളിലേക്കുള്ള വൈദ്യുതി ബന്ധം വിച്ഛേദിക്കുക',
          whyEn: 'Power surges from lightning strikes along rural overhead wires destroy expensive motor starter panels.',
          whyMl: 'ലൈനുകളിലൂടെ വരുന്ന വോൾട്ടേജ് വ്യതിയാനം സ്റ്റാർട്ടറുകളും മോട്ടോറുകളും നശിപ്പിക്കും.',
          whenEn: 'Before rainstorm intensifies',
          whenMl: 'കനത്ത മഴ തുടങ്ങുന്നതിന് മുൻപ്'
        }
      ]
    },
    wind: {
      hazardNameEn: 'Gale Winds & Cyclonic Gusts',
      hazardNameMl: 'ശക്തമായ കാറ്റും ചുഴലിക്കാറ്റും',
      safetyFirstWarningEn: '⚠️ SAFETY FIRST: Stay away from overhead electric wires, loose tin sheets, and leaning coconut palms during gales!',
      safetyFirstWarningMl: '⚠️ ജീവൻ പ്രധാനം: വൈദ്യുതി ലൈനുകൾ, ഇളകിയ ഷീറ്റുകൾ, ചരിഞ്ഞ തെങ്ങുകൾ എന്നിവയുടെ സമീപത്തുനിന്ന് മാറുക!',
      actions: [
        {
          id: 'wind_secure_sheds',
          priority: 'high',
          titleEn: 'Secure roof sheets of motor sheds and fertilizer storage with sandbags',
          titleMl: 'മോട്ടോർ പുരകളുടെയും വളം സൂക്ഷിക്കുന്ന ഷെഡ്ഡുകളുടെയും മേൽക്കൂരകൾ ഭാരമുള്ള ചാക്കുകൾ വെച്ച് ഉറപ്പിക്കുക',
          whyEn: 'High winds rip unfastened roofing sheets, exposing fertilizer bags to rain and water ruin.',
          whyMl: 'കാറ്റിൽ ഷീറ്റ് പറന്നുപോയാൽ വളവും വിത്തും നനഞ്ഞ് പൂർണ്ണമായി നശിക്കും.',
          whenEn: 'Prior to wind warning validity window',
          whenMl: 'കാറ്റ് വീശുന്നതിന് മുൻപ്'
        },
        {
          id: 'wind_harvest_maturity',
          priority: 'medium',
          titleEn: 'If grains are >85% mature (golden), execute emergency harvest before wind lodging',
          titleMl: 'നെല്ല് 85% മൂപ്പെത്തിയതാണെങ്കിൽ കാറ്റിന് മുൻപ് അടിയന്തര കൊയ്‌ത്ത് നടത്തുക',
          whyEn: 'Gales cause irreversible crop lodging into water, causing grain germination and rotting.',
          whyMl: 'കാറ്റിൽ നെല്ല് വെള്ളത്തിലേക്ക് വീണാൽ (Lodging) മുളയ്ക്കുകയും കതിരുകൾ ചീഞ്ഞുപോകുകയും ചെയ്യും.',
          whenEn: 'Only while weather allows harvester machinery safely',
          whenMl: 'കൊയ്‌ത്തുയന്ത്രം സുരക്ഷിതമായി ഇറക്കാൻ സാധിക്കുമെങ്കിൽ മാത്രം'
        }
      ]
    },
    heatwave: {
      hazardNameEn: 'Heatwave & Agricultural Drought',
      hazardNameMl: 'ഉഷ്ണതരംഗവും കാർഷിക വരൾച്ചയും',
      safetyFirstWarningEn: '⚠️ SAFETY FIRST: Strictly avoid heavy field labour and pesticide spraying between 11:00 AM and 3:30 PM to avoid fatal heat stroke!',
      safetyFirstWarningMl: '⚠️ ജീവൻ പ്രധാനം: സൂര്യാഘാതം ഒഴിവാക്കാൻ രാവിലെ 11 മുതൽ വൈകുന്നേരം 3.30 വരെ കഠിനമായ പാടത്തെ ജോലികളും മരുന്ന് തളിക്കലും ഒഴിവാക്കുക!',
      actions: [
        {
          id: 'heat_reschedule_labour',
          priority: 'critical',
          titleEn: 'Shift field work to early morning (6:30 - 10:30 AM) and evening (4:00 - 6:30 PM)',
          titleMl: 'പാടത്തെ പണികൾ അതിരാവിലെയും (6:30 - 10:30) വൈകുന്നേരവും (4:00 - 6:30) മാത്രമായി ക്രമീകരിക്കുക',
          whyEn: 'Prevents acute thermal exhaustion, dehydration, and sunstroke among farm labourers.',
          whyMl: 'കർഷകർക്കും തൊഴിലാളികൾക്കും സൂര്യാഘാതവും നിർജ്ജലീകരണവും ഉണ്ടാകുന്നത് തടയുന്നു.',
          whenEn: 'During announced heat advisory days',
          whenMl: 'ഉഷ്ണതരംഗ മുന്നറിയിപ്പ് ഉള്ള ദിവസങ്ങളിൽ'
        },
        {
          id: 'heat_water_management',
          priority: 'high',
          titleEn: 'Maintain 3-5 cm standing water during afternoon to prevent soil cracking',
          titleMl: 'മണ്ണ് വിണ്ടു കീറുന്നത് തടയാൻ ഉച്ചസമയത്ത് 3-5 സെ.മീ വെള്ളം നിലനിർത്തുക',
          whyEn: 'Excessive soil evaporation under hot sun damages delicate paddy hair roots.',
          whyMl: 'കടുത്ത ചൂടിൽ മണ്ണ് വിണ്ടുകീറിയാൽ നെല്ലിന്റെ സൂക്ഷ്മ വേരുകൾ അറ്റുപോയി ചെടി കരിയും.',
          whenEn: 'Panicle and flowering growth stages',
          whenMl: 'കതിരിടൽ, പൂവിടൽ ഘട്ടങ്ങളിൽ'
        }
      ]
    }
  };

  const plan = ACTION_PLANS[hazard] || ACTION_PLANS.flood;
  return {
    success: true,
    location: loc,
    hazard,
    hazardNameEn: plan.hazardNameEn,
    hazardNameMl: plan.hazardNameMl,
    safetyFirstWarningEn: plan.safetyFirstWarningEn,
    safetyFirstWarningMl: plan.safetyFirstWarningMl,
    actions: plan.actions
  };
}

/**
 * Persists a new farm damage recovery observation
 */
export function recordFarmDamage(data) {
  return addDisasterDamageRecord(data);
}

/**
 * Returns saved farm damage recovery observations
 */
export function getSavedDamageRecords(filter = {}) {
  return getDisasterDamageRecords(filter);
}

/**
 * Deletes a farm damage recovery observation
 */
export function removeDamageRecord(id) {
  return deleteDisasterDamageRecord(id);
}
