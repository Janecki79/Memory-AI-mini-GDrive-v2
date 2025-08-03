// W routes/memoryRoutes.js
// ...
router.post("/upload-gdrive", upload.single("file"), async (req, res) => {
    try {
        const clientSecretContent = process.env.CLIENT_SECRET_FILE; // Zmień tę nazwę, jeśli jest inna

        if (!clientSecretContent) {
            throw new Error("Google client secret is not configured.");
        }

        const credentials = JSON.parse(clientSecretContent);

        const auth = new google.auth.GoogleAuth({
            credentials: credentials,
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const authClient = await auth.getClient();
        const drive = google.drive({ version: "v3", auth: authClient });

        // ... (reszta logiki)
    } catch (err) {
        res.status(500).json({ error: "❌ Błąd wysyłania do Google Drive", details: err.message });
    }
});
// ...
