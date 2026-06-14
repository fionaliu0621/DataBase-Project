// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 包住需要登入才能瀏覽的頁面（例如 /cart, /orders）。
// 未登入時導向 /login，並把原本要去的頁面記在 state.from，
// 方便 LoginPage 登入成功後導回原頁面。
//
// ⚠️ 注意：目前 AuthContext 預設帶有一個測試帳號（isAuthenticated 永遠為 true），
// 所以這個保護現在不會擋下任何人；等登入 API 真正接上後才會生效。
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
