import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../src/server.js';
import { preprocessImage } from '../src/ml/image-preprocessor.js';
import { analyzeRiceLeaf, softmax, getInferenceSession } from '../src/ml/edge-classifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_IMAGE_PATH = path.resolve(__dirname, '..', 'src', 'ml', 'samples', 'rice_leaf_sample.jpg');

test('Edge AI: ONNX inference session loads successfully', async () => {
  const session = await getInferenceSession();
  assert.ok(session, 'Inference session must be initialized');
  assert.deepEqual(session.inputNames, ['images']);
  assert.deepEqual(session.outputNames, ['output0']);
});

test('Edge AI: Softmax normalizes logits into valid probability distribution', () => {
  const logits = [2.5, -1.0, 0.5, 4.2, -0.3, 1.1, 0.0, -2.1, 3.0, 0.2];
  const probs = softmax(logits);

  assert.equal(probs.length, logits.length);
  const sum = probs.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-5, `Sum of probabilities must equal 1.0, got ${sum}`);
  probs.forEach(p => {
    assert.ok(p >= 0 && p <= 1.0, `Each probability must be in [0, 1], got ${p}`);
  });
  // Highest logit (index 3 with 4.2) should have highest probability
  const maxIdx = probs.indexOf(Math.max(...probs));
  assert.equal(maxIdx, 3);
});

test('Edge AI: Preprocessor decodes JPEG, resizes to 224x224 and normalizes', () => {
  assert.ok(fs.existsSync(SAMPLE_IMAGE_PATH), 'Sample rice leaf image must exist');
  const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);

  const preprocessed = preprocessImage(buffer);
  assert.equal(preprocessed.format, 'jpeg');
  assert.deepEqual(preprocessed.dims, [1, 3, 224, 224]);
  assert.equal(preprocessed.tensorData.length, 1 * 3 * 224 * 224);
  assert.ok(preprocessed.tensorData instanceof Float32Array);
});

test('Edge AI: Preprocessor safely rejects corrupted or unsupported buffers', () => {
  assert.throws(() => {
    preprocessImage(Buffer.from('not an image at all'));
  }, /Unsupported image format/);

  assert.throws(() => {
    preprocessImage(Buffer.from([]));
  }, /Invalid image/);

  assert.throws(() => {
    // Truncated JPEG magic
    preprocessImage(Buffer.from([0xFF, 0xD8, 0x00, 0x01]));
  }, /buffer too small|Corrupted JPEG image/);
});

test('Edge AI: Genuine local inference runs on rice leaf image with latency instrumentation', async () => {
  const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);
  const result = await analyzeRiceLeaf(buffer);

  assert.equal(result.success, true);
  assert.ok(result.inferenceLatencyMs > 0, 'Inference latency must be measured and positive');
  assert.ok(result.inferenceLatencyMs < 2500, `Inference should be fast on edge CPU, was ${result.inferenceLatencyMs}ms`);

  // Verify diagnosis schema
  assert.equal(typeof result.diagnosis.classIndex, 'number');
  assert.equal(typeof result.diagnosis.key, 'string');
  assert.equal(typeof result.diagnosis.nameMl, 'string');
  assert.ok(result.diagnosis.confidence >= 0 && result.diagnosis.confidence <= 1.0);
  assert.ok(result.diagnosis.kauReference.includes('KAU'));

  // Verify uncertainty fields
  assert.ok(['HIGH_CONFIDENCE_VERIFIED', 'MODERATE_CONFIDENCE_AMBIGUOUS', 'UNIDENTIFIED_LOW_CONFIDENCE', 'OUT_OF_SCOPE'].includes(result.uncertainty.status));

  // Verify ranked alternatives
  assert.equal(result.rankedAlternatives.length, 3);
  assert.ok(result.rankedAlternatives[0].confidence <= result.diagnosis.confidence);
});

test('Edge AI: POST /api/analyze-crop integration endpoint', async () => {
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    const res = await fetch(`${baseUrl}/api/analyze-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.model.id, 'krishivaani-rice-mobilenet-onnx');
    assert.ok(body.diagnosis.nameMl);
    assert.ok(body.inferenceLatencyMs > 0);

    // Invalid body check
    const invalidRes = await fetch(`${baseUrl}/api/analyze-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(invalidRes.status, 400);
  } finally {
    server.close();
  }
});
