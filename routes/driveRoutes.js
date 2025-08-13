// routes/driveRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const memoryRoutes = require('./memoryRoutes');
const getDriveOptional = memoryRoutes.getDriveOptional;

const router = express.Router();
const UPLOAD_DIR = path.join(process.cwd(), 'data', '_gdrive');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const upload = multer({ dest: UPLOAD_DIR });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file-required' });

    const drive = await getDriveOptional();
    if (!drive) return res.status(501).json({ error: 'drive-disabled' });

    const fileMetadata = { name: req.file.originalname || req.file.filename };
    const media = { mimeType: req.file.mimetype, body: fs.createReadStream(req.file.path) };
    const result = await drive.files.create({ resource: fileMetadata, media, fields: 'id, name' });

    fs.promises.unlink(req.file.path).catch(() => {});

    res.json({ ok: true, file: result.data });
  } catch (err) {
    console.error('drive upload error:', err);
    res.status(500).json({ error: 'upload-failed', details: String(err.message || err) });
  }
});

module.exports = router;
