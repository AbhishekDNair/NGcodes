import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import app from '../src/server.js';
import { 
  initFarmLogDB, 
  addFarmLogEntry, 
  getFarmLogEntries, 
  confirmFarmActivity, 
  getFarmLogSummary 
} from '../src/farmlog/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB_PATH = path.resolve(__dirname, '..', 'data', 'test_farmlog.sqlite');

// Clean up test DB before and after
function cleanupTestDb() {
  ['', '-wal', '-shm'].forEach(ext => {
    const file = `${TEST_DB_PATH}${ext}`;
    if (fs.existsSync(file)) {
      try { fs.unlinkSync(file); } catch (_) {}
    }
  });
}

test('FarmLog: Initializes SQLite database with WAL mode and schema', () => {
  cleanupTestDb();
  const db = initFarmLogDB(TEST_DB_PATH);
  assert.ok(db);

  // Check tables exist
  const tableRow = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='farmlog_entries'").get();
  assert.equal(tableRow.name, 'farmlog_entries');

  // Check WAL mode enabled
  const pragmaRow = db.prepare('PRAGMA journal_mode').get();
  assert.equal(pragmaRow.journal_mode.toLowerCase(), 'wal');

  db.close();
  cleanupTestDb();
});

test('FarmLog: Records farmer observation and differentiates entry types', () => {
  cleanupTestDb();
  const db = initFarmLogDB(TEST_DB_PATH);

  // 1. Farmer Observation
  const obs = addFarmLogEntry({
    cropType: 'rice_paddy',
    cropStage: 'tillering',
    entryType: 'observation',
    title: 'ഇല പരിശോധന',
    content: 'പാടത്ത് ചിനപ്പുകൾ തഴച്ചുവളരുന്നു, വെള്ളം 3 സെ.മീ ആക്കി ക്രമീകരിച്ചു',
    source: 'farmer_manual'
  }, db);

  assert.equal(obs.entry_type, 'observation');
  assert.equal(obs.status, 'local_persisted');
  assert.ok(obs.id > 0);

  // 2. Model Prediction
  const pred = addFarmLogEntry({
    cropType: 'rice_paddy',
    cropStage: 'tillering',
    entryType: 'prediction',
    title: 'ഇലപ്പുള്ളി രോഗം',
    content: 'മോഡൽ നിർണ്ണയം: ഇലപ്പുള്ളി രോഗം (വിശ്വാസ്യത: 88%)',
    modelPrediction: { key: 'brown_spot', confidence: 0.88 },
    source: 'edge_onnx_model'
  }, db);

  assert.equal(pred.entry_type, 'prediction');
  assert.equal(pred.model_prediction.key, 'brown_spot');

  // 3. Confirmed Activity
  const action = confirmFarmActivity({
    content: 'രണ്ടാം തവണ പൊട്ടാഷ് വളം വിതറി',
    cropStage: 'tillering'
  }, db);

  assert.equal(action.entry_type, 'action_confirmed');
  assert.equal(action.source, 'farmer_confirmed');

  // Verify retrieval
  const entries = getFarmLogEntries({}, db);
  assert.equal(entries.length, 3);
  // Sorted DESC by ID
  assert.equal(entries[0].entry_type, 'action_confirmed');
  assert.equal(entries[1].entry_type, 'prediction');
  assert.equal(entries[2].entry_type, 'observation');

  // Verify Summary
  const summary = getFarmLogSummary(db);
  assert.equal(summary.totalEntries, 3);
  assert.equal(summary.observationsCount, 1);
  assert.equal(summary.predictionsCount, 1);
  assert.equal(summary.confirmedActivitiesCount, 1);

  db.close();
  cleanupTestDb();
});

test('FarmLog: Input validation strictly rejects invalid data', () => {
  cleanupTestDb();
  const db = initFarmLogDB(TEST_DB_PATH);

  // Empty content rejection
  assert.throws(() => {
    addFarmLogEntry({ content: '' }, db);
  }, /FarmLog entry requires non-empty content/);

  // Invalid entry_type rejection
  assert.throws(() => {
    addFarmLogEntry({ content: 'Test note', entryType: 'unsupported_type' }, db);
  }, /Invalid entry_type/);

  db.close();
  cleanupTestDb();
});

test('FarmLog: True Persistence Test across application restarts', () => {
  cleanupTestDb();
  
  // Instance 1: Write records
  const db1 = initFarmLogDB(TEST_DB_PATH);
  addFarmLogEntry({
    entryType: 'observation',
    title: 'കുട്ടനാട് പുഞ്ചകൃഷി',
    content: 'പുഞ്ചകൃഷി വിതച്ച് 20 ദിവസം കഴിഞ്ഞു. ചിനപ്പുകൾ വരുന്നു.',
    cropStage: 'tillering'
  }, db1);

  addFarmLogEntry({
    entryType: 'action_confirmed',
    title: 'വളം നൽകി',
    content: 'കുട്ടനാട് പാടശേഖരത്തിൽ വെള്ളം താഴ്ത്തി വളം നൽകി.',
    cropStage: 'tillering'
  }, db1);

  // Simulate Application Shutdown
  db1.close();

  // Instance 2: Simulate Application Restart (read same physical SQLite file)
  const db2 = initFarmLogDB(TEST_DB_PATH);
  const reloadedEntries = getFarmLogEntries({}, db2);

  assert.equal(reloadedEntries.length, 2, 'Records must survive database close and restart');
  assert.ok(reloadedEntries.some(e => e.content.includes('പുഞ്ചകൃഷി വിതച്ച് 20 ദിവസം')));
  assert.ok(reloadedEntries.some(e => e.content.includes('വെള്ളം താഴ്ത്തി വളം നൽകി')));

  const summary = getFarmLogSummary(db2);
  assert.equal(summary.totalEntries, 2);
  assert.equal(summary.observationsCount, 1);
  assert.equal(summary.confirmedActivitiesCount, 1);

  db2.close();
  cleanupTestDb();
});

test('FarmLog: HTTP REST Endpoints integration', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. GET /api/farmlog
    const getRes = await fetch(`${baseUrl}/api/farmlog`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.success, true);
    assert.ok(typeof getData.summary.totalEntries === 'number');
    assert.ok(Array.isArray(getData.entries));

    // 2. POST /api/farmlog
    const postRes = await fetch(`${baseUrl}/api/farmlog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cropStage: 'tillering',
        entryType: 'observation',
        title: 'REST Test Note',
        content: 'REST API വഴി രേഖപ്പെടുത്തിയ നിരീക്ഷണം'
      })
    });
    assert.equal(postRes.status, 201);
    const postData = await postRes.json();
    assert.equal(postData.success, true);
    assert.equal(postData.entry.title, 'REST Test Note');
    assert.equal(postData.entry.status, 'local_persisted');

    // 3. POST /api/farmlog/confirm
    const confirmRes = await fetch(`${baseUrl}/api/farmlog/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'REST API വഴി സ്ഥിരീകരിച്ച കൃഷിപ്പണി',
        cropStage: 'tillering'
      })
    });
    assert.equal(confirmRes.status, 201);
    const confirmData = await confirmRes.json();
    assert.equal(confirmData.success, true);
    assert.equal(confirmData.entry.entry_type, 'action_confirmed');
  } finally {
    server.close();
  }
});
