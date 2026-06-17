import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const S = {
  nav: { background:"#fff", borderBottom:"0.5px solid #e8e8e8", padding:"0 2.5rem", display:"flex", alignItems:"center", height:52, gap:"2rem", fontFamily:"'Inter',sans-serif" },
  logo: { fontSize:15, fontWeight:500, letterSpacing:"0.5px", color:"#111", flexShrink:0, textDecoration:"none" },
  links: { display:"flex", gap:"1.5rem", flex:1 },
  icons: { display:"flex", alignItems:"center", gap:16 },
  iconBtn: { background:"none", border:"none", cursor:"pointer", color:"#555", fontSize:17, padding:4, display:"flex", alignItems:"center", justifyContent:"center" },
  iconLabel: { fontSize:9, color:"#999", letterSpacing:"0.3px", fontWeight:400 },
  badge: { position:"absolute", top:-2, right:-6, background:"#111", color:"#fff", fontSize:9, fontWeight:500, borderRadius:99, padding:"1px 4px", lineHeight:1.4, minWidth:14, textAlign:"center" },
  breadcrumb: { flex:1, display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#bbb" },
  steps: { display:"flex", alignItems:"center", margin:"0 auto" },
  sep: { width:32, height:"0.5px", background:"#e0e0e0", margin:"0 10px" },
};

// 買家看到的選單
const CUSTOMER_LINKS = [
  { label:"Products",    to:"/"            },
  { label:"Sellers",     to:"/sellers"     },
  { label:"About",       to:"/about"       },
];

// 賣家看到的選單：三個分頁，分別對應不同網址路由
const SELLER_LINKS = [
  { label:"Dashboard",   to:"/seller/dashboard" },
  { label:"My Products", to:"/seller/products"  },
  { label:"Orders",      to:"/seller/orders"    },
];

export default function Navbar({ cartCount=0, breadcrumb=null, steps=null, activeStep=null }) {
  const location = useLocation();
  const { isAuthenticated, customer, role, logout } = useAuth();

  const navLinks = role === "seller" ? SELLER_LINKS : CUSTOMER_LINKS;

  return (
    <nav style={S.nav}>
      <Link to="/" style={S.logo}>SHOPHUB</Link>

      {breadcrumb ? (
        <div style={S.breadcrumb}>
          {breadcrumb.map((crumb, i) => (
            <span key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
              {i > 0 && <i className="ti ti-chevron-right" style={{ fontSize:10 }} aria-hidden="true" />}
              <span style={{ color: i < breadcrumb.length-1 ? "#999" : "#111", cursor: i < breadcrumb.length-1 ? "pointer" : "default" }}>{crumb}</span>
            </span>
          ))}
        </div>
      ) : steps ? (
        <div style={S.steps}>
          {steps.map((step, i) => (
            <span key={step} style={{ display:"flex", alignItems:"center" }}>
              {i > 0 && <div style={S.sep} />}
              <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, letterSpacing:"0.3px" }}>
                <span style={{ width:20, height:20, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:500, background: i <= activeStep ? "#111" : "#f0f0f0", color: i <= activeStep ? "#fff" : "#aaa" }}>
                  {i < activeStep ? <i className="ti ti-check" style={{ fontSize:9 }} /> : i + 1}
                </span>
                <span style={{ color: i === activeStep ? "#111" : "#bbb", fontWeight: i === activeStep ? 500 : 400 }}>{step}</span>
              </span>
            </span>
          ))}
        </div>
      ) : (
        <div style={S.links}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              fontSize:13,
              color: location.pathname === link.to ? "#111" : "#666",
              textDecoration:"none",
              fontWeight: location.pathname === link.to ? 500 : 400,
              borderBottom: location.pathname === link.to ? "1px solid #111" : "1px solid transparent",
              paddingBottom:2,
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <div style={S.icons}>
        {isAuthenticated ? (
          <button
            onClick={logout}
            style={{ ...S.iconBtn, flexDirection:"column", gap:2 }}
            title={`${role === "seller" ? "Seller" : "Customer"} ID: ${customer?.user_id ?? ""}（點擊登出）`}
          >
            <i className="ti ti-user-check" aria-hidden="true" />
            <span style={S.iconLabel}>{customer?.user_id ?? "Account"}</span>
          </button>
        ) : (
          <Link to="/login" style={{ ...S.iconBtn, textDecoration:"none", flexDirection:"column", gap:2 }}>
            <i className="ti ti-user" aria-hidden="true" />
            <span style={S.iconLabel}>Login</span>
          </Link>
        )}

        {/* 賣家不顯示 Cart 圖示，買家（或未登入）顯示 */}
        {role !== "seller" && (
          <Link
            to={isAuthenticated ? "/cart" : "/login"}
            style={{ ...S.iconBtn, textDecoration:"none", flexDirection:"column", gap:2, position:"relative" }}
          >
            <i className="ti ti-shopping-bag" aria-hidden="true" />
            {cartCount > 0 && <span style={S.badge}>{cartCount}</span>}
            <span style={S.iconLabel}>Cart</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
