// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('./middleware/authApiKey'));

// status/health
app.get('/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// prosty panel HTML
app.get('/panel', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'views', 'panel.html'));
});

// router pamięci
const memoryRoutes = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
