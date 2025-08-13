// server.js — Memory-AI-mini-GDrive-v2
// Drop-in: zachowuje trasy /memory/*, dodaje /panel i /.well-known/openapi.yaml + diagnostykę.

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// --- Podstawowa konfiguracja
app.use(cors());
app.use(express.json());

// (opcjonalnie) pliki statyczne z /public
app.use('/public', express.static(path.join(process.cwd(), 'public')));

// --- HEALTH: /status (rozszerzone o diagnostykę)
app.get('/status', (_req, res) => {
  const hasPanelFile = fs.existsSync(path.join(process.cwd(), 'views', 'panel.html'));
  const hasOpenAPIFile =
    fs.existsSync(path.join(process.cwd(), 'public', '.well-known', 'openapi.yaml')) ||
    fs.existsSync(path.join(process.cwd(), 'openapi.yaml'));

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    hasPanel: hasPanelFile,
    hasOpenAPI: hasOpenAPIFile,
    version: process.env.npm_package_version || null,
  });
});

// --- PANEL: /panel (fallback działa nawet bez pliku)
app.get('/panel', (_req, res) => {
  const p = path.join(process.cwd(), 'views', 'panel.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  // Fallback – prosta stronka, żeby nie było 404
  res
    .status(200)
    .type('html')
    .send(
      '<!doctype html><meta charset="utf-8"><title>Panel</title><h1>Panel OK (fallback)</h1><p>Dodaj plik <code>views/panel.html</code> aby zobaczyć pełny panel.</p>'
    );
});

// --- OpenAPI: /.well-known/openapi.yaml
// 1) najpierw próba z public/.well-known/openapi.yaml
// 2) jak brak – serwuj plik openapi.yaml z katalogu głównego repo
app.get('/.well-known/openapi.yaml', (_req, res) => {
  const p1 = path.join(process.cwd(), 'public', '.well-known', 'openapi.yaml');
  const p2 = path.join(process.cwd(), 'openapi.yaml');
  res.type('text/yaml');
  if (fs.existsSync(p1)) return res.sendFile(p1);
  if (fs.existsSync(p2)) return res.sendFile(p2);
  return res.status(404).type('text/plain').send('openapi.yaml not found');
});

// --- Twoje istniejące trasy pamięci (zostawiamy bez zmian)
try {
  const memoryRoutes = require('./routes/memoryRoutes');
  app.use('/memory', memoryRoutes);
} catch (e) {
  console.warn('[warn] routes/memoryRoutes.js not found or failed to load:', e.message);
}

// --- 404 (na końcu)
app.use((req, res) => res.status(404).type('text/plain').send('Not Found'));

// --- Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const hasPanelFile = fs.existsSync(path.join(process.cwd(), 'views', 'panel.html'));
  const hasOpenAPIFile =
    fs.existsSync(path.join(process.cwd(), 'public', '.well-known', 'openapi.yaml')) ||
    fs.existsSync(path.join(process.cwd(), 'openapi.yaml'));
  console.log(`[server] listening on :${PORT}`);
  console.log('[diag]', { hasPanel: hasPanelFile, hasOpenAPI: hasOpenAPIFile });
});
