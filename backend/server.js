const db = require('./config/db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
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

// 賣家營收 (GetSellerRevenue SP) - 🛠️ 終極解構與欄位對齊修正版
app.get('/revenue/:id', async (req, res) => {
    try {
        const sellerId = req.params.id;
        console.log(`[Railway] 正在查詢賣家營收 - 賣家 ID: ${sellerId}`);

        const [results] = await db.query('CALL GetSellerRevenue(?)', [sellerId]);
        
        let dbRow = null;

        // 🎯 修正核心漏洞：精準撥開 Stored Procedure 回傳的雙層陣列外殼
        if (Array.isArray(results) && results.length > 0) {
            if (Array.isArray(results[0]) && results[0].length > 0) {
                dbRow = results[0][0]; // 這才是真正的資料物件 {}
            } else if (!Array.isArray(results[0]) && typeof results[0] === 'object' && results[0] !== null) {
                dbRow = results[0];
            }
        }

        // 如果資料庫真的完全沒資料
        if (!dbRow) {
            console.log(`[Railway] 提示：賣家 ${sellerId} 資料庫查無營收列`);
            return res.json({ success: true, data: null });
        }

        console.log("[Railway] 資料庫吐出的原始欄位物件為:", JSON.stringify(dbRow));

        const values = Object.values(dbRow);

        // 🛠️ 強行對齊前端需要的 4 個英文名字，同時相容大/小寫、有無底線
        const alignedData = {
            total_orders: dbRow.total_orders ?? dbRow.total_orders_qty ?? dbRow.order_count ?? dbRow.orders ?? dbRow.TotalOrders ?? values[0] ?? 0,
            total_price: dbRow.total_price ?? dbRow.total_sales ?? dbRow.sales_amount ?? dbRow.price_sum ?? dbRow.TotalPrice ?? values[1] ?? 0,
            total_freight: dbRow.total_freight ?? dbRow.freight_sum ?? dbRow.freight ?? dbRow.TotalFreight ?? values[2] ?? 0,
            total_revenue: dbRow.total_revenue ?? dbRow.total_amount ?? dbRow.revenue ?? dbRow.TotalRevenue ?? values[3] ?? 0
        };

        console.log("[Railway] 轉換完成發送給前端的資料:", JSON.stringify(alignedData));

        return res.json({ 
            success: true, 
            data: alignedData 
        });

    } catch (error) {
        console.error("❌ 查詢賣家營收失敗:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Orders - 新增訂單（完全動態查詢賣家版，不寫死）
app.post('/orders', async (req, res) => {
    try {
        let { 
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

        if (!seller_id) {
            console.log(`🔍 正在動態為商品 ID: ${product_id} 尋找對應的賣家...`);
            const [itemRows] = await db.query(
                'SELECT seller_id FROM Order_Items WHERE product_id = ? LIMIT 1', 
                [product_id]
            );
            
            if (itemRows.length > 0 && itemRows[0].seller_id) {
                seller_id = itemRows[0].seller_id;
            } else {
                const [backupSeller] = await db.query('SELECT seller_id FROM Sellers LIMIT 1');
                if (backupSeller.length > 0) {
                    seller_id = backupSeller[0].seller_id;
                    console.log(`⚠️ 該商品為全新商品，動態分派至系統註冊賣家: ${seller_id}`);
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
            [
                cleanedCustomerId, 
                cleanedProductId, 
                cleanedSellerId, 
                price || 0, 
                freight_value || 0, 
                shipping_limit_date || new Date(), 
                payment_type || 'credit_card', 
                payment_value || (price * (quantity || 1)), 
                quantity || 1
            ]
        );

        if (results && results[0] && results[0][0]) {
            return res.json({ success: true, order_id: results[0][0].order_id });
        } else {
            return res.json({ success: true, message: "訂單動態建立成功！" });
        }

    } catch (error) {
        console.error("❌ 建立訂單失敗，詳細錯誤:", error);
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

// ✨【終極相容路由】同時支持 POST 與 PATCH，完美阻斷 404/405 彈窗錯誤！
const handleStatusUpdate = async (req, res) => {
    try {
        const { new_status } = req.body;
        const orderId = req.params.id;

        console.log(`[Railway] 收到取消請求(${req.method}) - 訂單 ID: ${orderId}, 狀態: ${new_status}`);

        const [results] = await db.query(
            'CALL UpdateOrderStatus(?, ?)',
            [orderId, new_status]
        );

        let finalResult = 'success';
        if (Array.isArray(results) && results.length > 0 && Array.isArray(results[0]) && results[0].length > 0) {
            finalResult = results[0][0].result || results[0][0].status || 'success';
        }

        return res.json({ 
            success: true, 
            result: finalResult,
            message: "訂單狀態更新成功" 
        });

    } catch (error) {
        console.error("❌ Railway 後端更新失敗:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// 雙路由綁定，管他前端是用 POST 還是 PATCH 戳，全部都能成功返回
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
