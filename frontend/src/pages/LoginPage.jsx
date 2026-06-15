import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const inputLight = {
  width: "100%", height: 38, padding: "0 14px",
  border: "0.5px solid #e8e8e8", borderRadius: 8,
  fontSize: 13, color: "#111", background: "#fafafa",
  outline: "none", fontFamily: "'Inter',sans-serif", boxSizing: "border-box"
};
const fieldLabel = { fontSize: 10, letterSpacing: "1px", color: "#555", marginBottom: 5 };

// ── Register 表單 ──────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [customerId, setCustomerId] = useState("");
  const [password,   setPassword]   = useState("");
  const [error,      setError]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(null);

  const handleSubmit = async () => {
    setError(null);
    if (!customerId.trim()) { setError("請輸入 Customer ID"); return; }
    if (customerId.trim().length < 3) { setError("Customer ID 至少 3 個字元"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customerId.trim() })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "註冊失敗"); return; }
      setDone(data.customer_id);
      setTimeout(() => onSuccess(data.customer_id, data.name), 1500);
    } catch {
      setError("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: "#111", marginBottom: 8 }}>註冊成功！</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>你的 Customer ID 是</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#111", background: "#f5f5f5", borderRadius: 8, padding: "10px 20px", display: "inline-block", letterSpacing: 1 }}>{done}</div>
      <div style={{ fontSize: 11, color: "#bbb", marginTop: 12 }}>請記下此 ID，下次登入時使用</div>
      <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>正在跳轉...</div>
    </div>
  );

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 400, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>Create account</div>
      <div style={{ fontSize: 12, color: "#bbb", marginBottom: "1.75rem" }}>Join ShopHub for free</div>

      <div style={{ marginBottom: 14 }}>
        <div style={fieldLabel}>CUSTOMER ID</div>
        <input
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
          placeholder="自訂你的 ID，例如 cust_001"
          style={inputLight}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={fieldLabel}>PASSWORD</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputLight}
        />
      </div>

      {error && <div style={{ fontSize: 11, color: "#e24b4a", marginBottom: "1rem", lineHeight: 1.6 }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", padding: 12,
          background: loading ? "#888" : "#111",
          color: "#fff", border: "none", borderRadius: 99,
          fontSize: 13, fontWeight: 500,
          cursor: loading ? "default" : "pointer",
          letterSpacing: "0.3px", marginBottom: "1rem",
          fontFamily: "'Inter',sans-serif"
        }}
      >
        {loading ? "建立中..." : "Create account"}
      </button>

      <div style={{ fontSize: 10, color: "#bbb", textAlign: "center", lineHeight: 1.7, letterSpacing: "0.2px" }}>
        By registering you agree to our <span style={{ color: "#888", cursor: "pointer" }}>Terms</span> and <span style={{ color: "#888", cursor: "pointer" }}>Privacy Policy</span>.
      </div>
    </>
  );
}

// ── 主頁面 ────────────────────────────────────────────────
export default function LoginPage() {
  const [tab, setTab] = useState("login");
  const [customerId, setCustomerId] = useState("");
  const [password,   setPassword]   = useState("");
  const [signInError, setSignInError] = useState(null);
  const location = useLocation();
  const navigate  = useNavigate();
  const { login } = useAuth();

  const handleSignIn = () => {
    if (!customerId.trim()) {
      setSignInError("請輸入 Customer ID（例如 cust_000016）");
      return;
    }
    setSignInError(null);
    login({ customer_id: customerId.trim(), name: customerId.trim(), email: customerId.trim() });
    const redirectTo = location.state?.from?.pathname || "/";
    navigate(redirectTo, { replace: true });
  };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", display: "grid", gridTemplateColumns: "420px 1fr", minHeight: "100vh" }}>

      {/* 左側黑色區塊 */}
      <div style={{ background: "#111", padding: "3.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#888", textDecoration: "none", marginBottom: "3rem" }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} aria-hidden="true" /> Back to shop
        </Link>
        <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "2px", color: "#fff", marginBottom: "4rem" }}>SHOPHUB</div>
        <h1 style={{ fontSize: 36, fontWeight: 300, color: "#fff", lineHeight: 1.2, marginBottom: 12, letterSpacing: "-1px" }}>
          Simple.<br />Curated.<br />Yours.
        </h1>
        <p style={{ fontSize: 13, color: "#555", lineHeight: 1.9, marginBottom: "3rem", maxWidth: 340 }}>
          Taiwan's cleanest shopping experience, built for people who appreciate quality.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            "Buyer protection on every order",
            "Fast delivery across Taiwan",
            "Verified seller ratings and reviews"
          ].map(text => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#555" }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#444", flexShrink: 0 }} />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* 右側表單區塊 */}
      <div style={{ background: "#fff", padding: "3rem 4rem", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 480, width: "100%", margin: "0 auto" }}>

        {/* Tab 切換 */}
        <div style={{ display: "flex", borderBottom: "0.5px solid #e8e8e8", marginBottom: "2rem" }}>
          {[["login", "Sign in"], ["register", "Register"]].map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 0", marginRight: "2rem", fontSize: 13,
                cursor: "pointer", border: "none", background: "none",
                borderBottom: tab === t ? "2px solid #111" : "2px solid transparent",
                color: tab === t ? "#111" : "#bbb",
                marginBottom: "-0.5px", fontFamily: "'Inter',sans-serif",
                fontWeight: tab === t ? 500 : 400
              }}
            >{l}</button>
          ))}
        </div>

        {/* Sign In */}
        {tab === "login" ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 400, color: "#111", marginBottom: 4, letterSpacing: "-0.3px" }}>Welcome back</div>
            <div style={{ fontSize: 12, color: "#bbb", marginBottom: "1.75rem" }}>Sign in to your ShopHub account</div>

            <div style={{ marginBottom: 14 }}>
              <div style={fieldLabel}>CUSTOMER ID</div>
              <input
                type="text"
                placeholder="e.g. cust_000016"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                style={inputLight}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={fieldLabel}>PASSWORD</div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSignIn()}
                style={inputLight}
              />
            </div>

            {signInError && (
              <div style={{ fontSize: 11, color: "#e24b4a", marginBottom: "1rem", lineHeight: 1.6 }}>{signInError}</div>
            )}

            <button
              onClick={handleSignIn}
              style={{ width: "100%", padding: 12, background: "#111", color: "#fff", border: "none", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer", letterSpacing: "0.3px", fontFamily: "'Inter',sans-serif" }}
            >
              Sign in
            </button>

            <div style={{ fontSize: 11, color: "#bbb", marginTop: 16, textAlign: "center" }}>
              還沒有帳號？
              <span onClick={() => setTab("register")} style={{ color: "#111", cursor: "pointer", marginLeft: 4 }}>立即註冊</span>
            </div>
          </>
        ) : (
          <RegisterForm onSuccess={(customer_id, name) => {
            login({ customer_id, name, email: customer_id });
            navigate(location.state?.from?.pathname || "/", { replace: true });
          }} />
        )}
      </div>
    </div>
  );
}
