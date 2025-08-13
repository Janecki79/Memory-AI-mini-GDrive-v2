const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function getDriveClient() {
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
  } else {
    const filePath = path.join(process.cwd(), 'client_secret.json');
    creds = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  return google.drive({ version: 'v3', auth });
}

async function ensureFolder(drive, name) {
  const q = `name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await drive.files.list({ q, fields: 'files(id,name)' });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }
  const folder = await drive.files.create({
    resource: { name, mimeType: 'application/vnd.google-apps.folder' },
    fields: 'id',
  });
  return folder.data.id;
}

async function uploadFile(drive, filePath, folderId) {
  const fileName = path.basename(filePath);
  const fileMetadata = { name: fileName };
  if (folderId) fileMetadata.parents = [folderId];
  const media = { body: fs.createReadStream(filePath) };
  const res = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id,name',
  });
  return { id: res.data.id, name: res.data.name };
}

module.exports = { getDriveClient, ensureFolder, uploadFile };
