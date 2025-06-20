const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const PORT = 9000;

// Allow parsing JSON body
app.use(bodyParser.json());

// ✅ This is the required route
app.post('/webhook', (req, res) => {
  const event = req.headers['x-github-event'];
  const ref = req.body.ref;

  if (event === 'push' && ref === 'refs/heads/main') {
    console.log('🔁 GitHub push detected on main — rebuilding...');
    exec('sh /Users/yaminisingh/Documents/project_edgelake/rebuild.sh', (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Error: ${stderr}`);
      } else {
        console.log(`✅ Output:\n${stdout}`);
      }
    });
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook listener running on http://localhost:${PORT}/webhook`);
});

