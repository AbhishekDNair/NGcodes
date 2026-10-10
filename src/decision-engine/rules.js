/**
 * Karshaka Care Fast Deterministic Decision Engine (System 1 Agricultural Safety Gate)
 * 
 * Turns multi-modal evidence (Edge Model prediction, farmer symptoms, crop stage, 
 * weather conditions, and farm history) into safe, explainable, conservative decisions.
 * 
 * Strict safety principle: Safety-critical agricultural recommendations must never
 * hallucinate toxic chemical recommendations or disregard adverse weather hazards.
 */

import { DECISION_OUTCOMES, CROP_STAGES, KAU_CITATIONS } from './types.js';

/**
 * Evaluates available farm evidence through deterministic agricultural rules.
 * 
 * @param {Object} evidence
 * @param {string} [evidence.cropStage] - 'seedling' | 'tillering' | 'panicle' | 'ripening'
 * @param {string[]} [evidence.farmerSymptoms] - e.g. ['spots', 'drying', 'yellowing', 'wilting']
 * @param {Object} [evidence.imagePrediction] - Output from Edge ONNX Classifier
 * @param {Object} [evidence.weatherData] - Current & forecasted weather
 * @param {Object[]} [evidence.farmHistory] - Recent FarmLog records
 * @param {string} [evidence.farmerQuestion] - Farmer question text if any
 * @returns {Object} Structured explainable decision
 */
export function evaluateAgriculturalDecision(evidence = {}) {
  const startTime = performance.now();
  const evidenceConsidered = [];
  const missingInformation = [];

  const {
    cropStage = '',
    farmerSymptoms = [],
    imagePrediction = null,
    weatherData = null,
    farmHistory = [],
    farmerQuestion = ''
  } = evidence;

  // Track Evidence
  if (cropStage) {
    evidenceConsidered.push(`വളർച്ചാ ഘട്ടം: ${cropStage.toUpperCase()}`);
  } else {
    missingInformation.push('crop_stage');
  }

  if (farmerSymptoms && farmerSymptoms.length > 0) {
    evidenceConsidered.push(`നിരീക്ഷിച്ച ലക്ഷണങ്ങൾ: [${farmerSymptoms.join(', ')}]`);
  } else {
    missingInformation.push('farmer_symptoms');
  }

  const hasImage = !!(imagePrediction && imagePrediction.diagnosis);
  const imageKey = hasImage ? imagePrediction.diagnosis.key : null;
  const imageConfidence = hasImage ? (imagePrediction.diagnosis.confidence || 0) : 0;

  if (hasImage) {
    evidenceConsidered.push(
      `മോഡൽ നിർണ്ണയം: ${imagePrediction.diagnosis.nameMl} (വിശ്വാസ്യത: ${(imageConfidence * 100).toFixed(1)}%)`
    );
  } else {
    missingInformation.push('leaf_photograph');
  }

  // Weather parsing
  const rainProb = (weatherData && typeof weatherData.precipitationProbability === 'number') 
    ? weatherData.precipitationProbability 
    : (weatherData && weatherData.rainExpected ? 80 : 0);
  
  if (weatherData) {
    evidenceConsidered.push(`മഴ സാധ്യത: ${rainProb}%`);
  }

  // -------------------------------------------------------------
  // RULE 1: WEATHER PRECAUTION OVERRIDE (High rain hazard)
  // If rainfall probability is >= 60% and query or context suggests fertilizer/spray
  // -------------------------------------------------------------
  const isFertilizerQuery = farmerQuestion && (
    farmerQuestion.includes('വളം') || 
    farmerQuestion.includes('യൂറിയ') || 
    farmerQuestion.includes('fertilizer') || 
    farmerQuestion.includes('spray')
  );

  if (rainProb >= 60 && (isFertilizerQuery || farmerSymptoms.includes('spots') || imageKey === 'brown_spot')) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.WEATHER_PRECAUTION,
      ruleId: 'RULE_WEATHER_OVERRIDE_01',
      guidanceSource: KAU_CITATIONS.RICE_WEATHER_GAP,
      evidenceConsidered,
      missingInformation,
      explanationMl: `അടുത്ത 24 മണിക്കൂറിൽ ശക്തമായ മഴയ്ക്ക് ${rainProb}% സാധ്യതയുള്ളതിനാൽ പാടത്ത് രാസവളപ്രയോഗമോ കീടനാശിനി തളിക്കലോ പാടില്ല.`,
      explanationEn: `Rainfall probability is ${rainProb}%. Postpone top-dressing and chemical applications to prevent nutrient leaching.`,
      actionStepsMl: [
        'പാടത്തെ ഡ്രെയിനേജ് ചാലുകളിലെ തടസ്സങ്ങൾ മാറ്റി അധികജലം ഒഴുക്കിക്കളയാൻ സൗകര്യമൊരുക്കുക.',
        'മഴ മാറി പാടത്തെ ജലനിരപ്പ് സാധാരണനിലയിലാകുന്നതുവരെ വളപ്രയോഗം നിർത്തിവെക്കുക.',
        'കാലാവസ്ഥ അനുകൂലമാകുമ്പോൾ മാത്രം ശുപാർശ ചെയ്ത അളവിൽ പൊട്ടാഷ്/യൂറിയ നൽകുക.'
      ],
      actionStepsEn: [
        'Clear field drainage channels to facilitate immediate runoff of excess water.',
        'Halt all fertilizer top-dressing until rain subsides and standing water normalizes.',
        'Resume balanced fertilization only after weather stabilizes.'
      ],
      safetyAlertMl: 'മഴയുള്ളപ്പോൾ യൂറിയ വിതറിയാൽ വിളകൾക്ക് ഇലക്കരിച്ചിൽ രോഗബാധ വർദ്ധിക്കാൻ സാധ്യതയുണ്ട്.',
      safetyAlertEn: 'Applying urea under heavy rain accelerates blast infection and runoff pollution.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 2: CRITICAL STAGE EMERGENCY (Panicle Neck Blast Risk)
  // If Blast is detected during Panicle Initiation stage
  // -------------------------------------------------------------
  if (cropStage === CROP_STAGES.PANICLE && (imageKey === 'leaf_blast' || farmerSymptoms.includes('drying'))) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.REFER_TO_AGRICULTURAL_EXPERT,
      ruleId: 'RULE_PANICLE_BLAST_EMERGENCY_02',
      guidanceSource: KAU_CITATIONS.RICE_IPM,
      evidenceConsidered,
      missingInformation,
      explanationMl: 'കതിരിടുന്ന ഘട്ടത്തിൽ ഇലക്കരിച്ചിൽ ലക്ഷണം കാണുന്നത് കതിർക്കരിച്ചിലിന് (Neck Blast) കാരണമാകും. വിളവെടുപ്പിനെ സാരമായി ബാധിക്കാൻ സാധ്യതയുള്ളതിനാൽ അടിയന്തര ഇടപെടൽ ആവശ്യമാണ്.',
      explanationEn: 'Blast symptoms during panicle initiation pose severe neck blast threat. Immediate agricultural officer intervention required.',
      actionStepsMl: [
        'പാടത്തുനിന്ന് കെട്ടിക്കിടക്കുന്ന വെള്ളം ഉടൻ വാർത്തു കളഞ്ഞ് പുതിയ വെള്ളം കയറ്റുക.',
        'നൈട്രജൻ (യൂറിയ) വളപ്രയോഗം പൂർണ്ണമായി നിർത്തുക.',
        'അടുത്തുള്ള കൃഷിഭവനുമായി ഉടനടി ബന്ധപ്പെട്ട് കതിർക്കരിച്ചിൽ പ്രതിരോധ മാർഗ്ഗങ്ങൾ തേടുക.'
      ],
      actionStepsEn: [
        'Drain stagnant water from the field and introduce clean water.',
        'Stop Nitrogen application completely.',
        'Alert local Krishi Bhavan immediately for urgent field inspection.'
      ],
      safetyAlertMl: 'കതിരിടുന്ന ഘട്ടത്തിലെ കരിച്ചിൽ 50% വരെ വിളനാശത്തിന് കാരണമാകാം. കാലതാമസം വരുത്തരുത്.',
      safetyAlertEn: 'Panicle blast can destroy up to 50% of the yield. Prompt action is mandatory.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 3: CONTRADICTORY EVIDENCE
  // e.g. Model claims Healthy leaf (high confidence) but farmer reports severe wilting/drying
  // -------------------------------------------------------------
  const severeSymptomsReported = farmerSymptoms.includes('wilting') || farmerSymptoms.includes('drying');
  if (hasImage && imageKey === 'healthy_leaf' && imageConfidence >= 0.70 && severeSymptomsReported) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.REQUEST_MORE_INFORMATION,
      ruleId: 'RULE_CONTRADICTORY_EVIDENCE_03',
      guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
      evidenceConsidered,
      missingInformation: ['clearer_leaf_photo', 'root_inspection'],
      explanationMl: 'ചിത്രത്തിൽ ഇല ആരോഗ്യമുള്ളതായി കാണുന്നുവെങ്കിലും, നിങ്ങൾ വാട്ടമോ കരിച്ചിലോ രേഖപ്പെടുത്തിയിട്ടുണ്ട്. വേരുകളിലോ തണ്ടുകളിലോ കീടബാധയുണ്ടോ എന്ന് പരിശോധിക്കേണ്ടതുണ്ട്.',
      explanationEn: 'Contradictory evidence: leaf photo appears healthy but severe drying/wilting reported. Root/stem scouting needed.',
      actionStepsMl: [
        'ചെടിയുടെ ചുവടുഭാഗവും വേരുകളും പരിശോധിച്ച് പുഴുക്കുത്തോ വേരുചീയലോ ഉണ്ടോയെന്ന് നോക്കുക.',
        'രോഗബാധ വ്യക്തമായി കാണുന്ന ഇലയുടെ മറ്റൊരു ഫോട്ടോ എടുത്ത് നൽകുക.',
        'തുടർച്ചയായ വാട്ടമുണ്ടെങ്കിൽ കൃഷിഭവൻ ഉദ്യോഗസ്ഥനെ അറിയിക്കുക.'
      ],
      actionStepsEn: [
        'Inspect plant base and root system for sheath rot or root pests.',
        'Provide a close-up photograph of the actively wilting section.',
        'If wilting persists, arrange field visit with Krishi Bhavan.'
      ],
      safetyAlertMl: 'വ്യക്തതയില്ലാതെ രോഗനാശിനികൾ തളിക്കരുത്.',
      safetyAlertEn: 'Do not spray pesticides without identifying the underlying root/foliar cause.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 4: OUT OF SCOPE / UNIDENTIFIED PHOTOGRAPH
  // Model predicted 'others' or confidence < 0.40
  // -------------------------------------------------------------
  if (hasImage && (imageKey === 'others' || imageConfidence < 0.40)) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.REQUEST_MORE_INFORMATION,
      ruleId: 'RULE_IMAGE_OUT_OF_SCOPE_04',
      guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
      evidenceConsidered,
      missingInformation: ['clearer_leaf_photo'],
      explanationMl: 'നൽകിയ ചിത്രം നെല്ലിന്റെ രോഗലക്ഷണങ്ങളുമായി പൊരുത്തപ്പെടുന്നില്ല അല്ലെങ്കിൽ വ്യക്തത കുറവാണ്. കൂടുതൽ വെളിച്ചമുള്ളതും വ്യക്തവുമായ ഒരു ഇലയുടെ ഫോട്ടോ നൽകുക.',
      explanationEn: 'The leaf photograph is ambiguous or out of model scope. Please provide a well-lit, clearer image.',
      actionStepsMl: [
        'സൂര്യപ്രകാശമുള്ളപ്പോൾ ഇലയുടെ രോഗമുള്ള ഭാഗം വ്യക്തമായി കാണത്തക്കവിധം ഫോട്ടോ എടുക്കുക.',
        'ഇലകളിൽ കാണുന്ന പ്രധാന ലക്ഷണങ്ങൾ (പുള്ളികൾ, കരിച്ചിൽ, മഞ്ഞളിപ്പ്) തിരഞ്ഞെടുക്കുക.'
      ],
      actionStepsEn: [
        'Capture a sharp photograph in daylight focusing on the lesions.',
        'Indicate the observed visual symptoms in the checklist.'
      ],
      safetyAlertMl: 'അവ്യക്തമായ നിർണ്ണയത്തിൽ രാസപ്രയോഗങ്ങൾ നടത്തരുത്.',
      safetyAlertEn: 'Never apply chemicals based on uncertain image diagnosis.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 5: LOW CONFIDENCE PREDICTION (0.40 <= confidence < 0.65)
  // -------------------------------------------------------------
  if (hasImage && imageConfidence >= 0.40 && imageConfidence < 0.65) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.MONITOR_AND_REASSESS,
      ruleId: 'RULE_LOW_CONFIDENCE_MONITOR_05',
      guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
      evidenceConsidered,
      missingInformation: ['closer_observation_needed'],
      explanationMl: `ലക്ഷണങ്ങൾ ${imagePrediction.diagnosis.nameMl} ആകാൻ സാധ്യതയുണ്ടെങ്കിലും മോഡൽ വിശ്വാസ്യത ${Math.round(imageConfidence * 100)}% മാത്രമാണ്. കൂടുതൽ ഇലകളിൽ രോഗലക്ഷണം പടരുന്നുണ്ടോ എന്ന് നിരീക്ഷിക്കുക.`,
      explanationEn: `Symptoms moderately resemble ${imagePrediction.diagnosis.nameEn} (Confidence: ${Math.round(imageConfidence * 100)}%). Monitor plot for symptom spread.`,
      actionStepsMl: [
        'അടുത്ത 48 മണിക്കൂർ പാടത്ത് രോഗലക്ഷണം പടരുന്നുണ്ടോ എന്ന് സൂക്ഷ്മമായി നിരീക്ഷിക്കുക.',
        'പാടത്തെ വെള്ളം കുറച്ച് വായുസഞ്ചാരം ഉറപ്പാക്കുക.',
        'ലക്ഷണങ്ങൾ വർദ്ധിച്ചാൽ കൃഷിഭവനിൽ സാംപിൾ ഇല കാണിക്കുക.'
      ],
      actionStepsEn: [
        'Monitor field closely over the next 48 hours for lesion expansion.',
        'Optimize water level to prevent stagnant humidity.',
        'Take a leaf sample to Krishi Bhavan if spots multiply.'
      ],
      safetyAlertMl: 'ലക്ഷണങ്ങൾ സ്ഥിരീകരിക്കുന്നതുവരെ കാത്തിരിക്കുക.',
      safetyAlertEn: 'Wait for confirmed progression before applying remedies.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 6: VERIFIED BACTERIAL LEAF BLIGHT (BLB)
  // Strict biological rule: Fungicides are completely useless against bacteria
  // -------------------------------------------------------------
  if (hasImage && imageKey === 'bacterial_leaf_blight' && imageConfidence >= 0.65) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE,
      ruleId: 'RULE_VERIFIED_BLB_06',
      guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
      evidenceConsidered,
      missingInformation,
      explanationMl: 'ബാക്ടീരിയൽ ഇലവാട്ടം (BLB) സ്ഥിരീകരിച്ചു. ബാക്ടീരിയ ബാധയായതിനാൽ കുമിൾനാശിനികൾ ഫലപ്രദമല്ല.',
      explanationEn: 'Bacterial Leaf Blight confirmed. Fungicides are ineffective against this bacterial pathogen.',
      actionStepsMl: [
        'നൈട്രജൻ (യൂറിയ) വളപ്രയോഗം ഉടനടി നിർത്തുക; പൊട്ടാഷ് വളം ശുപാർശ ചെയ്ത അളവിൽ നൽകുക.',
        'പാടത്തെ വെള്ളം പൂർണ്ണമായി വാർത്തു കളഞ്ഞ് വായുസഞ്ചാരം വർദ്ധിപ്പിക്കുക.',
        'പാടത്തേക്ക് കയറ്റുന്ന വെള്ളത്തിൽ ബ്ലീച്ചിംഗ് പൗഡർ (ഹെക്ടറിന് 5 കി.ഗ്രാം) ചേർക്കുക.',
        'രോഗബാധയുള്ള ഭാഗത്തുനിന്ന് രോഗമില്ലാത്ത പാടത്തേക്ക് ആളുകളോ മൃഗങ്ങളോ സഞ്ചരിക്കുന്നത് ഒഴിവാക്കുക.'
      ],
      actionStepsEn: [
        'Halt Nitrogen (urea) top-dressing immediately; correct Potash levels.',
        'Drain field completely to eliminate humid bacterial film.',
        'Apply bleaching powder (5kg/ha) into inlet irrigation water.',
        'Restrain movement from diseased to healthy fields.'
      ],
      safetyAlertMl: 'ബാക്ടീരിയ രോഗങ്ങൾക്ക് കുമിൾനാശിനികൾ തളിക്കുന്നത് സാമ്പത്തിക നഷ്ടവും പരിസ്ഥിതി നാശവും ഉണ്ടാക്കും.',
      safetyAlertEn: 'Spraying fungicides for bacterial blight causes severe financial waste with zero efficacy.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 7: VERIFIED BROWN SPOT
  // Potash correction & balanced nutrition
  // -------------------------------------------------------------
  if (hasImage && imageKey === 'brown_spot' && imageConfidence >= 0.65) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE,
      ruleId: 'RULE_VERIFIED_BROWN_SPOT_07',
      guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
      evidenceConsidered,
      missingInformation,
      explanationMl: 'ഇലപ്പുള്ളി രോഗം (Brown Spot) സ്ഥിരീകരിച്ചു. മണ്ണിലെ പൊട്ടാഷ് പോഷകക്കുറവാണ് പ്രധാന കാരണം.',
      explanationEn: 'Brown Spot confirmed. Often exacerbated by potash deficiency and poor soil fertility.',
      actionStepsMl: [
        'മണ്ണിൽ പൊട്ടാഷ് (Muriate of Potash) വളത്തിന്റെ കുറവ് പരിഹരിക്കുക.',
        'അമിതമായ നൈട്രജൻ പ്രയോഗം ഒഴിവാക്കുക.',
        'പാടത്ത് നല്ല വായുസഞ്ചാരവും വെളിച്ചവും ഉറപ്പുവരുത്തുക.',
        'തുടർച്ചയായി പുതിയ ഇലകളിലേക്ക് പടരുന്നുവെങ്കിൽ കൃഷി ഓഫീസറുടെ ഉപദേശം തേടുക.'
      ],
      actionStepsEn: [
        'Apply recommended dose of Potash (MOP) to rectify deficiency.',
        'Avoid excess nitrogenous fertilizer.',
        'Ensure proper spacing for light penetration.',
        'Consult Krishi Bhavan if lesion density increases.'
      ],
      safetyAlertMl: 'അനാവശ്യമായി രാസകീടനാശിനികൾ തളിക്കരുത്.',
      safetyAlertEn: 'Avoid indiscriminate chemical sprays.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 8: VERIFIED LEAF BLAST (TILLERING STAGE)
  // Biological control (Pseudomonas) & water management
  // -------------------------------------------------------------
  if (hasImage && imageKey === 'leaf_blast' && imageConfidence >= 0.65) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE,
      ruleId: 'RULE_VERIFIED_BLAST_TILLERING_08',
      guidanceSource: KAU_CITATIONS.RICE_IPM,
      evidenceConsidered,
      missingInformation,
      explanationMl: 'ചിനപ്പുപൊട്ടൽ ഘട്ടത്തിൽ ഇലക്കരിച്ചിൽ (Leaf Blast) സ്ഥിരീകരിച്ചു. കൃത്യമായ ജൈവനിയന്ത്രണ മാർഗ്ഗങ്ങൾ വഴി തടയാവുന്നതാണ്.',
      explanationEn: 'Leaf Blast confirmed at tillering stage. Controllable through recommended biocontrol and water management.',
      actionStepsMl: [
        'പാടത്തുനിന്ന് കെട്ടിക്കിടക്കുന്ന വെള്ളം വാർത്തു കളഞ്ഞ് ശുദ്ധജലം കയറ്റുക.',
        'യൂറിയ വളപ്രയോഗം രോഗം ശമിക്കുന്നതുവരെ താൽക്കാലികമായി നിർത്തിവെക്കുക.',
        'സ്യൂഡോമോണസ് ഫ്ലൂറസെൻസ് (Pseudomonas fluorescens 20g/L) തളിക്കുക.',
        'രോഗബാധ നിയന്ത്രണവിധേയമല്ലെങ്കിൽ കൃഷി ഓഫീസറെ സമീപിക്കുക.'
      ],
      actionStepsEn: [
        'Drain stagnant water and refresh field with clean water.',
        'Temporarily suspend nitrogen top-dressing.',
        'Foliar spray of biocontrol Pseudomonas fluorescens (20g/L).',
        'Consult Krishi Bhavan if lesions spread to upper leaves.'
      ],
      safetyAlertMl: 'കീടനാശിനികൾ കൃഷി ഓഫീസറുടെ നിർദ്ദേശപ്രകാരം മാത്രം ഉപയോഗിക്കുക.',
      safetyAlertEn: 'Use chemical treatments strictly as prescribed on certified product labels.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 9: HEALTHY CROP (NO ACTION NEEDED)
  // -------------------------------------------------------------
  if (hasImage && imageKey === 'healthy_leaf' && imageConfidence >= 0.70 && farmerSymptoms.length === 0) {
    const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      outcome: DECISION_OUTCOMES.NO_ACTION_RECOMMENDED_BY_AVAILABLE_EVIDENCE,
      ruleId: 'RULE_HEALTHY_NO_ACTION_09',
      guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
      evidenceConsidered,
      missingInformation,
      explanationMl: 'ലഭ്യമായ വിവരങ്ങളും ഇലയുടെ ചിത്രവും അനുസരിച്ച് നെൽച്ചെടികൾ പൂർണ്ണ ആരോഗ്യത്തിലാണ്. നിലവിൽ പ്രത്യേക കീടനിയന്ത്രണ നടപടികൾ ആവശ്യമില്ല.',
      explanationEn: 'Based on current evidence and imagery, paddy foliage is healthy. No treatment required.',
      actionStepsMl: [
        'സാധാരണ വളർച്ചാ പരിചരണവും ശുപാർശ ചെയ്ത ജലക്രമീകരണവും തുടരുക.',
        'ആഴ്ചയിലൊരിക്കൽ പാടം നിരീക്ഷിക്കുന്നത് തുടരുക.'
      ],
      actionStepsEn: [
        'Maintain recommended water management and routine cultural practices.',
        'Continue regular weekly field scouting.'
      ],
      safetyAlertMl: 'ആരോഗ്യമുള്ള വിളകളിൽ മുൻകരുതലെന്ന വ്യാജേന കീടനാശിനികൾ തളിക്കരുത്.',
      safetyAlertEn: 'Never apply prophylactic pesticide sprays on healthy paddy fields.',
      evaluationLatencyMs: elapsed,
      timestamp: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // RULE 10: MISSING CRITICAL CONTEXT FALLBACK
  // -------------------------------------------------------------
  const elapsed = Math.round((performance.now() - startTime) * 100) / 100;
  return {
    outcome: DECISION_OUTCOMES.REQUEST_MORE_INFORMATION,
    ruleId: 'RULE_INSUFFICIENT_EVIDENCE_10',
    guidanceSource: KAU_CITATIONS.RICE_POP_MAIN,
    evidenceConsidered,
    missingInformation,
    explanationMl: 'തീരുമാനമെടുക്കാൻ പര്യാപ്തമായ വിവരങ്ങൾ ലഭ്യമല്ല. ദയവായി വളർച്ചാഘട്ടവും ഇലയുടെ ലക്ഷണങ്ങളും രേഖപ്പെടുത്തുക, അല്ലെങ്കിൽ ഒരു ഇലയുടെ ഫോട്ടോ നൽകുക.',
    explanationEn: 'Insufficient evidence to formulate a safe recommendation. Please specify crop stage and symptoms or provide a photograph.',
    actionStepsMl: [
      'വിളയുടെ വളർച്ചാ ഘട്ടം തിരഞ്ഞെടുക്കുക (മുളപ്പൊട്ടൽ, ചിനപ്പുപൊട്ടൽ, കതിരിടൽ).',
      'ഇലകളിൽ കാണുന്ന പ്രധാന ലക്ഷണങ്ങൾ രേഖപ്പെടുത്തുക.',
      '"വിള പരിശോധന" ടാബിൽ ഇലയുടെ ഒരു ചിത്രം നൽകുക.'
    ],
    actionStepsEn: [
      'Specify crop growth stage (Seedling, Tillering, Panicle).',
      'Select observed visual symptoms.',
      'Upload a leaf photograph in the Crop Analysis tab.'
    ],
    safetyAlertMl: 'കൃത്യമായ രോഗനിർണ്ണയമില്ലാതെ രാസപ്രയോഗങ്ങൾ ഒഴിവാക്കുക.',
    safetyAlertEn: 'Do not spray agricultural chemicals without definitive diagnosis.',
    evaluationLatencyMs: elapsed,
    timestamp: new Date().toISOString()
  };
}
