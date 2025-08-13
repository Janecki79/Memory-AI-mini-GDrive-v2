// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

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
const { router: memoryRoutes, getDriveOptional } = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// uploader Drive
const upload = multer({ storage: multer.memoryStorage() });
app.post('/upload-gdrive', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file-required' });

    const drive = await getDriveOptional();
    if (!drive) return res.status(501).json({ error: 'drive-disabled' });

    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'bearer-required' });

    drive._options.auth.setCredentials({ access_token: match[1] });

    const result = await drive.files.create({
      requestBody: { name: req.file.originalname || req.file.filename },
      media: { mimeType: req.file.mimetype, body: req.file.buffer },
    });

    res.json({ ok: true, id: result.data.id, name: result.data.name });
  } catch (err) {
    console.error('gdrive upload error:', err);
    if (err.code === 401 || err.status === 401) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    res.status(500).json({ error: 'upload-failed', details: String(err.message || err) });
  }
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
