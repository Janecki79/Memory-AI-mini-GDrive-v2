// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const fssync = require('fs');
const multer = require('multer');
const googleDrive = require('./utils/googleDrive');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// status/health
app.get('/status', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// upload to Google Drive
const GDRIVE_TMP_DIR = path.join(process.cwd(), 'data', '_gdrive');
if (!fssync.existsSync(GDRIVE_TMP_DIR)) {
  fssync.mkdirSync(GDRIVE_TMP_DIR, { recursive: true });
}
const uploadGDrive = multer({ dest: GDRIVE_TMP_DIR });

app.post('/upload-gdrive', uploadGDrive.single('file'), async (req, res) => {
  if (process.env.GDRIVE_ENABLED !== '1') {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(501).json({ error: 'gdrive-disabled' });
  }
  if (!req.file) return res.status(400).json({ error: 'file-required' });
  try {
    const { fileId, name } = await googleDrive.uploadFile(
      req.file.path,
      req.file.originalname
    );
    res.json({ ok: true, fileId, name });
  } catch (err) {
    console.error('gdrive upload error:', err);
    res.status(500).json({ error: 'upload-failed', details: String(err.message || err) });
  } finally {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
  }
});

// router pamięci
const memoryRoutes = require('./routes/memoryRoutes');
app.use('/memory', memoryRoutes);

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
