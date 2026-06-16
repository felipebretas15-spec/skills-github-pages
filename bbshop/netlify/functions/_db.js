const { neon } = require('@neondatabase/serverless');

const CONNECTION = 'postgresql://neondb_owner:npg_tpQ0cBXY3FxR@ep-orange-poetry-ac1qx91b-pooler.sa-east-1.aws.neon.tech/bbshop?sslmode=require';

const sql = neon(CONNECTION);

module.exports = sql;
