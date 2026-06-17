import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// 評論彈窗：點某個商品後顯示「透過我出貨」那些訂單產生的評論
function ReviewsModal({ sellerId, product, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/sellers/${sellerId}/products/${product.product_id}/reviews`
        );
        if (!res.ok) throw new Error(`伺服器回應錯誤 (${res.status})`);
        const json = await res.json();
        setReviews(Array.isArray(json) ? json : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sellerId, product.product_id]);

  return (
    <div
      style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.3)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}
    >
      <div
        style={{ background:"#fff", borderRadius:16, padding:"2rem", minWidth:380, maxWidth:480, maxHeight:"70vh", overflowY:"auto", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize:13, fontWeight:500, color:"#111", marginBottom:4 }}>{product.product_name}</div>
        <div style={{ fontSize:11, color:"#bbb", marginBottom:16 }}>來自透過你出貨訂單的評論</div>

        {loading && <div style={{ color:"#bbb", fontSize:13 }}>Loading…</div>}
        {error && <div style={{ color:"#e24b4a", fontSize:13 }}>查詢評論失敗：{error}</div>}
        {!loading && !error && reviews.length === 0 && (
          <div style={{ color:"#bbb", fontSize:13 }}>這個商品還沒有透過你出貨的訂單獲得評論。</div>
        )}
        {!loading && !error && reviews.map((r, i) => (
          <div key={i} style={{ padding:"12px 0", borderBottom: i < reviews.length-1 ? "0.5px solid #f5f5f5" : "none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ color:"#c8a96e", fontSize:13 }}>{"★".repeat(r.review_score ?? 0)}</span>
              <span style={{ fontSize:10, color:"#ccc", marginLeft:"auto" }}>
                {r.review_creation_date ? new Date(r.review_creation_date).toLocaleDateString() : ""}
              </span>
            </div>
            {r.review_comment_title && (
              <div style={{ fontSize:12, fontWeight:500, color:"#111", marginBottom:2 }}>{r.review_comment_title}</div>
            )}
            <div style={{ fontSize:12, color:"#888", lineHeight:1.6 }}>{r.review_comment_message}</div>
          </div>
        ))}

        <button
          onClick={onClose}
          style={{ marginTop:20, width:"100%", padding:"8px 0", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:12, cursor:"pointer", background:"#fff", color:"#888", fontFamily:"'Inter',sans-serif" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function SellerProductsPage() {
  const { sellerId } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!sellerId) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${sellerId}/products`);
        if (!res.ok) throw new Error(`伺服器回應錯誤 (${res.status})`);
        const json = await res.json();
        setProducts(Array.isArray(json) ? json : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
          My Products
        </h1>

        <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
          {loading && <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Loading products…</div>}
          {error && <div style={{ padding:"2rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>查詢商品失敗：{error}</div>}
          {!loading && !error && products.length === 0 && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>還沒有任何商品被透過你出貨。</div>
          )}
          {!loading && !error && products.map((p, i) => (
            <div
              key={p.product_id}
              onClick={() => setSelectedProduct(p)}
              style={{
                padding:"14px 20px",
                borderBottom: i < products.length-1 ? "0.5px solid #f5f5f5" : "none",
                display:"flex", alignItems:"center", gap:14,
                cursor:"pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <div style={{ width:36, height:36, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
                <i className="ti ti-package" style={{ fontSize:16 }} aria-hidden="true" />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#111" }}>{p.product_name}</div>
                <div style={{ fontSize:11, color:"#bbb" }}>{p.product_category_name}</div>
              </div>
              <div style={{ fontSize:13, fontWeight:500 }}>NT${Number(p.product_price).toLocaleString()}</div>
              <i className="ti ti-chevron-right" style={{ fontSize:14, color:"#ccc" }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ReviewsModal
          sellerId={sellerId}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
