import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "https://database-project-production-aefc.up.railway.app";

const STATUS = {
  created:    { label:"Created",    bg:"#f5f5f5", color:"#999"    },
  processing: { label:"Processing", bg:"#fff9f0", color:"#d97706" },
  approved:   { label:"Approved",   bg:"#f0fdf4", color:"#3b6d11" },
  shipped:    { label:"Shipped",    bg:"#eef2ff", color:"#3b5bdb" },
  delivered:  { label:"Delivered",  bg:"#f0f0f0", color:"#444"    },
  canceled:   { label:"Canceled",   bg:"#fdecec", color:"#e24b4a" },
};

// 出貨時間輸入 Modal
function ShipModal({ orderId, onClose, onSuccess }) {
  const [carrierDate, setCarrierDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleShip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/ship`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier_date: carrierDate || null }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`伺服器回應錯誤 (${res.status}): ${errText}`);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.3)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}
    >
      <div
        style={{ background:"#fff", borderRadius:16, padding:"2rem", minWidth:340, boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize:14, fontWeight:500, color:"#111", marginBottom:4 }}>確認出貨</div>
        <div style={{ fontSize:12, color:"#bbb", marginBottom:20 }}>訂單 #{orderId}</div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:6 }}>出貨時間（留空則使用現在時間）</div>
          <input
            type="datetime-local"
            value={carrierDate}
            onChange={e => setCarrierDate(e.target.value)}
            style={{ width:"100%", height:36, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box", background:"#fafafa" }}
          />
        </div>

        {error && <div style={{ fontSize:12, color:"#e24b4a", marginBottom:12 }}>{error}</div>}

        <div style={{ display:"flex", gap:8 }}>
          <button
            onClick={onClose}
            style={{ flex:1, padding:"8px 0", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:12, cursor:"pointer", background:"#fff", color:"#888", fontFamily:"'Inter',sans-serif" }}
          >
            取消
          </button>
          <button
            onClick={handleShip}
            disabled={loading}
            style={{ flex:1, padding:"8px 0", border:"none", borderRadius:8, fontSize:12, cursor: loading ? "default" : "pointer", background: loading ? "#999" : "#111", color:"#fff", fontFamily:"'Inter',sans-serif" }}
          >
            {loading ? "處理中..." : "確認出貨"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  const { sellerId } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipModalOrderId, setShipModalOrderId] = useState(null);

  const fetchOrders = async () => {
    if (!sellerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/sellers/${sellerId}/orders`);
      if (!res.ok) throw new Error(`伺服器回應錯誤 (${res.status})`);
      const json = await res.json();
      setOrders(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [sellerId]);

  const handleApprove = async (orderId) => {
    if (!window.confirm(`確定要接受訂單 #${orderId} 嗎？`)) return;
    try {
      const res = await fetch(`${BASE_URL}/orders/${orderId}/approve`, { method: "PATCH" });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`伺服器回應錯誤 (${res.status}): ${errText}`);
      }
      alert("已確認接單！");
      fetchOrders();
    } catch (err) {
      alert("操作失敗：" + err.message);
    }
  };

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
              <div key={`${o.order_id}-${i}`} style={{ padding:"14px 20px", borderBottom: i < orders.length-1 ? "0.5px solid #f5f5f5" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:"#bbb", flexShrink:0 }}>#{o.order_id}</span>
                  <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, fontWeight:500, letterSpacing:"0.3px", background:st.bg, color:st.color, flexShrink:0 }}>{st.label}</span>
                  <span style={{ fontSize:12, color:"#888", flex:1 }}>{o.product_name ?? "—"}</span>
                  <span style={{ fontSize:11, color:"#bbb" }}>×{o.order_item_quantity}</span>
                  <span style={{ fontSize:13, fontWeight:500 }}>NT${Number(o.price).toLocaleString()}</span>

                  {/* 賣家操作按鈕 */}
                  {o.order_status === "created" && (
                    <button
                      onClick={() => handleApprove(o.order_id)}
                      style={{ padding:"5px 14px", border:"none", borderRadius:99, fontSize:11, cursor:"pointer", background:"#111", color:"#fff", fontFamily:"'Inter',sans-serif", flexShrink:0 }}
                    >
                      確認接單
                    </button>
                  )}
                  {o.order_status === "approved" && (
                    <button
                      onClick={() => setShipModalOrderId(o.order_id)}
                      style={{ padding:"5px 14px", border:"none", borderRadius:99, fontSize:11, cursor:"pointer", background:"#3b5bdb", color:"#fff", fontFamily:"'Inter',sans-serif", flexShrink:0 }}
                    >
                      確認出貨
                    </button>
                  )}
                </div>

                {/* 時間資訊 */}
                <div style={{ marginTop:6, display:"flex", gap:16, fontSize:11, color:"#bbb", paddingLeft:0 }}>
                  <span>下單：{o.order_purchase_timestamp ? new Date(o.order_purchase_timestamp).toLocaleString() : "—"}</span>
                  {o.order_approved_at && <span>接單：{new Date(o.order_approved_at).toLocaleString()}</span>}
                  {o.order_delivered_carrier_date && <span>出貨：{new Date(o.order_delivered_carrier_date).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {shipModalOrderId && (
        <ShipModal
          orderId={shipModalOrderId}
          onClose={() => setShipModalOrderId(null)}
          onSuccess={() => {
            setShipModalOrderId(null);
            alert("已確認出貨！");
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
