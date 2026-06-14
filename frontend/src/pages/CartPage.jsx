import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrder } from "../api/orders";
import { getPayments } from "../api/payments";
import { useApi } from "../hooks/useApi";

// 對應 DDL: Order_Payments.payment_type CHECK (payment_type IN
//   ('credit_card','voucher','debit_card','transfer'))
// 規則 #10：付款方式僅限這四種，不可接受未定義的付款方式
const PAYS = [
  { id:"credit_card", icon:"ti-credit-card",   label:"Credit card",   sub:"Visa, Mastercard, JCB" },
  { id:"debit_card",  icon:"ti-credit-card",   label:"Debit card",    sub:"Bank debit card"       },
  { id:"transfer",    icon:"ti-building-bank", label:"Bank transfer", sub:"ATM / Wire transfer"    },
  { id:"voucher",     icon:"ti-ticket",        label:"Voucher",       sub:"Gift card / Voucher code" },
];

// AddOrder 後端目前一次只處理一個 (product_id, seller_id)
// 對應 trigger trg_payment_check 與 SP AddOrder 簽名
// payment_type 直接使用 PAYS[].id，已對齊 DDL CHECK 限制，不需額外轉換

// 對應 DDL: Order_Payments.payment_installments INT
// 分期數選項（1 期 = 一次付清）
const INSTALLMENT_OPTIONS = [1, 3, 6, 12];

const input = { width:"100%", height:36, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, color:"#111", background:"#fafafa", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
const secLabel = { fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.25rem" };

export default function CartPage() {
  const { items, updateQty, removeFromCart, clearCart } = useCart();
  const [pay, setPay] = useState("credit_card");
  const [installments, setInstallments] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const { customerId, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const sub = items.reduce((s,it)=>s+it.price*it.qty,0);
  const total = sub + 60 - 710;

  // 下單成功後，依第一筆 order_id 查詢付款明細
  // GET /payments?order_id=... -> Order_Payments（一筆訂單可有多筆付款紀錄）
  const firstOrderId = orderSuccess?.[0];
  const { data: paymentsData, loading: paymentsLoading, error: paymentsError } = useApi(
    () => (firstOrderId ? getPayments({ order_id: firstOrderId }) : Promise.resolve(null)),
    [firstOrderId]
  );
  const payments = Array.isArray(paymentsData) ? paymentsData : paymentsData?.payments ?? [];

  // 下單：對應 4.2 POST /orders -> CALL AddOrder(...)
  // AddOrder 一次寫入 Orders / Order_Items / Order_Payments 三筆資料
  // 目前 SP 簽名是針對單一商品，因此這裡逐一送出每個購物車品項
  // （後端若改成支援多商品一次送出，這裡可以改成單一 request 帶 items 陣列）
  //
  // ⚠️ 下單必須有 customer_id（AddOrder 的必要參數），
  // 所以這裡先檢查登入狀態，未登入則導向 /login。
  // 注意：目前 AuthContext 預設帶有一個測試帳號（isAuthenticated 永遠為 true），
  // 等登入 API 真正接上後，這個檢查才會實際生效。
  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      navigate("/login");
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
          freight_value: Math.round(60 / items.length), // 平均分攤運費
          shipping_limit_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          payment_type: pay,
          payment_installments: installments,
          payment_value: it.price * it.qty,
          quantity: it.qty,
        };
        const res = await createOrder(payload);
        results.push(res?.order_id);
      }
      setOrderSuccess(results);
      clearCart(); // 下單成功後清空購物車
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar steps={["Cart","Checkout","Confirm"]} activeStep={1} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px" }}>
        <div style={{ padding:"2.5rem" }}>
          <div style={secLabel}>YOUR BAG ({items.length})</div>
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden", marginBottom:"2rem" }}>
            {items.length === 0 && (
              <div style={{ padding:"2rem", textAlign:"center", color:"#bbb", fontSize:13 }}>Your bag is empty.</div>
            )}
            {items.map((it,i) => (
              <div key={it.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px", borderBottom: i<items.length-1 ? "0.5px solid #f5f5f5" : "none" }}>
                <div style={{ width:52, height:52, borderRadius:10, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#ccc" }}>
                  <i className={`ti ${it.icon}`} style={{ fontSize:22 }} aria-hidden="true" />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:2 }}>{it.name}</div>
                  <div style={{ fontSize:11, color:"#bbb", marginBottom:8 }}>{it.seller}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", border:"0.5px solid #e8e8e8", borderRadius:99, overflow:"hidden" }}>
                      <button onClick={() => updateQty(it.id,-1)} style={{ width:26, height:26, border:"none", background:"#fff", cursor:"pointer", fontSize:14, color:"#555" }}>−</button>
                      <span style={{ width:26, textAlign:"center", fontSize:12, fontWeight:500 }}>{it.qty}</span>
                      <button onClick={() => updateQty(it.id,+1)} style={{ width:26, height:26, border:"none", background:"#fff", cursor:"pointer", fontSize:14, color:"#555" }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(it.id)} style={{ background:"none", border:"none", fontSize:11, color:"#bbb", cursor:"pointer", letterSpacing:"0.2px", fontFamily:"'Inter',sans-serif" }}>Remove</button>
                  </div>
                </div>
                <div style={{ fontSize:14, fontWeight:500, flexShrink:0 }}>NT${(it.price*it.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={secLabel}>SHIPPING ADDRESS</div>
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", padding:"1.5rem", marginBottom:"2rem" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[["FIRST NAME","Wei"],["LAST NAME","Chen"]].map(([l,p]) => (
                <div key={l}>
                  <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:5 }}>{l}</div>
                  <input style={input} placeholder={p} />
                </div>
              ))}
              <div style={{ gridColumn:"1/-1" }}>
                <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:5 }}>ADDRESS</div>
                <input style={input} placeholder="No. 162, Section 1, Heping East Rd" />
              </div>
              {[["CITY","Taipei"],["POSTAL CODE","10617"]].map(([l,p]) => (
                <div key={l}>
                  <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:5 }}>{l}</div>
                  <input style={input} placeholder={p} />
                </div>
              ))}
            </div>
          </div>

          <div style={secLabel}>PAYMENT METHOD</div>
          <div style={{ background:"#fff", borderRadius:12, border:"0.5px solid #e8e8e8", overflow:"hidden" }}>
            {PAYS.map(opt => (
              <div key={opt.id} onClick={() => { setPay(opt.id); if (opt.id !== "credit_card" && opt.id !== "debit_card") setInstallments(1); }} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", cursor:"pointer", borderBottom:"0.5px solid #f5f5f5", background: pay===opt.id ? "#fafafa" : "#fff" }}>
                <div style={{ width:30, height:30, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, background: pay===opt.id ? "#111" : "#f0f0f0", color: pay===opt.id ? "#fff" : "#666" }}>
                  <i className={`ti ${opt.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:500 }}>{opt.label}</div>
                  <div style={{ fontSize:11, color:"#bbb" }}>{opt.sub}</div>
                </div>
                <div style={{ marginLeft:"auto", width:14, height:14, borderRadius:"50%", border:"1.5px solid", borderColor: pay===opt.id ? "#111" : "#ddd", background: pay===opt.id ? "#111" : "transparent", boxShadow: pay===opt.id ? "inset 0 0 0 2px #fff" : "none" }} />
              </div>
            ))}
          </div>

          {/* 對應 DDL: Order_Payments.payment_installments
              信用卡/debit card 才提供分期選項，其他付款方式固定為 1（一次付清） */}
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
                      border: installments===n ? "1px solid #111" : "0.5px solid #e8e8e8",
                      background: installments===n ? "#111" : "#fff",
                      color: installments===n ? "#fff" : "#666",
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

        <div style={{ padding:"2.5rem", background:"#fff", borderLeft:"0.5px solid #e8e8e8" }}>
          <div style={{ fontSize:11, letterSpacing:"1.5px", color:"#bbb", marginBottom:"1.5rem" }}>ORDER SUMMARY</div>
          {[["Subtotal","NT$"+sub.toLocaleString()],["Shipping","NT$60"],["Discount","−NT$710"]].map(([l,v],i) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:13, padding:"5px 0", color:"#888" }}>
              <span>{l}</span><span style={{ color: i===2 ? "#3b6d11" : "#888" }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:15, fontWeight:500, borderTop:"0.5px solid #e8e8e8", paddingTop:14, marginTop:8 }}>
            <span>Total</span><span>NT${total.toLocaleString()}</span>
          </div>
          <div style={{ display:"flex", gap:6, margin:"14px 0" }}>
            <input placeholder="Promo code" style={{ flex:1, height:34, padding:"0 12px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:12, outline:"none", fontFamily:"'Inter',sans-serif", background:"#fafafa" }} />
            <button style={{ padding:"0 14px", height:34, border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:11, cursor:"pointer", background:"#fff", fontFamily:"'Inter',sans-serif" }}>Apply</button>
          </div>

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

          {/* 付款明細：GET /payments?order_id=... 對應 Order_Payments
              一筆訂單可有多筆付款紀錄（例如分期、混合付款方式） */}
          {orderSuccess && (
            <div style={{ background:"#fafafa", border:"0.5px solid #f0f0f0", borderRadius:10, padding:"12px 14px", marginBottom:10 }}>
              <div style={{ fontSize:10, letterSpacing:"1px", color:"#bbb", marginBottom:8 }}>PAYMENT DETAILS (#{firstOrderId})</div>
              {paymentsLoading && (
                <div style={{ fontSize:12, color:"#bbb" }}>Loading payment details…</div>
              )}
              {paymentsError && (
                <div style={{ fontSize:12, color:"#e24b4a" }}>
                  Failed to load payment details: {paymentsError.message}
                </div>
              )}
              {!paymentsLoading && !paymentsError && payments.length === 0 && (
                <div style={{ fontSize:12, color:"#bbb" }}>No payment records found yet.</div>
              )}
              {!paymentsLoading && !paymentsError && payments.map((p, i) => (
                <div key={p.payment_sequential ?? i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", color:"#666" }}>
                  <span>
                    {(p.payment_type ?? "—")}
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
            style={{ width:"100%", padding:13, background: placing || items.length===0 ? "#999" : "#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor: placing || items.length===0 ? "default" : "pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif" }}>
            {placing ? "Placing order…" : "Place order"}
          </button>

          <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:"1.25rem", paddingTop:"1.25rem", borderTop:"0.5px solid #f0f0f0" }}>
            {[["ti-shield-check","Secure SSL payment"],["ti-refresh","7-day return policy"],["ti-headset","24/7 support"]].map(([icon,text]) => (
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
