// Karshaka Care Client App Controller (Malayalam-First Agricultural Assistant)

let currentLanguage = 'ml'; // Default: Malayalam
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

// 3. Language Toggle (Malayalam <-> English)
function initLanguageToggle() {
  const toggleBtn = document.getElementById('lang-toggle-btn');
  const toggleLabel = document.getElementById('lang-toggle-label');

  const translations = {
    ml: {
      toggleLabel: 'English',
      subtitle: 'നെൽകൃഷി തീരുമാനങ്ങൾ നിങ്ങളുടെ ഭാഷയിൽ • ഓഫ്‌ലൈനിലും ലഭ്യമാണ്',
      greeting: 'എന്താണ് ഇന്ന് നിങ്ങളുടെ പാടത്തെ സംശയം?',
      instructions: 'ചോദ്യങ്ങൾ മലയാളത്തിൽ ചോദിക്കുക, അല്ലെങ്കിൽ താഴെ നൽകിയിട്ടുള്ള സാധാരണ സംശയങ്ങൾ തിരഞ്ഞെടുക്കുക. കൃത്യവും ശാസ്ത്രീയവുമായ മറുപടി തത്സമയം ലഭിക്കും.',
      askPlaceholder: 'ഉദാ: ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു, എന്ത് ചെയ്യണം?',
      askBtn: 'ചോദിക്കുക (Ask)',
      navHome: 'ഹോം & സംശയങ്ങൾ',
      navCrop: 'വിള പരിശോധന',
      navFarmlog: 'ഫാം ലോഗ്',
      navWeather: 'കാലാവസ്ഥ',
      navSchemes: 'സർക്കാർ പദ്ധതികൾ',
      navTraces: 'പ്രവർത്തന രേഖ (MCP)'
    },
    en: {
      toggleLabel: 'മലയാളം',
      subtitle: 'Paddy farming decisions in your language • Works offline too',
      greeting: 'What is your paddy field concern today?',
      instructions: 'Ask your question in Malayalam or English, or select common questions below for instant scientific guidance.',
      askPlaceholder: 'e.g., Brown spots found on leaves, what should I do?',
      askBtn: 'Ask Question',
      navHome: 'Home & Queries',
      navCrop: 'Crop Analysis',
      navFarmlog: 'FarmLog',
      navWeather: 'Weather',
      navSchemes: 'Schemes',
      navTraces: 'MCP Traces'
    }
  };

  toggleBtn.addEventListener('click', () => {
    currentLanguage = currentLanguage === 'ml' ? 'en' : 'ml';
    const t = translations[currentLanguage];

    toggleLabel.textContent = t.toggleLabel;
    document.getElementById('header-subtitle').textContent = t.subtitle;
    document.getElementById('home-greeting').textContent = t.greeting;
    document.getElementById('home-instructions').textContent = t.instructions;
    document.getElementById('advisor-query-input').placeholder = t.askPlaceholder;
    document.getElementById('submit-btn-text').textContent = t.askBtn;

    document.querySelector('[data-i18n="nav_home"]').textContent = t.navHome;
    document.querySelector('[data-i18n="nav_crop"]').textContent = t.navCrop;
    document.querySelector('[data-i18n="nav_farmlog"]').textContent = t.navFarmlog;
    document.querySelector('[data-i18n="nav_weather"]').textContent = t.navWeather;
    document.querySelector('[data-i18n="nav_schemes"]').textContent = t.navSchemes;
    document.querySelector('[data-i18n="nav_traces"]').textContent = t.navTraces;

    logTrace('I18N', `Language toggled to: ${currentLanguage.toUpperCase()}`, 'system');
  });
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
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          language: currentLanguage
        })
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const payload = await response.json();
      const advice = payload.data;
      lastAdviceData = advice;
      window.__lastAdviceData = advice;

      // Render Result Card
      resultCard.classList.remove('hidden');

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
  const form = document.getElementById('advisor-query-form');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (q && input) {
        input.value = q;
        form.dispatchEvent(new Event('submit', { cancelable: true }));
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
      alert(currentLanguage === 'ml' ? 'ദയവായി സാധുവായ ചിത്ര ഫയൽ (JPG, PNG) നൽകുക.' : 'Please select a valid image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      previewImg.src = event.target.result;
      emptyState.classList.add('hidden');
      previewState.classList.remove('hidden');
      logTrace('IMAGE', `Selected image for inference: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'call');
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

      logTrace('EDGE_AI', 'Initiating local ONNX model inference (MobileNetV2)...', 'call');

      try {
        const response = await fetch('/api/analyze-crop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: previewImg.src
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `HTTP ${response.status}`);
        }

        const res = await response.json();
        lastInferenceData = res;

        // Hide idle box and show result box
        idleBox.classList.add('hidden');
        resultBox.classList.remove('hidden');

        // Populate results
        const diag = res.diagnosis;
        document.getElementById('inference-category-badge').textContent = diag.nameMl;
        document.getElementById('inference-confidence-pill').textContent = `${currentLanguage === 'ml' ? 'വിശ്വാസ്യത' : 'Confidence'}: ${diag.confidencePercent}%`;
        document.getElementById('inference-disease-name').textContent = currentLanguage === 'ml' ? diag.nameMl : diag.nameEn;
        document.getElementById('inference-disease-desc').textContent = currentLanguage === 'ml' ? diag.descriptionMl : diag.descriptionEn;
        document.getElementById('inference-model-id').textContent = res.model.id;
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

        // Scroll to results
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        logTrace('EDGE_AI', `Inference finished: ${diag.key} (${diag.confidencePercent}%) in ${res.inferenceLatencyMs}ms. Uncertainty: ${res.uncertainty.status}`, 'call');
      } catch (err) {
        console.error('[Karshaka Care] Crop analysis error:', err);
        logTrace('ERROR', `Inference failure: ${err.message}`, 'error');
        alert(currentLanguage === 'ml' ? `പരിശോധന പരാജയപ്പെട്ടു: ${err.message}` : `Inference failed: ${err.message}`);
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
      let badgeText = 'നിരീക്ഷണം';

      if (entry.entry_type === 'action_confirmed') {
        badgeClass = 'badge-success';
        badgeText = 'പൂർത്തിയാക്കിയ പണി';
      } else if (entry.entry_type === 'prediction') {
        badgeClass = 'badge-secondary';
        badgeText = 'മോഡൽ നിർണ്ണയം';
      } else if (entry.entry_type === 'suggested_action') {
        badgeClass = 'badge-secondary';
        badgeText = 'നിർദ്ദേശിച്ച തുടർനടപടി';
      }

      const dateStr = new Date(entry.created_at).toLocaleString();

      article.innerHTML = `
        <div class="log-item-header">
          <span class="badge ${badgeClass}">${badgeText}</span>
          <span class="log-item-time">${dateStr}</span>
        </div>
        <p class="log-item-content">${escapeHtml(entry.content)}</p>
        <span class="log-item-source">ഉറവിടം: ${escapeHtml(entry.source)} • ${entry.status === 'local_persisted' ? 'ലോക്കൽ സ്റ്റോറേജ് (SQLite)' : 'സമന്വയിപ്പിച്ചത്'}</span>
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
  if (!select) return;

  select.addEventListener('change', () => {
    const loc = select.value;
    loadWeatherData(loc);
  });

  // Initial load
  loadWeatherData('kuttanad');
}

async function loadWeatherData(location = 'kuttanad') {
  logTrace('MCP_WEATHER', `Requesting weather for "${location}" via MCP protocol...`, 'call');

  try {
    const res = await fetch('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'weather_get_current',
        arguments: { location }
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    if (!body.success) throw new Error(body.error || 'Weather MCP tool error');

    const wData = body.data;
    const cond = wData.currentConditions;
    const forecast = wData.forecast24h;

    // Update Weather View DOM
    const tempLarge = document.querySelector('.weather-temp-large');
    const descLarge = document.querySelector('.weather-desc-large');
    const advisoryEl = document.querySelector('.weather-advisory-card p');

    if (tempLarge) tempLarge.textContent = `${cond.temperatureC}°C`;
    if (descLarge) {
      descLarge.textContent = cond.isRainingNow ? 'മഴ പെയ്യുന്നു (Active Rain)' : 'മേഘാവൃതം (Partly Cloudy)';
    }

    const detailsRow = document.querySelector('.weather-details-row');
    if (detailsRow) {
      detailsRow.innerHTML = `
        <div class="w-detail"><span>ആർദ്രത (Humidity):</span> <strong>${cond.relativeHumidityPercent}%</strong></div>
        <div class="w-detail"><span>കാറ്റ്:</span> <strong>${cond.windSpeedKmh} km/h</strong></div>
        <div class="w-detail"><span>മഴ സാധ്യത:</span> <strong>${forecast.maxPrecipitationProbability}%</strong></div>
      `;
    }

    if (advisoryEl) {
      advisoryEl.textContent = currentLanguage === 'ml' ? forecast.advisoryMl : forecast.advisoryEn;
    }

    // Update Home Dashboard weather snippet
    const homeTemp = document.querySelector('.weather-temp');
    const homeCond = document.querySelector('.weather-condition');
    const homeAdv = document.querySelector('.weather-advisory');

    if (homeTemp) homeTemp.textContent = `${cond.temperatureC}°C`;
    if (homeCond) homeCond.textContent = `${cond.isRainingNow ? 'മഴ' : 'മേഘാവൃതം'} • ${cond.relativeHumidityPercent}% ആർദ്രത`;
    if (homeAdv) homeAdv.textContent = currentLanguage === 'ml' ? forecast.advisoryMl : forecast.advisoryEn;

    logTrace('MCP_WEATHER', `Weather retrieved via MCP in ${body.durationMs}ms: ${cond.temperatureC}°C, rain prob ${forecast.maxPrecipitationProbability}% (Cached: ${wData.provenance.isCached})`, 'call');
  } catch (err) {
    console.warn('[Karshaka Care Weather] MCP weather fetch error:', err);
    logTrace('ERROR', `Weather MCP failure: ${err.message}`, 'error');
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

  if (SpeechRecognition) {
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        isListening = true;
        if (listeningIndicator) listeningIndicator.classList.remove('hidden');
        logTrace('VOICE_ASR', `Listening for Malayalam voice input (Lang: ${currentLanguage === 'ml' ? 'ml-IN' : 'en-IN'})...`, 'call');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const asrDurationMs = Math.round(performance.now() - voiceStartTime);
        window.__lastAsrLatencyMs = asrDurationMs;
        window.__voiceQueryT0 = performance.now();
        window.__isVoiceQuery = true;

        if (queryInput) {
          queryInput.value = transcript;
          queryInput.dispatchEvent(new Event('input', { bubbles: true }));
          queryInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        logTrace('VOICE_ASR', `Speech recognized in ${asrDurationMs}ms: "${transcript}"`, 'call');

        // Automatically submit voice query for natural conversational flow
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
      };

      recognition.onerror = (event) => {
        console.warn('[Karshaka Care Voice] Speech recognition event error:', event.error);
        logTrace('VOICE_ASR', `Speech recognition notice: ${event.error}`, 'error');
      };

      recognition.onend = () => {
        isListening = false;
        if (listeningIndicator) listeningIndicator.classList.add('hidden');
      };
    } catch (e) {
      console.warn('[Karshaka Care Voice] Could not initialize SpeechRecognition:', e);
    }
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (!recognition) {
        alert(currentLanguage === 'ml' 
          ? 'ഈ ബ്രൗസറിൽ മലയാളം വോയ്‌സ് റെക്കഗ്നിഷൻ ലഭ്യമല്ല. ടൈപ്പ് ചെയ്ത് ചോദിക്കുക.'
          : 'Speech recognition not supported in this browser. Please type your query.');
        logTrace('VOICE', 'SpeechRecognition API unavailable in current browser', 'system');
        return;
      }

      if (isListening) {
        recognition.stop();
      } else {
        voiceStartTime = performance.now();
        recognition.lang = currentLanguage === 'ml' ? 'ml-IN' : 'en-IN';
        try {
          recognition.start();
        } catch (err) {
          console.warn('[Karshaka Care Voice] Start error:', err);
        }
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
    alert(currentLanguage === 'ml' ? 'ഈ ബ്രൗസറിൽ വോയ്‌സ് ഔട്ട്പുട്ട് ലഭ്യമല്ല.' : 'Speech synthesis not supported.');
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLanguage === 'ml' ? 'ml-IN' : 'en-IN';
  utterance.rate = 0.95; // Clear natural speed

  const ttsStart = performance.now();
  utterance.onstart = () => {
    const ttsLatency = Math.round(performance.now() - ttsStart);
    logTrace('VOICE_TTS', `Malayalam voice playback started in ${ttsLatency}ms: "${text.substring(0, 40)}..."`, 'call');
  };

  window.speechSynthesis.speak(utterance);
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

        if (titleEl) titleEl.textContent = `🏛️ ${data.schemeNameMl || 'കാർഷിക റോയൽറ്റി'}`;
        if (statusText) statusText.textContent = data.eligible ? 'നിങ്ങൾ ഈ പദ്ധതിക്ക് അർഹനാണ്!' : 'യോഗ്യതാ നിബന്ധനകൾ പാലിച്ചിട്ടില്ല';
        if (detailsText) {
          detailsText.textContent = data.eligible
            ? `ആലപ്പുഴ (കുട്ടനാട്) മേഖലയിലെ 50 സെൻ്റ് നെൽപ്പാടത്തിന് പ്രതിവർഷം ₹${data.subsidyEstimateInr || 1113} റോയൽറ്റിക്ക് അർഹതയുണ്ട്.`
            : (data.reasonsMl || []).join('; ');
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
      prefillBtn.textContent = 'ബ്രൗസർ പ്രവർത്തിക്കുന്നു (Automating browser)...';
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
          tbody.innerHTML = `
            <tr><td>കർഷകന്റെ പേര്:</td><td><strong>${escapeHtml(data.reviewData.farmerName || '')}</strong></td></tr>
            <tr><td>ആധാർ നമ്പർ:</td><td>${escapeHtml(data.reviewData.aadhaar || '')}</td></tr>
            <tr><td>ജില്ല & പാടശേഖരം:</td><td>${escapeHtml(data.reviewData.district || '')} (കുട്ടനാട്)</td></tr>
            <tr><td>വിള:</td><td>${escapeHtml(data.reviewData.crop || 'നെല്ല്')}</td></tr>
            <tr><td>വിസ്തീർണ്ണം:</td><td>${escapeHtml(data.reviewData.landArea || '50 സെൻ്റ്')}</td></tr>
            <tr><td>ബാങ്ക് അക്കൗണ്ട്:</td><td>${escapeHtml(data.reviewData.bankAccount || '')}</td></tr>
            <tr><td>പദ്ധതി:</td><td>നെൽവയൽ റോയൽറ്റി ധനസഹായം</td></tr>
          `;
        }

        stepElig.classList.add('hidden');
        stepRev.classList.remove('hidden');
        logTrace('SAFETY_GATE', 'Browser agent successfully halted at Human Confirmation Gate. Awaiting farmer approval.', 'system');
      } catch (err) {
        alert('Browser automation failed: ' + err.message);
        logTrace('ERROR', `Browser agent failed: ${err.message}`, 'error');
      } finally {
        prefillBtn.disabled = false;
        prefillBtn.textContent = '🤖 ഓട്ടോമേറ്റഡ് പ്രീ-ഫിൽ ആരംഭിക്കുക (Launch Browser Agent)';
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
      finalSubmitBtn.textContent = 'സമർപ്പിക്കുന്നു (Submitting)...';
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
        finalSubmitBtn.textContent = '✅ അന്തിമ സമർപ്പണം പൂർത്തിയാക്കുക (Submit)';
      }
    });
  }
}


