const express = require('express');
const router = express.Router();
const productSellerController = require('../controllers/productSellerController');

// 根據報告規劃的路徑
router.get('/products', productSellerController.getAllProducts);
router.get('/sellers', productSellerController.getAllSellers);

module.exports = router;