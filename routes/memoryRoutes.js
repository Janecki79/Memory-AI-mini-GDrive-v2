const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { readMemory, writeMemory } = require("../utils/fileHandler");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/memory/:topic", async (req, res) => {
    const topic = req.params.topic;
    const content = await readMemory(topic);
    res.json({ content });
});

router.post("/memory/:topic", async (req, res) => {
    const topic = req.params.topic;
    const text = req.body.newText;
    try {
        await writeMemory(topic, text);
        res.json({ message: "✅ Zapisano nową notatkę." });
    } catch (error) {
        res.status(500).json({ error: "Błąd zapisu." });
    }
});

router.post("/upload-gdrive", upload.single("file"), async (req, res) => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "client_secret.json",
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const authClient = await auth.getClient();
        const drive = google.drive({ version: "v3", auth: authClient });

        const folderName = "Dane-Memory AI mini";
        let folderId;

        const folderRes = await drive.files.list({
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            fields: "files(id)",
            spaces: "drive",
        });

        if (folderRes.data.files.length > 0) {
            folderId = folderRes.data.files[0].id;
        } else {
            const folder = await drive.files.create({
                resource: {
                    name: folderName,
                    mimeType: "application/vnd.google-apps.folder",
                },
                fields: "id",
            });
            folderId = folder.data.id;
        }

        const fileMeta = {
            name: req.file.originalname,
            parents: [folderId],
        };

        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path),
        };

        const response = await drive.files.create({
            resource: fileMeta,
            media,
            fields: "id",
        });

        fs.unlink(req.file.path, () => {});
        res.json({ message: "✅ Przesłano plik do Google Drive", fileId: response.data.id });
    } catch (err) {
        res.status(500).json({ error: "❌ Błąd wysyłania do Google Drive", details: err.message });
    }
});

module.exports = router;
