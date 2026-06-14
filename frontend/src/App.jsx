import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage          from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage          from "./pages/CartPage";
import OrdersPage        from "./pages/OrdersPage";
import ReviewPage        from "./pages/ReviewPage";
import LoginPage         from "./pages/LoginPage";
import CollectionsPage   from "./pages/CollectionsPage";
import SellersPage       from "./pages/SellersPage";
import AboutPage         from "./pages/AboutPage";
import RequireAuth       from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/products/:id"      element={<ProductDetailPage />} />
        <Route path="/cart"              element={<RequireAuth><CartPage /></RequireAuth>} />
        <Route path="/orders"            element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="/reviews/:order_id" element={<RequireAuth><ReviewPage /></RequireAuth>} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/collections"       element={<CollectionsPage />} />
        <Route path="/sellers"           element={<SellersPage />} />
        <Route path="/about"             element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
