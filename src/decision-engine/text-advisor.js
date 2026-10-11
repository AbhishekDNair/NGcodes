/**
 * Karshaka Care Agricultural Text Advisor
 * Deterministic consultation module based on Kerala Agricultural University (KAU)
 * Package of Practices - Rice (Paddy) cultivation (16th Edition & Ad-hoc Kuttanad Package).
 * Supports Malayalam script, Manglish (Malayalam in Latin script), and English queries.
 */

export const ADVISOR_RULES = [
  // 1. Brown Spot (ഇലപ്പുള്ളി രോഗം)
  {
    id: 'RULE_BROWN_SPOT',
    keywordsMl: ['തവിട്ടു', 'പുള്ളി', 'ഇലപ്പുള്ളി', 'കുത്തുകൾ', 'പാടുകൾ', 'പുള്ളികൾ', 'തവിട്ടുനിറം', 'തവിട്ടു പുള്ളി', 'തവിട്ടുപുള്ളി', 'ബ്രൗൺ സ്പോട്ട്', 'ഇലയിൽ പുള്ളി', 'പുള്ളി രോഗം', 'ബ്രൗൺസ്പോട്ട്', 'കറുത്ത പുള്ളി'],
    keywordsEn: ['brown spot', 'spots', 'leaf spot', 'bipolaris', 'brown spots', 'circular spots', 'pulli', 'thavittu', 'ilappulli', 'ila pulli', 'thavittu pulli', 'brown', 'ila pullikal'],
    category: 'disease_brown_spot',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice (Paddy), Section 3.2.1: Brown Spot Management',
    summaryMl: 'ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നത് നെല്ലിലെ ഇലപ്പുള്ളി രോഗത്തിന്റെ (Brown Spot - Bipolaris oryzae) ലക്ഷണമാകാം.',
    summaryEn: 'Brown circular spots on leaves likely indicate Brown Spot disease (Bipolaris oryzae).',
    actionStepsMl: [
      'മണ്ണിൽ പൊട്ടാഷ് (Potash) വളത്തിന്റെ കുറവുണ്ടെങ്കിൽ ശുപാർശ ചെയ്ത അളവിൽ നൽകുക.',
      'നൈട്രജൻ (യൂറിയ) വളങ്ങൾ അമിതമായി നൽകുന്നത് ഒഴിവാക്കുക.',
      'പാടത്ത് വായുസഞ്ചാരവും ആവശ്യത്തിന് വെളിച്ചവും ഉറപ്പാക്കുക.',
      'ലക്ഷണങ്ങൾ കൂടുതൽ ഇലകളിലേക്ക് പടരുന്നുവെങ്കിൽ അടുത്തുള്ള കൃഷിഭവനുമായി ബന്ധപ്പെടുക.'
    ],
    actionStepsEn: [
      'Ensure balanced soil nutrition, especially adequate Potash.',
      'Avoid excessive application of Nitrogen (urea).',
      'Maintain proper plant spacing for aeration.',
      'If spots spread aggressively, consult the local Krishi Bhavan officer.'
    ],
    safetyWarningMl: 'അനാവശ്യമായി വിഷാംശമുള്ള രാസകീടനാശിനികൾ തളിക്കരുത്.',
    safetyWarningEn: 'Do not spray toxic chemicals without confirmed diagnosis.'
  },

  // 2. Leaf Blast (ഇലക്കരിച്ചിൽ)
  {
    id: 'RULE_BLAST',
    keywordsMl: ['ഇലക്കരിച്ചിൽ', 'കരിച്ചിൽ', 'കരിഞ്ഞു', 'കരിയുന്നു', 'കരിയൽ', 'സ്പിൻഡിൽ', 'തുമ്പു കരിയൽ', 'തുമ്പ് കരിയൽ', 'കരിഞ്ഞ', 'ഉണങ്ങുന്നു', 'ഇല കരിച്ചിൽ', 'കരിഞ്ഞുണങ്ങുന്നു', 'ബ്ലാസ്റ്റ്', 'ബ്ളാസ്റ്റ്', 'ഇല കരിയൽ', 'കരിഞ്ഞുപോയി'],
    keywordsEn: ['blast', 'leaf blast', 'drying', 'spindle', 'magnaporthe', 'pyricularia', 'karichil', 'ila karichil', 'kariyunnu', 'unangunnu', 'kariyil', 'ila kariyil', 'kariññu'],
    category: 'disease_blast',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.2.2: Blast Management',
    summaryMl: 'ഇലകളിൽ സ്പിൻഡിൽ ആകൃതിയിലുള്ള പാടുകളും കരിച്ചിലും കാണുന്നത് ഇലക്കരിച്ചിൽ (Rice Blast) രോഗലക്ഷണമാണ്.',
    summaryEn: 'Spindle-shaped lesions with drying leaf tips indicate Rice Leaf Blast.',
    actionStepsMl: [
      'പാടത്തുനിന്ന് കെട്ടിക്കിടക്കുന്ന വെള്ളം ഒഴുക്കിക്കളഞ്ഞ് ശുദ്ധജലം കയറ്റുക.',
      'യൂറിയ (നൈട്രജൻ) വളപ്രയോഗം രോഗലക്ഷണം ശമിക്കുന്നതുവരെ താൽക്കാലികമായി നിർത്തിവെക്കുക.',
      'തുടക്കഘട്ടത്തിൽ സ്യൂഡോമോണസ് (Pseudomonas fluorescens 20g/L) തളിക്കുന്നത് ഫലപ്രദമാണ്.',
      'രോഗബാധ രൂക്ഷമാണെങ്കിൽ കൃഷി ഓഫീസറുടെ നിർദ്ദേശപ്രകാരം മാത്രം നിയന്ത്രണ മാർഗ്ഗങ്ങൾ സ്വീകരിക്കുക.'
    ],
    actionStepsEn: [
      'Drain stagnant water from the plot and introduce fresh water.',
      'Temporarily halt Nitrogen (urea) top-dressing until symptoms subside.',
      'Apply bio-agent Pseudomonas fluorescens (20g/L) in early stages.',
      'Consult agricultural officer if panicle blast is suspected.'
    ],
    safetyWarningMl: 'കതിരിടുന്ന ഘട്ടത്തിൽ ബാധിച്ചാൽ ഉടൻ കൃഷി ഓഫീസറെ അറിയിക്കുക.',
    safetyWarningEn: 'Immediately alert Krishi Bhavan if panicle neck blast occurs.'
  },

  // 3. Bacterial Leaf Blight (ബാക്ടീരിയൽ ഇലവാട്ടം)
  {
    id: 'RULE_BACTERIAL_BLIGHT',
    keywordsMl: ['ബാക്ടീരിയൽ', 'ഇലവാട്ടം', 'മഞ്ഞവര', 'വൈക്കോൽ', 'അരികുകൾ', 'വാട്ടം', 'ബാക്ടീരിയ'],
    keywordsEn: ['bacterial', 'blight', 'yellow stripes', 'wilting', 'xanthomonas', 'bacterial leaf blight', 'vattom', 'ila vattom', 'vaattam'],
    category: 'disease_blight',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.2.3: Bacterial Leaf Blight',
    summaryMl: 'ഇലയുടെ അരികുകൾ മഞ്ഞളിച്ച് താഴേക്ക് പടരുന്നതും വൈക്കോൽ നിറമാകുന്നതും ബാക്ടീരിയൽ ഇലവാട്ടം (BLB) ആകാം.',
    summaryEn: 'Marginal yellowing moving downwards indicates Bacterial Leaf Blight.',
    actionStepsMl: [
      'പാടത്ത് വെള്ളം കെട്ടിനിൽക്കുന്നത് പൂർണ്ണമായി ഒഴിവാക്കി ഡ്രെയിനേജ് ഉറപ്പാക്കുക.',
      'നൈട്രജൻ വളപ്രയോഗം ഉടനടി നിർത്തുക; പൊട്ടാഷ് അളവ് ക്രമീകരിക്കുക.',
      'പാടത്ത് പണിയെടുക്കുമ്പോൾ രോഗബാധയുള്ള ഭാഗത്തുനിന്ന് രോഗമില്ലാത്ത ഭാഗത്തേക്ക് നടക്കാതിരിക്കുക.',
      'ബ്ലീച്ചിംഗ് പൗഡർ (ഹെക്ടറിന് 5 കി.ഗ്രാം നിരക്കിൽ) പാടത്തേക്ക് കയറ്റുന്ന വെള്ളത്തിൽ ചേർക്കുന്നത് ബാക്ടീരിയ വ്യാപനം തടയും.'
    ],
    actionStepsEn: [
      'Ensure complete field drainage to avoid stagnant moisture.',
      'Stop Nitrogen top-dressing immediately; optimize Potash application.',
      'Avoid moving from infected plots to healthy plots.',
      'Field water sanitation with bleaching powder (5kg/ha) helps limit spread.'
    ],
    safetyWarningMl: 'ബാക്ടീരിയ രോഗങ്ങൾക്ക് കുമിൾനാശിനികൾ ഉപയോഗിക്കുന്നത് ഫലപ്രദമല്ല.',
    safetyWarningEn: 'Fungicides are ineffective against bacterial leaf blight.'
  },

  // 4. Sheath Blight (പോളക്കരിച്ചിൽ)
  {
    id: 'RULE_SHEATH_BLIGHT',
    keywordsMl: ['പോളക്കരിച്ചിൽ', 'ഷീത്ത് ബ്ലൈറ്റ്', 'പോള', 'തണ്ടിന് മുകളിൽ പുള്ളികൾ', 'റൈസോക്ടോണിയ'],
    keywordsEn: ['sheath blight', 'rhizoctonia', 'sheath lesions', 'pola karichil', 'polakarichil', 'pola'],
    category: 'disease_sheath_blight',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.2.4: Sheath Blight Management',
    summaryMl: 'നെൽച്ചെടിയുടെ കടഭാഗത്തെ പോളകളിൽ സർപ്പത്തോലിന്റെ ആകൃതിയിൽ പുള്ളികൾ കാണുന്നത് പോളക്കരിച്ചിൽ (Sheath Blight) രോഗമാണ്.',
    summaryEn: 'Snake-skin like irregular lesions on leaf sheaths indicate Sheath Blight (Rhizoctonia solani).',
    actionStepsMl: [
      'പാടത്തെ അധികവെള്ളം വാർത്ത് കളഞ്ഞ് വായുസഞ്ചാരം വർദ്ധിപ്പിക്കുക.',
      'നൈട്രജൻ വളപ്രയോഗം കുറയ്ക്കുകയും പൊട്ടാഷ് വളം യഥാസമയം നൽകുകയും ചെയ്യുക.',
      'സ്യൂഡോമോണസ് ഫ്ലൂറസെൻസ് (20 ഗ്രാം/ലിറ്റർ) ചെടിയുടെ കടയ്ക്കൽ നനയത്തക്കവിധം തളിക്കുക.',
      'വരമ്പുകളിലെ കളകൾ പൂർണ്ണമായി ചെത്തിമാറ്റുക.'
    ],
    actionStepsEn: [
      'Drain excess standing water to reduce microclimate humidity.',
      'Balance potash application and avoid high urea doses.',
      'Apply Pseudomonas fluorescens (20g/L) targeted at the plant base.',
      'Keep bunds clean of grass weeds which host the fungus.'
    ],
    safetyWarningMl: 'രോഗം ബാധിച്ച കച്ചി/വൈക്കോൽ അടുത്ത കൃഷിക്ക് മുൻപ് കത്തിച്ചു നശിപ്പിക്കുക.',
    safetyWarningEn: 'Burn heavily infected stubble to prevent sclerotia survival.'
  },

  // 5. Stem Borer (തണ്ടുതുരപ്പൻ പുഴു)
  {
    id: 'RULE_STEM_BORER',
    keywordsMl: ['തണ്ടുതുരപ്പൻ', 'തുരപ്പൻ', 'വെൺകതിർ', 'തണ്ട് ഉണങ്ങൽ', 'തണ്ടു തുരപ്പൻ', 'കതിർ തുരപ്പൻ', 'കതിർതുരപ്പൻ', 'നടുനാമ്പ്', 'വെളുത്ത കതിർ', 'തുരപ്പൻ പുഴു'],
    keywordsEn: ['stem borer', 'dead heart', 'white earhead', 'scirpophaga', 'thandu thurappan', 'thurappan', 'venkathir', 'kathir thurappan', 'thurappan puzhu'],
    category: 'pest_stem_borer',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.1.1: Stem Borer Management',
    summaryMl: 'നെൽച്ചെടിയുടെ നടുനാമ്പ് ഉണങ്ങുന്നതും (Dead heart) കതിരുകൾ വെൺകതിരാകുന്നതും (White earhead) തണ്ടുതുരപ്പൻ പുഴുവിന്റെ ലക്ഷണമാണ്.',
    summaryEn: 'Dead heart in vegetative stage or white earheads at heading indicates Yellow Stem Borer.',
    actionStepsMl: [
      'പാടത്ത് ട്രൈക്കോഗ്രാമ (Trichogramma japonicum) പരാദ കാർഡുകൾ ഹെക്ടറിന് 5 സിസി നിരക്കിൽ നിക്ഷേപിക്കുക.',
      'പാടത്ത് ഏക്കറിന് 4 എണ്ണം എന്ന നിരക്കിൽ ഫെറമോൺ കെണികൾ (Pheromone traps) സ്ഥാപിക്കുക.',
      'ഞാറ്റടിയിൽ നിന്ന് നടുന്നതിന് മുൻപ് ഇലത്തുമ്പുകൾ നുള്ളിക്കളയുന്നത് മുട്ടക്കൂട്ടങ്ങൾ ഒഴിവാക്കാൻ സഹായിക്കും.',
      'രൂക്ഷബാധയുണ്ടെങ്കിൽ വേപ്പെണ്ണ അധിഷ്ഠിത കീടനാശിനികൾ (Azadirachtin) ഉപയോഗിക്കുക.'
    ],
    actionStepsEn: [
      'Release Trichogramma japonicum egg parasitoids at 5 cc/ha.',
      'Install sex pheromone traps at 4-5 per acre for monitoring.',
      'Clip leaf tips before transplanting to remove egg masses.',
      'Use neem-based formulations (Azadirachtin 1%) in early pest stages.'
    ],
    safetyWarningMl: 'മിത്രകീടങ്ങളെ നശിപ്പിക്കുന്ന വീര്യമേറിയ കീടനാശിനികൾ തളിക്കരുത്.',
    safetyWarningEn: 'Avoid broad-spectrum insecticides that kill natural predators.'
  },

  // 6. Leaf Folder (ഇലച്ചുരുട്ടി പുഴു)
  {
    id: 'RULE_LEAF_FOLDER',
    keywordsMl: ['ഇലച്ചുരുട്ടി', 'ചുരുട്ടി', 'ഇല മടക്കൽ', 'ഇല ചുരുളൽ', 'ഇലച്ചുരുട്ടൻ', 'ഓലചുരുട്ടി', 'ഓലച്ചുരുട്ടി', 'ഓല ചുരുട്ടി', 'ഓലചുരുട്ടൻ', 'ഇല ചുരുട്ടി', 'ചുരുട്ടി പുഴു', 'ഓലചുരുട്ടി പുഴു', 'ഓലച്ചുരുട്ടൻ പുഴു'],
    keywordsEn: ['leaf folder', 'cnaphalocrocis', 'folded leaves', 'ila churutti', 'ilachurutti', 'churutti', 'ola churutti', 'olachurutti', 'ola churutti puzhu'],
    category: 'pest_leaf_folder',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.1.2: Leaf Folder Management',
    summaryMl: 'നെല്ലിലകൾ നീളത്തിൽ മടക്കി പച്ചപ്പ് കാർന്നുതിന്നുന്നതും വെള്ള വരകൾ കാണുന്നതും ഇലച്ചുരുട്ടി പുഴുവിന്റെ (Leaf Folder) ലക്ഷണമാണ്.',
    summaryEn: 'Longitudinally folded leaves with scraped white patches indicate Rice Leaf Folder.',
    actionStepsMl: [
      'പാടത്ത് കയർ വലിക്കുന്നത് (മുള്ളുകയർ അല്ലെങ്കിൽ കൊങ്ങിണിത്തണ്ട്) വഴി പുഴുക്കളെ കൊഴിച്ചിടാം.',
      'വരമ്പുകളിലെ പുല്ലുകൾ ചെത്തിക്കളഞ്ഞ് പാടം വൃത്തിയായി സൂക്ഷിക്കുക.',
      'ബവേറിയ ബാസിയാന (Beauveria bassiana 20 ഗ്രാം/ലിറ്റർ) അല്ലെങ്കിൽ വേപ്പെണ്ണ എമൽഷൻ തളിക്കുക.',
      'വിളക്കിൻ കെണി (Light trap) സ്ഥാപിച്ച് തള്ളയന്തകളെ നശിപ്പിക്കുക.'
    ],
    actionStepsEn: [
      'Drag thorny ropes across the canopy to dislodge larvae into water.',
      'Keep bunds free of grassy weeds.',
      'Spray entomopathogenic fungus Beauveria bassiana (20g/L) or neem emulsion.',
      'Use light traps to monitor and catch adult moths.'
    ],
    safetyWarningMl: 'ഒരു ചെടിയിൽ 2 ഇലകളിൽ കൂടുതൽ മടങ്ങിയിട്ടുണ്ടെങ്കിൽ മാത്രം രാസനിയന്ത്രണം ആലോചിക്കുക.',
    safetyWarningEn: 'Consider chemical sprays only if ETL exceeds 2 damaged leaves per hill.'
  },

  // 7. Rice Bug / Earhead Bug (ചാഴി)
  {
    id: 'RULE_RICE_BUG',
    keywordsMl: ['ചാഴി', 'ചാഴിശല്യം', 'പാൽ ഊറ്റിക്കുടിക്കൽ', 'ചാഴിയെ', 'ചാഴി ശല്യം'],
    keywordsEn: ['rice bug', 'earhead bug', 'leptocorisa', 'gundhi bug', 'chazhi', 'chazhishalyam', 'chazhi shalyam'],
    category: 'pest_rice_bug',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.1.3: Rice Bug Management',
    summaryMl: 'നെൽമണികൾ പാൽപ്പാകമാകുമ്പോൾ നീരൂറ്റിക്കുടിക്കുകയും പതിരാക്കുകയും ചെയ്യുന്നത് ചാഴിയുടെ (Rice Bug) ആക്രമണമാണ്.',
    summaryEn: 'Empty chaffy grains with black spots during milky stage indicate Rice Bug (Leptocorisa) damage.',
    actionStepsMl: [
      'അതിരാവിലെയോ സന്ധ്യയ്ക്കോ പച്ചച്ചാണകം, ചത്ത ഞണ്ട് അല്ലെങ്കിൽ ഉണക്കമീൻ വച്ച കെണികൾ പാടവരമ്പിൽ വെയ്ക്കുക.',
      'പാടവരമ്പുകളിലെ പുല്ലുകൾ പൂക്കുന്നതിന് മുൻപ് ചെത്തിമാറ്റുക.',
      'വേപ്പെണ്ണ-വെളുത്തുള്ളി മിശ്രിതം (2%) തളിക്കുന്നത് ചാഴിയെ അകറ്റും.',
      'ബാധ രൂക്ഷമെങ്കിൽ പ്രഭാതത്തിൽ കാറ്റില്ലാത്ത സമയത്ത് വേപ്പധിഷ്ഠിത കീടനാശിനി തളിക്കുക.'
    ],
    actionStepsEn: [
      'Set up dead crab or dried fish stinking traps along bunds in early morning.',
      'Clear flowering grasses from bunds to deny alternate hosts.',
      'Spray 2% Neem oil-garlic emulsion as an effective repellent.',
      'Treat in the cool morning hours when bugs are less active.'
    ],
    safetyWarningMl: 'നെല്ല് മൂപ്പെത്തിയ ഘട്ടത്തിൽ ദീർഘനാൾ വിഷാംശം നിൽക്കുന്ന രാസകീടനാശിനികൾ തളിക്കരുത്.',
    safetyWarningEn: 'Never apply persistent toxic pesticides close to harvest.'
  },

  // 8. General Pest / Worm / Caterpillar (പൊതുവായ പുഴു / കീടബാധ)
  {
    id: 'RULE_GENERAL_PEST',
    keywordsMl: ['പുഴു', 'കീടം', 'കീടങ്ങൾ', 'പുഴുക്കടി', 'പുഴുശല്യം', 'പുഴുക്കൾ', 'കീടബാധ'],
    keywordsEn: ['pest', 'caterpillar', 'insect', 'worm', 'pests', 'larvae', 'puzhu', 'keedam', 'puzhukkadi', 'puzhu shalyam'],
    category: 'pest_general',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 3.1: Integrated Pest Management (IPM)',
    summaryMl: 'നെൽപ്പാടത്തെ കീടശല്യങ്ങൾ നിയന്ത്രിക്കാൻ സംയോജിത കീടനിയന്ത്രണ മാർഗ്ഗങ്ങൾ (IPM) സ്വീകരിക്കുക.',
    summaryEn: 'Adopt Integrated Pest Management (IPM) protocols for paddy insect pests.',
    actionStepsMl: [
      'ഏത് പുഴുവാണെന്ന് തിരിച്ചറിയുക (തണ്ടുതുരപ്പൻ, ഇലച്ചുരുട്ടി, ചാഴി, അല്ലെങ്കിൽ മുഞ്ഞ).',
      'പാടത്ത് മിത്രകീടങ്ങളായ തുമ്പികൾ, ചിലന്തികൾ, കൊമ്പൻപുഴുക്കൾ എന്നിവയുണ്ടോ എന്ന് നിരീക്ഷിക്കുക.',
      'തുടക്കത്തിൽ ജൈവകീടനാശിനിയായ സ്യൂഡോമോണസ് അല്ലെങ്കിൽ വേപ്പെണ്ണ എമൽഷൻ പ്രയോഗിക്കുക.',
      'കൂടുതൽ വിവരങ്ങൾക്ക് ഇലയുടെ ചിത്രം "വിള പരിശോധന" ടാബിൽ നൽകുക.'
    ],
    actionStepsEn: [
      'Identify specific pest species (Stem borer, Leaf folder, Rice bug, or BPH).',
      'Encourage natural biocontrol agents such as spiders, dragonflies, and mirid bugs.',
      'Use botanical formulations like neem oil emulsion or bio-agent Beauveria.',
      'Upload a leaf photograph under Crop Analysis tab for precise identification.'
    ],
    safetyWarningMl: 'അളവിലും സമയത്തിലും ഉള്ള തെറ്റായ കീടനാശിനി പ്രയോഗം പ്രതിരോധശേഷിയുള്ള കീടങ്ങളെ ഉണ്ടാക്കും.',
    safetyWarningEn: 'Indiscriminate spraying leads to secondary pest resurgence.'
  },

  // 9. Yellowing & Nutrient Deficiency (ഇല മഞ്ഞളിപ്പ് / പോഷകക്കുറവ്)
  {
    id: 'RULE_YELLOWING_DEFICIENCY',
    keywordsMl: ['മഞ്ഞളിപ്പ്', 'മഞ്ഞളിക്കുന്നു', 'മഞ്ഞ നിറം', 'ഇല മഞ്ഞ', 'മഞ്ഞളിച്ച', 'മഞ്ഞപ്പാട്'],
    keywordsEn: ['yellowing', 'chlorosis', 'yellow leaves', 'pale yellow', 'nitrogen deficiency', 'manjalippu', 'manjalikkunnu', 'manja niram', 'manja'],
    category: 'deficiency_yellowing',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 2.4: Soil Fertility & Nutrient Deficiencies',
    summaryMl: 'നെല്ലിലകൾ മഞ്ഞളിക്കുന്നത് നൈട്രജന്റെയോ (യൂറിയ), സിങ്കിന്റെയോ, ഇരുമ്പിന്റെയോ കുറവു മൂലമോ അല്ലെങ്കിൽ വെള്ളക്കെട്ട് മൂലമോ ഉണ്ടാകാം.',
    summaryEn: 'Yellowing of leaves typically indicates Nitrogen/Zinc deficiency or root asphyxiation from stagnation.',
    actionStepsMl: [
      'പാടത്ത് വെള്ളം കെട്ടിക്കിടന്ന് വേരുകൾ ചീയുന്നുണ്ടെങ്കിൽ വെള്ളം വാർത്ത് മണ്ണിലേക്ക് വായു കയറ്റുക.',
      'നൈട്രജൻ കുറവാണെങ്കിൽ (താഴത്തെ ഇലകൾ മഞ്ഞളിക്കൽ) ശുപാർശ ചെയ്ത അളവിൽ യൂറിയ മേൽവളമായി നൽകുക.',
      'മണ്ണിൽ പുളിപ്പ് കൂടുതലാണെങ്കിൽ (കുട്ടനാട് പ്രദേശം) കുമ്മായം അല്ലെങ്കിൽ ഡോളമൈറ്റ് ചേർക്കുക.',
      'സിങ്ക് കുറവാണെങ്കിൽ സിങ്ക് സൾഫേറ്റ് (Zinc Sulphate - 0.5%) ഇലകളിൽ തളിക്കുക.'
    ],
    actionStepsEn: [
      'Drain stagnant water to allow soil aeration and root respiration.',
      'If lower leaves are pale, apply recommended Nitrogen (urea) top-dressing.',
      'In acidic Kuttanad soils, correct pH with agricultural lime or dolomite.',
      'Foliar spray Zinc Sulphate (0.5%) if interveinal chlorosis persists.'
    ],
    safetyWarningMl: 'മഴയുള്ള സമയത്ത് വളപ്രയോഗം നടത്തരുത്; വെള്ളം ഒലിച്ചുപോകും.',
    safetyWarningEn: 'Do not apply nitrogen fertilizers when heavy rainfall is expected.'
  },

  // 10. Fertilizer Schedule & Nutrition (നെല്ലിന്റെ വളപ്രയോഗം)
  {
    id: 'RULE_FERTILIZER_SCHEDULE',
    keywordsMl: ['വളപ്രയോഗം', 'വളം', 'യൂറിയ', 'പൊട്ടാഷ്', 'ഫാക്ടംഫോസ്', 'രാജ്ഫോസ്', 'അടിവളം', 'മേൽവളം', 'നൈട്രജൻ'],
    keywordsEn: ['fertilizer', 'urea', 'potash', 'factamfos', 'rajphos', 'basal dose', 'top dressing', 'nutrition', 'valam', 'valaprayogam', 'adivalam', 'melvalam'],
    category: 'fertilizer_schedule',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 2.3: Nutrient Management & Fertilizer Schedule',
    summaryMl: 'കേരളത്തിലെ നെൽക്കൃഷിക്ക് KAU ശുപാർശ ചെയ്യുന്ന ശാസ്ത്രീയ വളപ്രയോഗ ഷെഡ്യൂൾ പാലിക്കുക (NPK അനുപാതം).',
    summaryEn: 'Follow the standard KAU recommended fertilizer schedule for high-yielding paddy varieties.',
    actionStepsMl: [
      'അടിവളം (Basal dose): അവസാന ഉഴവിൽ രാജ്ഫോസ് (ഫോസ്ഫറസ് മുഴുവനും), മൂന്നിലൊന്ന് പൊട്ടാഷ്, മൂന്നിലൊന്ന് യൂറിയ ചേർക്കുക.',
      'രണ്ടാം തവണ (ചിനപ്പുപൊട്ടൽ ഘട്ടം - 20-25 ദിവസം): മൂന്നിലൊന്ന് യൂറിയ പാടത്തെ വെള്ളം കുറച്ച ശേഷം വിതറുക.',
      'മൂന്നാം തവണ (കതിരിടൽ ഘട്ടം - 40-45 ദിവസം): ബാക്കി യൂറിയയും പൊട്ടാഷും നൽകുക.',
      'വളമിടുമ്പോൾ പാടത്ത് 2-3 സെ.മീ വെള്ളം മാത്രം നിർത്തുക; 24 മണിക്കൂർ കഴിഞ്ഞ് പുതിയ വെള്ളം കയറ്റുക.'
    ],
    actionStepsEn: [
      'Basal Application: Full Phosphorus (Rajphos), 1/3rd Potash, and 1/3rd Nitrogen (Urea) at final puddling.',
      'First Top-Dressing (Tillering - 20-25 days): 1/3rd Nitrogen after reducing water depth.',
      'Second Top-Dressing (Panicle initiation - 40-45 days): Remaining Nitrogen and Potash.',
      'Maintain minimal standing water (2-3 cm) during application; refill after 24 hours.'
    ],
    safetyWarningMl: 'കതിരിട്ടതിനു ശേഷം അമിതമായി യൂറിയ നൽകുന്നത് ഇലക്കരിച്ചിലിനും കീടബാധയ്ക്കും കാരണമാകും.',
    safetyWarningEn: 'Excessive urea at heading stage triggers blast and stem lodging.'
  },

  // 11. Adverse Weather & Rain Precaution (മഴയും വളപ്രയോഗവും)
  {
    id: 'RULE_FERTILIZER_RAIN',
    keywordsMl: ['മഴ', 'മഴക്കാലം', 'മഴ പെയ്യാൻ'],
    keywordsEn: ['rain', 'rainy', 'monsoon', 'downpour', 'mazha'],
    category: 'weather_precaution',
    outcome: 'WEATHER_PRECAUTION',
    reference: 'KAU Integrated Nutrient Management: Adverse Weather Directives',
    summaryMl: 'മഴയുള്ളപ്പോഴോ അടുത്ത 24 മണിക്കൂറിൽ ശക്തമായ മഴയ്ക്ക് സാധ്യതയുള്ളപ്പോഴോ വളപ്രയോഗം പാടില്ല.',
    summaryEn: 'Do not apply fertilizers when rainfall is imminent within 24 hours.',
    actionStepsMl: [
      'കനത്ത മഴയിൽ വളങ്ങൾ ഒലിച്ചുപോയി കർഷകന് സാമ്പത്തിക നഷ്ടവും പരിസ്ഥിതി ദോഷവും ഉണ്ടാകും.',
      'മഴ മാറി പാടത്തെ വെള്ളം നിയന്ത്രണവിധേയമായ ശേഷം മാത്രം വളമിടുക.',
      'മണ്ണിൽ തക്കതായ ഈർപ്പമുള്ളപ്പോൾ പ്രഭാതത്തിലോ വൈകുന്നേരമോ വളപ്രയോഗം നടത്തുക.'
    ],
    actionStepsEn: [
      'Heavy rain washes away applied nutrients, causing economic loss and leaching.',
      'Postpone top-dressing until rainfall stops and water depth is normalized.',
      'Apply fertilizers during early morning or late afternoon with adequate soil moisture.'
    ],
    safetyWarningMl: 'മഴയുള്ളപ്പോൾ യൂറിയ പ്രയോഗിക്കുന്നത് രോഗബാധ വർദ്ധിപ്പിക്കും.',
    safetyWarningEn: 'Urea application during damp rainfall accelerates blast disease.'
  },

  // 12. Water Management (ജലക്രമീകരണം)
  {
    id: 'RULE_WATER_MANAGEMENT',
    keywordsMl: ['വെള്ളം', 'നന', 'കെട്ടിനിർത്തുക', 'വാർക്കുക', 'കുട്ടനാട്', 'പുഞ്ച', 'വെള്ളപ്പൊക്കം', 'നീർവാർച്ച', 'കെട്ടിക്കിടക്കുന്നു'],
    keywordsEn: ['water', 'irrigation', 'drainage', 'flood', 'kuttanad', 'waterlogging', 'vellam', 'nanakka', 'neervarcha'],
    category: 'water_management',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Ad-hoc Package of Practices for Kuttanad & Kole Lands: Water Management',
    summaryMl: 'നെൽപ്പാടത്തെ ജലക്രമീകരണം വളർച്ചാഘട്ടത്തെ ആശ്രയിച്ചായിരിക്കണം.',
    summaryEn: 'Water level in paddy fields must correspond strictly to crop growth stage.',
    actionStepsMl: [
      'ചിനപ്പുപൊട്ടൽ ഘട്ടത്തിൽ (Tillering stage): 2-5 സെ.മീ വെള്ളം മാത്രം നിലനിർത്തുക. അധികവെള്ളം ചിനപ്പുകൾ വരുന്നത് തടയും.',
      'വളപ്രയോഗത്തിന് മുൻപ് പാടത്തെ വെള്ളം പരമാവധി കുറയ്ക്കുക. വളം നൽകി 24 മണിക്കൂറിനു ശേഷം മാത്രം പുതിയ വെള്ളം കയറ്റുക.',
      'കതിരിടുന്ന ഘട്ടത്തിൽ (Panicle initiation): പാടത്ത് ഈർപ്പം തുടർച്ചയായി നിലനിർത്തുക (5 സെ.മീ വെള്ളം).',
      'വിളവെടുപ്പിന് 10-15 ദിവസം മുൻപ് പാടത്തെ വെള്ളം പൂർണ്ണമായി വാർത്തു കളയുക.'
    ],
    actionStepsEn: [
      'Tillering stage: Maintain shallow water depth (2-5 cm). Deep water hinders tillering.',
      'Fertilizer application: Drain water before applying, refill after 24-48 hours.',
      'Panicle initiation to flowering: Ensure steady moisture (5 cm standing water).',
      'Pre-harvest: Drain field completely 10-15 days before harvest.'
    ],
    safetyWarningMl: 'അമിതമായ ജലനിരപ്പ് കളകൾക്കും രോഗങ്ങൾക്കും കാരണമാകും.',
    safetyWarningEn: 'Excessive standing water promotes anaerobic root rot and weeds.'
  },

  // 13. Weed Management (കളനിയന്ത്രണം)
  {
    id: 'RULE_WEED_MANAGEMENT',
    keywordsMl: ['കള', 'കളകൾ', 'കളനാശിനി', 'കളനിയന്ത്രണം', 'പുല്ല്', 'പായൽ'],
    keywordsEn: ['weed', 'weeds', 'herbicide', 'weed management', 'grassy weeds', 'kala', 'kalakal', 'kalanashini'],
    category: 'weed_management',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 2.5: Weed Control in Wet Seeded Rice',
    summaryMl: 'നെൽപ്പാടത്തെ കളകൾ വിളവിന്റെ 30-40% വരെ നഷ്ടപ്പെടുത്താം. ആദ്യ 30 ദിവസങ്ങളിലെ കളനിയന്ത്രണം നിർണ്ണായകമാണ്.',
    summaryEn: 'Unchecked weed competition during early crop establishment reduces paddy yield by 30-40%.',
    actionStepsMl: [
      'വിതച്ച് അല്ലെങ്കിൽ നട്ട് 15-20 ദിവസത്തിനുള്ളിൽ ആദ്യ കളയെടുപ്പ് നടത്തുക.',
      'പാടത്ത് ശരിയായ ജലനിരപ്പ് (2-3 സെ.മീ) നിലനിർത്തുന്നത് കളകൾ മുളയ്ക്കുന്നത് തടയും.',
      'കൈക്കളയെടുക്കൽ അല്ലെങ്കിൽ കോണോ വീഡർ (Cono weeder) ഉപയോഗിക്കുന്നത് മണ്ണിൽ വായുസഞ്ചാരവും കൂട്ടും.',
      'കളനാശിനി ഉപയോഗിക്കുകയാണെങ്കിൽ കൃഷി ഓഫീസറുടെ കൃത്യമായ അളവ് ശുപാർശ പ്രകാരം മാത്രം തളിക്കുക.'
    ],
    actionStepsEn: [
      'Carry out manual weeding or cono-weeding at 15-20 days after sowing.',
      'Maintain shallow standing water layer (2-3 cm) to suppress weed emergence.',
      'Use mechanical weeders to incorporate weeds and aerate the root zone.',
      'Consult agricultural officer for approved selective herbicides matching weed flora.'
    ],
    safetyWarningMl: 'മണ്ണ് വരണ്ടിരിക്കുമ്പോൾ കളനാശിനികൾ തളിക്കരുത്; വിളയ്ക്ക് ദോഷം ചെയ്യും.',
    safetyWarningEn: 'Never spray herbicides on drought-stressed rice fields.'
  },

  // 14. Seed Treatment & Nursery (വിത്തുചികിത്സ & ഞാറ്റടി)
  {
    id: 'RULE_SEED_NURSERY',
    keywordsMl: ['വിത്ത്', 'ഞാറ്', 'ഞാറ്റടി', 'വിത്തുചികിത്സ', 'മുളപ്പിക്കൽ', 'നടീൽ', 'വിത്തു'],
    keywordsEn: ['seed', 'nursery', 'seedling', 'transplanting', 'seed treatment', 'germination', 'vithu', 'njaaru', 'njaattadi'],
    category: 'seed_treatment',
    outcome: 'FOLLOW_VERIFIED_GUIDANCE',
    reference: 'KAU Package of Practices - Rice, Section 2.1: Seed Selection and Bio-Priming',
    summaryMl: 'ആരോഗ്യമുള്ള വിളവിന് ഗുണമേന്മയുള്ള വിത്തും സ്യൂഡോമോണസ് വിത്തുചികിത്സയും അത്യാവശ്യമാണ്.',
    summaryEn: 'Quality certified seed and bio-priming with Pseudomonas ensures vigorous seedling establishment.',
    actionStepsMl: [
      'വിത്ത് ഉപ്പുവെള്ളത്തിൽ (1.06 സ്പെസിഫിക് ഗ്രാവിറ്റി) മുക്കി പതിര് മാറ്റി നല്ല വിത്തുകൾ തിരഞ്ഞെടുക്കുക.',
      'ഒരു കിലോ വിത്തിന് 10 ഗ്രാം സ്യൂഡോമോണസ് ഫ്ലൂറസെൻസ് എന്ന തോതിൽ കലക്കി 12-16 മണിക്കൂർ കുതിർക്കുക.',
      'കുതിർത്ത വിത്ത് ഈർപ്പമുള്ള ചാക്കിൽ കെട്ടി 24-36 മണിക്കൂർ മുളപ്പിക്കാൻ വെയ്ക്കുക.',
      'ഞാറ്റടിയിൽ വിതയ്ക്കുമ്പോൾ അധികം വെള്ളം കെട്ടിനിൽക്കാതെ നോക്കുക.'
    ],
    actionStepsEn: [
      'Separate healthy dense seeds using 10% saltwater floatation test.',
      'Soak seeds with Pseudomonas fluorescens (10g per kg of seed) for 12-16 hours.',
      'Incubate seeds in moist gunny bags for 24-36 hours for uniform sprouting.',
      'Ensure proper drainage in the nursery bed to prevent damping-off.'
    ],
    safetyWarningMl: 'രാസ കുമിൾനാശിനികളിൽ മുക്കിയ വിത്തിൽ ഒരേസമയം സ്യൂഡോമോണസ് ചേർക്കരുത്.',
    safetyWarningEn: 'Do not mix bio-agents directly with chemical fungicides.'
  }
];

/**
 * Process a Malayalam/English farmer question through the deterministic advisor
 */
export function adviseQuestion({ question, cropStage = '', symptoms = [], language = 'ml' }) {
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return {
      success: false,
      outcome: 'REQUEST_MORE_INFORMATION',
      summary: language === 'en' ? 'Please enter your question.' : 'ദയവായി നിങ്ങളുടെ ചോദ്യം രേഖപ്പെടുത്തുക.',
      summaryMl: 'ദയവായി നിങ്ങളുടെ ചോദ്യം രേഖപ്പെടുത്തുക.',
      summaryEn: 'Please enter your question.',
      actionSteps: language === 'en' ? ['Type your question in Malayalam or English, or use voice input.'] : ['ചോദ്യം മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്രോഫോൺ ഉപയോഗിക്കുക.'],
      actionStepsMl: ['ചോദ്യം മലയാളത്തിലോ ഇംഗ്ലീഷിലോ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ മൈക്രോഫോൺ ഉപയോഗിക്കുക.'],
      actionStepsEn: ['Type your question in Malayalam or English, or use voice input.'],
      safetyWarning: language === 'en' ? 'Provide a question to get advice.' : 'സംശയം വ്യക്തമാക്കുക.',
      safetyWarningMl: 'സംശയം വ്യക്തമാക്കുക.',
      safetyWarningEn: 'Provide a question to get advice.',
      missingContext: ['question'],
      reference: 'Karshaka Care Validator'
    };
  }

  const queryNorm = question.toLowerCase();

  // Special Check: Rain + Fertilizer compound condition
  const hasRain = ['മഴ', 'മഴക്കാലം', 'മഴ പെയ്യാൻ', 'rain', 'rainy', 'mazha'].some(w => queryNorm.includes(w));
  const hasFertilizer = ['വളം', 'യൂറിയ', 'പൊട്ടാഷ്', 'വിതറാൻ', 'fertilizer', 'urea', 'potash', 'valam'].some(w => queryNorm.includes(w));

  // Find matching rules by keywords
  let matchedRule = null;
  let highestMatchScore = 0;

  for (const rule of ADVISOR_RULES) {
    let score = 0;

    // RULE_FERTILIZER_RAIN requires rain
    if (rule.id === 'RULE_FERTILIZER_RAIN') {
      if (hasRain && hasFertilizer) score += 10;
      else if (hasRain) score += 4;
      else continue;
    }

    // RULE_FERTILIZER_SCHEDULE applies when asking about fertilizers without rain
    if (rule.id === 'RULE_FERTILIZER_SCHEDULE') {
      if (hasFertilizer && !hasRain) score += 8;
    }

    for (const kw of rule.keywordsMl) {
      if (queryNorm.includes(kw.toLowerCase())) {
        score += kw.length > 4 ? 4 : 2;
      }
    }
    for (const kw of rule.keywordsEn) {
      if (queryNorm.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 2;
      }
    }

    if (score > highestMatchScore) {
      highestMatchScore = score;
      matchedRule = rule;
    }
  }

  // If match found with sufficient relevance
  if (matchedRule && highestMatchScore >= 2) {
    return {
      success: true,
      ruleId: matchedRule.id,
      category: matchedRule.category,
      outcome: matchedRule.outcome,
      summary: language === 'en' ? matchedRule.summaryEn : matchedRule.summaryMl,
      summaryMl: matchedRule.summaryMl,
      summaryEn: matchedRule.summaryEn,
      actionSteps: language === 'en' ? matchedRule.actionStepsEn : matchedRule.actionStepsMl,
      actionStepsMl: matchedRule.actionStepsMl,
      actionStepsEn: matchedRule.actionStepsEn,
      safetyWarning: language === 'en' ? matchedRule.safetyWarningEn : matchedRule.safetyWarningMl,
      safetyWarningMl: matchedRule.safetyWarningMl,
      safetyWarningEn: matchedRule.safetyWarningEn,
      reference: matchedRule.reference,
      missingContext: [],
      timestamp: new Date().toISOString()
    };
  }

  // Vague or unclassified request -> Request More Context safely
  const defaultSummaryMl = 'നിങ്ങളുടെ ചോദ്യം ലഭിച്ചു. കൂടുതൽ കൃത്യമായ നിർണ്ണയത്തിന് വളർച്ചാഘട്ടവും ഇലകളിലെ പ്രധാന ലക്ഷണങ്ങളും വ്യക്തമാക്കുക.';
  const defaultSummaryEn = 'We received your query. To provide accurate guidance, please specify the crop growth stage and observed leaf symptoms.';
  const defaultActionStepsMl = [
    'വിള ഏത് ഘട്ടത്തിലാണ് (മുളപ്പൊട്ടൽ, ചിനപ്പുപൊട്ടൽ, കതിരിടൽ)?',
    'ഇലകളിൽ പുള്ളികളോ, കരിച്ചിലോ, മഞ്ഞളിപ്പോ ഉണ്ടോ?',
    'സാധ്യമെങ്കിൽ "വിള പരിശോധന" ടാബിൽ ഇലയുടെ ഒരു ചിത്രം അപ്‌ലോഡ് ചെയ്യുക.'
  ];
  const defaultActionStepsEn = [
    'What is the growth stage (Seedling, Tillering, Panicle initiation)?',
    'Are there spots, drying, or yellowing on the leaves?',
    'If possible, upload a photograph of the affected leaf in the Crop Analysis tab.'
  ];
  const defaultSafetyWarningMl = 'കൃത്യമായ രോഗനിർണ്ണയം ഇല്ലാതെ രാസവളങ്ങളോ കീടനാശിനികളോ തളിക്കരുത്.';
  const defaultSafetyWarningEn = 'Do not spray chemicals without confirmed diagnosis.';

  return {
    success: true,
    ruleId: 'RULE_REQUEST_MORE_INFO',
    category: 'general_query',
    outcome: 'REQUEST_MORE_INFORMATION',
    summary: language === 'en' ? defaultSummaryEn : defaultSummaryMl,
    summaryMl: defaultSummaryMl,
    summaryEn: defaultSummaryEn,
    actionSteps: language === 'en' ? defaultActionStepsEn : defaultActionStepsMl,
    actionStepsMl: defaultActionStepsMl,
    actionStepsEn: defaultActionStepsEn,
    safetyWarning: language === 'en' ? defaultSafetyWarningEn : defaultSafetyWarningMl,
    safetyWarningMl: defaultSafetyWarningMl,
    safetyWarningEn: defaultSafetyWarningEn,
    missingContext: ['crop_stage', 'leaf_symptoms', 'photo'],
    reference: 'KAU Good Agricultural Practices (GAP) Diagnostic Protocol',
    timestamp: new Date().toISOString()
  };
}
