import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';

const TARGET_WIDTH = 224;
const TARGET_HEIGHT = 224;

// Standard ImageNet normalization coefficients
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

/**
 * Preprocesses an image buffer into a Float32Array tensor of shape [1, 3, 224, 224] (NCHW)
 * @param {Buffer} buffer - Image file buffer (JPEG or PNG)
 * @returns {{ tensorData: Float32Array, dims: number[], width: number, height: number, format: string }}
 */
export function preprocessImage(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid image: expected a non-empty Buffer');
  }

  if (buffer.length < 16) {
    throw new Error('Invalid image file: buffer too small or truncated');
  }

  let rawPixels;
  let width, height;
  let format = 'unknown';

  // Check magic bytes
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    // JPEG
    format = 'jpeg';
    try {
      const decoded = jpeg.decode(buffer, { useTArray: true, maxMemoryUsageInMB: 128 });
      rawPixels = decoded.data;
      width = decoded.width;
      height = decoded.height;
    } catch (err) {
      throw new Error(`Corrupted JPEG image: ${err.message}`);
    }
  } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    // PNG
    format = 'png';
    try {
      const png = PNG.sync.read(buffer);
      rawPixels = png.data;
      width = png.width;
      height = png.height;
    } catch (err) {
      throw new Error(`Corrupted PNG image: ${err.message}`);
    }
  } else {
    throw new Error('Unsupported image format. Please upload a valid JPG or PNG photograph.');
  }

  if (width < 32 || height < 32) {
    throw new Error(`Image resolution too low (${width}x${height}). Minimum required is 32x32.`);
  }

  // Resize to 224x224 with bilinear interpolation and extract NCHW Float32Array
  const tensorData = new Float32Array(1 * 3 * TARGET_WIDTH * TARGET_HEIGHT);
  const channelSize = TARGET_WIDTH * TARGET_HEIGHT;

  const xRatio = width / TARGET_WIDTH;
  const yRatio = height / TARGET_HEIGHT;

  for (let ty = 0; ty < TARGET_HEIGHT; ty++) {
    for (let tx = 0; tx < TARGET_WIDTH; tx++) {
      const srcX = Math.min(Math.floor(tx * xRatio), width - 1);
      const srcY = Math.min(Math.floor(ty * yRatio), height - 1);
      const srcIdx = (srcY * width + srcX) * 4; // RGBA

      const r = rawPixels[srcIdx] / 255.0;
      const g = rawPixels[srcIdx + 1] / 255.0;
      const b = rawPixels[srcIdx + 2] / 255.0;

      const normR = (r - MEAN[0]) / STD[0];
      const normG = (g - MEAN[1]) / STD[1];
      const normB = (b - MEAN[2]) / STD[2];

      const planeIdx = ty * TARGET_WIDTH + tx;
      tensorData[0 * channelSize + planeIdx] = normR;
      tensorData[1 * channelSize + planeIdx] = normG;
      tensorData[2 * channelSize + planeIdx] = normB;
    }
  }

  return {
    tensorData,
    dims: [1, 3, TARGET_WIDTH, TARGET_HEIGHT],
    width,
    height,
    format
  };
}
