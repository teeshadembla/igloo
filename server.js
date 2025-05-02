// server/server.js
const app = require('./app');
const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel environment

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });


// Export for Vercel (required)
module.exports = app;