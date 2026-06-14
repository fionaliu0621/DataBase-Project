import Navbar from "../components/Navbar";

const STATS = [["98k+","Products listed"],["12k+","Verified sellers"],["4.7★","Average rating"],["2M+","Orders fulfilled"]];
const VALUES = [
  { icon:"ti-shield-check", title:"Buyer protection",    desc:"Every order is covered. If something goes wrong, we make it right." },
  { icon:"ti-certificate",  title:"Verified sellers",    desc:"Every seller goes through our verification process before listing." },
  { icon:"ti-truck",        title:"Reliable delivery",   desc:"Fast, tracked shipping across Taiwan with real-time updates." },
  { icon:"ti-leaf",         title:"Sustainable choices", desc:"We highlight eco-friendly products and responsible sellers." },
];
const TEAM = [
  { initials:"CW", name:"Chen Wei",    role:"Co-founder & CEO" },
  { initials:"LM", name:"Lin Mei",     role:"Head of Product"  },
  { initials:"WJ", name:"Wang Jia",    role:"Lead Engineer"    },
  { initials:"YH", name:"Yang Hui",    role:"Head of Design"   },
];

export default function AboutPage() {
  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ background:"#111", padding:"6rem 2.5rem 5rem", textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:"2px", color:"#555", marginBottom:16 }}>OUR STORY</div>
        <h1 style={{ fontSize:38, fontWeight:300, color:"#fff", letterSpacing:"-1px", lineHeight:1.2, marginBottom:16, maxWidth:560, margin:"0 auto 16px" }}>
          Built for people who<br /><strong style={{ fontWeight:500 }}>care about quality.</strong>
        </h1>
        <p style={{ fontSize:14, color:"#666", lineHeight:1.9, maxWidth:480, margin:"0 auto" }}>
          ShopHub started in 2019 with a simple idea — Taiwan deserves a cleaner, more honest shopping experience. No dark patterns, no fake reviews, no hidden fees.
        </p>
      </div>

      {/* Stats */}
      <div style={{ background:"#fff", borderBottom:"0.5px solid #e8e8e8", padding:"2.5rem", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
        {STATS.map(([n,l],i) => (
          <div key={l} style={{ textAlign:"center", borderRight: i<3 ? "0.5px solid #e8e8e8" : "none", padding:"0.5rem" }}>
            <div style={{ fontSize:26, fontWeight:400, color:"#111", letterSpacing:"-0.5px", marginBottom:4 }}>{n}</div>
            <div style={{ fontSize:11, color:"#bbb", letterSpacing:"0.5px" }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <div style={{ padding:"4rem 2.5rem" }}>
        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:"2rem" }}>WHAT WE STAND FOR</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:1, background:"#e8e8e8", border:"0.5px solid #e8e8e8", borderRadius:16, overflow:"hidden" }}>
          {VALUES.map(v => (
            <div key={v.title} style={{ background:"#fff", padding:"2rem" }}>
              <div style={{ width:40, height:40, borderRadius:10, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" }}>
                <i className={`ti ${v.icon}`} style={{ fontSize:18, color:"#555" }} aria-hidden="true" />
              </div>
              <div style={{ fontSize:14, fontWeight:500, color:"#111", marginBottom:8 }}>{v.title}</div>
              <div style={{ fontSize:13, color:"#888", lineHeight:1.8 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div style={{ padding:"0 2.5rem 4rem", background:"#fafafa" }}>
        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:"2rem" }}>THE TEAM</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12 }}>
          {TEAM.map(p => (
            <div key={p.name} style={{ background:"#fff", borderRadius:16, border:"0.5px solid #e8e8e8", padding:"1.5rem", textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:500, color:"#555", margin:"0 auto 1rem" }}>{p.initials}</div>
              <div style={{ fontSize:13, fontWeight:500, color:"#111", marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:11, color:"#bbb" }}>{p.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
