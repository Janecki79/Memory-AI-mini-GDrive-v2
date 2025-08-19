// routes/memoryRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const fssync = require('fs');
const multer = require('multer');

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

/* ===== Opcjonalna integracja z Google Drive (bezpieczna, domyślnie off) =====
   Włącz przez: GDRIVE_ENABLED=1 i ustaw CLIENT_SECRET_JSON (czysty JSON lub base64).
   Jeśli nie ustawisz – kod będzie działał tylko lokalnie (bez błędów).
*/
let driveSingleton = null;
async function getDriveOptional() {
  if (process.env.GDRIVE_ENABLED !== '1') return null; // wyłączone
  if (driveSingleton) return driveSingleton;

  // Lazy import, żeby nie wymagać googleapis gdy wył.
  const { google } = await import('googleapis');

  // Pobierz JSON z ENV (czysty lub base64) albo z pliku client_secret.json
  let jsonStr = process.env.CLIENT_SECRET_JSON || '';
  if (jsonStr) {
    try {
      const maybe = Buffer.from(jsonStr, 'base64').toString('utf8');
      if (maybe.trim().startsWith('{')) jsonStr = maybe;
    } catch (_) {}
  }
  let creds;
  if (jsonStr) {
    creds = JSON.parse(jsonStr);
  } else if (fssync.existsSync(path.join(process.cwd(), 'client_secret.json'))) {
    creds = JSON.parse(
      await fs.readFile(path.join(process.cwd(), 'client_secret.json'), 'utf8')
    );
  } else {
    // Brak credów – wracamy do trybu lokalnego
    return null;
  }

  const c = creds.installed || creds.web;
  const oauth2Client = new google.auth.OAuth2(
    c.client_id,
    c.client_secret,
    Array.isArray(c.redirect_uris) ? c.redirect_uris[0] : c.redirect_uris
  );

  // Uwaga: bez tokenów użytkownika Drive w trybie OAuth nie zapisze.
  // Tu zostawiamy tylko odczyt publiczny / future use.
  driveSingleton = google.drive({ version: 'v3', auth: oauth2Client });
  return driveSingleton;
}
/* ========================================================================== */
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

module.exports = router;
