/**
 * Karshaka Care Deterministic Decision Engine Constants & Outcome Types
 */

export const DECISION_OUTCOMES = {
  REQUEST_MORE_INFORMATION: 'REQUEST_MORE_INFORMATION',
  MONITOR_AND_REASSESS: 'MONITOR_AND_REASSESS',
  WEATHER_PRECAUTION: 'WEATHER_PRECAUTION',
  FOLLOW_VERIFIED_GUIDANCE: 'FOLLOW_VERIFIED_GUIDANCE',
  REFER_TO_AGRICULTURAL_EXPERT: 'REFER_TO_AGRICULTURAL_EXPERT',
  NO_ACTION_RECOMMENDED_BY_AVAILABLE_EVIDENCE: 'NO_ACTION_RECOMMENDED_BY_AVAILABLE_EVIDENCE'
};

export const CROP_STAGES = {
  SEEDLING: 'seedling',       // മുളപ്പൊട്ടൽ
  TILLERING: 'tillering',     // ചിനപ്പുപൊട്ടൽ
  PANICLE: 'panicle',         // കതിരിടൽ
  RIPENING: 'ripening'        // മൂപ്പെത്തൽ
};

export const KAU_CITATIONS = {
  RICE_POP_MAIN: 'Kerala Agricultural University (KAU) Package of Practices - Crops: Rice (Paddy), 16th Edition',
  RICE_POP_KUTTANAD: 'KAU Ad-hoc Package of Practices for Kuttanad & Kole Lands: Water & Soil Management',
  RICE_IPM: 'KAU Integrated Pest & Disease Management Directives for Paddy Cultivation',
  RICE_WEATHER_GAP: 'KAU Agro-Met Advisory Service: Weather Contingency Plans'
};
