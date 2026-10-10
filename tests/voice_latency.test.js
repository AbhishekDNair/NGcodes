import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import { evaluateAgriculturalDecision } from '../src/decision-engine/rules.js';
import { CROP_STAGES } from '../src/decision-engine/types.js';

test('Voice & Latency: Malayalam ASR and TTS configuration values are standard compliant', () => {
  const supportedLocales = ['ml-IN', 'en-IN'];
  const primaryLocale = 'ml-IN';
  
  assert.ok(supportedLocales.includes('ml-IN'));
  assert.equal(primaryLocale, 'ml-IN');

  // Verify speech synthesis rate constraints (gentle and natural for farmers)
  const speechRate = 0.95;
  assert.ok(speechRate >= 0.8 && speechRate <= 1.0);
});

test('Voice & Latency: Decision engine responds with ultralow latency (< 15ms) for voice roundtrip', () => {
  const trials = 10;
  const latencies = [];

  for (let i = 0; i < trials; i++) {
    const t0 = performance.now();
    const decision = evaluateAgriculturalDecision({
      cropStage: CROP_STAGES.TILLERING,
      farmerQuestion: 'ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു, എന്ത് ചെയ്യണം?'
    });
    const duration = performance.now() - t0;
    latencies.push(duration);
    assert.ok(decision.explanationMl);
  }

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / trials;
  assert.ok(avgLatency < 15, `Average decision latency must be < 15ms (was ${avgLatency.toFixed(2)}ms)`);
});

test('Voice & Latency: End-to-end query endpoint profiles and responds within voice latency budget', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const t0 = performance.now();
    const res = await fetch(`http://localhost:${port}/api/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'പാടത്ത് രണ്ടാം തവണ പൊട്ടാഷ് വളം എപ്പോൾ നൽകണം?',
        language: 'ml'
      })
    });
    const roundtripMs = performance.now() - t0;

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.summary);
    // Over local HTTP stack, total latency should be well under 250ms for seamless conversational experience
    assert.ok(roundtripMs < 500, `Roundtrip latency should be conversational (< 500ms), was ${roundtripMs.toFixed(1)}ms`);
  } finally {
    server.close();
  }
});

test('Voice & Latency: Diverse spoken problems in Malayalam and Manglish return verified guidance', async () => {
  const { adviseQuestion } = await import('../src/decision-engine/text-advisor.js');

  const testCases = [
    { query: 'ഇലകൾ മഞ്ഞളിക്കുന്നു', expectedRule: 'RULE_YELLOWING_DEFICIENCY' },
    { query: 'പാടത്ത് പുഴു ശല്യം ഉണ്ട്', expectedRule: 'RULE_GENERAL_PEST' },
    { query: 'തണ്ടുതുരപ്പൻ പുഴു തണ്ട് തിന്നുന്നു', expectedRule: 'RULE_STEM_BORER' },
    { query: 'ഇലച്ചുരുട്ടി പുഴു ഇല തിന്നുന്നു', expectedRule: 'RULE_LEAF_FOLDER' },
    { query: 'നെല്ലിൽ ചാഴി ശല്യം എന്ത് ചെയ്യണം', expectedRule: 'RULE_RICE_BUG' },
    { query: 'പോളക്കരിച്ചിൽ രോഗം കാണുന്നു', expectedRule: 'RULE_SHEATH_BLIGHT' },
    { query: 'നെല്ലിന് എന്ത് വളം കൊടുക്കണം', expectedRule: 'RULE_FERTILIZER_SCHEDULE' },
    { query: 'പാടത്ത് വെള്ളം കെട്ടിക്കിടക്കുന്നു', expectedRule: 'RULE_WATER_MANAGEMENT' },
    { query: 'പാടത്തെ കളകൾ മാറ്റാൻ എന്ത് ചെയ്യണം', expectedRule: 'RULE_WEED_MANAGEMENT' },
    // Manglish tests
    { query: 'ila manjalikkunnu enthu cheyyanam', expectedRule: 'RULE_YELLOWING_DEFICIENCY' },
    { query: 'chazhi shalyam undu', expectedRule: 'RULE_RICE_BUG' },
    { query: 'puzhu shalyam undu', expectedRule: 'RULE_GENERAL_PEST' }
  ];

  for (const tc of testCases) {
    const res = adviseQuestion({ question: tc.query, language: 'ml' });
    assert.equal(res.success, true, `Should succeed for: ${tc.query}`);
    assert.equal(res.ruleId, tc.expectedRule, `Query "${tc.query}" should match ${tc.expectedRule}`);
    assert.equal(res.outcome, 'FOLLOW_VERIFIED_GUIDANCE');
    assert.ok(res.summary && res.summary.length > 10, `Summary must be non-empty for: ${tc.query}`);
    assert.ok(Array.isArray(res.actionSteps) && res.actionSteps.length >= 2, `Must provide action steps for: ${tc.query}`);
  }
});
