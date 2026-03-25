const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'requestflow.db');

let db = null;

/**
 * Persist the in-memory database to disk.
 * Called after every write to ensure durability.
 */
function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/**
 * Initialize the database: load from disk if exists, otherwise create fresh.
 * Sets up schema with indexes optimized for dashboard queries.
 */
async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Schema: single table for API requests with columns matching our monitoring needs
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      response_time_ms INTEGER NOT NULL,
      payload_size_bytes INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Index on created_at: powers time-range queries (last 60s chart, RPS calculation)
  db.run(`CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at)`);

  // Index on status_code: powers filtering by status class (2xx, 4xx, 5xx)
  db.run(`CREATE INDEX IF NOT EXISTS idx_requests_status_code ON requests(status_code)`);

  // Index on method: powers filtering by HTTP method
  db.run(`CREATE INDEX IF NOT EXISTS idx_requests_method ON requests(method)`);

  persist();
  return db;
}

/**
 * Insert a new request record. Returns the inserted row.
 */
function insertRequest({ method, endpoint, status_code, response_time_ms, payload_size_bytes }) {
  db.run(
    `INSERT INTO requests (method, endpoint, status_code, response_time_ms, payload_size_bytes, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [method, endpoint, status_code, response_time_ms, payload_size_bytes]
  );
  persist();

  // Return the just-inserted row
  const stmt = db.prepare('SELECT * FROM requests WHERE id = last_insert_rowid()');
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();
  return row;
}

/**
 * Get paginated requests with optional filters.
 * Filters: method (GET, POST, etc.), statusClass (2xx, 4xx, 5xx)
 */
function getRequests({ page = 1, limit = 20, method, statusClass, endpoint } = {}) {
  let where = [];
  let params = [];

  if (method) {
    where.push('method = ?');
    params.push(method);
  }

  if (statusClass) {
    // Convert "2xx" -> status_code BETWEEN 200 AND 299
    const base = parseInt(statusClass.charAt(0)) * 100;
    where.push('status_code >= ? AND status_code < ?');
    params.push(base, base + 100);
  }

  if (endpoint) {
    where.push('endpoint LIKE ?');
    params.push(`%${endpoint}%`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  // Get total count for pagination metadata
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM requests ${whereClause}`);
  countStmt.bind(params);
  countStmt.step();
  const { total } = countStmt.getAsObject();
  countStmt.free();

  // Get paginated rows, most recent first
  const offset = (page - 1) * limit;
  const dataStmt = db.prepare(
    `SELECT * FROM requests ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`
  );
  dataStmt.bind([...params, limit, offset]);

  const rows = [];
  while (dataStmt.step()) {
    rows.push(dataStmt.getAsObject());
  }
  dataStmt.free();

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Aggregate stats for the dashboard cards.
 * Computes: total requests, average response time, error rate, requests per second.
 */
function getStats() {
  // Overall stats
  const statsStmt = db.prepare(`
    SELECT
      COUNT(*) as total_requests,
      COALESCE(AVG(response_time_ms), 0) as avg_response_time,
      COALESCE(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as error_rate
    FROM requests
  `);
  statsStmt.step();
  const stats = statsStmt.getAsObject();
  statsStmt.free();

  // RPS: count requests in the last 60 seconds, divide by 60
  const rpsStmt = db.prepare(`
    SELECT COUNT(*) as recent_count
    FROM requests
    WHERE created_at >= datetime('now', '-60 seconds')
  `);
  rpsStmt.step();
  const { recent_count } = rpsStmt.getAsObject();
  rpsStmt.free();

  return {
    totalRequests: stats.total_requests,
    avgResponseTime: Math.round(stats.avg_response_time * 100) / 100,
    errorRate: Math.round(stats.error_rate * 100) / 100,
    requestsPerSecond: Math.round((recent_count / 60) * 100) / 100,
  };
}

/**
 * Get request volume grouped by second for the last 60 seconds.
 * Powers the real-time chart on the dashboard.
 */
function getTimeline() {
  const stmt = db.prepare(`
    SELECT
      strftime('%Y-%m-%d %H:%M:%S', created_at) as second,
      COUNT(*) as count
    FROM requests
    WHERE created_at >= datetime('now', '-60 seconds')
    GROUP BY strftime('%Y-%m-%d %H:%M:%S', created_at)
    ORDER BY second ASC
  `);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Get the N most recent requests. Used for the live feed.
 */
function getRecentRequests(limit = 10) {
  const stmt = db.prepare(
    `SELECT * FROM requests ORDER BY id DESC LIMIT ?`
  );
  stmt.bind([limit]);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Analytics: top 5 slowest endpoints by average response time.
 */
function getSlowestEndpoints() {
  const stmt = db.prepare(`
    SELECT
      endpoint,
      ROUND(AVG(response_time_ms), 1) as avg_time,
      COUNT(*) as request_count
    FROM requests
    GROUP BY endpoint
    ORDER BY avg_time DESC
    LIMIT 5
  `);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/**
 * Analytics: error distribution grouped by individual status code (4xx/5xx only).
 */
function getErrorDistribution() {
  const stmt = db.prepare(`
    SELECT
      status_code,
      COUNT(*) as count
    FROM requests
    WHERE status_code >= 400
    GROUP BY status_code
    ORDER BY count DESC
  `);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

/**
 * Analytics: request count grouped by HTTP method.
 */
function getMethodBreakdown() {
  const stmt = db.prepare(`
    SELECT
      method,
      COUNT(*) as count
    FROM requests
    GROUP BY method
    ORDER BY count DESC
  `);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

module.exports = {
  initDatabase,
  insertRequest,
  getRequests,
  getStats,
  getTimeline,
  getRecentRequests,
  getSlowestEndpoints,
  getErrorDistribution,
  getMethodBreakdown,
};
