const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Serve static files from the dist directory (React build)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve static files from public directory (for models, etc.)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Handle React routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});