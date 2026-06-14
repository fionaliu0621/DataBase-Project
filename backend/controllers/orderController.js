const db = require('../config/db');

// [GET] /api/orders (獲取訂單列表)
exports.getAllOrders = async (req, res) => {
    try {
        // 從資料庫撈出最新的 20 筆訂單
        const [rows] = await db.query('SELECT * FROM Orders ORDER BY order_purchase_timestamp DESC LIMIT 20');
        res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// [GET] /api/orders/:id (獲取單筆訂單詳細資訊，包含內嵌商品明細)
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;

        // 1. 先查訂單主表資訊 
        const [orderRows] = await db.query('SELECT * FROM Orders WHERE order_id = ?', [orderId]);
        
        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: '找不到該筆訂單' });
        }

        // 2. 核心技術：使用 JOIN 查詢該訂單底下的所有商品項目明細 
        const [itemRows] = await db.query(`
            SELECT oi.order_item_id, oi.product_id, p.product_category_name, oi.price, oi.order_item_quantity
            FROM Order_Items oi
            JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [orderId]);

        // 3. 打包成巢狀 JSON 回傳，方便 D 同學前端渲染頁面
        const orderDetail = {
            ...orderRows[0],
            items: itemRows
        };

        res.json({ success: true, data: orderDetail });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// [POST] /api/orders/add (呼叫 AddOrder SP)
exports.createOrder = async (req, res) => {
    try {
        const { customer_id, product_id, seller_id, price,
                freight_value, shipping_limit_date,
                payment_type, payment_value, quantity } = req.body;

        const [results] = await db.query(
            'CALL AddOrder(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [customer_id, product_id, seller_id, price,
             freight_value, shipping_limit_date,
             payment_type, payment_value, quantity]
        );
        res.json({ success: true, order_id: results[0][0].order_id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// [PATCH] /api/orders/:id/status (呼叫 UpdateOrderStatus SP)
exports.updateStatus = async (req, res) => {
    try {
        const { new_status } = req.body;
        const [results] = await db.query(
            'CALL UpdateOrderStatus(?, ?)',
            [req.params.id, new_status]
        );
        res.json({ success: true, result: results[0][0].result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// [GET] /api/sellers/:id/revenue (呼叫 GetSellerRevenue SP)
exports.getSellerRevenue = async (req, res) => {
    try {
        const [results] = await db.query(
            'CALL GetSellerRevenue(?)',
            [req.params.id]
        );
        res.json({ success: true, data: results[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
// [GET] /products
exports.getProducts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products');
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// [GET] /products/:id
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Products WHERE product_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: '找不到商品' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};