// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

// ⚠️ 暫時方案
// 因為登入 API 尚未完成，目前預設為「未登入」狀態（customer = null）。
// 使用者需在 LoginPage 輸入 customer_id 才會切換為登入狀態，
// 這樣才能實際測試 RequireAuth（/cart, /orders, /reviews/:order_id）的保護機制。
//
// 之後 LoginPage 串接真實登入 API 後，
// 只需要在登入成功時呼叫 login(customer) 即可，
// 其他頁面透過 useAuth() 取得的 customerId 會自動更新，不需要逐頁修改。

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);

  const login = (customerData) => setCustomer(customerData);
  const logout = () => setCustomer(null);

  const value = {
    customer,
    customerId: customer?.customer_id ?? null,
    isAuthenticated: !!customer,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
