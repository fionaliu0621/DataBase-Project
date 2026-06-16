import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orders";

// 對應 DDL: Order_Payments.payment_type CHECK (payment_type IN
//   ('credit_card','voucher','debit_card','transfer'))
const PAYS = [
  { id:"credit_card", icon:"ti-credit-card",   label:"Credit card",   sub:"Visa, Mastercard, JCB" },
  { id:"debit_card",  icon:"ti-credit-card",   label:"Debit card",    sub:"Bank debit card"       },
  { id:"transfer",    icon:"ti-building-bank", label:"Bank transfer", sub:"ATM / Wire transfer"    },
  { id:"voucher",     icon:"ti-ticket",        label:"Voucher",       sub:"Gift card / Voucher code" },
];

const INSTALLMENT_OPTIONS = [1, 3, 6, 12];

const inputBase = {
  width:"100%", height:36, padding:"0 12px",
  border:"0.5px solid #e8e8e8", borderRadius:8,
  fontSize:13, color:"#111", background:"#fafafa",
  outline:"none", fontFamily:"'Inter',sans-serif",
  boxSizing:"border-box", transition:"border-color 0.15s",
};
const inputError = { ...inputBase, border:"0.5px solid #e24b4a", background:"#fff9f9" };
const secLabel = { fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.25rem" };

const ADDRESS_FIELDS = [
  { key:"firstName",  label:"FIRST NAME",   grid:"1/2" },
  { key:"lastName",   label:"LAST NAME",    grid:"2/3" },
  { key:"address",    label:"ADDRESS",      grid:"1/-1" },
  { key:"city",       label:"CITY",         grid:"1/2" },
  { key:"postalCode", label:"POSTAL CODE",  grid:"2/3" },
];

export default function CartPage() {
  const { items, updateQty, removeFromCart, clearCart } = useCart();
  const [pay, setPay]               = useState("credit_card");
  const [installments, setInstallments] = useState(1);
  const [placing, setPlacing]       = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [payments, setPayments]     = useState([]);
  const [paymentsLoading]           = useState(false);
  const [paymentsError]             = useState(null);
  const { customerId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Address state
  const [addr, setAddr] = useState({
    firstName: "", lastName: "", address: "", city: "", postalCode: "",
  });
  const [addrErrors, setAddrErrors] = useState({});

  const sub      = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = sub > 1000 ? 0 : 60;
  const total    = sub + shipping;
  const firstOrderId = orderSuccess?.[0];

  // ── Address helpers ───────────────────────────────────────────────
  const setField = (key, value) => {
    setAddr(prev => ({ ...prev, [key]: value }));
    if (addrErrors[key]) setAddrErrors(prev => ({ ...prev, [key]: "" }));
  };

  const validateAddress = () => {
    const errors = {};
    if (!addr.firstName.trim())  errors.firstName  = "請輸入名字";
    if (!addr.lastName.trim())   errors.lastName   = "請輸入姓氏";
    if (!addr.address.trim())    errors.address    = "請輸入地址";
    if (!addr.city.trim())       errors.city       = "請輸入城市";
    if (!addr.postalCode.trim()) errors.postalCode = "請輸入郵遞區號";
    return errors;
  };

  // ── Place order ───────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Validate address first
    const errors = validateAddress();
    if (Object.keys(errors).length > 0) {
      setAddrErrors(errors);
      // Scroll to address section
      document.getElementById("shipping-address-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setPlacing(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      const results = [];
      for (const it of items) {
        const payload = {
          customer_id: customerId,
          product_id: it.id,
          seller_id: it.seller_id,
          price: it.price,
          freight_value: Math.round(60 / items.length),
          shipping_limit_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString().slice(0, 10),
          payment_type: pay,
          payment_installments: installments,
          payment_value: it.price * it.qty,
          quantity: it.qty,
          // address fields
          shipping_address: `${addr.firstName} ${addr.lastName}, ${addr.address}, ${addr.city} ${addr.postalCode}`,
        };
        const res = await createOrder(payload);
        results.push(res?.order_id);
      }
      setOrderSuccess(results);
      clearCart();
      navigate(`/orders`);
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  const hasAddrError = Object.values(addrErrors).some(Boolean);

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar steps={["Cart","Checkout","Confirm"]} activeStep={1} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px" }}>

        {/* ── Left column ── */}
        <div style={{ padding:"2.5rem" }}>

          {/* Cart items */}
          <div style={secLabel}>YOUR BAG ({items.length})</div>
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden", marginBottom:"2rem" }}>
            {items.length === 0 && (
              <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Your bag is empty.</div>
            )}
            {items.map((it, i) => (
              <div key={it.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", borderBottom: i < items.length - 1 ? "0.5px solid #f5f5f5" : "none" }}>
                <div style={{ width:52, height:52, borderRadius:10, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
                  <i className={`ti ${it.icon}`} style={{ fontSize:22 }} aria-hidden="true" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{it.name}</div>
                  <div style={{ fontSize:11, color:"#bbb", marginBottom:8 }}>{it.seller}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", border:"0.5px solid #e8e8e8", borderRadius:99, overflow:"hidden" }}>
                      <button onClick={() => updateQty(it.id, -1)} style={{ width:26, height:26, border:"none", background:"#fff", cursor:"pointer", fontSize:14, color:"#555" }}>−</button>
                      <span style={{ width:26, textAlign:"center", fontSize:12, fontWeight:500 }}>{it.qty}</span>
                      <button onClick={() => updateQty(it.id, +1)} style={{ width:26, height:26, border:"none", background:"#fff", cursor:"pointer", fontSize:14, color:"#555" }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(it.id)} style={{ background:"none", border:"none", fontSize:11, color:"#bbb", cursor:"pointer", letterSpacing:"0.2px", fontFamily:"'Inter',sans-serif" }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontSize:14, fontWeight:500, flexShrink:0 }}>NT${(it.price * it.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          <div
            id="shipping-address-section"
            style={{ ...secLabel, color: hasAddrError ? "#e24b4a" : "#bbb" }}
          >
            SHIPPING ADDRESS
            {hasAddrError && (
              <span style={{ marginLeft:8, fontSize:11, fontWeight:500, letterSpacing:0, color:"#e24b4a" }}>
                — 請填寫所有必填欄位
              </span>
            )}
          </div>

          <div style={{
            background:"#fff", borderRadius:12,
            border: hasAddrError ? "0.5px solid #e24b4a" : "0.5px solid #e8e8e8",
            padding:"1.5rem", marginBottom:"2rem",
            transition:"border-color 0.2s",
          }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {ADDRESS_FIELDS.map(({ key, label, grid }) => (
                <div key={key} style={{ gridColumn: grid }}>
                  <div style={{ fontSize:10, letterSpacing:"1px", color: addrErrors[key] ? "#e24b4a" : "#bbb", marginBottom:5 }}>
                    {label} <span style={{ color:"#e24b4a" }}>*</span>
                  </div>
                  <input
                    value={addr[key]}
                    onChange={e => setField(key, e.target.value)}
                    onBlur={key === "postalCode" ? async () => {
                      if (addr.postalCode.trim().length >= 3) {
                        try {
                          const res = await fetch(`${import.meta.env.VITE_API_URL}/geolocation/${addr.postalCode.trim()}`);
                          const data = await res.json();
                          if (data.geolocation_city) setField("city", data.geolocation_city);
                        } catch {}
                      }
                    } : undefined}
                    style={addrErrors[key] ? inputError : inputBase}
                    placeholder=""
                  />
                  {addrErrors[key] && (
                    <div style={{ fontSize:11, color:"#e24b4a", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                      <i className="ti ti-alert-circle" style={{ fontSize:12 }} aria-hidden="true" />
                      {addrErrors[key]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div style={secLabel}>PAYMENT METHOD</div>
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
            {PAYS.map(opt => (
              <div
                key={opt.id}
                onClick={() => { setPay(opt.id); if (opt.id !== "credit_card" && opt.id !== "debit_card") setInstallments(1); }}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", cursor:"pointer", borderBottom:"0.5px solid #f5f5f5", background: pay === opt.id ? "#fafafa" : "#fff" }}
              >
                <div style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, background: pay === opt.id ? "#111" : "#f0f0f0", color: pay === opt.id ? "#fff" : "#666" }}>
                  <i className={`ti ${opt.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{opt.label}</div>
                  <div style={{ fontSize:11, color:"#bbb" }}>{opt.sub}</div>
                </div>
                <div style={{ marginLeft:"auto", width:14, height:14, borderRadius:"50%", border:"1.5px solid", borderColor: pay === opt.id ? "#111" : "#ddd", background: pay === opt.id ? "#111" : "transparent", boxShadow: pay === opt.id ? "inset 0 0 0 2px #fff" : "none" }} />
              </div>
            ))}
          </div>

          {/* Installments */}
          {(pay === "credit_card" || pay === "debit_card") && (
            <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", padding:"14px 20px", marginTop:12 }}>
              <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:10 }}>INSTALLMENTS</div>
              <div style={{ display:"flex", gap:8 }}>
                {INSTALLMENT_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setInstallments(n)}
                    style={{
                      flex:1, padding:"8px 0", borderRadius:8, fontSize:12, cursor:"pointer",
                      border: installments === n ? "1px solid #111" : "0.5px solid #e8e8e8",
                      background: installments === n ? "#111" : "#fff",
                      color: installments === n ? "#fff" : "#666",
                      fontFamily:"'Inter',sans-serif",
                    }}
                  >
                    {n === 1 ? "一次付清" : `${n} 期`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: Order summary ── */}
        <div style={{ padding:"2.5rem", background:"#fff", borderLeft:"0.5px solid #e8e8e8" }}>
          <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.5rem" }}>ORDER SUMMARY</div>

          {[["Subtotal", "NT$" + sub.toLocaleString()], ["Shipping", sub > 1000 ? "FREE" : "NT$60"]].map(([l, v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"5px 0", color:"#888" }}>
              <span>{l}</span><span>{v}</span>
            </div>
          ))}

          <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:500, borderTop:"0.5px solid #e8e8e8", paddingTop:14, marginTop:8 }}>
            <span>Total</span><span>NT${total.toLocaleString()}</span>
          </div>

          <div style={{ display:"flex", gap:6, margin:"14px 0" }}>
            <input placeholder="Promo code" style={{ flex:1, height:34, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:12, outline:"none", fontFamily:"'Inter',sans-serif", background:"#fafafa" }} />
            <button style={{ padding:"0 14px", height:34, border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:11, cursor:"pointer", background:"#fff", fontFamily:"'Inter',sans-serif" }}>Apply</button>
          </div>

          {/* Inline address error banner (redundant but helpful near the button) */}
          {hasAddrError && (
            <div style={{ fontSize:12, color:"#e24b4a", marginBottom:10, lineHeight:1.6, background:"#fff9f9", border:"0.5px solid #f5c6c6", borderRadius:8, padding:"10px 12px", display:"flex", alignItems:"flex-start", gap:7 }}>
              <i className="ti ti-alert-triangle" style={{ fontSize:14, flexShrink:0, marginTop:1 }} aria-hidden="true" />
              <span>請先填寫完整的收件地址，再送出訂單。</span>
            </div>
          )}

          {orderError && (
            <div style={{ fontSize:12, color:"#e24b4a", marginBottom:10, lineHeight:1.6 }}>
              下單失敗：{orderError}
            </div>
          )}

          {orderSuccess && (
            <div style={{ fontSize:12, color:"#3b6d11", marginBottom:10, lineHeight:1.6 }}>
              訂單建立成功！訂單編號：{orderSuccess.join(", ")}
            </div>
          )}

          {orderSuccess && (
            <div style={{ background:"#fafafa", border:"0.5px solid #f0f0f0", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
              <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:8 }}>PAYMENT DETAILS (#{firstOrderId})</div>
              {paymentsLoading && <div style={{ fontSize:12, color:"#bbb" }}>Loading payment details…</div>}
              {paymentsError  && <div style={{ fontSize:12, color:"#e24b4a" }}>Failed to load payment details: {paymentsError.message}</div>}
              {!paymentsLoading && !paymentsError && payments.length === 0 && (
                <div style={{ fontSize:12, color:"#bbb" }}>No payment records found yet.</div>
              )}
              {!paymentsLoading && !paymentsError && payments.map((p, i) => (
                <div key={p.payment_sequential ?? i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", color:"#666" }}>
                  <span>
                    {p.payment_type ?? "—"}
                    {p.payment_installments > 1 ? ` · ${p.payment_installments}x` : ""}
                  </span>
                  <span style={{ fontWeight:500, color:"#111" }}>NT${Number(p.payment_value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={placing || items.length === 0}
            style={{
              width:"100%", padding:13,
              background: placing || items.length === 0 ? "#999" : "#111",
              color:"#fff", border:"none", borderRadius:99,
              fontSize:13, fontWeight:500,
              cursor: placing || items.length === 0 ? "default" : "pointer",
              letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif",
            }}
          >
            {placing ? "Placing order…" : "Place order"}
          </button>

          <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:"1.25rem", paddingTop:"1.25rem", borderTop:"0.5px solid #f0f0f0" }}>
            {[["ti-shield-check","Secure SSL payment"],["ti-refresh","7-day return policy"],["ti-headset","24/7 support"]].map(([icon, text]) => (
              <div key={icon} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#bbb" }}>
                <i className={`ti ${icon}`} style={{ fontSize:13 }} aria-hidden="true" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
