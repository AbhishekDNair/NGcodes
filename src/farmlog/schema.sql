-- Karshaka Care Persistent FarmLog Schema (node:sqlite)

CREATE TABLE IF NOT EXISTS farmlog_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_type TEXT NOT NULL DEFAULT 'rice_paddy',
  crop_stage TEXT NOT NULL DEFAULT 'tillering',
  entry_type TEXT NOT NULL CHECK(entry_type IN ('observation', 'prediction', 'suggested_action', 'action_confirmed')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  model_prediction TEXT,
  weather_context TEXT,
  image_ref TEXT,
  source TEXT NOT NULL DEFAULT 'farmer_manual',
  status TEXT NOT NULL DEFAULT 'local_persisted' CHECK(status IN ('local_persisted', 'synchronized')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_farmlog_created_at ON farmlog_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmlog_entry_type ON farmlog_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_farmlog_crop_stage ON farmlog_entries(crop_stage);
