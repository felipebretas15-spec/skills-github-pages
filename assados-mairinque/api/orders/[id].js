const { getSql, cors } = require('../_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const sql = getSql();
    const { id } = req.query;
    try {
        if (req.method === 'PUT') {
            const { status } = req.body;
            const [row] = await sql`
                UPDATE orders SET status=${status} WHERE id=${id} RETURNING *
            `;
            return res.json(row);
        }
        res.status(405).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
