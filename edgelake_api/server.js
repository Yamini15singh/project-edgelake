// const cors = require('cors');
// const express = require('express');
// const app = express();
// const port = 8080;

// app.use(cors()); // ✅ Enables CORS for your React app

// app.get('/ping', (req, res) => res.send('pong'));
// app.get('/api/status', (req, res) => res.json({ status: 'ok', source: 'Edgelake local' }));

// app.listen(port, () => console.log(`Edgelake API running on port ${port}`));

const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());

app.get('/ping', (req, res) => res.send('pong'));
app.get('/api/status', (req, res) => res.json({ status: 'ok', source: 'Edgelake local' }));

// ✅ This is the key change: bind to 0.0.0.0
app.listen(port, '0.0.0.0', () => {
  console.log(`Edgelake API running on port ${port}`);
});

