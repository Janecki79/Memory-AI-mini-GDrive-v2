const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const fssync = require('fs');
const multer = require('multer');
const { getDriveClient, ensureFolder, uploadFile } = require('../utils/googleDrive');

const router = express.Router();
const TMP_DIR = path.join(process.cwd(), 'data', '_gdrive');
if (!fssync.existsSync(TMP_DIR)) fssync.mkdirSync(TMP_DIR, { recursive: true });
const upload = multer({ dest: TMP_DIR });

router.post('/upload-gdrive', upload.single('file'), async (req, res) => {
  if (process.env.GDRIVE_ENABLED !== '1') {
    return res.status(501).json({ error: 'gdrive-disabled' });
  }
  if (!req.file) return res.status(400).json({ error: 'file-required' });

  const tempPath = req.file.path;
  try {
    const drive = await getDriveClient();
    const folderId = await ensureFolder(drive, 'Dane-Memory AI mini');
    const result = await uploadFile(drive, tempPath, folderId);
    res.json({ ok: true, fileId: result.id, name: result.name });
  } catch (err) {
    console.error('gdrive upload error:', err);
    res.status(500).json({ error: 'upload-failed', details: String(err.message || err) });
  } finally {
    try {
      await fs.unlink(tempPath);
    } catch (_) {}
  }
});

module.exports = router;
