const db = require('./config/db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Auth
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

app.get('/products/:id/order', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT order_id FROM Order_Items WHERE product_id = ? LIMIT 1',
            [req.params.id]
        );
        res.json({ order_id: rows[0]?.order_id ?? null });
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
        `, [req.params.id]);

        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0
            ? (reviews.reduce((sum, r) => sum + Number(r.review_score), 0) / reviewCount).toFixed(1)
            : null;

        res.json({
            id: p.product_id,
            name: p.product_name,
            category: p.product_category_name,
            price: p.product_price,
            stock: p.product_available,
            rating: avgRating,
            review_count: reviewCount,
            specs: [
                ['Weight', `${p.product_weight_g}g`],
                ['Length', `${p.product_length_cm}cm`],
                ['Height', `${p.product_height_cm}cm`],
                ['Width', `${p.product_width_cm}cm`],
                ['Photos', p.product_photos_qty],
            ],
            seller,
            reviews: reviews.slice(0, 5).map(r => ({
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

// 賣家自己收到的訂單（依 seller_id 過濾 Order_Items）
app.get('/sellers/:id/orders', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.order_id, o.order_status, o.order_purchase_timestamp,
                   o.order_approved_at, o.order_delivered_carrier_date,
                   oi.product_id, oi.price, oi.order_item_quantity,
                   p.product_name
            FROM Order_Items oi
            JOIN Orders o ON oi.order_id = o.order_id
            LEFT JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.seller_id = ?
            ORDER BY o.order_purchase_timestamp DESC
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 賣家自己賣過的商品（透過 Order_Items 去重）
app.get('/sellers/:id/products', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT product_id, product_name, product_price, product_category_name,
                   product_weight_g, product_length_cm, product_height_cm, product_width_cm,
                   product_photos_qty, product_available
            FROM Products
            WHERE product_seller_id = ?
        `, [req.params.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 賣家上架新商品
app.post('/sellers/:id/products', async (req, res) => {
    try {
        const sellerId = req.params.id;
        const {
            product_name, product_category_name, product_price,
            product_weight_g, product_length_cm, product_height_cm, product_width_cm,
            product_photos_qty, product_available
        } = req.body;

        if (!product_name || !product_price) {
            return res.status(400).json({ success: false, error: "商品名稱與價格為必填" });
        }

        const productId = `prod_${Date.now()}`;

        await db.query(`
            INSERT INTO Products (
                product_id, product_seller_id, product_name, product_category_name,
                product_weight_g, product_length_cm, product_height_cm, product_width_cm,
                product_photos_qty, product_available, product_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            productId, sellerId, product_name, product_category_name || null,
            product_weight_g || null, product_length_cm || null, product_height_cm || null, product_width_cm || null,
            product_photos_qty || 0, product_available || 0, product_price
        ]);

        res.json({ success: true, product_id: productId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 某個商品、且限定是透過這個賣家出貨的訂單，所產生的評論
app.get('/sellers/:sellerId/products/:productId/reviews', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT r.review_score, r.review_comment_title, r.review_comment_message, r.review_creation_date
            FROM Order_Reviews r
            JOIN Order_Items oi ON r.order_id = oi.order_id
            WHERE oi.product_id = ? AND oi.seller_id = ?
            ORDER BY r.review_creation_date DESC
        `, [req.params.productId, req.params.sellerId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/revenue/:id', async (req, res) => {
    try {
        const sellerId = req.params.id;
        const [results] = await db.query('CALL GetSellerRevenue(?)', [sellerId]);
        const data = results[0][0];
        if (!data) return res.json({ success: true, data: null });
        const values = Object.values(data);
        const alignedData = {
            total_orders: data.total_orders ?? values[0] ?? 0,
            total_price: data.total_price ?? values[1] ?? 0,
            total_freight: data.total_freight ?? values[2] ?? 0,
            total_revenue: data.total_revenue ?? values[3] ?? 0
        };
        return res.json({ success: true, data: alignedData });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// 賣家在所有賣家中的營收排名
app.get('/sellers/:id/rank', async (req, res) => {
    try {
        const sellerId = req.params.id;
        const [rows] = await db.query(`
            SELECT
                s.seller_id,
                SUM(oi.price * oi.order_item_quantity + oi.freight_value) AS total_revenue
            FROM Sellers s
            JOIN Order_Items oi ON s.seller_id COLLATE utf8mb4_unicode_ci = oi.seller_id COLLATE utf8mb4_unicode_ci
            JOIN Orders o ON oi.order_id COLLATE utf8mb4_unicode_ci = o.order_id COLLATE utf8mb4_unicode_ci
            WHERE o.order_status = 'delivered'
            GROUP BY s.seller_id
            ORDER BY total_revenue DESC
        `);

        const totalSellers = rows.length;
        const rankIndex = rows.findIndex(r => r.seller_id === sellerId);

        if (rankIndex === -1) {
            return res.json({ success: true, rank: null, total: totalSellers, message: "目前沒有已送達訂單，尚無排名" });
        }

        res.json({ success: true, rank: rankIndex + 1, total: totalSellers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 賣家銷售趨勢（依月或依季分組）
app.get('/sellers/:id/sales-trend', async (req, res) => {
    try {
        const sellerId = req.params.id;
        const period = req.query.period === 'quarter' ? 'quarter' : 'month';

        const periodExpr = period === 'quarter'
            ? "CONCAT(YEAR(o.order_purchase_timestamp), '-Q', QUARTER(o.order_purchase_timestamp))"
            : "DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m')";

        const [rows] = await db.query(`
            SELECT
                ${periodExpr} AS period,
                SUM(oi.price * oi.order_item_quantity + oi.freight_value) AS revenue
            FROM Order_Items oi
            JOIN Orders o ON oi.order_id COLLATE utf8mb4_unicode_ci = o.order_id COLLATE utf8mb4_unicode_ci
            WHERE oi.seller_id COLLATE utf8mb4_unicode_ci = ?
            AND o.order_status = 'delivered'
            GROUP BY period
            ORDER BY period ASC
        `, [sellerId]);

        res.json(rows.map(r => ({ period: r.period, revenue: Number(r.revenue) })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 賣家確認接單：填入 order_approved_at，狀態改 approved
app.patch('/orders/:id/approve', async (req, res) => {
    try {
        const orderId = req.params.id;
        await db.query(
            'UPDATE Orders SET order_approved_at = NOW(), order_status = ? WHERE order_id = ?',
            ['approved', orderId]
        );
        res.json({ success: true, message: '已確認接單' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 賣家確認出貨：填入 order_delivered_carrier_date，狀態改 shipped
app.patch('/orders/:id/ship', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { carrier_date } = req.body;
        const date = carrier_date ? new Date(carrier_date) : new Date();
        await db.query(
            'UPDATE Orders SET order_delivered_carrier_date = ?, order_status = ? WHERE order_id = ?',
            [date, 'shipped', orderId]
        );
        res.json({ success: true, message: '已確認出貨' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Orders
app.post('/orders', async (req, res) => {
    try {
        let { customer_id, product_id, seller_id, price, freight_value, shipping_limit_date, payment_type, payment_value, quantity } = req.body;

        if (!seller_id) {
            const [itemRows] = await db.query('SELECT seller_id FROM Order_Items WHERE product_id = ? LIMIT 1', [product_id]);
            if (itemRows.length > 0 && itemRows[0].seller_id) {
                seller_id = itemRows[0].seller_id;
            } else {
                const [backupSeller] = await db.query('SELECT seller_id FROM Sellers LIMIT 1');
                if (backupSeller.length > 0) {
                    seller_id = backupSeller[0].seller_id;
                } else {
                    throw new Error("資料庫中目前沒有任何賣家存在，無法建立訂單！");
                }
            }
        }

        const cleanedCustomerId = customer_id?.trim();
        const cleanedProductId = product_id?.trim();
        const cleanedSellerId = seller_id?.trim();

        const [results] = await db.query(
            'CALL AddOrder(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [cleanedCustomerId, cleanedProductId, cleanedSellerId, price || 0, freight_value || 0, shipping_limit_date || new Date(), payment_type || 'credit_card', payment_value || (price * (quantity || 1)), quantity || 1]
        );

        if (results && results[0] && results[0][0]) {
            const newOrderId = results[0][0].order_id;
            return res.json({ success: true, order_id: newOrderId });
        } else {
            return res.json({ success: true, message: "訂單建立成功！" });
        }
    } catch (error) {
        console.error("❌ 建立訂單失敗：", error);
        res.status(500).json({ error: error.message });
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

// 查詢單一訂單明細，給評論頁面用（顯示商品名稱、訂單狀態、出貨日期）
app.get('/orders/:id', async (req, res) => {
    try {
        const [orders] = await db.query('SELECT * FROM Orders WHERE order_id = ?', [req.params.id]);
        if (orders.length === 0) return res.status(404).json({ error: '找不到此訂單' });
        const order = orders[0];

        const [items] = await db.query(`
            SELECT oi.product_id, oi.price, oi.order_item_quantity, p.product_name
            FROM Order_Items oi
            LEFT JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [req.params.id]);

        res.json({
            order_id: order.order_id,
            status: order.order_status,
            date: order.order_delivered_customer_date ?? order.order_purchase_timestamp,
            delivered_date: order.order_delivered_customer_date,
            items: items.map(it => ({
                product_id: it.product_id,
                name: it.product_name,
                price: it.price,
                qty: it.order_item_quantity,
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const handleStatusUpdate = async (req, res) => {
    try {
        const { new_status } = req.body;
        const orderId = req.params.id;
        const [results] = await db.query('CALL UpdateOrderStatus(?, ?)', [orderId, new_status]);
        let finalResult = 'success';
        if (Array.isArray(results) && results.length > 0 && Array.isArray(results[0]) && results[0].length > 0) {
            finalResult = results[0][0].result || results[0][0].status || 'success';
        }
        return res.json({ success: true, result: finalResult, message: "訂單狀態更新成功" });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

app.post('/orders/:id/status', handleStatusUpdate);
app.patch('/orders/:id/status', handleStatusUpdate);

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
                ordersMap[row.order_id] = { order_id: row.order_id, status: row.order_status, date: row.order_purchase_timestamp, items: [], total: 0 };
            }
            if (row.product_id) {
                ordersMap[row.order_id].items.push({ product_id: row.product_id, product_name: row.product_name, price: row.price, qty: row.order_item_quantity });
                ordersMap[row.order_id].total += Number(row.price) * Number(row.order_item_quantity);
            }
        }
        res.json(Object.values(ordersMap));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/reviews', async (req, res) => {
    try {
        const { order_id, review_score, review_comment_title, review_comment_message } = req.body;
        const review_id = `rev_${Date.now()}`;
        await db.query('DELETE FROM Order_Reviews WHERE order_id = ?', [order_id]);
        await db.query(
            'INSERT INTO Order_Reviews (review_id, order_id, review_score, review_comment_title, review_comment_message, review_creation_date) VALUES (?, ?, ?, ?, ?, NOW())',
            [review_id, order_id, review_score, review_comment_title, review_comment_message]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cities（給註冊頁城市下拉選單用）
app.get('/cities', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT DISTINCT geolocation_city FROM Geolocation ORDER BY geolocation_city ASC'
        );
        res.json(rows.map(r => r.geolocation_city));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/geolocation/:zip', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT geolocation_city, geolocation_state FROM Geolocation WHERE geolocation_zip_code_prefix = ? LIMIT 1',
            [req.params.zip]
        );
        if (rows.length === 0) return res.status(404).json({ error: '找不到此郵遞區號' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 後端伺服器已在 http://localhost:${PORT} 啟動！`);
});
