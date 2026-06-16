const sql = require('./_db');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const id = event.queryStringParameters?.id;

  try {
    // GET
    if (event.httpMethod === 'GET') {
      if (id) {
        const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
        if (!rows.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Produto não encontrado' }) };
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }
      const category = event.queryStringParameters?.category;
      const featured = event.queryStringParameters?.featured;
      let rows;
      if (category && featured === 'true') {
        rows = await sql`SELECT * FROM products WHERE category = ${category} AND featured = true ORDER BY created_at DESC`;
      } else if (category) {
        rows = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY created_at DESC`;
      } else if (featured === 'true') {
        rows = await sql`SELECT * FROM products WHERE featured = true ORDER BY created_at DESC`;
      } else {
        rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
      }
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    // POST
    if (event.httpMethod === 'POST') {
      const { name, description, price, category, condition, image_url, stock, featured } = JSON.parse(event.body);
      const rows = await sql`
        INSERT INTO products (name, description, price, category, condition, image_url, stock, featured)
        VALUES (${name}, ${description}, ${price}, ${category}, ${condition || 'novo'}, ${image_url}, ${stock || 0}, ${featured || false})
        RETURNING *
      `;
      return { statusCode: 201, headers, body: JSON.stringify(rows[0]) };
    }

    // PUT
    if (event.httpMethod === 'PUT') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID obrigatório' }) };
      const { name, description, price, category, condition, image_url, stock, featured } = JSON.parse(event.body);
      const rows = await sql`
        UPDATE products SET
          name = ${name}, description = ${description}, price = ${price},
          category = ${category}, condition = ${condition}, image_url = ${image_url},
          stock = ${stock}, featured = ${featured}
        WHERE id = ${id} RETURNING *
      `;
      if (!rows.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Produto não encontrado' }) };
      return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
    }

    // DELETE
    if (event.httpMethod === 'DELETE') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID obrigatório' }) };
      await sql`DELETE FROM products WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Produto removido' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
