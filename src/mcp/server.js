/**
 * Karshaka Care Official MCP Server
 * Exposes FarmLog and Weather tools through the standard Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { FARMLOG_TOOL_DEFINITIONS, executeFarmLogTool } from './tools/farmlog-tools.js';
import { WEATHER_TOOL_DEFINITIONS, executeWeatherTool } from './tools/weather-tools.js';

export const ALL_TOOLS = [
  ...FARMLOG_TOOL_DEFINITIONS,
  ...WEATHER_TOOL_DEFINITIONS
];

/**
 * Creates and configures an official MCP Server instance
 * @returns {Server}
 */
export function createKarshakaCareServer() {
  const server = new Server(
    {
      name: 'karshaka-care-mcp-server',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // 1. Tool Discovery Protocol Handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: ALL_TOOLS
    };
  });

  // 2. Tool Invocation Protocol Handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;
      if (name.startsWith('farmlog_')) {
        result = await executeFarmLogTool(name, args || {});
      } else if (name.startsWith('weather_')) {
        result = await executeWeatherTool(name, args || {});
      } else {
        throw new Error(`Tool "${name}" not found on Karshaka Care MCP Server`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result)
          }
        ]
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            })
          }
        ]
      };
    }
  });

  return server;
}

// Stdio standalone runner (for CLI or external orchestrators)
if (process.argv.includes('--stdio')) {
  import('@modelcontextprotocol/sdk/server/stdio.js').then(async ({ StdioServerTransport }) => {
    const server = createKarshakaCareServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[Karshaka Care MCP Server] Running via stdio transport.');
  });
}
