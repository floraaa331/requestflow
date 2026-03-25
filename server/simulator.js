const { insertRequest } = require('./database');

// Weighted distribution: most real APIs are read-heavy
const METHODS = ['GET', 'GET', 'GET', 'POST', 'POST', 'PUT', 'DELETE', 'PATCH'];

const ENDPOINTS = [
  '/api/users',
  '/api/users/:id',
  '/api/products',
  '/api/products/:id',
  '/api/orders',
  '/api/orders/:id',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/search',
  '/api/analytics',
  '/api/webhooks',
  '/api/uploads',
];

// Weighted toward success: ~70% 2xx, ~15% 4xx, ~10% 5xx, ~5% 3xx
const STATUS_CODES = [
  200, 200, 200, 200, 200, 200, 200,
  201, 201,
  204,
  301, 304,
  400, 401, 403, 404, 404,
  500, 502, 503,
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a single fake request with realistic distributions.
 * Response times skew higher for errors (servers under stress).
 */
function generateRequest() {
  const method = randomElement(METHODS);
  const endpoint = randomElement(ENDPOINTS);
  const status_code = randomElement(STATUS_CODES);

  // Error responses tend to be slower (timeouts, retries, etc.)
  const baseTime = status_code >= 500 ? 200 : status_code >= 400 ? 50 : 10;
  const response_time_ms = baseTime + randomBetween(5, 800);

  // Payload size varies by method: GETs return data, POSTs send data
  const payload_size_bytes = method === 'GET'
    ? randomBetween(200, 15000)
    : randomBetween(100, 5000);

  return { method, endpoint, status_code, response_time_ms, payload_size_bytes };
}

let simulatorTimer = null;
let onNewRequest = null;

/**
 * Start the simulator. Calls the callback with each new request
 * so the server can broadcast it via SSE.
 */
function startSimulator(callback) {
  onNewRequest = callback;
  scheduleNext();
}

function scheduleNext() {
  // Random interval between 2-3 seconds
  const delay = randomBetween(2000, 3000);
  simulatorTimer = setTimeout(() => {
    const requestData = generateRequest();
    const saved = insertRequest(requestData);

    if (onNewRequest) {
      onNewRequest(saved);
    }

    scheduleNext();
  }, delay);
}

function stopSimulator() {
  if (simulatorTimer) {
    clearTimeout(simulatorTimer);
    simulatorTimer = null;
  }
}

module.exports = { startSimulator, stopSimulator };
