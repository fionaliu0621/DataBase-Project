const db = require('./config/db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

//+
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Products
app.get('/products', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM Products';
        let params = [];
        if (category) {
            query += ' WHERE product_category_name = ?';
            params.push(category);
        }
        const [rows] = await db.query(query, params);
        const products = rows.map(p => ({ ...p, image: `/images/${p.product_id}.jpg` }));
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM Products WHERE product_id = ?', [req.params.id]);
        if (products.length === 0) return res.status(404).json({ error: '找不到商品' });
        const p = products[0];
        const [items] = await db.query('SELECT seller_id FROM Order_Items WHERE product_id = ? LIMIT 1', [req.params.id]);
        let seller = {};
        if (items.length > 0) {
            const [sellers] = await db.query('SELECT * FROM Sellers WHERE seller_id = ?', [items[0].seller_id]);
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

// Sellers
app.get('/sellers', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.seller_id, s.seller_city,
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
        const [rows] = await db.query('SELECT * FROM Sellers WHERE seller_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '找不到賣家' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 賣家營收 (GetSellerRevenue SP)
app.get('/revenue/:id', async (req, res) => {
    try {
        const [results] = await db.query('CALL GetSellerRevenue(?)', [req.params.id]);
        res.json({ success: true, data: results[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Orders
// Orders - 新增訂單（已修正 Railway 雲端外鍵與格式化相容問題）
app.post('/orders', async (req, res) => {
    try {
        const { 
            customer_id, 
            product_id, 
            seller_id, 
            price,
            freight_value, 
            shipping_limit_date,
            payment_type, 
            payment_value, 
            quantity 
        } = req.body;

        // 💡 關鍵點 1：文字欄位強制去前後空白，避免因為隱藏換行或空白導致外鍵 (FK) 失敗
        const cleanedCustomerId = customer_id?.trim();
        const cleanedProductId = product_id?.trim();
        const cleanedSellerId = seller_id?.trim();

        console.log("正在嘗試透過 SP 建立訂單，檢查傳入參數:", {
            customer_id: cleanedCustomerId,
            product_id: cleanedProductId,
            seller_id: cleanedSellerId,
            price,
            payment_value
        });

        // 💡 關鍵點 2：調用預存程序 AddOrder
        const [results] = await db.query(
            'CALL AddOrder(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                cleanedCustomerId, 
                cleanedProductId, 
                cleanedSellerId, 
                price || 0,
                freight_value || 0, 
                shipping_limit_date || new Date(), // 如果沒給時間，預設給當前時間
                payment_type || 'credit_card', 
                payment_value || 0, 
                quantity || 1
            ]
        );

        // 💡 關鍵點 3：修正 MySQL 預存程序回傳的雙重陣列解構格式
        // 呼叫 SP 回傳的第一層是結果集陣列，結果集裡面的第一個元素才是你的 SELECT 成果
        if (results && results[0] && results[0][0]) {
            return res.json({ 
                success: true, 
                order_id: results[0][0].order_id 
            });
        } else {
            // 如果 SP 成功跑完但沒有 SELECT 回傳 order_id，嘗試從結果其他層或給予預設成功提示
            return res.json({ 
                success: true, 
                message: "訂單建立成功，但未讀取到回傳 ID。" 
            });
        }

    } catch (error) {
        console.error("❌ 建立訂單失敗，詳細錯誤原因:", error);
        
        // 💡 關鍵點 4：優化錯誤提示，方便你在 Railway 部署日誌 (Deploy Logs) 一眼看出是哪個外鍵噴錯
        if (error.message.includes('foreign key constraint fails')) {
            return res.status(400).json({
                success: false,
                error: "外鍵約束失敗。請確認您傳入的 customer_id, product_id 或 seller_id 是否「真實存在」於雲端資料庫中！",
                sqlMessage: error.message
            });
        }
        
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/orders', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Orders ORDER BY order_purchase_timestamp DESC LIMIT 20');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新訂單狀態 (UpdateOrderStatus SP)
app.patch('/orders/:id/status', async (req, res) => {
    try {
        const { new_status } = req.body;
        const [results] = await db.query(
            'CALL UpdateOrderStatus(?, ?)',
            [req.params.id, new_status]
        );
        const result = results?.[0]?.[0]?.result ?? 'success';
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/payments', async (req, res) => {
    try {
        const { order_id } = req.query;
        const [rows] = await db.query('SELECT * FROM Order_Payments WHERE order_id = ?', [order_id]);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 後端伺服器已在 http://localhost:${PORT} 啟動！`);
});
