import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { CONFIG } from '../src/config.js';
import app from '../src/server.js';
import ort from 'onnxruntime-node';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

test('Foundation: Configuration values are defined correctly', () => {
  assert.equal(typeof CONFIG.APP_NAME, 'string');
  assert.ok(CONFIG.APP_NAME.includes('കർഷക കെയർ') || CONFIG.APP_NAME.includes('Karshaka Care'));
  assert.equal(typeof CONFIG.PORT, 'number');
  assert.ok(Array.isArray(CONFIG.SUPPORTED_CROPS));
  assert.equal(CONFIG.SUPPORTED_CROPS[0].id, 'rice_paddy');
  assert.ok(Array.isArray(CONFIG.FARM_LOCATIONS));
  assert.equal(CONFIG.FARM_LOCATIONS[0].id, 'kuttanad');
});

test('Foundation: Native node:sqlite can initialize and run ACID queries', () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE test_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  
  const insert = db.prepare('INSERT INTO test_memory (farmer_note, created_at) VALUES (?, ?)');
  insert.run('കുട്ടനാട്ടിലെ പാടത്ത് ചിനപ്പുകൾ പൊട്ടിത്തുടങ്ങി', new Date().toISOString());

  const query = db.prepare('SELECT * FROM test_memory');
  const rows = query.all();

  assert.equal(rows.length, 1);
  assert.ok(rows[0].farmer_note.includes('കുട്ടനാട്ടിലെ'));
  db.close();
});

test('Foundation: Official MCP SDK is importable and constructable', () => {
  assert.ok(Server, 'MCP Server class must be defined');
  const testServer = new Server(
    { name: 'test-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );
  assert.ok(testServer);
});

test('Foundation: ONNX Runtime Node is loaded and operational', () => {
  assert.ok(ort, 'ONNX Runtime module must be loaded');
  assert.equal(typeof ort.InferenceSession.create, 'function');
});

test('Foundation: Express server handles /api/health and /api/status', async () => {
  // Use http server instance on ephemeral port
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Test /api/health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.equal(healthData.status, 'ok');
    assert.ok(healthData.service.includes('Karshaka Care'));

    // Test /api/status
    const statusRes = await fetch(`${baseUrl}/api/status`);
    assert.equal(statusRes.status, 200);
    const statusData = await statusRes.json();
    assert.equal(statusData.status, 'operational');
    assert.equal(statusData.capabilities.malayalamFirstUI, true);
    assert.equal(statusData.capabilities.farmlogPersistence, true);
    assert.equal(statusData.capabilities.mcpIntegration, true);

    // Test static index.html serving
    const indexRes = await fetch(`${baseUrl}/`);
    assert.equal(indexRes.status, 200);
    const htmlText = await indexRes.text();
    assert.ok(htmlText.includes('കർഷക കെയർ') || htmlText.includes('Karshaka Care'));
  } finally {
    server.close();
  }
});
