import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// 純 SVG 折線圖，不依賴任何外部圖表套件
function SalesTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ fontSize:13, color:"#bbb", textAlign:"center", padding:"2.5rem 0" }}>
        尚無足夠的銷售資料繪製趨勢圖。
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padding = { top: 16, right: 16, bottom: 28, left: 56 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {/* y 軸格線 + 數值標籤 */}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => {
        const y = padding.top + chartHeight * (1 - frac);
        return (
          <g key={frac}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} fontSize="9" fill="#bbb" textAnchor="end">
              NT${Math.round(maxRevenue * frac).toLocaleString()}
            </text>
          </g>
        );
      })}

      {/* 折線 */}
      <path d={pathD} fill="none" stroke="#111" strokeWidth="2" />

      {/* 資料點 + x 軸標籤 */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#111" />
          <text x={p.x} y={height - 8} fontSize="9" fill="#bbb" textAnchor="middle">
            {p.period}
          </text>
        </g>
      ))}
    </svg>
  );
}

// 賣家 Dashboard：Revenue 總覽 + 全平台排名 + 銷售趨勢折線圖。
// 商品列表 + 評論請見 /seller/products，訂單列表請見 /seller/orders。
export default function SellerDashboardPage() {
  const { sellerId } = useAuth();

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);

  const [rankData, setRankData] = useState(null);
  const [rankLoading, setRankLoading] = useState(true);
  const [rankError, setRankError] = useState(null);

  const [trendPeriod, setTrendPeriod] = useState("month"); // "month" | "quarter"
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState(null);

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

  useEffect(() => {
    if (!sellerId) return;

    const fetchTrend = async () => {
      setTrendLoading(true);
      setTrendError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${sellerId}/sales-trend?period=${trendPeriod}`);
        if (!res.ok) throw new Error(`伺服器回應錯誤 (${res.status})`);
        const json = await res.json();
        setTrendData(Array.isArray(json) ? json : []);
      } catch (err) {
        setTrendError(err.message);
      } finally {
        setTrendLoading(false);
      }
    };

    fetchTrend();
  }, [sellerId, trendPeriod]);

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

        {/* Revenue + Ranking */}
        <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem", marginBottom:"2rem" }}>
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

        {/* Sales Trend */}
        <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
            <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb" }}>SALES TREND</div>
            <div style={{ display:"flex", gap:6 }}>
              {[["month","月"], ["quarter","季"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTrendPeriod(val)}
                  style={{
                    padding:"5px 14px", borderRadius:99, fontSize:11, cursor:"pointer",
                    fontFamily:"'Inter',sans-serif",
                    border: trendPeriod === val ? "1px solid #111" : "0.5px solid #e8e8e8",
                    background: trendPeriod === val ? "#111" : "#fff",
                    color: trendPeriod === val ? "#fff" : "#666",
                  }}
                >
                  按{label}
                </button>
              ))}
            </div>
          </div>

          {trendLoading && <div style={{ fontSize:13, color:"#bbb", textAlign:"center", padding:"2.5rem 0" }}>Loading…</div>}
          {trendError && <div style={{ fontSize:13, color:"#e24b4a", textAlign:"center", padding:"2.5rem 0" }}>查詢銷售趨勢失敗：{trendError}</div>}
          {!trendLoading && !trendError && <SalesTrendChart data={trendData} />}
        </div>
      </div>
    </div>
  );
}
