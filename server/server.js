const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Reports Database (Can connect to MongoDB / PostgreSQL easily)
let liveReports = [];

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', platform: 'Darbak Salik Iraq', timestamp: new Date() });
});

app.get('/api/reports', (req, res) => {
  const city = req.query.city;
  if (city && city !== 'all') {
    return res.json(liveReports.filter(r => r.city === city));
  }
  res.json(liveReports);
});

app.post('/api/reports', (req, res) => {
  const newReport = {
    id: `rep-${Date.now()}`,
    ...req.body,
    timeAgo: 'الآن',
    createdAt: new Date()
  };

  liveReports.unshift(newReport);
  if (liveReports.length > 500) liveReports.pop(); // Keep memory lean

  // Broadcast to all connected WebSocket clients in real-time
  broadcast({ type: 'NEW_REPORT', data: newReport });

  res.status(201).json(newReport);
});

// Setup HTTP & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  const payload = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('🚗 New driver client connected to real-time radar feed');
  ws.send(JSON.stringify({ type: 'INIT_REPORTS', data: liveReports }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch (e) {}
  });
});

server.listen(port, () => {
  console.log(`🚀 Darbak Salik Server running on port ${port}`);
});
