import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders } from "../api/orders";
import { useApi } from "../hooks/useApi";

// 對應 DDL: Orders.order_status CHECK (order_status IN
//   ('created','approved','processing','shipped','delivered','canceled','refund'))
const STATUS = {
  created:    { label:"Created",    bg:"#f5f5f5", color:"#999"    },
  approved:   { label:"Approved",   bg:"#f0fdf4", color:"#3b6d11" },
  processing: { label:"Processing", bg:"#fff9f0", color:"#d97706" },
  shipped:    { label:"Shipped",    bg:"#eef2ff", color:"#3b5bdb" },
  delivered:  { label:"Delivered",  bg:"#f0f0f0", color:"#444"    },
  canceled:   { label:"Canceled",   bg:"#fdecec", color:"#e24b4a" },
  refund:     { label:"Refunded",   bg:"#fdecec", color:"#e24b4a" },
};

const TL = ["Ordered","Paid","Shipped","Delivered"];

// 依訂單狀態推算時間軸點亮到哪個階段
// （後端若直接回傳 timeline/tl 欄位，可直接使用 order.tl 取代此函式）
// 規則 #5：訂單狀態依固定流程推進 created → approved → processing → shipped → delivered
//          任一階段皆可轉換為 canceled/refund，這類狀態不對應特定時間軸點，僅顯示狀態標籤
function statusToTimeline(status) {
  // canceled / refund：不特別點亮時間軸，僅以狀態標籤呈現
  if (status === "canceled" || status === "refund") {
    return TL.map(() => "");
  }
  // 正常流程：created/approved 視為「Ordered」階段，processing 視為「Paid」階段
  const order = ["created", "approved", "processing", "shipped", "delivered"];
  const idx = order.indexOf(status);
  if (status === "delivered") return TL.map(() => "done");

  // 將 5 個訂單狀態對應到 4 個時間軸節點：
  // created/approved -> 0 (Ordered), processing -> 1 (Paid), shipped -> 2 (Shipped), delivered -> 3 (Delivered)
  const tlIndex = Math.min(idx, TL.length - 1);
  return TL.map((_, i) => {
    if (i < tlIndex) return "done";
    if (i === tlIndex) return "current";
    return "";
  });
}

const SIDEBAR = [
  {icon:"ti-user",    label:"Profile"},
  {icon:"ti-package", label:"Orders",   active:true},
  {icon:"ti-heart",   label:"Wishlist"},
  {icon:"ti-map-pin", label:"Addresses"},
  {icon:"ti-credit-card", label:"Payments"},
  {icon:"ti-star",    label:"Reviews"},
];

export default function OrdersPage() {
  const [q, setQ] = useState("");
  const { customerId } = useAuth();

  // GET /customers/:id/orders
  const { data, loading, error } = useApi(
    () => getCustomerOrders(customerId),
    [customerId]
  );

  const orders = Array.isArray(data) ? data : data?.orders ?? [];

  const filtered = orders.filter(o => {
    const id = String(o.id ?? o.order_id ?? "");
    const items = o.items ?? [];
    return (
      id.toLowerCase().includes(q.toLowerCase()) ||
      items.some(it => (it.name ?? it.product_name ?? "").toLowerCase().includes(q.toLowerCase()))
    );
  });

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", minHeight:580 }}>
        <div style={{ padding:"2rem", borderRight:"0.5px solid #e8e8e8", background:"#fff" }}>
          <div style={{ fontSize:10, letterSpacing:"1.5px", color:"#bbb", marginBottom:12 }}>ACCOUNT</div>
          {SIDEBAR.map(item => (
            <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, fontSize:13, cursor:"pointer", marginBottom:2, background: item.active ? "#111" : "transparent", color: item.active ? "#fff" : "#888" }}>
              <i className={`ti ${item.icon}`} style={{ fontSize:14 }} aria-hidden="true" />
              {item.label}
              {item.badge && <span style={{ marginLeft:"auto", fontSize:10, padding:"1px 6px", borderRadius:99, background: item.active ? "rgba(255,255,255,0.2)" : "#f0f0f0", color: item.active ? "#fff" : "#888" }}>{item.badge}</span>}
            </div>
          ))}
        </div>

        <div style={{ padding:"2.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:"#fff", border:"0.5px solid #e8e8e8", borderRadius:8, padding:"0 12px", height:34 }}>
              <i className="ti ti-search" style={{ color:"#ccc", fontSize:13 }} aria-hidden="true" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search orders…" style={{ border:"none", background:"transparent", fontSize:12, outline:"none", flex:1, fontFamily:"'Inter',sans-serif", color:"#111" }} />
            </div>
            <button style={{ height:34, padding:"0 14px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:11, cursor:"pointer", background:"#fff", color:"#888", display:"flex", alignItems:"center", gap:4, fontFamily:"'Inter',sans-serif", letterSpacing:"0.3px" }}>
              <i className="ti ti-filter" style={{ fontSize:12 }} aria-hidden="true" /> Filter
            </button>
          </div>

          {loading && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Loading orders…</div>
          )}

          {error && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>
              Failed to load orders: {error.message}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>No orders found.</div>
          )}

          {!loading && !error && filtered.map(order => {
            const status = order.status ?? "created";
            const st = STATUS[status] ?? STATUS.created;
            const id = order.id ?? order.order_id;
            const items = order.items ?? [];
            const total = order.total ?? order.total_amount ?? 0;
            const date = order.date ?? order.order_date;
            const tl = order.tl ?? statusToTimeline(status);

            return (
              <div key={id} style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"0.5px solid #f5f5f5", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:11, fontFamily:"monospace", color:"#bbb" }}>#{id}</span>
                  <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, fontWeight:500, letterSpacing:"0.3px", background:st.bg, color:st.color }}>{st.label}</span>
                  <span style={{ fontSize:11, color:"#bbb", marginLeft:"auto" }}>{date}</span>
                </div>
                <div style={{ padding:"12px 18px", display:"flex", flexDirection:"column", gap:8 }}>
                  {items.map((it,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
                        <i className={`ti ${it.icon || "ti-package"}`} style={{ fontSize:16 }} aria-hidden="true" />
                      </div>
                      <div style={{ flex:1, fontSize:12 }}>{it.name ?? it.product_name}</div>
                      <div style={{ fontSize:11, color:"#bbb" }}>×{it.qty ?? it.quantity}</div>
                      <div style={{ fontSize:12, fontWeight:500 }}>NT${Number(it.price).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"12px 18px", borderTop:"0.5px solid #f5f5f5", display:"flex", alignItems:"center" }}>
                  {TL.map((lbl,i) => (
                    <>
                      <div key={lbl} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", border:"1.5px solid", borderColor: tl[i]==="done" ? "#111" : tl[i]==="current" ? "#3b5bdb" : "#e0e0e0", background: tl[i]==="done" ? "#111" : tl[i]==="current" ? "#3b5bdb" : "#fafafa", position:"relative", zIndex:1 }} />
                        <div style={{ fontSize:9, letterSpacing:"0.3px", marginTop:4, color: tl[i]==="done" ? "#555" : tl[i]==="current" ? "#3b5bdb" : "#bbb", fontWeight: tl[i]==="current" ? 500 : 400 }}>{lbl}</div>
                      </div>
                      {i<3 && <div style={{ flex:1, height:1, background: tl[i]==="done" ? "#111" : "#e8e8e8", marginTop:-14 }} />}
                    </>
                  ))}
                </div>
                <div style={{ padding:"10px 18px", borderTop:"0.5px solid #f5f5f5", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"#888" }}>Total: <span style={{ color:"#111", fontWeight:500 }}>NT${Number(total).toLocaleString()}</span></span>
                  {status==="delivered" && <>
                    <Link to={`/reviews/${id}`} style={{ marginLeft:"auto", padding:"5px 14px", border:"0.5px solid #e8e8e8", borderRadius:99, fontSize:11, cursor:"pointer", background:"#fff", fontFamily:"'Inter',sans-serif", textDecoration:"none", color:"#111" }}>Write review</Link>
                    <button style={{ padding:"5px 14px", border:"none", borderRadius:99, fontSize:11, cursor:"pointer", background:"#111", color:"#fff", fontFamily:"'Inter',sans-serif" }}>Buy again</button>
                  </>}
                  {status==="shipped" && <button style={{ marginLeft:"auto", padding:"5px 14px", border:"0.5px solid #e8e8e8", borderRadius:99, fontSize:11, cursor:"pointer", background:"#fff", fontFamily:"'Inter',sans-serif" }}>Track package</button>}
                  {/* 規則 #5：created / approved / processing 階段允許取消，
                      delivered / canceled / refund 不可再變更狀態 */}
                  {(status==="created" || status==="approved" || status==="processing") && (
                    <button style={{ marginLeft:"auto", padding:"5px 14px", border:"0.5px solid #fcc", borderRadius:99, fontSize:11, cursor:"pointer", background:"#fff", color:"#e24b4a", fontFamily:"'Inter',sans-serif" }}>Cancel order</button>
                  )}
                  {status==="canceled" && (
                    <span style={{ marginLeft:"auto", fontSize:11, color:"#bbb" }}>This order was canceled.</span>
                  )}
                  {status==="refund" && (
                    <span style={{ marginLeft:"auto", fontSize:11, color:"#bbb" }}>Refund processed.</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
