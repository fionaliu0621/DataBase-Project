const db = require('./config/db');
const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orderRoutes');
require('dotenv').config();

const app = express();

// 載入全域中介軟體
app.use(cors());
app.use(express.json()); // 讓 Express 能夠解析前端傳來的 JSON

// 註冊訂單 API 路由路徑
app.use('/api/orders', orderRoutes);
const { getProducts, getProductById } = require('./controllers/orderController');
app.get('/products', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products WHERE product_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '找不到商品' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 後端伺服器已在 http://localhost:${PORT} 啟動！`);
    console.log(`💡 B同學的訂單 API 測試網址：http://localhost:${PORT}/api/orders`);
});
