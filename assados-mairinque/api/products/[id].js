const { getSql, cors } = require('../_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const sql = getSql();
    const { id } = req.query;
    try {
        if (req.method === 'PUT') {
            const { name, description, price, image } = req.body;
            const [row] = await sql`
                UPDATE products
                SET name=${name}, description=${description || null}, price=${price}, image=${image || null}
                WHERE id=${id} RETURNING *
            `;
            return res.json(row);
        }
        if (req.method === 'DELETE') {
            await sql`UPDATE products SET active=false WHERE id=${id}`;
            return res.json({ ok: true });
        }
        res.status(405).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
