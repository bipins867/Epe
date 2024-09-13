require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const { setupRoutes } = require('./Routes/setupRoutes');
const db = require("./database");

require('./Models/setModels');

const app = express();

// Set up static file directories
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'CustomerFiles')));
app.use(express.static(path.join(__dirname, 'CustomerSupport')));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

app.use(bodyParser.json({ extended: false }));

// Server info route
app.use('/getServerInfo', (req, res, next) => {
    return res.status(200).json({ socketPort: process.env.APP_PORT, nodeEnv: process.env.NODE_ENV });
});

// Set up application routes
setupRoutes(app);

// Connect to database and export the app instance
db.sync()
  .then(() => {
    console.log('Database synchronized successfully');
  })
  .catch((err) => console.log('Database synchronization error:', err));

module.exports = app; // Export the Express app
