/**
 * Karshaka Care Request Coordinator (Lightweight Multi-Agent Orchestrator)
 * 
 * Coordinates between:
 *  - Edge ONNX Crop Classifier
 *  - Deterministic Safety Decision Engine (System 1)
 *  - Official MCP Server (FarmLog & Weather Tools)
 *  - Response Formatter (Malayalam-first, explainable, no invented facts)
 * 
 * Strict Principle:
 * A simple request stays simple. Only invoke the specific tools required.
 */

import { analyzeRiceLeaf } from '../ml/edge-classifier.js';
import { evaluateAgriculturalDecision } from '../decision-engine/rules.js';
import { adviseQuestion } from '../decision-engine/text-advisor.js';
import { invokeMCPTool } from '../mcp/client.js';
import { DECISION_OUTCOMES } from '../decision-engine/types.js';

/**
 * Orchestrates a farmer request end-to-end
 * @param {Object} req
 * @param {string} [req.question] - Text query
 * @param {string} [req.cropStage] - 'seedling' | 'tillering' | 'panicle' | 'ripening'
 * @param {string[]} [req.symptoms] - Observed symptoms
 * @param {Buffer|string} [req.image] - Buffer or Base64 string
 * @param {string} [req.location] - 'kuttanad' | 'palakkad' | 'thrissur'
 * @param {string} [req.language='ml'] - 'ml' | 'en'
 * @returns {Promise<Object>} Unified structured response with execution trace
 */
export async function coordinateRequest(req = {}) {
  const overallStart = performance.now();
  const trace = [];
  const toolsInvoked = [];

  const {
    question = '',
    cropStage = 'tillering',
    symptoms = [],
    image = null,
    location = 'kuttanad',
    language = 'ml'
  } = req;

  function addTrace(component, action, status, details = {}, durationMs = 0) {
    trace.push({
      timestamp: new Date().toISOString(),
      component,
      action,
      status,
      durationMs,
      details
    });
  }

  // 1. Intent Detection
  const intent = detectIntent({ question, image });
  addTrace('COORDINATOR', `Intent classified: "${intent}"`, 'success', { intent });

  try {
    switch (intent) {
      // -----------------------------------------------------------------
      // WORKFLOW 1: CROP IMAGE ANALYSIS + DECISION ENGINE
      // -----------------------------------------------------------------
      case 'CROP_ANALYSIS': {
        const imgStart = performance.now();
        let imgBuffer;
        if (Buffer.isBuffer(image)) {
          imgBuffer = image;
        } else if (typeof image === 'string') {
          const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
          imgBuffer = Buffer.from(cleanBase64, 'base64');
        } else {
          throw new Error('Invalid image payload provided');
        }

        // Run local ONNX inference
        const imagePrediction = await analyzeRiceLeaf(imgBuffer);
        const imgDuration = Math.round((performance.now() - imgStart) * 10) / 10;
        addTrace('EDGE_AI', 'Local ONNX image inference complete', 'success', {
          diagnosis: imagePrediction.diagnosis.key,
          confidence: imagePrediction.diagnosis.confidence,
          latencyMs: imagePrediction.inferenceLatencyMs
        }, imgDuration);

        // Fetch weather if prediction indicates disease sensitive to rain/humidity
        let weatherData = null;
        if (['brown_spot', 'leaf_blast', 'bacterial_leaf_blight'].includes(imagePrediction.diagnosis.key)) {
          const wStart = performance.now();
          toolsInvoked.push('weather_get_current');
          const wRes = await invokeMCPTool('weather_get_current', { location });
          if (wRes.success) {
            weatherData = {
              precipitationProbability: wRes.data.forecast24h?.maxPrecipitationProbability || 0,
              rainExpected: wRes.data.forecast24h?.rainImminent || false
            };
            addTrace('MCP_TOOL', 'Retrieved agro-weather context via MCP', 'success', {
              location,
              rainProb: weatherData.precipitationProbability
            }, Math.round((performance.now() - wStart) * 10) / 10);
          }
        }

        // Evaluate evidence through deterministic safety engine
        const decStart = performance.now();
        const decision = evaluateAgriculturalDecision({
          cropStage,
          farmerSymptoms: symptoms,
          imagePrediction,
          weatherData,
          farmerQuestion: question
        });
        const decDuration = Math.round((performance.now() - decStart) * 100) / 100;
        addTrace('DECISION_ENGINE', `Rule evaluated: ${decision.ruleId} -> ${decision.outcome}`, 'success', {
          outcome: decision.outcome,
          ruleId: decision.ruleId
        }, decDuration);

        const totalDuration = Math.round((performance.now() - overallStart) * 10) / 10;
        return {
          success: true,
          intent,
          toolsInvoked,
          cropStage,
          diagnosis: imagePrediction.diagnosis,
          decision,
          explanation: language === 'en' ? decision.explanationEn : decision.explanationMl,
          actionSteps: language === 'en' ? decision.actionStepsEn : decision.actionStepsMl,
          safetyAlert: language === 'en' ? decision.safetyAlertEn : decision.safetyAlertMl,
          executionTrace: trace,
          totalDurationMs: totalDuration,
          timestamp: new Date().toISOString()
        };
      }

      // -----------------------------------------------------------------
      // WORKFLOW 2: WEATHER QUERY (Weather tool via MCP only)
      // -----------------------------------------------------------------
      case 'WEATHER_QUERY': {
        const wStart = performance.now();
        toolsInvoked.push('weather_get_current');
        const wRes = await invokeMCPTool('weather_get_current', { location });
        const wDuration = Math.round((performance.now() - wStart) * 10) / 10;

        if (!wRes.success) {
          addTrace('MCP_TOOL', 'Weather tool call failed', 'failure', { error: wRes.error }, wDuration);
          throw new Error(`Weather MCP tool failed: ${wRes.error}`);
        }

        addTrace('MCP_TOOL', `Weather retrieved for ${location}`, 'success', {
          temp: wRes.data.currentConditions.temperatureC,
          rainProb: wRes.data.forecast24h.maxPrecipitationProbability
        }, wDuration);

        const cond = wRes.data.currentConditions;
        const forecast = wRes.data.forecast24h;
        const totalDuration = Math.round((performance.now() - overallStart) * 10) / 10;

        return {
          success: true,
          intent,
          toolsInvoked,
          weather: wRes.data,
          explanation: language === 'en'
            ? `Current temperature in ${wRes.data.location.nameEn} is ${cond.temperatureC}°C (${cond.relativeHumidityPercent}% humidity). ${forecast.advisoryEn}`
            : `${wRes.data.location.nameMl} മേഖലയിലെ നിലവിലെ താപനില ${cond.temperatureC}°C (ആർദ്രത: ${cond.relativeHumidityPercent}%). ${forecast.advisoryMl}`,
          actionSteps: [
            language === 'en' ? forecast.advisoryEn : forecast.advisoryMl,
            language === 'en' ? 'Check drainage channels if heavy showers occur.' : 'കനത്ത മഴയുണ്ടായാൽ പാടത്തെ ഡ്രെയിനേജ് ചാലുകൾ തുറക്കുക.'
          ],
          executionTrace: trace,
          totalDurationMs: totalDuration,
          timestamp: new Date().toISOString()
        };
      }

      // -----------------------------------------------------------------
      // WORKFLOW 3: FARMLOG HISTORY QUERY (FarmLog tool via MCP only)
      // -----------------------------------------------------------------
      case 'FARMLOG_QUERY': {
        const fStart = performance.now();
        toolsInvoked.push('farmlog_get_history');
        const fRes = await invokeMCPTool('farmlog_get_history', { limit: 10, cropStage });
        const fDuration = Math.round((performance.now() - fStart) * 10) / 10;

        if (!fRes.success) {
          addTrace('MCP_TOOL', 'FarmLog history call failed', 'failure', { error: fRes.error }, fDuration);
          throw new Error(`FarmLog MCP tool failed: ${fRes.error}`);
        }

        addTrace('MCP_TOOL', `Retrieved ${fRes.data.entriesCount} FarmLog entries`, 'success', {}, fDuration);
        const totalDuration = Math.round((performance.now() - overallStart) * 10) / 10;

        return {
          success: true,
          intent,
          toolsInvoked,
          farmlog: fRes.data,
          explanation: language === 'en'
            ? `Retrieved ${fRes.data.entriesCount} farm records. Total field logs: ${fRes.data.summary.totalEntries}.`
            : `പാടത്തെ ${fRes.data.entriesCount} മുൻകാല രേഖകൾ കണ്ടെത്തി. ആകെ രേഖകൾ: ${fRes.data.summary.totalEntries}.`,
          actionSteps: [
            language === 'en' ? 'Review confirmed farming activities before next top-dressing.' : 'അടുത്ത വളപ്രയോഗത്തിന് മുൻപ് മുൻകാല പ്രവർത്തനങ്ങൾ വിലയിരുത്തുക.'
          ],
          executionTrace: trace,
          totalDurationMs: totalDuration,
          timestamp: new Date().toISOString()
        };
      }

      // -----------------------------------------------------------------
      // WORKFLOW 4: GENERAL CONSULTATION (Advisor / System 1 Rules)
      // -----------------------------------------------------------------
      default: {
        const advStart = performance.now();
        const advice = adviseQuestion({
          question,
          cropStage,
          symptoms,
          language
        });
        const advDuration = Math.round((performance.now() - advStart) * 100) / 100;
        addTrace('TEXT_ADVISOR', `Advisor matched rule: ${advice.ruleId}`, 'success', {
          outcome: advice.outcome
        }, advDuration);

        const totalDuration = Math.round((performance.now() - overallStart) * 10) / 10;
        return {
          success: true,
          intent,
          toolsInvoked,
          decision: {
            outcome: advice.outcome,
            ruleId: advice.ruleId,
            guidanceSource: advice.reference,
            safetyAlert: advice.safetyWarning
          },
          explanation: advice.summary,
          actionSteps: advice.actionSteps,
          missingContext: advice.missingContext || [],
          executionTrace: trace,
          totalDurationMs: totalDuration,
          timestamp: new Date().toISOString()
        };
      }
    }
  } catch (err) {
    const totalDuration = Math.round((performance.now() - overallStart) * 10) / 10;
    addTrace('COORDINATOR', `Workflow failed: ${err.message}`, 'error', { error: err.message }, totalDuration);

    return {
      success: false,
      intent,
      toolsInvoked,
      error: err.message,
      executionTrace: trace,
      totalDurationMs: totalDuration,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Deterministic intent classifier
 */
function detectIntent({ question = '', image = null }) {
  if (image) {
    return 'CROP_ANALYSIS';
  }

  const q = question.toLowerCase();

  // Weather keywords
  if (q.includes('മഴ') || q.includes('കാലാവസ്ഥ') || q.includes('ചൂട്') || q.includes('weather') || q.includes('rain')) {
    // If asking about fertilizer during rain, keep as general consultation / rules
    if (!q.includes('വളം') && !q.includes('യൂറിയ') && !q.includes('fertilizer')) {
      return 'WEATHER_QUERY';
    }
  }

  // FarmLog / History keywords
  if (q.includes('മുൻപ് ചെയ്ത') || q.includes('ലോഗ്') || q.includes('ചരിത്രം') || q.includes('farmlog') || q.includes('history')) {
    return 'FARMLOG_QUERY';
  }

  return 'GENERAL_CONSULTATION';
}
