import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../src/server.js';
import { coordinateRequest } from '../src/orchestrator/coordinator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_IMAGE_PATH = path.resolve(__dirname, '..', 'src', 'ml', 'samples', 'rice_leaf_sample.jpg');

test('Orchestrator: Routes CROP_ANALYSIS workflow (Edge AI + Decision Engine + Trace)', async () => {
  const imageBuffer = fs.readFileSync(SAMPLE_IMAGE_PATH);

  const result = await coordinateRequest({
    image: imageBuffer,
    cropStage: 'tillering',
    symptoms: ['spots'],
    location: 'kuttanad'
  });

  assert.equal(result.success, true);
  assert.equal(result.intent, 'CROP_ANALYSIS');
  assert.ok(result.diagnosis);
  assert.ok(result.diagnosis.nameMl);
  assert.ok(result.decision);
  assert.ok(result.decision.outcome);
  assert.ok(result.explanation);
  assert.ok(result.actionSteps.length > 0);

  // Check observable execution trace
  assert.ok(Array.isArray(result.executionTrace));
  assert.ok(result.executionTrace.length >= 2);
  const components = result.executionTrace.map(t => t.component);
  assert.ok(components.includes('COORDINATOR'));
  assert.ok(components.includes('EDGE_AI'));
  assert.ok(components.includes('DECISION_ENGINE'));
});

test('Orchestrator: Routes WEATHER_QUERY to Weather MCP tool without running image classifier', async () => {
  const result = await coordinateRequest({
    question: 'കുട്ടനാട്ടിൽ ഇന്ന് മഴ പെയ്യാൻ സാധ്യതയുണ്ടോ?',
    location: 'kuttanad'
  });

  assert.equal(result.success, true);
  assert.equal(result.intent, 'WEATHER_QUERY');
  assert.ok(result.toolsInvoked.includes('weather_get_current'));
  assert.ok(result.weather);
  assert.ok(result.explanation.includes('കുട്ടനാട്') || result.explanation.includes('താപനില'));

  // Ensure image model was NOT called
  const components = result.executionTrace.map(t => t.component);
  assert.equal(components.includes('EDGE_AI'), false, 'Weather query must not run image classifier');
});

test('Orchestrator: Routes FARMLOG_QUERY to FarmLog MCP tool without unnecessary calls', async () => {
  const result = await coordinateRequest({
    question: 'പാടത്ത് മുൻപ് ചെയ്ത കാര്യങ്ങളുടെ ഹിസ്റ്ററി കാണിക്കുക'
  });

  assert.equal(result.success, true);
  assert.equal(result.intent, 'FARMLOG_QUERY');
  assert.ok(result.toolsInvoked.includes('farmlog_get_history'));
  assert.ok(result.farmlog);
  assert.ok(typeof result.farmlog.entriesCount === 'number');

  // Ensure image model was NOT called
  const components = result.executionTrace.map(t => t.component);
  assert.equal(components.includes('EDGE_AI'), false);
});

test('Orchestrator: Routes GENERAL_CONSULTATION through KAU rules advisor', async () => {
  const result = await coordinateRequest({
    question: 'ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള പുള്ളികൾ കാണുന്നു, എന്ത് ചെയ്യണം?',
    cropStage: 'tillering'
  });

  assert.equal(result.success, true);
  assert.equal(result.intent, 'GENERAL_CONSULTATION');
  assert.equal(result.toolsInvoked.length, 0, 'Simple consultation should not invoke external tools unnecessarily');
  assert.ok(result.explanation.includes('ഇലപ്പുള്ളി'));
});

test('Orchestrator: HTTP POST /api/orchestrate integration', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const res = await fetch(`${baseUrl}/api/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'പാലക്കാട് ഇന്നത്തെ കാലാവസ്ഥ എന്താണ്?',
        location: 'palakkad'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.intent, 'WEATHER_QUERY');
    assert.ok(body.toolsInvoked.includes('weather_get_current'));
    assert.ok(body.executionTrace.length > 0);
  } finally {
    server.close();
  }
});
