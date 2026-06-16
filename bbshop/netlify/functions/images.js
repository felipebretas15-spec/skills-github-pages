const sql = require('./_db');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  const id = event.queryStringParameters?.id;
  const product_id = event.queryStringParameters?.product_id;

  try {
    // GET - buscar imagens de um produto
    if (event.httpMethod === 'GET') {
      if (!product_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'product_id obrigatório' }) };
      const rows = await sql`SELECT id, sort_order, image_data FROM product_images WHERE product_id = ${product_id} ORDER BY sort_order, id`;
      return { statusCode: 200, headers, body: JSON.stringify(rows) };
    }

    // POST - salvar imagens (array)
    if (event.httpMethod === 'POST') {
      const { product_id, images } = JSON.parse(event.body);
      if (!product_id || !images?.length) return { statusCode: 400, headers, body: JSON.stringify({ error: 'product_id e images obrigatórios' }) };
      const saved = [];
      for (let i = 0; i < images.length; i++) {
        const rows = await sql`
          INSERT INTO product_images (product_id, image_data, sort_order)
          VALUES (${product_id}, ${images[i]}, ${i})
          RETURNING id, sort_order
        `;
        saved.push(rows[0]);
      }
      return { statusCode: 201, headers, body: JSON.stringify(saved) };
    }

    // DELETE - remover imagem por id
    if (event.httpMethod === 'DELETE') {
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id obrigatório' }) };
      await sql`DELETE FROM product_images WHERE id = ${id}`;
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'Imagem removida' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
