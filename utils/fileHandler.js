
const fs = require("fs").promises;
const path = require("path");

const readMemory = async (topic) => {
    const filePath = path.join(__dirname, "..", "data", `${topic}.txt`);
    try {
        return await fs.readFile(filePath, "utf-8");
    } catch {
        return "";
    }
};

const writeMemory = async (topic, text) => {
    const filePath = path.join(__dirname, "..", "data", `${topic}.txt`);
    const line = `[${new Date().toISOString()}] ${text}
`;
    await fs.appendFile(filePath, line);
};

module.exports = { readMemory, writeMemory };
