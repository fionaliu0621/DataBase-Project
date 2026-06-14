// src/api/products.js
import { apiClient } from "./client";

/**
 * GET /products
 * 對應 4.2: 查詢商品列表
 * @param {object} [filters] 例如 { category, q, page }
 */
export function getProducts(filters) {
  return apiClient.get("/products", filters);
}

/**
 * GET /products/:id
 * 查詢單一商品詳細資訊（含 specs、reviews、seller 資訊）
 *
 * ⚠️ 需後端補上：4.2 表格只定義了 GET /products（列表），
 * 沒有單一商品的查詢路由。但 DDL 的 Products table 已有
 * product_id 作為 PK，後端只需新增一個簡單的 SELECT 路由：
 *   app.get('/products/:id', (req, res) => {
 *     connection.query('SELECT * FROM Products WHERE product_id = ?',
 *       [req.params.id], (err, rows) => { ... });
 *   });
 * 不需修改 DDL，僅需新增 route。
 */
export function getProductById(id) {
  return apiClient.get(`/products/${id}`);
}
