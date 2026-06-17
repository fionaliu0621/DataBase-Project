import { useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const STATUS = {
  created:    { label:"Created",    bg:"#f5f5f5", color:"#999"    },
  processing: { label:"Processing", bg:"#fff9f0", color:"#d97706" },
  approved:   { label:"Approved",   bg:"#f0fdf4", color:"#3b6d11" },
  shipped:    { label:"Shipped",    bg:"#eef2ff", color:"#3b5bdb" },
  delivered:  { label:"Delivered",  bg:"#f0f0f0", color:"#444"    },
  canceled:   { label:"Canceled",   bg:"#fdecec", color:"#e24b4a" },
};

// 賣家登入後看到的頁面：上半部自己的營收（CALL GetSellerRevenue），
// 下半部自己收到的訂單列表（GET /sellers/:id/orders，依 seller_id 過濾 Order_Items）。
export default function SellerDashboardPage() {
  const { sellerId } = useAuth();

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

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

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${sellerId}/orders`);
      if (!res.ok) throw new Error(`伺服器回應錯誤 (${res.status})`);
      const json = await res.json();
      setOrders(Array.isArray(json) ? json : []);
    } catch (err) {
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useState(() => {
    fetchRevenue();
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />

      <div style={{ padding:"2.5rem", maxWidth:900, margin:"0 auto" }}>

        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:8 }}>SELLER DASHBOARD</div>
        <h1 style={{ fontSize:24, fontWeight:300, color:"#111", letterSpacing:"-0.5px", marginBottom:"2rem" }}>
          {sellerId}
        </h1>

        {/* Revenue */}
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
        </div>

        {/* Orders received */}
        <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.25rem" }}>ORDERS RECEIVED</div>
        <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
          {ordersLoading && <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Loading orders…</div>}
          {ordersError && <div style={{ padding:"2rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>查詢訂單失敗：{ordersError}</div>}
          {!ordersLoading && !ordersError && orders.length === 0 && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>還沒有收到任何訂單。</div>
          )}
          {!ordersLoading && !ordersError && orders.map((o, i) => {
            const st = STATUS[o.order_status] ?? STATUS.created;
            return (
              <div key={o.order_id} style={{ padding:"14px 20px", borderBottom: i < orders.length-1 ? "0.5px solid #f5f5f5" : "none", display:"flex", alignItems:"center", gap:14 }}>
                <span style={{ fontSize:11, fontFamily:"monospace", color:"#bbb", flexShrink:0 }}>#{o.order_id}</span>
                <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, fontWeight:500, letterSpacing:"0.3px", background:st.bg, color:st.color, flexShrink:0 }}>{st.label}</span>
                <span style={{ fontSize:12, color:"#888", flex:1 }}>{o.product_name}</span>
                <span style={{ fontSize:11, color:"#bbb" }}>×{o.order_item_quantity}</span>
                <span style={{ fontSize:13, fontWeight:500 }}>NT${Number(o.price).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
