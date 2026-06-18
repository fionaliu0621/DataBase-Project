import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// 商品縮圖：用 React state 控制顯示圖片或 icon，不直接操作 DOM，
// 避免跟 React 重新渲染時打架，導致「有時顯示、有時不顯示」的不穩定行為。
function ProductThumbnail({ productId, productName }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div style={{ width:44, height:44, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
        <i className="ti ti-package" style={{ fontSize:18 }} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div style={{ width:44, height:44, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
      <img
        src={`/images/${productId}.jpg`}
        alt={productName}
        style={{ width:"100%", height:"100%", objectFit:"cover" }}
        onError={() => setImageError(true)}
      />
    </div>
  );
}

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

        {/* 商品規格摘要 */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, padding:"12px", background:"#fafafa", borderRadius:10, marginBottom:16, marginTop:12 }}>
          {[
            ["Weight", product.product_weight_g != null ? `${product.product_weight_g}g` : "—"],
            ["Length", product.product_length_cm != null ? `${product.product_length_cm}cm` : "—"],
            ["Height", product.product_height_cm != null ? `${product.product_height_cm}cm` : "—"],
            ["Width", product.product_width_cm != null ? `${product.product_width_cm}cm` : "—"],
            ["Photos", product.product_photos_qty ?? "—"],
            ["Stock", product.product_available ?? "—"],
          ].map(([l, v]) => (
            <div key={l} style={{ fontSize:11 }}>
              <span style={{ color:"#bbb" }}>{l}: </span>
              <span style={{ color:"#111", fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </div>

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

// 上架新商品表單彈窗
function NewProductModal({ sellerId, onClose, onCreated }) {
  const [form, setForm] = useState({
    product_name: "",
    product_category_name: "",
    product_price: "",
    product_weight_g: "",
    product_length_cm: "",
    product_height_cm: "",
    product_width_cm: "",
    product_photos_qty: "",
    product_available: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const inputStyle = { width:"100%", height:36, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box", background:"#fafafa" };
  const fieldLabel = { fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:5 };

  const handleChange = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.product_name.trim() || !form.product_price) {
      setError("商品名稱與價格為必填");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/sellers/${sellerId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "上架失敗");
        setSubmitting(false);
        return;
      }
      onCreated();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.3)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={onClose}
    >
      <div
        style={{ background:"#fff", borderRadius:16, padding:"2rem", minWidth:380, maxWidth:440, maxHeight:"80vh", overflowY:"auto", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize:15, fontWeight:500, color:"#111", marginBottom:"1.5rem" }}>上架新商品</div>

        <div style={{ marginBottom:12 }}>
          <div style={fieldLabel}>商品名稱 *</div>
          <input style={inputStyle} value={form.product_name} onChange={handleChange("product_name")} placeholder="例如 Handcrafted Chair" />
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={fieldLabel}>分類</div>
          <input style={inputStyle} value={form.product_category_name} onChange={handleChange("product_category_name")} placeholder="例如 Books" />
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={fieldLabel}>價格 (NT$) *</div>
          <input style={inputStyle} type="number" value={form.product_price} onChange={handleChange("product_price")} placeholder="1351" />
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          <div>
            <div style={fieldLabel}>重量 (g)</div>
            <input style={inputStyle} type="number" value={form.product_weight_g} onChange={handleChange("product_weight_g")} />
          </div>
          <div>
            <div style={fieldLabel}>庫存數量</div>
            <input style={inputStyle} type="number" value={form.product_available} onChange={handleChange("product_available")} />
          </div>
          <div>
            <div style={fieldLabel}>長度 (cm)</div>
            <input style={inputStyle} type="number" value={form.product_length_cm} onChange={handleChange("product_length_cm")} />
          </div>
          <div>
            <div style={fieldLabel}>高度 (cm)</div>
            <input style={inputStyle} type="number" value={form.product_height_cm} onChange={handleChange("product_height_cm")} />
          </div>
          <div>
            <div style={fieldLabel}>寬度 (cm)</div>
            <input style={inputStyle} type="number" value={form.product_width_cm} onChange={handleChange("product_width_cm")} />
          </div>
          <div>
            <div style={fieldLabel}>照片數量</div>
            <input style={inputStyle} type="number" value={form.product_photos_qty} onChange={handleChange("product_photos_qty")} />
          </div>
        </div>

        {error && <div style={{ fontSize:12, color:"#e24b4a", marginBottom:12 }}>{error}</div>}

        <div style={{ display:"flex", gap:8, marginTop:"1.25rem" }}>
          <button
            onClick={onClose}
            style={{ flex:1, padding:"10px 0", border:"0.5px solid #e8e8e8", borderRadius:99, fontSize:12, cursor:"pointer", background:"#fff", color:"#888", fontFamily:"'Inter',sans-serif" }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex:1, padding:"10px 0", border:"none", borderRadius:99, fontSize:12, cursor: submitting ? "default" : "pointer", background: submitting ? "#999" : "#111", color:"#fff", fontFamily:"'Inter',sans-serif" }}
          >
            {submitting ? "上架中…" : "確認上架"}
          </button>
        </div>
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
  const [showNewProductModal, setShowNewProductModal] = useState(false);

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

  useEffect(() => {
    if (!sellerId) return;
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

        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"2rem" }}>
          <div>
            <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:8 }}>SELLER</div>
            <h1 style={{ fontSize:24, fontWeight:300, color:"#111", letterSpacing:"-0.5px", margin:0 }}>
              My Products
            </h1>
          </div>
          <button
            onClick={() => setShowNewProductModal(true)}
            style={{ padding:"10px 18px", border:"none", borderRadius:99, fontSize:12, fontWeight:500, cursor:"pointer", background:"#111", color:"#fff", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:6 }}
          >
            <i className="ti ti-plus" style={{ fontSize:14 }} aria-hidden="true" /> 上架新商品
          </button>
        </div>

        <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
          {loading && <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Loading products…</div>}
          {error && <div style={{ padding:"2rem", textAlign:"center", color:"#e24b4a", fontSize:13 }}>查詢商品失敗：{error}</div>}
          {!loading && !error && products.length === 0 && (
            <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>還沒有任何上架的商品。</div>
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
              <ProductThumbnail productId={p.product_id} productName={p.product_name} />

              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500, color:"#111" }}>{p.product_name}</div>
                <div style={{ fontSize:11, color:"#bbb" }}>
                  {p.product_category_name ?? "—"} · 庫存 {p.product_available ?? "—"}
                </div>
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

      {showNewProductModal && (
        <NewProductModal
          sellerId={sellerId}
          onClose={() => setShowNewProductModal(false)}
          onCreated={() => {
            setShowNewProductModal(false);
            fetchProducts();
          }}
        />
      )}
    </div>
  );
}
