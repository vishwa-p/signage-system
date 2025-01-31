const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 4000;

// Database connection
const db = new sqlite3.Database('../db/signage.db', (err) => {
    if (err) console.error('Failed to connect to the database:', err.message);
    else console.log('Connected to SQLite database');
});

// Middleware - Increase JSON body size limit
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));  // Increased limit to 10MB
// Set up views directory and view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));

// Create tables if not exist
db.run(`
    CREATE TABLE IF NOT EXISTS content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'unsynced',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/save-content', (req, res) => {
    const { title, data } = req.body;
    db.run(
        'INSERT INTO content (title, data) VALUES (?, ?)',
        [title, JSON.stringify(data)],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});


app.get('/api/content', (req, res) => {
    db.all('SELECT * FROM content ORDER BY timestamp DESC', [], (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ status: 'error', message: err.message });
      } else {
        res.json({ status: 'success', data: rows });
      }
    });
  });


  app.get('/content-list', (req, res) => {
    db.all('SELECT * FROM content ORDER BY timestamp DESC', [], (err, rows) => {
      if (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).send('Error fetching content data');
      } else {
        // Add status and statusClass to each content item
        const contentWithStatus = rows.map(item => {
          const currentTime = new Date();
          const contentTime = new Date(item.timestamp);
          const diffTime = currentTime - contentTime;
  
          let statusClass = 'error';
          let statusText = 'Error';
  
          if (diffTime < 3600000) { // Less than 1 hour
            statusClass = 'active';
            statusText = 'Active';
          } else if (diffTime < 86400000) { // Less than 1 day
            statusClass = 'draft';
            statusText = 'Draft';
          }
  
          return {
            ...item,
            statusClass,
            statusText
          };
        });
  
        // Pass the processed content to the view
        res.render('content-list', { content: contentWithStatus });
      }
    });
  });
// Start the server
app.listen(PORT, () => console.log(`Dashboard running on http://localhost:${PORT}`));
