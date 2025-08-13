const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { google } = require('googleapis');

let driveClient = null;
let cachedFolderId = null;

async function loadCredentials() {
  let jsonStr = process.env.CLIENT_SECRET_JSON || '';
  if (jsonStr) {
    try {
      const maybe = Buffer.from(jsonStr, 'base64').toString('utf8');
      if (maybe.trim().startsWith('{')) jsonStr = maybe;
    } catch {
      // ignore
    }
  }
  if (!jsonStr) {
    const filePath = path.join(process.cwd(), 'client_secret.json');
    if (fs.existsSync(filePath)) {
      jsonStr = await fsp.readFile(filePath, 'utf8');
    }
  }
  if (!jsonStr) {
    throw new Error('missing Google Drive credentials');
  }
  return JSON.parse(jsonStr);
}

async function getDriveClient() {
  if (driveClient) return driveClient;
  const creds = await loadCredentials();

  if (creds.type === 'service_account' || creds.private_key) {
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    driveClient = google.drive({ version: 'v3', auth: await auth.getClient() });
  } else {
    const c = creds.installed || creds.web;
    const oauth2 = new google.auth.OAuth2(
      c.client_id,
      c.client_secret,
      Array.isArray(c.redirect_uris) ? c.redirect_uris[0] : c.redirect_uris
    );
    if (creds.refresh_token || creds.access_token) {
      oauth2.setCredentials({
        refresh_token: creds.refresh_token,
        access_token: creds.access_token,
      });
    }
    driveClient = google.drive({ version: 'v3', auth: oauth2 });
  }
  return driveClient;
}

async function ensureFolder(name = 'Dane-Memory AI mini') {
  if (cachedFolderId) return cachedFolderId;
  const drive = await getDriveClient();
  const q = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q, fields: 'files(id,name)', spaces: 'drive' });
  if (res.data.files && res.data.files.length > 0) {
    cachedFolderId = res.data.files[0].id;
    return cachedFolderId;
  }
  const fileMetadata = { name, mimeType: 'application/vnd.google-apps.folder' };
  const createRes = await drive.files.create({ resource: fileMetadata, fields: 'id' });
  cachedFolderId = createRes.data.id;
  return cachedFolderId;
}

async function uploadFile(localPath, name) {
  const drive = await getDriveClient();
  const folderId = await ensureFolder();
  const fileName = name || path.basename(localPath);
  const fileMetadata = { name: fileName, parents: [folderId] };
  const media = { body: fs.createReadStream(localPath) };
  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id,name',
  });
  return { fileId: res.data.id, name: res.data.name };
}

module.exports = { getDriveClient, ensureFolder, uploadFile };
