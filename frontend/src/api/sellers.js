// src/api/sellers.js
import { apiClient } from "./client";

/**
 * GET /sellers
 * 查詢賣家列表
 *
 * ⚠️ 需後端補上：4.2 表格沒有定義這個列表路由
 * （表格只有 GET /sellers/:id/revenue）。
 * DDL 的 Sellers table 已存在，後端只需新增：
 *   app.get('/sellers', (req, res) => {
 *     connection.query('SELECT * FROM Sellers', (err, rows) => { ... });
 *   });
 * 不需修改 DDL，僅需新增 route。
 */
export function getSellers(filters) {
  return apiClient.get("/sellers", filters);
}

/**
 * GET /sellers/:id
 * 查詢單一賣家資料（同樣不在 4.2 表格中，視需求補上）
 */
export function getSellerById(id) {
  return apiClient.get(`/sellers/${id}`);
}

/**
 * GET /sellers/:id/revenue
 * 對應 4.2: 查詢賣家營收 -> CALL GetSellerRevenue(...)
 */
export function getSellerRevenue(id) {
  return apiClient.get(`/sellers/${id}/revenue`);
}
