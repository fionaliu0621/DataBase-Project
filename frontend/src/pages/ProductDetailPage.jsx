//
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProductById } from "../api/products";
import { useApi } from "../hooks/useApi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const THUMBS = ["ti-headphones","ti-package","ti-plug","ti-file-description"];
const card = { background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem" };
const label = { fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:10 };
const btnBlack = { width:"100%", padding:12, background:"#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.3px", marginBottom:8, fontFamily:"'Inter',sans-serif" };
const btnOutline = { width:"100%", padding:12, background:"transparent", color:"#111", border:"0.5px solid #e0e0e0", borderRadius:99, fontSize:13, cursor:"pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif" };

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, cartCount } = useCart();
  const { customerId } = useAuth();

  const [reviewScore, setReviewScore] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  const { data: product, loading, error } = useApi(
    () => getProductById(id),
    [id]
  );

  const handleSubmitReview = async () => {
    if (!reviewMessage.trim()) {
      setReviewError("請輸入評論內容");
      return;
    }
    setReviewSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      const res = await fetch(
        `https://database-project-production-aefc.up.railway.app/products/${id}/order`
      );
      const json = await res.json();
      const order_id = json.order_id;

      if (!order_id) {
        setReviewError("找不到對應訂單，無法送出評論");
        setReviewSubmitting(false);
        return;
      }

      const reviewRes = await fetch(
        `https://database-project-production-aefc.up.railway.app/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id,
            review_score: reviewScore,
            review_comment_title: reviewTitle,
            review_comment_message: reviewMessage,
          }),
        }
      );
      const reviewJson = await reviewRes.json();
      if (reviewJson.success) {
        setReviewSuccess("評論送出成功！");
        setReviewTitle("");
        setReviewMessage("");
        setReviewScore(5);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setReviewError(reviewJson.error ?? "送出失敗");
      }
    } catch (err) {
      setReviewError(err.message);
    }
    setReviewSubmitting(false);
  };

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

  const handleAddToCart = () => {
    if (stock === 0) return;
    addToCart({
      id: product.id ?? id,
      name: product.name,
      seller_id: seller.id ?? seller.seller_id,
      seller: seller.name,
      price,
      icon: THUMBS[0],
    }, qty);
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar breadcrumb={breadcrumb} cartCount={cartCount} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px" }}>

        <div style={{ padding:"2.5rem", display:"flex", flexDirection:"column", gap:"2rem" }}>

          {/* Product image */}
          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
            <div style={{ height:320, background:"#f9f9f9", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img
                src={`/images/${id}.jpg`}
                alt={product.name}
                style={{ width:"100%", height:"100%", objectFit:"contain" }}
              />
            </div>
          </div>

          {/* Product info */}
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

          {/* Customer Reviews */}
          <div style={card}>
            <div style={{ fontSize:13, fontWeight:500, marginBottom:"1.25rem" }}>Customer reviews</div>
            {reviews.length === 0 && (
              <div style={{ fontSize:12, color:"#bbb", marginBottom:"1.25rem" }}>No reviews yet.</div>
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

            {/* Write a review form */}
            <div style={{ marginTop:"1.5rem", paddingTop:"1.5rem", borderTop:"0.5px solid #f0f0f0" }}>
              <div style={{ fontSize:12, fontWeight:500, marginBottom:12 }}>Write a review</div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:6 }}>RATING</div>
                <div style={{ display:"flex", gap:4 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} onClick={() => setReviewScore(n)}
                      style={{ fontSize:22, cursor:"pointer", color: n <= reviewScore ? "#c8a96e" : "#e0e0e0" }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:6 }}>TITLE</div>
                <input
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="Summary of your review"
                  style={{ width:"100%", height:36, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box", background:"#fafafa" }}
                />
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:6 }}>REVIEW</div>
                <textarea
                  value={reviewMessage}
                  onChange={e => setReviewMessage(e.target.value)}
                  placeholder="Share your experience with this product"
                  rows={3}
                  style={{ width:"100%", padding:"10px 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box", background:"#fafafa", resize:"none" }}
                />
              </div>
              {reviewError && <div style={{ fontSize:12, color:"#e24b4a", marginBottom:8 }}>{reviewError}</div>}
              {reviewSuccess && <div style={{ fontSize:12, color:"#3b6d11", marginBottom:8 }}>{reviewSuccess}</div>}
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                style={{ padding:"8px 20px", background: reviewSubmitting ? "#999" : "#111", color:"#fff", border:"none", borderRadius:99, fontSize:12, cursor: reviewSubmitting ? "default" : "pointer", fontFamily:"'Inter',sans-serif" }}>
                {reviewSubmitting ? "Submitting…" : "Submit review"}
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ padding:"2.5rem", borderLeft:"0.5px solid #e8e8e8", display:"flex", flexDirection:"column", gap:"1.5rem", background:"#fff" }}>
          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem" }}>
            <div style={{ fontSize:28, fontWeight:400, color:"#111", letterSpacing:"-0.5px", marginBottom:4 }}>NT${price.toLocaleString()}</div>
            <div style={{ fontSize:11, color:"#bbb", marginBottom:"1.25rem", letterSpacing:"0.2px" }}>FREE SHIPPING OVER NT$1,000</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem" }}>
              <span style={{ fontSize:12, color:"#888" }}>Qty</span>
              <div style={{ display:"flex", alignItems:"center", border:"0.5px solid #e0e0e0", borderRadius:99, overflow:"hidden" }}>
                <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ width:30, height:30, border:"none", background:"#fff", cursor:"pointer", fontSize:16, color:"#555" }}>−</button>
                <span style={{ width:28, textAlign:"center", fontSize:13, fontWeight:500 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(stock,q+1))} style={{ width:30, height:30, border:"none", background:"#fff", cursor:"pointer", fontSize:16, color:"#555" }}>+</button>
              </div>
            </div>
            <button
              style={{ ...btnBlack, background: stock === 0 ? "#ccc" : "#111", cursor: stock === 0 ? "default" : "pointer" }}
              disabled={stock === 0}
              onClick={() => {
                handleAddToCart();
                setAdded(true);
                setTimeout(() => setAdded(false), 1500);
              }}
            >
              {stock === 0 ? "Out of stock" : added ? "Added ✓" : "Add to bag"}
            </button>
            <button
              style={{ ...btnOutline, opacity: stock === 0 ? 0.5 : 1, cursor: stock === 0 ? "default" : "pointer" }}
              disabled={stock === 0}
              onClick={() => {
                handleAddToCart();
                navigate("/cart");
              }}
            >
              {stock === 0 ? "Out of stock" : "Buy now"}
            </button>
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
