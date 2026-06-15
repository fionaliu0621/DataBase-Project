import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../api/products";
import { useApi } from "../hooks/useApi";
import { useCart } from "../context/CartContext";

const THUMBS = ["ti-headphones","ti-package","ti-plug","ti-file-description"];

const card = { background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem" };
const label = { fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:10 };
const btnBlack = { width:"100%", padding:12, background:"#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.3px", marginBottom:8, fontFamily:"'Inter',sans-serif" };
const btnOutline = { width:"100%", padding:12, background:"transparent", color:"#111", border:"0.5px solid #e0e0e0", borderRadius:99, fontSize:13, cursor:"pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif" };

export default function ProductDetailPage() {
  const { id } = useParams();
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const [added, setAdded] = useState(false);
  const { addToCart, cartCount } = useCart();

  // GET /products/:id
  // 預期回傳形狀（與負責商品 API 的組員確認後可調整 mapping）：
  // {
  //   id, name, category, price, original_price, rating, review_count, stock,
  //   specs: [[key, value], ...],
  //   seller: { id, initials, name, location, joined, stats: [[val, label], ...] },
  //   reviews: [{ initials, name, stars, date, text }, ...]
  // }
  const { data: product, loading, error } = useApi(
    () => getProductById(id),
    [id]
  );

  if (loading) {
    return (
      <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
        <Navbar cartCount={cartCount} />
        <div style={{ padding:"3rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Loading product…</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
        <Navbar cartCount={cartCount} />
        <div style={{ padding:"3rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>
          Failed to load product{error ? `: ${error.message}` : ""}.
        </div>
      </div>
    );
  }

  const price = Number(product.price);
  const originalPrice = Number(product.original_price ?? product.originalPrice ?? price);
  const disc = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const specs = product.specs ?? [];
  const seller = product.seller ?? {};
  const sellerStats = seller.stats ?? [];
  const reviews = product.reviews ?? [];
  const stock = product.stock ?? 0;
  const breadcrumb = ["Home", product.category ?? "Products", product.name ?? ""];

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar breadcrumb={breadcrumb} cartCount={cartCount} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px" }}>

        <div style={{ padding:"2.5rem", display:"flex", flexDirection:"column", gap:"2rem" }}>
          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
            <div style={{ height:280, background:"#f9f9f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <i className={`ti ${THUMBS[thumb]}`} style={{ fontSize:80, color:"#ccc" }} aria-hidden="true" />
            </div>
            <div style={{ display:"flex", gap:8, padding:"12px 16px", borderTop:"0.5px solid #f0f0f0" }}>
              {THUMBS.map((icon,i) => (
                <div key={i} onClick={() => setThumb(i)} style={{ width:48, height:48, borderRadius:8, background: thumb===i ? "#fff" : "#f5f5f5", border: thumb===i ? "1px solid #111" : "1px solid transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color: thumb===i ? "#555" : "#ccc" }}>
                  <i className={`ti ${icon}`} style={{ fontSize:18 }} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={label}>{(product.category ?? "").toUpperCase()}</div>
            <div style={{ fontSize:20, fontWeight:400, color:"#111", lineHeight:1.4, marginBottom:12, letterSpacing:"-0.2px" }}>{product.name}</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.5rem" }}>
              <span style={{ fontSize:12, color:"#c8a96e", fontWeight:500 }}>★ {product.rating ?? "—"}</span>
              <span style={{ fontSize:12, color:"#bbb" }}>{product.review_count ?? product.reviewCount ?? 0} reviews</span>
              <span style={{ fontSize:10, letterSpacing:"1px", padding:"3px 10px", borderRadius:99, border:"0.5px solid #e0e0e0", color:"#888" }}>PREMIUM</span>
            </div>
            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:"1.5rem" }}>
              <span style={{ fontSize:26, fontWeight:400, color:"#111", letterSpacing:"-0.5px" }}>NT${price.toLocaleString()}</span>
              {disc > 0 && (
                <>
                  <span style={{ fontSize:13, color:"#ccc", textDecoration:"line-through" }}>NT${originalPrice.toLocaleString()}</span>
                  <span style={{ fontSize:11, padding:"3px 8px", borderRadius:99, background:"#f5f5f5", color:"#666" }}>−{disc}%</span>
                </>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", border:"0.5px solid #f0f0f0", borderRadius:10, overflow:"hidden" }}>
              {specs.map(([k,v], i) => (
                <div key={k} style={{ padding:"10px 14px", borderBottom:"0.5px solid #f0f0f0", borderRight: i%2===0 ? "0.5px solid #f0f0f0" : "none" }}>
                  <div style={{ fontSize:10, letterSpacing:"0.5px", color:"#bbb", marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{v}</div>
                </div>
              ))}
              <div style={{ gridColumn:"1/-1", padding:"10px 14px" }}>
                <div style={{ fontSize:10, letterSpacing:"0.5px", color:"#bbb", marginBottom:3 }}>AVAILABILITY</div>
                <div style={{ fontSize:13, fontWeight:500, color: stock > 0 ? "#3b6d11" : "#e24b4a" }}>
                  {stock > 0 ? `In stock — ${stock} units` : "Out of stock"}
                </div>
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize:13, fontWeight:500, marginBottom:"1.25rem" }}>Customer reviews</div>
            {reviews.length === 0 && (
              <div style={{ fontSize:12, color:"#bbb" }}>No reviews yet.</div>
            )}
            {reviews.map((r,i) => (
              <div key={i} style={{ padding:"14px 0", borderBottom: i<reviews.length-1 ? "0.5px solid #f5f5f5" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:500, color:"#666" }}>
                    {r.initials ?? (r.name ?? "?").slice(0,2).toUpperCase()}
                  </div>
                  <span style={{ fontSize:12, fontWeight:500 }}>{r.name}</span>
                  <span style={{ color:"#c8a96e", fontSize:11 }}>{"★".repeat(r.stars ?? r.rating ?? 0)}</span>
                  <span style={{ fontSize:11, color:"#ccc", marginLeft:"auto" }}>{r.date}</span>
                </div>
                <div style={{ fontSize:12, color:"#888", lineHeight:1.7 }}>{r.text ?? r.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding:"2.5rem", borderLeft:"0.5px solid #e8e8e8", display:"flex", flexDirection:"column", gap:"1.5rem", background:"#fff" }}>
          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem" }}>
            <div style={{ fontSize:28, fontWeight:400, color:"#111", letterSpacing:"-0.5px", marginBottom:4 }}>NT${price.toLocaleString()}</div>
            <div style={{ fontSize:11, color:"#bbb", marginBottom:"1.25rem", letterSpacing:"0.2px" }}>FREE SHIPPING OVER NT$1,000</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem" }}>
              <span style={{ fontSize:12, color:"#888" }}>Qty</span>
              <div style={{ display:"flex", alignItems:"center", border:"0.5px solid #e0e0e0", borderRadius:99, overflow:"hidden" }}>
                <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:30, height:30, border:"none", background:"#fff", cursor:"pointer", fontSize:16, color:"#555" }}>−</button>
                <span style={{ width:28, textAlign:"center", fontSize:13, fontWeight:500 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(99,q+1))} style={{ width:30, height:30, border:"none", background:"#fff", cursor:"pointer", fontSize:16, color:"#555" }}>+</button>
              </div>
            </div>
            <button
              style={btnBlack}
              onClick={() => {
                addToCart({
                  id: product.id ?? id,
                  name: product.name,
                  seller_id: seller.id ?? seller.seller_id,
                  seller: seller.name,
                  price,
                  icon: THUMBS[0],
                }, qty);
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {added ? "Added ✓" : "Add to bag"}
            </button>
            <button style={btnOutline}>Buy now</button>
            <div style={{ marginTop:"1.25rem", paddingTop:"1.25rem", borderTop:"0.5px solid #f0f0f0", display:"flex", flexDirection:"column", gap:8 }}>
              {[["ti-truck","Est. delivery May 30 – Jun 1"],["ti-shield-check","Buyer protection included"],["ti-refresh","7-day returns"]].map(([icon,text]) => (
                <div key={icon} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#999" }}>
                  <i className={`ti ${icon}`} style={{ fontSize:14 }} aria-hidden="true" /> {text}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem" }}>
            <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:10 }}>SOLD BY</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:34, height:34, borderRadius:"50%", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:500, color:"#555" }}>
                {seller.initials ?? (seller.name ?? "?").slice(0,2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{seller.name}</div>
                <div style={{ fontSize:11, color:"#bbb" }}>{seller.location} · Since {seller.joined}</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {sellerStats.map(([val,lbl]) => (
                <div key={lbl} style={{ background:"#fafafa", borderRadius:8, padding:10, textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:500 }}>{val}</div>
                  <div style={{ fontSize:10, color:"#bbb", letterSpacing:"0.3px", marginTop:2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
