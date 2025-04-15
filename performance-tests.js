const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Define the admin pages to test
const PAGES = [
  {
    name: 'login',
    url: 'http://localhost:4200/admin/login',
    authenticated: false
  },
  {
    name: 'dashboard',
    url: 'http://localhost:4200/admin/dashboard',
    authenticated: true
  },
  {
    name: 'products',
    url: 'http://localhost:4200/admin/products',
    authenticated: true
  },
  {
    name: 'orders',
    url: 'http://localhost:4200/admin/orders',
    authenticated: true
  }
];

// Login credentials for authenticated pages
const USERNAME = 'admin';
const PASSWORD = 'adminpassword';

// Performance thresholds
const THRESHOLDS = {
  performance: 80,
  accessibility: 90,
  'best-practices': 85,
  seo: 80,
  pwa: 50
};

// Run all tests
async function runTests() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });

  const options = {
    logLevel: 'error',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port
  };

  // Create results directory if it doesn't exist
  const resultsDir = path.join(__dirname, 'lighthouse-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  let token = null;

  // Run tests for each page
  for (const page of PAGES) {
    // Login if page requires authentication and we don't have a token yet
    if (page.authenticated && !token) {
      console.log('Logging in to obtain authentication token...');
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: USERNAME, password: PASSWORD })
      });
      
      if (response.ok) {
        const data = await response.json();
        token = data.token;
        console.log('Logged in successfully');
      } else {
        console.error('Failed to login for authenticated tests');
        process.exit(1);
      }
    }

    console.log(`Running Lighthouse on ${page.name}...`);
    
    // Set up cookies for authentication if needed
    const extraHeaders = page.authenticated && token ? {
      Cookie: `auth-token=${token}`
    } : {};
    
    // Run Lighthouse
    const runnerResult = await lighthouse(page.url, { ...options, extraHeaders });
    const reportHtml = runnerResult.report;
    const lhr = runnerResult.lhr;

    // Save report
    fs.writeFileSync(path.join(resultsDir, `${page.name}-report.html`), reportHtml);
    
    // Log scores
    console.log(`Scores for ${page.name}:`);
    console.log('Performance:', lhr.categories.performance.score * 100);
    console.log('Accessibility:', lhr.categories.accessibility.score * 100);
    console.log('Best Practices:', lhr.categories['best-practices'].score * 100);
    console.log('SEO:', lhr.categories.seo.score * 100);
    console.log('PWA:', lhr.categories.pwa.score * 100);
    console.log('----------------------------------');

    // Check if scores meet thresholds
    let failedThresholds = [];
    Object.keys(THRESHOLDS).forEach(category => {
      const score = lhr.categories[category].score * 100;
      if (score < THRESHOLDS[category]) {
        failedThresholds.push({ category, score, threshold: THRESHOLDS[category] });
      }
    });

    if (failedThresholds.length > 0) {
      console.warn(`⚠️ ${page.name} failed to meet some performance thresholds:`);
      failedThresholds.forEach(failure => {
        console.warn(`   - ${failure.category}: ${failure.score.toFixed(1)} (threshold: ${failure.threshold})`);
      });
    } else {
      console.log(`✅ ${page.name} meets all performance thresholds`);
    }
  }

  await chrome.kill();
}

// Run the tests
runTests().catch(error => {
  console.error('Error running performance tests:', error);
  process.exit(1);
}); 