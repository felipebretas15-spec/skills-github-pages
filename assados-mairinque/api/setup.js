const { getSql, cors } = require('./_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const sql = getSql();
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                image TEXT,
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS regions (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                fee DECIMAL(10,2) NOT NULL,
                active BOOLEAN DEFAULT true
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `;
        await sql`
            INSERT INTO settings (key, value) VALUES ('admin_password', 'admin123')
            ON CONFLICT (key) DO NOTHING
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                status INTEGER DEFAULT 1,
                type TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                address TEXT,
                region_name TEXT,
                region_fee DECIMAL(10,2) DEFAULT 0,
                items JSONB NOT NULL,
                subtotal DECIMAL(10,2) NOT NULL,
                delivery_fee DECIMAL(10,2) DEFAULT 0,
                total DECIMAL(10,2) NOT NULL,
                payment TEXT NOT NULL,
                change_amount DECIMAL(10,2),
                obs TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        res.json({ ok: true, message: 'Banco de dados iniciado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
