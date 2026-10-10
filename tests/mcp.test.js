import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import { discoverMCPTools, invokeMCPTool, getMCPTraceLog } from '../src/mcp/client.js';

test('MCP Protocol: Client discovers registered tools and schemas through handshake', async () => {
  const tools = await discoverMCPTools();

  assert.ok(Array.isArray(tools));
  assert.ok(tools.length >= 5, `Expected at least 5 tools, found ${tools.length}`);

  const toolNames = tools.map(t => t.name);
  assert.ok(toolNames.includes('farmlog_get_history'));
  assert.ok(toolNames.includes('farmlog_record_observation'));
  assert.ok(toolNames.includes('farmlog_confirm_activity'));
  assert.ok(toolNames.includes('weather_get_current'));
  assert.ok(toolNames.includes('weather_get_forecast'));

  // Verify schema properties
  const historyTool = tools.find(t => t.name === 'farmlog_get_history');
  assert.equal(historyTool.inputSchema.type, 'object');
  assert.ok(historyTool.description.includes('farm observation history'));
});

test('MCP Protocol: Invokes farmlog_record_observation through MCP client', async () => {
  const result = await invokeMCPTool('farmlog_record_observation', {
    content: 'കുട്ടനാട് പാടശേഖരത്തിൽ നെല്ല് ചിനപ്പുകൾ തഴച്ചു വളരുന്നു',
    cropStage: 'tillering',
    entryType: 'observation',
    title: 'MCP നിരീക്ഷണം'
  });

  assert.equal(result.success, true);
  assert.equal(result.tool, 'farmlog_record_observation');
  assert.ok(result.durationMs >= 0);
  assert.ok(result.data.entry);
  assert.equal(result.data.entry.entry_type, 'observation');
});

test('MCP Protocol: Invokes farmlog_get_history through MCP client', async () => {
  const result = await invokeMCPTool('farmlog_get_history', { limit: 5 });

  assert.equal(result.success, true);
  assert.equal(result.tool, 'farmlog_get_history');
  assert.ok(result.data.summary);
  assert.ok(Array.isArray(result.data.entries));
  assert.ok(result.data.entries.length > 0);
});

test('MCP Protocol: Invokes weather_get_current through MCP client', async () => {
  const result = await invokeMCPTool('weather_get_current', { location: 'kuttanad' });

  assert.equal(result.success, true);
  assert.equal(result.tool, 'weather_get_current');
  assert.ok(result.data.location);
  assert.equal(result.data.location.id, 'kuttanad');
  assert.ok(typeof result.data.currentConditions.temperatureC === 'number');
  assert.ok(typeof result.data.currentConditions.relativeHumidityPercent === 'number');
  assert.ok(result.data.provenance.source);
});

test('MCP Protocol: Safely handles unknown tool names and invalid inputs', async () => {
  // 1. Unknown tool
  const unknownResult = await invokeMCPTool('invalid_unknown_tool', {});
  assert.equal(unknownResult.success, false);
  assert.equal(unknownResult.isError, true);
  assert.ok(unknownResult.error.includes('not found'));

  // 2. Missing required parameters
  const invalidResult = await invokeMCPTool('farmlog_record_observation', { content: '' });
  assert.equal(invalidResult.success, false);
  assert.equal(invalidResult.isError, true);
  assert.ok(invalidResult.error.includes('content'));
});

test('MCP Protocol: HTTP REST Endpoints integration', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. GET /api/mcp/tools
    const toolsRes = await fetch(`${baseUrl}/api/mcp/tools`);
    assert.equal(toolsRes.status, 200);
    const toolsBody = await toolsRes.json();
    assert.equal(toolsBody.success, true);
    assert.ok(toolsBody.toolsCount >= 5);

    // 2. POST /api/mcp/call (weather_get_current)
    const callRes = await fetch(`${baseUrl}/api/mcp/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'weather_get_current',
        arguments: { location: 'palakkad' }
      })
    });
    assert.equal(callRes.status, 200);
    const callBody = await callRes.json();
    assert.equal(callBody.success, true);
    assert.equal(callBody.data.location.id, 'palakkad');

    // 3. GET /api/mcp/traces
    const tracesRes = await fetch(`${baseUrl}/api/mcp/traces`);
    assert.equal(tracesRes.status, 200);
    const tracesBody = await tracesRes.json();
    assert.equal(tracesBody.success, true);
    assert.ok(Array.isArray(tracesBody.traces));
    assert.ok(tracesBody.traces.length > 0);
  } finally {
    server.close();
  }
});
