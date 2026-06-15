import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const inputLight = { width:"100%", height:38, padding:"0 14px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, color:"#111", background:"#fafafa", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
const fieldLabel = { fontSize:10, letterSpacing:"1px", color:"#555", marginBottom:5 };

export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [signInError, setSignInError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // ⚠️ 報告中沒有定義登入 API，Customers table 也沒有 email/password 欄位。
  // 這裡先用「EMAIL 欄位直接當作 customer_id」的方式模擬登入：
  // 1. 輸入資料庫中真實存在的 customer_id（例如 "C0001"），就能讓 AddOrder 等
  //    需要 customer_id 的 API 正確運作
  // 2. password 欄位目前不驗證，純粹保留畫面完整性
  // 之後若團隊定義了真正的登入 API，把這段換成 API 呼叫即可，
  // AuthContext 的介面（login/customerId/isAuthenticated）不需要改動
  const handleSignIn = () => {
    if (!customerId.trim()) {
      setSignInError("請輸入 Customer ID（對應資料庫 Customers.customer_id）");
      return;
    }
    setSignInError(null);
    login({ customer_id: customerId.trim(), name: customerId.trim(), email: customerId.trim() });
    const redirectTo = location.state?.from?.pathname || "/";
    navigate(redirectTo, { replace: true });
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", display:"grid", gridTemplateColumns:"420px 1fr", minHeight:"100vh" }}>
      <div style={{ background:"#111", padding:"3.5rem", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"#888", textDecoration:"none", marginBottom:"3rem" }}>
          <i className="ti ti-arrow-left" style={{ fontSize:14 }} aria-hidden="true" /> Back to shop
        </Link>
        <div style={{ fontSize:14, fontWeight:500, letterSpacing:"2px", color:"#fff", marginBottom:"4rem" }}>SHOPHUB</div>
        <h1 style={{ fontSize:36, fontWeight:300, color:"#fff", lineHeight:1.2, marginBottom:12, letterSpacing:"-1px" }}>Simple.<br />Curated.<br />Yours.</h1>
        <p style={{ fontSize:13, color:"#555", lineHeight:1.9, marginBottom:"3rem", maxWidth:340 }}>Taiwan's cleanest shopping experience, built for people who appreciate quality.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {[["Buyer protection on every order"],["Fast delivery across Taiwan"],["Verified seller ratings and reviews"]].map(([text]) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:12, fontSize:12, color:"#555" }}>
              <div style={{ width:4, height:4, borderRadius:"50%", background:"#444", flexShrink:0 }} />{text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:"#fff", padding:"3rem 4rem", display:"flex", flexDirection:"column", justifyContent:"center", maxWidth:480, width:"100%", margin:"0 auto" }}>
        <div style={{ display:"flex", borderBottom:"0.5px solid #e8e8e8", marginBottom:"2rem" }}>
          {[["login","Sign in"],["register","Register"]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:"8px 0", marginRight:"2rem", fontSize:13, cursor:"pointer", border:"none", background:"none", borderBottom: tab===t ? "2px solid #111" : "2px solid transparent", color: tab===t ? "#111" : "#bbb", marginBottom:"-0.5px", fontFamily:"'Inter',sans-serif", fontWeight: tab===t ? 500 : 400 }}>{l}</button>
          ))}
        </div>

        {tab==="login" ? (
          <>
            <div style={{ fontSize:20, fontWeight:400, color:"#111", marginBottom:4, letterSpacing:"-0.3px" }}>Welcome back</div>
            <div style={{ fontSize:12, color:"#bbb", marginBottom:"1.75rem" }}>Sign in to your ShopHub account</div>

            <div style={{ marginBottom:14 }}>
              <div style={fieldLabel}>CUSTOMER ID</div>
              <input
                type="text"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                style={inputLight}
              />
            </div>
            <div style={{ marginBottom:24 }}>
              <div style={fieldLabel}>PASSWORD</div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputLight}
              />
            </div>

            {signInError && (
              <div style={{ fontSize:11, color:"#e24b4a", marginBottom:"1rem", lineHeight:1.6 }}>{signInError}</div>
            )}

            <button
              onClick={handleSignIn}
              style={{ width:"100%", padding:12, background:"#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.3px", fontFamily:"'Inter',sans-serif" }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize:20, fontWeight:400, color:"#111", marginBottom:4, letterSpacing:"-0.3px" }}>Create account</div>
            <div style={{ fontSize:12, color:"#bbb", marginBottom:"1.75rem" }}>Join ShopHub for free</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[["FIRST NAME","Wei"],["LAST NAME","Chen"]].map(([l,p]) => (
                <div key={l}><div style={fieldLabel}>{l}</div><input placeholder={p} style={inputLight} /></div>
              ))}
            </div>
            {[["EMAIL","email","your@email.com"],["PASSWORD","password","At least 8 characters"]].map(([l,t,p]) => (
              <div key={l} style={{ marginBottom:14 }}>
                <div style={fieldLabel}>{l}</div>
                <input type={t} placeholder={p} style={inputLight} />
              </div>
            ))}
            <button style={{ width:"100%", padding:12, background:"#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor:"pointer", letterSpacing:"0.3px", marginBottom:"1rem", fontFamily:"'Inter',sans-serif" }}>Create account</button>
            <div style={{ fontSize:10, color:"#bbb", textAlign:"center", lineHeight:1.7, letterSpacing:"0.2px" }}>
              By registering you agree to our <a style={{ color:"#888", cursor:"pointer" }}>Terms</a> and <a style={{ color:"#888", cursor:"pointer" }}>Privacy Policy</a>.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
