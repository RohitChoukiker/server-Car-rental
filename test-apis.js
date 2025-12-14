import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { Buffer } from 'buffer';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let userId = '';
let carId = '';
let bookingId = '';

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
  phone: '9876543210'
};

const testCar = {
  brand: 'Toyota',
  model: 'Camry',
  year: 2023,
  category: 'Sedan',
  seating_capacity: 5,
  fuel_type: 'Petrol',
  transmission: 'Automatic',
  pricePerDay: 50,
  location: 'Mumbai, Maharashtra',
  description: 'Comfortable sedan for family trips'
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
      console.log('Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Test functions
async function testServerHealth() {
  const response = await axios.get('http://localhost:3000/');
  log.info(`Server Response: ${response.data}`);
}

async function testUserRegistration() {
  const response = await axios.post(`${BASE_URL}/user/register`, testUser);
  log.info(`User registered: ${response.data.user?.name}`);
}

async function testUserLogin() {
  const response = await axios.post(`${BASE_URL}/user/login`, {
    email: testUser.email,
    password: testUser.password
  });
  authToken = response.data.token;
  userId = response.data.user?._id || response.data.user?.id;
  log.info(`Login successful. Token: ${authToken.substring(0, 20)}...`);
}

async function testGetUserData() {
  const response = await axios.get(`${BASE_URL}/user/data`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  log.info(`User data retrieved: ${response.data.name || response.data.user?.name}`);
}

async function testGetCars() {
  const response = await axios.get(`${BASE_URL}/user/cars`);
  log.info(`Available cars: ${response.data.length || response.data.cars?.length || 0}`);
}

async function testChangeRoleToOwner() {
  const response = await axios.post(`${BASE_URL}/owner/change-role`, 
    { role: 'owner' },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  log.info(`Role changed: ${response.data.message || 'Success'}`);
}

async function testAddCar() {
  // Create a dummy image buffer (1x1 pixel PNG)
  const dummyImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const formData = new FormData();
  formData.append('image', dummyImage, 'test-car.png');
  formData.append('carData', JSON.stringify(testCar));
  
  const response = await axios.post(`${BASE_URL}/owner/add-car`, 
    formData,
    { 
      headers: { 
        Authorization: `Bearer ${authToken}`,
        ...formData.getHeaders()
      } 
    }
  );
  carId = response.data.car?._id || response.data._id;
  log.info(`Car added with ID: ${carId}`);
}

async function testGetOwnerCars() {
  const response = await axios.get(`${BASE_URL}/owner/cars`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const cars = response.data.cars || response.data;
  log.info(`Owner has ${cars.length} car(s)`);
  if (cars.length > 0 && !carId) {
    carId = cars[0]._id;
  }
}

async function testToggleCarAvailability() {
  if (!carId) {
    log.warning('No car ID available, skipping...');
    return;
  }
  const response = await axios.post(`${BASE_URL}/owner/toggle-car`,
    { carId },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  log.info(`Car availability toggled: ${response.data.message || 'Success'}`);
}

async function testGetOwnerDashboard() {
  const response = await axios.get(`${BASE_URL}/owner/dashboard`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  log.info(`Dashboard data retrieved`);
}

async function testCheckCarAvailability() {
  if (!carId) {
    log.warning('No car ID available, skipping...');
    return;
  }
  const response = await axios.post(`${BASE_URL}/bookings/check-availability`, {
    carId,
    startDate: '2025-12-20',
    endDate: '2025-12-25'
  });
  log.info(`Availability: ${response.data.available || response.data.message}`);
}

async function testCreateBooking() {
  if (!carId) {
    log.warning('No car ID available, skipping...');
    return;
  }
  const response = await axios.post(`${BASE_URL}/bookings/create`,
    {
      carId,
      startDate: '2025-12-20',
      endDate: '2025-12-25',
      totalPrice: 250
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  bookingId = response.data.booking?._id || response.data._id;
  log.info(`Booking created with ID: ${bookingId}`);
}

async function testGetUserBookings() {
  const response = await axios.get(`${BASE_URL}/bookings/user`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const bookings = response.data.bookings || response.data;
  log.info(`User has ${bookings.length} booking(s)`);
}

async function testGetOwnerBookings() {
  const response = await axios.get(`${BASE_URL}/bookings/owner`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  const bookings = response.data.bookings || response.data;
  log.info(`Owner has ${bookings.length} booking(s)`);
}

async function testChangeBookingStatus() {
  if (!bookingId) {
    log.warning('No booking ID available, skipping...');
    return;
  }
  const response = await axios.post(`${BASE_URL}/bookings/change-status`,
    {
      bookingId,
      status: 'confirmed'
    },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  log.info(`Booking status changed: ${response.data.message || 'Success'}`);
}

async function testDeleteCar() {
  if (!carId) {
    log.warning('No car ID available, skipping...');
    return;
  }
  const response = await axios.post(`${BASE_URL}/owner/delete-car`,
    { carId },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );
  log.info(`Car deleted: ${response.data.message || 'Success'}`);
}

// Main test runner
async function runAllTests() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}CAR RENTAL SERVER - API TESTING${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  
  let passed = 0;
  let failed = 0;

  const tests = [
    ['Server Health Check', testServerHealth],
    ['User Registration', testUserRegistration],
    ['User Login', testUserLogin],
    ['Get User Data', testGetUserData],
    ['Get Available Cars', testGetCars],
    ['Change Role to Owner', testChangeRoleToOwner],
    ['Add Car', testAddCar],
    ['Get Owner Cars', testGetOwnerCars],
    ['Toggle Car Availability', testToggleCarAvailability],
    ['Get Owner Dashboard', testGetOwnerDashboard],
    ['Check Car Availability', testCheckCarAvailability],
    ['Create Booking', testCreateBooking],
    ['Get User Bookings', testGetUserBookings],
    ['Get Owner Bookings', testGetOwnerBookings],
    ['Change Booking Status', testChangeBookingStatus],
    ['Delete Car', testDeleteCar]
  ];

  for (const [name, testFn] of tests) {
    const result = await testAPI(name, testFn);
    if (result) passed++;
    else failed++;
    // Small delay between tests
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
