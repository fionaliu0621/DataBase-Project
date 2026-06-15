// src/api/client.js
// 統一的 API 呼叫架構
// - 對應報告 4.5 的後端範例：路由直接是 /orders、/products 等，沒有 /api 前綴
// - 透過 vite.config.js 的 proxy 將這些路徑轉到後端 (http://localhost:3001)
//   例如：server: { proxy: { "/orders": "http://localhost:3001", "/products": "http://localhost:3001", ... } }
//   或設定單一規則把所有後端路徑轉發，視後端組員實際 route 規劃調整
// - 統一處理 JSON 解析與錯誤格式

const BASE_URL = "https://database-project-production-aefc.up.railway.app";

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * 核心請求函式
 * @param {string} path 例如 "/products" 或 "/orders/123"
 * @param {object} options fetch options
 */
async function request(path, options = {}) {
  const { params, ...fetchOptions } = options;

  let url = `${BASE_URL}${path}`;

  // 支援 query string，例如 request("/products", { params: { category: "Electronics" } })
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(fetchOptions.headers || {}),
    },
    ...fetchOptions,
  });

  // 嘗試解析 JSON（即使是錯誤回應，後端通常也會回 { error: "..." }）
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `API Error: ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status, data);
  }

  return data;
}

export const apiClient = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export { ApiError };
