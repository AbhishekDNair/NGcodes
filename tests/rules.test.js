import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import { evaluateAgriculturalDecision } from '../src/decision-engine/rules.js';
import { DECISION_OUTCOMES, CROP_STAGES, KAU_CITATIONS } from '../src/decision-engine/types.js';

test('Decision Engine: Rule 1 - Adverse weather overrides fertilizer/spray with WEATHER_PRECAUTION', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerQuestion: 'പാടത്ത് രണ്ടാം തവണ യൂറിയ വളം വിതറാമോ?',
    weatherData: { precipitationProbability: 75, condition: 'Heavy rain forecasted' }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.WEATHER_PRECAUTION);
  assert.equal(result.ruleId, 'RULE_WEATHER_OVERRIDE_01');
  assert.ok(result.evidenceConsidered.some(e => e.includes('മഴ സാധ്യത: 75%')));
  assert.ok(result.actionStepsMl.some(s => s.includes('ഡ്രെയിനേജ്')));
  assert.ok(result.actionStepsMl.some(s => s.includes('വളപ്രയോഗം നിർത്തിവെക്കുക')));
  assert.ok(result.safetyAlertMl.includes('ഇലക്കരിച്ചിൽ'));
});

test('Decision Engine: Rule 2 - Panicle stage + Blast triggers emergency REFER_TO_AGRICULTURAL_EXPERT', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.PANICLE,
    farmerSymptoms: ['drying'],
    imagePrediction: {
      diagnosis: { key: 'leaf_blast', nameMl: 'ഇലക്കരിച്ചിൽ', confidence: 0.82 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.REFER_TO_AGRICULTURAL_EXPERT);
  assert.equal(result.ruleId, 'RULE_PANICLE_BLAST_EMERGENCY_02');
  assert.ok(result.explanationMl.includes('കതിർക്കരിച്ചിലിന്'));
  assert.ok(result.actionStepsMl.some(s => s.includes('കൃഷിഭവനുമായി ഉടനടി ബന്ധപ്പെട്ട്')));
});

test('Decision Engine: Rule 3 - Contradictory evidence triggers REQUEST_MORE_INFORMATION', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: ['wilting', 'drying'],
    imagePrediction: {
      diagnosis: { key: 'healthy_leaf', nameMl: 'ആരോഗ്യമുള്ള ഇല', confidence: 0.85 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.REQUEST_MORE_INFORMATION);
  assert.equal(result.ruleId, 'RULE_CONTRADICTORY_EVIDENCE_03');
  assert.ok(result.missingInformation.includes('clearer_leaf_photo'));
  assert.ok(result.explanationMl.includes('വാട്ടമോ കരിച്ചിലോ രേഖപ്പെടുത്തിയിട്ടുണ്ട്'));
});

test('Decision Engine: Rule 4 - Out of scope image triggers REQUEST_MORE_INFORMATION', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.SEEDLING,
    imagePrediction: {
      diagnosis: { key: 'others', nameMl: 'മറ്റ് സസ്യങ്ങൾ', confidence: 0.35 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.REQUEST_MORE_INFORMATION);
  assert.equal(result.ruleId, 'RULE_IMAGE_OUT_OF_SCOPE_04');
  assert.ok(result.missingInformation.includes('clearer_leaf_photo'));
});

test('Decision Engine: Rule 5 - Moderate confidence (0.55) triggers MONITOR_AND_REASSESS', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: ['spots'],
    imagePrediction: {
      diagnosis: { key: 'brown_spot', nameMl: 'ഇലപ്പുള്ളി രോഗം', confidence: 0.55 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.MONITOR_AND_REASSESS);
  assert.equal(result.ruleId, 'RULE_LOW_CONFIDENCE_MONITOR_05');
  assert.ok(result.explanationMl.includes('മോഡൽ വിശ്വാസ്യത 55%'));
});

test('Decision Engine: Rule 6 - Verified Bacterial Blight strictly forbids fungicides and enforces drainage', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: ['yellowing', 'drying'],
    imagePrediction: {
      diagnosis: { key: 'bacterial_leaf_blight', nameMl: 'ബാക്ടീരിയൽ ഇലവാട്ടം', confidence: 0.88 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE);
  assert.equal(result.ruleId, 'RULE_VERIFIED_BLB_06');
  assert.ok(result.actionStepsMl.some(s => s.includes('യൂറിയ') && s.includes('നിർത്തുക')));
  assert.ok(result.actionStepsMl.some(s => s.includes('ബ്ലീച്ചിംഗ് പൗഡർ')));
  assert.ok(result.safetyAlertMl.includes('കുമിൾനാശിനികൾ തളിക്കുന്നത് സാമ്പത്തിക നഷ്ടവും'));
});

test('Decision Engine: Rule 7 - Verified Brown Spot advises Potash correction', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: ['spots'],
    imagePrediction: {
      diagnosis: { key: 'brown_spot', nameMl: 'ഇലപ്പുള്ളി രോഗം', confidence: 0.79 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE);
  assert.equal(result.ruleId, 'RULE_VERIFIED_BROWN_SPOT_07');
  assert.ok(result.actionStepsMl.some(s => s.includes('പൊട്ടാഷ്')));
});

test('Decision Engine: Rule 8 - Healthy paddy with zero symptoms returns NO_ACTION_RECOMMENDED', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: [],
    imagePrediction: {
      diagnosis: { key: 'healthy_leaf', nameMl: 'ആരോഗ്യമുള്ള ഇല', confidence: 0.92 }
    }
  });

  assert.equal(result.outcome, DECISION_OUTCOMES.NO_ACTION_RECOMMENDED_BY_AVAILABLE_EVIDENCE);
  assert.equal(result.ruleId, 'RULE_HEALTHY_NO_ACTION_09');
  assert.ok(result.safetyAlertMl.includes('കീടനാശിനികൾ തളിക്കരുത്'));
});

test('Decision Engine: Fallback - Empty evidence triggers REQUEST_MORE_INFORMATION', () => {
  const result = evaluateAgriculturalDecision({});

  assert.equal(result.outcome, DECISION_OUTCOMES.REQUEST_MORE_INFORMATION);
  assert.equal(result.ruleId, 'RULE_INSUFFICIENT_EVIDENCE_10');
  assert.ok(result.missingInformation.includes('crop_stage'));
  assert.ok(result.missingInformation.includes('farmer_symptoms'));
});

test('Decision Engine: Latency is ultralow (System 1 instinctual speed < 10ms)', () => {
  const result = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: ['spots'],
    imagePrediction: {
      diagnosis: { key: 'brown_spot', nameMl: 'ഇലപ്പുള്ളി രോഗം', confidence: 0.85 }
    }
  });

  assert.ok(result.evaluationLatencyMs < 10.0, `Evaluation must be < 10ms, was ${result.evaluationLatencyMs}ms`);
  assert.ok(result.evidenceConsidered.length > 0);
  assert.ok(result.guidanceSource.includes('Kerala Agricultural University'));
});

test('Decision Engine: POST /api/evaluate-decision HTTP integration', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const res = await fetch(`${baseUrl}/api/evaluate-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropStage: 'tillering',
        farmerSymptoms: ['spots'],
        imagePrediction: {
          diagnosis: { key: 'brown_spot', nameMl: 'ഇലപ്പുള്ളി രോഗം', confidence: 0.88 }
        }
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.decision.outcome, DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE);
    assert.equal(body.decision.ruleId, 'RULE_VERIFIED_BROWN_SPOT_07');
  } finally {
    server.close();
  }
});
