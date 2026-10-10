/**
 * Karshaka Care MCP Tools: FarmLog
 * Official Model Context Protocol Tool Definitions for FarmLog Operations
 */

import { addFarmLogEntry, getFarmLogEntries, getFarmLogSummary, confirmFarmActivity } from '../../farmlog/database.js';

export const FARMLOG_TOOL_DEFINITIONS = [
  {
    name: 'farmlog_get_history',
    description: 'Retrieve persisted farm observation history and activity summary for the rice field.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of recent entries to retrieve (default: 10, max: 50)'
        },
        entryType: {
          type: 'string',
          enum: ['observation', 'prediction', 'suggested_action', 'action_confirmed'],
          description: 'Filter entries by specific type'
        },
        cropStage: {
          type: 'string',
          enum: ['seedling', 'tillering', 'panicle', 'ripening'],
          description: 'Filter entries by crop growth stage'
        }
      }
    }
  },
  {
    name: 'farmlog_record_observation',
    description: 'Record a new farmer-entered field observation or model prediction into persistent memory.',
    inputSchema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          description: 'Detailed description of the observed leaf condition or farming observation'
        },
        cropStage: {
          type: 'string',
          enum: ['seedling', 'tillering', 'panicle', 'ripening'],
          description: 'Current crop growth stage'
        },
        entryType: {
          type: 'string',
          enum: ['observation', 'prediction', 'suggested_action'],
          description: 'Type of entry (defaults to observation)'
        },
        title: {
          type: 'string',
          description: 'Short headline for the entry'
        },
        source: {
          type: 'string',
          description: 'Origin of information (e.g. farmer_manual, edge_onnx_model)'
        }
      }
    }
  },
  {
    name: 'farmlog_confirm_activity',
    description: 'Record an explicit farmer-confirmed agricultural activity that was physically completed.',
    inputSchema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: {
          type: 'string',
          description: 'Action confirmed by the farmer (e.g. drained water, applied potash, cleared weeds)'
        },
        cropStage: {
          type: 'string',
          enum: ['seedling', 'tillering', 'panicle', 'ripening'],
          description: 'Crop growth stage during activity completion'
        }
      }
    }
  }
];

export async function executeFarmLogTool(toolName, args = {}) {
  switch (toolName) {
    case 'farmlog_get_history': {
      const summary = getFarmLogSummary();
      const entries = getFarmLogEntries({
        limit: args.limit || 10,
        entryType: args.entryType,
        cropStage: args.cropStage
      });
      return {
        success: true,
        summary,
        entriesCount: entries.length,
        entries
      };
    }

    case 'farmlog_record_observation': {
      const created = addFarmLogEntry({
        content: args.content,
        cropStage: args.cropStage || 'tillering',
        entryType: args.entryType || 'observation',
        title: args.title || 'പാടത്തെ നിരീക്ഷണം',
        source: args.source || 'mcp_farmlog_tool'
      });
      return {
        success: true,
        message: 'FarmLog entry recorded successfully via MCP',
        entry: created
      };
    }

    case 'farmlog_confirm_activity': {
      const created = confirmFarmActivity({
        content: args.content,
        cropStage: args.cropStage || 'tillering'
      });
      return {
        success: true,
        message: 'Farmer activity confirmed and logged via MCP',
        entry: created
      };
    }

    default:
      throw new Error(`Unknown FarmLog tool: ${toolName}`);
  }
}
