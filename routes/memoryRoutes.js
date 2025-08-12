// routes/memoryRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const fssync = require('fs');
const multer = require('multer');
const gdrive = require('../utils/googleDrive');

const router = express.Router();
const DATA_DIR = path.join(process.cwd(), 'data');
const upload = multer({ dest: path.join(DATA_DIR, '_uploads') });

/** Zapewnij katalog data/ */
async function ensureDataDir() {
  if (!fssync.existsSync(DATA_DIR)) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/** Znacznik czasu ISO krótki */
function ts() {
  return new Date().toISOString();
}

/** Zwróć pełną ścieżkę do pliku pamięci */
function filePathFor(topic) {
  const safe = String(topic).replace(/[^a-z0-9_\-]/gi, '_');
  return path.join(DATA_DIR, `${safe}.txt`);
}

/** Odczyt pamięci lokalnej */
async function readMemoryLocal(topic) {
  await ensureDataDir();
  const p = filePathFor(topic);
  if (!fssync.existsSync(p)) return '';
  return fs.readFile(p, 'utf8');
}

/** Zapis (dopisz linię) pamięci lokalnej */
async function writeMemoryLocal(topic, text) {
  await ensureDataDir();
  const p = filePathFor(topic);
  const line = `[${ts()}] ${text}\n`;
  await fs.appendFile(p, line, 'utf8');
  return { ok: true, bytes: Buffer.byteLength(line) };
}

/* ========================================================================== */

/** GET /memory/:topic -> treść pliku */
router.get('/:topic', async (req, res) => {
  try {
    const content = await readMemoryLocal(req.params.topic);
    res.type('text/plain').send(content);
  } catch (err) {
    console.error('read error:', err);
    res.status(500).json({ error: 'read-failed', details: String(err.message || err) });
  }
});

/** POST /memory/:topic -> dopisz wiersz z tekstem */
router.post('/:topic', express.urlencoded({ extended: true }), express.json(), async (req, res) => {
  try {
    const text = (req.body && (req.body.text ?? req.body.content)) || req.query.text;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: 'text-required' });
    }
    const result = await writeMemoryLocal(req.params.topic, String(text).trim());
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('write error:', err);
    res.status(500).json({ error: 'write-failed', details: String(err.message || err) });
  }
});

/** POST /memory/upload (form-data: file) -> zapisz plik do data/ */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file-required' });

    await ensureDataDir();
    const destPath = path.join(DATA_DIR, req.file.originalname || req.file.filename);
    await fs.rename(req.file.path, destPath);

    res.json({ ok: true, stored: path.basename(destPath) });
  } catch (err) {
    console.error('upload error:', err);
    res.status(500).json({ error: 'upload-failed', details: String(err.message || err) });
  }
});

// ======== Google Drive integration ========

router.post('/sync-gdrive', async (req, res) => {
  try {
    await ensureDataDir();
    const files = await fs.readdir(DATA_DIR);
    const uploaded = [];
    for (const file of files) {
      const full = path.join(DATA_DIR, file);
      if (fssync.statSync(full).isFile()) {
        await gdrive.uploadOrUpdateFile(full);
        uploaded.push(file);
      }
    }
    res.json({ ok: true, uploaded });
  } catch (err) {
    console.error('sync error:', err);
    res.status(500).json({ error: 'sync-failed', details: String(err.message || err) });
  }
});

router.get('/list-gdrive', async (req, res) => {
  try {
    const files = await gdrive.listFiles();
    res.json({ ok: true, files });
  } catch (err) {
    console.error('list error:', err);
    res.status(500).json({ error: 'list-failed', details: String(err.message || err) });
  }
});

router.get('/download-gdrive/:file', async (req, res) => {
  try {
    const content = await gdrive.downloadText(req.params.file);
    if (content == null) return res.status(404).json({ error: 'not-found' });
    res.type('text/plain').send(content);
  } catch (err) {
    console.error('download error:', err);
    res.status(500).json({ error: 'download-failed', details: String(err.message || err) });
  }
});

module.exports = router;
