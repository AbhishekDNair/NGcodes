import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONFIG } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');

let defaultDbInstance = null;

/**
 * Initializes a persistent FarmLog SQLite database at the specified path
 * @param {string} [dbPath] - Database file path (defaults to CONFIG.DATABASE_PATH)
 * @returns {DatabaseSync}
 */
export function initFarmLogDB(dbPath = CONFIG.DATABASE_PATH) {
  // Ensure parent directory exists
  const parentDir = path.dirname(dbPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for high reliability
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Read and execute schema
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schemaSql);

  return db;
}

/**
 * Returns the application singleton FarmLog database instance
 * @returns {DatabaseSync}
 */
export function getFarmLogDB() {
  if (!defaultDbInstance) {
    defaultDbInstance = initFarmLogDB(CONFIG.DATABASE_PATH);
  }
  return defaultDbInstance;
}

/**
 * Validates and records a new FarmLog entry
 * @param {Object} entry
 * @param {string} [entry.cropType] - Defaults to 'rice_paddy'
 * @param {string} [entry.cropStage] - 'seedling' | 'tillering' | 'panicle' | 'ripening'
 * @param {string} entry.entryType - 'observation' | 'prediction' | 'suggested_action' | 'action_confirmed'
 * @param {string} entry.title - Short summary or label
 * @param {string} entry.content - Detailed note or diagnosis description
 * @param {Object} [entry.modelPrediction] - Model prediction object if applicable
 * @param {Object} [entry.weatherContext] - Weather conditions snapshot
 * @param {string} [entry.imageRef] - Reference to image if any
 * @param {string} [entry.source] - e.g. 'farmer_manual', 'edge_onnx_model', 'kau_rules_engine'
 * @param {DatabaseSync} [customDb] - Optional custom DB instance for testing
 * @returns {Object} Created record
 */
export function addFarmLogEntry(entry = {}, customDb = null) {
  const db = customDb || getFarmLogDB();

  if (!entry.content || typeof entry.content !== 'string' || entry.content.trim().length === 0) {
    throw new Error('FarmLog entry requires non-empty content');
  }

  const validTypes = ['observation', 'prediction', 'suggested_action', 'action_confirmed'];
  const entryType = entry.entryType || entry.entry_type || 'observation';
  if (!validTypes.includes(entryType)) {
    throw new Error(`Invalid entry_type "${entryType}". Must be one of: ${validTypes.join(', ')}`);
  }

  const cropType = entry.cropType || entry.crop_type || 'rice_paddy';
  const cropStage = entry.cropStage || entry.crop_stage || 'tillering';
  const title = (entry.title && entry.title.trim()) || (entryType === 'action_confirmed' ? 'പൂർത്തിയാക്കിയ പണി' : 'പാടത്തെ നിരീക്ഷണം');
  const content = entry.content.trim();
  const modelPrediction = entry.modelPrediction ? JSON.stringify(entry.modelPrediction) : null;
  const weatherContext = entry.weatherContext ? JSON.stringify(entry.weatherContext) : null;
  const imageRef = entry.imageRef || null;
  const source = entry.source || 'farmer_manual';
  const status = 'local_persisted';
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO farmlog_entries (
      crop_type, crop_stage, entry_type, title, content, 
      model_prediction, weather_context, image_ref, source, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    cropType, cropStage, entryType, title, content,
    modelPrediction, weatherContext, imageRef, source, status, createdAt
  );

  return {
    id: Number(info.lastInsertRowid),
    crop_type: cropType,
    crop_stage: cropStage,
    entry_type: entryType,
    title,
    content,
    model_prediction: entry.modelPrediction || null,
    weather_context: entry.weatherContext || null,
    image_ref: imageRef,
    source,
    status,
    created_at: createdAt
  };
}

/**
 * Retrieves records from FarmLog with optional filters
 * @param {Object} [filter]
 * @param {number} [filter.limit=50]
 * @param {number} [filter.offset=0]
 * @param {string} [filter.entryType]
 * @param {string} [filter.cropStage]
 * @param {DatabaseSync} [customDb]
 * @returns {Object[]}
 */
export function getFarmLogEntries(filter = {}, customDb = null) {
  const db = customDb || getFarmLogDB();
  const limit = Math.max(1, Math.min(filter.limit || 50, 200));
  const offset = Math.max(0, filter.offset || 0);

  let sql = 'SELECT * FROM farmlog_entries';
  const params = [];
  const whereClauses = [];

  if (filter.entryType) {
    whereClauses.push('entry_type = ?');
    params.push(filter.entryType);
  }
  if (filter.cropStage) {
    whereClauses.push('crop_stage = ?');
    params.push(filter.cropStage);
  }

  if (whereClauses.length > 0) {
    sql += ' WHERE ' + whereClauses.join(' AND ');
  }

  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);

  return rows.map(r => ({
    ...r,
    model_prediction: r.model_prediction ? JSON.parse(r.model_prediction) : null,
    weather_context: r.weather_context ? JSON.parse(r.weather_context) : null
  }));
}

/**
 * Confirms a farmer-executed activity (never automatically marked by system)
 * @param {Object} data
 * @param {string} data.content - What the farmer accomplished
 * @param {string} [data.cropStage]
 * @param {DatabaseSync} [customDb]
 * @returns {Object}
 */
export function confirmFarmActivity({ content, cropStage = 'tillering' }, customDb = null) {
  return addFarmLogEntry({
    entryType: 'action_confirmed',
    title: 'കർഷകൻ പൂർത്തിയാക്കിയ പണി (Confirmed Activity)',
    content,
    cropStage,
    source: 'farmer_confirmed'
  }, customDb);
}

/**
 * Returns overall farm history statistics and latest status
 * @param {DatabaseSync} [customDb]
 * @returns {Object}
 */
export function getFarmLogSummary(customDb = null) {
  const db = customDb || getFarmLogDB();

  const totalRow = db.prepare('SELECT COUNT(*) as count FROM farmlog_entries').get();
  const countsByType = db.prepare(`
    SELECT entry_type, COUNT(*) as count 
    FROM farmlog_entries 
    GROUP BY entry_type
  `).all();

  const latestRow = db.prepare('SELECT * FROM farmlog_entries ORDER BY id DESC LIMIT 1').get();

  const typeMap = {
    observation: 0,
    prediction: 0,
    suggested_action: 0,
    action_confirmed: 0
  };

  countsByType.forEach(c => {
    typeMap[c.entry_type] = Number(c.count);
  });

  return {
    totalEntries: Number(totalRow.count),
    observationsCount: typeMap.observation,
    predictionsCount: typeMap.prediction,
    suggestedActionsCount: typeMap.suggested_action,
    confirmedActivitiesCount: typeMap.action_confirmed,
    latestEntry: latestRow ? {
      ...latestRow,
      model_prediction: latestRow.model_prediction ? JSON.parse(latestRow.model_prediction) : null,
      weather_context: latestRow.weather_context ? JSON.parse(latestRow.weather_context) : null
    } : null,
    isLocalOnly: true,
    persistenceEngine: 'node:sqlite (ACID WAL Mode)'
  };
}

/**
 * Records a persistent farm disaster damage observation
 * @param {Object} data
 * @param {DatabaseSync} [customDb]
 * @returns {Object}
 */
export function addDisasterDamageRecord(data = {}, customDb = null) {
  const db = customDb || getFarmLogDB();

  if (!data.damage_description || typeof data.damage_description !== 'string' || data.damage_description.trim().length === 0) {
    throw new Error('Disaster damage record requires a description');
  }

  const locationId = data.locationId || data.location_id || 'kuttanad';
  const locationName = data.locationName || data.location_name || 'കുട്ടനാട്, ആലപ്പുഴ (Kuttanad, Alappuzha)';
  const cropType = data.cropType || data.crop_type || 'rice_paddy';
  const cropStage = data.cropStage || data.crop_stage || 'tillering';
  const disasterType = data.disasterType || data.disaster_type || 'flood';
  const damageDescription = data.damage_description.trim();
  const fieldCondition = data.fieldCondition || data.field_condition || '';
  const estimatedLossPercent = Math.min(100, Math.max(0, parseInt(data.estimatedLossPercent || data.estimated_loss_percent || 0, 10)));
  const recoveryActionTaken = data.recoveryActionTaken || data.recovery_action_taken || '';
  const photoAfter = data.photoAfter || data.photo_after || null;
  const photoBefore = data.photoBefore || data.photo_before || null;
  const observationDate = data.observationDate || data.observation_date || new Date().toISOString().split('T')[0];
  const checklistState = data.checklistState ? JSON.stringify(data.checklistState) : null;
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO disaster_damage_records (
      location_id, location_name, crop_type, crop_stage, disaster_type,
      damage_description, field_condition, estimated_loss_percent,
      recovery_action_taken, photo_after, photo_before,
      observation_date, checklist_state, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local_persisted', ?)
  `);

  const info = stmt.run(
    locationId, locationName, cropType, cropStage, disasterType,
    damageDescription, fieldCondition, estimatedLossPercent,
    recoveryActionTaken, photoAfter, photoBefore,
    observationDate, checklistState, createdAt
  );

  const recordId = Number(info.lastInsertRowid);

  // Synchronize observation into primary FarmLog
  try {
    addFarmLogEntry({
      cropType,
      cropStage,
      entryType: 'observation',
      title: `ഡിസാസ്റ്റർ നാശനഷ്ട നിരീക്ഷണം: ${disasterType.toUpperCase()}`,
      content: `[${locationName}] നാശനഷ്ടം: ${damageDescription}. പാടത്തെ അവസ്ഥ: ${fieldCondition || 'N/A'}. നഷ്ട അനുമാനം: ${estimatedLossPercent}%. പുനരുജ്ജീവന നടപടി: ${recoveryActionTaken || 'None'}.`,
      source: 'disaster_radar_farmer',
      imageRef: photoAfter ? 'disaster_photo_attached' : null
    }, db);
  } catch (syncErr) {
    console.warn('[Disaster Radar] FarmLog sync note:', syncErr.message);
  }

  return {
    id: recordId,
    location_id: locationId,
    location_name: locationName,
    crop_type: cropType,
    crop_stage: cropStage,
    disaster_type: disasterType,
    damage_description: damageDescription,
    field_condition: fieldCondition,
    estimated_loss_percent: estimatedLossPercent,
    recovery_action_taken: recoveryActionTaken,
    photo_after: photoAfter,
    photo_before: photoBefore,
    observation_date: observationDate,
    checklist_state: data.checklistState || null,
    status: 'local_persisted',
    created_at: createdAt
  };
}

/**
 * Retrieves damage records from SQLite
 * @param {Object} [filter]
 * @param {DatabaseSync} [customDb]
 * @returns {Object[]}
 */
export function getDisasterDamageRecords(filter = {}, customDb = null) {
  const db = customDb || getFarmLogDB();
  const limit = Math.max(1, Math.min(filter.limit || 50, 100));

  let sql = 'SELECT * FROM disaster_damage_records';
  const params = [];

  if (filter.locationId) {
    sql += ' WHERE location_id = ?';
    params.push(filter.locationId);
  }

  sql += ' ORDER BY id DESC LIMIT ?';
  params.push(limit);

  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);

  return rows.map(r => ({
    ...r,
    checklist_state: r.checklist_state ? JSON.parse(r.checklist_state) : null
  }));
}

/**
 * Deletes a damage record by ID
 * @param {number} id
 * @param {DatabaseSync} [customDb]
 * @returns {boolean}
 */
export function deleteDisasterDamageRecord(id, customDb = null) {
  const db = customDb || getFarmLogDB();
  const stmt = db.prepare('DELETE FROM disaster_damage_records WHERE id = ?');
  const res = stmt.run(id);
  return res.changes > 0;
}

