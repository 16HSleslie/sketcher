const { spawn } = require('child_process');

/**
 * Run tests with improved organization and isolated test databases
 */

// Set environment to test
process.env.NODE_ENV = 'test';

// Test groups in order of execution
const testGroups = [
  {
    name: 'Unit Tests',
    pattern: 'test/server/unit/**/*.test.js'
  },
  {
    name: 'API Tests',
    pattern: 'test/server/api/**/*.test.js'
  },
  {
    name: 'Integration Tests',
    pattern: 'test/server/integration/**/*.test.js'
  }
];

// Common Jest options
const options = [
  '--verbose',
  '--runInBand', // Run tests serially to avoid race conditions
  '--forceExit',
  '--testTimeout=10000'
];

// Run tests in sequence
async function runTests() {
  console.log('Starting test suite');
  
  for (const group of testGroups) {
    console.log(`\n========== Running ${group.name} ==========\n`);
    
    const jest = spawn('npx', ['jest', group.pattern, ...options], { 
      stdio: 'inherit',
      shell: true
    });
    
    // Wait for this test group to complete before moving to the next
    const exitCode = await new Promise((resolve) => {
      jest.on('close', (code) => {
        console.log(`\n${group.name} completed with code ${code}`);
        resolve(code);
      });
    });
    
    // Stop if any test group fails
    if (exitCode !== 0) {
      console.error(`\n❌ ${group.name} failed. Stopping tests.`);
      process.exit(exitCode);
    }
  }
  
  console.log('\n✅ All tests completed successfully!');
}

// Run tests
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
}); 