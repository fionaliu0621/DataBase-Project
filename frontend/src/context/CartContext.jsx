// src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // 購物車品項目前仍為前端本地狀態（沒有對應的「購物車」表/API）
  // 真正寫入資料庫是在 CartPage 按下「Place order」時呼叫 POST /orders（AddOrder）
  const [items, setItems] = useState([]);

  // 加入購物車：若同一個商品（同 product_id + seller_id）已存在，數量累加；否則新增一筆
  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(it => it.id === product.id && it.seller_id === product.seller_id);
      if (existing) {
        return prev.map(it =>
          it.id === product.id && it.seller_id === product.seller_id
            ? { ...it, qty: it.qty + qty }
            : it
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const updateQty = (id, delta) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it));

  const removeFromCart = (id) =>
    setItems(prev => prev.filter(it => it.id !== id));

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, it) => sum + it.qty, 0);

  const value = { items, addToCart, updateQty, removeFromCart, clearCart, cartCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
