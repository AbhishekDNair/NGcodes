import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsDir = path.resolve(__dirname, '..', 'src', 'ml', 'models');
const sampleDir = path.resolve(__dirname, '..', 'src', 'ml', 'samples');

if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });

async function downloadFile(url, destPath) {
  console.log(`Downloading: ${url} -> ${destPath}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const arrayBuffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
  console.log(`Saved: ${destPath} (${(fs.statSync(destPath).size / (1024 * 1024)).toFixed(2)} MB)`);
}

async function main() {
  const modelUrl = 'https://huggingface.co/RaiyanKhaan/KrishokTech-Models/resolve/main/03_rice_disease/rice_disease.onnx';
  const modelPath = path.join(modelsDir, 'rice_disease.onnx');

  const sampleUrl = 'https://huggingface.co/RaiyanKhaan/KrishokTech-Models/resolve/main/sample_images/rice_sample.jpg';
  const samplePath = path.join(sampleDir, 'rice_leaf_sample.jpg');

  await downloadFile(modelUrl, modelPath);
  await downloadFile(sampleUrl, samplePath);
  console.log('All model assets downloaded successfully.');
}

main().catch(err => {
  console.error('Download failed:', err);
  process.exit(1);
});
