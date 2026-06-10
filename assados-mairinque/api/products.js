const { getSql, cors } = require('./_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const sql = getSql();
    try {
        if (req.method === 'GET') {
            const rows = await sql`SELECT * FROM products WHERE active = true ORDER BY created_at`;
            return res.json(rows);
        }
        if (req.method === 'POST') {
            const { name, description, price, image } = req.body;
            const [row] = await sql`
                INSERT INTO products (name, description, price, image)
                VALUES (${name}, ${description || null}, ${price}, ${image || null})
                RETURNING *
            `;
            return res.json(row);
        }
        res.status(405).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
