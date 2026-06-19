import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createReview, getReviews } from "../api/reviews";
import { getOrderById } from "../api/orders";
import { useApi } from "../hooks/useApi";

const LABELS = ["","Terrible","Poor","Average","Good","Excellent"];

const input = { width:"100%", height:38, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, color:"#111", background:"#fafafa", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };

export default function ReviewPage() {
  const { order_id } = useParams();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(() => {
    try {
      const reviewed = JSON.parse(sessionStorage.getItem("reviewed_orders") || "[]");
      return reviewed.includes(order_id);
    } catch { return false; }
  });
  const { customerId } = useAuth();
  const displayed = hovered || rating;

  // GET /orders/:id -> 取得這筆訂單的商品資訊（用於上方卡片顯示）
  // 注意：4.2 表格中 /orders/:id 為 SELECT + JOIN，預期至少回傳
  // { order_id, status, delivered_date, items: [{ product_id, name, icon }, ...] }
  const { data: order, loading: orderLoading, error: orderError } = useApi(
    () => getOrderById(order_id),
    [order_id]
  );

  const firstItem = order?.items?.[0] ?? {};
  const productId = firstItem.product_id ?? firstItem.id;
  const productName = firstItem.name ?? firstItem.product_name ?? "—";
  const productIcon = firstItem.icon ?? "ti-package";
  const deliveredDate = order?.delivered_date ?? order?.date ?? "—";

  // GET /reviews?product_id=... 顯示這個商品的既有評論與評分分佈
  const { data, loading: reviewsLoading, refetch } = useApi(
    () => getReviews({ product_id: productId }),
    [productId]
  );

  const reviewsData = data ?? {};
  const reviewList = reviewsData.reviews ?? (Array.isArray(data) ? data : []);
  const summary = reviewsData.summary ?? null; // { avg, count, bars: [{stars, count, pct}, ...] }

  // POST /reviews
  // 注意：trg_review_check 會檢查訂單是否已 delivered，
  // 若未 delivered，後端應回傳錯誤，這裡會顯示在 submitError
  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setSubmitError("請填寫標題與評論內容");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createReview({
        order_id,
        product_id: productId,
        customer_id: customerId,
        rating,
        title,
        body,
      });
      setSubmitted(true);
      // 記錄這筆訂單已評論
      try {
        const reviewed = JSON.parse(sessionStorage.getItem("reviewed_orders") || "[]");
        reviewed.push(order_id);
        sessionStorage.setItem("reviewed_orders", JSON.stringify(reviewed));
      } catch {}
      setTitle("");
      setBody("");
      refetch(); // 重新載入評論列表
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:0 }}>
        <div style={{ padding:"2.5rem" }}>
          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem" }}>
            <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.25rem" }}>WRITE A REVIEW</div>
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:14, background:"#fafafa", borderRadius:10, marginBottom:"1.5rem" }}>
              <div style={{ width:44, height:44, borderRadius:10, background:"#fff", border:"0.5px solid #e8e8e8", display:"flex", alignItems:"center", justifyContent:"center", color:"#ccc" }}>
                <i className={`ti ${productIcon}`} style={{ fontSize:20 }} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>
                  {orderLoading ? "Loading…" : productName}
                </div>
                <div style={{ fontSize:11, color:"#bbb", fontFamily:"monospace" }}>Order #{order_id} · Delivered {deliveredDate}</div>
              </div>
            </div>

            {orderError && (
              <div style={{ fontSize:12, color:"#e24b4a", marginBottom:"1rem" }}>
                無法載入訂單資訊：{orderError.message}
              </div>
            )}

            <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:10 }}>OVERALL RATING</div>
            <div style={{ display:"flex", gap:8, marginBottom:8 }}>
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => setRating(v)} onMouseEnter={() => setHovered(v)} onMouseLeave={() => setHovered(0)}
                  style={{ width:38, height:38, borderRadius:8, border:"0.5px solid", borderColor: v<=displayed ? "#c8a96e" : "#e8e8e8", background: v<=displayed ? "#fffbf3" : "transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color: v<=displayed ? "#c8a96e" : "#ccc", fontSize:18 }}>
                  <i className="ti ti-star" style={{ fontSize:18 }} aria-hidden="true" />
                </button>
              ))}
            </div>
            {displayed > 0 && <div style={{ fontSize:12, color:"#3b6d11", marginBottom:"1.5rem", fontWeight:500 }}>{LABELS[displayed]}</div>}

            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:5 }}>TITLE</div>
              <input value={title} onChange={e=>setTitle(e.target.value)} style={input} placeholder="Summarize your experience" />
            </div>
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:5 }}>YOUR REVIEW</div>
              <textarea value={body} onChange={e=>setBody(e.target.value)} style={{ ...input, height:90, padding:12, resize:"vertical" }} placeholder="Share details about your experience…" />
            </div>

            {submitError && (
              <div style={{ fontSize:12, color:"#e24b4a", marginBottom:10, lineHeight:1.6 }}>
                送出失敗：{submitError}
              </div>
            )}
            {submitted && (
              <div style={{ fontSize:12, color:"#3b6d11", marginBottom:10, lineHeight:1.6 }}>
                此訂單已評論過，感謝你的回饋！
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || submitted}
              style={{ width:"100%", padding:12, background: submitting ? "#999" : "#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor: submitting ? "default" : "pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <i className="ti ti-send" aria-hidden="true" /> {submitting ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </div>

        <div style={{ padding:"2.5rem", borderLeft:"0.5px solid #e8e8e8", background:"#fff", display:"flex", flexDirection:"column", gap:"1.5rem" }}>
          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem" }}>
            {reviewsLoading && (
              <div style={{ textAlign:"center", color:"#bbb", fontSize:12, padding:"1rem 0" }}>Loading review stats…</div>
            )}
            {!reviewsLoading && summary && (
              <>
                <div style={{ textAlign:"center", marginBottom:"1rem", paddingBottom:"1rem", borderBottom:"0.5px solid #f0f0f0" }}>
                  <div style={{ fontSize:40, fontWeight:300, color:"#111", lineHeight:1, letterSpacing:"-1px" }}>{summary.avg?.toFixed?.(1) ?? summary.avg}</div>
                  <div style={{ color:"#c8a96e", fontSize:16, margin:"6px 0 4px" }}>★★★★★</div>
                  <div style={{ fontSize:11, color:"#bbb", letterSpacing:"0.3px" }}>{summary.count} REVIEWS</div>
                </div>
                {(summary.bars ?? []).map(r => (
                  <div key={r.stars} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, fontSize:11 }}>
                    <span style={{ color:"#bbb", width:10, textAlign:"right", flexShrink:0 }}>{r.stars}</span>
                    <div style={{ flex:1, height:4, background:"#f5f5f5", borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", background:"#c8a96e", borderRadius:99, width:(r.pct ?? 0)+"%" }} />
                    </div>
                    <span style={{ color:"#bbb", width:22, textAlign:"right", flexShrink:0 }}>{r.count}</span>
                  </div>
                ))}
              </>
            )}
            {!reviewsLoading && !summary && (
              <div style={{ textAlign:"center", color:"#bbb", fontSize:12, padding:"1rem 0" }}>No rating data yet.</div>
            )}
          </div>

          <div style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem" }}>
            <div style={{ fontSize:11, letterSpacing:"1px", color:"#bbb", marginBottom:"1rem" }}>RECENT REVIEWS</div>
            {reviewsLoading && (
              <div style={{ textAlign:"center", color:"#bbb", fontSize:12, padding:"1rem 0" }}>Loading…</div>
            )}
            {!reviewsLoading && reviewList.length === 0 && (
              <div style={{ textAlign:"center", color:"#bbb", fontSize:12, padding:"1rem 0" }}>No reviews yet.</div>
            )}
            {!reviewsLoading && reviewList.map((r,i) => (
              <div key={r.id ?? i} style={{ padding:"12px 0", borderBottom: i<reviewList.length-1 ? "0.5px solid #f5f5f5" : "none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:500, color:"#666", flexShrink:0 }}>
                    {(r.initials) ?? (r.name ?? r.customer_name ?? "?").slice(0,2).toUpperCase()}
                  </div>
                  <span style={{ fontSize:12, fontWeight:500 }}>{r.name ?? r.customer_name}</span>
                  <span style={{ color:"#c8a96e", fontSize:11 }}>{"★".repeat(r.stars ?? r.rating ?? 0)}</span>
                  <span style={{ fontSize:10, color:"#ccc", marginLeft:"auto" }}>{r.date ?? r.created_at}</span>
                </div>
                <div style={{ fontSize:12, fontWeight:500, marginBottom:2, color:"#111" }}>{r.title}</div>
                <div style={{ fontSize:11, color:"#aaa", lineHeight:1.6 }}>{r.text ?? r.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
