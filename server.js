// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// panel
app.get('/panel', (_req, res) =>
  res.sendFile(path.join(process.cwd(), 'views', 'panel.html'))
);

// OpenAPI
app.use(
  '/.well-known',
  express.static(path.join(process.cwd(), 'public', '.well-known'))
);
app.get('/.well-known/openapi.yaml', (_req, res) => {
  res.type('text/yaml');
  res.sendFile(
    path.join(process.cwd(), 'public', '.well-known', 'openapi.yaml')
  );
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
  console.log('[server] panel + openapi mounted');
  console.log(`Server listening on ${PORT}`);
});
