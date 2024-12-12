const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5555;

// Directory containing the CSV files
const csvDir = path.join(__dirname, "data");

// List of CSV files in the directory
const csvFiles = ["fifth_graders.csv", "non_fifth_graders.csv"];
let fileIndex = 0; // Current file being processed
let entries = []; // In-memory entries

app.use(cors());
app.use(express.json());

// Function to read a CSV file
function readCSV(filePath) {
    const fileData = fs.readFileSync(filePath, "utf-8");
    return fileData.split("\n").map((line, index) => ({
        id: `${fileIndex}-${index}`, // Unique ID across files
        data: line,
        color: ["yellow", "red", "green", "blue", "purple"][index % 5],
    }));
}

// Load entries from the next file
function loadNextFile() {
    if (fileIndex < csvFiles.length) {
        const nextFile = path.join(csvDir, csvFiles[fileIndex]);
        if (fs.existsSync(nextFile)) {
            entries = readCSV(nextFile);
            fileIndex = fileIndex + 1;
            if (entries.length > 0) {
                return;
            }
        } else {
            console.error(`File not found: ${nextFile}`);
        }
    }
}

// Initialize entries with the first file
loadNextFile();

// Serve the static files from the Vue frontend
const frontendDir = path.join(__dirname, "frontend", "dist");
app.use(express.static(frontendDir));

// Endpoint to fetch all remaining entries
app.get("/api/entries", (req, res) => {
    res.json(entries);
});

// Endpoint to spin and get a random entry
app.get("/api/spin", (req, res) => {
    if (entries.length === 0) {
        if (fileIndex < csvFiles.length) {
            loadNextFile();
        }

        // Check again after trying to load the next file
        if (entries.length === 0) {
            return res.status(400).json({ error: "No entries left in any file!" });
        }
    }

    // Select a random entry
    const randomIndex = Math.floor(Math.random() * entries.length);
    const selected = entries.splice(randomIndex, 1)[0];
    res.json(selected);
});

// Endpoint to reload all files
app.post("/api/reload", (req, res) => {
    fileIndex = 0; // Reset the file index
    entries = []; // Clear current entries
    loadNextFile(); // Reload the first file
    res.json({ message: "CSV files reloaded successfully!" });
});

// Fallback for SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
