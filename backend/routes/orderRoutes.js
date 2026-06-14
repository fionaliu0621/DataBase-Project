const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 1. 獲取所有訂單列表
router.get('/', orderController.getAllOrders);

// 2. 依據 ID 獲取單一訂單詳細資料
router.get('/:id', orderController.getOrderById);

module.exports = router;