import { useState } from "react";
import Navbar from "../components/Navbar";
import { getSellers } from "../api/sellers";
import { useApi } from "../hooks/useApi";

export default function SellersPage() {
  const { data, loading, error } = useApi(() => getSellers(), []);
  const sellers = Array.isArray(data) ? data : data?.sellers ?? [];

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const handleSellerClick = async (id) => {
    setSelectedSeller(id);
    setRevenueLoading(true);
    setRevenue(null);
    try {
      const res = await fetch(
        `https://delightful-fascination-production-82e0.up.railway.app/api/orders/seller/${id}/revenue`
      );
      const json = await res.json();
      setRevenue(json.data?.[0] ?? null);
    } catch (err) {
      setRevenue(null);
    }
    setRevenueLoading(false);
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ padding:"4rem 2.5rem 3rem", background:"#fff", borderBottom:"0.5px solid #e8e8e8" }}>
        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:12 }}>VERIFIED PARTNERS</div>
        <h1 style={{ fontSize:34, fontWeight:300, color:"#111", letterSpacing:"-0.5px", marginBottom:10 }}>Sellers</h1>
        <p style={{ fontSize:14, color:"#888", maxWidth:480, lineHeight:1.8 }}>Every seller on ShopHub is verified. Browse by reputation and find the ones you trust.</p>
      </div>

      {/* Revenue Modal */}
      {selectedSeller && (
        <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.3)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={() => { setSelectedSeller(null); setRevenue(null); }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"2rem", minWidth:320, boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:13, fontWeight:500, color:"#111", marginBottom:16 }}>Revenue — {selectedSeller}</div>
            {revenueLoading && <div style={{ color:"#bbb", fontSize:13 }}>Loading…</div>}
            {!revenueLoading && !revenue && <div style={{ color:"#bbb", fontSize:13 }}>No delivered orders yet.</div>}
            {!revenueLoading && revenue && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  ["Total Orders", revenue.total_orders],
                  ["Total Price", `NT$${Number(revenue.total_price).toLocaleString()}`],
                  ["Total Freight", `NT$${Number(revenue.total_freight).toLocaleString()}`],
                  ["Total Revenue", `NT$${Number(revenue.total_revenue).toLocaleString()}`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, borderBottom:"0.5px solid #f5f5f5", paddingBottom:8 }}>
                    <span style={{ color:"#888" }}>{l}</span>
                    <span style={{ fontWeight:500, color:"#111" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setSelectedSeller(null); setRevenue(null); }}
              style={{ marginTop:20, width:"100%", padding:"8px 0", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:12, cursor:"pointer", background:"#fff", color:"#888", fontFamily:"'Inter',sans-serif" }}>
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ padding:"3rem 2.5rem" }}>
        {loading && <div style={{ textAlign:"center", color:"#bbb", fontSize:13, padding:"2rem" }}>Loading sellers…</div>}
        {error && <div style={{ textAlign:"center", color:"#e24b4a", fontSize:13, padding:"2rem" }}>Failed to load sellers: {error.message}</div>}
        {!loading && !error && sellers.length === 0 && <div style={{ textAlign:"center", color:"#bbb", fontSize:13, padding:"2rem" }}>No sellers found.</div>}
        {!loading && !error && sellers.length > 0 && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
            {sellers.map(s => {
              const id = s.id ?? s.seller_id;
              const initials = id?.slice(0,2).toUpperCase() ?? "??";
              return (
                <div key={id} style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem", cursor:"pointer" }}
                  onClick={() => handleSellerClick(id)}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#bbb"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#e8e8e8"}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem" }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:500, color:"#555", flexShrink:0 }}>{initials}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:500, color:"#111", marginBottom:2 }}>{s.name ?? id}</div>
                      <div style={{ fontSize:11, color:"#bbb" }}>{s.location} · Since {s.since}</div>
                    </div>
                    <div style={{ fontSize:13, color:"#c8a96e", fontWeight:500 }}>★ {s.rating}</div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    {[["SOLD", s.sold], ["POSITIVE", s.positive], ["RATING", s.rating + "★"]].map(([l, v]) => (
                      <div key={l} style={{ background:"#fafafa", borderRadius:8, padding:"8px 0", textAlign:"center" }}>
                        <div style={{ fontSize:13, fontWeight:500, color:"#111" }}>{v}</div>
                        <div style={{ fontSize:9, color:"#bbb", letterSpacing:"0.5px", marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
