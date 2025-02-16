const express = require("express");
const WebSocket = require("ws");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
// Initialize Express server
const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

const dbPath = path.join(__dirname, "../db/signage.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create table if it does not exist
    db.run(
      `CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            screen_key TEXT NOT NULL,
            canvas_data TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log('Table "content" is ready.');
        }
      }
    );
  }
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8081 }, () => {
  console.log("WebSocket server is running on ws://localhost:8081");
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established.");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.action === "saveCanvas") {
        // const { screenKey, canvasData } = data;
        const screenKey = data.screenKey?.trim(); // Trim whitespace
        const canvasData = data.canvasData;
        // Validate input
        if (!screenKey || !canvasData) {
          ws.send(
            JSON.stringify({
              status: "error",
              message: "screenKey and canvasData are required.",
            })
          );
          return;
        }
        console.log("screenKey:", screenKey);
        console.log("canvasData:", canvasData);

        // Save the data to SQLite
        db.run(
          `INSERT INTO content (screen_key, canvas_data) VALUES (?, ?)`,
          [screenKey, canvasData],
          function (err) {
            if (err) {
              console.error("Error inserting data:", err.message);
              ws.send(
                JSON.stringify({ status: "error", message: err.message })
              );
            } else {
              console.log("Data saved with ID:", this.lastID);
              ws.send(JSON.stringify({ status: "success", id: this.lastID }));
            }
          }
        );
      }
    } catch (err) {
      console.error("Error processing message:", err.message);
      ws.send(
        JSON.stringify({ status: "error", message: "Invalid data format" })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});
// Add GET route to fetch all saved content
app.get("/content", (req, res) => {
  db.all(`SELECT * FROM content`, [], (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).json({ status: "error", message: err.message });
    } else {
      res.json({ status: "success", data: rows });
    }
  });
});

app.get("/content-list", (req, res) => {
  db.all("SELECT * FROM content", [], (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).send("Error fetching content");
    } else {
      // Parse canvas_data for easier usage on the front-end
      const processedRows = rows.map((row) => ({
        ...row,
        canvas_data: JSON.parse(row.canvas_data), // Parse JSON string
        status:
          row.timestamp > Date.now() - 24 * 60 * 60 * 1000 ? "Active" : "Error", // Example logic
      }));
      res.render("content-list", { content: processedRows }); // Pass parsed data
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
