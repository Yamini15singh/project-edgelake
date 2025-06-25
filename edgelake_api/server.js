// const cors = require('cors');
// const express = require('express');
// const app = express();
// const port = 8080;

// app.use(cors()); // ✅ Enables CORS for your React app

// app.get('/ping', (req, res) => res.send('pong'));
// app.get('/api/status', (req, res) => res.json({ status: 'ok', source: 'Edgelake local' }));

// app.listen(port, () => console.log(`Edgelake API running on port ${port}`));

// ------------------
// const express = require('express');
// const cors = require('cors');
// const app = express();
// const port = 8080;

// app.use(cors());

// app.get('/ping', (req, res) => res.send('pong'));
// app.get('/api/status', (req, res) => res.json({ status: 'ok', source: 'Edgelake local' }));

// // ✅ This is the key change: bind to 0.0.0.0
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Edgelake API running on port ${port}`);
// });

// File based DB----------------
// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const port = 8080;

// app.use(cors());
// app.use(express.json()); // parse JSON POST bodies

// // 🟢 Ping
// app.get('/ping', (req, res) => res.send('pong'));

// // 🟢 Status endpoint
// app.get('/api/status', (req, res) => {
//   res.json({ status: 'ok', source: 'Edgelake local' });
// });

// // 🔐 Login endpoint using users.json
// app.post('/api/login', (req, res) => {
//   const { email, password } = req.body;

//   const usersPath = path.join(__dirname, 'users.json');
//   const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

//   const user = users.find(u => u.email === email && u.password === password);
//   if (user) {
//     res.json({ success: true, message: '✅ Login successful!' });
//   } else {
//     res.status(401).json({ success: false, message: '❌ Invalid credentials' });
//   }
// });

// // Start server on all interfaces
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Edgelake API running on port ${port}`);
// });

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// ✅ Ping
app.get('/ping', (req, res) => res.send('pong'));

// ✅ Login using SQLite
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, row) => {
      if (err) return res.status(500).json({ message: 'DB error' });
      if (row) return res.json({ message: '✅ Login successful (SQLite)' });
      return res.status(401).json({ message: '❌ Invalid credentials' });
    }
  );
});

// ✅ Signup to SQLite
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;

  db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password],
    function (err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ message: '❌ Email already exists' });
        }
        return res.status(500).json({ message: 'Server error' });
      }

      res.json({ message: '✅ User registered', userId: this.lastID });
    }
  );
});

// ✅ Optional: view users (for edge testing)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, email FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(rows);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ EdgeLake API running with SQLite on port ${port}`);
});
