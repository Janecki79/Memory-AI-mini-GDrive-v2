// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// OpenAPI spec
app.get('/.well-known/openapi.yaml', (_req, res) => {
  res.type('text/yaml');
  res.sendFile(path.join(process.cwd(), 'openapi.yaml'));
});

// optional shorter path
app.get('/openapi.yaml', (_req, res) => {
  res.type('text/yaml');
  res.sendFile(path.join(process.cwd(), 'openapi.yaml'));
});

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

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('[api] OpenAPI served at /.well-known/openapi.yaml');
  console.log(`Server listening on ${PORT}`);
});
