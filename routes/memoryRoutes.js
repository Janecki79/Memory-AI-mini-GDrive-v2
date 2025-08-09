const express = require("express");
const multer = require("multer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { readMemory, writeMemory } = require("../utils/fileHandler");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ... (inne trasy)

router.post("/upload-gdrive", upload.single("file"), async (req, res) => {
    try {
        const clientSecretContent = process.env.CLIENT_SECRET_JSON;

        if (!clientSecretContent) {
            throw new Error("Google client secret is not configured.");
        }

        const credentials = JSON.parse(clientSecretContent);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const authClient = await auth.getClient();
        const drive = google.drive({ version: "v3", auth: authClient });

        const fileMetadata = { name: req.file.originalname };
        const media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media,
            fields: "id, name", 
        });

        fs.unlinkSync(req.file.path);

        res.json({ success: true, file: response.data });
    } catch (err) {
        res.status(500).json({ error: "❌ Błąd wysyłania do Google Drive", details: err.message });
    }
});

module.exports = router;
