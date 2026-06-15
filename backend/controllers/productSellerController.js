const db = require('../config/db');

exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products LIMIT 50');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllSellers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Sellers LIMIT 50');

        // 對應 CSV 欄位：seller_id, seller_zip_code_prefix, seller_city
        // 直接回傳陣列，前端 Array.isArray() 才能正確讀取
        const sellers = rows.map(s => ({
            id:        s.seller_id,
            seller_id: s.seller_id,
            city:      s.seller_city ?? "—",
            postal:    s.seller_zip_code_prefix ?? "—",
        }));

        res.json(sellers);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};