// src/api/payments.js
import { apiClient } from "./client";

/**
 * GET /payments
 * 對應 4.2(原本表格中第二份): 付款API
 * @param {object} [filters] 例如 { order_id }
 */
export function getPayments(filters) {
  return apiClient.get("/payments", filters);
}
