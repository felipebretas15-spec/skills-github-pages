const pool = require('./_db');

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
    // GET - listar todos ou um produto
    if (event.httpMethod === 'GET') {
      if (id) {
        const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (!rows.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Produto não encontrado' }) };
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }
      const category = event.queryStringParameters?.category;
      const featured = event.queryStringParameters?.featured;
      let query = 'SELECT * FROM products';
      const params = [];
      const conditions = [];
      if (category) { params.push(category); conditions.push(`category = $${params.length}`); }
      if (featured === 'true') conditions.push('featured = true');
      if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
      query += ' ORDER BY created_at DESC';
      const { rows } = await pool.query(query, params);
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    // POST - criar produto
    if (event.httpMethod === 'POST') {
      const { name, description, price, category, condition, image_url, stock, featured } = JSON.parse(event.body);
      const { rows } = await pool.query(
        `INSERT INTO products (name, description, price, category, condition, image_url, stock, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [name, description, price, category, condition || 'novo', image_url, stock || 0, featured || false]
      );
      return { statusCode: 201, headers, body: JSON.stringify(rows[0]) };
    }

    // PUT - editar produto
    if (event.httpMethod === 'PUT') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID obrigatório' }) };
      const { name, description, price, category, condition, image_url, stock, featured } = JSON.parse(event.body);
      const { rows } = await pool.query(
        `UPDATE products SET name=$1, description=$2, price=$3, category=$4, condition=$5,
         image_url=$6, stock=$7, featured=$8 WHERE id=$9 RETURNING *`,
        [name, description, price, category, condition, image_url, stock, featured, id]
      );
      if (!rows.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Produto não encontrado' }) };
      return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
    }

    // DELETE - remover produto
    if (event.httpMethod === 'DELETE') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID obrigatório' }) };
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Produto removido' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
