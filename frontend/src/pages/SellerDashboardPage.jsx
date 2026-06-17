import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// 賣家 Dashboard：只放 Revenue 總覽。
// 商品列表 + 評論請見 /seller/products，訂單列表請見 /seller/orders。
export default function SellerDashboardPage() {
  const { sellerId } = useAuth();

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchRevenue = async () => {
      setRevenueLoading(true);
      setRevenueError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/revenue/${sellerId}`);
        const json = await res.json();
        if (json.success) {
          setRevenue(json.data);
        } else {
          setRevenueError(json.error || "查詢營收失敗");
        }
      } catch (err) {
        setRevenueError(err.message);
      } finally {
        setRevenueLoading(false);
      }
    };

    fetchRevenue();
  }, [sellerId]);

  if (!sellerId) {
    return (
      <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
        <Navbar />
        <div style={{ padding:"3rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>
          無法取得 Seller ID，請重新登入。
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />

      <div style={{ padding:"2.5rem", maxWidth:900, margin:"0 auto" }}>

        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:8 }}>SELLER DASHBOARD</div>
        <h1 style={{ fontSize:24, fontWeight:300, color:"#111", letterSpacing:"-0.5px", marginBottom:"2rem" }}>
          {sellerId}
        </h1>

        <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem" }}>
          <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.25rem" }}>MY REVENUE</div>
          {revenueLoading && <div style={{ fontSize:13, color:"#bbb" }}>Loading…</div>}
          {revenueError && <div style={{ fontSize:13, color:"#e24b4a" }}>查詢營收失敗：{revenueError}</div>}
          {!revenueLoading && !revenueError && !revenue && (
            <div style={{ fontSize:13, color:"#bbb" }}>目前沒有已送達（delivered）的訂單，尚無營收紀錄。</div>
          )}
          {!revenueLoading && !revenueError && revenue && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
              {[
                ["Total Orders", revenue.total_orders],
                ["Total Price", `NT$${Number(revenue.total_price).toLocaleString()}`],
                ["Total Freight", `NT$${Number(revenue.total_freight).toLocaleString()}`],
                ["Total Revenue", `NT$${Number(revenue.total_revenue).toLocaleString()}`],
              ].map(([l, v]) => (
                <div key={l} style={{ background:"#fafafa", borderRadius:10, padding:"14px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:500, color:"#111" }}>{v}</div>
                  <div style={{ fontSize:10, color:"#bbb", letterSpacing:"0.3px", marginTop:4 }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
