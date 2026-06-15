import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getPayments } from "../api/payments";
import { useApi } from "../hooks/useApi";

const card = { background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.75rem" };
const secLabel = { fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.25rem" };
const btnBlack = { display:"block", textAlign:"center", textDecoration:"none", flex:1, padding:12, background:"#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif" };
const btnOutline = { display:"block", textAlign:"center", textDecoration:"none", flex:1, padding:12, background:"transparent", color:"#111", border:"0.5px solid #e0e0e0", borderRadius:99, fontSize:13, cursor:"pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif" };

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderIds, items, total } = location.state || {};

  // 如果是直接打開這個網址（沒有從 Cart 下單流程過來），導回首頁
  useEffect(() => {
    if (!orderIds || orderIds.length === 0) {
      navigate("/", { replace: true });
    }
  }, [orderIds, navigate]);

  const firstOrderId = orderIds?.[0];
  const { data: paymentsData, loading: paymentsLoading, error: paymentsError } = useApi(
    () => (firstOrderId ? getPayments({ order_id: firstOrderId }) : Promise.resolve(null)),
    [firstOrderId]
  );
  const payments = Array.isArray(paymentsData) ? paymentsData : paymentsData?.payments ?? [];

  if (!orderIds || orderIds.length === 0) return null;

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar steps={["Cart","Checkout","Confirm"]} activeStep={2} />

      <div style={{ maxWidth:640, margin:"0 auto", padding:"4rem 2.5rem" }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem" }}>
            <i className="ti ti-check" style={{ fontSize:28, color:"#3b6d11" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize:28, fontWeight:300, color:"#111", letterSpacing:"-0.5px", marginBottom:8 }}>Thank you for your order!</h1>
          <p style={{ fontSize:13, color:"#888", lineHeight:1.8 }}>
            We've received your order and will start processing it shortly.
          </p>
        </div>

        <div style={{ ...card, marginBottom:"1.5rem" }}>
          <div style={secLabel}>ORDER NUMBER{orderIds.length > 1 ? "S" : ""}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom: items?.length ? "1.5rem" : 0 }}>
            {orderIds.map(id => (
              <span key={id} style={{ fontSize:12, fontFamily:"monospace", padding:"6px 12px", borderRadius:8, background:"#fafafa", border:"0.5px solid #e8e8e8", color:"#111" }}>
                #{id}
              </span>
            ))}
          </div>

          {items && items.length > 0 && (
            <>
              <div style={{ borderTop:"0.5px solid #f0f0f0", paddingTop:"1.25rem" }}>
                {items.map((it,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom: i<items.length-1 ? "0.5px solid #f5f5f5" : "none" }}>
                    <div style={{ width:40, height:40, borderRadius:8, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
                      <i className={`ti ${it.icon || "ti-package"}`} style={{ fontSize:18 }} aria-hidden="true" />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{it.name}</div>
                      <div style={{ fontSize:11, color:"#bbb" }}>{it.seller} · ×{it.qty}</div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:500 }}>NT${(it.price*it.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:500, borderTop:"0.5px solid #e8e8e8", paddingTop:14, marginTop:14 }}>
                <span>Total</span><span>NT${Number(total ?? 0).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>

        <div style={{ ...card, marginBottom:"2rem" }}>
          <div style={secLabel}>PAYMENT DETAILS (#{firstOrderId})</div>
          {paymentsLoading && <div style={{ fontSize:12, color:"#bbb" }}>Loading payment details…</div>}
          {paymentsError && <div style={{ fontSize:12, color:"#e24b4a" }}>Failed to load payment details: {paymentsError.message}</div>}
          {!paymentsLoading && !paymentsError && payments.length === 0 && (
            <div style={{ fontSize:12, color:"#bbb" }}>No payment records found.</div>
          )}
          {!paymentsLoading && !paymentsError && payments.map((p,i) => (
            <div key={p.payment_sequential ?? i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"6px 0", color:"#666" }}>
              <span>
                {p.payment_type ?? "—"}
                {p.payment_installments > 1 ? ` · ${p.payment_installments}x` : ""}
              </span>
              <span style={{ fontWeight:500, color:"#111" }}>NT${Number(p.payment_value).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <Link to="/orders" style={btnBlack}>View my orders</Link>
          <Link to="/" style={btnOutline}>Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}