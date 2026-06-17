// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

// 登入時除了 customer_id（或 seller_id）以外，現在多存一個 role：
// role === "customer" -> 買家
// role === "seller"   -> 賣家
// 兩種角色共用同一個 sessionStorage key，欄位用 user_id 統一表示。

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem("auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // userData 預期格式：{ user_id: "cust_000016" | "sell_0090", role: "customer" | "seller", name }
  const login = (userData) => {
    sessionStorage.setItem("auth_user", JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => {
    sessionStorage.removeItem("auth_user");
    setUser(null);
  };

  const role = user?.role ?? null;

  const value = {
    customer: user,                 // 保留舊名稱，避免其他頁面（Navbar 等）一次性全部要改
    customerId: role === "customer" ? user?.user_id ?? null : null,
    sellerId:   role === "seller"   ? user?.user_id ?? null : null,
    userId: user?.user_id ?? null,  // 不分角色都能拿到目前登入的 id
    role,
    isAuthenticated: !!user,
    isSeller: role === "seller",
    isCustomer: role === "customer",
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
