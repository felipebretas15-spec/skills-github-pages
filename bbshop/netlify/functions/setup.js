const sql = require('./_db');
const bcrypt = require('bcryptjs');

exports.handler = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        category VARCHAR(100),
        condition VARCHAR(20) DEFAULT 'novo',
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        image_data TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const existing = await sql`SELECT id FROM admins WHERE email = 'felipebretas15@gmail.com'`;
    if (!existing.length) {
      const hash = await bcrypt.hash('bbshop@2025', 10);
      await sql`INSERT INTO admins (name, email, password_hash) VALUES ('Administrador', 'felipebretas15@gmail.com', ${hash})`;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Banco configurado com sucesso!' })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
