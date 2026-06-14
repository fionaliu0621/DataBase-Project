import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const COLLECTIONS = [
  { id:"c001", name:"Summer Essentials",  count:48, desc:"Light, breathable, and built for the heat.",       icon:"ti-sun"         },
  { id:"c002", name:"Work From Home",     count:32, desc:"Everything you need for a productive workspace.",  icon:"ti-device-laptop"},
  { id:"c003", name:"Kitchen & Dining",   count:61, desc:"Elevate your everyday cooking and dining.",        icon:"ti-tools-kitchen"},
  { id:"c004", name:"Active & Sports",    count:29, desc:"Gear up for any workout, indoors or out.",         icon:"ti-run"          },
  { id:"c005", name:"Minimal Living",     count:44, desc:"Curated pieces for a clean, calm space.",          icon:"ti-layout-2"     },
  { id:"c006", name:"Books & Learning",   count:37, desc:"Read more, know more, grow more.",                 icon:"ti-book"         },
];

export default function CollectionsPage() {
  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />
      <div style={{ padding:"4rem 2.5rem 3rem", background:"#fff", borderBottom:"0.5px solid #e8e8e8" }}>
        <div style={{ fontSize:11, letterSpacing:"2px", color:"#bbb", marginBottom:12 }}>CURATED FOR YOU</div>
        <h1 style={{ fontSize:34, fontWeight:300, color:"#111", letterSpacing:"-0.5px", marginBottom:10 }}>Collections</h1>
        <p style={{ fontSize:14, color:"#888", maxWidth:480, lineHeight:1.8 }}>Thoughtfully grouped products around the things that matter most in daily life.</p>
      </div>

      <div style={{ padding:"3rem 2.5rem" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:1, background:"#e8e8e8", border:"0.5px solid #e8e8e8", borderRadius:16, overflow:"hidden" }}>
          {COLLECTIONS.map(col => (
            <Link
              key={col.id}
              to={`/collections/${col.id}`}
              style={{ textDecoration:"none", display:"block", background:"#fff", padding:"2rem", cursor:"pointer", position:"relative", overflow:"hidden" }}
              onMouseEnter={e => e.currentTarget.style.background="#fafafa"}
              onMouseLeave={e => e.currentTarget.style.background="#fff"}
            >
              <div style={{ width:44, height:44, borderRadius:10, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.25rem" }}>
                <i className={`ti ${col.icon}`} style={{ fontSize:20, color:"#888" }} aria-hidden="true" />
              </div>
              <div style={{ fontSize:15, fontWeight:500, color:"#111", marginBottom:6 }}>{col.name}</div>
              <div style={{ fontSize:12, color:"#aaa", lineHeight:1.7, marginBottom:14 }}>{col.desc}</div>
              <div style={{ fontSize:11, color:"#bbb", letterSpacing:"0.5px" }}>{col.count} PRODUCTS</div>
              <div style={{ position:"absolute", bottom:"1.5rem", right:"1.5rem" }}>
                <i className="ti ti-arrow-right" style={{ fontSize:16, color:"#ccc" }} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
