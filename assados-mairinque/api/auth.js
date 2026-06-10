const { getSql, cors } = require('./_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const sql = getSql();
    try {
        const { password } = req.body;
        const rows = await sql`SELECT value FROM settings WHERE key = 'admin_password'`;
        const stored = rows[0]?.value || 'admin123';
        if (password === stored) {
            return res.json({ ok: true });
        }
        res.status(401).json({ error: 'Senha incorreta' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
