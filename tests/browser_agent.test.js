import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import { checkEligibility, runSchemeNavigator } from '../src/browser-agent/scheme-navigator.js';
import { getFarmLogEntries } from '../src/farmlog/database.js';

test('Browser Agent: Eligibility engine correctly evaluates Kerala agricultural rules', () => {
  // 1. Eligible Kuttanad Paddy Farmer
  const eligibleProfile = {
    crop: 'paddy',
    landAreaCents: 60,
    district: 'Alappuzha'
  };
  const res1 = checkEligibility(eligibleProfile, 'aims');
  assert.equal(res1.eligible, true);
  assert.equal(res1.reasonsMl.length, 0);
  assert.ok(res1.subsidyEstimateInr > 0, 'Subsidy should be calculated for eligible farmer');

  // 2. Ineligible crop (Banana)
  const ineligibleCropProfile = {
    crop: 'banana',
    landAreaCents: 100,
    district: 'Alappuzha'
  };
  const res2 = checkEligibility(ineligibleCropProfile, 'aims');
  assert.equal(res2.eligible, false);
  assert.ok(res2.reasonsMl.some(r => r.includes('നെൽക്കൃഷി ചെയ്യുന്ന കർഷകർക്ക്')));

  // 3. Ineligible area (< 20 cents)
  const smallAreaProfile = {
    crop: 'paddy',
    landAreaCents: 12,
    district: 'Palakkad'
  };
  const res3 = checkEligibility(smallAreaProfile, 'aims');
  assert.equal(res3.eligible, false);
  assert.ok(res3.reasonsMl.some(r => r.includes('കുറഞ്ഞത് 20 സെൻ്റ്')));
});

test('Browser Agent: Pre-fills portal and strictly halts at Human Confirmation Gate', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const portalUrl = `http://localhost:${port}/portal/aims`;

  try {
    const farmerData = {
      name: 'മാധവൻ നായർ (Madhavan Nair)',
      aadhaar: '9876-5432-1098',
      phone: '9847012345',
      district: 'Alappuzha',
      crop: 'paddy',
      landAreaCents: 75,
      bankAccount: '123456789012',
      ifscCode: 'SBIN0001234'
    };

    // Run WITHOUT user confirmation
    const result = await runSchemeNavigator({
      portalUrl,
      farmerData,
      farmerConfirmed: false
    });

    assert.equal(result.status, 'PENDING_FARMER_CONFIRMATION');
    assert.equal(result.requiresConfirmation, true);
    assert.ok(result.reviewData, 'Review data must be extracted');
    assert.equal(result.reviewData.farmerName, 'മാധവൻ നായർ (Madhavan Nair)');
    assert.equal(result.reviewData.aadhaar, '9876-5432-1098');
    assert.equal(result.reviewData.district, 'Alappuzha');
    assert.equal(result.reviewData.bankAccount, '123456789012');
    assert.ok(result.messageMl.includes('കർഷകന്റെ പരിശോധനയ്ക്കും സ്ഥിരീകരണത്തിനുമായി കാത്തിരിക്കുന്നു'));
  } finally {
    server.close();
  }
});

test('Browser Agent: Submits application when explicitly confirmed and persists to FarmLog', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const portalUrl = `http://localhost:${port}/portal/aims`;

  try {
    const farmerData = {
      name: 'ശ്രീകുമാർ കെ (Sreekumar K)',
      aadhaar: '3210-9876-5432',
      phone: '9446012345',
      district: 'Alappuzha',
      crop: 'paddy',
      landAreaCents: 100,
      bankAccount: '987654321098',
      ifscCode: 'SBIN0070123'
    };

    // Run WITH explicit user confirmation
    const result = await runSchemeNavigator({
      portalUrl,
      farmerData,
      farmerConfirmed: true
    });

    assert.equal(result.status, 'SUBMITTED_SUCCESS');
    assert.equal(result.requiresConfirmation, false);
    assert.ok(result.applicationId.startsWith('AIMS-KL-2026-'), 'Must have generated tracking ID');
    assert.ok(result.farmLogId, 'Must have recorded submission into FarmLog');

    // Verify FarmLog SQLite record exists
    const recentLogs = getFarmLogEntries({ limit: 5 });
    const logMatch = recentLogs.find(l => l.id === result.farmLogId);
    assert.ok(logMatch, 'FarmLog entry must be present in SQLite database');
    assert.ok(logMatch.content.includes(result.applicationId));
    assert.equal(logMatch.entry_type, 'action_confirmed');
  } finally {
    server.close();
  }
});

test('Browser Agent: HTTP Endpoints integration', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Eligibility Check
    const eligRes = await fetch(`${baseUrl}/api/schemes/check-eligibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmerProfile: { crop: 'paddy', landAreaCents: 50, district: 'Alappuzha' }
      })
    });
    assert.equal(eligRes.status, 200);
    const eligData = await eligRes.json();
    assert.equal(eligData.eligible, true);

    // 2. Navigation Endpoint with Safety Confirmation Gate
    const navRes = await fetch(`${baseUrl}/api/schemes/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portalUrl: `${baseUrl}/portal/aims`,
        farmerData: { name: 'ടെസ്റ്റ് കർഷകൻ', landAreaCents: 50 },
        farmerConfirmed: false
      })
    });
    assert.equal(navRes.status, 200);
    const navData = await navRes.json();
    assert.equal(navData.status, 'PENDING_FARMER_CONFIRMATION');
    assert.equal(navData.requiresConfirmation, true);
  } finally {
    server.close();
  }
});
