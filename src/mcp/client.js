/**
 * Karshaka Care Official MCP Client
 * Communicates with the MCP Server through official SDK protocol messages.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createKarshakaCareServer } from './server.js';

let clientInstance = null;
let serverInstance = null;
const mcpTraceHistory = [];

/**
 * Initializes and connects the official MCP Client to the Server
 * @returns {Promise<Client>}
 */
export async function getKarshakaCareClient() {
  if (!clientInstance) {
    serverInstance = createKarshakaCareServer();

    clientInstance = new Client(
      {
        name: 'karshaka-care-orchestrator-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    // Create linked pair of official MCP transports
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    // Connect both ends of the protocol
    await serverInstance.connect(serverTransport);
    await clientInstance.connect(clientTransport);

    logMcpTrace('HANDSHAKE', 'Protocol handshake established between Orchestrator and MCP Server', 'system');
  }

  return clientInstance;
}

/**
 * Discovers available tools through the MCP protocol
 * @returns {Promise<Object[]>} List of tool schemas
 */
export async function discoverMCPTools() {
  const client = await getKarshakaCareClient();
  const startTime = performance.now();

  const response = await client.listTools();
  const duration = Math.round((performance.now() - startTime) * 10) / 10;

  logMcpTrace('DISCOVERY', `Discovered ${response.tools.length} MCP tools in ${duration}ms`, 'call', {
    tools: response.tools.map(t => t.name)
  });

  return response.tools;
}

/**
 * Invokes a tool through the official MCP protocol
 * @param {string} toolName
 * @param {Object} args
 * @returns {Promise<Object>} Structured return value
 */
export async function invokeMCPTool(toolName, args = {}) {
  const client = await getKarshakaCareClient();
  const startTime = performance.now();

  logMcpTrace('INVOKE_START', `Calling MCP tool: "${toolName}"`, 'call', { tool: toolName, arguments: args });

  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args
    });

    const duration = Math.round((performance.now() - startTime) * 10) / 10;

    if (result.isError) {
      const errorText = result.content[0]?.text || 'MCP invocation failed';
      let parsedErr;
      try { parsedErr = JSON.parse(errorText); } catch (_) { parsedErr = { error: errorText }; }

      logMcpTrace('INVOKE_ERROR', `Tool "${toolName}" returned error: ${parsedErr.error}`, 'error', {
        tool: toolName,
        durationMs: duration,
        error: parsedErr.error
      });

      return {
        success: false,
        isError: true,
        tool: toolName,
        error: parsedErr.error,
        durationMs: duration
      };
    }

    const rawText = result.content[0]?.text || '{}';
    const parsedData = JSON.parse(rawText);

    logMcpTrace('INVOKE_SUCCESS', `Tool "${toolName}" executed successfully in ${duration}ms`, 'call', {
      tool: toolName,
      durationMs: duration
    });

    return {
      success: true,
      tool: toolName,
      durationMs: duration,
      data: parsedData,
      rawProtocolResult: result
    };
  } catch (err) {
    const duration = Math.round((performance.now() - startTime) * 10) / 10;
    logMcpTrace('PROTOCOL_ERROR', `MCP protocol transport error: ${err.message}`, 'error', {
      tool: toolName,
      durationMs: duration,
      error: err.message
    });

    return {
      success: false,
      isError: true,
      tool: toolName,
      error: err.message,
      durationMs: duration
    };
  }
}

function logMcpTrace(action, message, type = 'call', meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    message,
    type,
    meta
  };
  mcpTraceHistory.unshift(entry);
  if (mcpTraceHistory.length > 100) mcpTraceHistory.pop();
}

export function getMCPTraceLog() {
  return mcpTraceHistory;
}
