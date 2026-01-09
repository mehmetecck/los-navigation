const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'los_transport',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

// BVG API Base URL
const BVG_API = process.env.BVG_API_URL || 'https://v6.bvg.transport.rest';

// Import routes
const stopsRoutes = require('./routes/stops');
const journeysRoutes = require('./routes/journeys');
const savedRoutes = require('./routes/saved');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api/stops', stopsRoutes(pool, BVG_API));
app.use('/api/journeys', journeysRoutes(pool, BVG_API));
app.use('/api/saved', savedRoutes(pool));
app.use('/api/auth', authRoutes(pool));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LOS! API is running' });
});

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Saved journeys table (with optional user_id)
      CREATE TABLE IF NOT EXISTS saved_journeys (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        origin_id VARCHAR(255) NOT NULL,
        origin_name VARCHAR(255) NOT NULL,
        destination_id VARCHAR(255) NOT NULL,
        destination_name VARCHAR(255) NOT NULL,
        stopovers JSONB DEFAULT '[]',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Saved stops table (with optional user_id)
      CREATE TABLE IF NOT EXISTS saved_stops (
        id SERIAL PRIMARY KEY,
        stop_id VARCHAR(255) NOT NULL,
        stop_name VARCHAR(255) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(stop_id, user_id)
      );

      -- Add user_id column to saved_journeys if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='saved_journeys' AND column_name='user_id'
        ) THEN 
          ALTER TABLE saved_journeys ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END $$;

      -- Add legs column to saved_journeys if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='saved_journeys' AND column_name='legs'
        ) THEN 
          ALTER TABLE saved_journeys ADD COLUMN legs JSONB DEFAULT '[]';
        END IF;
      END $$;

      -- Add custom_name column to saved_stops if it doesn't exist
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='saved_stops' AND column_name='custom_name'
        ) THEN 
          ALTER TABLE saved_stops ADD COLUMN custom_name VARCHAR(255);
        END IF;
      END $$;
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
}

app.listen(PORT, async () => {
  console.log(`LOS! Server running on port ${PORT}`);
  await initDB();
});
