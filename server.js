// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// status/health
app.get('/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// router pamięci
const memoryRoutes = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// static assets and panel
app.use('/.well-known', express.static(path.join(process.cwd(), 'public', '.well-known')));
app.get('/.well-known/openapi.yaml', (_req, res) => {
  res.type('text/yaml');
  res.sendFile(path.join(process.cwd(), 'public', '.well-known', 'openapi.yaml'));
});
app.get('/panel', (_req, res) =>
  res.sendFile(path.join(process.cwd(), 'views', 'panel.html'))
);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
