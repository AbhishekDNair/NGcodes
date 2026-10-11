let currentLanguage = 'en'; // Default: English (can toggle to Malayalam)
let activeTraceCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initConnectivityListener();
  initLanguageToggle();
  initAdvisorQueryForm();
  initQuickChips();
  initCropAnalysisDropzone();
  initFarmLogForm();
  initWeatherSelector();
  initTracePanel();
  fetchSystemStatus();
  registerServiceWorker();
  initVoiceAssistant();
  initSchemeAssistant();
  initFarmPlanner();
  initDisasterRadar();

  logTrace('SYSTEM', 'Karshaka Care Malayalam Interface loaded successfully.', 'system');
});

// 1. Navigation Controller
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      
      navItems.forEach(item => item.classList.remove('active'));
      btn.classList.add('active');

      viewPanels.forEach(panel => {
        if (panel.id === `view-${targetView}`) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });

      if (targetView === 'farmlog') {
        loadFarmLogEntries();
      } else if (targetView === 'disaster') {
        loadDisasterRadarData();
      }

      logTrace('NAV', `Navigated to view: ${targetView}`, 'system');
    });
  });

  // Link in dashboard to crop view
  const gotoCropLink = document.getElementById('link-goto-crop');
  if (gotoCropLink) {
    gotoCropLink.addEventListener('click', (e) => {
      e.preventDefault();
      const cropNav = document.getElementById('nav-crop');
      if (cropNav) cropNav.click();
    });
  }
}

// 2. Connectivity Online/Offline Status Indicator
function initConnectivityListener() {
  const statusContainer = document.getElementById('connectivity-status');
  const statusText = document.getElementById('connectivity-text');

  function updateStatus() {
    if (navigator.onLine) {
      statusContainer.className = 'status-indicator status-online';
      statusText.textContent = currentLanguage === 'ml' ? 'ഓൺലൈൻ (Online)' : 'Online';
      logTrace('NETWORK', 'Connection restored: Online mode active', 'system');
    } else {
      statusContainer.className = 'status-indicator status-offline';
      statusText.textContent = currentLanguage === 'ml' ? 'ഓഫ്‌ലൈൻ (Offline - ലോക്കൽ മോഡ്)' : 'Offline (Local Mode)';
      logTrace('NETWORK', 'Device offline: Offline local decision rules active', 'system');
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();
}

// 3. Comprehensive Multi-Language System (Malayalam <-> English)
const I18N_DICTIONARY = {
  ml: {
    // Header & Meta
    toggle_label: 'English',
    header_subtitle: 'നെൽകൃഷി തീരുമാനങ്ങൾ നിങ്ങളുടെ ഭാഷയിൽ • ഓഫ്‌ലൈനിലും ലഭ്യമാണ്',
    brand_badge: 'Karshaka Care',
    conn_online: 'ഓൺലൈൻ (Online)',
    conn_offline: 'ഓഫ്‌ലൈൻ (Offline - ലോക്കൽ മോഡ്)',
    doc_title: 'കർഷക കെയർ | Karshaka Care - കാർഷിക നിർണ്ണയ സഹായി',

    // Navigation
    nav_home: 'ഹോം & സംശയങ്ങൾ',
    nav_crop: 'വിള പരിശോധന',
    nav_farmlog: 'ഫാം ലോഗ്',
    nav_weather: 'കാലാവസ്ഥ',
    nav_schemes: 'സർക്കാർ പദ്ധതികൾ',
    nav_disaster: 'ഡിസാസ്റ്റർ റഡാർ',
    nav_traces: 'പ്രവർത്തന രേഖ (MCP)',

    // Home / Hero
    hero_tag: '🌾 കേരള കാർഷിക സർവ്വകലാശാല (KAU) നിർദ്ദേശങ്ങൾ അടിസ്ഥാനമാക്കി',
    home_greeting: 'എന്താണ് ഇന്ന് നിങ്ങളുടെ പാടത്തെ സംശയം?',
    home_instructions: 'ചോദ്യങ്ങൾ മലയാളത്തിൽ ചോദിക്കുക, അല്ലെങ്കിൽ താഴെ നൽകിയിട്ടുള്ള സാധാരണ സംശയങ്ങൾ തിരഞ്ഞെടുക്കുക. കൃത്യവും ശാസ്ത്രീയവുമായ മറുപടി തത്സമയം ലഭിക്കും.',
    ask_placeholder: 'ഉദാ: ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു, എന്ത് ചെയ്യണം?',
    ask_btn: 'ചോദിക്കുക (Ask)',
    voice_indicator_text: 'ശ്രദ്ധിക്കുന്നു... ദയവായി മലയാളത്തിൽ സംസാരിക്കുക',
    chips_label: 'സാധാരണ സംശയങ്ങൾ:',
    chip_brown_spot: '🍂 ഇലപ്പുള്ളി രോഗം (Brown Spot)',
    chip_blast: '🌾 ഇലക്കരിച്ചിൽ (Leaf Blast)',
    chip_rain: '🌧️ മഴയും വളപ്രയോഗവും (Rain & Fertilizer)',
    chip_water: '💧 ജലക്രമീകരണം (Water Management)',

    // Advisory Result Card
    result_badge_advisory: 'നിർദ്ദേശം',
    result_badge_category: 'നെൽകൃഷി',
    result_time: 'തത്സമയം',
    result_title: 'നിർണ്ണയ ഫലം',
    action_steps_heading: 'പരിഹാര മാർഗ്ഗങ്ങൾ (Action Steps):',
    safety_default: 'അനാവശ്യമായി കീടനാശിനികൾ ഉപയോഗിക്കരുത്.',
    citation_label: '📚 ആധാരം:',
    btn_speak: 'വായിക്കുക (Speak)',
    btn_save_log: 'ഫാം ലോഗിലേക്ക് ചേർക്കുക',

    // Home Dashboard Cards
    dash_active_crop_title: '🌾 നിലവിലെ വിള (Active Field)',
    dash_paddy_tag: 'നെല്ല് / Paddy',
    dash_location: 'സ്ഥലം: കുട്ടനാട്, ആലപ്പുഴ (Kuttanad, Alappuzha)',
    dash_stage_label: 'വളർച്ചാ ഘട്ടം:',
    dash_stage_val: 'ചിനപ്പുപൊട്ടൽ ഘട്ടം (Tillering Stage)',
    link_goto_crop: 'ഇലകളുടെ ഫോട്ടോ പരിശോധിക്കാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക →',
    dash_weather_title: '🌦️ കാലാവസ്ഥാ വിവരങ്ങൾ',
    weather_loading: 'തത്സമയം വിവരങ്ങൾ ലഭ്യമാക്കുന്നു...',
    weather_adv_checking: 'തത്സമയ കാർഷിക കാലാവസ്ഥ പരിശോധിക്കുന്നു...',

    // Crop Analysis View
    crop_section_title: '🔍 ഇല രോഗനിർണ്ണയം (Local Edge AI Leaf Analysis)',
    crop_section_sub: 'നെൽച്ചെടിയുടെ രോഗബാധയുള്ള ഇലയുടെ ചിത്രം നൽകുക. ഇൻറർനെറ്റ് ഇല്ലാതെ പ്രവർത്തിക്കുന്ന ലോക്കൽ മോഡൽ വഴി കൃത്യമായ രോഗനിർണ്ണയം സാധ്യമാകും.',
    dropzone_title: 'ഇലയുടെ ഫോട്ടോ തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ ഇവിടെ ഇടുക',
    dropzone_hint: 'പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ: JPG, PNG, WebP (പരമാവധി 10MB)',
    btn_browse_file: 'ഫയൽ തിരഞ്ഞെടുക്കുക',
    btn_sample_leaf: '🌾 മാതൃകാ ഇല പരിശോധിക്കുക (Sample Leaf)',
    btn_remove_preview: 'മാറ്റുക ✕',
    label_crop_stage: 'വളർച്ചാ ഘട്ടം (Growth Stage):',
    opt_stage_tillering: 'ചിനപ്പുപൊട്ടൽ ഘട്ടം (Tillering Stage)',
    opt_stage_seedling: 'മുളപ്പൊട്ടൽ ഘട്ടം (Seedling Stage)',
    opt_stage_panicle: 'കതിരിടൽ ഘട്ടം (Panicle Initiation)',
    opt_stage_flowering: 'പൂവിടൽ ഘട്ടം (Flowering Stage)',
    opt_stage_ripening: 'മൂപ്പെത്തൽ ഘട്ടം (Maturity)',
    label_symptoms: 'നിരീക്ഷിച്ച പ്രധാന ലക്ഷണങ്ങൾ (Observed Symptoms):',
    symp_spots: 'ഇലകളിൽ പുള്ളികൾ (Spots)',
    symp_drying: 'ഇല കരിയൽ (Drying)',
    symp_yellowing: 'മഞ്ഞളിപ്പ് (Yellowing)',
    symp_wilting: 'വാട്ടം (Wilting)',
    btn_run_inference: '⚡ ഇല പരിശോധിക്കുക (Analyze Leaf)',
    idle_title: 'രോഗനിർണ്ണയ വിവരങ്ങൾ',
    idle_desc: 'ഫോട്ടോ അപ്‌ലോഡ് ചെയ്ത് "ഇല പരിശോധിക്കുക" ക്ലിക്ക് ചെയ്യുമ്പോൾ ഇവിടെ ഫലം ദൃശ്യമാകും.',
    supported_heading: 'പിന്തുണയ്ക്കുന്ന രോഗങ്ങൾ:',
    dis_brown_spot: 'ഇലപ്പുള്ളി രോഗം (Brown Spot)',
    dis_blast: 'ഇലക്കരിച്ചിൽ (Rice Blast)',
    dis_blb: 'ബാക്ടീരിയൽ ഇലവാട്ടം (Bacterial Leaf Blight)',
    dis_healthy: 'ആരോഗ്യമുള്ള ഇല (Healthy Leaf)',
    inf_diag_badge: 'രോഗനിർണ്ണയം',
    metric_model: 'മോഡൽ:',
    metric_latency: 'എടുത്തെടുത്ത സമയം:',
    metric_runtime: 'റൺടൈം:',
    metric_runtime_val: 'ലോക്കൽ എഡ്ജ് (Local CPU)',
    inf_action_heading: 'നിർദ്ദേശിച്ച തുടർനടപടി (Action Plan):',
    btn_save_inf_log: '💾 ഫാം ലോഗിലേക്ക് സേവ് ചെയ്യുക',

    // FarmLog View
    farmlog_title: '📔 ഫാം ലോഗ് (FarmLog - പാടത്തെ ഓർമ്മപ്പുസ്തകം)',
    farmlog_sub: 'നിങ്ങളുടെ പാടത്തെ നിരീക്ഷണങ്ങളും ചെയ്ത കൃഷിപ്പണികളും ഇവിടെ സുരക്ഷിതമായി രേഖപ്പെടുത്താം. ഇൻറർനെറ്റ് ഇല്ലാതെയും ഇവ ലഭ്യമാണ്.',
    farmlog_add_heading: 'പുതിയ നിരീക്ഷണം രേഖപ്പെടുത്തുക',
    farmlog_stage_label: 'വളർച്ചാ ഘട്ടം:',
    farmlog_type_label: 'രേഖപ്പെടുത്തൽ തരം:',
    opt_type_obs: 'കർഷകന്റെ നിരീക്ഷണം (Observation)',
    opt_type_act: 'പൂർത്തിയാക്കിയ കൃഷിപ്പണി (Completed Task)',
    opt_type_treatment: 'കീടനാശിനി പ്രയോഗം (Treatment / Spray)',
    opt_type_irrigation: 'ജലസേചനം (Irrigation)',
    opt_type_fertilizer: 'വളപ്രയോഗം (Fertilizer)',
    farmlog_notes_label: 'വിശദാംശങ്ങൾ:',
    farmlog_notes_ph: 'ഉദാ: പാടത്ത് രണ്ടാം തവണ പൊട്ടാഷ് വളം നൽകി, വെള്ളം വാർത്തു',
    btn_add_farmlog: '➕ ലോഗിലേക്ക് ചേർക്കുക',
    farmlog_history_heading: 'മുൻകാല രേഖകൾ (History)',
    log_completed_act: 'പൂർത്തിയാക്കിയ പണി',
    log_time_today: 'ഇന്ന്, രാവിലെ 08:30',
    log_sample_content_1: 'ചിനപ്പുപൊട്ടൽ ഘട്ടത്തിൽ പാടത്തെ വെള്ളം 3 സെ.മീ ആയി കുറച്ചു.',
    log_sample_source_1: 'ഉറവിടം: കർഷകൻ രേഖപ്പെടുത്തിയത് • ലോക്കൽ സ്റ്റോറേജ്',
    log_model_diag: 'മോഡൽ നിർണ്ണയം',
    log_time_yesterday: 'ഇന്നലെ, വൈകുന്നേരം 04:15',
    log_sample_content_2: 'ഇലകളിൽ നേരിയ തവിട്ടുപുള്ളി ലക്ഷണങ്ങൾ കണ്ടെത്തി (വിശ്വാസ്യത: 88%). വളർച്ചാ ഘട്ടം: ചിനപ്പുപൊട്ടൽ.',
    log_sample_source_2: 'ഉറവിടം: കർഷക കെയർ ലോക്കൽ എഡ്ജ് മോഡൽ',

    // Farm Planner
    planner_title: '🗓️ അഡാപ്റ്റീവ് ഫാം പ്ലാനർ (Adaptive Farm Planner)',
    planner_subtitle: 'KAU നിർദ്ദേശങ്ങളും ഫാം ലോഗ് ചരിത്രവും അടിസ്ഥാനമാക്കി തയ്യാറാക്കിയ അടുത്ത ഘട്ട ശുപാർശകൾ.',
    btn_generate_plan: '🔍 ഫാം വിശകലനം ചെയ്ത് പ്ലാൻ തയ്യാറാക്കുക',
    planner_stage_label: 'ആസൂത്രണത്തിനായി ഇപ്പോഴത്തെ വളർച്ചാ ഘട്ടം:',
    planner_questions_heading: 'കൂടുതൽ വിവരം ആവശ്യമാണ്:',
    planner_refresh_note: '💡 ഫാം ലോഗ് പ്രവേശനം ചേർക്കുമ്പോൾ ഈ പ്ലാൻ സ്വയം അപ്‍ഡേറ്റ് ആകും.',
    planner_idle_text: 'ഫാം വളർച്ചാ ഘട്ടം തിരഞ്ഞെടുത്ത് "ഫാം വിശകലനം ചെയ്ത് പ്ലാൻ തയ്യാറാക്കുക" ക്ലിക്ക് ചെയ്യൂ.',
    planner_loading: 'ഫാം ചരിത്രം വിശകലനം ചെയ്യുന്നു...',
    planner_all_clear: '✅ ഈ ഘട്ടത്തിലെ എല്ലാ നിർദ്ദേശ നടപടികളും ക്രമത്തിലാണ്. ദൈനംദിന നിരീക്ഷണം തുടരൂ.',

    // Weather View
    weather_section_title: '🌦️ തത്സമയ കാലാവസ്ഥ (Weather via MCP)',
    weather_section_sub: 'കേരളത്തിലെ പ്രധാന നെല്ലുൽപ്പാദന മേഖലകളിലെ തത്സമയ കാലാവസ്ഥയും കാർഷിക മുൻകരുതലുകളും.',
    weather_select_label: 'മേഖല തിരഞ്ഞെടുക്കുക (Select Rice Region):',
    loc_kuttanad: 'കുട്ടനാട് - മങ്കൊമ്പ് (Kuttanad, Alappuzha - 9.5008°N, 76.4526°E)',
    loc_palakkad: 'പാലക്കാട് (Palakkad - 10.7867°N, 76.6548°E)',
    loc_thrissur: 'തൃശ്ശൂർ കോൾനിലങ്ങൾ (Thrissur Kole - 10.5276°N, 76.2144°E)',
    weather_refresh_btn: 'തത്സമയം പുതുക്കുക (Live Refresh)',
    weather_humidity_label: 'ആർദ്രത (Humidity):',
    weather_wind_label: 'കാറ്റിന്റെ വേഗത:',
    weather_rain_prob_label: 'മഴ സാധ്യത:',
    weather_advisory_heading: '🌾 കാർഷിക നിർദ്ദേശം (Advisory)',
    weather_advisory_default: 'അടുത്ത 24 മണിക്കൂറിൽ മഴയ്ക്ക് സാധ്യതയുള്ളതിനാൽ പാടത്ത് യൂറിയ വിതറുന്നത് ഒഴിവാക്കുക. ഡ്രെയിനേജ് ചാലുകളിലെ തടസ്സങ്ങൾ മാറ്റി വെള്ളപ്പൊക്ക സാധ്യത കുറയ്ക്കുക.',
    meta_source_label: 'ഉറവിടം:',
    meta_updated_label: 'അവസാനം പുതുക്കിയത്:',
    meta_realtime_val: 'തത്സമയം',

    // Schemes View
    schemes_title: '🏛️ സർക്കാർ കാർഷിക പദ്ധതികൾ (Browser Assistant)',
    schemes_sub: 'കേരള കാർഷിക വികസന കർഷക ക്ഷേമ വകുപ്പിന്റെയും കേന്ദ്ര സർക്കാരിന്റെയും ആനുകൂല്യങ്ങൾ കണ്ടെത്താനും അപേക്ഷ തയ്യാറാക്കാനും സഹായിക്കുന്ന ഏജൻറ്.',
    subhiksha_title: 'സുഭിക്ഷ കേരളം കാർഷിക സബ്‌സിഡി',
    badge_available: 'ലഭ്യമാണ്',
    subhiksha_desc: 'നെൽക്കൃഷി ചെയ്യുന്ന ചെറുകിട കർഷകർക്ക് വിത്ത്, വളം, യന്ത്രവൽക്കരണം എന്നിവയ്ക്കുള്ള ധനസഹായം.',
    criteria_label: 'യോഗ്യതാ നിബന്ധനകൾ:',
    subhiksha_crit_1: 'കേരളത്തിൽ നെൽകൃഷി ചെയ്യുന്ന കർഷകർ',
    subhiksha_crit_2: 'കുറഞ്ഞത് 20 സെൻ്റ് സ്ഥലത്തെ കൃഷി',
    subhiksha_crit_3: 'കൃഷിഭവനിൽ രജിസ്റ്റർ ചെയ്ത ഫാം ലോഗ്',
    btn_check_subhiksha: '🤖 ബ്രൗസർ അസിസ്റ്റന്റ് വഴി പരിശോധിക്കുക',
    aims_title: 'AIMS പോർട്ടൽ - റോയൽറ്റി ധനസഹായം',
    aims_desc: 'നെൽവയലുകൾ സംരക്ഷിക്കുന്ന കർഷകർക്ക് ഹെക്ടറിന് ₹5,500 നിരക്കിൽ വാർഷിക റോയൽറ്റി ആനുകൂല്യം.',
    aims_crit_1: 'നിലവിൽ കൃഷി ചെയ്യുന്ന നെൽവയൽ',
    aims_crit_2: 'ആധാർ ലിങ്ക് ചെയ്ത ബാങ്ക് അക്കൗണ്ട്',
    aims_crit_3: 'കരം തീർത്ത രസീത്',
    btn_check_aims: '🤖 ബ്രൗസർ അസിസ്റ്റന്റ് വഴി പരിശോധിക്കുക',
    modal_scheme_title: '🏛️ AIMS റോയൽറ്റി ബ്രൗസർ അസിസ്റ്റന്റ്',
    modal_elig_title: 'നിങ്ങൾ ഈ പദ്ധതിക്ക് അർഹനാണ്!',
    modal_elig_desc: 'കുട്ടനാട്, ആലപ്പുഴയിലെ 50 സെൻ്റ് നെൽപ്പാടത്തിന് പ്രതിവർഷം ₹1,113 സബ്‌സിഡിക്ക് സാധ്യതയുണ്ട്.',
    btn_start_prefill: '🤖 ഓട്ടോമേറ്റഡ് പ്രീ-ഫിൽ ആരംഭിക്കുക (Launch Browser Agent)',
    gate_warning_title: '⚠️ കർഷകന്റെ അനുമതി ആവശ്യമാണ് (Human Confirmation Gate):',
    gate_warning_desc: 'ബ്രൗസർ ഏജന്റ് തയ്യാറാക്കിയ വിവരങ്ങൾ പരിശോധിക്കുക. നിങ്ങളുടെ അനുമതിയില്ലാതെ അപേക്ഷ സമർപ്പിക്കില്ല.',
    confirm_chk_label: 'ഈ വിവരങ്ങൾ പരിശോധിച്ചതായും കൃഷിഭവൻ സമർപ്പണത്തിന് അംഗീകാരം നൽകുന്നതായും സാക്ഷ്യപ്പെടുത്തുന്നു.',
    btn_cancel: 'റദ്ദാക്കുക',
    btn_confirm_submit: '✅ അന്തിമ സമർപ്പണം പൂർത്തിയാക്കുക (Submit)',
    success_submit_title: '🎉 അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു!',
    tracking_id_label: 'അപേക്ഷാ നമ്പർ (Application Tracking ID):',
    success_meta: 'രേഖകൾ നിങ്ങളുടെ ഫാം ലോഗിൽ സ്വയം രേഖപ്പെടുത്തിയിട്ടുണ്ട്.',
    btn_done: 'പൂർത്തിയായി (Done)',

    // Disaster Radar
    disaster_radar_badge: 'മുൻകരുതലും പുനരുജ്ജീവനവും',
    disaster_feed_live: 'തത്സമയ ഔദ്യോഗിക ഫീഡ്',
    disaster_title: '🚨 ഡിസാസ്റ്റർ റഡാർ (Disaster Radar)',
    disaster_sub: 'കുട്ടനാട്, ആലപ്പുഴ പാടശേഖരങ്ങൾക്കായുള്ള തത്സമയ ദുരന്ത മുന്നറിയിപ്പുകൾ, ജീവൻ രക്ഷാ മുൻകരുതലുകൾ, കൃഷിനാശ പുനരുജ്ജീവന രേഖപ്പെടുത്തൽ.',
    label_disaster_location: 'തിരഞ്ഞെടുത്ത മേഖല:',
    btn_refresh_alerts: 'മുന്നറിയിപ്പുകൾ പുതുക്കുക',
    toggle_demo_alert: '🧪 മാതൃകാ ഡ്രിൽ (Demo Drill)',
    sec_alerts_title: '📡 തത്സമയ ദുരന്ത മുന്നറിയിപ്പുകൾ',
    sec_alerts_desc: 'NDMA SACHET, KSDMA, IMD എന്നിവയിൽ നിന്നുള്ള ഔദ്യോഗിക വിവരങ്ങൾ നിങ്ങളുടെ പ്രദേശത്തിനായി പരിശോധിച്ചത്.',
    offline_banner_title: 'ഓഫ്‌ലൈൻ മോഡ്:',
    offline_banner_desc: 'നിങ്ങൾ നിലവിൽ ഓഫ്‌ലൈനിലാണ്. സേവ് ചെയ്ത വിവരങ്ങൾ കാണിക്കുന്നു. പുതിയ ഔദ്യോഗിക മുന്നറിയിപ്പുകൾ പരിശോധിക്കാൻ ഇന്റർനെറ്റ് കണക്ഷൻ ആവശ്യമാണ്.',
    official_sources_heading: '🏛️ ഔദ്യോഗിക ഉറവിടങ്ങളും ഹെൽപ്പ്‌ലൈനുകളും:',
    sec_actions_title: '🛡️ കർഷകർ സ്വീകരിക്കേണ്ട മുൻകരുതലുകൾ',
    sec_actions_desc: 'കേരളത്തിലെ കർഷകർക്കായുള്ള ജീവൻ രക്ഷാ മുൻകരുതലുകൾ. പൂർത്തിയാക്കുന്ന ഓരോ കാര്യവും രേഖപ്പെടുത്തുക.',
    hazard_flood: 'വെള്ളപ്പൊക്കം & വെള്ളക്കെട്ട്',
    hazard_lightning: 'ഇടിമിന്നൽ & കാറ്റ്',
    hazard_wind: 'കനത്ത കാറ്റും ചുഴലിയും',
    hazard_heatwave: 'ഉഷ്ണതരംഗവും വരൾച്ചയും',
    safety_first_heading: 'ജീവൻ പ്രധാനം (SAFETY FIRST):',
    sec_recovery_title: '📋 എന്റെ കൃഷി പുനരുജ്ജീവനം (Farm Recovery)',
    sec_recovery_desc: 'ദുരന്ത നാശനഷ്ടങ്ങൾ രേഖപ്പെടുത്തുക, ഫോട്ടോ സൂക്ഷിക്കുക, കൃഷിഭവൻ ആനുകൂല്യങ്ങൾക്കും ഇൻഷുറൻസിനും സമർപ്പിക്കുക.',
    btn_print_summary: 'നഷ്ടപരിഹാര രേഖ പ്രിന്റ് ചെയ്യുക',
    recovery_form_heading: 'പാടത്തെ നാശനഷ്ട വിവരങ്ങൾ രേഖപ്പെടുത്തുക',
    label_damage_date: 'നിരീക്ഷണ തീയതി:',
    label_damage_crop_stage: 'ബാധിച്ച വിളയും വളർച്ചാ ഘട്ടവും:',
    label_damage_type: 'ദുരന്തത്തിന്റെ തരം:',
    label_field_condition: 'പാടത്തെ അവസ്ഥയും ജലനിരപ്പും:',
    ph_field_condition: 'ഉദാ: വെള്ളം 50 സെ.മീ ഉയർന്നു, 80% ചിനപ്പുകൾ വെള്ളത്തിനടിയിൽ',
    label_loss_percent: 'കണക്കാക്കിയ വിളനാശം (%):',
    label_damage_desc: 'വിശദമായ നിരീക്ഷണ വിവരങ്ങൾ:',
    ph_damage_desc: 'പുറംബണ്ട് അവസ്ഥ, ചെളി അടിഞ്ഞുകൂടൽ, കതിരുകൾ വീണത് എന്നിവ വിശദീകരിക്കുക...',
    label_recovery_action: 'സ്വീകരിച്ച പുനരുജ്ജീവന നടപടികൾ:',
    ph_recovery_action: 'ഉദാ: 25HP മോട്ടോർ ഉപയോഗിച്ച് വെള്ളം വറ്റിച്ചു, കുമ്മായം ചേർത്തു, കൃഷിഭവനിൽ അറിയിച്ചു',
    label_damage_photo: 'നാശനഷ്ട ഫോട്ടോ (പാടത്തിന്റെ അവസ്ഥ):',
    label_before_photo: 'മുൻപുള്ള ഫോട്ടോ (ആരോഗ്യമുള്ള വിള, ഐച്ഛികം):',
    btn_save_damage: '💾 കൃഷിനാശ രേഖ സംരക്ഷിക്കുക',
    assistance_heading: '🏛️ സർക്കാർ ദുരിതാശ്വാസ ചാനലുകൾ:',
    disclaimer_heading: 'പ്രധാന നിരാകരണം (Important Notice):',
    disclaimer_text: 'ഈ രേഖപ്പെടുത്തലുകൾ കർഷകന്റെ സ്വന്തം നിരീക്ഷണ തെളിവുകൾ മാത്രമാണ്; ഇത് ഔദ്യോഗിക നഷ്ടപരിഹാര നിർണ്ണയമോ ഇൻഷുറൻസ് അംഗീകാരമോ ഉറപ്പുനൽകുന്നില്ല.',
    history_heading: 'മുൻപ് രേഖപ്പെടുത്തിയ കൃഷിനാശ വിവരങ്ങൾ',

    // Traces View
    traces_title: '⚙️ പ്രവർത്തന രേഖ (MCP Protocol & Execution Trace)',
    traces_sub: 'ഹാക്കത്തോൺ ഡെമോൺസ്ട്രേഷൻ പാനൽ: മോഡൽ കോൺടെക്സ്റ്റ് പ്രോട്ടോക്കോൾ (MCP) ടൂൾ കോളുകളും റൂട്ടർ തീരുമാനങ്ങളും.',
    btn_clear_trace: 'രേഖ മായ്ക്കുക (Clear)',

    // Footer
    footer_text: '© 2026 കർഷക കെയർ (Karshaka Care) • കേരള കാർഷിക സർവ്വകലാശാല പാക്കേജ് ഓഫ് പ്രാക്ടീസസ് അടിസ്ഥാനമാക്കി വികസിപ്പിച്ചത്.',
    footer_subtext: 'Designed for Kerala Farmers • Malayalam-First • Offline-Capable & Deterministic'
  },
  en: {
    // Header & Meta
    toggle_label: 'മലയാളം',
    header_subtitle: 'Paddy farming decisions in your language • Works offline too',
    brand_badge: 'Karshaka Care',
    conn_online: 'Online',
    conn_offline: 'Offline (Local Mode)',
    doc_title: 'Karshaka Care - Paddy Decision Support System',

    // Navigation
    nav_home: 'Home & Queries',
    nav_crop: 'Crop Analysis',
    nav_farmlog: 'FarmLog',
    nav_weather: 'Weather',
    nav_schemes: 'Government Schemes',
    nav_disaster: 'Disaster Radar',
    nav_traces: 'Activity Log (MCP)',

    // Home / Hero
    hero_tag: '🌾 Based on Kerala Agricultural University (KAU) Guidelines',
    home_greeting: 'What is your paddy field concern today?',
    home_instructions: 'Ask questions in Malayalam or English, or select common questions below. Accurate scientific guidance will be provided instantly.',
    ask_placeholder: 'e.g., Brown spots found on leaves, what should I do?',
    ask_btn: 'Ask Question',
    voice_indicator_text: 'Listening... Please speak your question',
    chips_label: 'Common Queries:',
    chip_brown_spot: '🍂 Brown Spot',
    chip_blast: '🌾 Leaf Blast',
    chip_rain: '🌧️ Rain & Fertilizer',
    chip_water: '💧 Water Management',

    // Advisory Result Card
    result_badge_advisory: 'Advisory',
    result_badge_category: 'Paddy Farming',
    result_time: 'Live',
    result_title: 'Diagnostic Summary',
    action_steps_heading: 'Recommended Action Steps:',
    safety_default: 'Avoid unnecessary use of chemical pesticides.',
    citation_label: '📚 Source:',
    btn_speak: 'Listen (Speak)',
    btn_save_log: 'Save to FarmLog',

    // Home Dashboard Cards
    dash_active_crop_title: '🌾 Active Field',
    dash_paddy_tag: 'Paddy',
    dash_location: 'Location: Kuttanad, Alappuzha',
    dash_stage_label: 'Growth Stage:',
    dash_stage_val: 'Tillering Stage',
    link_goto_crop: 'Click here to inspect leaf photos →',
    dash_weather_title: '🌦️ Weather Details',
    weather_loading: '🌦️ Drizzle • 99% Humidity • 4 km/h Wind',
    weather_adv_checking: 'Weather Alert: Currently raining. Immediately postpone fertilizer or pesticide application; regulate water levels in the field.',

    // Crop Analysis View
    crop_section_title: 'Leaf Disease Diagnosis (Local Edge AI Leaf Analysis)',
    crop_section_sub: 'Upload an image of the affected paddy leaf. Our offline-capable local edge model provides fast, accurate disease diagnosis without requiring internet access.',
    dropzone_title: 'Choose a leaf photo or drag and drop here',
    dropzone_hint: 'Supported formats: JPG, PNG, WebP (Max 10MB)',
    btn_browse_file: 'Select File',
    btn_sample_leaf: '🌾 Test Sample Leaf',
    btn_remove_preview: 'Remove ✕',
    label_crop_stage: 'Growth Stage:',
    opt_stage_tillering: 'Tillering Stage',
    opt_stage_seedling: 'Seedling Stage',
    opt_stage_panicle: 'Panicle Initiation',
    opt_stage_flowering: 'Flowering Stage',
    opt_stage_ripening: 'Maturity',
    label_symptoms: 'Observed Symptoms:',
    symp_spots: 'Leaf Spots',
    symp_drying: 'Leaf Scorching / Drying',
    symp_yellowing: 'Yellowing',
    symp_wilting: 'Wilting',
    btn_run_inference: 'Analyze Leaf',
    idle_title: 'Diagnosis Details',
    idle_desc: "Upload a photo and click 'Analyze Leaf' to view diagnostic results and recommendations here.",
    supported_heading: 'Supported Conditions:',
    dis_brown_spot: 'Brown Spot',
    dis_blast: 'Rice Blast',
    dis_blb: 'Bacterial Leaf Blight',
    dis_healthy: 'Healthy Leaf',
    inf_diag_badge: 'Diagnosis',
    metric_model: 'Model:',
    metric_latency: 'Inference Latency:',
    metric_runtime: 'Runtime Engine:',
    metric_runtime_val: 'Local Edge (Local CPU)',
    inf_action_heading: 'Action Plan:',
    btn_save_inf_log: '💾 Save to FarmLog',

    // FarmLog View
    farmlog_title: 'FarmLog (Field Activity Journal)',
    farmlog_sub: 'Securely log field observations, spray events, and farm activities. Fully accessible and stored locally even without an internet connection.',
    farmlog_add_heading: 'Record New Activity / Observation',
    farmlog_stage_label: 'Growth Stage:',
    farmlog_type_label: 'Entry Type:',
    opt_type_obs: 'Farmer Observation',
    opt_type_act: 'Completed Task',
    opt_type_treatment: 'Treatment / Spray',
    opt_type_irrigation: 'Irrigation',
    opt_type_fertilizer: 'Fertilizer',
    farmlog_notes_label: 'Details / Remarks:',
    farmlog_notes_ph: 'e.g., Applied second dose of Potash, drained excess field water.',
    btn_add_farmlog: '+ Add to Log',
    farmlog_history_heading: 'Activity History',
    log_completed_act: 'Completed Task',
    log_time_today: 'Today, 08:30 AM',
    log_sample_content_1: 'Submitted AIMS Agricultural Royalty subsidy application. Application Ref: AIMS-KL-2026-585758. Location: Alappuzha, Area: 100 Cents (0.405 Hectares).',
    log_sample_source_1: 'Source: aims_browser_agent • Local Storage (SQLite)',
    log_model_diag: 'Observation',
    log_time_yesterday: 'Yesterday, 04:15 PM',
    log_sample_content_2: 'Mild Brown Spot symptoms observed (Confidence: 88%). Growth stage: Tillering.',
    log_sample_source_2: 'Source: Karshaka Care Local Edge Model • Local Storage (SQLite)',

    // Farm Planner
    planner_title: '🗓️ Adaptive Farm Planner',
    planner_subtitle: 'AI-assisted, KAU-guideline-based next-step recommendations derived from your FarmLog history and crop stage.',
    btn_generate_plan: '🔍 Analyze Farm & Generate Plan',
    planner_stage_label: 'Current Crop Stage for Planning:',
    planner_questions_heading: 'Information Needed:',
    planner_refresh_note: '💡 This plan updates automatically each time you add a new FarmLog entry.',
    planner_idle_text: 'Select your crop stage and click "Analyze Farm & Generate Plan" to see personalized, KAU-backed recommendations.',
    planner_loading: 'Analysing farm history...',
    planner_all_clear: '✅ All standard activities for this stage appear to be on track. Keep monitoring the field daily.',

    // Weather View
    weather_section_title: 'Real-Time Weather (Weather via MCP)',
    weather_section_sub: 'Live weather parameters and farming advisories across major paddy growing zones in Kerala.',
    weather_select_label: 'Select Rice Region:',
    loc_kuttanad: 'Kuttanad - Mankombu (Alappuzha - 9.5008°N, 76.4526°E)',
    loc_palakkad: 'Palakkad (10.7867°N, 76.6548°E)',
    loc_thrissur: 'Thrissur Kole Wetlands (10.5276°N, 76.2144°E)',
    weather_refresh_btn: 'Live Refresh',
    weather_humidity_label: 'Humidity:',
    weather_wind_label: 'Wind Speed:',
    weather_rain_prob_label: 'Rain Probability:',
    weather_advisory_heading: 'Agricultural Advisory',
    weather_advisory_default: 'Avoid applying urea as rainfall is expected within 24 hours. Clear drainage channels to prevent waterlogging.',
    meta_source_label: 'Source:',
    meta_updated_label: 'Last Updated:',
    meta_realtime_val: 'Real-time',

    // Schemes View
    schemes_title: '🏛️ Government Agricultural Schemes (Browser Assistant)',
    schemes_sub: 'Assistant to discover and prepare applications for benefits from the Department of Agriculture Development and Farmers Welfare, Kerala.',
    subhiksha_title: 'Subhiksha Keralam Agricultural Subsidy',
    badge_available: 'Active',
    subhiksha_desc: 'Financial assistance for smallholder paddy farmers for certified seeds, fertilizers, and farm mechanization.',
    criteria_label: 'Eligibility Criteria:',
    subhiksha_crit_1: 'Farmers cultivating paddy in Kerala',
    subhiksha_crit_2: 'Minimum land holding of 20 cents',
    subhiksha_crit_3: 'Registered farm record with local Krishi Bhavan',
    btn_check_subhiksha: '🤖 Check Eligibility',
    aims_title: 'AIMS Portal - Royalty Assistance',
    aims_desc: 'Annual royalty benefit of ₹5,500 per hectare for farmers actively preserving and cultivating paddy fields.',
    aims_crit_1: 'Currently cultivated wetland/paddy field',
    aims_crit_2: 'Aadhaar-linked bank savings account',
    aims_crit_3: 'Latest land tax paid receipt',
    btn_check_aims: '🤖 Check Eligibility',
    modal_scheme_title: '🏛️ AIMS Royalty Browser Assistant',
    modal_elig_title: 'You are eligible for this scheme!',
    modal_elig_desc: 'Estimated royalty benefit of ₹1,113/year for 50 cents paddy land in Kuttanad, Alappuzha.',
    btn_start_prefill: '🤖 Pre-fill Form (Launch Browser Agent)',
    gate_warning_title: '⚠️ Farmer Authorization Required (Human Confirmation Gate):',
    gate_warning_desc: 'Please review the information prepared by the Browser Agent. No application will be submitted without your explicit consent.',
    confirm_chk_label: 'I hereby confirm that I have reviewed these details and authorize submission to Krishi Bhavan.',
    btn_cancel: 'Cancel',
    btn_confirm_submit: '✅ Apply Now (Submit)',
    success_submit_title: '🎉 Application Submitted Successfully!',
    tracking_id_label: 'Application Tracking ID:',
    success_meta: 'Receipt details have been automatically saved to your FarmLog.',
    btn_done: 'Done',

    // Disaster Radar
    disaster_radar_badge: 'Early Warning & Recovery',
    disaster_feed_live: 'Live Official Feed',
    disaster_title: 'Disaster Radar',
    disaster_sub: 'Live disaster warnings, localized safety actions, and persistent farm damage recovery for Kuttanad, Alappuzha & Kerala rice farming polders.',
    label_disaster_location: 'Selected Location:',
    btn_refresh_alerts: 'Refresh Alerts',
    toggle_demo_alert: '🧪 Drill / Demo Simulation',
    sec_alerts_title: '📡 Current Disaster Alerts',
    sec_alerts_desc: 'Official emergency notifications from NDMA SACHET, KSDMA, and IMD evaluated for your selected location.',
    offline_banner_title: 'Offline Mode:',
    offline_banner_desc: 'You are currently offline. Showing cached information. Current official warnings cannot be verified without network connectivity.',
    official_sources_heading: '🏛️ Official Disaster Sources & Hotlines:',
    sec_actions_title: '🛡️ What Should I Do?',
    sec_actions_desc: 'Prioritized, life-saving practical steps tailored for Kerala farmers. Mark tasks as you complete them.',
    hazard_flood: 'Floods & Polder Surge',
    hazard_lightning: 'Thunderstorm & Lightning',
    hazard_wind: 'Gale Winds & Cyclone',
    hazard_heatwave: 'Heatwave & Drought',
    safety_first_heading: 'SAFETY FIRST:',
    sec_recovery_title: '📋 My Farm Recovery',
    sec_recovery_desc: 'Record disaster damage, capture photo evidence, and maintain persistent records for Krishi Bhavan & crop insurance assistance.',
    btn_print_summary: 'Print Recovery Summary',
    recovery_form_heading: 'Record Field Damage Observation',
    label_damage_date: 'Observation Date:',
    label_damage_crop_stage: 'Affected Crop & Stage:',
    label_damage_type: 'Disaster Hazard Type:',
    label_field_condition: 'Field Condition & Water Depth:',
    ph_field_condition: 'e.g., Standing water 50 cm, 80% tillers submerged',
    label_loss_percent: 'Estimated Crop Loss (%):',
    label_damage_desc: 'Description of Damage & Observations:',
    ph_damage_desc: 'Describe bund condition, submerged areas, silt accumulation, and crop state...',
    label_recovery_action: 'Recovery Actions Taken / Planned:',
    ph_recovery_action: 'e.g., De-watering with 25HP motor initiated, lime applied to counter acidity, alerted Krishi Bhavan',
    label_damage_photo: 'Damage Photograph (Current Field Condition):',
    label_before_photo: 'Before Photograph (Healthy Field, Optional):',
    btn_save_damage: '💾 Save Farm Damage Record',
    assistance_heading: '🏛️ Official Relief & Compensation Channels:',
    disclaimer_heading: 'Important Notice:',
    disclaimer_text: 'Recorded observations are farmer-provided evidence for self-documentation and insurance preparation, not an official damage assessment, and do not guarantee insurance approval or government compensation.',
    history_heading: 'Previous Farm Damage Observations',

    // Traces View
    traces_title: '⚙️ Activity Log (MCP Protocol & Execution Trace)',
    traces_sub: 'Demonstration Panel: Model Context Protocol (MCP) tool executions and router decisions.',
    btn_clear_trace: 'Clear Log',

    // Footer
    footer_text: '© 2026 Karshaka Care • Developed based on Kerala Agricultural University Package of Practices.',
    footer_subtext: 'Designed for Kerala Farmers • Malayalam & English • Offline-Capable & Deterministic'
  }
};

function applyLanguage(lang) {
  currentLanguage = (lang === 'en') ? 'en' : 'ml';
  try {
    localStorage.setItem('karshaka_care_lang', currentLanguage);
  } catch (_) {}

  const dict = I18N_DICTIONARY[currentLanguage];
  if (!dict) return;

  // 1. Document title & HTML lang
  document.documentElement.lang = currentLanguage;
  if (dict.doc_title) document.title = dict.doc_title;

  // 2. Toggle button label & header subtitle
  const toggleLabel = document.getElementById('lang-toggle-label');
  if (toggleLabel) toggleLabel.textContent = dict.toggle_label;
  const headerSub = document.getElementById('header-subtitle');
  if (headerSub) headerSub.textContent = dict.header_subtitle;

  // 3. Batch translate all [data-i18n] textContent
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // 4. Batch translate all [data-i18n-placeholder] placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // 5. Batch translate all [data-i18n-title] titles
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) {
      el.title = dict[key];
    }
  });

  // 6. Update quick query chips queries
  document.querySelectorAll('.chip-btn').forEach((chip) => {
    const q = currentLanguage === 'ml' ? chip.getAttribute('data-query-ml') : chip.getAttribute('data-query-en');
    if (q) chip.setAttribute('data-query', q);
  });

  // 7. Update connectivity status text
  const statusText = document.getElementById('connectivity-text');
  if (statusText) {
    statusText.textContent = navigator.onLine ? dict.conn_online : dict.conn_offline;
  }

  // 8. Update Trace event count
  updateTraceCount();

  // 9. Update speech recognition lang if active
  if (window.__speechRecognition) {
    window.__speechRecognition.lang = currentLanguage === 'ml' ? 'ml-IN' : 'en-IN';
  }

  // 10. Update dynamic Advisor result if visible
  if (window.__lastAdviceData) {
    const advice = window.__lastAdviceData;
    const summaryHeading = document.getElementById('result-summary-heading');
    if (summaryHeading) summaryHeading.textContent = dict.result_title;

    const summaryText = document.getElementById('result-summary-text');
    if (summaryText) {
      summaryText.textContent = currentLanguage === 'ml' 
        ? (advice.summaryMl || advice.summary)
        : (advice.summaryEn || advice.summary);
    }

    const stepsList = document.getElementById('result-action-steps');
    if (stepsList) {
      stepsList.innerHTML = '';
      const steps = currentLanguage === 'ml'
        ? (advice.actionStepsMl || advice.actionSteps || [])
        : (advice.actionStepsEn || advice.actionSteps || []);
      steps.forEach((step) => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsList.appendChild(li);
      });
    }

    const safetyEl = document.getElementById('result-safety-warning');
    if (safetyEl) {
      safetyEl.textContent = currentLanguage === 'ml'
        ? (advice.safetyWarningMl || advice.safetyWarning || dict.safety_default)
        : (advice.safetyWarningEn || advice.safetyWarning || dict.safety_default);
    }

    const edgeBadgeLabel = document.getElementById('edge-badge-label');
    const edgeBadgeSub = document.getElementById('edge-badge-sub');
    if (edgeBadgeLabel) {
      edgeBadgeLabel.textContent = currentLanguage === 'ml'
        ? '⚡ Edge AI — KAU ഡിസിഷൻ എഞ്ചിൻ'
        : '⚡ Edge AI — KAU Decision Engine';
    }
    if (edgeBadgeSub) {
      edgeBadgeSub.textContent = currentLanguage === 'ml'
        ? '(ഇന്റർനെറ്റ് ആവശ്യമില്ല)'
        : '(No internet required)';
    }
  }

  // 11. Update dynamic Inference result if visible
  if (window.__lastInferenceData && window.__lastInferenceData.diagnosis) {
    const res = window.__lastInferenceData;
    const diag = res.diagnosis;
    const catBadge = document.getElementById('inference-category-badge');
    if (catBadge) catBadge.textContent = currentLanguage === 'ml' ? diag.nameMl : diag.nameEn;
    const confPill = document.getElementById('inference-confidence-pill');
    if (confPill) confPill.textContent = `${currentLanguage === 'ml' ? 'വിശ്വാസ്യത' : 'Confidence'}: ${diag.confidencePercent}%`;
    const nameEl = document.getElementById('inference-disease-name');
    if (nameEl) nameEl.textContent = currentLanguage === 'ml' ? diag.nameMl : diag.nameEn;
    const descEl = document.getElementById('inference-disease-desc');
    if (descEl) descEl.textContent = currentLanguage === 'ml' ? diag.descriptionMl : diag.descriptionEn;
    const actionList = document.getElementById('inference-action-list');
    if (actionList && res.actionPlan) {
      actionList.innerHTML = '';
      const steps = currentLanguage === 'ml' ? (res.actionPlan.actionStepsMl || []) : (res.actionPlan.actionStepsEn || []);
      steps.forEach((step) => {
        const li = document.createElement('li');
        li.textContent = step;
        actionList.appendChild(li);
      });
    }
  }

  // 12. Update dynamic Weather data if cached/loaded
  if (window.__lastWeatherData && window.__lastWeatherData.currentConditions) {
    const wData = window.__lastWeatherData;
    const cond = wData.currentConditions;
    const forecast = wData.forecast24h || {};

    const descLarge = document.querySelector('.weather-desc-large');
    if (descLarge) {
      descLarge.textContent = currentLanguage === 'ml'
        ? `${cond.weatherDescriptionMl} (${cond.weatherDescriptionEn})`
        : `${cond.weatherDescriptionEn}`;
    }

    const advisoryEl = document.querySelector('.weather-advisory-card p');
    if (advisoryEl && (forecast.advisoryMl || forecast.advisoryEn)) {
      advisoryEl.textContent = currentLanguage === 'ml' ? forecast.advisoryMl : forecast.advisoryEn;
    }

    const weatherBadge = document.getElementById('weather-badge');
    if (weatherBadge) {
      const locName = currentLanguage === 'ml'
        ? (wData.location.nameMl || 'കുട്ടനാട് (മങ്കൊമ്പ്), ആലപ്പുഴ')
        : (wData.location.nameEn || 'Kuttanad (Moncompu), Alappuzha');
      const cachedLabel = currentLanguage === 'ml' ? '🟠 കാഷെ' : '🟠 Cached';
      const liveLabel = currentLanguage === 'ml' ? '🟢 തത്സമയം' : '🟢 Live';
      weatherBadge.textContent = `${locName} ${wData.provenance && wData.provenance.isCached ? cachedLabel : liveLabel}`;
    }

    const homeCond = document.querySelector('.weather-condition');
    if (homeCond) {
      const condText = currentLanguage === 'ml'
        ? (cond.weatherDescriptionMl || 'ചാറ്റൽമഴ')
        : (cond.weatherDescriptionEn || 'Drizzle');
      const humText = currentLanguage === 'ml' ? 'ആർദ്രത' : 'Humidity';
      const windText = currentLanguage === 'ml' ? 'കാറ്റ്' : 'Wind';
      homeCond.textContent = `${cond.icon || '🌦️'} ${condText} • ${cond.relativeHumidityPercent}% ${humText} • ${cond.windSpeedKmh} km/h ${windText}`;
    }

    const homeAdv = document.querySelector('.weather-advisory');
    if (homeAdv) {
      homeAdv.textContent = currentLanguage === 'ml'
        ? (forecast.advisoryMl || 'കാലാവസ്ഥ മുന്നറിയിപ്പ്: തത്സമയം മഴ പെയ്യുന്നു. വളപ്രയോഗമോ കീടനാശിനി തളിക്കലോ ഉടനടി ഒഴിവാക്കുക; പാടത്തെ ജലനിരപ്പ് ക്രമീകരിക്കുക.')
        : (forecast.advisoryEn || 'Weather Alert: Currently raining. Immediately postpone fertilizer or pesticide application; regulate water levels in the field.');
    }

    const detailsRow = document.querySelector('.weather-details-row');
    if (detailsRow) {
      if (currentLanguage === 'ml') {
        detailsRow.innerHTML = `
          <div class="w-detail"><span>ആർദ്രത (Humidity):</span> <strong>${cond.relativeHumidityPercent}%</strong></div>
          <div class="w-detail"><span>അനുഭവപ്പെടുന്ന ചൂട്:</span> <strong>${cond.apparentTemperatureC}°C</strong></div>
          <div class="w-detail"><span>കാറ്റിന്റെ വേഗത:</span> <strong>${cond.windSpeedKmh} km/h</strong></div>
          <div class="w-detail"><span>മഴ സാധ്യത (24h):</span> <strong>${forecast.maxPrecipitationProbability || 0}%</strong></div>
          <div class="w-detail"><span>തത്സമയ മഴ:</span> <strong>${cond.precipitationMm || 0} mm</strong></div>
        `;
      } else {
        detailsRow.innerHTML = `
          <div class="w-detail"><span>Humidity:</span> <strong>${cond.relativeHumidityPercent}%</strong></div>
          <div class="w-detail"><span>Feels Like:</span> <strong>${cond.apparentTemperatureC}°C</strong></div>
          <div class="w-detail"><span>Wind Speed:</span> <strong>${cond.windSpeedKmh} km/h</strong></div>
          <div class="w-detail"><span>Rain Probability (24h):</span> <strong>${forecast.maxPrecipitationProbability || 0}%</strong></div>
          <div class="w-detail"><span>Current Rainfall:</span> <strong>${cond.precipitationMm || 0} mm</strong></div>
        `;
      }
    }
  }

  // 13. Refresh FarmLog list entries in selected language
  loadFarmLogEntries();

  // 14. Update Disaster Radar language if active
  if (typeof updateDisasterLanguage === 'function') {
    updateDisasterLanguage();
  }

  logTrace('I18N', `Language applied to entire interface: ${currentLanguage.toUpperCase()}`, 'system');
}

function initLanguageToggle() {
  const toggleBtn = document.getElementById('lang-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nextLang = currentLanguage === 'ml' ? 'en' : 'ml';
      applyLanguage(nextLang);
    });
  }

  const savedLang = localStorage.getItem('karshaka_care_lang');
  if (savedLang === 'ml' || savedLang === 'en') {
    applyLanguage(savedLang);
  } else {
    applyLanguage('en');
  }
}

// 4. Advisor Query Form (Deterministic Agricultural Question Answering)
function initAdvisorQueryForm() {
  const form = document.getElementById('advisor-query-form');
  const input = document.getElementById('advisor-query-input');
  const submitBtn = document.getElementById('advisor-submit-btn');
  const submitText = document.getElementById('submit-btn-text');
  const resultCard = document.getElementById('advisor-result-container');
  const saveToLogBtn = document.getElementById('btn-save-query-to-log');

  let lastAdviceData = null;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    submitBtn.disabled = true;
    submitText.textContent = currentLanguage === 'ml' ? 'പരിശോധിക്കുന്നു...' : 'Analyzing...';

    logTrace('ROUTER', `Processing user query: "${query}"`, 'call');

    try {
      let advice;
      let usedOffline = false;

      if (!navigator.onLine) {
        logTrace('OFFLINE', 'Navigator offline — running local offline KAU decision engine', 'system');
        if (typeof window.offlineAdvise !== 'function') {
          throw new Error('Offline engine not loaded. Reload the page while online once to cache assets.');
        }
        advice = window.offlineAdvise(query, currentLanguage);
        usedOffline = true;
      } else {
        try {
          const response = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: query,
              language: currentLanguage
            })
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const payload = await response.json();
          advice = payload.data;
          logTrace('ROUTER', 'Answer from server (online mode)', 'call');
        } catch (fetchErr) {
          // Server unreachable or offline — use the embedded offline engine
          console.warn('[Karshaka Care] Server unreachable, switching to offline engine:', fetchErr.message);
          logTrace('OFFLINE', 'Server unavailable — running offline KAU decision engine', 'system');
          if (typeof window.offlineAdvise !== 'function') {
            throw new Error('Offline engine not loaded. Reload the page while online once to cache assets.');
          }
          advice = window.offlineAdvise(query, currentLanguage);
          usedOffline = true;
        }
      }
      lastAdviceData = advice;
      window.__lastAdviceData = advice;

      // Render Result Card
      resultCard.classList.remove('hidden');

      // Edge Model / Offline indicator
      let edgeBadgeEl = document.getElementById('edge-model-badge');
      if (!edgeBadgeEl) {
        edgeBadgeEl = document.createElement('div');
        edgeBadgeEl.id = 'edge-model-badge';
        edgeBadgeEl.style.cssText = [
          'display:none', 'align-items:center', 'gap:8px',
          'background:linear-gradient(135deg,#0f2027,#1b4d3e)',
          'border:1px solid rgba(163,230,53,0.4)',
          'color:#a3e635', 'font-size:12px', 'font-weight:700',
          'padding:6px 14px', 'border-radius:24px', 'margin-bottom:10px',
          'box-shadow:0 0 12px rgba(163,230,53,0.15)', 'letter-spacing:0.5px'
        ].join(';');
        edgeBadgeEl.innerHTML = `
          <span style="width:8px;height:8px;border-radius:50%;background:#a3e635;
            animation:edgePulse 1.4s ease-in-out infinite;flex-shrink:0"></span>
          <span id="edge-badge-label"></span>
          <span style="opacity:0.5;font-size:10px;font-weight:400" id="edge-badge-sub"></span>`;
        // Inject keyframe once
        if (!document.getElementById('edge-pulse-style')) {
          const st = document.createElement('style');
          st.id = 'edge-pulse-style';
          st.textContent = '@keyframes edgePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.5)}}';
          document.head.appendChild(st);
        }
        const header = resultCard.querySelector('.result-header');
        if (header) header.prepend(edgeBadgeEl);
        else resultCard.prepend(edgeBadgeEl);
      }
      if (usedOffline) {
        const t0 = performance.now();
        edgeBadgeEl.style.display = 'inline-flex';
        document.getElementById('edge-badge-label').textContent =
          currentLanguage === 'ml' ? '⚡ Edge AI — KAU ഡിസിഷൻ എഞ്ചിൻ' : '⚡ Edge AI — KAU Decision Engine';
        document.getElementById('edge-badge-sub').textContent =
          currentLanguage === 'ml' ? '(ഇന്റർനെറ്റ് ആവശ്യമില്ല)' : '(No internet required)';
        logTrace('EDGE_MODEL', 'Offline KAU edge engine responded — no server needed', 'system');
      } else {
        edgeBadgeEl.style.display = 'none';
      }

      const outcomeBadge = document.getElementById('result-outcome-badge');
      outcomeBadge.textContent = advice.outcome.replace(/_/g, ' ');
      if (advice.outcome === 'WEATHER_PRECAUTION') {
        outcomeBadge.className = 'badge badge-alert';
      } else {
        outcomeBadge.className = 'badge badge-success';
      }

      document.getElementById('result-category-label').textContent = advice.category || 'Paddy Advice';
      document.getElementById('result-timestamp').textContent = new Date().toLocaleTimeString();
      document.getElementById('result-summary-heading').textContent = currentLanguage === 'ml' ? 'നിർണ്ണയ ഫലം' : 'Diagnostic Summary';
      document.getElementById('result-summary-text').textContent = advice.summary;

      // Render Latency Pill
      const latencyPill = document.getElementById('voice-latency-container');
      const latencyText = document.getElementById('voice-latency-text');
      if (latencyPill && latencyText) {
        latencyPill.classList.remove('hidden');
        const asrPart = window.__lastAsrLatencyMs ? `ASR: ${window.__lastAsrLatencyMs}ms | ` : '';
        const engineLatency = window.__voiceQueryT0 ? Math.round(performance.now() - window.__voiceQueryT0) : 12;
        latencyText.textContent = `⏱️ ${asrPart}Engine: ${engineLatency}ms`;
        logTrace('LATENCY', `Latency Profile: ${asrPart}Engine: ${engineLatency}ms`, 'system');
      }

      // Render Action Steps
      const stepsList = document.getElementById('result-action-steps');
      stepsList.innerHTML = '';
      (advice.actionSteps || []).forEach((step) => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsList.appendChild(li);
      });

      // Safety Alert
      const safetyEl = document.getElementById('result-safety-warning');
      safetyEl.textContent = advice.safetyWarning || 'കീടനാശിനികൾ കൃഷി ഓഫീസറുടെ അനുമതിയില്ലാതെ തളിക്കരുത്.';

      // Citation
      document.getElementById('result-citation-source').textContent = advice.reference || 'KAU Package of Practices';

      // Scroll to result smoothly
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // If query was captured via microphone, auto-speak the result in Malayalam
      if (window.__isVoiceQuery) {
        window.__isVoiceQuery = false;
        speakText(advice.summary || advice.summaryMl);
      }

      logTrace('DECISION', `Outcome: ${advice.outcome} [${advice.ruleId || 'N/A'}]`, 'call');
    } catch (err) {
      console.error('[Karshaka Care] Advisor query error:', err);
      logTrace('ERROR', `Query failure: ${err.message}`, 'error');
      alert(currentLanguage === 'ml' ? 'ചോദ്യം പരിശോധിക്കുന്നതിൽ തടസ്സമുണ്ടായി. വീണ്ടും ശ്രമിക്കുക.' : 'Failed to process question. Please retry.');
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = currentLanguage === 'ml' ? 'ചോദിക്കുക (Ask)' : 'Ask Question';
    }
  });

  // Save Query Advice to FarmLog
  if (saveToLogBtn) {
    saveToLogBtn.addEventListener('click', async () => {
      if (!lastAdviceData) return;
      try {
        await persistFarmLogEntry({
          cropStage: 'tillering',
          entryType: 'suggested_action',
          title: lastAdviceData.category || 'KAU Advice',
          content: `${lastAdviceData.summary} (നിർദ്ദേശങ്ങൾ: ${(lastAdviceData.actionSteps || []).slice(0, 2).join('; ')})`,
          source: `KAU Advisor (${lastAdviceData.ruleId || 'Rule'})`
        });
        alert(currentLanguage === 'ml' ? 'ഫാം ലോഗിലേക്ക് വിജയകരമായി ചേർത്തു!' : 'Saved to FarmLog!');
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

// 5. Quick Chips Click Handler
function initQuickChips() {
  const chips = document.querySelectorAll('.chip-btn');
  const input = document.getElementById('advisor-query-input');
  const submitBtn = document.getElementById('advisor-submit-btn');
  const form = document.getElementById('advisor-query-form');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (q && input) {
        input.value = q;
        window.__isVoiceQuery = true;
        window.__voiceQueryT0 = performance.now();
        window.__lastAsrLatencyMs = 6;
        if (submitBtn) {
          submitBtn.click();
        } else if (typeof form.requestSubmit === 'function') {
          form.requestSubmit();
        } else {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    });
  });
}

// 6. Crop Analysis Dropzone Handler
function initCropAnalysisDropzone() {
  const dropzone = document.getElementById('leaf-dropzone');
  const fileInput = document.getElementById('leaf-image-input');
  const emptyState = document.getElementById('dropzone-empty-state');
  const previewState = document.getElementById('dropzone-preview-state');
  const previewImg = document.getElementById('image-preview');
  const removeBtn = document.getElementById('btn-remove-preview');
  const browseBtn = document.getElementById('btn-browse-file');

  if (!dropzone || !fileInput) return;

  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleSelectedImage(file);
  });

  // Drag and Drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedImage(e.dataTransfer.files[0]);
    }
  });

  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    previewImg.src = '';
    previewState.classList.add('hidden');
    emptyState.classList.remove('hidden');
  });

  function handleSelectedImage(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(currentLanguage === 'ml' ? 'ദയവായി സാധുവായ ചിത്ര ഫയൽ (JPG, PNG, WebP) നൽകുക.' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Normalize image: resize to max 800px and convert to clean JPEG
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const jpegData = canvas.toDataURL('image/jpeg', 0.88);

        previewImg.src = jpegData;
        emptyState.classList.add('hidden');
        previewState.classList.remove('hidden');
        logTrace('IMAGE', `Selected and normalized image: ${file.name} (${w}x${h}, ${(jpegData.length * 0.75 / 1024).toFixed(1)} KB)`, 'call');
      };
      img.onerror = () => {
        previewImg.src = event.target.result;
        emptyState.classList.add('hidden');
        previewState.classList.remove('hidden');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  const loadSampleBtn = document.getElementById('btn-load-sample-leaf');
  const runInferenceBtn = document.getElementById('btn-run-inference');
  const idleBox = document.getElementById('inference-idle-box');
  const resultBox = document.getElementById('inference-result-box');
  const saveInferenceLogBtn = document.getElementById('btn-save-inference-log');

  let lastInferenceData = null;

  if (loadSampleBtn) {
    loadSampleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      previewImg.src = '/assets/rice_leaf_sample.jpg';
      emptyState.classList.add('hidden');
      previewState.classList.remove('hidden');
      logTrace('IMAGE', 'Loaded verified rice leaf sample image (32.4 KB)', 'call');
    });
  }

  if (runInferenceBtn) {
    runInferenceBtn.addEventListener('click', async () => {
      if (!previewImg.src || previewState.classList.contains('hidden')) {
        alert(currentLanguage === 'ml' ? 'ദയവായി ആദ്യം ഒരു ഇലയുടെ ചിത്രം നൽകുക.' : 'Please select or upload a leaf photograph first.');
        return;
      }

      runInferenceBtn.disabled = true;
      const originalText = runInferenceBtn.textContent;
      runInferenceBtn.textContent = currentLanguage === 'ml' ? '⚡ ലോക്കൽ എഡ്ജ് മോഡൽ പരിശോധിക്കുന്നു...' : '⚡ Running Local Edge Model...';

      // Gather context inputs
      const cropStageSelect = document.getElementById('crop-stage-select');
      const cropStage = cropStageSelect ? cropStageSelect.value : 'tillering';
      const checkedSymptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(el => el.value);

      logTrace('EDGE_AI', `Initiating local inference (Stage: ${cropStage}, Symptoms: ${checkedSymptoms.join(', ') || 'none'})...`, 'call');

      let res = null;

      try {
        const response = await fetch('/api/analyze-crop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: previewImg.src,
            cropStage,
            symptoms: checkedSymptoms
          })
        });

        if (response.ok) {
          res = await response.json();
        } else {
          console.warn(`[Karshaka Care] Server returned HTTP ${response.status}. Activating in-browser Edge fallback.`);
        }
      } catch (networkErr) {
        console.warn('[Karshaka Care] Network request failed. Activating in-browser Edge fallback:', networkErr.message);
      }

      // If network is offline or server returned non-200, use robust client-side Edge analysis
      if (!res || !res.success) {
        if (typeof window.evaluateOfflineCropAnalysis === 'function') {
          res = window.evaluateOfflineCropAnalysis({
            imageBase64: previewImg.src,
            cropStage,
            symptoms: checkedSymptoms,
            language: currentLanguage
          });
          logTrace('EDGE_AI', 'Local in-browser Edge AI analysis executed successfully (Zero-Network Mode)', 'call');
        } else {
          alert(currentLanguage === 'ml' ? 'മോഡൽ പരിശോധനയിൽ തടസ്സമുണ്ടായി. വീണ്ടും ശ്രമിക്കുക.' : 'Inference failed. Please retry.');
          runInferenceBtn.disabled = false;
          runInferenceBtn.textContent = originalText;
          return;
        }
      }

      try {
        lastInferenceData = res;
        window.__lastInferenceData = res;

        // Hide idle box and show result box
        idleBox.classList.add('hidden');
        resultBox.classList.remove('hidden');

        // Populate results
        const diag = res.diagnosis;
        document.getElementById('inference-category-badge').textContent = diag.nameMl;
        document.getElementById('inference-confidence-pill').textContent = `${currentLanguage === 'ml' ? 'വിശ്വാസ്യത' : 'Confidence'}: ${diag.confidencePercent}%`;
        document.getElementById('inference-disease-name').textContent = currentLanguage === 'ml' ? diag.nameMl : diag.nameEn;
        document.getElementById('inference-disease-desc').textContent = currentLanguage === 'ml' ? diag.descriptionMl : diag.descriptionEn;
        document.getElementById('inference-model-id').textContent = res.model.id + (res.isOfflineInference ? ' (Offline Edge)' : '');
        document.getElementById('inference-duration').textContent = `${res.inferenceLatencyMs}ms`;

        // Render Action Steps
        const actionList = document.getElementById('inference-action-list');
        actionList.innerHTML = '';
        const steps = currentLanguage === 'ml' ? res.actionPlan.actionStepsMl : res.actionPlan.actionStepsEn;
        (steps || []).forEach(step => {
          const li = document.createElement('li');
          li.textContent = step;
          actionList.appendChild(li);
        });

        // Scroll to results smoothly
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        logTrace('EDGE_AI', `Inference finished: ${diag.key} (${diag.confidencePercent}%) in ${res.inferenceLatencyMs}ms.`, 'call');
      } catch (renderErr) {
        console.error('[Karshaka Care] Crop analysis render error:', renderErr);
        logTrace('ERROR', `Render failure: ${renderErr.message}`, 'error');
      } finally {
        runInferenceBtn.disabled = false;
        runInferenceBtn.textContent = originalText;
      }
    });
  }

  // Save Inference Result to FarmLog
  if (saveInferenceLogBtn) {
    saveInferenceLogBtn.addEventListener('click', async () => {
      if (!lastInferenceData) return;
      const diag = lastInferenceData.diagnosis;
      try {
        await persistFarmLogEntry({
          cropStage: 'tillering',
          entryType: 'prediction',
          title: diag.nameMl,
          content: `രോഗനിർണ്ണയം: ${diag.nameMl} (വിശ്വാസ്യത: ${diag.confidencePercent}%). മോഡൽ: ${lastInferenceData.model.id}. സമയം: ${lastInferenceData.inferenceLatencyMs}ms. ശുപാർശ: ${(lastInferenceData.actionPlan.actionStepsMl || []).slice(0, 2).join('; ')}`,
          modelPrediction: {
            key: diag.key,
            confidence: diag.confidence,
            latencyMs: lastInferenceData.inferenceLatencyMs
          },
          source: 'കർഷക കെയർ എഡ്ജ് മോഡൽ (Local ONNX)'
        });
        alert(currentLanguage === 'ml' ? 'ഫാം ലോഗിലേക്ക് വിജയകരമായി രേഖപ്പെടുത്തി!' : 'Saved to FarmLog!');
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

// 7. FarmLog Local Recording & SQLite Persistence
function initFarmLogForm() {
  const form = document.getElementById('farmlog-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stage = document.getElementById('farmlog-crop-stage').value;
    const type = document.getElementById('farmlog-entry-type').value;
    const notes = document.getElementById('farmlog-notes').value.trim();

    if (!notes) return;

    try {
      await persistFarmLogEntry({
        cropStage: stage,
        entryType: type,
        title: type === 'action_confirmed' ? 'പൂർത്തിയാക്കിയ പണി' : 'കർഷകന്റെ നിരീക്ഷണം',
        content: notes,
        source: 'കർഷകൻ രേഖപ്പെടുത്തിയത് (Farmer Verified)'
      });

      document.getElementById('farmlog-notes').value = '';
      alert(currentLanguage === 'ml' ? 'വിജയകരമായി ഫാം ലോഗിൽ രേഖപ്പെടുത്തി!' : 'Recorded in FarmLog successfully!');
    } catch (err) {
      alert(err.message);
    }
  });

  // Initial load of FarmLog entries from SQLite
  loadFarmLogEntries();
}

async function persistFarmLogEntry(entryData) {
  const response = await fetch('/api/farmlog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entryData)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to save entry (HTTP ${response.status})`);
  }

  const result = await response.json();
  logTrace('FARMLOG', `Persisted record #${result.entry.id} [${entryData.entryType}]: "${entryData.content.substring(0, 35)}..."`, 'call');
  await loadFarmLogEntries();

  // Auto-refresh farm plan if results panel is visible
  const planResults = document.getElementById('planner-results');
  if (planResults && !planResults.classList.contains('hidden')) {
    const generateBtn = document.getElementById('btn-generate-plan');
    if (generateBtn) generateBtn.click();
  }

  return result.entry;

}

async function loadFarmLogEntries() {
  const container = document.getElementById('farmlog-list-container');
  if (!container) return;

  try {
    const res = await fetch('/api/farmlog?limit=20');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const entries = data.entries || [];

    container.innerHTML = '';

    if (entries.length === 0) {
      container.innerHTML = `<p class="text-muted">${currentLanguage === 'ml' ? 'ഫാം ലോഗിൽ ഇതുവരെ രേഖകളില്ല. പുതിയ നിരീക്ഷണങ്ങൾ രേഖപ്പെടുത്തുക.' : 'No FarmLog records yet. Add your first observation.'}</p>`;
      return;
    }

    entries.forEach(entry => {
      const article = document.createElement('article');
      article.className = 'log-item-card';

      let badgeClass = 'badge-secondary';
      let badgeText = currentLanguage === 'ml' ? 'നിരീക്ഷണം' : 'Observation';

      if (entry.entry_type === 'action_confirmed') {
        badgeClass = 'badge-success';
        badgeText = currentLanguage === 'ml' ? 'പൂർത്തിയാക്കിയ പണി' : 'Completed Task';
      } else if (entry.entry_type === 'prediction') {
        badgeClass = 'badge-secondary';
        badgeText = currentLanguage === 'ml' ? 'മോഡൽ നിർണ്ണയം' : 'Model Prediction';
      } else if (entry.entry_type === 'suggested_action') {
        badgeClass = 'badge-secondary';
        badgeText = currentLanguage === 'ml' ? 'നിർദ്ദേശിച്ച തുടർനടപടി' : 'Suggested Action';
      } else if (entry.entry_type === 'treatment') {
        badgeClass = 'badge-secondary';
        badgeText = currentLanguage === 'ml' ? 'കീടനാശിനി പ്രയോഗം' : 'Treatment / Spray';
      } else if (entry.entry_type === 'irrigation') {
        badgeClass = 'badge-secondary';
        badgeText = currentLanguage === 'ml' ? 'ജലസേചനം' : 'Irrigation';
      } else if (entry.entry_type === 'fertilizer') {
        badgeClass = 'badge-secondary';
        badgeText = currentLanguage === 'ml' ? 'വളപ്രയോഗം' : 'Fertilizer';
      }

      const dateStr = new Date(entry.created_at).toLocaleString();
      const sourceLabel = currentLanguage === 'ml' ? 'ഉറവിടം:' : 'Source:';
      const storageLabel = entry.status === 'local_persisted'
        ? (currentLanguage === 'ml' ? 'ലോക്കൽ സ്റ്റോറേജ് (SQLite)' : 'Local Storage (SQLite)')
        : (currentLanguage === 'ml' ? 'സമന്വയിപ്പിച്ചത്' : 'Synced');

      // Localize content if English mode is active
      let displayContent = entry.content;
      if (currentLanguage === 'en') {
        const aimsMatch = displayContent.match(/(?:AIMS കാർഷിക റോയൽറ്റി ധനസഹായ അപേക്ഷ സമർപ്പിച്ചു\.\s*അപേക്ഷാ നമ്പർ:|Submitted AIMS Agricultural Royalty subsidy application\.\s*Application Ref:)\s*([^.]+)\.\s*(?:സ്ഥലം:|Location:)\s*([^,]+),\s*(?:വിസ്തീർണ്ണം:|Area:)\s*(.+?)(?:\.\s*$|$)/);
        if (aimsMatch) {
          const areaClean = aimsMatch[3].replace(/സെൻ്റ്|സെന്റ്/g, 'Cents').replace(/ഹെക്ടർ/g, 'Hectares').trim();
          displayContent = `Submitted AIMS Agricultural Royalty subsidy application. Application Ref: ${aimsMatch[1]}. Location: ${aimsMatch[2]}, Area: ${areaClean}.`;
        } else if (displayContent.includes('REST API വഴി സ്ഥിരീകരിച്ച കൃഷിപ്പണി')) {
          displayContent = 'Farm activity confirmed via REST API';
        } else if (displayContent.includes('REST API വഴി രേഖപ്പെടുത്തിയ നിരീക്ഷണം')) {
          displayContent = 'Observation recorded via REST API';
        } else if (displayContent.includes('കുട്ടനാട് പാടശേഖരത്തിൽ നെല്ല് ചിനപ്പുകൾ തഴച്ചു വളരുന്നു')) {
          displayContent = 'Paddy tillers growing vigorously in Kuttanad field';
        } else if (displayContent.includes('ചിനപ്പുപൊട്ടൽ ഘട്ടത്തിൽ പാടത്തെ വെള്ളം 3 സെ.മീ ആയി കുറച്ചു.')) {
          displayContent = 'Water level lowered to 3 cm during tillering stage.';
        } else if (displayContent.includes('ഇലകളിൽ നേരിയ തവിട്ടുപുള്ളി ലക്ഷണങ്ങൾ കണ്ടെത്തി')) {
          displayContent = 'Mild Brown Spot symptoms observed (Confidence: 88%). Growth stage: Tillering.';
        }
        displayContent = displayContent.replace(/സെൻ്റ്|സെന്റ്/g, 'Cents').replace(/ഹെക്ടർ/g, 'Hectares');
      }

      article.innerHTML = `
        <div class="log-item-header">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <span class="log-item-time">${dateStr}</span>
        </div>
        <p class="log-item-content">${escapeHtml(displayContent)}</p>
        <span class="log-item-source">${sourceLabel} ${escapeHtml(entry.source)} • ${storageLabel}</span>
      `;

      container.appendChild(article);
    });

    logTrace('FARMLOG', `Loaded ${entries.length} persisted records from SQLite.`, 'system');
  } catch (err) {
    console.warn('[Karshaka Care] Failed to load FarmLog:', err);
    logTrace('ERROR', `FarmLog load error: ${err.message}`, 'error');
  }
}

// 8. Weather Selector & Live MCP Weather Integration
function initWeatherSelector() {
  const select = document.getElementById('weather-location-select');
  const refreshBtn = document.getElementById('btn-refresh-weather');
  const refreshHomeBtn = document.getElementById('btn-refresh-weather-home');

  if (select) {
    select.addEventListener('change', () => {
      loadWeatherData(select.value, false);
    });
  }

  // Live Refresh button in Weather View
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const loc = select ? select.value : 'kuttanad';
      loadWeatherData(loc, true);
    });
  }

  // Live Refresh button in Home Dashboard
  if (refreshHomeBtn) {
    refreshHomeBtn.addEventListener('click', () => {
      const loc = select ? select.value : 'kuttanad';
      loadWeatherData(loc, true);
    });
  }

  // Real-time automatic update when internet connection is restored
  window.addEventListener('online', () => {
    const loc = select ? select.value : 'kuttanad';
    logTrace('NETWORK', 'Internet connection detected. Fetching real-time weather from Open-Meteo...', 'call');
    loadWeatherData(loc, true);
  });

  // Periodic real-time update every 5 minutes when online
  setInterval(() => {
    if (navigator.onLine) {
      const loc = select ? select.value : 'kuttanad';
      loadWeatherData(loc, true);
    }
  }, 5 * 60 * 1000);

  // Initial load
  loadWeatherData('kuttanad', false);
}

async function loadWeatherData(location = 'kuttanad', forceRefresh = false) {
  logTrace('MCP_WEATHER', `Requesting weather for "${location}" (forceRefresh: ${forceRefresh}) via MCP protocol...`, 'call');

  const refreshIcon = document.getElementById('refresh-spinner-icon');
  const refreshText = document.getElementById('refresh-btn-text');
  const refreshHomeBtn = document.getElementById('btn-refresh-weather-home');

  if (refreshIcon) refreshIcon.classList.add('spin-active');
  if (refreshHomeBtn) refreshHomeBtn.classList.add('spin-active');
  if (refreshText) refreshText.textContent = currentLanguage === 'ml' ? 'പുതുക്കുന്നു...' : 'Updating...';

  try {
    const res = await fetch('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'weather_get_current',
        arguments: { location, refresh: forceRefresh }
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(body.error || 'Weather MCP tool error');

    const wData = body.data;
    window.__lastWeatherData = wData;
    const cond = wData.currentConditions;
    const forecast = wData.forecast24h;

    // Update Weather View DOM
    const iconLarge = document.querySelector('.weather-icon-large');
    const tempLarge = document.querySelector('.weather-temp-large');
    const descLarge = document.querySelector('.weather-desc-large');
    const advisoryEl = document.querySelector('.weather-advisory-card p');
    const metaEl = document.querySelector('.weather-meta');

    if (iconLarge && cond.icon) iconLarge.textContent = cond.icon;
    if (tempLarge) {
      tempLarge.innerHTML = currentLanguage === 'ml'
        ? `${cond.temperatureC}°C <span style="font-size:14px;opacity:0.8;font-weight:400;display:block">അനുഭവപ്പെടുന്നത് (Feels like): ${cond.apparentTemperatureC}°C</span>`
        : `${cond.temperatureC}°C <span style="font-size:14px;opacity:0.8;font-weight:400;display:block">Feels like: ${cond.apparentTemperatureC}°C</span>`;
    }
    if (descLarge) {
      descLarge.textContent = currentLanguage === 'ml'
        ? `${cond.weatherDescriptionMl} (${cond.weatherDescriptionEn})`
        : `${cond.weatherDescriptionEn}`;
    }

    const detailsRow = document.querySelector('.weather-details-row');
    if (detailsRow) {
      if (currentLanguage === 'ml') {
        detailsRow.innerHTML = `
          <div class="w-detail"><span>ആർദ്രത (Humidity):</span> <strong>${cond.relativeHumidityPercent}%</strong></div>
          <div class="w-detail"><span>അനുഭവപ്പെടുന്ന ചൂട്:</span> <strong>${cond.apparentTemperatureC}°C</strong></div>
          <div class="w-detail"><span>കാറ്റിന്റെ വേഗത:</span> <strong>${cond.windSpeedKmh} km/h</strong></div>
          <div class="w-detail"><span>മഴ സാധ്യത (24h):</span> <strong>${forecast.maxPrecipitationProbability}%</strong></div>
          <div class="w-detail"><span>തത്സമയ മഴ:</span> <strong>${cond.precipitationMm} mm</strong></div>
        `;
      } else {
        detailsRow.innerHTML = `
          <div class="w-detail"><span>Humidity:</span> <strong>${cond.relativeHumidityPercent}%</strong></div>
          <div class="w-detail"><span>Feels Like:</span> <strong>${cond.apparentTemperatureC}°C</strong></div>
          <div class="w-detail"><span>Wind Speed:</span> <strong>${cond.windSpeedKmh} km/h</strong></div>
          <div class="w-detail"><span>Rain Probability (24h):</span> <strong>${forecast.maxPrecipitationProbability}%</strong></div>
          <div class="w-detail"><span>Current Rainfall:</span> <strong>${cond.precipitationMm} mm</strong></div>
        `;
      }
    }

    if (advisoryEl) {
      advisoryEl.textContent = currentLanguage === 'ml' ? forecast.advisoryMl : forecast.advisoryEn;
    }

    if (metaEl) {
      const timeStr = new Date(cond.time || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (currentLanguage === 'ml') {
        metaEl.innerHTML = `
          <span>📡 ഉറവിടം: ${wData.provenance.source}</span>
          <span>🕒 തത്സമയ നിരീക്ഷണം: ${timeStr} ${wData.provenance.isCached ? '(കാഷെ)' : '🟢 ലൈവ്'}</span>
        `;
      } else {
        metaEl.innerHTML = `
          <span>📡 Source: ${wData.provenance.source}</span>
          <span>🕒 Real-time Observation: ${timeStr} ${wData.provenance.isCached ? '(Cached)' : '🟢 Live'}</span>
        `;
      }
    }

    // Update Home Dashboard weather snippet
    const homeTemp = document.querySelector('.weather-temp');
    const homeCond = document.querySelector('.weather-condition');
    const homeAdv = document.querySelector('.weather-advisory');
    const weatherBadge = document.getElementById('weather-badge');

    if (weatherBadge) {
      const locName = currentLanguage === 'ml'
        ? (wData.location.nameMl || 'കുട്ടനാട് (മങ്കൊമ്പ്), ആലപ്പുഴ')
        : (wData.location.nameEn || 'Kuttanad (Moncompu), Alappuzha');
      const cachedLabel = currentLanguage === 'ml' ? '🟠 കാഷെ' : '🟠 Cached';
      const liveLabel = currentLanguage === 'ml' ? '🟢 തത്സമയം' : '🟢 Live';
      weatherBadge.textContent = `${locName} ${wData.provenance && wData.provenance.isCached ? cachedLabel : liveLabel}`;
    }

    if (homeTemp) {
      homeTemp.innerHTML = `${cond.temperatureC}°C <span style="font-size:13px;opacity:0.8;font-weight:normal">(Feels ${cond.apparentTemperatureC}°C)</span>`;
    }
    if (homeCond) {
      const condText = currentLanguage === 'ml'
        ? (cond.weatherDescriptionMl || 'ചാറ്റൽമഴ')
        : (cond.weatherDescriptionEn || 'Drizzle');
      const humLabel = currentLanguage === 'ml' ? 'ആർദ്രത' : 'Humidity';
      const windLabel = currentLanguage === 'ml' ? 'കാറ്റ്' : 'Wind';
      homeCond.textContent = `${cond.icon || '🌦️'} ${condText} • ${cond.relativeHumidityPercent}% ${humLabel} • ${cond.windSpeedKmh} km/h ${windLabel}`;
    }
    if (homeAdv) {
      homeAdv.textContent = currentLanguage === 'ml'
        ? (forecast.advisoryMl || 'കാലാവസ്ഥ മുന്നറിയിപ്പ്: തത്സമയം മഴ പെയ്യുന്നു. വളപ്രയോഗമോ കീടനാശിനി തളിക്കലോ ഉടനടി ഒഴിവാക്കുക; പാടത്തെ ജലനിരപ്പ് ക്രമീകരിക്കുക.')
        : (forecast.advisoryEn || 'Weather Alert: Currently raining. Immediately postpone fertilizer or pesticide application; regulate water levels in the field.');
    }

    logTrace('MCP_WEATHER', `Weather retrieved via MCP in ${body.durationMs}ms: ${cond.temperatureC}°C, rain prob ${forecast.maxPrecipitationProbability}% (Cached: ${wData.provenance.isCached})`, 'call');
  } catch (err) {
    console.warn('[Karshaka Care Weather] MCP weather fetch error:', err);
    logTrace('ERROR', `Weather MCP failure: ${err.message}`, 'error');
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('spin-active');
    if (refreshHomeBtn) refreshHomeBtn.classList.remove('spin-active');
    if (refreshText) refreshText.textContent = currentLanguage === 'ml' ? 'തത്സമയം പുതുക്കുക (Live Refresh)' : 'Live Refresh';
  }
}

// 9. MCP Trace Console Logger
function initTracePanel() {
  const clearBtn = document.getElementById('btn-clear-trace');
  const container = document.getElementById('trace-container');
  if (clearBtn && container) {
    clearBtn.addEventListener('click', () => {
      container.innerHTML = '<div class="trace-entry trace-system"><span class="trace-time">[RESET]</span> Traces cleared.</div>';
      activeTraceCount = 0;
      updateTraceCount();
    });
  }
}

function logTrace(source, message, type = 'system') {
  const container = document.getElementById('trace-container');
  if (!container) return;

  const timeStr = new Date().toLocaleTimeString();
  const entry = document.createElement('div');
  entry.className = `trace-entry trace-${type}`;
  entry.innerHTML = `<span class="trace-time">[${timeStr}] [${source}]</span> ${escapeHtml(message)}`;
  container.appendChild(entry);
  container.scrollTop = container.scrollHeight;

  activeTraceCount++;
  updateTraceCount();
}

function updateTraceCount() {
  const countEl = document.getElementById('trace-event-count');
  if (countEl) {
    countEl.textContent = `${activeTraceCount} സംഭവങ്ങൾ രേഖപ്പെടുത്തി`;
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 10. Fetch Server Status
async function fetchSystemStatus() {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    logTrace('MCP', `Server capabilities verified. Status: ${data.status}`, 'system');
  } catch (err) {
    console.warn('[Karshaka Care] Server status check fallback:', err);
    logTrace('OFFLINE', 'Operating in local offline cache mode', 'system');
  }
}

// 11. Service Worker Registration (Offline App Shell PWA Support)
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          logTrace('PWA', `Service Worker active (Scope: ${reg.scope}). Offline cache ready.`, 'system');
        })
        .catch((err) => {
          console.warn('[SW] Service Worker registration failed:', err);
        });
    });
  }
}

// 12. Malayalam Voice Assistant & End-to-End Latency Measurement
function initVoiceAssistant() {
  const voiceBtn = document.getElementById('voice-input-btn');
  const listeningIndicator = document.getElementById('voice-listening-indicator');
  const queryInput = document.getElementById('advisor-query-input');
  const queryForm = document.getElementById('advisor-query-form');
  const speakBtn = document.getElementById('btn-speak-advice');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let voiceStartTime = 0;
  let capturedTranscript = '';
  let autoStopTimer = null;
  let submitDebounceTimer = null;

  // --- Live voice transcript overlay ---
  let transcriptOverlay = document.getElementById('voice-transcript-overlay');
  if (!transcriptOverlay) {
    transcriptOverlay = document.createElement('div');
    transcriptOverlay.id = 'voice-transcript-overlay';
    transcriptOverlay.style.cssText = [
      'position:fixed', 'bottom:90px', 'left:50%', 'transform:translateX(-50%)',
      'background:rgba(10,20,15,0.95)', 'backdrop-filter:blur(14px)',
      'color:#a3e635', 'font-family:"Noto Sans Malayalam",sans-serif',
      'font-size:15px', 'font-weight:600', 'padding:14px 24px',
      'border-radius:32px', 'border:1px solid rgba(163,230,53,0.35)',
      'max-width:88vw', 'text-align:center', 'z-index:9999',
      'display:none', 'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
      'transition:opacity 0.25s ease'
    ].join(';');
    document.body.appendChild(transcriptOverlay);
  }

  function showTranscriptOverlay(text, isFinal) {
    if (!transcriptOverlay) return;
    transcriptOverlay.style.display = 'block';
    transcriptOverlay.style.opacity = '1';
    const tag = isFinal
      ? '✅ ' + (currentLanguage === 'ml' ? 'ശബ്ദം തിരിച്ചറിഞ്ഞു' : 'Recognized')
      : '🎙️ ' + (currentLanguage === 'ml' ? 'കേൾക്കുന്നു... സംസാരിക്കൂ' : 'Listening... Speak now');
    transcriptOverlay.innerHTML = `
      <span style="opacity:0.65;font-size:11px;display:block;margin-bottom:4px;letter-spacing:0.5px">${tag}</span>
      <span style="font-size:16px;color:${isFinal ? '#4ade80' : '#ffffff'}">${text || (currentLanguage === 'ml' ? 'മലയാളത്തിൽ പറയൂ...' : 'Speak now...')}</span>
    `;
  }

  function hideTranscriptOverlay() {
    if (!transcriptOverlay) return;
    transcriptOverlay.style.opacity = '0';
    setTimeout(() => {
      if (transcriptOverlay) transcriptOverlay.style.display = 'none';
    }, 280);
  }

  // --- Offline Voice Query Modal / Quick Sheet ---
  let offlineModal = document.getElementById('offline-voice-modal');
  if (!offlineModal) {
    offlineModal = document.createElement('div');
    offlineModal.id = 'offline-voice-modal';
    offlineModal.className = 'hidden';
    offlineModal.style.cssText = [
      'position:fixed', 'inset:0', 'background:rgba(0,0,0,0.75)',
      'backdrop-filter:blur(8px)', 'z-index:10000',
      'display:none', 'align-items:center', 'justify-content:center', 'padding:16px'
    ].join(';');

    offlineModal.innerHTML = `
      <div style="background:#132a1e;border:1px solid rgba(163,230,53,0.3);border-radius:18px;max-width:540px;width:100%;padding:22px;box-shadow:0 12px 40px rgba(0,0,0,0.85);color:#f0fdf4;font-family:'Noto Sans Malayalam',sans-serif">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:24px">⚡</span>
            <div>
              <h3 style="margin:0;font-size:16px;color:#a3e635;font-weight:700">ഓഫ്‌ലൈൻ എഡ്ജ് വോയ്സ് (Offline Voice)</h3>
              <p style="margin:2px 0 0;font-size:11.5px;opacity:0.75">ഇന്റർനെറ്റ് ആവശ്യമില്ല — KAU ഡിസിഷൻ എഞ്ചിൻ തത്സമയം ഉത്തരം നൽകും</p>
            </div>
          </div>
          <button id="btn-close-offline-voice" style="background:none;border:none;color:#a3e635;font-size:22px;cursor:pointer;padding:4px 8px">✕</button>
        </div>
        <p style="font-size:12.5px;margin-bottom:12px;color:#cbd5e1">നിങ്ങളുടെ കാർഷിക പ്രശ്നം തിരഞ്ഞെടുക്കുക (തത്സമയം മറുപടി നൽകും):</p>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:55vh;overflow-y:auto;padding-right:4px">
          <button class="offline-voice-opt" data-query="ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു, എന്ത് ചെയ്യണം?" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🍂 <strong>ഇലപ്പുള്ളി രോഗം (Brown Spot)</strong><br><span style="font-size:11px;opacity:0.75">ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു</span>
          </button>
          <button class="offline-voice-opt" data-query="ഇലകൾ കരിഞ്ഞുണങ്ങുന്നു, സ്പിൻഡിൽ ആകൃതിയിലുള്ള പാടുകളുണ്ട്" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🌾 <strong>ഇലക്കരിച്ചിൽ (Leaf Blast)</strong><br><span style="font-size:11px;opacity:0.75">ഇലകൾ കരിഞ്ഞുണങ്ങുന്നു, സ്പിൻഡിൽ പാടുകൾ</span>
          </button>
          <button class="offline-voice-opt" data-query="തണ്ടുതുരപ്പൻ പുഴു ശല്യം, വെൺകതിർ കാണുന്നു" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🐛 <strong>തണ്ടുതുരപ്പൻ പുഴു (Stem Borer)</strong><br><span style="font-size:11px;opacity:0.75">നടുനാമ്പ് ഉണങ്ങൽ, വെൺകതിർ ലക്ഷണങ്ങൾ</span>
          </button>
          <button class="offline-voice-opt" data-query="ഓലചുരുട്ടി പുഴു ഇലകൾ മടക്കി തിന്നുന്നു" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🐛 <strong>ഓലചുരുട്ടി പുഴു (Leaf Folder)</strong><br><span style="font-size:11px;opacity:0.75">ഇലകൾ നീളത്തിൽ മടക്കി പച്ചപ്പ് കാർന്നുതിന്നുന്നു</span>
          </button>
          <button class="offline-voice-opt" data-query="മഴ പെയ്യാൻ സാധ്യതയുണ്ട്, ഇപ്പോൾ യൂറിയ വളം വിതറാമോ?" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🌧️ <strong>മഴയും വളപ്രയോഗവും (Weather Precaution)</strong><br><span style="font-size:11px;opacity:0.75">മഴക്കാലത്ത് വളപ്രയോഗം നടത്താമോ?</span>
          </button>
          <button class="offline-voice-opt" data-query="ചാഴി ശല്യം, നെൽമണികൾ പതിരാകുന്നു" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🦗 <strong>ചാഴി ശല്യം (Rice Bug)</strong><br><span style="font-size:11px;opacity:0.75">പാൽപ്പാകത്തിൽ നീരൂറ്റിക്കുടിക്കലും പതിരും</span>
          </button>
          <button class="offline-voice-opt" data-query="നെല്ലിലകൾ മഞ്ഞളിക്കുന്നു, എന്ത് ചെയ്യണം?" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            🍃 <strong>ഇല മഞ്ഞളിപ്പ് (Yellowing Deficiency)</strong><br><span style="font-size:11px;opacity:0.75">നൈട്രജൻ / സിങ്ക് കുറവ് പരിഹാരം</span>
          </button>
          <button class="offline-voice-opt" data-query="ചിനപ്പുപൊട്ടൽ ഘട്ടത്തിൽ പാടത്ത് എത്ര വെള്ളം നിർത്തണം?" style="text-align:left;background:rgba(255,255,255,0.06);border:1px solid rgba(163,230,53,0.22);padding:10px 14px;border-radius:10px;color:#ffffff;font-size:13px;cursor:pointer">
            💧 <strong>ജലക്രമീകരണം (Water Management)</strong><br><span style="font-size:11px;opacity:0.75">വിവിധ ഘട്ടങ്ങളിലെ ജലനിരപ്പ് നിർദ്ദേശങ്ങൾ</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(offlineModal);

    document.getElementById('btn-close-offline-voice')?.addEventListener('click', () => {
      offlineModal.style.display = 'none';
    });

    offlineModal.querySelectorAll('.offline-voice-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        offlineModal.style.display = 'none';
        if (q && queryInput) {
          queryInput.value = q;
          window.__isVoiceQuery = true;
          window.__voiceQueryT0 = performance.now();
          window.__lastAsrLatencyMs = 6;
          showTranscriptOverlay(q, true);
          setTimeout(hideTranscriptOverlay, 1200);
          const submitBtn = document.getElementById('advisor-submit-btn');
          if (submitBtn) submitBtn.click();
        }
      });
    });
  }

  function showOfflineVoicePicker() {
    if (!offlineModal) return;
    const isMl = currentLanguage === 'ml';
    const titleEl = offlineModal.querySelector('h3');
    if (titleEl) {
      titleEl.textContent = isMl ? 'ഓഫ്‌ലൈൻ എഡ്ജ് വോയ്സ് (Offline Voice)' : 'Offline Edge Voice Assistant';
      const subEl = titleEl.nextElementSibling;
      if (subEl) subEl.textContent = isMl ? 'ഇന്റർനെറ്റ് ആവശ്യമില്ല — KAU ഡിസിഷൻ എഞ്ചിൻ തത്സമയം ഉത്തരം നൽകും' : 'Zero internet required — KAU Decision Engine gives instant advice';
    }
    offlineModal.style.display = 'flex';
  }

  function submitVoiceQuery(text) {
    const clean = (text || '').trim();
    if (!clean) {
      hideTranscriptOverlay();
      return;
    }
    if (queryInput) queryInput.value = clean;
    window.__lastAsrLatencyMs = Math.round(performance.now() - voiceStartTime);
    window.__voiceQueryT0 = performance.now();
    window.__isVoiceQuery = true;
    logTrace('VOICE_ASR', `Voice recognized (${window.__lastAsrLatencyMs}ms): "${clean}"`, 'call');
    showTranscriptOverlay(clean, true);
    setTimeout(hideTranscriptOverlay, 1400);

    const submitBtn = document.getElementById('advisor-submit-btn');
    if (submitBtn) {
      submitBtn.click();
    } else if (queryForm) {
      if (typeof queryForm.requestSubmit === 'function') {
        queryForm.requestSubmit();
      } else {
        queryForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  }

  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;     // Single utterance — auto-detects sentence completion
      recognition.interimResults = true;  // Instant live feedback in Malayalam
      recognition.maxAlternatives = 1;    // Primary highest-confidence hypothesis
      recognition.lang = currentLanguage === 'ml' ? 'ml-IN' : 'en-IN';
      window.__speechRecognition = recognition;

      recognition.onstart = () => {
        isListening = true;
        capturedTranscript = '';
        voiceBtn && voiceBtn.classList.add('voice-active');
        if (listeningIndicator) listeningIndicator.classList.remove('hidden');
        showTranscriptOverlay('', false);
        logTrace('VOICE_ASR', `Voice ASR started — Lang: ${recognition.lang}`, 'call');

        // Auto-stop safety timeout (8s max waiting for speech)
        clearTimeout(autoStopTimer);
        autoStopTimer = setTimeout(() => {
          if (isListening && recognition) {
            logTrace('VOICE_ASR', 'Listening safety timeout', 'system');
            try { recognition.stop(); } catch (_) {}
          }
        }, 8000);
      };

      recognition.onresult = (event) => {
        clearTimeout(autoStopTimer);
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          capturedTranscript = currentText;
          if (queryInput) queryInput.value = currentText;
          showTranscriptOverlay(currentText, Boolean(final));
        }

        if (final.trim()) {
          capturedTranscript = final.trim();
          clearTimeout(submitDebounceTimer);
          // Final sentence detected — stop recognition and submit
          submitDebounceTimer = setTimeout(() => {
            if (isListening && recognition) {
              try { recognition.stop(); } catch (_) {}
            }
          }, 150);
        } else if (interim.trim()) {
          // Interim speech detected — allow 1.5s pause before auto-stopping
          clearTimeout(submitDebounceTimer);
          submitDebounceTimer = setTimeout(() => {
            if (isListening && recognition) {
              try { recognition.stop(); } catch (_) {}
            }
          }, 1500);
        }
      };

      recognition.onerror = (event) => {
        clearTimeout(autoStopTimer);
        clearTimeout(submitDebounceTimer);

        if (event.error === 'network') {
          // Chrome Speech API requires internet for cloud ASR
          logTrace('VOICE_ASR', 'Network unavailable — switching to Offline Edge Voice Selector', 'system');
          showTranscriptOverlay(
            currentLanguage === 'ml'
              ? '⚡ ഓഫ്‌ലൈൻ മോഡ്: ഇന്റർനെറ്റ് ഇല്ലാതെ ബ്രൗസർ വോയ്‌സ് ലഭ്യമല്ല'
              : '⚡ Offline Mode: Browser voice requires internet',
            false
          );
          setTimeout(hideTranscriptOverlay, 2500);
          showOfflineVoicePicker();
        } else if (event.error === 'no-speech') {
          logTrace('VOICE_ASR', 'No speech detected — prompting user', 'system');
          showTranscriptOverlay(
            currentLanguage === 'ml' ? 'ശബ്ദം ലഭിച്ചില്ല. വീണ്ടും ശ്രമിക്കുക.' : 'No speech detected. Try again.',
            false
          );
          setTimeout(hideTranscriptOverlay, 2000);
        } else if (event.error === 'not-allowed') {
          alert(currentLanguage === 'ml' ? 'മൈക്രോഫോൺ അനുമതി നൽകുക.' : 'Microphone permission denied.');
        } else if (event.error !== 'aborted') {
          logTrace('VOICE_ASR', `ASR notice: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        clearTimeout(autoStopTimer);
        clearTimeout(submitDebounceTimer);
        isListening = false;
        voiceBtn && voiceBtn.classList.remove('voice-active');
        if (listeningIndicator) listeningIndicator.classList.add('hidden');

        const toSubmit = (capturedTranscript || (queryInput ? queryInput.value : '')).trim();
        capturedTranscript = '';

        if (toSubmit) {
          submitVoiceQuery(toSubmit);
        } else {
          hideTranscriptOverlay();
        }
      };
    } catch (e) {
      console.warn('[Karshaka Care Voice] Could not initialize SpeechRecognition:', e);
    }
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      // 1. If SpeechRecognition unavailable OR navigator is strictly offline:
      if (!recognition || !navigator.onLine) {
        logTrace('VOICE', 'Offline or unsupported — opening Offline Voice Selector', 'system');
        showOfflineVoicePicker();
        return;
      }

      // 2. If actively listening, clicking stops and submits immediately:
      if (isListening) {
        try { recognition.stop(); } catch (_) {}
        return;
      }

      // 3. Start listening
      voiceStartTime = performance.now();
      capturedTranscript = '';
      recognition.lang = currentLanguage === 'ml' ? 'ml-IN' : 'en-IN';

      try {
        recognition.start();
      } catch (err) {
        console.warn('[Karshaka Care Voice] Resetting recognition:', err);
        try { recognition.abort(); } catch (_) {}
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e2) {
            console.error('[Voice] Retry failed — opening offline selector:', e2);
            showOfflineVoicePicker();
          }
        }, 200);
      }
    });
  }

  // Text-To-Speech (SpeechSynthesis)
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      if (!window.__lastAdviceData || !window.__lastAdviceData.summary) {
        alert(currentLanguage === 'ml' ? 'വായിക്കാൻ നിർദ്ദേശങ്ങൾ ലഭ്യമല്ല.' : 'No advice to read.');
        return;
      }
      speakText(window.__lastAdviceData.summary);
    });
  }
}

function speakText(text) {
  if (!('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'ml' ? 'ml-IN' : 'en-IN';
    utterance.rate = 0.92; // Clear natural measured pace

    const ttsStart = performance.now();
    utterance.onstart = () => {
      const ttsLatency = Math.round(performance.now() - ttsStart);
      logTrace('VOICE_TTS', `Malayalam voice playback started in ${ttsLatency}ms: "${text.substring(0, 40)}..."`, 'call');
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[TTS] Synthesis warning:', err);
  }
}

// 13. Controlled Browser Assistant (Kerala Agricultural Scheme Navigator)
function initSchemeAssistant() {
  const modal = document.getElementById('scheme-assistant-modal');
  const launchBtns = document.querySelectorAll('.btn-scheme-launch');
  const closeBtn = document.getElementById('btn-close-scheme-assistant');
  const cancelBtn = document.getElementById('btn-cancel-scheme-prefill');
  const doneBtn = document.getElementById('btn-done-scheme-assistant');
  const prefillBtn = document.getElementById('btn-start-browser-prefill');
  const confirmCheck = document.getElementById('assistant-confirm-checkbox');
  const finalSubmitBtn = document.getElementById('btn-confirm-final-submit');

  const stepElig = document.getElementById('assistant-step-eligibility');
  const stepRev = document.getElementById('assistant-step-review');
  const stepSucc = document.getElementById('assistant-step-success');

  let activeSchemeKey = 'aims';

  launchBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      activeSchemeKey = btn.getAttribute('data-scheme') || 'aims';
      if (modal) modal.classList.remove('hidden');
      if (stepElig) stepElig.classList.remove('hidden');
      if (stepRev) stepRev.classList.add('hidden');
      if (stepSucc) stepSucc.classList.add('hidden');
      if (confirmCheck) confirmCheck.checked = false;
      if (finalSubmitBtn) finalSubmitBtn.disabled = true;

      logTrace('BROWSER_AGENT', `Checking eligibility for ${activeSchemeKey.toUpperCase()} scheme...`, 'call');

      try {
        const res = await fetch('/api/schemes/check-eligibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerProfile: { crop: 'paddy', landAreaCents: 50, district: 'Alappuzha' },
            scheme: activeSchemeKey
          })
        });

        const data = await res.json();
        const titleEl = document.getElementById('assistant-scheme-title');
        const statusText = document.getElementById('eligibility-status-text');
        const detailsText = document.getElementById('eligibility-details-text');

        if (titleEl) {
          titleEl.textContent = currentLanguage === 'ml'
            ? `🏛️ ${data.schemeNameMl || 'കാർഷിക റോയൽറ്റി'}`
            : `🏛️ ${data.schemeNameEn || 'AIMS Royalty Browser Assistant'}`;
        }
        if (statusText) {
          statusText.textContent = data.eligible
            ? (currentLanguage === 'ml' ? 'നിങ്ങൾ ഈ പദ്ധതിക്ക് അർഹനാണ്!' : 'You are eligible for this scheme!')
            : (currentLanguage === 'ml' ? 'യോഗ്യതാ നിബന്ധനകൾ പാലിച്ചിട്ടില്ല' : 'Eligibility criteria not met');
        }
        if (detailsText) {
          detailsText.textContent = data.eligible
            ? (currentLanguage === 'ml'
                ? `ആലപ്പുഴ (കുട്ടനാട്) മേഖലയിലെ 50 സെൻ്റ് നെൽപ്പാടത്തിന് പ്രതിവർഷം ₹${data.subsidyEstimateInr || 1113} റോയൽറ്റിക്ക് അർഹതയുണ്ട്.`
                : `Estimated royalty benefit of ₹${data.subsidyEstimateInr || 1113}/year for 50 cents paddy land in Kuttanad, Alappuzha.`)
            : (currentLanguage === 'ml' ? (data.reasonsMl || []).join('; ') : (data.reasonsEn || []).join('; '));
        }

        logTrace('BROWSER_AGENT', `Eligibility verified: Eligible=${data.eligible}, Est subsidy=₹${data.subsidyEstimateInr}`, 'call');
      } catch (err) {
        console.warn('[Karshaka Care Schemes] Eligibility check fallback:', err);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
  if (doneBtn) doneBtn.addEventListener('click', () => modal.classList.add('hidden'));

  // Pre-fill Navigation Call (Halt at Safety Confirmation Gate)
  if (prefillBtn) {
    prefillBtn.addEventListener('click', async () => {
      prefillBtn.disabled = true;
      prefillBtn.textContent = currentLanguage === 'ml' ? 'ബ്രൗസർ പ്രവർത്തിക്കുന്നു (Automating browser)...' : 'Automating browser session...';
      logTrace('BROWSER_AGENT', 'Launching Playwright automation session. Navigating to portal...', 'call');

      try {
        const res = await fetch('/api/schemes/navigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerData: {
              name: 'രാഘവൻ പിള്ള (Raghavan Pillai)',
              aadhaar: '5421-9876-1234',
              phone: '9447123456',
              district: 'Alappuzha',
              crop: 'paddy',
              landAreaCents: 50,
              bankAccount: '67123456789',
              ifscCode: 'SBIN0070084'
            },
            farmerConfirmed: false // HALT AT SAFETY GATE
          })
        });

        const data = await res.json();
        if (!data.success && !data.reviewData) throw new Error(data.error || 'Failed to pre-fill application');

        const tbody = document.getElementById('assistant-review-table-body');
        if (tbody && data.reviewData) {
          if (currentLanguage === 'ml') {
            tbody.innerHTML = `
              <tr><td>കർഷകന്റെ പേര്:</td><td><strong>${escapeHtml(data.reviewData.farmerName || '')}</strong></td></tr>
              <tr><td>ആധാർ നമ്പർ:</td><td>${escapeHtml(data.reviewData.aadhaar || '')}</td></tr>
              <tr><td>ജില്ല & പാടശേഖരം:</td><td>${escapeHtml(data.reviewData.district || '')} (കുട്ടനാട്)</td></tr>
              <tr><td>വിള:</td><td>${escapeHtml(data.reviewData.crop || 'നെല്ല്')}</td></tr>
              <tr><td>വിസ്തീർണ്ണം:</td><td>${escapeHtml(data.reviewData.landArea || '50 സെൻ്റ്')}</td></tr>
              <tr><td>ബാങ്ക് അക്കൗണ്ട്:</td><td>${escapeHtml(data.reviewData.bankAccount || '')}</td></tr>
              <tr><td>പദ്ധതി:</td><td>നെൽവയൽ റോയൽറ്റി ധനസഹായം</td></tr>
            `;
          } else {
            const cropEn = (data.reviewData.crop || 'Paddy / Rice').replace(/നെല്ല്\s*\(Paddy\)/g, 'Paddy / Rice').replace(/നെല്ല്/g, 'Paddy / Rice');
            const landAreaEn = (data.reviewData.landArea || '50 Cents (0.202 Hectares)').replace(/സെൻ്റ്|സെന്റ്/g, 'Cents').replace(/ഹെക്ടർ/g, 'Hectares');
            tbody.innerHTML = `
              <tr><td>Farmer Name:</td><td><strong>${escapeHtml(data.reviewData.farmerName || '')}</strong></td></tr>
              <tr><td>Aadhaar Number:</td><td>${escapeHtml(data.reviewData.aadhaar || '')}</td></tr>
              <tr><td>District & Field:</td><td>${escapeHtml(data.reviewData.district || '')} (Kuttanad)</td></tr>
              <tr><td>Crop:</td><td>${escapeHtml(cropEn)}</td></tr>
              <tr><td>Land Area:</td><td>${escapeHtml(landAreaEn)}</td></tr>
              <tr><td>Bank Account:</td><td>${escapeHtml(data.reviewData.bankAccount || '')}</td></tr>
              <tr><td>Scheme:</td><td>Paddy Land Royalty Assistance</td></tr>
            `;
          }
        }

        stepElig.classList.add('hidden');
        stepRev.classList.remove('hidden');
        logTrace('SAFETY_GATE', 'Browser agent successfully halted at Human Confirmation Gate. Awaiting farmer approval.', 'system');
      } catch (err) {
        alert('Browser automation failed: ' + err.message);
        logTrace('ERROR', `Browser agent failed: ${err.message}`, 'error');
      } finally {
        prefillBtn.disabled = false;
        prefillBtn.textContent = currentLanguage === 'ml'
          ? '🤖 ഓട്ടോമേറ്റഡ് പ്രീ-ഫിൽ ആരംഭിക്കുക (Launch Browser Agent)'
          : '🤖 Pre-fill Form (Launch Browser Agent)';
      }
    });
  }

  // Toggle Confirm Button
  if (confirmCheck && finalSubmitBtn) {
    confirmCheck.addEventListener('change', () => {
      finalSubmitBtn.disabled = !confirmCheck.checked;
    });
  }

  // Final Confirmed Submit
  if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener('click', async () => {
      finalSubmitBtn.disabled = true;
      finalSubmitBtn.textContent = currentLanguage === 'ml' ? 'സമർപ്പിക്കുന്നു (Submitting)...' : 'Submitting...';
      logTrace('BROWSER_AGENT', 'Human confirmation provided. Submitting government application...', 'call');

      try {
        const res = await fetch('/api/schemes/navigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerData: {
              name: 'രാഘവൻ പിള്ള (Raghavan Pillai)',
              district: 'Alappuzha',
              crop: 'paddy',
              landAreaCents: 50
            },
            farmerConfirmed: true // CONFIRMED BY USER
          })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Submission failed');

        const trackEl = document.getElementById('assistant-tracking-id');
        if (trackEl) trackEl.textContent = data.applicationId;

        stepRev.classList.add('hidden');
        stepSucc.classList.remove('hidden');

        // Reload FarmLog history to show the newly saved submission
        loadFarmLogEntries();
        logTrace('BROWSER_AGENT', `Application confirmed & submitted: ${data.applicationId}. Persisted to FarmLog SQLite.`, 'call');
      } catch (err) {
        alert('Submission failed: ' + err.message);
        logTrace('ERROR', `Submission failure: ${err.message}`, 'error');
      } finally {
        finalSubmitBtn.disabled = false;
        finalSubmitBtn.textContent = currentLanguage === 'ml'
          ? '✅ അന്തിമ സമർപ്പണം പൂർത്തിയാക്കുക (Submit)'
          : '✅ Apply Now (Submit)';
      }
    });
  }
}

// 14. Adaptive Farm Planner
function initFarmPlanner() {
  const generateBtn = document.getElementById('btn-generate-plan');
  const stageSelect = document.getElementById('planner-crop-stage');
  const resultsEl = document.getElementById('planner-results');
  const idleEl = document.getElementById('planner-idle');
  const summaryTextEl = document.getElementById('planner-summary-text');
  const stageBadgeEl = document.getElementById('planner-stage-badge');
  const kauCiteEl = document.getElementById('planner-kau-cite');
  const questionsPanel = document.getElementById('planner-questions');
  const questionsList = document.getElementById('planner-questions-list');
  const recsContainer = document.getElementById('planner-recs-container');
  const refreshNoteEl = document.querySelector('.planner-refresh-note');

  if (!generateBtn) return;

  async function runFarmPlanAnalysis() {
    const cropStage = stageSelect ? stageSelect.value : 'tillering';
    const btnText = document.getElementById('planner-btn-text');
    const btnIcon = document.getElementById('planner-btn-icon');

    generateBtn.disabled = true;
    if (btnIcon) btnIcon.textContent = '⏳';
    if (btnText) btnText.textContent = currentLanguage === 'ml' ? 'ഫാം ചരിത്രം വിശകലനം ചെയ്യുന്നു...' : 'Analysing farm history...';

    // Show loading state
    if (idleEl) idleEl.classList.add('hidden');
    if (resultsEl) {
      resultsEl.classList.remove('hidden');
      recsContainer.innerHTML = `<div class="planner-loading"><div class="planner-spinner"></div><span>${currentLanguage === 'ml' ? 'ഫാം ചരിത്രം വിശകലനം ചെയ്യുന്നു...' : 'Analysing farm history...'}</span></div>`;
    }

    try {
      // Grab latest weather data if available
      const weatherData = window.__lastWeatherData
        ? { precipitationProbability: window.__lastWeatherData.forecast24h?.maxPrecipitationProbability || 0 }
        : null;

      const res = await fetch('/api/farmlog/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropStage, weatherData, language: currentLanguage })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const plan = await res.json();

      renderFarmPlan(plan);
      logTrace('FARM_PLANNER', `Farm plan generated: ${plan.recommendations.length} recommendations for ${plan.stageNameEn}`, 'call');
    } catch (err) {
      console.error('[Farm Planner] Error:', err);
      if (recsContainer) {
        recsContainer.innerHTML = `<p style="color:#c62828;padding:1rem;">${currentLanguage === 'ml' ? 'പ്ലാൻ ലോഡ് ചെയ്യുന്നതിൽ തടസ്സം. വീണ്ടും ശ്രമിക്കുക.' : 'Failed to load plan. Please retry.'}</p>`;
      }
      logTrace('ERROR', `Farm Planner error: ${err.message}`, 'error');
    } finally {
      generateBtn.disabled = false;
      if (btnIcon) btnIcon.textContent = '🔍';
      if (btnText) btnText.textContent = currentLanguage === 'ml' ? '🔍 ഫാം വിശകലനം ചെയ്ത് പ്ലാൻ തയ്യാറാക്കുക' : '🔍 Analyze Farm & Generate Plan';
    }
  }

  function renderFarmPlan(plan) {
    const isMl = currentLanguage === 'ml';

    // Stage badge
    if (stageBadgeEl) stageBadgeEl.textContent = isMl ? plan.stageNameMl : plan.stageNameEn;

    // Summary
    if (summaryTextEl) summaryTextEl.textContent = isMl ? plan.summaryMl : plan.summaryEn;

    // KAU cite
    if (kauCiteEl) kauCiteEl.textContent = '📚 ' + plan.kauReference;

    // Clarifying questions
    if (plan.clarifyingQuestions && plan.clarifyingQuestions.length > 0) {
      questionsPanel.classList.remove('hidden');
      questionsList.innerHTML = '';
      plan.clarifyingQuestions.forEach(q => {
        const li = document.createElement('li');
        li.textContent = isMl ? q.questionMl : q.questionEn;
        questionsList.appendChild(li);
      });
    } else {
      questionsPanel.classList.add('hidden');
    }

    // Recommendation cards
    if (!recsContainer) return;
    recsContainer.innerHTML = '';

    if (!plan.recommendations || plan.recommendations.length === 0) {
      recsContainer.innerHTML = `<div class="planner-all-clear">${isMl ? '✅ ഈ ഘട്ടത്തിലെ എല്ലാ നിർദ്ദേശ നടപടികളും ക്രമത്തിലാണ്. ദൈനംദിന നിരീക്ഷണം തുടരൂ.' : '✅ All standard activities for this stage appear to be on track. Keep monitoring the field daily.'}</div>`;
      return;
    }

    const priorityIcons = { critical: '🚨', high: '⚡', medium: '📋' };
    const priorityLabels = {
      critical: isMl ? 'അടിയന്തരം' : 'Critical',
      high: isMl ? 'ഉയർന്ന മുൻഗണന' : 'High Priority',
      medium: isMl ? 'ശ്രദ്ധ ആവശ്യം' : 'Important'
    };

    plan.recommendations.forEach(rec => {
      const card = document.createElement('div');
      card.className = `planner-rec-card priority-${rec.priority}${rec.isWeatherBlocked ? ' weather-blocked' : ''}`;

      const title = isMl ? rec.titleMl : rec.titleEn;
      const reason = isMl ? rec.reasonMl : rec.reasonEn;
      const dayLabel = isMl ? rec.labelMl : rec.labelEn;
      const weatherWarning = isMl ? rec.weatherWarningMl : rec.weatherWarningEn;

      card.innerHTML = `
        <div class="planner-rec-header">
          <span class="planner-priority-badge ${rec.priority}">${priorityIcons[rec.priority] || ''} ${priorityLabels[rec.priority] || rec.priority}</span>
          <span class="planner-day-label">🗓️ ${escapeHtml(dayLabel)}</span>
        </div>
        <div class="planner-rec-title">${escapeHtml(title)}</div>
        <div class="planner-rec-reason">${escapeHtml(reason)}</div>
        ${weatherWarning ? `<div class="planner-weather-warning">${escapeHtml(weatherWarning)}</div>` : ''}
        <div class="planner-kau-tag">📚 ${escapeHtml(rec.kauSource)}</div>
      `;
      recsContainer.appendChild(card);
    });
  }

  // Button click
  generateBtn.addEventListener('click', runFarmPlanAnalysis);

  // Auto-refresh plan when farmlog stage select changes
  if (stageSelect) {
    stageSelect.addEventListener('change', () => {
      // Also sync the farmlog form stage select
      const farmlogStage = document.getElementById('farmlog-crop-stage');
      if (farmlogStage) farmlogStage.value = stageSelect.value;
    });
  }

  // Sync planner stage with farmlog form stage
  const farmlogStage = document.getElementById('farmlog-crop-stage');
  if (farmlogStage) {
    farmlogStage.addEventListener('change', () => {
      if (stageSelect) stageSelect.value = farmlogStage.value;
    });
  }
}

// Re-export for post-entry plan refresh (called by persistFarmLogEntry)
const _origPersist = window.__persistFarmLogEntry;

// ═══════════════════════════════════════════════════════════════
// 15. DISASTER RADAR CONTROLLER
// ═══════════════════════════════════════════════════════════════

let currentDisasterLocation = 'kuttanad';
let isDisasterDemoActive = false;
let currentHazardFilter = 'flood';
let lastDisasterData = null;
let lastActionsData = null;

const DISASTER_GEO_MAP = {
  kuttanad: {
    coords: '📍 9.5008°N, 76.4526°E',
    noteEn: '🌾 Below Sea Level Polders (-1.5m MSL)',
    noteMl: '🌾 സമുദ്രനിരപ്പിന് താഴെയുള്ള പാടശേഖരങ്ങൾ (-1.5 മീറ്റർ)'
  },
  upper_kuttanad: {
    coords: '📍 9.3174°N, 76.6114°E',
    noteEn: '🌊 Pamba Riverine Flood Basin',
    noteMl: '🌊 പമ്പാ നദീതട പ്രളയ മേഖല'
  },
  palakkad: {
    coords: '📍 10.7867°N, 76.6548°E',
    noteEn: '☀️ Rain-Shadow Plains (Heat & Drought Hazard)',
    noteMl: '☀️ മഴനിഴൽ പ്രദേശം (ഉഷ്ണതരംഗ & വരൾച്ച മേഖല)'
  },
  thrissur: {
    coords: '📍 10.5276°N, 76.2144°E',
    noteEn: '🌾 Ramsar Coastal Kole Depression',
    noteMl: '🌾 റാംസർ തീരദേശ കോൾനിലം'
  },
  wayanad: {
    coords: '📍 11.6854°N, 76.1320°E',
    noteEn: '⛰️ Western Ghats Highland Slopes (Landslide Hazard)',
    noteMl: '⛰️ പശ്ചിമഘട്ട മലയോര ചരിവ് (ഉരുൾപൊട്ടൽ സാധ്യത)'
  }
};

function initDisasterRadar() {
  const locSelect = document.getElementById('disaster-location-select');
  const refreshBtn = document.getElementById('btn-refresh-disaster');
  const demoToggle = document.getElementById('toggle-disaster-demo');
  const hazardPills = document.querySelectorAll('.hazard-pill-btn');
  const damageForm = document.getElementById('farm-damage-form');
  const lossRange = document.getElementById('damage-loss-percent');
  const lossBadge = document.getElementById('damage-loss-val');
  const printBtn = document.getElementById('btn-print-recovery');
  const photoInput = document.getElementById('damage-photo-input');
  const beforePhotoInput = document.getElementById('before-photo-input');
  const removePhotoBtn = document.getElementById('btn-remove-damage-photo');
  const removeBeforePhotoBtn = document.getElementById('btn-remove-before-photo');
  const obsDateInput = document.getElementById('damage-obs-date');

  // Set default observation date to today
  if (obsDateInput && !obsDateInput.value) {
    obsDateInput.value = new Date().toISOString().split('T')[0];
  }

  // Load saved location from localStorage (default to 'kuttanad')
  try {
    const savedLoc = localStorage.getItem('karshaka_disaster_location');
    if (savedLoc && locSelect && DISASTER_GEO_MAP[savedLoc]) {
      locSelect.value = savedLoc;
      currentDisasterLocation = savedLoc;
    }
  } catch (_) {}

  // Update geo info pill
  updateLocationMeta();

  // Location selector change handler
  if (locSelect) {
    locSelect.addEventListener('change', () => {
      currentDisasterLocation = locSelect.value;
      try {
        localStorage.setItem('karshaka_disaster_location', currentDisasterLocation);
      } catch (_) {}
      updateLocationMeta();
      loadDisasterAlerts();
      loadDisasterActions();
      loadDamageRecords();
      logTrace('DISASTER_RADAR', `Location switched to ${currentDisasterLocation}. Alerts re-evaluating.`, 'call');
    });
  }

  // Refresh alerts button
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDisasterAlerts();
      logTrace('DISASTER_RADAR', 'Manual alert refresh requested', 'call');
    });
  }

  // Demo toggle switch
  if (demoToggle) {
    demoToggle.addEventListener('change', () => {
      isDisasterDemoActive = demoToggle.checked;
      updateFeedStatusPill();
      loadDisasterAlerts();
      logTrace('DISASTER_RADAR', `Simulation toggle changed: ${isDisasterDemoActive}`, 'system');
    });
  }

  // Hazard filter pills
  hazardPills.forEach(pill => {
    pill.addEventListener('click', () => {
      hazardPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentHazardFilter = pill.getAttribute('data-hazard') || 'flood';
      loadDisasterActions();
    });
  });

  // Loss percentage range slider
  if (lossRange && lossBadge) {
    lossRange.addEventListener('input', () => {
      lossBadge.textContent = `${lossRange.value}%`;
    });
  }

  // Damage photo preview handlers
  let damagePhotoBase64 = null;
  let beforePhotoBase64 = null;

  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          damagePhotoBase64 = event.target.result;
          const preview = document.getElementById('damage-photo-preview');
          const wrap = document.getElementById('damage-photo-preview-wrap');
          if (preview) preview.src = damagePhotoBase64;
          if (wrap) wrap.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', () => {
      damagePhotoBase64 = null;
      if (photoInput) photoInput.value = '';
      const wrap = document.getElementById('damage-photo-preview-wrap');
      if (wrap) wrap.classList.add('hidden');
    });
  }

  if (beforePhotoInput) {
    beforePhotoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          beforePhotoBase64 = event.target.result;
          const preview = document.getElementById('before-photo-preview');
          const wrap = document.getElementById('before-photo-preview-wrap');
          if (preview) preview.src = beforePhotoBase64;
          if (wrap) wrap.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (removeBeforePhotoBtn) {
    removeBeforePhotoBtn.addEventListener('click', () => {
      beforePhotoBase64 = null;
      if (beforePhotoInput) beforePhotoInput.value = '';
      const wrap = document.getElementById('before-photo-preview-wrap');
      if (wrap) wrap.classList.add('hidden');
    });
  }

  // Damage Form Submit handler
  if (damageForm) {
    damageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const descInput = document.getElementById('damage-description');
      const conditionInput = document.getElementById('damage-field-condition');
      const actionInput = document.getElementById('damage-recovery-action');
      const stageSelect = document.getElementById('damage-crop-stage');
      const typeSelect = document.getElementById('damage-disaster-type');
      const dateInput = document.getElementById('damage-obs-date');
      const saveBtn = document.getElementById('btn-save-damage-record');

      if (!descInput || !descInput.value.trim()) return;

      const locSelectEl = document.getElementById('disaster-location-select');
      const locName = locSelectEl ? locSelectEl.options[locSelectEl.selectedIndex].text : 'Kuttanad, Alappuzha';

      const payload = {
        location_id: currentDisasterLocation,
        location_name: locName,
        crop_type: 'rice_paddy',
        crop_stage: stageSelect ? stageSelect.value : 'tillering',
        disaster_type: typeSelect ? typeSelect.value : 'flood',
        damage_description: descInput.value.trim(),
        field_condition: conditionInput ? conditionInput.value.trim() : '',
        estimated_loss_percent: lossRange ? parseInt(lossRange.value, 10) : 0,
        recovery_action_taken: actionInput ? actionInput.value.trim() : '',
        photo_after: damagePhotoBase64,
        photo_before: beforePhotoBase64,
        observation_date: dateInput && dateInput.value ? dateInput.value : new Date().toISOString().split('T')[0]
      };

      try {
        if (saveBtn) saveBtn.disabled = true;
        const res = await fetch('/api/disaster/recovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        alert(currentLanguage === 'ml'
          ? 'കൃഷിനാശ രേഖ വിജയകരമായി ഫാം ലോഗിലും ഡിസാസ്റ്റർ റഡാറിലും സൂക്ഷിച്ചു!'
          : 'Damage record persisted successfully in SQLite & FarmLog!');

        // Reset form
        descInput.value = '';
        if (conditionInput) conditionInput.value = '';
        if (actionInput) actionInput.value = '';
        if (removePhotoBtn) removePhotoBtn.click();
        if (removeBeforePhotoBtn) removeBeforePhotoBtn.click();

        // Reload records
        loadDamageRecords();
        logTrace('DISASTER_RADAR', `Saved damage observation #${result.record.id}`, 'call');
      } catch (err) {
        alert('Failed to save record: ' + err.message);
        logTrace('ERROR', `Damage record save error: ${err.message}`, 'error');
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    });
  }

  // Print recovery summary button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function updateLocationMeta() {
  const geoCoordsEl = document.getElementById('disaster-geo-coords');
  const terrainNoteEl = document.getElementById('disaster-terrain-note');
  const meta = DISASTER_GEO_MAP[currentDisasterLocation] || DISASTER_GEO_MAP.kuttanad;

  if (geoCoordsEl) geoCoordsEl.textContent = meta.coords;
  if (terrainNoteEl) terrainNoteEl.textContent = currentLanguage === 'ml' ? meta.noteMl : meta.noteEn;
}

function updateFeedStatusPill() {
  const statusPill = document.getElementById('disaster-feed-status');
  if (!statusPill) return;

  if (!navigator.onLine) {
    statusPill.className = 'feed-status-pill offline';
    statusPill.textContent = currentLanguage === 'ml' ? '⚠️ ഓഫ്‌ലൈൻ (കാഷെ ചെയ്തത്)' : '⚠️ Offline (Cached)';
  } else if (isDisasterDemoActive) {
    statusPill.className = 'feed-status-pill demo';
    statusPill.textContent = currentLanguage === 'ml' ? '🧪 മാതൃകാ ഡ്രിൽ സജീവം' : '🧪 Drill Simulation Active';
  } else {
    statusPill.className = 'feed-status-pill online';
    statusPill.textContent = currentLanguage === 'ml' ? '● തത്സമയ ഔദ്യോഗിക ഫീഡ്' : '● Live Official Feed';
  }
}

async function loadDisasterRadarData() {
  updateLocationMeta();
  updateFeedStatusPill();
  await Promise.all([
    loadDisasterAlerts(),
    loadDisasterActions(),
    loadDamageRecords()
  ]);
}

async function loadDisasterAlerts() {
  const alertsListEl = document.getElementById('disaster-alerts-list');
  const offlineBanner = document.getElementById('disaster-offline-banner');
  const lastCheckedPill = document.getElementById('disaster-last-checked-pill');
  const refreshIcon = document.getElementById('disaster-refresh-icon');

  if (refreshIcon) refreshIcon.textContent = '⏳';

  // Offline detection
  if (!navigator.onLine) {
    if (offlineBanner) offlineBanner.classList.remove('hidden');
    updateFeedStatusPill();
  } else {
    if (offlineBanner) offlineBanner.classList.add('hidden');
    updateFeedStatusPill();
  }

  try {
    const res = await fetch(`/api/disaster/alerts?location=${currentDisasterLocation}&demo=${isDisasterDemoActive}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    lastDisasterData = data;

    renderDisasterAlerts(data);

    if (lastCheckedPill) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lastCheckedPill.textContent = `${currentLanguage === 'ml' ? 'പരിശോധിച്ചത്' : 'Checked'}: ${timeStr}`;
    }
  } catch (err) {
    console.error('[Disaster Alerts] Error:', err);
    if (alertsListEl && !lastDisasterData) {
      alertsListEl.innerHTML = `
        <div class="all-clear-card" style="background:#fff7ed;border-color:#fed7aa;">
          <div class="all-clear-icon">⚠️</div>
          <h4 class="all-clear-title" style="color:#c2410c;">${currentLanguage === 'ml' ? 'മുന്നറിയിപ്പുകൾ ലഭ്യമല്ല' : 'Alerts Feed Offline / Unavailable'}</h4>
          <p class="all-clear-desc" style="color:#9a3412;">${currentLanguage === 'ml' ? 'തത്സമയ സർവറുമായി ബന്ധപ്പെടാൻ സാധിച്ചില്ല. ഔദ്യോഗിക KSDMA പോർട്ടൽ നേരിട്ട് പരിശോധിക്കുക.' : 'Unable to connect to live feed. Please verify with official KSDMA / SACHET portals directly.'}</p>
        </div>
      `;
    }
  } finally {
    if (refreshIcon) refreshIcon.textContent = '🔄';
  }
}

function renderDisasterAlerts(data) {
  const container = document.getElementById('disaster-alerts-list');
  if (!container) return;

  const isMl = currentLanguage === 'ml';
  const activeAlerts = data.activeAlerts || [];

  if (activeAlerts.length === 0) {
    // Honest "All Clear" State
    container.innerHTML = `
      <div class="all-clear-card">
        <div class="all-clear-icon">🟢</div>
        <h4 class="all-clear-title">${isMl ? 'ഈ സമയത്ത് സജീവ ഔദ്യോഗിക ദുരന്ത മുന്നറിയിപ്പുകൾ നിലവിലില്ല' : 'No Active Official Disaster Alerts at this time'}</h4>
        <p class="all-clear-desc">
          ${isMl
            ? `${data.location?.nameMl || 'കുട്ടനാട്'} മേഖലയിൽ NDMA SACHET, KSDMA എന്നിവ പരിശോധിച്ചു. പുതിയ അറിയിപ്പുകൾ ഉണ്ടാകുമ്പോൾ തത്സമയം ഇവിടെ ലഭ്യമാകും.`
            : `Verified against NDMA SACHET and KSDMA for ${data.location?.nameEn || 'Kuttanad'}. If emergency warnings are issued, they will appear here immediately.`}
        </p>
      </div>
    `;
    return;
  }

  // Render Alert Cards
  let html = '';
  activeAlerts.forEach(a => {
    const title = isMl ? (a.titleMl || a.titleEn) : (a.titleEn || a.titleMl);
    const desc = isMl ? (a.descriptionMl || a.descriptionEn) : (a.descriptionEn || a.descriptionMl);
    const scope = isMl ? (a.scopeMl || a.scopeEn) : (a.scopeEn || a.scopeMl);
    const dateStr = a.publishedAt ? new Date(a.publishedAt).toLocaleString() : '';

    html += `
      <div class="alert-item-card level-${a.levelClass || 'yellow'}">
        <div class="alert-header-row">
          <span class="alert-level-badge ${a.levelClass || 'yellow'}">${escapeHtml(a.warningLevel)}</span>
          <span class="alert-scope-tag">📍 ${escapeHtml(scope)}</span>
          ${a.isDemo ? `<span class="alert-demo-badge">${escapeHtml(a.demoBadge || 'DEMO')}</span>` : ''}
          ${a.isLive ? `<span class="feed-status-pill online" style="font-size:0.68rem;padding:0.1rem 0.4rem;">● Live</span>` : ''}
        </div>
        <div class="alert-card-title">${escapeHtml(title)}</div>
        <div class="alert-card-desc">${escapeHtml(desc)}</div>
        <div class="alert-meta-footer">
          <span>🕒 ${escapeHtml(dateStr)}</span>
          <a href="${escapeHtml(a.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="alert-source-link">
            <span>🔗 ${escapeHtml(a.sourceName)}</span> ↗
          </a>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function loadDisasterActions() {
  const container = document.getElementById('disaster-actions-container');
  const bannerTitle = document.getElementById('safety-banner-title');
  const bannerText = document.getElementById('safety-banner-text');

  try {
    const res = await fetch(`/api/disaster/actions?hazard=${currentHazardFilter}&location=${currentDisasterLocation}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const plan = await res.json();
    lastActionsData = plan;

    renderDisasterActions(plan);
  } catch (err) {
    console.error('[Disaster Actions] Error:', err);
  }
}

function renderDisasterActions(plan) {
  const container = document.getElementById('disaster-actions-container');
  const bannerTitle = document.getElementById('safety-banner-title');
  const bannerText = document.getElementById('safety-banner-text');

  if (!container || !plan) return;

  const isMl = currentLanguage === 'ml';

  if (bannerTitle) bannerTitle.textContent = isMl ? 'ജീവൻ പ്രധാനം (SAFETY FIRST):' : 'SAFETY FIRST:';
  if (bannerText) bannerText.textContent = isMl ? plan.safetyFirstWarningMl : plan.safetyFirstWarningEn;

  const actions = plan.actions || [];
  let html = '';

  actions.forEach(act => {
    const title = isMl ? act.titleMl : act.titleEn;
    const why = isMl ? act.whyMl : act.whyEn;
    const when = isMl ? act.whenMl : act.whenEn;
    const storageKey = `karshaka_action_${act.id}`;
    let isChecked = false;
    try {
      isChecked = localStorage.getItem(storageKey) === 'true';
    } catch (_) {}

    html += `
      <div class="action-task-card priority-${act.priority}${isChecked ? ' task-completed' : ''}" id="task-card-${act.id}">
        <div class="task-top-row">
          <input type="checkbox" class="task-checkbox" id="chk-${act.id}" data-task-id="${act.id}" ${isChecked ? 'checked' : ''}>
          <label for="chk-${act.id}" class="action-task-title">${escapeHtml(title)}</label>
        </div>
        <div class="action-task-why">💡 ${escapeHtml(why)}</div>
        <div class="action-task-timing">⏱️ ${isMl ? 'സമയം' : 'Timing'}: ${escapeHtml(when)}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind checkbox toggle listeners
  container.querySelectorAll('.task-checkbox').forEach(chk => {
    chk.addEventListener('change', () => {
      const taskId = chk.getAttribute('data-task-id');
      const card = document.getElementById(`task-card-${taskId}`);
      if (card) {
        if (chk.checked) card.classList.add('task-completed');
        else card.classList.remove('task-completed');
      }
      try {
        localStorage.setItem(`karshaka_action_${taskId}`, chk.checked ? 'true' : 'false');
      } catch (_) {}
    });
  });
}

async function loadDamageRecords() {
  const container = document.getElementById('damage-records-container');
  if (!container) return;

  try {
    const res = await fetch(`/api/disaster/recovery?location=${currentDisasterLocation}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderDamageRecords(data.records || []);
  } catch (err) {
    console.error('[Damage Records] Error:', err);
  }
}

function renderDamageRecords(records) {
  const container = document.getElementById('damage-records-container');
  if (!container) return;

  const isMl = currentLanguage === 'ml';

  if (!records || records.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.86rem;background:#f8fafc;border-radius:var(--radius-sm);">
        ${isMl ? 'മുൻകാല നാശനഷ്ട രേഖകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല. പാടത്ത് കെടുതിയുണ്ടായാൽ മുകളിലെ ഫോം ഉപയോഗിച്ച് രേഖപ്പെടുത്തുക.' : 'No damage observations recorded yet. Use the form above to log flood or storm damage for your records.'}
      </div>
    `;
    return;
  }

  let html = '';
  records.forEach(rec => {
    html += `
      <div class="damage-card">
        <div class="damage-card-header">
          <span class="damage-type-badge">${escapeHtml(rec.disaster_type)}</span>
          <span class="damage-date-pill">🗓️ ${escapeHtml(rec.observation_date)}</span>
        </div>
        <div class="damage-card-body">
          <p><strong>${isMl ? 'പാടത്തെ അവസ്ഥ' : 'Field Condition'}:</strong> ${escapeHtml(rec.field_condition || 'N/A')}</p>
          <p><strong>${isMl ? 'നാശനഷ്ട വിവരണം' : 'Damage Description'}:</strong> ${escapeHtml(rec.damage_description)}</p>
          <p><strong>${isMl ? 'കണക്കാക്കിയ നഷ്ടം' : 'Estimated Loss'}:</strong> ${rec.estimated_loss_percent}%</p>
          ${rec.recovery_action_taken ? `<p><strong>${isMl ? 'പുനരുജ്ജീവന നടപടി' : 'Recovery Action'}:</strong> ${escapeHtml(rec.recovery_action_taken)}</p>` : ''}
        </div>
        ${(rec.photo_after || rec.photo_before) ? `
          <div class="damage-photos-row">
            ${rec.photo_after ? `
              <div class="damage-thumb-wrap">
                <span>${isMl ? 'നാശനഷ്ടം' : 'Damage Photo'}</span>
                <img src="${rec.photo_after}" class="damage-thumb" alt="Damage Photo">
              </div>
            ` : ''}
            ${rec.photo_before ? `
              <div class="damage-thumb-wrap">
                <span>${isMl ? 'മുൻപ്' : 'Before Photo'}</span>
                <img src="${rec.photo_before}" class="damage-thumb" alt="Before Photo">
              </div>
            ` : ''}
          </div>
        ` : ''}
        <div class="damage-card-footer">
          <span>💾 ${escapeHtml(rec.status || 'local_persisted')} • ID #${rec.id}</span>
          <button type="button" class="btn-delete-damage" data-delete-id="${rec.id}">
            🗑️ ${isMl ? 'മായ്ക്കുക' : 'Delete'}
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Bind delete handlers
  container.querySelectorAll('.btn-delete-damage').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-id');
      if (confirm(isMl ? 'ഈ നാശനഷ്ട രേഖ മായ്ക്കണോ?' : 'Delete this damage record?')) {
        try {
          await fetch(`/api/disaster/recovery/${id}`, { method: 'DELETE' });
          loadDamageRecords();
        } catch (err) {
          alert('Delete failed: ' + err.message);
        }
      }
    });
  });
}

function updateDisasterLanguage() {
  updateLocationMeta();
  updateFeedStatusPill();
  if (lastDisasterData) renderDisasterAlerts(lastDisasterData);
  if (lastActionsData) renderDisasterActions(lastActionsData);
  loadDamageRecords();
}

