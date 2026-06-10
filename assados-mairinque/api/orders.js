const { getSql, cors } = require('./_db');

module.exports = async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    const sql = getSql();
    try {
        if (req.method === 'GET') {
            const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
            return res.json(rows);
        }
        if (req.method === 'POST') {
            const {
                type, customer_name, customer_phone,
                address, region_name, region_fee,
                items, subtotal, delivery_fee, total,
                payment, change_amount, obs
            } = req.body;

            const [row] = await sql`
                INSERT INTO orders
                    (type, customer_name, customer_phone, address, region_name, region_fee,
                     items, subtotal, delivery_fee, total, payment, change_amount, obs)
                VALUES
                    (${type}, ${customer_name}, ${customer_phone},
                     ${address || null}, ${region_name || null}, ${region_fee || 0},
                     ${JSON.stringify(items)}, ${subtotal}, ${delivery_fee || 0}, ${total},
                     ${payment}, ${change_amount || null}, ${obs || null})
                RETURNING *
            `;
            return res.json(row);
        }
        res.status(405).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
