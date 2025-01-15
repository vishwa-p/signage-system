const express = require("express");
const WebSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const cors = require("cors"); // Import CORS
const app = express();
const PORT = 3000;
const wss = new WebSocket.Server({ port: 8080 });

// Enable CORS for all routes
app.use(cors()); // Enable CORS for all origins (or restrict to a specific one)

// Setup view engine
app.set("view engine", "ejs");
const viewsPath = path.join(__dirname, "../web-dashboard", "views");
app.set("views", viewsPath);
console.log("Views Path:", viewsPath);

// Middleware to parse JSON
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, "../db/signage.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Failed to connect to database:", err.message);
  else console.log("Connected to SQLite database");
});

// Create tables
db.run(
  `CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'unsynced'
    )`,
  (err) => {
    if (err) console.error("Error creating content table:", err.message);
  }
);

db.run(
  `CREATE TABLE IF NOT EXISTS pairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pairing_code TEXT NOT NULL UNIQUE,
        dashboard_id TEXT,
        display_id TEXT
    )`,
  (err) => {
    if (err) console.error("Error creating pairs table:", err.message);
  }
);

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.send(JSON.stringify({ message: "Connected to WebSocket server!" }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received:", data);

      if (data.action === "saveCanvas") {
        // const { screenKey, canvasData } = data;
        const screenKey = data.screenKey;
        const canvasData = data.canvasData;
        if (!screenKey || !canvasData) {
          ws.send(
            JSON.stringify({
              action: "canvasSaved",
              screenKey,
              status: "success",
            })
          );
          return;
        }

        // Save the data into the database (this is similar to the saveCanvas API logic)
        db.run(
          "INSERT INTO content (title, type, data, status) VALUES (?, ?, ?, ?)",
          [`Canvas_${screenKey}`, "canvas", canvasData, "saved"],
          function (err) {
            if (err) {
              console.error("Database error:", err.message);
              ws.send(JSON.stringify({ error: err.message }));
            } else {
              console.log("Data saved successfully with ID:", this.lastID);
              ws.send(
                JSON.stringify({
                  id: this.lastID,
                  message: "Canvas saved successfully",
                })
              );
            }
          }
        );
      }
    } catch (err) {
      console.error("Invalid WebSocket message:", err.message);
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => console.log("Client disconnected"));
});

// New API: Save Canvas Content
app.use(express.json()); // Ensure the body is parsed correctly

// New API: Save Canvas Content
app.post("/api/saveCanvas", (req, res) => {
  console.log("Received request at /api/saveCanvas");
  console.log("Request Body:", req.body);

  const { screenKey, canvasData } = req.body;

  if (!screenKey || !canvasData) {
    console.log("Validation failed: Missing screenKey or canvasData");
    return res
      .status(400)
      .json({ error: "screenKey and canvasData are required" });
  }

  // Example: Saving to database (make sure db is properly set up)
  /*
  db.run(
    "INSERT INTO content (title, type, data, status) VALUES (?, ?, ?, ?)",
    [`Canvas_${screenKey}`, "canvas", canvasData, "saved"],
    function (err) {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("Data saved successfully with ID:", this.lastID);
      res.status(200).json({
        id: this.lastID,
        message: "Canvas saved successfully",
      });
    }
  );
  */

  // Simulating successful saving response (uncomment above for actual DB logic)
  res.status(200).json({
    status: "success",
    message: "Canvas data saved successfully",
    screenKey,
    canvasData,
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the backend server");
  console.log("hi");
});

// Start the server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
