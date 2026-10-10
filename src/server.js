import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { CONFIG } from './config.js';
import { adviseQuestion } from './decision-engine/text-advisor.js';
import { analyzeRiceLeaf } from './ml/edge-classifier.js';
import { evaluateAgriculturalDecision } from './decision-engine/rules.js';
import { addFarmLogEntry, getFarmLogEntries, getFarmLogSummary, confirmFarmActivity } from './farmlog/database.js';
import { discoverMCPTools, invokeMCPTool, getMCPTraceLog } from './mcp/client.js';
import { coordinateRequest } from './orchestrator/coordinator.js';
import { checkEligibility, runSchemeNavigator } from './browser-agent/scheme-navigator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure data directory exists
if (!fs.existsSync(CONFIG.DATA_DIR)) {
  fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Assets
app.use(express.static(CONFIG.PUBLIC_DIR));

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Karshaka Care Core Engine',
    appName: CONFIG.APP_NAME,
    version: CONFIG.VERSION,
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Malayalam Agricultural Query Endpoint
app.post('/api/query', (req, res) => {
  try {
    const { question, cropStage, symptoms, language } = req.body;
    const advice = adviseQuestion({ question, cropStage, symptoms, language });
    res.json({
      success: advice.success,
      query: question,
      language: language || 'ml',
      data: advice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Query processing failed',
      message: error.message
    });
  }
});

// Edge Crop Analysis Endpoint (Local ONNX Model Inference)
app.post('/api/analyze-crop', async (req, res) => {
  try {
    const { image, imageBase64 } = req.body;
    const rawData = image || imageBase64;
    if (!rawData) {
      return res.status(400).json({
        success: false,
        error: 'Missing image payload. Please provide image as base64 string.'
      });
    }

    // Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
    const cleanBase64 = rawData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const result = await analyzeRiceLeaf(buffer);
    res.json(result);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Inference failed',
      message: err.message
    });
  }
});

// Deterministic Decision Engine Endpoint (System 1 Safety Evaluation)
app.post('/api/evaluate-decision', (req, res) => {
  try {
    const evidence = req.body || {};
    const decision = evaluateAgriculturalDecision(evidence);
    res.json({
      success: true,
      decision
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Decision evaluation failed',
      message: err.message
    });
  }
});

// FarmLog History and Summary Endpoint
app.get('/api/farmlog', (req, res) => {
  try {
    const summary = getFarmLogSummary();
    const entries = getFarmLogEntries({
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
      entryType: req.query.entryType,
      cropStage: req.query.cropStage
    });

    res.json({
      success: true,
      summary,
      entries
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve FarmLog entries',
      message: err.message
    });
  }
});

// FarmLog Record New Entry Endpoint
app.post('/api/farmlog', (req, res) => {
  try {
    const entryData = req.body || {};
    const created = addFarmLogEntry(entryData);
    res.status(201).json({
      success: true,
      entry: created
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Failed to record FarmLog entry',
      message: err.message
    });
  }
});

// FarmLog Confirm Activity Endpoint
app.post('/api/farmlog/confirm', (req, res) => {
  try {
    const { content, cropStage } = req.body || {};
    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Missing activity content description'
      });
    }

    const created = confirmFarmActivity({ content, cropStage });
    res.status(201).json({
      success: true,
      entry: created
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Failed to confirm farm activity',
      message: err.message
    });
  }
});

// MCP Tool Discovery Endpoint
app.get('/api/mcp/tools', async (req, res) => {
  try {
    const tools = await discoverMCPTools();
    res.json({
      success: true,
      protocol: 'Model Context Protocol (MCP) 1.0',
      toolsCount: tools.length,
      tools
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'MCP tool discovery failed',
      message: err.message
    });
  }
});

// MCP Tool Execution Endpoint
app.post('/api/mcp/call', async (req, res) => {
  try {
    const { name, arguments: args } = req.body || {};
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required MCP tool name'
      });
    }

    const result = await invokeMCPTool(name, args || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'MCP tool invocation failed',
      message: err.message
    });
  }
});

// MCP Live Trace Log Endpoint
app.get('/api/mcp/traces', (req, res) => {
  res.json({
    success: true,
    traces: getMCPTraceLog()
  });
});

// Request Coordinator Endpoint (Multi-Agent Orchestrator)
app.post('/api/orchestrate', async (req, res) => {
  try {
    const result = await coordinateRequest(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Orchestration failed',
      message: err.message
    });
  }
});

// Serve Mock Kerala Agricultural Scheme Portal
app.get('/portal/aims', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'browser-agent', 'demo-portal', 'aims-portal.html'));
});

// Check Scheme Eligibility Endpoint
app.post('/api/schemes/check-eligibility', (req, res) => {
  try {
    const { farmerProfile, scheme } = req.body || {};
    const result = checkEligibility(farmerProfile || {}, scheme || 'aims');
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Eligibility check failed',
      message: err.message
    });
  }
});

// Controlled Browser Assistant: Pre-fill & Submit Gate
app.post('/api/schemes/navigate', async (req, res) => {
  try {
    const { farmerData, farmerConfirmed, portalUrl } = req.body || {};
    const serverPort = req.socket.localPort || CONFIG.PORT;
    const targetUrl = portalUrl || `http://localhost:${serverPort}/portal/aims`;

    const result = await runSchemeNavigator({
      portalUrl: targetUrl,
      farmerData: farmerData || {},
      farmerConfirmed: Boolean(farmerConfirmed)
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Scheme browser automation failed',
      message: err.message
    });
  }
});

// System Status and Capabilities Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    version: CONFIG.VERSION,
    environment: CONFIG.ENV,
    supportedCrops: CONFIG.SUPPORTED_CROPS,
    defaultLocation: CONFIG.FARM_LOCATIONS[0],
    capabilities: {
      malayalamFirstUI: true,
      edgeInference: true,
      systemOneDecisionEngine: true,
      farmlogPersistence: true,
      mcpIntegration: true,
      browserAssistant: true,
      voiceMalayalam: true,
      offlineCapable: true
    },
    verificationNotes: {
      systemOneJevStatus: 'IMPLEMENTED_AS_DETERMINISTIC_RULES_PENDING_ORGANIZER_CLARIFICATION'
    },
    timestamp: new Date().toISOString()
  });
});

// Root fallback for SPA/PWA
app.get('/', (req, res) => {
  res.sendFile(path.join(CONFIG.PUBLIC_DIR, 'index.html'));
});

// Helper to start the server
export function startServer(port = CONFIG.PORT, host = CONFIG.HOST) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      console.log(`[Karshaka Care] Server listening at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

// Direct execution check
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution) {
  startServer().catch((err) => {
    console.error('[Karshaka Care] Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
