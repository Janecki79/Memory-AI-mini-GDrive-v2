// W routes/memoryRoutes.js
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
        // Zakładając, że Render udostępnia zawartość client_secret.json
        // jako zmienną środowiskową, np. GOOGLE_CLIENT_SECRET_JSON
        const clientSecretContent = process.env.GOOGLE_CLIENT_SECRET_JSON;

        if (!clientSecretContent) {
            throw new Error("Google client secret is not configured.");
        }

        const credentials = JSON.parse(clientSecretContent);

   const clientSecretContent = process.env.CLIENT_SECRET_JSON; // TO JEST NAJWAŻNIEJSZA ZMIANA

if (!clientSecretContent) {
    throw new Error("Google client secret is not configured.");
}

const credentials = JSON.parse(clientSecretContent);

const auth = new google.auth.GoogleAuth({
    credentials: credentials, // ZAUWAŻ ZMIANĘ Z "keyFile" NA "credentials"
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const authClient = await auth.getClient();
const drive = google.drive({ version: "v3", auth: authClient });

        // ... (reszta logiki przesyłania)
    } catch (err) {
        res.status(500).json({ error: "❌ Błąd wysyłania do Google Drive", details: err.message });
    }
});

module.exports = router;
