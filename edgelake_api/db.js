const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or connect to database file
const db = new sqlite3.Database(path.resolve(__dirname, 'users.db'));

// Auto-create users table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

module.exports = db;
