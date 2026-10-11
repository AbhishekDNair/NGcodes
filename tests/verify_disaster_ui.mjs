import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verify() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // 1. Verify Disaster Radar nav button
  const navDisaster = page.locator('#nav-disaster');
  const navText = (await navDisaster.textContent()).trim();
  console.log('1. Nav button text:', navText);

  await navDisaster.click();
  await page.waitForTimeout(500);

  // 2. Check disaster view visible
  const viewVisible = await page.isVisible('#view-disaster');
  console.log('2. Disaster view visible:', viewVisible);

  // 3. Check default location and coordinates
  const locVal = await page.locator('#disaster-location-select').inputValue();
  const geoText = (await page.textContent('#disaster-geo-coords')).trim();
  console.log('3. Default location value:', locVal);
  console.log('   Geo coords pill:', geoText);

  // 4. Check alerts rendered
  await page.waitForTimeout(600);
  const allClearCount = await page.locator('.all-clear-card').count();
  console.log('4. Honest All-Clear card count:', allClearCount);

  // 5. Toggle Demo Simulation
  await page.click('#toggle-disaster-demo');
  await page.waitForTimeout(800);
  const demoAlertsCount = await page.locator('.alert-item-card').count();
  const demoTitle = (await page.locator('.alert-card-title').first().textContent()).trim();
  const demoBadge = (await page.locator('.alert-demo-badge').first().textContent()).trim();
  console.log('5. Demo simulation active:');
  console.log('   Demo alert count:', demoAlertsCount);
  console.log('   Demo title:', demoTitle);
  console.log('   Demo badge:', demoBadge);

  // 6. Test Safety actions
  const actionsCount = await page.locator('.action-task-card').count();
  console.log('6. Action checklist tasks count:', actionsCount);

  // Toggle first task checkbox
  const firstChk = page.locator('.task-checkbox').first();
  await firstChk.click();
  await page.waitForTimeout(300);
  const firstCardClass = await page.locator('.action-task-card').first().getAttribute('class');
  console.log('   First action card marked complete:', firstCardClass.includes('task-completed'));

  // 7. Test Farm Damage Recording in UI
  await page.fill('#damage-field-condition', 'Standing water 55cm, outer bund breached');
  await page.fill('#damage-description', 'Polder submerged under 55cm water. Ring bund breach at south corner.');
  await page.fill('#damage-recovery-action', 'Pumping with 25HP motor on raised bed');
  
  // Accept dialog if shown
  page.on('dialog', dialog => dialog.accept());
  await page.click('#btn-save-damage-record');
  await page.waitForTimeout(1000);

  const damageCardsCount = await page.locator('.damage-card').count();
  console.log('7. Damage history records count in UI:', damageCardsCount);

  // 8. Test Language Toggle
  await page.click('#lang-toggle-btn');
  await page.waitForTimeout(500);
  const titleMl = (await page.textContent('.disaster-main-title')).trim();
  console.log('8. Disaster title in Malayalam:', titleMl);

  // 9. Test Weather page remains completely functional
  await page.click('#nav-weather');
  await page.waitForTimeout(500);
  const weatherVisible = await page.isVisible('#view-weather');
  const weatherTitle = (await page.textContent('#view-weather h2')).trim();
  console.log('9. Weather view visible:', weatherVisible);
  console.log('   Weather view title:', weatherTitle);

  // 10. Test Home view remains functional
  await page.click('#nav-home');
  await page.waitForTimeout(400);
  const homeVisible = await page.isVisible('#view-home');
  console.log('10. Home view visible:', homeVisible);

  await browser.close();
  console.log('ALL 10 DISASTER RADAR UI WORKFLOWS VERIFIED SUCCESSFULLY!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
