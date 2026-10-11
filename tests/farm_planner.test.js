import test from 'node:test';
import assert from 'node:assert';
import { generateFarmPlan, KAU_STAGE_GUIDELINES } from '../src/farm-planner/planner.js';

test('Farm Planner: Returns clarifying questions when farm history is empty', () => {
  const plan = generateFarmPlan({
    farmHistory: [],
    cropStage: 'tillering',
    language: 'en'
  });

  assert.strictEqual(plan.success, true);
  assert.ok(plan.clarifyingQuestions.length > 0, 'Should ask clarifying questions when history is empty');
  const hasHistoryQuestion = plan.clarifyingQuestions.some(q => q.questionEn.includes('No FarmLog history'));
  assert.ok(hasHistoryQuestion, 'Should ask about transplanting/sowing or last field activity');
});

test('Farm Planner: Adapts next steps when farmer records watering', () => {
  const farmHistory = [
    {
      id: 101,
      crop_stage: 'tillering',
      entry_type: 'action_confirmed',
      title: 'Watered Paddy Field',
      content: 'Watered paddy field 5cm depth today morning.',
      created_at: new Date().toISOString()
    }
  ];

  const plan = generateFarmPlan({
    farmHistory,
    cropStage: 'tillering',
    language: 'en'
  });

  assert.strictEqual(plan.success, true);
  // Should suggest AWD subsidence / drying phase
  const awdRec = plan.recommendations.find(r => r.id === 'post_water_awd_next_step');
  assert.ok(awdRec, 'Should provide AWD recommendation after watering');
  assert.strictEqual(awdRec.priority, 'high');
  assert.ok(awdRec.reasonEn.includes('AWD') || awdRec.reasonEn.includes('Alternate Wetting and Drying'));
  assert.ok(awdRec.kauSource.includes('KAU POP'));
});

test('Farm Planner: Adapts critically when disease symptom is recorded', () => {
  const farmHistory = [
    {
      id: 102,
      crop_stage: 'tillering',
      entry_type: 'observation',
      title: 'Leaf Scorching & Spots',
      content: 'Observed severe brown spot lesions on several leaves.',
      created_at: new Date().toISOString()
    }
  ];

  const plan = generateFarmPlan({
    farmHistory,
    cropStage: 'tillering',
    language: 'en'
  });

  assert.strictEqual(plan.success, true);
  const criticalRec = plan.recommendations.find(r => r.priority === 'critical');
  assert.ok(criticalRec, 'Should produce a critical priority recommendation for disease progression');
  assert.ok(criticalRec.titleEn.includes('Monitor') || criticalRec.titleEn.includes('moisture'));
});

test('Farm Planner: Applies weather precaution when rainfall probability is high', () => {
  const farmHistory = [];
  const weatherData = { precipitationProbability: 75, rainExpected: true };

  const plan = generateFarmPlan({
    farmHistory,
    cropStage: 'tillering',
    weatherData,
    language: 'en'
  });

  assert.strictEqual(plan.success, true);
  const blockedRec = plan.recommendations.find(r => r.isWeatherBlocked);
  assert.ok(blockedRec, 'Fertilizer/spray recommendation should be marked weather-blocked under high rain');
  assert.ok(blockedRec.weatherWarningEn.includes('75%') || blockedRec.weatherWarningEn.includes('Rain probability'));
});

test('Farm Planner: Bilingual support produces accurate Malayalam plan', () => {
  const farmHistory = [
    {
      id: 103,
      crop_stage: 'tillering',
      entry_type: 'action_confirmed',
      title: 'പാടം നനച്ചു',
      content: 'പാടത്ത് 5 സെ.മീ വെള്ളം കയറ്റി നനച്ചു.',
      created_at: new Date().toISOString()
    }
  ];

  const plan = generateFarmPlan({
    farmHistory,
    cropStage: 'tillering',
    language: 'ml'
  });

  assert.strictEqual(plan.success, true);
  assert.strictEqual(plan.stageNameMl, 'ചിനപ്പുപൊട്ടൽ ഘട്ടം');
  assert.ok(plan.summaryMl.includes('ചിനപ്പുപൊട്ടൽ ഘട്ടം'));
  assert.ok(plan.recommendations.length > 0);
  assert.ok(plan.recommendations[0].titleMl.length > 0);
  assert.ok(plan.recommendations[0].reasonMl.length > 0);
});

test('Farm Planner: HTTP POST /api/farmlog/plan endpoint responds correctly', async () => {
  const response = await fetch('http://localhost:3000/api/farmlog/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cropStage: 'tillering', language: 'en' })
  });

  assert.strictEqual(response.status, 200);
  const data = await response.json();
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.cropStage, 'tillering');
  assert.ok(Array.isArray(data.recommendations));
  assert.ok(Array.isArray(data.clarifyingQuestions));
});
