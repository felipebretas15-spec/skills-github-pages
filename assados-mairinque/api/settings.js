const { getSql, cors } = require('./_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const sql = getSql();
    try {
        if (req.method === 'GET') {
            const rows = await sql`SELECT key, value FROM settings`;
            const obj = {};
            rows.forEach(r => { obj[r.key] = r.value; });
            return res.json(obj);
        }
        if (req.method === 'PUT') {
            const updates = req.body;
            for (const [key, value] of Object.entries(updates)) {
                if (value !== undefined && value !== null) {
                    await sql`
                        INSERT INTO settings (key, value) VALUES (${key}, ${value})
                        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                    `;
                }
            }
            return res.json({ ok: true });
        }
        res.status(405).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
