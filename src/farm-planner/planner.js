/**
 * Karshaka Care - Adaptive Farm Planner
 * 
 * Analyzes farmer's FarmLog history (previous activities, observations, crop stage),
 * weather context, and Kerala Agricultural University (KAU) Package of Practices (POP)
 * guidelines to generate adaptive, explainable next-step recommendations and clarifying questions.
 */

export const KAU_STAGE_GUIDELINES = {
  seedling: {
    nameEn: 'Seedling Stage',
    nameMl: 'മുളപ്പൊട്ടൽ ഘട്ടം',
    daysRange: '0-21 DAT',
    standardActivities: [
      {
        id: 'seedling_water',
        priority: 'high',
        triggerAfterDays: 0,
        titleEn: 'Maintain shallow water level (2-3 cm)',
        titleMl: '2-3 സെ.മീ ആഴം കുറഞ്ഞ ജലനിരപ്പ് നിലനിർത്തുക',
        reasonEn: 'Young seedling roots require oxygen. Excessive standing water drowns young seedlings and inhibits tillering. (KAU POP §4.2.1)',
        reasonMl: 'തൈകളുടെ വേരുകൾക്ക് ഓക്‌സിജൻ ലഭ്യത ആവശ്യമാണ്. അമിത ജലം തൈകളെ മുക്കുകയും ചിനപ്പുകൾ വരുന്നത് തടയുകയും ചെയ്യും. (KAU POP §4.2.1)'
      },
      {
        id: 'seedling_gap_filling',
        priority: 'medium',
        triggerAfterDays: 7,
        titleEn: 'Gap filling and seedling thinning at 7-10 DAT',
        titleMl: '7-10 DAT-ൽ വിടവ് നികത്തലും (Gap filling) തൈ തിങ്ങിയിടത്ത് പറിച്ചുമാറ്റലും',
        reasonEn: 'Ensures optimal plant population per square meter before tillering starts. (KAU POP §4.1.3)',
        reasonMl: 'ചിനപ്പുപൊട്ടൽ തുടങ്ങുന്നതിന് മുൻപ് പാടത്ത് കൃത്യമായ ചെടികളുടെ സാന്ദ്രത ഉറപ്പാക്കുന്നു. (KAU POP §4.1.3)'
      },
      {
        id: 'seedling_n_split1',
        priority: 'medium',
        triggerAfterDays: 12,
        titleEn: 'Apply basal / early Nitrogen (Urea 50 kg/ha) at 10-14 DAT',
        titleMl: '10-14 DAT-ൽ ബേസൽ നൈട്രജൻ (യൂറിയ 50 കി.ഗ്രാം/ഹെ) നൽകുക',
        reasonEn: 'Promotes vigorous early root elongation and leaf canopy development. (KAU POP §4.3)',
        reasonMl: 'ആദ്യ വേരുപടലവും ഇലകളും കരുത്തോടെ വളരാൻ സഹായിക്കുന്നു. (KAU POP §4.3)'
      }
    ]
  },
  tillering: {
    nameEn: 'Tillering Stage',
    nameMl: 'ചിനപ്പുപൊട്ടൽ ഘട്ടം',
    daysRange: '22-45 DAT',
    standardActivities: [
      {
        id: 'tillering_water_drain',
        priority: 'high',
        triggerAfterDays: 0,
        titleEn: 'Alternate Wetting and Drying (AWD) – maintain 2-3 cm for 3 days, then drain 1-2 days',
        titleMl: 'ഇടവിട്ടുള്ള ജലസേചനം (AWD) – 3 ദിവസം 2-3 സെ.മീ വെള്ളം, 1-2 ദിവസം നേരിയ ഉണക്കം',
        reasonEn: 'AWD saves 30% water and enhances soil oxygen, triggering active tiller bud formation. (KAU POP §5.1)',
        reasonMl: 'AWD ജലഉപഭോഗം 30% കുറയ്ക്കുകയും വേരുകളിലേക്ക് ഓക്‌സിജൻ കടത്തി ചിനപ്പുകൾ ഇരട്ടിയാക്കുകയും ചെയ്യും. (KAU POP §5.1)'
      },
      {
        id: 'tillering_n_split2',
        priority: 'high',
        triggerAfterDays: 4,
        titleEn: 'Top-dress second dose of Nitrogen (Urea 50 kg/ha) on moist field',
        titleMl: 'നനഞ്ഞ പാടത്ത് രണ്ടാം തവണ നൈട്രജൻ (യൂറിയ 50 കി.ഗ്രാം/ഹെ) ടോപ്-ഡ്രസ് ചെയ്യുക',
        reasonEn: 'Peak tiller production occurs at 25-35 DAT. Nitrogen is vital for productive panicle-bearing tillers. (KAU POP §4.3.2)',
        reasonMl: '25-35 DAT-ൽ ചിനപ്പ് ഉൽപ്പാദനം പരമാവധിയിലാണ്. കതിരുള്ള ചിനപ്പുകൾ ഉണ്ടാകാൻ നൈട്രജൻ അത്യന്താപേക്ഷിതമാണ്. (KAU POP §4.3.2)'
      },
      {
        id: 'tillering_weed',
        priority: 'medium',
        triggerAfterDays: 3,
        titleEn: 'Perform second weeding (manual or cono-weeder) at 25-30 DAT',
        titleMl: '25-30 DAT-ൽ രണ്ടാം കളനിയന്ത്രണം (കൈകൊണ്ടോ കോണോ വീഡർ ഉപയോഗിച്ചോ) നടത്തുക',
        reasonEn: 'Weeds compete directly for nutrients and sunlight during active tillering, reducing potential yield up to 40%. (KAU POP §6.2)',
        reasonMl: 'ചിനപ്പ് ഘട്ടത്തിലെ കളകൾ പോഷകങ്ങളും വെളിച്ചവും കവർന്നെടുത്ത് വിളവ് 40% വരെ കുറയ്ക്കും. (KAU POP §6.2)'
      },
      {
        id: 'tillering_disease_scout',
        priority: 'medium',
        triggerAfterDays: 1,
        titleEn: 'Scout foliage for early Brown Spot or Leaf Blast lesions',
        titleMl: 'ഇലകളിൽ ഇലപ്പുള്ളി, ഇലക്കരിച്ചിൽ ലക്ഷണങ്ങൾക്കായി പരിശോധന നടത്തുക',
        reasonEn: 'Microclimate humidity inside thick tillers increases fungal infection risk. Early detection prevents widespread outbreak. (KAU POP §7.1)',
        reasonMl: 'കൂടിയ ചിനപ്പുകൾക്കിടയിലെ ഈർപ്പം കുമിൾ രോഗങ്ങൾക്ക് കാരണമാകും. തുടക്കത്തിലേ കണ്ടെത്തുന്നത് പടരുന്നത് തടയും. (KAU POP §7.1)'
      }
    ]
  },
  panicle: {
    nameEn: 'Panicle Initiation Stage',
    nameMl: 'കതിരിടൽ ഘട്ടം',
    daysRange: '46-65 DAT',
    standardActivities: [
      {
        id: 'panicle_flood_maintain',
        priority: 'critical',
        triggerAfterDays: 0,
        titleEn: 'Maintain 5 cm continuous standing water (critical moisture period)',
        titleMl: '5 സെ.മീ ജലനിരപ്പ് തുടർച്ചയായി നിലനിർത്തുക (നിർണ്ണായക ഈർപ്പ ഘട്ടം)',
        reasonEn: 'Water deficit during panicle initiation causes spikelet abortion and incomplete panicle emergence. (KAU POP §5.2)',
        reasonMl: 'കതിരിടുന്ന സമയത്തെ ജലക്ഷാമം മണികൾ പൊള്ളയാകാനും കതിരുകൾ പൂർണ്ണമായി പുറത്തുവരാതിരിക്കാനും ഇടയാക്കും. (KAU POP §5.2)'
      },
      {
        id: 'panicle_k_split',
        priority: 'high',
        triggerAfterDays: 2,
        titleEn: 'Apply Potassium top-dress (Muriate of Potash / MOP 50 kg/ha)',
        titleMl: 'പൊട്ടാഷ് വളം ടോപ്-ഡ്രസ് ചെയ്യുക (MOP 50 കി.ഗ്രാം/ഹെ)',
        reasonEn: 'Potassium strengthens stem wall, prevents lodging under heavy panicle load, and improves grain filling. (KAU POP §4.4)',
        reasonMl: 'പൊട്ടാഷ് തണ്ടുകൾക്ക് കരുത്തുനൽകി വീണുപോകുന്നത് തടയുകയും ധാന്യങ്ങൾ തൂക്കമുള്ളതാക്കുകയും ചെയ്യും. (KAU POP §4.4)'
      },
      {
        id: 'panicle_blast_protection',
        priority: 'high',
        triggerAfterDays: 3,
        titleEn: 'Prophylactic inspection for Neck Blast; apply Pseudomonas fluorescens (20g/L)',
        titleMl: 'കതിർക്കരിച്ചിൽ മുൻകരുതൽ പരിശോധന; സ്യൂഡോമോണസ് ഫ്ലൂറസെൻസ് (20 ഗ്രാം/ലിറ്റർ) തളിക്കുക',
        reasonEn: 'Neck blast at heading stage damages panicle node and causes total grain loss (chaffy panicles). (KAU POP §7.2)',
        reasonMl: 'കതിർക്കരിച്ചിൽ കതിരിന്റെ കഴുത്ത് ഒടിച്ച് നെല്ല് മുഴുവൻ പതിരാക്കും. മുൻകരുതൽ അനിവാര്യമാണ്. (KAU POP §7.2)'
      }
    ]
  },
  flowering: {
    nameEn: 'Flowering Stage',
    nameMl: 'പൂവിടൽ ഘട്ടം',
    daysRange: '66-80 DAT',
    standardActivities: [
      {
        id: 'flowering_no_spray',
        priority: 'critical',
        triggerAfterDays: 0,
        titleEn: 'DO NOT spray any chemical pesticides during anthesis / flowering',
        titleMl: 'പൂവിടുന്ന സമയത്ത് യാതൊരു രാസകീടനാശിനികളും തളിക്കരുത്',
        reasonEn: 'Foliar sprays during flowering wash away pollen grains, disrupt pollination, and kill vital beneficial pollinators. (KAU POP §8.1)',
        reasonMl: 'പൂവിടുന്ന സമയത്ത് സ്‌പ്രേ ചെയ്യുന്നത് പൂമ്പൊടി കഴുകിക്കളയുകയും പരാഗണം തടസ്സപ്പെടുത്തുകയും ചെയ്യും. (KAU POP §8.1)'
      },
      {
        id: 'flowering_water_maintain',
        priority: 'critical',
        triggerAfterDays: 0,
        titleEn: 'Maintain steady 5 cm water depth until milking completes',
        titleMl: 'പാലുറയ്ക്കുന്ന ഘട്ടം വരെ 5 സെ.മീ ജലനിരപ്പ് നിലനിർത്തുക',
        reasonEn: 'Even brief drought stress during pollination causes unfilled grains (chaff). (KAU POP §5.3)',
        reasonMl: 'പരാഗണ സമയത്തെ ചെറിയ ജലക്ഷാമം പോലും നെല്ല് പതിരാകാൻ കാരണമാകും. (KAU POP §5.3)'
      }
    ]
  },
  ripening: {
    nameEn: 'Maturity / Ripening Stage',
    nameMl: 'മൂക്കൽ / വിളവെടുപ്പ് ഘട്ടം',
    daysRange: '81-115 DAT',
    standardActivities: [
      {
        id: 'ripening_drain',
        priority: 'high',
        triggerAfterDays: 0,
        titleEn: 'Drain field water completely 10-14 days prior to harvest',
        titleMl: 'വിളവെടുപ്പിന് 10-14 ദിവസം മുൻപ് പാടത്തെ വെള്ളം പൂർണ്ണമായി വാർത്തു കളയുക',
        reasonEn: 'Drying the field hardens soil for harvester access and synchronizes grain moisture for maximum milling recovery. (KAU POP §9.1)',
        reasonMl: 'പാടത്തെ വെള്ളം വറ്റിക്കുന്നത് മണ്ണ് ഉറപ്പിക്കാനും നെല്ല് ഒരുപോലെ ഉണങ്ങി കൊയ്‌ത്ത് എളുപ്പമാക്കാനും സഹായിക്കും. (KAU POP §9.1)'
      },
      {
        id: 'ripening_harvest_timing',
        priority: 'high',
        triggerAfterDays: 8,
        titleEn: 'Harvest when 80-85% of panicles turn golden yellow',
        titleMl: '80-85% കതിരുകൾ സ്വർണ്ണ മഞ്ഞ നിറമാകുമ്പോൾ വിളവെടുക്കുക',
        reasonEn: 'Over-drying leads to grain shattering in field, while premature harvest causes chalky broken grains. (KAU POP §9.2)',
        reasonMl: 'അമിതമായി ഉണങ്ങിയാൽ കൊഴിച്ചിൽ കൂടും; മൂപ്പ് കുറഞ്ഞാൽ കുത്തരി പൊടിയാൻ ഇടയാകും. (KAU POP §9.2)'
      }
    ]
  }
};

/**
 * Keywords in farmer logs that suppress redundant recommendations
 */
const SUPPRESSION_MAP = {
  tillering_water_drain: ['irrigation', 'water', 'ജലസേചനം', 'watered', 'നനച്ചു', 'നന', 'water level'],
  tillering_n_split2: ['urea', 'nitrogen', 'fertilizer', 'വളം', 'യൂറിയ', 'top-dress'],
  tillering_weed: ['weed', 'herbicide', 'കള', 'കൂനി', 'weeding', 'cono-weeder'],
  seedling_water: ['water', 'irrigation', 'ജലസേചനം', 'watered', 'നനച്ചു'],
  panicle_flood_maintain: ['water', 'irrigation', 'ജലസേചനം', 'watered', 'flood'],
  panicle_k_split: ['potash', 'potassium', 'mop', 'പൊട്ടാഷ്'],
  ripening_drain: ['drain', 'ഡ്രെയിൻ', 'drained', 'വെള്ളം വാർത്തു', 'വറ്റിച്ചു']
};

/**
 * Main farm planner generator
 */
export function generateFarmPlan({ farmHistory = [], cropStage = '', weatherData = null, language = 'en' }) {
  const isMl = language === 'ml';
  const clarifyingQuestions = [];
  const recommendations = [];

  // Determine active crop stage
  let effectiveStage = cropStage || '';
  if (!effectiveStage && farmHistory.length > 0) {
    const recentStageEntry = farmHistory.find(e => e.crop_stage && KAU_STAGE_GUIDELINES[e.crop_stage]);
    if (recentStageEntry) {
      effectiveStage = recentStageEntry.crop_stage;
    }
  }
  if (!effectiveStage) {
    effectiveStage = 'tillering'; // safe standard default
  }

  const stageGuide = KAU_STAGE_GUIDELINES[effectiveStage];
  if (!stageGuide) {
    clarifyingQuestions.push({
      questionEn: 'What is the current growth stage of your paddy? (Seedling, Tillering, Panicle, Flowering, or Ripening)',
      questionMl: 'നിലവിൽ നെൽചെടിയുടെ ഏത് വളർച്ചാ ഘട്ടത്തിലാണ്? (മുളപ്പൊട്ടൽ, ചിനപ്പുപൊട്ടൽ, കതിരിടൽ, പൂവിടൽ, അല്ലെങ്കിൽ മൂക്കൽ)'
    });
    return buildPlanResponse({
      cropStage: effectiveStage,
      stageGuide: null,
      farmHistory,
      recommendations: [],
      clarifyingQuestions,
      weatherData
    });
  }

  // Parse weather rain probability
  const rainProb = (weatherData && typeof weatherData.precipitationProbability === 'number')
    ? weatherData.precipitationProbability
    : (weatherData && weatherData.rainExpected ? 80 : null);
  const highRainRisk = rainProb !== null && rainProb >= 60;

  // Normalize recent history
  const recentEntries = farmHistory.slice(0, 15).map(e => ({
    content: (e.content || '').toLowerCase(),
    title: (e.title || '').toLowerCase(),
    type: e.entry_type || '',
    prediction: e.model_prediction || null,
    createdAt: e.created_at || ''
  }));

  // Analyze specific farmer activities recorded
  const hasWateredRecently = recentEntries.some(r =>
    r.content.includes('water') || r.content.includes('irrigation') || r.content.includes('ജലസേചനം') ||
    r.content.includes('watered') || r.content.includes('നനച്ചു') || r.content.includes('നന')
  );

  const hasFertilizerRecently = recentEntries.some(r =>
    r.content.includes('urea') || r.content.includes('fertilizer') || r.content.includes('വളം') ||
    r.content.includes('യൂറിയ') || r.content.includes('potash') || r.content.includes('പൊട്ടാഷ്')
  );

  const hasWeedingRecently = recentEntries.some(r =>
    r.content.includes('weed') || r.content.includes('herbicide') || r.content.includes('കള') ||
    r.content.includes('weeding') || r.content.includes('കൂനി')
  );

  const hasDiseaseRecently = recentEntries.some(r =>
    r.content.includes('brown spot') || r.content.includes('blast') || r.content.includes('blight') ||
    r.content.includes('ഇലപ്പുള്ളി') || r.content.includes('ഇലക്കരിച്ചിൽ') || r.content.includes('രോഗം') ||
    (r.prediction && r.prediction.diagnosis && r.prediction.diagnosis.key !== 'healthy_leaf')
  );

  // 1. SPECIFIC ADAPTIVE BRANCH: Farmer just recorded watering (The User's Core Demo Scenario)
  if (hasWateredRecently && effectiveStage === 'tillering') {
    recommendations.push({
      id: 'post_water_awd_next_step',
      priority: 'high',
      dayOffset: 1,
      labelEn: 'Tomorrow / In 2 days',
      labelMl: 'നാളെ / 2 ദിവസത്തിനകം',
      titleEn: 'Let water subside naturally (AWD Phase: 2 days standing, then surface drying)',
      titleMl: 'ജലനിരപ്പ് സ്വാഭാവികമായി താഴാൻ അനുവദിക്കുക (AWD ഘട്ടം: 2 ദിവസം ജലം, തുടർന്ന് പ്രതലം ഉണങ്ങൽ)',
      reasonEn: 'You recorded watering recently. KAU Alternate Wetting and Drying (AWD) advises against continuous deep flooding during tillering. Let the 2-3 cm water settle, followed by brief hairline soil drying to boost root oxygen and tiller development. (KAU POP §5.1)',
      reasonMl: 'നിങ്ങൾ അടുത്തിടെ നനച്ചതായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ചിനപ്പ് ഘട്ടത്തിൽ തുടർച്ചയായി വെള്ളം കെട്ടിനിർത്തരുതെന്നാണ് KAU നിർദ്ദേശം. 2-3 സെ.മീ വെള്ളം നിന്ന ശേഷം പ്രതലത്തിൽ ചെറിയ വരൾച്ച അനുവദിക്കുന്നത് വേരുകളിലേക്ക് ഓക്‌സിജൻ എത്തിക്കും. (KAU POP §5.1)',
      weatherWarningEn: null,
      weatherWarningMl: null,
      isWeatherBlocked: false,
      kauSource: 'KAU POP §5.1 (AWD Water Management)'
    });

    if (!hasWeedingRecently) {
      recommendations.push({
        id: 'post_water_weed_check',
        priority: 'medium',
        dayOffset: 3,
        labelEn: 'In 3 days',
        labelMl: '3 ദിവസത്തിനകം',
        titleEn: 'Inspect for aquatic weeds after water recedes',
        titleMl: 'വെള്ളം താഴുമ്പോൾ കളകൾ പരിശോധിക്കുക',
        reasonEn: 'Submerged weeds germinate rapidly following fresh irrigation. Scout field boundaries and inter-row spaces. (KAU POP §6.2)',
        reasonMl: 'പുതിയ ജലസേചനത്തിന് പിന്നാലെ കളകൾ വേഗത്തിൽ വളരാൻ സാധ്യതയുണ്ട്. വരികൾക്കിടയിലെ കളകൾ ശ്രദ്ധിക്കുക. (KAU POP §6.2)',
        weatherWarningEn: null,
        weatherWarningMl: null,
        isWeatherBlocked: false,
        kauSource: 'KAU POP §6.2'
      });
    }

    if (!hasFertilizerRecently) {
      const isBlocked = highRainRisk;
      recommendations.push({
        id: 'post_water_n_timing',
        priority: 'high',
        dayOffset: 4,
        labelEn: 'In 4-5 days',
        labelMl: '4-5 ദിവസത്തിൽ',
        titleEn: 'Plan second Nitrogen dose (Urea 50 kg/ha) once standing water drains to film',
        titleMl: 'പാടത്തെ വെള്ളം കുറഞ്ഞ് നേർത്ത നനവാകുമ്പോൾ രണ്ടാം യൂറിയ (50 കി.ഗ്രാം/ഹെ) നൽകാൻ തയ്യാറെടുക്കുക',
        reasonEn: 'Top-dressing urea on a moist field surface (after standing water drains) maximizes nitrogen absorption and prevents nutrient leaching loss. (KAU POP §4.3.2)',
        reasonMl: 'വെള്ളം വറ്റിയ ശേഷം നനഞ്ഞ മണ്ണിൽ യൂറിയ നൽകുന്നത് പോഷകം ഒലിച്ചുപോകാതെ വേരുകൾക്ക് പൂർണ്ണമായി ആഗിരണം ചെയ്യാൻ സഹായിക്കും. (KAU POP §4.3.2)',
        weatherWarningEn: isBlocked ? `⚠️ Rain probability ${rainProb}%: Postpone top-dressing until heavy rain subsides to prevent nutrient leaching.` : null,
        weatherWarningMl: isBlocked ? `⚠️ മഴ സാധ്യത ${rainProb}%: വളം ഒലിച്ചുപോകാതിരിക്കാൻ ശക്തമായ മഴ മാറിയ ശേഷം മാത്രം വളപ്രയോഗം നടത്തുക.` : null,
        isWeatherBlocked: isBlocked,
        kauSource: 'KAU POP §4.3.2'
      });
    }
  }

  // 2. SPECIFIC ADAPTIVE BRANCH: Disease symptoms or model diagnosis in history
  if (hasDiseaseRecently) {
    recommendations.push({
      id: 'disease_followup_scout',
      priority: 'critical',
      dayOffset: 0,
      labelEn: 'Today / Immediate',
      labelMl: 'ഇന്ന് / ഉടനടി',
      titleEn: 'Monitor lesion expansion and adjust moisture level',
      titleMl: 'രോഗലക്ഷണങ്ങൾ പടരുന്നുണ്ടോ എന്ന് നിരീക്ഷിക്കുകയും ജലനിരപ്പ് ക്രമീകരിക്കുകയും ചെയ്യുക',
      reasonEn: 'Recent log indicates disease symptoms. High standing humidity aggravates fungal spores. Drain stagnant water and inspect whether brown spots or leaf blast have reached newer leaves. (KAU POP §7.1)',
      reasonMl: 'മുൻ ലോഗിൽ രോഗലക്ഷണങ്ങൾ രേഖപ്പെടുത്തിയിട്ടുണ്ട്. കെട്ടിക്കിടക്കുന്ന വെള്ളം കുമിൾ രോഗങ്ങൾക്ക് വളമാകും. വെള്ളം വാർത്തു കളഞ്ഞ് പുതിയ ഇലകളിലേക്ക് രോഗം പടരുന്നുണ്ടോ എന്ന് നോക്കുക. (KAU POP §7.1)',
      weatherWarningEn: null,
      weatherWarningMl: null,
      isWeatherBlocked: false,
      kauSource: 'KAU POP §7.1 & IPM Guidelines'
    });
  }

  // 3. STANDARD STAGE ACTIVITIES (Filter out suppressed ones)
  stageGuide.standardActivities.forEach(act => {
    // If we already added a specific adaptation for this, skip
    if (act.id === 'tillering_water_drain' && hasWateredRecently) return;

    // Check suppression against recent farmer logs
    const keywords = SUPPRESSION_MAP[act.id] || [];
    const isAlreadyDone = keywords.some(k => recentEntries.some(r => r.content.includes(k) || r.title.includes(k)));
    if (isAlreadyDone) return;

    const isFertSpray = /nitrogen|urea|spray|potassium|potash|pesticide/i.test(act.titleEn);
    let weatherWarningEn = null;
    let weatherWarningMl = null;

    if (highRainRisk && isFertSpray) {
      weatherWarningEn = `⚠️ Rain probability ${rainProb}%: Postpone application until field dries. (KAU Weather Safety Rule)`;
      weatherWarningMl = `⚠️ മഴ സാധ്യത ${rainProb}%: രാസപ്രയോഗം ഒലിച്ചുപോകാതിരിക്കാൻ മഴ മാറിയ ശേഷം ചെയ്യുക. (KAU കാലാവസ്ഥ ചട്ടം)`;
    }

    const d = act.triggerAfterDays;
    recommendations.push({
      id: act.id,
      priority: act.priority,
      dayOffset: d,
      labelEn: d === 0 ? 'Today / Tomorrow' : `In ${d}-${d + 2} days`,
      labelMl: d === 0 ? 'ഇന്ന് / നാളെ' : `${d}-${d + 2} ദിവസത്തിനകം`,
      titleEn: act.titleEn,
      titleMl: act.titleMl,
      reasonEn: act.reasonEn,
      reasonMl: act.reasonMl,
      weatherWarningEn,
      weatherWarningMl,
      isWeatherBlocked: !!(highRainRisk && isFertSpray),
      kauSource: `KAU POP – ${stageGuide.nameEn} (${stageGuide.daysRange})`
    });
  });

  // Sort recommendations: critical first, then high, then medium
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  recommendations.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  // 4. CLARIFYING QUESTIONS (When information is insufficient)
  if (farmHistory.length === 0) {
    clarifyingQuestions.push({
      questionEn: 'No FarmLog history found. When did you sow or transplant this crop? Recording this gives exact day-targeted guidance.',
      questionMl: 'ഫാം ലോഗിൽ വിവരങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല. നടൽ/വിത എന്നായിരുന്നു? ഇത് രേഖപ്പെടുത്തിയാൽ കൃത്യമായ ദിവസ കണക്കിലുള്ള ഉപദേശം ലഭിക്കും.'
    });
    clarifyingQuestions.push({
      questionEn: 'What was your most recent field activity (e.g., watering, fertilizer, weeding)?',
      questionMl: 'ഒടുവിൽ പാടത്ത് ചെയ്ത പണി എന്താണ് (ഉദാ: നനയ്ക്കൽ, വളം നൽകൽ, കള പറിക്കൽ)?'
    });
  } else {
    // Stage-specific missing information checks
    if ((effectiveStage === 'tillering' || effectiveStage === 'panicle') && !hasWateredRecently) {
      clarifyingQuestions.push({
        questionEn: 'When did you last irrigate or drain the field? Record it in FarmLog to personalize water management.',
        questionMl: 'ഒടുവിൽ പാടത്ത് നനച്ചതോ വെള്ളം വാർത്തതോ എന്നാണ്? ജലക്രമീകരണം കൂടുതൽ കൃത്യമാക്കാൻ ഇത് രേഖപ്പെടുത്തുക.'
      });
    }

    if ((effectiveStage === 'tillering' || effectiveStage === 'panicle') && !hasFertilizerRecently) {
      clarifyingQuestions.push({
        questionEn: 'Have you already applied the basal dose of fertilizer? Please log it so we avoid duplicate top-dressing advice.',
        questionMl: 'അടിവളം ഇതിനകം നൽകിയിട്ടുണ്ടോ? വീണ്ടും ശുപാർശ ചെയ്യുന്നത് ഒഴിവാക്കാൻ ഇത് ഫാം ലോഗിൽ രേഖപ്പെടുത്തുക.'
      });
    }

    if (!hasDiseaseRecently && recentEntries.length > 0) {
      const mentionsSymptoms = recentEntries.some(r => r.content.includes('മഞ്ഞ') || r.content.includes('yellow') || r.content.includes('വാട്ടം'));
      if (mentionsSymptoms) {
        clarifyingQuestions.push({
          questionEn: 'You previously mentioned foliage yellowing. Did you capture a leaf photo in the "Crop Analysis" tab for verification?',
          questionMl: 'മുൻപ് ഇലകളിൽ മഞ്ഞളിപ്പ് രേഖപ്പെടുത്തിയിരുന്നു. "വിള പരിശോധന" ടാബിൽ ഇലയുടെ ഫോട്ടോ നൽകി സ്ഥിരീകരിച്ചിട്ടുണ്ടോ?'
        });
      }
    }
  }

  return buildPlanResponse({
    cropStage: effectiveStage,
    stageGuide,
    farmHistory,
    recommendations,
    clarifyingQuestions,
    weatherData,
    rainProb
  });
}

/**
 * Builds the structured response envelope
 */
function buildPlanResponse({ cropStage, stageGuide, farmHistory, recommendations, clarifyingQuestions, weatherData, rainProb }) {
  const total = farmHistory.length;
  const last = farmHistory[0] || null;

  let summaryEn = '';
  let summaryMl = '';

  if (!stageGuide) {
    summaryEn = 'Select your crop stage to receive adaptive agricultural recommendations.';
    summaryMl = 'അനുയോജ്യമായ കാർഷിക നിർദ്ദേശങ്ങൾ ലഭിക്കാൻ വിളയുടെ വളർച്ചാ ഘട്ടം തിരഞ്ഞെടുക്കുക.';
  } else if (recommendations.length === 0 && total === 0) {
    summaryEn = `No FarmLog history for ${stageGuide.nameEn}. Record your first observation to start the planner.`;
    summaryMl = `${stageGuide.nameMl} ഘട്ടത്തിൽ ഫാം ലോഗ് വിവരങ്ങൾ ലഭ്യമല്ല. പ്ലാനർ ആരംഭിക്കാൻ ആദ്യ നിരീക്ഷണം രേഖപ്പെടുത്തുക.`;
  } else if (recommendations.length === 0) {
    summaryEn = `All standard ${stageGuide.nameEn} activities are recorded as completed. Continue regular field scouting.`;
    summaryMl = `${stageGuide.nameMl} ഘട്ടത്തിലെ പ്രധാന പ്രവർത്തനങ്ങൾ പൂർത്തിയായതായി കാണുന്നു. പതിവ് പാട പരിശോധന തുടരുക.`;
  } else {
    const critCount = recommendations.filter(r => r.priority === 'critical').length;
    if (critCount > 0) {
      summaryEn = `${critCount} critical action(s) require immediate attention for ${stageGuide.nameEn} to protect yield.`;
      summaryMl = `${stageGuide.nameMl} ഘട്ടത്തിൽ ഉൽപ്പാദനം സംരക്ഷിക്കാൻ ${critCount} അടിയന്തര നടപടി(കൾ) ആവശ്യമാണ്.`;
    } else {
      summaryEn = `${recommendations.length} action(s) planned for ${stageGuide.nameEn} based on recent FarmLog entries & KAU guidelines.`;
      summaryMl = `ഫാം ലോഗ് ചരിത്രവും KAU നിർദ്ദേശങ്ങളും അടിസ്ഥാനമാക്കി ${stageGuide.nameMl} ഘട്ടത്തിൽ ${recommendations.length} തുടർനടപടികൾ ആസൂത്രണം ചെയ്തിട്ടുണ്ട്.`;
    }
  }

  return {
    success: true,
    cropStage,
    stageNameEn: stageGuide ? stageGuide.nameEn : 'Unknown Stage',
    stageNameMl: stageGuide ? stageGuide.nameMl : 'അജ്ഞാത ഘട്ടം',
    summaryEn,
    summaryMl,
    totalFarmLogEntries: total,
    lastActivityDate: last ? last.created_at : null,
    weatherSummary: weatherData ? {
      rainProbability: rainProb || 0,
      highRainRisk: (rainProb || 0) >= 60
    } : null,
    recommendations,
    clarifyingQuestions,
    analysedAt: new Date().toISOString(),
    kauReference: stageGuide
      ? `KAU Package of Practices – ${stageGuide.nameEn} (${stageGuide.daysRange})`
      : 'Kerala Agricultural University (KAU) Package of Practices'
  };
}
