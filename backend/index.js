const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'store.json');

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { users: [], trips: [] };
  }
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', require('./routes/auth')(readStore, writeStore));
app.use('/users', require('./routes/users')(readStore));
app.use('/trips', require('./routes/trips')(readStore, writeStore));
app.use('/privacy', require('./routes/privacy')(readStore, writeStore));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend running on http://localhost:' + PORT));
