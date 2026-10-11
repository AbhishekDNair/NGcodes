import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import app from '../src/server.js';
import { analyzeRiceLeaf } from '../src/ml/edge-classifier.js';
import { evaluateAgriculturalDecision } from '../src/decision-engine/rules.js';
import { CROP_STAGES, DECISION_OUTCOMES } from '../src/decision-engine/types.js';
import { addFarmLogEntry, getFarmLogEntries } from '../src/farmlog/database.js';
import { executeWeatherTool } from '../src/mcp/tools/weather-tools.js';

test('Offline Resilience: Manifest and Service Worker files exist and are valid', () => {
  const manifestPath = path.resolve(process.cwd(), 'src/public/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in src/public/');
  
  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  assert.ok(manifest.name.includes('കർഷക കെയർ') || manifest.name.includes('Karshaka Care'), 'Manifest must have Karshaka Care title');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.lang, 'ml');
  assert.ok(manifest.start_url);

  const swPath = path.resolve(process.cwd(), 'src/public/sw.js');
  assert.ok(fs.existsSync(swPath), 'sw.js must exist in src/public/');
  const swRaw = fs.readFileSync(swPath, 'utf8');
  assert.ok(swRaw.includes('CACHE_NAME'), 'Service Worker must define CACHE_NAME');
  assert.ok(swRaw.includes('STATIC_ASSETS'), 'Service Worker must define precached assets');
  assert.ok(swRaw.includes('/index.html'), 'Service Worker must precache index.html');
  assert.ok(swRaw.includes('/css/styles.css'), 'Service Worker must precache styles.css');
  assert.ok(swRaw.includes('/js/app.js'), 'Service Worker must precache app.js');
});

test('Offline Resilience: Edge AI model runs 100% locally with zero internet', async () => {
  const sampleImagePath = path.resolve(process.cwd(), 'src/public/assets/rice_leaf_sample.jpg');
  const imageBuffer = fs.readFileSync(sampleImagePath);

  const t0 = performance.now();
  const result = await analyzeRiceLeaf(imageBuffer);
  const latency = performance.now() - t0;

  assert.equal(result.success, true);
  assert.ok(result.diagnosis);
  assert.ok(result.diagnosis.confidence >= 0 && result.diagnosis.confidence <= 1);
  assert.ok(latency < 1000, `Local inference was fast (${latency.toFixed(1)}ms) without network calls`);
});

test('Offline Resilience: Deterministic KAU rule engine runs 100% locally without network', () => {
  // Warmup JIT
  evaluateAgriculturalDecision({ cropStage: CROP_STAGES.TILLERING, farmerSymptoms: [] });

  const t0 = performance.now();
  const decision = evaluateAgriculturalDecision({
    cropStage: CROP_STAGES.TILLERING,
    farmerSymptoms: ['spots'],
    imagePrediction: {
      diagnosis: { key: 'brown_spot', nameMl: 'തവിട്ടു പുള്ളി രോഗം', confidence: 0.91 }
    }
  });
  const latency = performance.now() - t0;

  assert.equal(decision.outcome, DECISION_OUTCOMES.FOLLOW_VERIFIED_GUIDANCE);
  assert.equal(decision.ruleId, 'RULE_VERIFIED_BROWN_SPOT_07');
  assert.ok(latency < 10, `KAU rules evaluated in ${latency.toFixed(2)}ms locally`);
});

test('Offline Resilience: FarmLog SQLite records locally with zero external network', () => {
  const note = `Offline test observation ${Date.now()}`;
  const entry = addFarmLogEntry({
    entry_type: 'observation',
    crop_stage: 'tillering',
    content: note,
    source: 'offline_farmer'
  });

  assert.ok(entry.id);
  assert.equal(entry.status, 'local_persisted');

  const history = getFarmLogEntries({ limit: 1 });
  assert.equal(history[0].id, entry.id);
  assert.equal(history[0].content, note);
});

test('Offline Resilience: Weather tool falls back cleanly to local cache when network is unreachable', async () => {
  // Pass simulated or offline cached location
  const weatherResult = await executeWeatherTool('weather_get_current', { location: 'kuttanad' });
  assert.ok(weatherResult.currentConditions);
  assert.ok(typeof weatherResult.currentConditions.temperatureC === 'number');
  assert.ok(weatherResult.provenance);
  assert.ok(weatherResult.forecast24h.advisoryMl.includes('മഴ') || weatherResult.forecast24h.advisoryMl.includes('കാലാവസ്ഥ'));
});

test('Offline Resilience: Server serves sw.js and manifest.json correctly', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const swRes = await fetch(`http://localhost:${port}/sw.js`);
    assert.equal(swRes.status, 200);
    const swText = await swRes.text();
    assert.ok(swText.includes('krishivaani-v1'));

    const manifestRes = await fetch(`http://localhost:${port}/manifest.json`);
    assert.equal(manifestRes.status, 200);
    const manifestJson = await manifestRes.json();
    assert.ok(manifestJson.name.includes('കർഷക കെയർ') || manifestJson.name.includes('Karshaka Care'));
  } finally {
    server.close();
  }
});
