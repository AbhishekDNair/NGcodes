/**
 * Karshaka Care Controlled Browser Assistant: Kerala Agricultural Scheme Navigator
 * Automates eligibility checks, guided navigation, and pre-filling on AIMS / Subhiksha Keralam portals.
 * Strictly enforces an explicit Human-in-the-Loop Confirmation Gate before any government submission.
 */

import fs from 'node:fs';
import { chromium } from 'playwright-core';
import { addFarmLogEntry } from '../farmlog/database.js';

// Detect system browser executable (Chrome or Edge)
function getSystemBrowserPath() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  return null;
}

/**
 * 1. Check scheme eligibility according to Kerala Agricultural Department guidelines
 */
export function checkEligibility(farmerProfile, schemeKey = 'aims') {
  const { crop = 'paddy', landAreaCents = 50, district = 'Alappuzha' } = farmerProfile;
  const isPaddy = crop.toLowerCase().includes('paddy') || crop.toLowerCase().includes('rice') || crop.includes('നെല്ല്');
  const validLand = Number(landAreaCents) >= 20;
  const validKeralaDistrict = ['alappuzha', 'palakkad', 'thrissur', 'kottayam', 'kannur', 'ernakulam', 'malappuram'].some(
    d => district.toLowerCase().includes(d)
  );

  const eligible = isPaddy && validLand && validKeralaDistrict;
  const reasonsMl = [];
  const reasonsEn = [];

  if (!isPaddy) {
    reasonsMl.push('ഈ പദ്ധതി നെൽക്കൃഷി ചെയ്യുന്ന കർഷകർക്ക് മാത്രമുള്ളതാണ്.');
    reasonsEn.push('Scheme applies strictly to paddy cultivation.');
  }
  if (!validLand) {
    reasonsMl.push('കുറഞ്ഞത് 20 സെൻ്റ് വിസ്തീർണ്ണത്തിൽ നെൽകൃഷി ആവശ്യമാണ്.');
    reasonsEn.push('Minimum 20 cents cultivation required.');
  }
  if (!validKeralaDistrict) {
    reasonsMl.push('കേരളത്തിലെ അംഗീകൃത നെൽക്കൃഷി മേഖലകളിൽ സ്ഥിതി ചെയ്യുന്ന പാടമായിരിക്കണം.');
    reasonsEn.push('Must be an authorized Kerala rice growing district.');
  }

  // Royalty calculation: Rs. 5500 per hectare (1 hectare = 247.1 cents)
  const hectares = Number(landAreaCents) * 0.004047;
  const subsidyEstimateInr = eligible ? Math.round(hectares * 5500) : 0;

  return {
    scheme: schemeKey,
    eligible,
    schemeNameMl: 'നെൽവയൽ ഉടമസ്ഥ റോയൽറ്റി ധനസഹായം (AIMS)',
    schemeNameEn: 'Paddy Wetland Conservation Royalty Scheme (AIMS)',
    reasonsMl,
    reasonsEn,
    subsidyEstimateInr,
    guidelinesUrl: 'https://aims.kerala.gov.in'
  };
}

/**
 * 2. Automated Form Pre-fill & Controlled Navigation
 * @param {Object} options
 * @param {string} options.portalUrl - URL to the scheme portal
 * @param {Object} options.farmerData - Farmer application data
 * @param {boolean} options.farmerConfirmed - Explicit human confirmation flag
 */
export async function runSchemeNavigator({
  portalUrl,
  farmerData = {},
  farmerConfirmed = false
}) {
  const executablePath = getSystemBrowserPath();
  if (!executablePath) {
    throw new Error('System browser executable (Chrome/Edge) not found for Playwright automation.');
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();

  try {
    // 1. Navigate to Scheme Portal
    await page.goto(portalUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // 2. Pre-fill Form Fields
    await page.fill('#farmer-name', farmerData.name || 'രാഘവൻ പിള്ള (Raghavan Pillai)');
    await page.fill('#farmer-aadhaar', farmerData.aadhaar || '5421-9876-1234');
    await page.fill('#farmer-phone', farmerData.phone || '9447123456');
    await page.selectOption('#district-select', farmerData.district || 'Alappuzha');
    await page.selectOption('#crop-type', farmerData.crop || 'paddy');
    await page.fill('#land-area-cents', String(farmerData.landAreaCents || 50));
    await page.fill('#bank-account', farmerData.bankAccount || '67123456789');
    await page.fill('#ifsc-code', farmerData.ifscCode || 'SBIN0070084');

    // 3. Move to Review Screen
    await page.click('#btn-goto-review');
    await page.waitForSelector('#section-review:not(.hidden)', { timeout: 5000 });

    // 4. Capture Review Snapshot from DOM
    const reviewData = {
      farmerName: await page.textContent('#rev-farmer-name'),
      aadhaar: await page.textContent('#rev-farmer-aadhaar'),
      district: await page.textContent('#rev-district'),
      crop: await page.textContent('#rev-crop'),
      landArea: await page.textContent('#rev-land-area'),
      bankAccount: await page.textContent('#rev-bank-account'),
      ifsc: await page.textContent('#rev-ifsc')
    };

    // 5. SAFETY GATE: Enforce Explicit Farmer Confirmation
    if (!farmerConfirmed) {
      await browser.close();
      return {
        status: 'PENDING_FARMER_CONFIRMATION',
        requiresConfirmation: true,
        messageMl: 'വിവരങ്ങൾ പൂരിപ്പിച്ചു. കർഷകന്റെ പരിശോധനയ്ക്കും സ്ഥിരീകരണത്തിനുമായി കാത്തിരിക്കുന്നു.',
        messageEn: 'Application pre-filled. Awaiting explicit farmer confirmation before submission.',
        reviewData
      };
    }

    // 6. Farmer Confirmed: Complete Official Submission
    await page.check('#farmer-confirmation-checkbox');
    await page.click('#btn-final-submit');
    await page.waitForSelector('#section-success:not(.hidden)', { timeout: 5000 });

    const applicationId = (await page.textContent('#application-ref-id')).trim();

    // 7. Persist to FarmLog SQLite for Farmer's Records
    const logEntry = addFarmLogEntry({
      entry_type: 'action_confirmed',
      crop_stage: 'tillering',
      content: `AIMS കാർഷിക റോയൽറ്റി ധനസഹായ അപേക്ഷ സമർപ്പിച്ചു. അപേക്ഷാ നമ്പർ: ${applicationId}. സ്ഥലം: ${reviewData.district}, വിസ്തീർണ്ണം: ${reviewData.landArea}.`,
      source: 'aims_browser_agent',
      metadata: {
        applicationId,
        scheme: 'aims_paddy_royalty',
        farmerName: reviewData.farmerName,
        submittedAt: new Date().toISOString()
      }
    });

    await browser.close();

    return {
      status: 'SUBMITTED_SUCCESS',
      requiresConfirmation: false,
      applicationId,
      messageMl: 'AIMS അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു. രേഖകൾ ഫാം ലോഗിൽ രേഖപ്പെടുത്തി.',
      messageEn: 'AIMS application successfully submitted and logged into FarmLog.',
      reviewData,
      farmLogId: logEntry.id
    };

  } catch (err) {
    await browser.close();
    throw err;
  }
}
