import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getCustomerOrders } from "../api/orders";
import { useApi } from "../hooks/useApi";

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

function statusToTimeline(status) {
  if (status === "canceled" || status === "refund") {
    return TL.map(() => "");
  }
  const order = ["created", "approved", "processing", "shipped", "delivered"];
  const idx = order.indexOf(status);
  if (status === "delivered") return TL.map(() => "done");
  const tlIndex = Math.min(idx, TL.length - 1);
  return TL.map((_, i) => {
    if (i < tlIndex) return "done";
    if (i === tlIndex) return "current";
    return "";
  });
}

export default function OrdersPage() {
  const [q, setQ] = useState("");
  const { customerId } = useAuth();

  const { data, loading, error, refetch } = useApi(
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

  const handleCancel = async (id) => {
    if (!window.confirm('確定要取消這筆訂單嗎？')) return;
    try {
      // 💡 修正 1：把網址中間錯誤的 /api/ 拿掉，對齊你後端的路由
      const res = await fetch(
        `https://database-project-production-aefc.up.railway.app/orders/${id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_status: 'canceled' })
        }
      );

      // 💡 修正 2：加強防禦防炸，如果不是 200 狀態碼，先抓出文字報錯，不盲目轉 JSON
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`伺服器回應錯誤 (${res.status}): ${errText}`);
      }

      const data = await res.json();
      
      // 💡 修正 3：對應後端傳回來的結構
      alert(data.message || data.result || '取消成功');
      window.location.reload();
    } catch (err) {
      // 這樣寫如果再失敗，你就能看到具體的 404 或 500 錯誤，而不是沒用的 Unexpected end...
      alert('取消失敗：' + err.message);
    }
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ padding:"2.5rem", display:"flex", flexDirection:"column", gap:"1rem", maxWidth:900, margin:"0 auto" }}>
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
          const status = order.status ?? order.order_status ?? "created";
          const st = STATUS[status] ?? STATUS.created;
          const id = order.id ?? order.order_id;
          const items = order.items ?? [];
          const total = order.total ?? order.total_amount ?? 0;
          const date = order.date ?? order.order_date ?? order.order_purchase_timestamp;
          const tl = order.tl ?? statusToTimeline(status);

          return (
            <div key={id} style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
              <div style={{ padding:"12px 18px", borderBottom:"0.5px solid #f5f5f5", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, fontFamily:"monospace", color:"#bbb" }}>#{id}</span>
                <span style={{ fontSize:10, padding:"3px 10px", borderRadius:99, fontWeight:500, letterSpacing:"0.3px", background:st.bg, color:st.color }}>{st.label}</span>
                <span style={{ fontSize:11, color:"#bbb", marginLeft:"auto" }}>{date ? new Date(date).toLocaleDateString() : ""}</span>
              </div>
              <div style={{ padding:"12px 18px", display:"flex", flexDirection:"column", gap:8 }}>
                {items.length === 0 && (
                  <div style={{ fontSize:12, color:"#bbb" }}>No items</div>
                )}
                {items.map((it,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
                      <i className="ti ti-package" style={{ fontSize:16 }} aria-hidden="true" />
                    </div>
                    <div style={{ flex:1, fontSize:12 }}>{it.product_name ?? it.name}</div>
                    <div style={{ fontSize:11, color:"#bbb" }}>×{it.qty ?? it.order_item_quantity ?? 1}</div>
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
                {(status==="created" || status==="approved" || status==="processing") && (
                  <button
                    onClick={() => handleCancel(id)}
                    style={{ marginLeft:"auto", padding:"5px 14px", border:"0.5px solid #fcc", borderRadius:99, fontSize:11, cursor:"pointer", background:"#fff", color:"#e24b4a", fontFamily:"'Inter',sans-serif" }}>Cancel order</button>
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
  );
}
