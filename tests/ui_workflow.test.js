import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import app from '../src/server.js';
import { CONFIG } from '../src/config.js';
import { adviseQuestion, ADVISOR_RULES } from '../src/decision-engine/text-advisor.js';

test('Workflow: Advisor rules cover core rice issues', () => {
  assert.ok(ADVISOR_RULES.length >= 4, 'Must have at least 4 core KAU rules');
  const brownSpotRule = ADVISOR_RULES.find(r => r.id === 'RULE_BROWN_SPOT');
  assert.ok(brownSpotRule);
  assert.equal(brownSpotRule.outcome, 'FOLLOW_VERIFIED_GUIDANCE');
  assert.ok(brownSpotRule.reference.includes('KAU Package of Practices'));
});

test('Workflow: Malayalam Brown Spot query evaluates safely', () => {
  const result = adviseQuestion({
    question: 'ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു, എന്ത് ചെയ്യണം?',
    language: 'ml'
  });

  assert.equal(result.success, true);
  assert.equal(result.ruleId, 'RULE_BROWN_SPOT');
  assert.equal(result.outcome, 'FOLLOW_VERIFIED_GUIDANCE');
  assert.ok(result.summaryMl.includes('ഇലപ്പുള്ളി'));
  assert.ok(result.actionStepsMl.length >= 3);
  assert.ok(result.safetyWarningMl.includes('കീടനാശിനികൾ'));
});

test('Workflow: Adverse Weather query triggers WEATHER_PRECAUTION', () => {
  const result = adviseQuestion({
    question: 'മഴ പെയ്യാൻ സാധ്യതയുണ്ട്, ഇപ്പോൾ യൂറിയ വളം വിതറാമോ?',
    language: 'ml'
  });

  assert.equal(result.success, true);
  assert.equal(result.ruleId, 'RULE_FERTILIZER_RAIN');
  assert.equal(result.outcome, 'WEATHER_PRECAUTION');
  assert.ok(result.actionStepsMl.some(s => s.includes('വളങ്ങൾ ഒലിച്ചുപോയി') || s.includes('മഴ')));
});

test('Workflow: Vague question safely returns REQUEST_MORE_INFORMATION', () => {
  const result = adviseQuestion({
    question: 'എന്റെ പാടത്ത് എന്തോ പ്രശ്നമുണ്ട്',
    language: 'ml'
  });

  assert.equal(result.success, true);
  assert.equal(result.outcome, 'REQUEST_MORE_INFORMATION');
  assert.ok(result.missingContext.includes('crop_stage'));
  assert.ok(result.missingContext.includes('leaf_symptoms'));
});

test('Workflow: Language toggle returns English when requested', () => {
  const result = adviseQuestion({
    question: 'Leaf blast spindle lesions found on paddy',
    language: 'en'
  });

  assert.equal(result.success, true);
  assert.equal(result.ruleId, 'RULE_BLAST');
  assert.ok(result.summary.includes('Blast'));
  assert.ok(result.actionSteps[0].includes('Drain') || result.actionSteps[0].includes('water'));
});

test('Workflow: POST /api/query integration endpoint', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const res = await fetch(`${baseUrl}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'ചിനപ്പുപൊട്ടൽ ഘട്ടത്തിൽ പാടത്ത് എത്ര വെള്ളം നിർത്തണം?',
        language: 'ml'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.ruleId, 'RULE_WATER_MANAGEMENT');
    assert.ok(body.data.actionStepsMl.some(s => s.includes('ചിനപ്പുപൊട്ടൽ')));
  } finally {
    server.close();
  }
});

test('Workflow: HTML Interface contains all mandatory semantic IDs', () => {
  const html = fs.readFileSync(path.join(CONFIG.PUBLIC_DIR, 'index.html'), 'utf-8');

  const requiredIds = [
    'advisor-query-form',
    'advisor-query-input',
    'voice-input-btn',
    'advisor-submit-btn',
    'advisor-result-container',
    'connectivity-status',
    'lang-toggle-btn',
    'leaf-dropzone',
    'farmlog-form',
    'weather-location-select',
    'trace-container'
  ];

  for (const id of requiredIds) {
    assert.ok(html.includes(`id="${id}"`), `Mandatory DOM ID missing: #${id}`);
  }
});

test('Workflow: Full-page internationalization covers all sections and views', () => {
  const html = fs.readFileSync(path.join(CONFIG.PUBLIC_DIR, 'index.html'), 'utf-8');

  // Verify data-i18n attributes exist in every major view and section
  const expectedSections = [
    'nav_home', 'nav_crop', 'nav_farmlog', 'nav_weather', 'nav_schemes', 'nav_traces',
    'hero_tag', 'home_greeting', 'home_instructions', 'ask_btn',
    'crop_section_title', 'dropzone_title', 'btn_run_inference', 'idle_title',
    'farmlog_title', 'farmlog_add_heading', 'btn_add_farmlog',
    'weather_section_title', 'weather_refresh_btn', 'weather_advisory_heading',
    'schemes_title', 'subhiksha_title', 'aims_title', 'modal_scheme_title',
    'traces_title', 'btn_clear_trace', 'footer_text'
  ];

  for (const key of expectedSections) {
    assert.ok(html.includes(`data-i18n="${key}"`), `Missing data-i18n="${key}" in index.html`);
  }
});

test('Workflow: I18N dictionary in app.js covers all data-i18n keys for both ML and EN', () => {
  const html = fs.readFileSync(path.join(CONFIG.PUBLIC_DIR, 'index.html'), 'utf-8');
  const appJs = fs.readFileSync(path.join(CONFIG.PUBLIC_DIR, 'js', 'app.js'), 'utf-8');

  // Extract all data-i18n keys from index.html
  const i18nMatches = Array.from(html.matchAll(/data-i18n="([^"]+)"/g)).map(m => m[1]);
  assert.ok(i18nMatches.length > 50, `Expected at least 50 localized elements, found ${i18nMatches.length}`);

  // Extract all data-i18n-placeholder keys from index.html
  const placeholderMatches = Array.from(html.matchAll(/data-i18n-placeholder="([^"]+)"/g)).map(m => m[1]);
  assert.ok(placeholderMatches.length >= 2, `Expected at least 2 localized placeholders, found ${placeholderMatches.length}`);

  // Verify that app.js contains translations in I18N_DICTIONARY for all keys
  for (const key of [...i18nMatches, ...placeholderMatches]) {
    assert.ok(appJs.includes(`${key}:`), `Missing dictionary entry for ${key} in app.js`);
  }
});

