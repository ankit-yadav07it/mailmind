const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// NeDB-based seed — no MongoDB connection needed
const { seed } = require('./src/services/seedService');
const errorHandler = require('./src/middleware/errorHandler');
const { verifyToken, requireRole } = require('./src/middleware/auth');

const app = express();

// Permissive CORS for development
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Root landing page (HTML dashboard status)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>MailMind API Server – Online</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 32px 40px; max-width: 560px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
        .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34, 197, 94, 0.15); color: #4ADE80; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
        .dot { width: 8px; height: 8px; background: #22C55E; border-radius: 50%; }
        h1 { margin: 0 0 10px 0; font-size: 24px; color: #FFFFFF; }
        p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0; }
        .btn { display: inline-block; background: #3B82F6; color: #FFFFFF; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; transition: background 0.2s; }
        .btn:hover { background: #2563EB; }
        .endpoints { margin-top: 24px; background: #0F172A; border-radius: 8px; padding: 14px 16px; font-family: monospace; font-size: 12px; color: #CBD5E1; }
        .endpoints div { padding: 3px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><div class="dot"></div> Backend API Server is Running</div>
        <h1>MailMind REST API (Port 5000)</h1>
        <p>The backend API is fully operational and connected to the local NeDB datastore with 20 pre-seeded conversations.</p>
        <a href="http://localhost:5173" class="btn">🚀 Open Frontend UI (localhost:5173)</a>
        <div class="endpoints">
          <div style="color: #64748B; margin-bottom: 6px; font-weight: bold;">AVAILABLE API ENDPOINTS:</div>
          <div>GET  /api/health</div>
          <div>POST /api/auth/login</div>
          <div>GET  /api/conversations</div>
          <div>GET  /api/dashboard/stats</div>
          <div>GET  /api/client/attention</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MailMind API is operational',
    timestamp: new Date(),
    database: 'NeDB (file-backed, 20 conversations seeded)',
  });
});

// Route registration
app.use('/api/auth',          require('./src/routes/auth'));
app.use('/api/accounts',      verifyToken,                      require('./src/routes/accounts'));
app.use('/api/conversations',  verifyToken,                      require('./src/routes/conversations'));
app.use('/api/dashboard',     verifyToken,                      require('./src/routes/dashboard'));
app.use('/api/ai',            verifyToken,                      require('./src/routes/ai'));
app.use('/api/client',        verifyToken, requireRole('client'), require('./src/routes/client'));
app.use('/api/replies',       verifyToken,                      require('./src/routes/replies'));
app.use('/api/notifications', verifyToken,                      require('./src/routes/notifications'));

// Global error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await seed();
  } catch (err) {
    console.warn('⚠️  Seed warning:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`✅ MailMind backend running on http://localhost:${PORT}`);
    console.log(`   DB: NeDB (file-backed, no MongoDB needed)`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
})();

module.exports = app;
