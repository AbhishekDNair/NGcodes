import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ort from 'onnxruntime-node';
import { preprocessImage } from './image-preprocessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_PATH = path.resolve(__dirname, 'models', 'rice_disease.onnx');
const LABELS_PATH = path.resolve(__dirname, 'labels.json');

let sessionPromise = null;
let labelsData = null;

// Load labels configuration
function getLabels() {
  if (!labelsData) {
    const raw = fs.readFileSync(LABELS_PATH, 'utf-8');
    labelsData = JSON.parse(raw);
  }
  return labelsData;
}

// Get or initialize ONNX Inference Session
export async function getInferenceSession() {
  if (!sessionPromise) {
    if (!fs.existsSync(MODEL_PATH)) {
      throw new Error(`Model weights missing at ${MODEL_PATH}. Run scripts/download_model.js first.`);
    }

    sessionPromise = ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['cpu'],
      graphOptimizationLevel: 'all'
    });
  }
  return sessionPromise;
}

/**
 * Compute numerically stable Softmax over an array of logits
 * @param {Float32Array|number[]} logits
 * @returns {number[]} Probabilities summing to 1.0
 */
export function softmax(logits) {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }

  const exp = [];
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const e = Math.exp(logits[i] - max);
    exp.push(e);
    sum += e;
  }

  return exp.map(v => v / sum);
}

/**
 * Run local edge inference on a rice leaf photograph buffer
 * @param {Buffer} imageBuffer - Raw image buffer
 * @param {Object} options - Optional context parameters
 * @returns {Promise<Object>} Structured inference result
 */
export async function analyzeRiceLeaf(imageBuffer, options = {}) {
  const startTime = performance.now();
  const labels = getLabels();

  // 1. Validate and preprocess image
  const { tensorData, dims, width, height, format } = preprocessImage(imageBuffer);

  // 2. Load ONNX model session
  const session = await getInferenceSession();

  // 3. Create input tensor
  const inputTensor = new ort.Tensor('float32', tensorData, dims);

  // 4. Run genuine local inference
  const outputMap = await session.run({ images: inputTensor });
  const rawLogits = outputMap.output0.data;

  const durationMs = Math.round((performance.now() - startTime) * 10) / 10;

  // 5. Compute calibrated probabilities
  const probabilities = softmax(rawLogits);

  // 6. Map predictions to documented categories
  const rankedPredictions = [];
  for (let i = 0; i < probabilities.length; i++) {
    const classInfo = labels.classes[i.toString()] || {
      key: `unknown_${i}`,
      nameMl: 'അജ്ഞാത രോഗം',
      nameEn: `Class ${i}`,
      category: 'unknown'
    };

    rankedPredictions.push({
      classIndex: i,
      key: classInfo.key,
      nameMl: classInfo.nameMl,
      nameEn: classInfo.nameEn,
      category: classInfo.category,
      confidence: Math.round(probabilities[i] * 1000) / 1000,
      confidencePercent: Math.round(probabilities[i] * 100)
    });
  }

  // Sort descending by confidence
  rankedPredictions.sort((a, b) => b.confidence - a.confidence);

  const topPrediction = rankedPredictions[0];
  const topClassInfo = labels.classes[topPrediction.classIndex.toString()] || {};

  // 7. Calibrated Uncertainty Handling Policy
  let uncertaintyStatus = 'HIGH_CONFIDENCE_VERIFIED';
  let suggestedDecision = 'FOLLOW_VERIFIED_GUIDANCE';
  let limitationNotice = null;

  if (topPrediction.key === 'others') {
    uncertaintyStatus = 'OUT_OF_SCOPE';
    suggestedDecision = 'REFER_TO_AGRICULTURAL_EXPERT';
    limitationNotice = 'ചിത്രം നെൽച്ചെടിയുടെ രോഗബാധയുള്ള ഇലയായി തിരിച്ചറിയാൻ കഴിഞ്ഞില്ല (Image out of supported scope).';
  } else if (topPrediction.confidence < 0.40) {
    uncertaintyStatus = 'UNIDENTIFIED_LOW_CONFIDENCE';
    suggestedDecision = 'REQUEST_MORE_INFORMATION';
    limitationNotice = 'വിശ്വാസ്യത കുറവാണ്. കൂടുതൽ വെളിച്ചമുള്ളതും വ്യക്തവുമായ ഫോട്ടോ എടുക്കുക (Low confidence diagnosis).';
  } else if (topPrediction.confidence < 0.65) {
    uncertaintyStatus = 'MODERATE_CONFIDENCE_AMBIGUOUS';
    suggestedDecision = 'MONITOR_AND_REASSESS';
    limitationNotice = 'നേരിയ രോഗലക്ഷണം കാണുന്നുണ്ട്. അടുത്തുള്ള കൃഷിഭവൻ ഉദ്യോഗസ്ഥരുമായി ബന്ധപ്പെട്ട് സ്ഥിരീകരിക്കുക.';
  }

  // Build Structured Output Schema
  return {
    success: true,
    model: {
      id: labels.model.id,
      version: labels.model.version,
      architecture: labels.model.architecture,
      provenance: labels.model.provenance,
      runtime: 'Local CPU (ONNX Runtime Node)'
    },
    imageMetadata: {
      originalFormat: format,
      resolution: `${width}x${height}`,
      inputTensorShape: dims
    },
    diagnosis: {
      classIndex: topPrediction.classIndex,
      key: topPrediction.key,
      nameMl: topPrediction.nameMl,
      nameEn: topPrediction.nameEn,
      confidence: topPrediction.confidence,
      confidencePercent: topPrediction.confidencePercent,
      descriptionMl: topClassInfo.descriptionMl || '',
      descriptionEn: topClassInfo.descriptionEn || '',
      kauReference: topClassInfo.kauReference || 'KAU Package of Practices'
    },
    uncertainty: {
      status: uncertaintyStatus,
      limitationNotice,
      suggestedDecision
    },
    actionPlan: {
      actionStepsMl: topClassInfo.actionPlanMl || ['കൃഷിഭവൻ ഉദ്യോഗസ്ഥരുമായി ബന്ധപ്പെടുക.'],
      actionStepsEn: topClassInfo.actionPlanEn || ['Consult local agricultural extension officer.']
    },
    rankedAlternatives: rankedPredictions.slice(1, 4),
    inferenceLatencyMs: durationMs,
    timestamp: new Date().toISOString()
  };
}
