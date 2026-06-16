const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tpQ0cBXY3FxR@ep-orange-poetry-ac1qx91b-pooler.sa-east-1.aws.neon.tech/bbshop?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
