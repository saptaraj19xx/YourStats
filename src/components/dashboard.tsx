"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, Crosshair, Crown, Gauge, Menu,
  Search, Shield, Target, Trophy, Users, X, Map as MapIcon, Swords,
  BarChart3, UserRound, Globe2, History, Settings, ChevronDown
} from "lucide-react";

const navGroups = [
  { label: "ANALYTICS", items: [
    { name: "Overview", icon: BarChart3 },
    { name: "Player stats", icon: UserRound },
    { name: "Squad stats", icon: Users },
    { name: "Compare players", icon: Swords }
  ]},
  { label: "EXPLORE", items: [
    { name: "Global stats", icon: Globe2 },
    { name: "Weapons", icon: Crosshair },
    { name: "Maps & rotation", icon: MapIcon },
    { name: "Patch history", icon: History }
  ]}
];

const matches = [
  { map: "Erangel", mode: "Squad · TPP", placement: "#2", kills: "8", damage: "1,246", time: "Today, 12:42" },
  { map: "Miramar", mode: "Squad · TPP", placement: "#5", kills: "5", damage: "864", time: "Today, 11:58" },
  { map: "Taego", mode: "Duo · TPP", placement: "#1", kills: "11", damage: "1,584", time: "Yesterday" },
  { map: "Rondo", mode: "Squad · TPP", placement: "#8", kills: "3", damage: "521", time: "Yesterday" }
];

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [notice, setNotice] = useState("");

  const cleanQuery = useMemo(() => query.trim(), [query]);

  function searchPlayer(value = cleanQuery) {
    if (!value) {
      setNotice("Enter a PUBG player name to search.");
      return;
    }
    setSubmitted(value);
    setNotice(`Player lookup for “${value}” is ready for the official PUBG API integration.`);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Crosshair size={20} strokeWidth={2.5} /></div>
          <div><div className="brand-name">YOURSTATS</div><div className="brand-sub">PLAYER INTELLIGENCE</div></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="nav-label">{group.label}</div>
            <div className="nav-list">
              {group.items.map(item => {
                const Icon = item.icon;
                return <button key={item.name} className={`nav-item ${active === item.name ? "active" : ""}`} onClick={() => { setActive(item.name); setMenuOpen(false); }}>
                  <Icon /><span>{item.name}</span>
                </button>;
              })}
            </div>
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="api-note">
            <strong>Data connection</strong>
            <p>Demo interface is active. Connect a PUBG Developer API key to load live player data.</p>
          </div>
          <div className="api-status"><span className="dot" /> API NOT CONNECTED</div>
          <button className="nav-item" style={{marginTop:18,width:"100%"}} onClick={() => setNotice("Settings will be available in a later milestone.")}><Settings /><span>Settings</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={17}/> : <Menu size={17}/>}</button>
          <div className="breadcrumb">YOURSTATS <span style={{color:"#4d594e",margin:"0 8px"}}>/</span> <b>{active.toUpperCase()}</b></div>
          <div className="top-actions">
            <div className="search-wrap"><Search /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPlayer()} placeholder="Search PUBG player..." aria-label="Search PUBG player" /></div>
            <button className="region" onClick={() => setNotice("Region selector will be enabled with API integration.")}>PC · STEAM <ChevronDown size={11} style={{display:"inline",marginLeft:6}} /></button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow">BATTLEGROUNDS INTELLIGENCE / 01</div><h1>{active === "Overview" ? "Player intelligence." : active + "."}</h1><p>Every match tells a story. Find yours in the data.</p></div>
            <div className="season-pill"><span>●</span> SEASON  Y10S4 <span style={{color:"#899489",marginLeft:8}}>DEMO DATA</span></div>
          </div>

          <section className="hero">
            <div className="hero-copy">
              <div className="hero-tag">YOUR NEXT MATCH STARTS WITH INSIGHT</div>
              <h2>Know your game. Own the battleground.</h2>
              <p>Search a PUBG PC player to explore match history, performance trends, weapon stats and the details behind every drop.</p>
            </div>
            <form className="hero-search" onSubmit={e => { e.preventDefault(); searchPlayer(); }}>
              <label>PLAYER LOOKUP / STEAM</label>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter PUBG username..." />
              <button aria-label="Search player" type="submit"><ArrowRight size={17}/></button>
            </form>
          </section>

          {notice && <div role="status" style={{marginTop:12,padding:"10px 13px",border:"1px solid #394734",borderRadius:8,color:"#b7f36b",fontSize:11,background:"#121a13"}}>{notice}</div>}
          {submitted && <div className="player-callout"><div className="avatar">{submitted.slice(0,1).toUpperCase()}</div><div style={{flex:1}}><strong>{submitted}</strong><small>SEARCH REQUEST · DEMO MODE</small></div><span className="season-pill">API PENDING</span></div>}

          <div className="section-head"><h3>Season snapshot</h3><span>ILLUSTRATIVE DATA · NOT LIVE</span></div>
          <div className="stats-grid">
            <StatCard label="MATCHES PLAYED" value="184" foot="Current season" icon={<Activity/>}/>
            <StatCard label="K/D RATIO" value="4.82" foot={<><em>+0.34</em> vs last season</>} icon={<Crosshair/>}/>
            <StatCard label="AVERAGE DAMAGE" value="386" foot="Damage per match" icon={<Gauge/>}/>
            <StatCard label="WIN RATE" value="18.5%" foot={<><em>+2.1%</em> vs last season</>} icon={<Crown/>}/>
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-title"><h3>Performance trend</h3><span>LAST 10 MATCHES</span></div>
              <div className="chart-area" aria-label="Illustrative performance chart">
                {[38,54,43,69,58,76,61,88,72,96].map((height,i)=><div className="chart-col" key={i}><div className="chart-bar" style={{height:`${height}%`,opacity:.45+height/190}}/><span className="chart-label">{i+1}</span></div>)}
              </div>
              <div className="legend"><span><i/> Damage per match</span><span style={{color:"#687468"}}>Trend visualization · sample</span></div>
            </section>
            <section className="panel">
              <div className="panel-title"><h3>Battlefield activity</h3><span>ERANGEL · SAMPLE</span></div>
              <div className="map-preview"><div className="map-road"/><div className="heat one"/><div className="heat two"/><div className="heat three"/></div>
              <div className="map-caption"><span>DROP & ENGAGEMENT ZONES</span><span>PREVIEW ONLY</span></div>
            </section>
          </div>

          <div className="section-head"><h3>Recent matches</h3><span>VIEW MATCH HISTORY <ArrowRight size={11} style={{display:"inline",verticalAlign:"middle",marginLeft:5}}/></span></div>
          <div className="matches">
            <div className="match-row match-head"><span>MAP / MODE</span><span>PLACEMENT</span><span>KILLS</span><span>DAMAGE</span><span>PLAYED</span></div>
            {matches.map((match,i)=><div className="match-row" key={i}>
              <div className="match-map"><div className="map-thumb"/><div>{match.map}<div className="match-muted" style={{fontSize:9,fontWeight:400,marginTop:3}}>{match.mode}</div></div></div>
              <span className="placement">{match.placement}</span><span>{match.kills}</span><span>{match.damage}</span><span className="match-muted">{match.time}</span>
            </div>)}
          </div>

          <div className="footer-note">YOURSTATS IS AN INDEPENDENT COMMUNITY PROJECT AND IS NOT AFFILIATED WITH KRAFTON OR PUBG STUDIOS.<br/>ALL DASHBOARD FIGURES ARE SAMPLE DATA UNTIL OFFICIAL API INTEGRATION IS CONFIGURED.</div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, foot, icon }: { label: string; value: string; foot: React.ReactNode; icon: React.ReactNode }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}
