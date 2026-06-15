// src/api/reviews.js
import { apiClient } from "./client";

/**
 * GET /reviews
 * 對應 4.3 統計&評論API: 查詢評論
 * @param {object} [filters] 例如 { product_id }
 */
export function getReviews(filters) {
  return apiClient.get("/reviews", filters);
}

/**
 * POST /reviews
 * 對應 4.2: 新增評價 -> INSERT（trg_review_check 會檢查訂單是否已 delivered）
 * @param {object} payload
 *  {
 *    order_id, product_id, customer_id,
 *    rating, title, body
 *  }
 *
 * 注意：若訂單尚未 delivered，trg_review_check 會擋下 INSERT，
 * 後端應回傳 4xx + { error: "..." }，前端需顯示對應錯誤訊息。
 */
export function createReview(payload) {
  return apiClient.post("/reviews", payload);
}
