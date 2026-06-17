import { useState, useEffect } from "react";
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

export default function SellerOrdersPage() {
  const { sellerId } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${sellerId}/orders`);
        if (!res.ok) throw new Error(`伺服器回應錯誤 (${res.status})`);
        const json = await res.json();
        setOrders(Array.isArray(json) ? json : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:8 }}>SELLER</div>
        <h1 style={{ fontSize:24, fontWeight:300, color:"#111", letterSpacing:"-0.5px", marginBottom:"2rem" }}>
          Orders Received
        </h1>

        <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
          {loading && <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Loading orders…</div>}
          {error && <div style={{ padding:"2rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>查詢訂單失敗：{error}</div>}
          {!loading && !error && orders.length === 0 && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>還沒有收到任何訂單。</div>
          )}
          {!loading && !error && orders.map((o, i) => {
            const st = STATUS[o.order_status] ?? STATUS.created;
            return (
              <div key={`${o.order_id}-${i}`} style={{ padding:"14px 20px", borderBottom: i < orders.length-1 ? "0.5px solid #f5f5f5" : "none", display:"flex", alignItems:"center", gap:14 }}>
                <span style={{ fontSize:11, fontFamily:"monospace", color:"#bbb", flexShrink:0 }}>#{o.order_id}</span>
                <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, fontWeight:500, letterSpacing:"0.3px", background:st.bg, color:st.color, flexShrink:0 }}>{st.label}</span>
                <span style={{ fontSize:12, color:"#888", flex:1 }}>{o.product_name ?? "—"}</span>
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
