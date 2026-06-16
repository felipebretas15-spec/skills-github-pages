const sql = require('./_db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'bbshop_secret_key_2025_x9k2m';
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };

  try {
    const { email, password } = JSON.parse(event.body);
    if (!email || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: 'E-mail e senha obrigatórios' }) };

    const rows = await sql`SELECT * FROM admins WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
    if (!rows.length) return { statusCode: 401, headers, body: JSON.stringify({ error: 'E-mail ou senha inválidos' }) };

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return { statusCode: 401, headers, body: JSON.stringify({ error: 'E-mail ou senha inválidos' }) };

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
    return { statusCode: 200, headers, body: JSON.stringify({ token, name: admin.name }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
