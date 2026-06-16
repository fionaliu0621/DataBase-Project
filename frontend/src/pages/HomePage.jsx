import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProducts } from "../api/products";
import { useApi } from "../hooks/useApi";
import { useCart } from "../context/CartContext";

const ORDERS = [
  {
    id: "ORD-00421",
    name: "Wireless Headphones",
    icon: "ti-headphones",
    status: "delivered",
    date: "May 20, 2026",
    amount: 2490,
  },
  {
    id: "ORD-00419",
    name: "Running Shoes",
    icon: "ti-shoe",
    status: "shipped",
    date: "May 24, 2026",
    amount: 3200,
  },
  {
    id: "ORD-00415",
    name: "Coffee Maker",
    icon: "ti-coffee",
    status: "processing",
    date: "May 27, 2026",
    amount: 1850,
  },
];

const STATUS = {
  delivered: { label: "Delivered", bg: "#f0f0f0", color: "#444" },
  shipped: { label: "Shipped", bg: "#eef2ff", color: "#3b5bdb" },
  processing: { label: "Processing", bg: "#fff9f0", color: "#d97706" },
};

const CATS = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Sports",
  "Books",
  "Beauty",
  "Toys",
];

const MOCK_PRODUCTS = [
  {
    id: "p001",
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 1290,
    rating: 4.5,
    seller_id: "s001",
    seller_name: "TechStore Taiwan",
  },
  {
    id: "p002",
    name: "Yoga Mat",
    category: "Sports",
    price: 680,
    rating: 4.8,
    seller_id: "s002",
    seller_name: "SportZone",
  },
  {
    id: "p003",
    name: "Ceramic Mug Set",
    category: "Home & Living",
    price: 450,
    rating: 4.6,
    seller_id: "s003",
    seller_name: "HomeGo",
  },
  {
    id: "p004",
    name: "Sunscreen SPF50",
    category: "Beauty",
    price: 320,
    rating: 4.3,
    seller_id: "s006",
    seller_name: "Green Natural",
  },
  {
    id: "p005",
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 2890,
    rating: 4.7,
    seller_id: "s001",
    seller_name: "TechStore Taiwan",
  },
  {
    id: "p006",
    name: "Novel: The Shore",
    category: "Books",
    price: 280,
    rating: 4.9,
    seller_id: "s004",
    seller_name: "Book Nook",
  },
  {
    id: "p007",
    name: "Canvas Tote Bag",
    category: "Fashion",
    price: 390,
    rating: 4.4,
    seller_id: "s005",
    seller_name: "FashionWave",
  },
  {
    id: "p008",
    name: "LED Desk Lamp",
    category: "Home & Living",
    price: 760,
    rating: 4.6,
    seller_id: "s003",
    seller_name: "HomeGo",
  },
];

const CATEGORY_ICON = {
  Electronics: "ti-volume",
  Sports: "ti-activity",
  "Home & Living": "ti-bulb",
  Beauty: "ti-sun",
  Books: "ti-book",
  Fashion: "ti-bag",
  Toys: "ti-puzzle",
};

const s = {
  page: {
    fontFamily: "'Inter',sans-serif",
    background: "#fafafa",
    minHeight: "100vh",
  },
  hero: {
    background: "#fff",
    padding: "5rem 2.5rem 4rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
    borderBottom: "0.5px solid #e8e8e8",
  },
  heroLabel: {
    fontSize: 11,
    letterSpacing: "2px",
    color: "#bbb",
    marginBottom: "1.25rem",
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: 300,
    lineHeight: 1.2,
    color: "#111",
    marginBottom: "1.5rem",
    letterSpacing: "-0.5px",
  },
  heroSub: {
    fontSize: 14,
    color: "#666",
    lineHeight: 1.8,
    marginBottom: "2rem",
    maxWidth: 380,
  },
  heroActions: { display: "flex", alignItems: "center", gap: "1.5rem" },
  btnDark: {
    background: "#111",
    color: "#fff",
    border: "none",
    padding: "11px 24px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    letterSpacing: "0.2px",
  },
  heroStats: {
    display: "flex",
    gap: "3rem",
    marginTop: "3rem",
    paddingTop: "2rem",
    borderTop: "0.5px solid #e8e8e8",
  },
  heroVisual: {
    background: "#f4f4f4",
    borderRadius: 16,
    height: 320,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccc",
  },
  cats: {
    background: "#fff",
    padding: "1.25rem 2.5rem",
    display: "flex",
    gap: 4,
    borderBottom: "0.5px solid #e8e8e8",
    overflowX: "auto",
  },
  searchBar: {
    background: "#fff",
    padding: "0.75rem 2.5rem",
    borderBottom: "0.5px solid #e8e8e8",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    maxWidth: 400,
    padding: "8px 14px",
    fontSize: 13,
    border: "0.5px solid #e0e0e0",
    borderRadius: 99,
    outline: "none",
    background: "#fafafa",
    color: "#111",
  },
  searchBtn: {
    padding: "8px 18px",
    fontSize: 13,
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 99,
    cursor: "pointer",
    fontWeight: 500,
  },
  clearBtn: {
    padding: "8px 14px",
    fontSize: 12,
    background: "none",
    color: "#bbb",
    border: "0.5px solid #e0e0e0",
    borderRadius: 99,
    cursor: "pointer",
  },
  section: { padding: "3rem 2.5rem", background: "#fafafa" },
  secHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "2rem",
  },
  secTitle: {
    fontSize: 18,
    fontWeight: 500,
    color: "#111",
    letterSpacing: "-0.2px",
  },
  secLink: {
    fontSize: 12,
    color: "#bbb",
    cursor: "pointer",
    letterSpacing: "0.3px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
    gap: "1px",
    background: "#e8e8e8",
    border: "0.5px solid #e8e8e8",
    borderRadius: 12,
    overflow: "hidden",
  },
  pcard: {
    background: "#fff",
    padding: "1.5rem 1.25rem 1.25rem",
    cursor: "pointer",
    position: "relative",
  },
  pimg: {
    width: "100%",
    aspectRatio: "1",
    background: "#f7f7f7",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccc",
    marginBottom: "1rem",
  },
  pname: {
    fontSize: 13,
    fontWeight: 500,
    color: "#111",
    marginBottom: 3,
    lineHeight: 1.4,
  },
  pcat: {
    fontSize: 11,
    color: "#bbb",
    letterSpacing: "0.3px",
    marginBottom: 10,
  },
  pfoot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pprice: { fontSize: 14, fontWeight: 500, color: "#111" },
  prating: {
    fontSize: 11,
    color: "#bbb",
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  orderSection: { padding: "0 2.5rem 3rem" },
  orderTable: {
    background: "#fff",
    border: "0.5px solid #e8e8e8",
    borderRadius: 12,
    overflow: "hidden",
  },
  orow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 20px",
    fontSize: 13,
  },
  oicon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#bbb",
    flexShrink: 0,
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    color: "#bbb",
    fontSize: 13,
    gridColumn: "1/-1",
  },
};

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("All");
  const [searchInput, setSearchInput] = useState("");   // 輸入框即時值
  const [searchQuery, setSearchQuery] = useState("");   // 實際送出的搜尋關鍵字
  const { cartCount, addToCart } = useCart();

  // 送出搜尋
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  // 清除搜尋
  const handleClear = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  // Enter 鍵送出
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // GET /products，依分類 + 搜尋關鍵字篩選
  const { data, loading, error } = useApi(
    () => {
      const params = {};
      if (activeCat !== "All") params.category = activeCat;
      if (searchQuery) params.search = searchQuery;
      return getProducts(Object.keys(params).length > 0 ? params : undefined);
    },
    [activeCat, searchQuery],
  );

  const products = Array.isArray(data) ? data : (data?.products ?? []);

  const usingMockData = !!error;
  const displayProducts = usingMockData
    ? activeCat === "All"
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((p) => p.category === activeCat)
    : products;

  // 標題文字
  const sectionTitle = () => {
    const parts = [];
    if (activeCat !== "All") parts.push(activeCat);
    if (searchQuery) parts.push(`"${searchQuery}"`);
    return parts.length > 0
      ? `Results for ${parts.join(" · ")}`
      : "Featured products";
  };

  return (
    <div style={s.page}>
      <Navbar cartCount={cartCount} />

      <div style={s.hero}>
        <div>
          <div style={s.heroLabel}>NEW ARRIVALS 2026</div>
          <h1 style={s.heroTitle}>
            Curated for
            <br />
            <strong style={{ fontWeight: 500 }}>everyday living.</strong>
          </h1>
          <p style={s.heroSub}>
            Thoughtfully selected products from verified sellers. Quality you
            can feel, prices that make sense.
          </p>
          <div style={s.heroActions}>
            <button
              style={s.btnDark}
              onClick={() =>
                document
                  .getElementById("featured-products")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Shop now
            </button>
          </div>
          <div style={s.heroStats}>
            {[
              ["98k+", "PRODUCTS"],
              ["12k+", "SELLERS"],
              ["4.7", "AVG RATING"],
            ].map(([n, l]) => (
              <div key={l}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: "#111",
                    marginBottom: 3,
                  }}
                >
                  {n}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#bbb",
                    letterSpacing: "0.5px",
                  }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...s.heroVisual, overflow: "hidden", padding: 0 }}>
          <img
            src="/images/banner.jpg"
            alt="hero"
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }}
            onError={e => { e.target.style.display = "none"; }}
          />
        </div>
      </div>

      {/* 分類列 */}
      <div style={s.cats}>
        {CATS.map((cat) => (
          <span
            key={cat}
            onClick={() => setActiveCat(cat)}
            style={{
              fontSize: 12,
              letterSpacing: "0.5px",
              padding: "6px 16px",
              cursor: "pointer",
              borderRadius: 99,
              whiteSpace: "nowrap",
              border: "0.5px solid transparent",
              background: activeCat === cat ? "#111" : "transparent",
              color: activeCat === cat ? "#fff" : "#999",
            }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* 搜尋列 */}
      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Search products…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button style={s.searchBtn} onClick={handleSearch}>
          <i className="ti ti-search" style={{ marginRight: 4 }} />
          Search
        </button>
        {searchQuery && (
          <button style={s.clearBtn} onClick={handleClear}>
            ✕ Clear
          </button>
        )}
      </div>

      <div id="featured-products" style={s.section}>
        <div style={s.secHead}>
          <div style={s.secTitle}>{sectionTitle()}</div>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 16px",
              marginBottom: 16,
              background: "#fff9f0",
              border: "0.5px solid #f5e6c8",
              borderRadius: 8,
              color: "#b8860b",
              fontSize: 12,
              lineHeight: 1.6,
            }}
          >
            ⚠️ 無法連線到後端: {error.message}
            <br />
            目前顯示開發測試用的範例商品。
          </div>
        )}

        <div style={s.grid}>
          {loading && <div style={s.emptyState}>Loading products…</div>}

          {!loading && displayProducts.length === 0 && (
            <div style={s.emptyState}>
              {searchQuery ? `No results for "${searchQuery}".` : "No products found."}
            </div>
          )}

          {!loading &&
            displayProducts
              .filter((p) => {
                const pid = p.id ?? p.product_id;
                if (pid && String(pid).startsWith("prod_")) {
                  const num = parseInt(String(pid).replace("prod_", ""), 10);
                  return num >= 1 && num <= 48;
                }
                return true;
              })
              .map((p) => {
                const pid = p.id ?? p.product_id;
                return (
                  <Link
                    key={pid}
                    to={`/products/${pid}`}
                    style={{
                      ...s.pcard,
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div style={s.pimg}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.product_name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <i
                          className={`ti ${CATEGORY_ICON[p.product_category_name ?? p.category] || "ti-package"}`}
                          style={{ fontSize: 40, color: "#ccc" }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div style={s.pname}>
                      {p.product_name ?? p.name ?? p.product_id}
                    </div>
                    <div style={s.pcat}>{(p.product_category_name ?? p.category ?? "").toUpperCase()}</div>
                    <div style={s.pfoot}>
                      <div style={s.pprice}>
                        NT${Number(p.product_price).toLocaleString()}
                      </div>
                      <div style={s.prating}>
                        <span style={{ color: "#c8a96e" }}>★</span>
                        {p.rating ?? "—"}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(
                          {
                            id: pid,
                            name: p.product_name ?? p.name,
                            seller_id: p.seller_id,
                            seller: p.seller_name ?? p.seller,
                            price: Number(p.product_price ?? p.price),
                            icon:
                              CATEGORY_ICON[
                                p.product_category_name ?? p.category
                              ] || "ti-package",
                          },
                          1,
                        );
                      }}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        border: "0.5px solid #e8e8e8",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        fontSize: 13,
                      }}
                      aria-label="Add to cart"
                    >
                      <i className="ti ti-plus" aria-hidden="true" />
                    </button>
                  </Link>
                );
              })}
        </div>
      </div>

      <div style={s.orderSection}>
        <div style={s.secHead}>
          <div style={s.secTitle}>Recent orders</div>
          <Link to="/orders" style={{ ...s.secLink, textDecoration: "none" }}>
            View all →
          </Link>
        </div>
        <div style={s.orderTable}>
          {ORDERS.map((order, i) => {
            const st = STATUS[order.status];
            return (
              <div
                key={order.id}
                style={{
                  ...s.orow,
                  borderBottom:
                    i < ORDERS.length - 1 ? "0.5px solid #f5f5f5" : "none",
                }}
              >
                <div style={s.oicon}>
                  <i
                    className={`ti ${order.icon}`}
                    style={{ fontSize: 16 }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>
                    {order.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#bbb",
                      fontFamily: "monospace",
                    }}
                  >
                    #{order.id}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontWeight: 500,
                    letterSpacing: "0.3px",
                    background: st.bg,
                    color: st.color,
                  }}
                >
                  {st.label}
                </span>
                <div
                  style={{ fontSize: 11, color: "#bbb", marginLeft: "auto" }}
                >
                  {order.date}
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 500, marginLeft: "1rem" }}
                >
                  NT${order.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
