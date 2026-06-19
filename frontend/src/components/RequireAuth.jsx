// src/components/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 包住需要登入才能瀏覽的頁面（例如 /cart, /orders, /seller/dashboard）。
//
// 用法：
//   <RequireAuth><CartPage /></RequireAuth>                  -> 只要登入就能進（不限角色）
//   <RequireAuth role="seller"><SellerDashboardPage /></RequireAuth>  -> 只有指定角色才能進
//
// 未登入 -> 導向 /login，並把原本要去的頁面記在 state.from
// 已登入但角色不對（例如買家想進賣家頁面） -> 導回首頁，不導去 /login（避免無限迴圈感）
export default function RequireAuth({ children, role }) {
  const { isAuthenticated, role: currentRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && currentRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
