const express = require('express');
const WebSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;
const wss = new WebSocket.Server({ port: 8080 });

// Setup view engine

// Setup view engine and correct path to views folder
app.set('view engine', 'ejs');
const viewsPath = path.join(__dirname, '../web-dashboard', 'views');
app.set('views', viewsPath);
console.log('Views Path:', viewsPath);  // Log to verify the path

// Database setup
const dbPath = path.join(__dirname, '../db/signage.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Failed to connect to database:', err.message);
    else console.log('Connected to SQLite database');
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
        if (err) console.error('Error creating table:', err.message);
    }
);

// WebSocket setup
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ message: 'Connected to WebSocket server!' }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);

            if (data.action === 'sync') {
                db.all('SELECT * FROM content', (err, rows) => {
                    if (err) ws.send(JSON.stringify({ error: err.message }));
                    else ws.send(JSON.stringify({ action: 'sync', content: rows }));
                });
            }
        } catch (err) {
            console.error('Invalid WebSocket message:', err.message);
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// API for content management
app.use(express.json());
app.post('/content', (req, res) => {
    const { title, type, data } = req.body;
    // In this case, a dashboard might be a type of content
    db.run(
        'INSERT INTO content (title, type, data, status) VALUES (?, ?, ?, ?)',
        [title, type, data, 'unsynced'],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: 'Dashboard created successfully' });
        }
    );
});

// app.post('/content', (req, res) => {
//     const { title, type, data } = req.body;
//     db.run(
//         'INSERT INTO content (title, type, data) VALUES (?, ?, ?)',
//         [title, type, data],
//         function (err) {
//             if (err) return res.status(500).json({ error: err.message });
//             res.status(201).json({ id: this.lastID });
//         }
//     );
// });

// Get all content and render on content-list page
app.get('/content-list', (req, res) => {
    db.all('SELECT * FROM content', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Render the EJS view, passing the content data
        res.render('content-list', { content: rows });
    });
});

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the backend server');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
