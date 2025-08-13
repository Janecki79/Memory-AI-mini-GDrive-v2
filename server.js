// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public routes
app.get('/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// simple panel placeholder
app.get('/panel', (req, res) => {
  res.send('panel');
});

// serve any .well-known resources
app.use('/.well-known', express.static(path.join(process.cwd(), '.well-known')));

// API-key middleware (applied after public routes)
function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) return next();

  const provided = req.get('x-api-key') || req.query.api_key;
  if (provided === expected) return next();

  res.status(401).json({ error: 'unauthorized' });
}

app.use(requireApiKey);

// router pamięci
const memoryRoutes = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
