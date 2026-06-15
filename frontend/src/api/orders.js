// src/api/orders.js
import { apiClient } from "./client";

/**
 * POST /orders
 * 對應 4.2: 新增訂單 -> CALL AddOrder(...)
 * @param {object} payload
 *  {
 *    customer_id, product_id, seller_id,
 *    price, freight_value, shipping_limit_date,
 *    payment_type, payment_value, quantity
 *  }
 * @returns {Promise<{order_id: number}>}
 */
export function createOrder(payload) {
  return apiClient.post("/orders", payload);
}

/**
 * GET /orders/:id
 * 對應 4.2: 查詢單筆訂單 -> SELECT + JOIN
 */
export function getOrderById(orderId) {
  return apiClient.get(`/orders/${orderId}`);
}

/**
 * PATCH /orders/:id/status
 * 對應 4.2: 更新訂單狀態 -> CALL UpdateOrderStatus(...)
 * @param {number|string} orderId
 * @param {string} status 例如 "shipped" | "delivered" | "cancelled"
 */
export function updateOrderStatus(orderId, status) {
  return apiClient.patch(`/orders/${orderId}/status`, { status });
}

/**
 * GET /customers/:id/orders
 * 對應 4.2: 查詢買家訂單歷程 -> SELECT + JOIN
 * 用於 OrdersPage
 */
export function getCustomerOrders(customerId) {
  return apiClient.get(`/customers/${customerId}/orders`);
}
