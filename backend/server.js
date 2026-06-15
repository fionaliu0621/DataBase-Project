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
        const { category } = req.query;
        let query = 'SELECT *, product_seller_id AS seller_id FROM Products';
        let params = [];
        
        if (category) {
            query += ' WHERE product_category_name = ?';
            params.push(category);
        }
        
        const [rows] = await db.query(query, params);
        
        // 加上圖片路徑
        const products = rows.map(p => ({
            ...p,
            image: `/images/${p.product_id}.jpg`
        }));
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT * FROM Products WHERE product_id = ?', 
            [req.params.id]
        );
        if (products.length === 0) return res.status(404).json({ error: '找不到商品' });
        
        const p = products[0];

        // 從 Order_Items 找賣家
        const [items] = await db.query(
            'SELECT seller_id FROM Order_Items WHERE product_id = ? LIMIT 1',
            [req.params.id]
        );
        
        let seller = {};
        if (items.length > 0) {
            const [sellers] = await db.query(
                'SELECT * FROM Sellers WHERE seller_id = ?',
                [items[0].seller_id]
            );
            if (sellers.length > 0) {
                seller = {
                    id: sellers[0].seller_id,
                    name: sellers[0].seller_id,
                    location: sellers[0].seller_city,
                    joined: '2024',
                    stats: [['5.0', 'Rating'], ['100%', 'Response']]
                };
            }
        }

        // 從 Order_Reviews 找評價
        const [reviews] = await db.query(`
            SELECT r.review_score, r.review_comment_title, r.review_comment_message, r.review_creation_date
            FROM Order_Reviews r
            JOIN Orders o ON r.order_id = o.order_id
            JOIN Order_Items oi ON o.order_id = oi.order_id
            WHERE oi.product_id = ?
            LIMIT 5
        `, [req.params.id]);

        res.json({
            id: p.product_id,
            name: p.product_name,
            category: p.product_category_name,
            price: p.product_price,
            stock: p.product_available,
            specs: [
                ['Weight', `${p.product_weight_g}g`],
                ['Length', `${p.product_length_cm}cm`],
                ['Height', `${p.product_height_cm}cm`],
                ['Width', `${p.product_width_cm}cm`],
                ['Photos', p.product_photos_qty],
            ],
            seller,
            reviews: reviews.map(r => ({
                name: 'Customer',
                initials: 'CU',
                stars: r.review_score,
                date: r.review_creation_date,
                text: r.review_comment_message
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/sellers', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                s.seller_id,
                s.seller_city,
                COUNT(DISTINCT oi.order_id) AS sold,
                AVG(r.review_score) AS rating
            FROM Sellers s
            LEFT JOIN Order_Items oi ON s.seller_id = oi.seller_id
            LEFT JOIN Orders o ON oi.order_id = o.order_id
            LEFT JOIN Order_Reviews r ON o.order_id = r.order_id
            GROUP BY s.seller_id, s.seller_city
        `);

        const sellers = rows.map(s => ({
            id: s.seller_id,
            name: s.seller_id,
            location: s.seller_city,
            since: '2024',
            rating: s.rating ? Number(s.rating).toFixed(1) : 'N/A',
            sold: s.sold,
            positive: s.sold > 0 ? '100%' : 'N/A',
            cats: []
        }));

        res.json(sellers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/sellers/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Sellers WHERE seller_id = ?', 
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: '找不到賣家' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/orders', async (req, res) => {
    try {
        const { customer_id, product_id, seller_id, price,
                freight_value, shipping_limit_date,
                payment_type, payment_value, quantity,
                payment_installments } = req.body;

        const [results] = await db.query(
            'CALL AddOrder(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_id, product_id, seller_id, price,
             freight_value, shipping_limit_date,
             payment_type, payment_value, quantity]
        );
        res.json({ order_id: results[0][0].order_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/orders', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM Orders ORDER BY order_purchase_timestamp DESC LIMIT 20'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/payments', async (req, res) => {
    try {
        const { order_id } = req.query;
        const [rows] = await db.query(
            'SELECT * FROM Order_Payments WHERE order_id = ?',
            [order_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/customers/:id/orders', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.order_id, o.order_status, o.order_purchase_timestamp,
                   oi.product_id, oi.price, oi.order_item_quantity,
                   p.product_name, p.product_category_name
            FROM Orders o
            LEFT JOIN Order_Items oi ON o.order_id = oi.order_id
            LEFT JOIN Products p ON oi.product_id = p.product_id
            WHERE o.customer_id = ?
            ORDER BY o.order_purchase_timestamp DESC
        `, [req.params.id]);

        // 把多筆 row 整理成一筆訂單含多個 items
        const ordersMap = {};
        for (const row of rows) {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    status: row.order_status,
                    date: row.order_purchase_timestamp,
                    items: [],
                    total: 0
                };
            }
            if (row.product_id) {
                const itemTotal = Number(row.price) * Number(row.order_item_quantity);
                ordersMap[row.order_id].items.push({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    price: row.price,
                    qty: row.order_item_quantity
                });
                ordersMap[row.order_id].total += itemTotal;
            }
        }

        res.json(Object.values(ordersMap));
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
