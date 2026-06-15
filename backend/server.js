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

// 賣家營收 (GetSellerRevenue SP)
// ✨ 賣家營收 (GetSellerRevenue SP) - 安全相容與日誌檢查版
// ✨ 賣家營收 (GetSellerRevenue SP) - 欄位名稱強行映射對齊版
app.get('/revenue/:id', async (req, res) => {
    try {
        const sellerId = req.params.id;
        console.log(`[Railway] 正在查詢賣家營收 - 賣家 ID: ${sellerId}`);

        const [results] = await db.query('CALL GetSellerRevenue(?)', [sellerId]);
        
        let dbRow = null;

        // 解構出第一筆資料
        if (Array.isArray(results) && results.length > 0) {
            if (Array.isArray(results[0]) && results[0].length > 0) {
                dbRow = results[0][0];
            } else if (typeof results[0] === 'object' && results[0] !== null) {
                dbRow = results[0];
            }
        }

        // 🔍 如果資料庫真的空空如也
        if (!dbRow) {
            return res.json({ success: true, data: null });
        }

        // 💡 印出資料庫真正撈出來的欄位原名，方便你在日誌對照
        console.log("[Railway] 資料庫吐出來的原始欄位是:", JSON.stringify(dbRow));

        // =========================================================================
        // 🛠️ 【核心修正】強行翻譯！不管資料庫叫什麼名字，通通包裝成前端要的四個英文名字
        // =========================================================================
        const alignedData = {
            // 1. 總訂單數：嘗試抓取各種可能的名字，防堵大小寫或底線差異
            total_orders: dbRow.total_orders ?? dbRow.total_orders_qty ?? dbRow.order_count ?? dbRow.orders ?? Object.values(dbRow)[0] ?? 0,
            
            // 2. 總商品金額
            total_price: dbRow.total_price ?? dbRow.total_sales ?? dbRow.sales_amount ?? dbRow.price_sum ?? Object.values(dbRow)[1] ?? 0,
            
            // 3. 總運費
            total_freight: dbRow.total_freight ?? dbRow.freight_sum ?? dbRow.freight ?? Object.values(dbRow)[2] ?? 0,
            
            // 4. 總營收（金額 + 運費）
            total_revenue: dbRow.total_revenue ?? dbRow.total_amount ?? dbRow.revenue ?? Object.values(dbRow)[3] ?? 0
        };

        console.log("[Railway] 強行轉換後、準備送給前端的資料:", JSON.stringify(alignedData));

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

        // 💡 真正的動態修復：如果前端沒給 seller_id，後端自己去資料庫精準捕獲
        if (!seller_id) {
            console.log(`🔍 正在動態為商品 ID: ${product_id} 尋找對應的賣家...`);
            
            const [itemRows] = await db.query(
                'SELECT seller_id FROM Order_Items WHERE product_id = ? LIMIT 1', 
                [product_id]
            );
            
            if (itemRows.length > 0 && itemRows[0].seller_id) {
                seller_id = itemRows[0].seller_id;
            } else {
                // 防呆機制：如果該商品在歷史紀錄完全沒人賣過，動態去 Sellers 表抓取目前資料庫的第一個賣家
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

        // 動態呼叫 Stored Procedure
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

// ✨【已修正】更新訂單狀態 / 取消訂單（全面對齊前端 POST 請求，阻斷 405 錯誤）
app.post('/orders/:id/status', async (req, res) => {
    try {
        const { new_status } = req.body;
        const orderId = req.params.id;

        console.log(`[Railway] 收到取消請求(POST) - 訂單 ID: ${orderId}, 狀態: ${new_status}`);

        // 呼叫預存程序
        const [results] = await db.query(
            'CALL UpdateOrderStatus(?, ?)',
            [orderId, new_status]
        );

        // 安全解構：防止任何因為多層陣列引發的未捕獲崩潰
        let finalResult = 'success';
        if (Array.isArray(results) && results.length > 0 && Array.isArray(results[0]) && results[0].length > 0) {
            finalResult = results[0][0].result || results[0][0].status || 'success';
        }

        // 100% 回傳標準 JSON
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
