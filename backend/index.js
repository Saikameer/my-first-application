require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic route to check server status
app.get('/', (req, res) => {
  res.send('Movie Browser Backend is running');
});

const moviesRouter = require('./routes/movies');

app.use('/api/movies', moviesRouter);

// TODO: Add proxy or API routes if needed

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
