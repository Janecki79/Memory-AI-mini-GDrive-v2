const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

let driveSingleton = null;
let rootFolderId = null;

function getDrive() {
  if (driveSingleton) return driveSingleton;
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error('Missing Google Drive credentials in environment');
  }
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  driveSingleton = google.drive({ version: 'v3', auth: oauth2Client });
  return driveSingleton;
}

async function ensureRootFolder() {
  if (rootFolderId) return rootFolderId;
  const drive = getDrive();
  const explicit = process.env.DRIVE_FOLDER_ID;
  if (explicit) {
    rootFolderId = explicit;
    return rootFolderId;
  }
  const folderName = process.env.DRIVE_ROOT_NAME || 'Memory AI mini';
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: 'files(id,name)',
  });
  if (res.data.files && res.data.files.length) {
    rootFolderId = res.data.files[0].id;
  } else {
    const create = await drive.files.create({
      requestBody: { name: folderName, mimeType: 'application/vnd.google-apps.folder' },
      fields: 'id',
    });
    rootFolderId = create.data.id;
  }
  return rootFolderId;
}

async function uploadOrUpdateText(filename, content) {
  const drive = getDrive();
  const folderId = await ensureRootFolder();
  const existing = await drive.files.list({
    q: `name='${filename}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });
  if (existing.data.files && existing.data.files.length) {
    const id = existing.data.files[0].id;
    await drive.files.update({
      fileId: id,
      media: { mimeType: 'text/plain', body: content },
    });
    return id;
  } else {
    const create = await drive.files.create({
      requestBody: { name: filename, parents: [folderId] },
      media: { mimeType: 'text/plain', body: content },
      fields: 'id',
    });
    return create.data.id;
  }
}

async function uploadOrUpdateFile(filePath) {
  const drive = getDrive();
  const folderId = await ensureRootFolder();
  const name = path.basename(filePath);
  const existing = await drive.files.list({
    q: `name='${name}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });
  const media = { mimeType: 'application/octet-stream', body: fs.createReadStream(filePath) };
  if (existing.data.files && existing.data.files.length) {
    const id = existing.data.files[0].id;
    await drive.files.update({ fileId: id, media });
    return id;
  } else {
    const create = await drive.files.create({
      requestBody: { name, parents: [folderId] },
      media,
      fields: 'id',
    });
    return create.data.id;
  }
}

async function downloadText(filename) {
  const drive = getDrive();
  const folderId = await ensureRootFolder();
  const res = await drive.files.list({
    q: `name='${filename}' and '${folderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });
  if (!res.data.files || !res.data.files.length) return null;
  const id = res.data.files[0].id;
  const dl = await drive.files.get({ fileId: id, alt: 'media' }, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    let data = '';
    dl.data.on('data', chunk => (data += chunk));
    dl.data.on('end', () => resolve(data));
    dl.data.on('error', reject);
  });
}

async function listFiles() {
  const drive = getDrive();
  const folderId = await ensureRootFolder();
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType,modifiedTime)'
  });
  return res.data.files || [];
}

module.exports = {
  ensureRootFolder,
  uploadOrUpdateText,
  uploadOrUpdateFile,
  downloadText,
  listFiles,
};
