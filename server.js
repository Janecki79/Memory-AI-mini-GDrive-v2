// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const API_KEY = process.env.API_KEY;
app.use((req, res, next) => {
  if (req.path.startsWith('/.well-known') || req.path === '/status') return next();
  const auth = req.get('Authorization') || '';
  if (API_KEY && auth === `Bearer ${API_KEY}`) return next();
  res.status(401).json({ error: 'unauthorized' });
});

// status/health
app.get('/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// router pamięci
const memoryRoutes = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
