const express = require('express');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 8080;
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, "../db/signage.db");



// SQLite database setup
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            screen_key TEXT NOT NULL,
            canvas_data TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8081 }, () => {
    console.log('WebSocket server is running on ws://localhost:8081');
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established.');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.action === 'saveCanvas') {
                const { screenKey, canvasData } = data;

                // Save the data to SQLite
                db.run(
                    `INSERT INTO content (screen_key, canvas_data) VALUES (?, ?)`,
                    [screenKey, canvasData],
                    function (err) {
                        if (err) {
                            console.error('Error inserting data:', err.message);
                            ws.send(
                                JSON.stringify({ status: 'error', message: err.message })
                            );
                        } else {
                            console.log('Data saved with ID:', this.lastID);
                            ws.send(
                                JSON.stringify({ status: 'success', id: this.lastID })
                            );
                        }
                    }
                );
            }
        } catch (err) {
            console.error('Error processing message:', err.message);
            ws.send(JSON.stringify({ status: 'error', message: 'Invalid data format' }));
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed.');
    });
});

// Express route to fetch stored content
app.get('/content', (req, res) => {
    db.all(`SELECT * FROM content`, [], (err, rows) => {
        if (err) {
            console.error('Error fetching data:', err.message);
            res.status(500).json({ status: 'error', message: err.message });
        } else {
            res.json({ status: 'success', data: rows });
        }
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Express server is running on http://localhost:${port}`);
});
