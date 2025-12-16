const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/user';
let authToken = '';

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Test data
const testUser = {
  name: 'Test User ' + Date.now(),
  email: `testuser${Date.now()}@example.com`,
  password: 'password123',
  passwordConfirm: 'password123',
  role: 'user'
};

async function testAPI(name, testFunction) {
  try {
    console.log(`\n${colors.yellow}Testing: ${name}${colors.reset}`);
    await testFunction();
    log.success(`${name} - PASSED`);
    return true;
  } catch (error) {
    log.error(`${name} - FAILED`);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
      console.log('Status:', error.response.status);
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
      console.log('Stack:', error.stack);
    }
    return false;
  }
}

// Test functions
async function testUserSignUp() {
  const response = await axios.post(`${BASE_URL}/sign-up`, testUser);
  log.info(`User registered: ${response.data.data?.user?.name || response.data.user?.name}`);
  log.info(`Status: ${response.data.status}`);
}

async function testUserLogin() {
  const response = await axios.post(`${BASE_URL}/login`, {
    email: testUser.email,
    password: testUser.password
  });
  authToken = response.data.data?.token || response.data.token;
  log.info(`Login successful. Token: ${authToken ? authToken.substring(0, 20) + '...' : 'No token received'}`);
  log.info(`User: ${response.data.data?.user?.name || response.data.user?.name || 'Unknown'}`);
}

async function testGetCurrentUser() {
  const response = await axios.get(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  log.info(`Current user retrieved: ${response.data.data?.user?.name || response.data.user?.name}`);
  log.info(`Email: ${response.data.data?.user?.email || response.data.user?.email}`);
  log.info(`Role: ${response.data.data?.user?.role || response.data.user?.role}`);
}


async function runAllTests() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}Z-SERVER (NEW) - API TESTING${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  
  let passed = 0;
  let failed = 0;

  const tests = [
    ['User Sign Up', testUserSignUp],
    ['User Login', testUserLogin],
    ['Get Current User (/me)', testGetCurrentUser]
  ];

  for (const [name, testFn] of tests) {
    const result = await testAPI(name, testFn);
    if (result) passed++;
    else failed++;
   
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}TEST SUMMARY${colors.reset}`);
  console.log(`${'='.repeat(60)}`);
  log.success(`Passed: ${passed}`);
  if (failed > 0) log.error(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
