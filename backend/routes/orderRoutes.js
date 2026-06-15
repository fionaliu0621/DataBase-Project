const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 新增訂單
router.post('/add', orderController.createOrder);

// 更新訂單狀態
router.patch('/:id/status', orderController.updateStatus);

// 查詢賣家營收
router.get('/seller/:id/revenue', orderController.getSellerRevenue);

// 獲取所有訂單列表
router.get('/', orderController.getAllOrders);

// 依據 ID 獲取單一訂單詳細資料 (放最後避免攔截其他路由)
router.get('/:id', orderController.getOrderById);

module.exports = router;
