import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG = {
  APP_NAME: 'Karshaka Care (കർഷക കെയർ)',
  TAGLINE: 'Smarter farming decisions, in your language, even when connectivity is limited.',
  VERSION: '1.0.0',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  HOST: process.env.HOST || '0.0.0.0',
  ENV: process.env.NODE_ENV || 'development',
  
  // Storage paths
  ROOT_DIR: path.resolve(__dirname, '..'),
  DATA_DIR: path.resolve(__dirname, '..', 'data'),
  DATABASE_PATH: path.resolve(__dirname, '..', 'data', 'farmlog.sqlite'),
  MODELS_DIR: path.resolve(__dirname, 'ml', 'models'),
  PUBLIC_DIR: path.resolve(__dirname, 'public'),

  // Agricultural Context (Kerala Rice Cultivation)
  DEFAULT_CROP: 'നെല്ല് (Paddy/Rice)',
  SUPPORTED_CROPS: [
    { id: 'rice_paddy', nameMl: 'നെല്ല് (Paddy/Rice)', nameEn: 'Paddy/Rice' }
  ],
  FARM_LOCATIONS: [
    { id: 'kuttanad', nameMl: 'കുട്ടനാട് (Kuttanad, Alappuzha)', lat: 9.4981, lon: 76.4312 },
    { id: 'palakkad', nameMl: 'പാലക്കാട് (Palakkad)', lat: 10.7867, lon: 76.6548 },
    { id: 'thrissur', nameMl: 'തൃശ്ശൂർ കോൾനിലങ്ങൾ (Thrissur Kole)', lat: 10.5276, lon: 76.2144 }
  ],

  // System One Decision Engine Defaults
  DECISION_ENGINE: {
    FAST_EVAL_MAX_MS: 50,
    MIN_IMAGE_CONFIDENCE: 0.65,
    REFER_EXPERT_BELOW_CONFIDENCE: 0.50
  }
};
