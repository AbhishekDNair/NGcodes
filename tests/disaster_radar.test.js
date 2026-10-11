import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getDisasterAlerts, 
  getDisasterActionPlan, 
  recordFarmDamage, 
  getSavedDamageRecords, 
  removeDamageRecord,
  DISASTER_LOCATIONS,
  OFFICIAL_DISASTER_PORTALS 
} from '../src/disaster-radar/radar.js';

test('Disaster Radar: Default location is Kuttanad, Alappuzha with low-lying polder vulnerability', () => {
  assert.ok(DISASTER_LOCATIONS.kuttanad);
  assert.strictEqual(DISASTER_LOCATIONS.kuttanad.district, 'Alappuzha');
  assert.strictEqual(DISASTER_LOCATIONS.kuttanad.lat, 9.5008);
  assert.strictEqual(DISASTER_LOCATIONS.kuttanad.lon, 76.4526);
  assert.ok(DISASTER_LOCATIONS.kuttanad.vulnerabilityEn.includes('Low-lying polders'));
});

test('Disaster Radar: Retrieves official alerts or honest all-clear without fabricating live warnings', async () => {
  const result = await getDisasterAlerts({ locationId: 'kuttanad', isDemo: false });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.location.id, 'kuttanad');
  assert.strictEqual(result.isDemo, false);
  assert.ok(Array.isArray(result.activeAlerts));
  assert.ok(Array.isArray(result.officialLinks));
  assert.ok(result.statusNoteEn.length > 0);
  assert.ok(result.statusNoteMl.length > 0);
  
  // Official links should include KSDMA, SACHET, and IMD
  const hasKsdma = result.officialLinks.some(l => l.url.includes('sdma.kerala.gov.in'));
  const hasSachet = result.officialLinks.some(l => l.url.includes('sachet.ndma.gov.in'));
  assert.ok(hasKsdma, 'Must provide official KSDMA link');
  assert.ok(hasSachet, 'Must provide official SACHET link');
});

test('Disaster Radar: Demonstration mode provides explicitly labeled drill alert', async () => {
  const result = await getDisasterAlerts({ locationId: 'kuttanad', isDemo: true });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.isDemo, true);
  assert.strictEqual(result.activeAlerts.length, 1);
  const alert = result.activeAlerts[0];
  assert.strictEqual(alert.isDemo, true);
  assert.ok(alert.demoBadge.includes('DEMONSTRATION ALERT'));
  assert.strictEqual(alert.disasterType, 'flood');
  assert.strictEqual(alert.warningLevel, 'Orange Warning');
  assert.ok(alert.scopeEn.includes('Alappuzha District'));
});

test('Disaster Radar: Action engine enforces Safety First and provides prioritized practical actions', () => {
  const floodPlan = getDisasterActionPlan({ hazard: 'flood', locationId: 'kuttanad' });
  assert.strictEqual(floodPlan.success, true);
  assert.ok(floodPlan.safetyFirstWarningEn.includes('SAFETY FIRST'));
  assert.ok(floodPlan.actions.length >= 3);
  
  const criticalAction = floodPlan.actions.find(a => a.priority === 'critical');
  assert.ok(criticalAction, 'Must have a critical priority action');
  assert.ok(criticalAction.titleEn.includes('evacuation') || criticalAction.titleEn.includes('sirens'));
  assert.ok(criticalAction.whyEn.length > 0);
  assert.ok(criticalAction.whenEn.length > 0);
  assert.ok(criticalAction.titleMl.length > 0);
});

test('Disaster Radar: Handles multiple hazard types (lightning, wind, heatwave)', () => {
  const lightningPlan = getDisasterActionPlan({ hazard: 'lightning', locationId: 'kuttanad' });
  assert.ok(lightningPlan.actions.some(a => a.titleEn.includes('exit open waterlogged fields')));

  const windPlan = getDisasterActionPlan({ hazard: 'wind', locationId: 'kuttanad' });
  assert.ok(windPlan.actions.some(a => a.id.includes('wind')));

  const heatwavePlan = getDisasterActionPlan({ hazard: 'heatwave', locationId: 'palakkad' });
  assert.ok(heatwavePlan.actions.some(a => a.id.includes('heat')));
});

test('Disaster Radar: Persists farm damage records in SQLite and synchronizes to FarmLog', () => {
  const testRecord = {
    location_id: 'kuttanad',
    location_name: 'Kuttanad (Moncompu), Alappuzha',
    crop_type: 'rice_paddy',
    crop_stage: 'tillering',
    disaster_type: 'flood',
    damage_description: 'Ring bund breached; standing water 45 cm for 3 days.',
    field_condition: 'Complete submergence of lower polder',
    estimated_loss_percent: 50,
    recovery_action_taken: 'Dewatering pump motor moved to engine thara',
    observation_date: '2026-10-11'
  };

  const created = recordFarmDamage(testRecord);
  assert.ok(created.id > 0);
  assert.strictEqual(created.disaster_type, 'flood');
  assert.strictEqual(created.estimated_loss_percent, 50);

  // Retrieve records
  const records = getSavedDamageRecords({ locationId: 'kuttanad' });
  assert.ok(records.length > 0);
  const found = records.find(r => r.id === created.id);
  assert.ok(found);
  assert.strictEqual(found.damage_description, testRecord.damage_description);

  // Clean up
  const deleted = removeDamageRecord(created.id);
  assert.strictEqual(deleted, true);
});

test('Disaster Radar: HTTP REST Endpoints integration', async () => {
  // 1. Alerts endpoint
  const alertRes = await fetch('http://localhost:3000/api/disaster/alerts?location=kuttanad');
  assert.strictEqual(alertRes.status, 200);
  const alertData = await alertRes.json();
  assert.strictEqual(alertData.success, true);

  // 2. Actions endpoint
  const actionRes = await fetch('http://localhost:3000/api/disaster/actions?hazard=flood&location=kuttanad');
  assert.strictEqual(actionRes.status, 200);
  const actionData = await actionRes.json();
  assert.strictEqual(actionData.success, true);
  assert.ok(actionData.actions.length > 0);

  // 3. Locations endpoint
  const locRes = await fetch('http://localhost:3000/api/disaster/locations');
  assert.strictEqual(locRes.status, 200);
  const locData = await locRes.json();
  assert.strictEqual(locData.success, true);
  assert.ok(locData.locations.length >= 4);

  // 4. Recovery CRUD endpoints
  const createRes = await fetch('http://localhost:3000/api/disaster/recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location_id: 'kuttanad',
      location_name: 'Kuttanad, Alappuzha',
      crop_type: 'rice_paddy',
      crop_stage: 'tillering',
      disaster_type: 'wind_lodging',
      damage_description: 'Severe squall lodged 30% of mature tillers into standing water.',
      field_condition: 'Lodged paddy crop',
      estimated_loss_percent: 30,
      recovery_action_taken: 'Bundled lodged stems upright with twine',
      observation_date: '2026-10-11'
    })
  });
  assert.strictEqual(createRes.status, 201);
  const createdBody = await createRes.json();
  assert.strictEqual(createdBody.success, true);
  const newId = createdBody.record.id;

  // Fetch list
  const listRes = await fetch('http://localhost:3000/api/disaster/recovery?location=kuttanad');
  assert.strictEqual(listRes.status, 200);
  const listBody = await listRes.json();
  assert.ok(listBody.records.some(r => r.id === newId));

  // Delete
  const delRes = await fetch(`http://localhost:3000/api/disaster/recovery/${newId}`, { method: 'DELETE' });
  assert.strictEqual(delRes.status, 200);
  const delBody = await delRes.json();
  assert.strictEqual(delBody.deleted, true);
});
