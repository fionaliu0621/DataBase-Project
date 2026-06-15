import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const COLLECTIONS = {
  c001: { name:"Summer Essentials",  desc:"Light, breathable, and built for the heat.",       icon:"ti-sun"          },
  c002: { name:"Work From Home",     desc:"Everything you need for a productive workspace.",  icon:"ti-device-laptop" },
  c003: { name:"Kitchen & Dining",   desc:"Elevate your everyday cooking and dining.",        icon:"ti-tools-kitchen" },
  c004: { name:"Active & Sports",    desc:"Gear up for any workout, indoors or out.",         icon:"ti-run"           },
  c005: { name:"Minimal Living",     desc:"Curated pieces for a clean, calm space.",          icon:"ti-layout-2"      },
  c006: { name:"Books & Learning",   desc:"Read more, know more, grow more.",                 icon:"ti-book"          },
};

export default function CollectionDetailPage() {
  const { id } = useParams();
  const col = COLLECTIONS[id];

  if (!col) {
    return (
      <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
        <Navbar />
        <div style={{ padding:"6rem 2.5rem", textAlign:"center" }}>
          <div style={{ fontSize:14, color:"#bbb", marginBottom:16 }}>Collection not found.</div>
          <Link to="/collections" style={{ fontSize:13, color:"#111", textDecoration:"underline" }}>Back to Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#fafafa", minHeight:"100vh" }}>
      <Navbar />

      {/* Header */}
      <div style={{ padding:"4rem 2.5rem 3rem", background:"#fff", borderBottom:"0.5px solid #e8e8e8" }}>
        <Link to="/collections" style={{ fontSize:12, color:"#bbb", textDecoration:"none", letterSpacing:"0.3px", display:"inline-flex", alignItems:"center", gap:4, marginBottom:20 }}>
          <i className="ti ti-arrow-left" style={{ fontSize:13 }} />
          Collections
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <i className={`ti ${col.icon}`} style={{ fontSize:22, color:"#888" }} aria-hidden="true" />
          </div>
          <div>
            <h1 style={{ fontSize:28, fontWeight:300, color:"#111", letterSpacing:"-0.5px", margin:0 }}>{col.name}</h1>
            <p style={{ fontSize:13, color:"#aaa", margin:"4px 0 0" }}>{col.desc}</p>
          </div>
        </div>
      </div>

      {/* Placeholder content */}
      <div style={{ padding:"3rem 2.5rem" }}>
        <div style={{ background:"#fff", border:"0.5px solid #e8e8e8", borderRadius:16, padding:"4rem 2rem", textAlign:"center" }}>
          <i className={`ti ${col.icon}`} style={{ fontSize:36, color:"#ddd", display:"block", marginBottom:16 }} />
          <div style={{ fontSize:14, color:"#bbb", marginBottom:8 }}>Products coming soon</div>
          <div style={{ fontSize:12, color:"#ccc" }}>This collection is being curated. Check back later.</div>
        </div>
      </div>
    </div>
  );
}
