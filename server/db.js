const { Pool } = require('pg');

// Get the connection string and remove channel_binding parameter if present
// (channel_binding can cause issues with some Node.js pg versions)
let connectionString = process.env.DATABASE_URL;
if (connectionString) {
  connectionString = connectionString.replace(/[&?]channel_binding=[^&]*/g, '');
}

// Create a connection pool using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon connections
  }
});

// Test the connection on startup
pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export query method for use in controllers
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
