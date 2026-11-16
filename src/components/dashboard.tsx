"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowRight, Crosshair, Crown, Gauge, Menu, Search, Settings,
  Users, X, Map as MapIcon, Swords, BarChart3, UserRound, Globe2,
  History, ChevronDown, LoaderCircle
} from "lucide-react";

type PlayerResult = {
  id: string;
  name: string;
  platform: string;
  lifetimeStats: Record<string, {
    roundsPlayed?: number; wins?: number; kills?: number; deaths?: number;
    damageDealt?: number; headshotKills?: number; assists?: number; top10s?: number;
  }>;
  statsAvailable: boolean;
  recentMatchIds: string[];
  recentMatchCount: number;
  statsError: string | null;
};

const navGroups = [
  { label: "ANALYTICS", items: [
    { name: "Overview", icon: BarChart3 }, { name: "Player stats", icon: UserRound },
    { name: "Squad stats", icon: Users }, { name: "Compare players", icon: Swords }
  ]},
  { label: "EXPLORE", items: [
    { name: "Global stats", icon: Globe2 }, { name: "Weapons", icon: Crosshair },
    { name: "Maps & rotation", icon: MapIcon }, { name: "Patch history", icon: History }
  ]}
];

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState<PlayerResult | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchDetails, setMatchDetails] = useState<Array<{
    id: string; map: string; gameMode: string; createdAt: string;
    durationSeconds: number; placement: number | null; kills: number | null;
    assists: number | null; damage: number | null; headshotKills: number | null;
    survivalSeconds: number | null;
  }>>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesNotice, setMatchesNotice] = useState("");
  const cleanQuery = useMemo(() => query.trim(), [query]);

  async function searchPlayer(value = cleanQuery) {
    if (!value) { setNotice("Enter a PUBG player name to search."); return; }
    setLoading(true); setNotice(""); setPlayer(null);
    try {
      const response = await fetch(`/api/players?name=${encodeURIComponent(value)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Player search failed.");
      setPlayer(payload.player);
      setMatchDetails([]);
      setMatchesNotice("");
      setNotice(`Found ${payload.player.name} on PUBG PC · Steam.`);
      setActive("Player stats");
      if (payload.player.recentMatchIds?.length) {
        setMatchesLoading(true);
        try {
          const matchResponse = await fetch(`/api/matches?playerId=${encodeURIComponent(payload.player.id)}&ids=${encodeURIComponent(payload.player.recentMatchIds.slice(0, 6).join(","))}`);
          const matchPayload = await matchResponse.json();
          if (!matchResponse.ok) throw new Error(matchPayload.error || "Could not load match details.");
          setMatchDetails(matchPayload.matches ?? []);
          if (!matchPayload.matches?.length) setMatchesNotice("PUBG did not return match details for the recent match IDs.");
        } catch (matchError) {
          setMatchesNotice(matchError instanceof Error ? matchError.message : "Could not load match details.");
        } finally {
          setMatchesLoading(false);
        }
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to search right now.");
    } finally {
      setLoading(false);
    }
  }

  const preferredMode = player?.lifetimeStats["squad-fpp"]
    ?? player?.lifetimeStats["solo-fpp"]
    ?? player?.lifetimeStats["duo-fpp"]
    ?? (player ? Object.values(player.lifetimeStats)[0] : undefined);

  const rounds = preferredMode?.roundsPlayed;
  const kills = preferredMode?.kills;
  const deaths = preferredMode?.deaths;
  const damage = preferredMode?.damageDealt;
  const wins = preferredMode?.wins;
  const kd = kills !== undefined && deaths !== undefined && deaths > 0 ? (kills / deaths).toFixed(2) : "—";
  const avgDamage = rounds !== undefined && rounds > 0 && damage !== undefined ? Math.round(damage / rounds).toString() : "—";
  const winRate = rounds !== undefined && rounds > 0 && wins !== undefined ? `${((wins / rounds) * 100).toFixed(1)}%` : "—";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Crosshair size={20} strokeWidth={2.5} /></div>
          <div><div className="brand-name">YOURSTATS</div><div className="brand-sub">PLAYER INTELLIGENCE</div></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        {navGroups.map(group => <div key={group.label}>
          <div className="nav-label">{group.label}</div>
          <div className="nav-list">{group.items.map(item => {
            const Icon = item.icon;
            return <button key={item.name} className={`nav-item ${active === item.name ? "active" : ""}`} onClick={() => { setActive(item.name); setMenuOpen(false); }}>
              <Icon /><span>{item.name}</span>
            </button>;
          })}</div>
        </div>)}
        <div className="sidebar-bottom">
          <div className="api-note"><strong>Data connection</strong><p>Connected to the official PUBG PC API through a secure server route.</p></div>
          <div className="api-status"><span className="dot" style={{background:"#b7f36b",boxShadow:"0 0 10px #b7f36b66"}} /> SERVER API READY</div>
          <button className="nav-item" style={{marginTop:18,width:"100%"}} onClick={() => setNotice("Settings will be available in a later milestone.")}><Settings /><span>Settings</span></button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={17}/> : <Menu size={17}/>}</button>
          <div className="breadcrumb">YOURSTATS <span style={{color:"#4d594e",margin:"0 8px"}}>/</span> <b>{active.toUpperCase()}</b></div>
          <div className="top-actions">
            <div className="search-wrap"><Search /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchPlayer()} placeholder="Search PUBG player..." aria-label="Search PUBG player" /></div>
            <button className="region" onClick={() => setNotice("PUBG PC · Steam is currently selected.")}>PC · STEAM <ChevronDown size={11} style={{display:"inline",marginLeft:6}} /></button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div><div className="eyebrow">BATTLEGROUNDS INTELLIGENCE / 01</div><h1>{player ? `${player.name}.` : "Player intelligence."}</h1><p>Every match tells a story. Find yours in the data.</p></div>
            <div className="season-pill"><span>●</span> PUBG PC <span style={{color:"#899489",marginLeft:8}}>STEAM</span></div>
          </div>

          <section className="hero">
            <div className="hero-copy">
              <div className="hero-tag">YOUR NEXT MATCH STARTS WITH INSIGHT</div>
              <h2>Know your game. Own the battleground.</h2>
              <p>Search a PUBG PC player to explore available lifetime statistics and recent match references.</p>
            </div>
            <form className="hero-search" onSubmit={e => { e.preventDefault(); searchPlayer(); }}>
              <label>PLAYER LOOKUP / STEAM</label>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter exact PUBG username..." />
              <button aria-label="Search player" type="submit" disabled={loading}>{loading ? <LoaderCircle size={17} className="spin"/> : <ArrowRight size={17}/>}</button>
            </form>
          </section>

          {notice && <div role="status" style={{marginTop:12,padding:"10px 13px",border:"1px solid #394734",borderRadius:8,color:"#b7f36b",fontSize:11,background:"#121a13"}}>{notice}</div>}

          {player ? <>
            <div className="section-head"><h3>Player profile</h3><span>LIVE PUBG API RESPONSE</span></div>
            <div className="player-callout">
              <div className="avatar">{player.name.slice(0,1).toUpperCase()}</div>
              <div style={{flex:1,minWidth:0}}><strong>{player.name}</strong><small>{player.platform} · ACCOUNT {player.id.slice(0,12)}…</small></div>
              <span className="season-pill">VERIFIED API DATA</span>
            </div>
            <div className="section-head"><h3>Lifetime snapshot</h3><span>{preferredMode ? "MODE: " + (player.lifetimeStats["squad-fpp"] ? "SQUAD FPP" : "AVAILABLE MODE") : "STATS UNAVAILABLE"}</span></div>
            <div className="stats-grid">
              <StatCard label="MATCHES PLAYED" value={rounds === undefined ? "—" : rounds.toLocaleString()} foot="Lifetime rounds" icon={<Activity/>}/>
              <StatCard label="K/D RATIO" value={kd} foot={`${kills === undefined ? "—" : kills.toLocaleString()} kills · ${deaths === undefined ? "—" : deaths.toLocaleString()} deaths`} icon={<Crosshair/>}/>
              <StatCard label="AVERAGE DAMAGE" value={avgDamage} foot="Damage per round" icon={<Gauge/>}/>
              <StatCard label="WIN RATE" value={winRate} foot={`${wins === undefined ? "—" : wins.toLocaleString()} wins`} icon={<Crown/>}/>
            </div>
            <div className="dashboard-grid">
              <section className="panel">
                <div className="panel-title"><h3>Combat summary</h3><span>LIFETIME · SELECTED MODE</span></div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12}}>
                  <MiniStat label="Headshot kills" value={preferredMode?.headshotKills === undefined ? "—" : preferredMode.headshotKills.toLocaleString()}/>
                  <MiniStat label="Assists" value={preferredMode?.assists === undefined ? "—" : preferredMode.assists.toLocaleString()}/>
                  <MiniStat label="Top 10 finishes" value={preferredMode?.top10s === undefined ? "—" : preferredMode.top10s.toLocaleString()}/>
                  <MiniStat label="Recent matches" value={player.recentMatchCount.toString()}/>
                </div>
              </section>
              <section className="panel">
                <div className="panel-title"><h3>Available game modes</h3><span>FROM API</span></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {Object.keys(player.lifetimeStats).length ? Object.keys(player.lifetimeStats).map(mode => <span key={mode} className="season-pill">{mode.toUpperCase()}</span>) : <span className="match-muted">No lifetime game-mode stats returned.</span>}
                </div>
                {player.statsError && <p className="footer-note" style={{color:"#e5b66a",marginTop:16}}>Lifetime stats unavailable: {player.statsError}</p>}
                <p className="footer-note" style={{marginTop:18}}>The API exposes recent match IDs for a limited retention window. Match detail analysis is the next integration step.</p>
              </section>
            </div>
            <div className="section-head"><h3>Recent match details</h3><span>{matchesLoading ? "LOADING MATCHES…" : `${matchDetails.length} DETAILS LOADED · ${player.recentMatchCount} IDS RETURNED`}</span></div>
            {matchesNotice && <div className="match-row" style={{gridTemplateColumns:"1fr",color:"#e5b66a"}}>{matchesNotice}</div>}
            <div className="matches">
              <div className="match-row match-head" style={{gridTemplateColumns:"1.1fr .8fr .5fr .5fr .7fr"}}><span>MAP / MODE</span><span>PLAYED</span><span>PLACE</span><span>KILLS</span><span>DAMAGE</span></div>
              {matchDetails.map(match => <div className="match-row" style={{gridTemplateColumns:"1.1fr .8fr .5fr .5fr .7fr"}} key={match.id}>
                <span><strong>{match.map}</strong><small className="match-muted" style={{display:"block",marginTop:4}}>{match.gameMode}</small></span>
                <span className="match-muted">{match.createdAt ? new Date(match.createdAt).toLocaleString() : "—"}</span>
                <span className="placement">{match.placement === null ? "—" : `#${match.placement}`}</span>
                <span>{match.kills ?? "—"}</span>
                <span>{match.damage === null ? "—" : Math.round(match.damage).toLocaleString()}</span>
              </div>)}
              {!matchesLoading && !matchDetails.length && <div className="match-row" style={{gridTemplateColumns:"1fr"}}><span className="match-muted">Match details have not loaded yet. The API can return match references separately from their full details.</span></div>}
            </div>
            <p className="footer-note">For API rate-limit safety, YourStats loads details for up to six recent matches at a time. PUBG match data is retained for 14 days.</p>
          </> : <>
            <div className="section-head"><h3>Ready to analyze</h3><span>SEARCH A PLAYER TO LOAD LIVE DATA</span></div>
            <div className="panel" style={{padding:24}}>
              <div className="hero-tag">PLAYER-FIRST ANALYTICS</div>
              <h2 style={{fontSize:19,margin:"10px 0"}}>Your next match starts with insight.</h2>
              <p style={{color:"#9aa59a",fontSize:12,lineHeight:1.8,margin:0}}>Enter an exact PUBG PC Steam in-game name above. YourStats will request the player profile and available lifetime statistics securely through our server.</p>
            </div>
          </>}

          <div className="footer-note">YOURSTATS IS AN INDEPENDENT COMMUNITY PROJECT AND IS NOT AFFILIATED WITH KRAFTON OR PUBG STUDIOS.<br/>PLAYER DATA IS RETRIEVED FROM THE OFFICIAL PUBG API. AVAILABILITY DEPENDS ON PUBG API RETENTION AND RATE LIMITS.</div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, foot, icon }: { label: string; value: string; foot: React.ReactNode; icon: React.ReactNode }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="stat-card"><div className="stat-top">{label}</div><div className="stat-value" style={{fontSize:21}}>{value}</div></div>;
}
