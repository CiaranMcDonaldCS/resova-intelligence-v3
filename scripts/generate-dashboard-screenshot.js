const puppeteer = require('puppeteer');
const path = require('path');

async function generateDashboardScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport to a standard desktop size
    await page.setViewport({
      width: 1400,
      height: 900,
      deviceScaleFactor: 2, // High DPI for crisp screenshot
    });

    console.log('Setting up authentication data...');
    // Set up localStorage data before navigating to dashboard
    await page.evaluateOnNewDocument(() => {
      // Mock config data
      const mockConfig = {
        resovaApiKey: 'mock-api-key',
        resovaDatacenter: 'US',
        claudeApiKey: 'mock-claude-key',
        activityTypes: ['Adventure Tours', 'Water Sports', 'Cultural Experiences'],
        businessName: 'Demo Venue',
        timezone: 'America/New_York',
        currency: 'USD',
        isComplete: true
      };

      localStorage.setItem('resova-intelligence-config', JSON.stringify(mockConfig));
    });

    console.log('Navigating to dashboard...');
    // Navigate to the dashboard page (assuming it's running on localhost:3000)
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit for any animations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, '../public/dashboard-preview.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: false, // Just capture the viewport
      type: 'png'
    });

    console.log(`Screenshot saved to: ${screenshotPath}`);
  } catch (error) {
    console.error('Error generating screenshot:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

generateDashboardScreenshot()
  .then(() => {
    console.log('Screenshot generated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to generate screenshot:', error);
    process.exit(1);
  });
