import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage              from "./pages/HomePage";
import ProductDetailPage     from "./pages/ProductDetailPage";
import CartPage              from "./pages/CartPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage            from "./pages/OrdersPage";
import ReviewPage            from "./pages/ReviewPage";
import LoginPage             from "./pages/LoginPage";
import SellersPage           from "./pages/SellersPage";
import AboutPage             from "./pages/AboutPage";
import SellerDashboardPage   from "./pages/SellerDashboardPage"; // 新增
import RequireAuth           from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<HomePage />} />
        <Route path="/products/:id"       element={<ProductDetailPage />} />
        <Route path="/cart"               element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/order-confirmation" element={<RequireAuth><OrderConfirmationPage /></RequireAuth>} />
        <Route path="/orders"             element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="/reviews/:order_id"  element={<RequireAuth><ReviewPage /></RequireAuth>} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/sellers"            element={<SellersPage />} />
        <Route path="/about"              element={<AboutPage />} />
        {/* 新增：賣家專屬，role="seller" 才能進，否則 RequireAuth 會導回首頁 */}
        <Route path="/seller/dashboard"   element={<RequireAuth role="seller"><SellerDashboardPage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
