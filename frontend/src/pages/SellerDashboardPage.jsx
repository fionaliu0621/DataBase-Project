import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// 賣家 Dashboard：Revenue 總覽 + 全平台排名。
// 商品列表 + 評論請見 /seller/products，訂單列表請見 /seller/orders。
export default function SellerDashboardPage() {
  const { sellerId } = useAuth();

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);

  const [rankData, setRankData] = useState(null);
  const [rankLoading, setRankLoading] = useState(true);
  const [rankError, setRankError] = useState(null);

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

    const fetchRank = async () => {
      setRankLoading(true);
      setRankError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${sellerId}/rank`);
        const json = await res.json();
        if (json.success) {
          setRankData(json);
        } else {
          setRankError(json.error || "查詢排名失敗");
        }
      } catch (err) {
        setRankError(err.message);
      } finally {
        setRankLoading(false);
      }
    };

    fetchRevenue();
    fetchRank();
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

  // 排名相關的計算：贏過幾位賣家、進度條比例
  const hasRank = !rankLoading && !rankError && rankData && rankData.rank != null;
  const beatenCount = hasRank ? rankData.total - rankData.rank : 0;
  const progressPct = hasRank && rankData.total > 1
    ? Math.round((beatenCount / (rankData.total - 1)) * 100)
    : 0;

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

          {/* 全平台排名 */}
          <div style={{ marginTop:"1.5rem", paddingTop:"1.5rem", borderTop:"0.5px solid #f0f0f0" }}>
            <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:10 }}>PLATFORM RANKING</div>

            {rankLoading && <div style={{ fontSize:13, color:"#bbb" }}>Loading…</div>}
            {rankError && <div style={{ fontSize:13, color:"#e24b4a" }}>查詢排名失敗：{rankError}</div>}
            {!rankLoading && !rankError && rankData && rankData.rank == null && (
              <div style={{ fontSize:13, color:"#bbb" }}>目前沒有已送達的訂單，尚無排名資料。</div>
            )}

            {hasRank && (
              <>
                <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:10 }}>
                  <span style={{ fontSize:20, fontWeight:500, color:"#111" }}>第 {rankData.rank} 名</span>
                  <span style={{ fontSize:12, color:"#bbb" }}>/ 共 {rankData.total} 位賣家</span>
                </div>

                <div style={{ height:8, background:"#f0f0f0", borderRadius:99, overflow:"hidden" }}>
                  <div style={{
                    height:"100%",
                    width:`${progressPct}%`,
                    background:"#111",
                    borderRadius:99,
                    transition:"width 0.3s",
                  }} />
                </div>

                <div style={{ fontSize:11, color:"#bbb", marginTop:8 }}>
                  你贏過了 {beatenCount} 位賣家（前 {100 - progressPct}% 排名）
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
