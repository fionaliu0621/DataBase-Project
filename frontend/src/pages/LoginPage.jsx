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

  const inputLight = { width:"100%", height:38, padding:"0 14px", border:"0.5px solid #e8e8e8", borderRadius:8, fontSize:13, color:"#111", background:"#fafafa", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
  const fieldLabel = { fontSize:10, letterSpacing:"1px", color:"#555", marginBottom:5 };

  if (done) return (
    <div style={{ textAlign:"center", padding:"2rem 0" }}>
      <div style={{ fontSize:32, marginBottom:16 }}>✓</div>
      <div style={{ fontSize:16, fontWeight:500, color:"#111", marginBottom:8 }}>註冊成功！</div>
      <div style={{ fontSize:12, color:"#888", marginBottom:16 }}>你的 Customer ID 是</div>
      <div style={{ fontSize:18, fontWeight:600, color:"#111", background:"#f5f5f5", borderRadius:8, padding:"10px 20px", display:"inline-block" }}>{done}</div>
      <div style={{ fontSize:11, color:"#bbb", marginTop:12 }}>正在跳轉...</div>
    </div>
  );

  return (
    <>
      <div style={{ fontSize:20, fontWeight:400, color:"#111", marginBottom:4, letterSpacing:"-0.3px" }}>Create account</div>
      <div style={{ fontSize:12, color:"#bbb", marginBottom:"1.75rem" }}>Join ShopHub for free</div>

      <div style={{ marginBottom:14 }}>
        <div style={fieldLabel}>CUSTOMER ID</div>
        <input
          value={customerId}
          onChange={e => setCustomerId(e.target.value)}
          placeholder="自訂你的 ID，例如 cust_001"
          style={inputLight}
        />
      </div>

      <div style={{ marginBottom:24 }}>
        <div style={fieldLabel}>PASSWORD</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputLight}
        />
      </div>

      {error && <div style={{ fontSize:11, color:"#e24b4a", marginBottom:"1rem" }}>{error}</div>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ width:"100%", padding:12, background: loading ? "#888" : "#111", color:"#fff", border:"none", borderRadius:99, fontSize:13, fontWeight:500, cursor: loading ? "default" : "pointer", letterSpacing:"0.3px", marginBottom:"1rem", fontFamily:"'Inter',sans-serif" }}
      >
        {loading ? "建立中..." : "Create account"}
      </button>

      <div style={{ fontSize:10, color:"#bbb", textAlign:"center", lineHeight:1.7 }}>
        By registering you agree to our <span style={{ color:"#888" }}>Terms</span> and <span style={{ color:"#888" }}>Privacy Policy</span>.
      </div>
    </>
  );
}
