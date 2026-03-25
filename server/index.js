const express = require('express');
const cors = require('cors');
const { initDatabase, getRequests, getStats, getTimeline, getRecentRequests, getSlowestEndpoints, getErrorDistribution, getMethodBreakdown } = require('./database');
const { startSimulator } = require('./simulator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- SSE: Real-time event stream for new requests ---

// Track connected SSE clients so we can broadcast to all of them
const sseClients = new Set();

app.get('/api/stream', (req, res) => {
  // SSE headers: keep connection open, no caching, event-stream content type
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // Send initial heartbeat so the client knows connection is live
  res.write('data: {"type":"connected"}\n\n');

  sseClients.add(res);

  // Clean up on disconnect
  req.on('close', () => {
    sseClients.delete(res);
  });
});

/**
 * Broadcast a new request to all connected SSE clients.
 * Called by the simulator whenever a new fake request is generated.
 */
function broadcastRequest(request) {
  const payload = JSON.stringify({ type: 'new_request', data: request });
  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}

// --- REST API endpoints ---

/**
 * GET /api/requests — Paginated list with optional filters.
 * Query params: page, limit, method, statusClass
 */
app.get('/api/requests', (req, res) => {
  try {
    const { page = 1, limit = 20, method, statusClass, endpoint } = req.query;
    const result = getRequests({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      method: method || undefined,
      statusClass: statusClass || undefined,
      endpoint: endpoint || undefined,
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * GET /api/stats — Aggregated dashboard statistics.
 */
app.get('/api/stats', (req, res) => {
  try {
    res.json(getStats());
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/timeline — Request volume per second for the last 60 seconds.
 */
app.get('/api/timeline', (req, res) => {
  try {
    res.json(getTimeline());
  } catch (err) {
    console.error('Error fetching timeline:', err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

/**
 * GET /api/recent — Most recent N requests (for live feed).
 */
app.get('/api/recent', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '15', 10);
    res.json(getRecentRequests(limit));
  } catch (err) {
    console.error('Error fetching recent requests:', err);
    res.status(500).json({ error: 'Failed to fetch recent requests' });
  }
});

/**
 * GET /api/analytics — Combined analytics data for the analytics page.
 */
app.get('/api/analytics', (req, res) => {
  try {
    res.json({
      slowestEndpoints: getSlowestEndpoints(),
      errorDistribution: getErrorDistribution(),
      methodBreakdown: getMethodBreakdown(),
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// --- Server startup ---

async function start() {
  try {
    await initDatabase();
    console.log('Database initialized');

    // Start generating fake requests; broadcast each one via SSE
    startSimulator(broadcastRequest);
    console.log('Request simulator started (generating every 2-3s)');

    app.listen(PORT, () => {
      console.log(`RequestFlow server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
