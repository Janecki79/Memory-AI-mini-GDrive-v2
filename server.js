
const express = require("express");

// Enable Cross-Origin Resource Sharing
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const memoryRoutes = require("./routes/memoryRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // allow cross-origin requests
app.use(express.json());

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use("/", memoryRoutes);
app.get("/status", (req, res) => res.json({ status: "Działa!" }));

app.use("/.well-known/ai-plugin.json", express.static(".well-known/ai-plugin.json"));
app.use("/openapi.yaml", express.static("openapi.yaml"));

app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
