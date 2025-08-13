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
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    hasPanel: fs.existsSync('views/panel.html'),
    hasOpenAPI: fs.existsSync('public/.well-known/openapi.yaml'),
    openapiPath: path.join(
      process.cwd(),
      'public',
      '.well-known',
      'openapi.yaml'
    )
  });
});

// router pamięci
const memoryRoutes = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('[diag]', {
    hasPanel: fs.existsSync('views/panel.html'),
    hasOpenAPI: fs.existsSync('public/.well-known/openapi.yaml')
  });
  console.log(`Server listening on ${PORT}`);
});
