import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, FileText, Wallet,
  ShoppingBag, Package, BarChart3, Shield, UserCircle,
  Wrench, Bell, Search, LogOut, Clock, X, AlertCircle,
  CheckCircle2, Zap, Building2, Plus, ArrowUpRight,
  ArrowDownRight, ChevronRight, ChevronDown, DollarSign,
  ClipboardList, Settings, UserPlus, Calendar, Moon,
  Maximize2, RefreshCw, Hash, Activity, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ─── API ──────────────────────────────────────────────────────────────────────
const API = "https://nexus-backend-production-771f.up.railway.app/api";
const getToken = () => localStorage.getItem("ems_token") || "";
const apiFetch = (path, opts = {}) =>
  fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  });
const safeArr = (d, ...keys) => {
  if (Array.isArray(d)) return d;
  for (const k of keys) if (d && Array.isArray(d[k])) return d[k];
  return [];
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:      "#0a0e17",
  panel:   "#0f1521",
  card:    "#131c2e",
  cardHov: "#162035",
  border:  "rgba(255,255,255,0.06)",
  borderH: "rgba(99,102,241,0.4)",
  accent:  "#6366f1",
  accentD: "#4f46e5",
  accentG: "rgba(99,102,241,0.12)",
  green:   "#22c55e",
  greenG:  "rgba(34,197,94,0.12)",
  amber:   "#f59e0b",
  amberG:  "rgba(245,158,11,0.12)",
  red:     "#ef4444",
  redG:    "rgba(239,68,68,0.12)",
  blue:    "#3b82f6",
  blueG:   "rgba(59,130,246,0.12)",
  purple:  "#a855f7",
  purpleG: "rgba(168,85,247,0.12)",
  cyan:    "#06b6d4",
  t1:      "#f1f5ff",
  t2:      "#8892aa",
  t3:      "#3d4d6a",
};

const CHART_COLORS = [C.accent, C.green, C.amber, C.blue, C.purple, C.cyan, C.red];

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById("ems-css")) return;
  const s = document.createElement("style");
  s.id = "ems-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { color-scheme: dark; }
    html, body, #root { height: 100%; font-family: 'Inter', system-ui, sans-serif; background: ${C.bg}; color: ${C.t1}; -webkit-font-smoothing: antialiased; overflow: hidden; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1a2235; border-radius: 4px; }
    * { scrollbar-width: thin; scrollbar-color: #1a2235 transparent; }
    input, select, textarea, button { font-family: inherit; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    .fadeUp { animation: fadeUp 0.3s ease both; }
    .skeleton { background: linear-gradient(90deg, ${C.card} 25%, ${C.cardHov} 50%, ${C.card} 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
    .scroll { overflow-y: auto; height: 100%; }
    .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 16px; transition: all 0.25s ease; }
    .card:hover { border-color: ${C.borderH}; transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 0 20px rgba(99,102,241,0.1); }
    .nav-btn { width:100%; display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px; border:none; cursor:pointer; font-size:13px; font-weight:500; transition:all 0.2s ease; background:transparent; color:${C.t2}; white-space:nowrap; }
    .nav-btn:hover { background:rgba(99,102,241,0.08); color:${C.t1}; }
    .nav-btn.active { background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12)); color:${C.accent}; font-weight:600; border:1px solid rgba(99,102,241,0.15); }
    .tr { border-bottom: 1px solid ${C.border}; transition: background 0.15s; }
    .tr:hover { background: rgba(255,255,255,0.02); }
    .inp { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:9px; color:${C.t1}; font-size:13px; padding:9px 12px; outline:none; transition:all 0.2s; }
    .inp:focus { border-color:${C.accent}; box-shadow:0 0 0 3px rgba(99,102,241,0.12); background:rgba(99,102,241,0.04); }
    .inp::placeholder { color:${C.t3}; }
    .btn-pri { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; border:none; cursor:pointer; font-size:13px; font-weight:600; color:#fff; background:linear-gradient(135deg,${C.accent},${C.accentD}); box-shadow:0 4px 14px rgba(99,102,241,0.35); transition:all 0.2s; }
    .btn-pri:hover { transform:translateY(-1px) scale(1.02); box-shadow:0 8px 20px rgba(99,102,241,0.45); filter:brightness(1.1); }
    .btn-pri:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .btn-ghost { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; cursor:pointer; font-size:13px; font-weight:500; color:${C.t2}; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); transition:all 0.2s; }
    .btn-ghost:hover { background:rgba(255,255,255,0.08); color:${C.t1}; border-color:rgba(255,255,255,0.15); }
    .btn-danger { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:7px; cursor:pointer; font-size:12px; font-weight:600; color:${C.red}; background:${C.redG}; border:1px solid rgba(239,68,68,0.2); transition:all 0.2s; }
    .btn-danger:hover { background:rgba(239,68,68,0.2); }
    .quick-action { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border-radius:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); color:${C.t1}; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; width:100%; }
    .quick-action:hover { background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.25); }
    .tool-card { background:${C.card}; border:1px solid ${C.border}; border-radius:16px; padding:22px; cursor:pointer; transition:all 0.25s; display:flex; gap:16px; align-items:flex-start; }
    .tool-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.4); border-color:rgba(99,102,241,0.3); }
  `;
  document.head.appendChild(s);
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { section: "MAIN", items: [
    { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
    { id: "employees",  label: "Employees",  icon: Users },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "worklogs",   label: "Work Logs",  icon: ClipboardList },
  ]},
  { section: "FINANCE", items: [
    { id: "salary",  label: "Salary",  icon: DollarSign },
    { id: "orders",  label: "Orders",  icon: Package },
    { id: "buyers",  label: "Buyers",  icon: ShoppingBag },
  ]},
  { section: "MORE", items: [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "tools",     label: "Tools",     icon: Wrench },
    { id: "company",   label: "Settings",  icon: Settings },
    { id: "audit",     label: "Audit Log", icon: Shield },
    { id: "profile",   label: "Profile",   icon: UserCircle },
  ]},
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Sk({ h = 14, w = "80%", r = 7 }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />;
}

function Badge({ label, color = C.accent }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:700, color, background:color+"18", border:`1px solid ${color}22`, letterSpacing:".03em", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function statusBadge(s) {
  const sl = s?.toLowerCase();
  if (["active","present","paid","completed"].includes(sl)) return <Badge label={s?.toUpperCase()} color={C.green}/>;
  if (["inactive","absent","failed","cancelled"].includes(sl)) return <Badge label={s?.toUpperCase()} color={C.red}/>;
  if (["pending","late","processing","on leave"].includes(sl)) return <Badge label={s?.toUpperCase()} color={C.amber}/>;
  return <Badge label={s?.toUpperCase()||"—"} color={C.t2}/>;
}

function roleBadge(r) {
  if (r === "super_admin") return <Badge label="SUPER ADMIN" color={C.purple}/>;
  if (r === "admin") return <Badge label="ADMIN" color={C.accent}/>;
  return <Badge label="EMPLOYEE" color={C.blue}/>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      {label && <p style={{ color:C.t2, marginBottom:6, fontWeight:600 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }}/>
          <span style={{ color:C.t2 }}>{p.name}:</span>
          <span style={{ fontWeight:700, color:C.t1 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}>
      <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:18, width:"100%", maxWidth:480, boxShadow:"0 24px 64px rgba(0,0,0,0.7)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 22px", borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:C.t1 }}>{title}</h3>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:C.t2, cursor:"pointer", background:"transparent", border:"none", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color=C.t1; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.t2; }}
          ><X size={15}/></button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:10, zIndex:2000 }}>
      {toasts.map(t => (
        <div key={t.id} className="fadeUp" style={{ display:"flex", alignItems:"center", gap:10, background:C.panel, border:`1px solid ${t.type==="success"?C.green+"44":t.type==="error"?C.red+"44":C.border}`, borderRadius:12, padding:"12px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", fontSize:13, fontWeight:500, maxWidth:340, color:C.t1 }}>
          {t.type==="success"&&<CheckCircle2 size={15} color={C.green}/>}
          {t.type==="error"&&<AlertCircle size={15} color={C.red}/>}
          {t.type==="info"&&<Zap size={15} color={C.accent}/>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:C.t2, marginBottom:7 }}>{label}</label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text", icon: Icon, style: ext }) {
  return (
    <div style={{ position:"relative", ...ext }}>
      {Icon && <Icon size={14} color={C.t3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>}
      <input className="inp" type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ paddingLeft: Icon ? 32 : 12 }}/>
    </div>
  );
}

function StatCard({ label, value, sub, deltaUp, gradient, icon: Icon, chart, loading }) {
  return (
    <div className="card fadeUp" style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:11, fontWeight:700, color:C.t2, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>{label}</p>
          {loading ? <Sk h={32} w={90}/> : <p style={{ fontSize:30, fontWeight:800, color:C.t1, letterSpacing:"-.02em" }}>{value}</p>}
          {sub && !loading && (
            <p style={{ fontSize:12, marginTop:5, fontWeight:500, color: deltaUp ? C.green : C.t2, display:"flex", alignItems:"center", gap:3 }}>
              {deltaUp && <ArrowUpRight size={12}/>}{sub}
            </p>
          )}
        </div>
        <div style={{ width:44, height:44, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:gradient }}>
          {Icon && <Icon size={20} color="#fff"/>}
        </div>
      </div>
      {chart && !loading && (
        <div style={{ height:48, marginLeft:-4, marginRight:-4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top:0, right:0, bottom:0, left:0 }}>
              <defs>
                <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.accent} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={C.accent} strokeWidth={1.5} fill={`url(#g-${label})`} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function Table({ columns, rows, loading, emptyText = "No data" }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {columns.map(c => (
                <th key={c.key} style={{ padding:"11px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:C.t3, letterSpacing:".08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length:5 }).map((_,i) => (
              <tr key={i} className="tr">
                {columns.map(c => <td key={c.key} style={{ padding:"13px 16px" }}><Sk h={13} w={c.w||"80%"}/></td>)}
              </tr>
            )) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding:"40px 16px", textAlign:"center", fontSize:13, color:C.t2 }}>{emptyText}</td></tr>
            ) : rows.map((row,i) => (
              <tr key={row._id||row.id||i} className="tr">
                {columns.map(c => <td key={c.key} style={{ padding:"13px 16px", fontSize:13, color:C.t1 }}>{c.render ? c.render(row[c.key],row) : row[c.key]??"—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageShell({ title, sub, actions, children }) {
  return (
    <div className="scroll" style={{ padding:"28px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.t1, letterSpacing:"-.02em" }}>{title}</h1>
          {sub && <p style={{ fontSize:13, color:C.t2, marginTop:4 }}>{sub}</p>}
        </div>
        {actions && <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>{actions}</div>}
      </div>
      <div className="fadeUp">{children}</div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ addToast, user, setPage }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers]     = useState([]);
  const [orders, setOrders]   = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [uR,oR,sR,aR] = await Promise.allSettled([
          apiFetch("/users").then(r=>r.json()),
          apiFetch("/orders").then(r=>r.json()),
          apiFetch("/salaries").then(r=>r.json()),
          apiFetch("/attendance").then(r=>r.json()),
        ]);
        setUsers(safeArr(uR.value,"users","data"));
        setOrders(safeArr(oR.value,"orders","data"));
        setSalaries(safeArr(sR.value,"salaries","data"));
        setAttendance(safeArr(aR.value,"attendance","records","data"));
      } catch { addToast("Failed to load dashboard","error"); }
      setLoading(false);
    })();
  }, []);

  const today    = new Date();
  const todayStr = today.toDateString();
  const todayAtt = attendance.filter(a => a.date && new Date(a.date).toDateString() === todayStr);
  const present  = todayAtt.filter(a => a.status === "present").length;
  const lateC    = todayAtt.filter(a => a.status === "late").length;
  const absentC  = todayAtt.filter(a => a.status === "absent").length;
  const pendSal  = salaries.filter(s => !s.status || s.status === "pending").length;
  const totalEmp = users.length;
  const attRate  = totalEmp ? Math.round((present/totalEmp)*100) : 0;
  const thisMonthNew = users.filter(u => { const d=new Date(u.createdAt); return d.getMonth()===today.getMonth()&&d.getFullYear()===today.getFullYear(); }).length;

  const deptMap  = users.reduce((acc,u) => { const d=u.department||"Other"; acc[d]=(acc[d]||0)+1; return acc; }, {});
  const deptData = Object.entries(deptMap).map(([name,value]) => ({ name, value }));

  const last7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const label = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d.getDay()===0?6:d.getDay()-1];
    const p = attendance.filter(a => a.date && new Date(a.date).toDateString()===d.toDateString() && a.status==="present").length;
    const ab= attendance.filter(a => a.date && new Date(a.date).toDateString()===d.toDateString() && a.status==="absent").length;
    return { label, present:p, absent:ab };
  });

  const recentUsers  = [...users].slice(-5).reverse();
  const sparkData    = [3,5,4,7,6,8,totalEmp||1].map(v=>({v}));
  const attSparkData = last7.map(d=>({v:d.present}));
  const salSparkData = [2,3,2,4,3,pendSal,pendSal].map(v=>({v}));
  const ordSparkData = [1,2,3,2,4,3,orders.length||1].map(v=>({v}));

  const avatar = (name, size=32) => (
    <div style={{ width:size, height:size, borderRadius:9, background:C.accentG, border:`1px solid ${C.accent}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:800, color:C.accent, flexShrink:0 }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );

  return (
    <div className="scroll" style={{ padding:"24px 28px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.t1, letterSpacing:"-.02em" }}>Dashboard</h1>
          <p style={{ fontSize:13, color:C.t2, marginTop:3 }}>Welcome back, <span style={{ color:C.accent, fontWeight:600 }}>{user?.name?.split(" ")[0]}</span>! Here's what's happening today.</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:12, padding:"9px 16px", fontSize:13, color:C.t2 }}>
          <Calendar size={14} color={C.accent}/>
          {today.toLocaleDateString("en-IN",{ month:"long", day:"numeric", year:"numeric" })}
          <ChevronDown size={13} color={C.t3}/>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
        <StatCard label="Total Employees" value={loading?"—":totalEmp} sub={`+${thisMonthNew} this month`} deltaUp gradient={`linear-gradient(135deg,${C.accent},${C.accentD})`} icon={Users} chart={sparkData} loading={loading}/>
        <StatCard label="Present Today" value={loading?"—":present} sub={`${attRate}% attendance rate`} deltaUp gradient="linear-gradient(135deg,#22c55e,#16a34a)" icon={CalendarCheck} chart={attSparkData} loading={loading}/>
        <StatCard label="Pending Salaries" value={loading?"—":pendSal} sub="Needs attention" gradient="linear-gradient(135deg,#f59e0b,#d97706)" icon={DollarSign} chart={salSparkData} loading={loading}/>
        <StatCard label="Total Orders" value={loading?"—":orders.length} sub={`${orders.filter(o=>o.status==="completed").length} completed`} deltaUp gradient="linear-gradient(135deg,#3b82f6,#2563eb)" icon={Package} chart={ordSparkData} loading={loading}/>
      </div>

      {/* Row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14 }}>
        {/* Recent Employees */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${C.border}` }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.t1 }}>Recent Employees</h2>
            <button onClick={()=>setPage("employees")} style={{ fontSize:12, color:C.accent, fontWeight:600, display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer" }}>
              View all <ArrowUpRight size={13}/>
            </button>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}` }}>
                {["NAME","DEPARTMENT","ROLE","STATUS"].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10, fontWeight:700, color:C.t3, letterSpacing:".08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_,i) => (
                <tr key={i} className="tr">{[160,100,90,80].map((w,j)=><td key={j} style={{ padding:"12px 16px" }}><Sk h={12} w={w}/></td>)}</tr>
              )) : recentUsers.length===0 ? (
                <tr><td colSpan={4} style={{ padding:32, textAlign:"center", color:C.t2, fontSize:13 }}>No employees yet</td></tr>
              ) : recentUsers.map((u,i) => (
                <tr key={u._id||i} className="tr">
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {avatar(u.name)}
                      <span style={{ fontSize:13, fontWeight:500, color:C.t1 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:C.t2 }}>{u.department||"—"}</td>
                  <td style={{ padding:"12px 16px" }}>{roleBadge(u.role)}</td>
                  <td style={{ padding:"12px 16px" }}>{statusBadge(u.isActive!==false?"active":"inactive")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.t1, marginBottom:14 }}>Quick Actions</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { label:"Add Employee",    icon:UserPlus,     gradient:`linear-gradient(135deg,${C.accent},${C.accentD})`, page:"employees" },
              { label:"View Attendance", icon:CalendarCheck,gradient:"linear-gradient(135deg,#22c55e,#16a34a)", page:"attendance" },
              { label:"Manage Salary",   icon:DollarSign,   gradient:"linear-gradient(135deg,#f59e0b,#d97706)", page:"salary" },
              { label:"View Orders",     icon:Package,      gradient:"linear-gradient(135deg,#3b82f6,#2563eb)", page:"orders" },
            ].map(a => (
              <button key={a.label} onClick={()=>setPage(a.page)} className="quick-action">
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background:a.gradient, flexShrink:0 }}>
                    <a.icon size={16} color="#fff"/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:500 }}>{a.label}</span>
                </div>
                <ChevronRight size={15} color={C.t3}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 300px", gap:14 }}>
        {/* Attendance Bar Chart */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.t1 }}>Attendance Overview</h2>
            <span style={{ fontSize:11, color:C.t2, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:7, padding:"3px 10px" }}>This Week</span>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:12 }}>
            {[{ c:C.green, l:"Present" },{ c:C.red, l:"Absent" }].map(x=>(
              <div key={x.l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.t2 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:x.c }}/>{x.l}
              </div>
            ))}
          </div>
          {loading ? <Sk h={100}/> : (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={last7} barSize={10} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="label" tick={{ fill:C.t3, fontSize:10 }} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="present" name="Present" fill={C.green} radius={[4,4,0,0]}/>
                <Bar dataKey="absent"  name="Absent"  fill={C.red}   radius={[4,4,0,0]} fillOpacity={0.7}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Dept Donut */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <h2 style={{ fontSize:14, fontWeight:700, color:C.t1, marginBottom:16 }}>Department Wise</h2>
          {loading ? <Sk h={120}/> : deptData.length===0 ? (
            <p style={{ color:C.t2, fontSize:13 }}>No department data</p>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} dataKey="value" strokeWidth={0}>
                      {deptData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                  <span style={{ fontSize:20, fontWeight:800, color:C.t1 }}>{totalEmp}</span>
                  <span style={{ fontSize:10, color:C.t2 }}>Total</span>
                </div>
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                {deptData.slice(0,5).map((d,i)=>(
                  <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:CHART_COLORS[i%CHART_COLORS.length], flexShrink:0 }}/>
                      <span style={{ fontSize:12, color:C.t2 }}>{d.name}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:C.t1 }}>{d.value}</span>
                      <span style={{ fontSize:10, color:C.t3 }}>({Math.round(d.value/totalEmp*100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Today's Attendance */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <h2 style={{ fontSize:14, fontWeight:700, color:C.t1 }}>Today's Attendance</h2>
            <span style={{ fontSize:12, color:C.t2, fontWeight:600 }}>{present}/{totalEmp}</span>
          </div>
          {loading ? <Sk h={8} w="100%"/> : (
            <div style={{ height:7, borderRadius:99, background:"rgba(255,255,255,0.06)", overflow:"hidden", marginBottom:14 }}>
              <div style={{ height:"100%", width:`${totalEmp?Math.round(present/totalEmp*100):0}%`, background:`linear-gradient(90deg,${C.green},${C.cyan})`, borderRadius:99, transition:"width .6s ease" }}/>
            </div>
          )}
          <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
            {[{ l:"Present", v:present, c:C.green },{ l:"Late", v:lateC, c:C.amber },{ l:"Absent", v:absentC, c:C.red }].map(m=>(
              <div key={m.l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:m.c }}/>
                <span style={{ fontSize:12, color:C.t2 }}>{m.l} <span style={{ fontWeight:700, color:C.t1 }}>{m.v}</span></span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:10, color:C.t3, marginBottom:8, textTransform:"uppercase", letterSpacing:".06em" }}>Hourly distribution</p>
          {loading ? <Sk h={50}/> : (
            <ResponsiveContainer width="100%" height={50}>
              <BarChart data={["9","10","11","12","1","2","3","4","5"].map((h,i)=>({ h, v:Math.max(1,Math.round(present*Math.sin((i+1)*0.4)+present/2)||1) }))} barSize={9}>
                <Bar dataKey="v" radius={[3,3,0,0]}>
                  {["9","10","11","12","1","2","3","4","5"].map((_,i)=>(
                    <Cell key={i} fill={i===5?C.accent:"rgba(99,102,241,0.3)"}/>
                  ))}
                </Bar>
                <XAxis dataKey="h" tick={{ fill:C.t3, fontSize:9 }} axisLine={false} tickLine={false}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
function EmployeesPage({ addToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ name:"", email:"", password:"", role:"employee", department:"", position:"" });
  const [saving, setSaving]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r=await apiFetch("/users"); const d=await r.json(); setEmployees(safeArr(d,"users","data")); }
    catch { addToast("Failed to load","error"); }
    setLoading(false);
  },[]);
  useEffect(()=>{ load(); },[load]);

  const filtered = employees.filter(e=>!search||[e.name,e.email,e.position,e.department].some(f=>f?.toLowerCase().includes(search.toLowerCase())));

  const handleSave = async () => {
    if (!form.name||!form.email||!form.password) return addToast("Name, email and password required","error");
    setSaving(true);
    try {
      const r=await apiFetch("/auth/admin/create-employee",{ method:"POST", body:JSON.stringify(form) });
      if (!r.ok) { const d=await r.json(); throw new Error(d.message); }
      addToast("Employee created","success"); setModal(false);
      setForm({ name:"", email:"", password:"", role:"employee", department:"", position:"" }); load();
    } catch(e) { addToast(e.message||"Failed","error"); }
    setSaving(false);
  };

  const handleDelete = async id => {
    if (!confirm("Remove this employee?")) return;
    try { await apiFetch(`/users/${id}`,{method:"DELETE"}); addToast("Removed","success"); load(); }
    catch { addToast("Failed to delete","error"); }
  };

  return (
    <PageShell title="Employees" sub={`${employees.length} total members`}
      actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:220 }}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Employee</button></>}
    >
      <Table loading={loading} columns={[
        { key:"name", label:"Name", render:(v,row)=>(
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:9, background:C.accentG, border:`1px solid ${C.accent}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.accent }}>{v?.[0]?.toUpperCase()}</div>
            <div><p style={{ fontWeight:600, fontSize:13, color:C.t1 }}>{v}</p><p style={{ fontSize:11, color:C.t2 }}>{row.email}</p></div>
          </div>
        )},
        { key:"position",   label:"Position",   render:v=><span style={{ color:C.t2 }}>{v||"—"}</span> },
        { key:"department", label:"Department",  render:v=><span style={{ color:C.t2 }}>{v||"—"}</span> },
        { key:"role",       label:"Role",        render:v=>roleBadge(v) },
        { key:"isActive",   label:"Status",      render:v=>statusBadge(v!==false?"active":"inactive") },
        { key:"_id", label:"", render:v=><button className="btn-danger" onClick={()=>handleDelete(v)}>Remove</button> },
      ]} rows={filtered} emptyText="No employees found"/>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Employee">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[{ key:"name",label:"Full Name",ph:"Jane Smith" },{ key:"email",label:"Email",ph:"jane@company.com",type:"email" },{ key:"password",label:"Password",ph:"••••••••",type:"password" },{ key:"position",label:"Position",ph:"Engineer" },{ key:"department",label:"Department",ph:"Engineering" }].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <FormField label="Role">
            <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} className="inp">
              <option value="employee">Employee</option><option value="admin">Admin</option>
            </select>
          </FormField>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Add Employee"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function AttendancePage({ addToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try { const r=await apiFetch("/attendance"); const d=await r.json(); setRecords(safeArr(d,"attendance","records","data")); }
      catch { addToast("Failed","error"); }
      setLoading(false);
    })();
  },[]);
  const filtered = records.filter(r=>!search||r.userId?.name?.toLowerCase().includes(search.toLowerCase())||r.employeeName?.toLowerCase().includes(search.toLowerCase()));
  return (
    <PageShell title="Attendance" sub="Daily attendance tracking" actions={<Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:220 }}/>}>
      <Table loading={loading} columns={[
        { key:"userId",      label:"Employee",  render:(v,row)=><span style={{ fontWeight:500 }}>{v?.name||row.employeeName||"—"}</span> },
        { key:"date",        label:"Date",      render:v=>v?new Date(v).toLocaleDateString("en-IN"):"—" },
        { key:"checkIn",     label:"Check In",  render:v=><span style={{ color:C.green }}>{v||"—"}</span> },
        { key:"checkOut",    label:"Check Out", render:v=><span style={{ color:C.red }}>{v||"—"}</span> },
        { key:"status",      label:"Status",    render:v=>statusBadge(v||"unknown") },
        { key:"hoursWorked", label:"Hours",     render:v=>v?<span style={{ fontWeight:600, color:C.accent }}>{v}h</span>:"—" },
      ]} rows={filtered} emptyText="No attendance records"/>
    </PageShell>
  );
}

// ─── WORKLOGS ─────────────────────────────────────────────────────────────────
function WorklogsPage({ addToast }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ description:"", hoursWorked:"", date:"", projectName:"" });
  const load = async () => {
    setLoading(true);
    try { const r=await apiFetch("/worklogs"); const d=await r.json(); setLogs(safeArr(d,"worklogs","data")); }
    catch { addToast("Failed","error"); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);
  const filtered = logs.filter(l=>!search||[l.userId?.name,l.description,l.projectName].some(f=>f?.toLowerCase().includes(search.toLowerCase())));
  const handleSave = async () => {
    try {
      const fd=new FormData(); Object.entries(form).forEach(([k,v])=>{ if(v) fd.append(k,v); });
      await fetch(`${API}/worklogs`,{ method:"POST", headers:{ Authorization:`Bearer ${getToken()}` }, body:fd });
      addToast("Saved","success"); setModal(false); setForm({ description:"", hoursWorked:"", date:"", projectName:"" }); load();
    } catch { addToast("Failed","error"); }
  };
  return (
    <PageShell title="Work Logs" sub="Employee task records" actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:220 }}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Log</button></>}>
      <Table loading={loading} columns={[
        { key:"userId",      label:"Employee",    render:(v,row)=><span style={{ fontWeight:500 }}>{v?.name||row.employeeName||"—"}</span> },
        { key:"projectName", label:"Project",     render:v=><span style={{ color:C.accent }}>{v||"—"}</span> },
        { key:"description", label:"Description", render:v=><span style={{ color:C.t2, fontSize:12 }}>{v||"—"}</span> },
        { key:"hoursWorked", label:"Hours",       render:v=>v?<span style={{ fontWeight:600, color:C.green }}>{v}h</span>:"—" },
        { key:"date",        label:"Date",        render:v=>v?new Date(v).toLocaleDateString("en-IN"):"—" },
      ]} rows={filtered} emptyText="No work logs"/>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Work Log">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[{ key:"projectName",label:"Project Name",ph:"Project Alpha" },{ key:"description",label:"Description",ph:"Completed…" },{ key:"hoursWorked",label:"Hours",ph:"8",type:"number" },{ key:"date",label:"Date",type:"date" }].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave}>Save Log</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── SALARY ───────────────────────────────────────────────────────────────────
function SalaryPage({ addToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [users, setUsers]     = useState([]);
  const [form, setForm]       = useState({ userId:"", month:"", year:"", basicSalary:"", allowances:"", deductions:"" });
  const [saving, setSaving]   = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const [sR,uR]=await Promise.allSettled([apiFetch("/salaries").then(r=>r.json()),apiFetch("/users").then(r=>r.json())]);
      setRecords(safeArr(sR.value,"salaries","data")); setUsers(safeArr(uR.value,"users","data"));
    } catch { addToast("Failed","error"); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);
  const filtered = records.filter(r=>!search||r.userId?.name?.toLowerCase().includes(search.toLowerCase())||r.employeeName?.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.reduce((s,r)=>s+(r.netSalary||r.totalSalary||r.amount||0),0);
  const handleSave = async () => {
    setSaving(true);
    try {
      const r=await apiFetch("/salaries",{ method:"POST", body:JSON.stringify(form) });
      if (!r.ok) throw new Error(); addToast("Created","success"); setModal(false); load();
    } catch { addToast("Failed","error"); }
    setSaving(false);
  };
  return (
    <PageShell title="Payroll" sub={`Total: ₹${total.toLocaleString("en-IN")}`} actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:220 }}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Record</button></>}>
      <Table loading={loading} columns={[
        { key:"userId",      label:"Employee",   render:(v,row)=><span style={{ fontWeight:500 }}>{v?.name||row.employeeName||"—"}</span> },
        { key:"month",       label:"Month" },
        { key:"year",        label:"Year" },
        { key:"basicSalary", label:"Basic",      render:v=>v?`₹${Number(v).toLocaleString("en-IN")}`:"—" },
        { key:"allowances",  label:"Allowances", render:v=>v?<span style={{ color:C.green }}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—" },
        { key:"deductions",  label:"Deductions", render:v=>v?<span style={{ color:C.red }}>-₹{Number(v).toLocaleString("en-IN")}</span>:"—" },
        { key:"netSalary",   label:"Net Pay",    render:v=><span style={{ fontWeight:700, color:C.t1 }}>{v?`₹${Number(v).toLocaleString("en-IN")}`:"—"}</span> },
        { key:"status",      label:"Status",     render:v=>statusBadge(v||"pending") },
      ]} rows={filtered} emptyText="No payroll records"/>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Salary Record">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <FormField label="Employee">
            <select value={form.userId} onChange={e=>setForm(p=>({...p,userId:e.target.value}))} className="inp">
              <option value="">Select employee…</option>
              {users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </FormField>
          {[{ key:"month",label:"Month",ph:"January" },{ key:"year",label:"Year",ph:"2025",type:"number" },{ key:"basicSalary",label:"Basic (₹)",ph:"50000",type:"number" },{ key:"allowances",label:"Allowances (₹)",ph:"5000",type:"number" },{ key:"deductions",label:"Deductions (₹)",ph:"2000",type:"number" }].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Record"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── BUYERS ───────────────────────────────────────────────────────────────────
function BuyersPage({ addToast }) {
  const [buyers, setBuyers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ name:"", email:"", phone:"", company:"", address:"" });
  const load = async () => {
    setLoading(true);
    try { const r=await apiFetch("/buyers"); const d=await r.json(); setBuyers(safeArr(d,"buyers","data")); }
    catch { addToast("Failed","error"); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);
  const filtered = buyers.filter(b=>!search||[b.name,b.email,b.company].some(f=>f?.toLowerCase().includes(search.toLowerCase())));
  const handleSave = async () => {
    if (!form.name) return addToast("Name required","error");
    try {
      const r=await apiFetch("/buyers",{ method:"POST", body:JSON.stringify(form) });
      if (!r.ok) throw new Error(); addToast("Added","success"); setModal(false); setForm({ name:"", email:"", phone:"", company:"", address:"" }); load();
    } catch { addToast("Failed","error"); }
  };
  const handleDelete = async id => {
    if (!confirm("Remove?")) return;
    try { await apiFetch(`/buyers/${id}`,{method:"DELETE"}); addToast("Removed","success"); load(); }
    catch { addToast("Failed","error"); }
  };
  return (
    <PageShell title="Buyers" sub={`${buyers.length} registered buyers`} actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:220 }}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Buyer</button></>}>
      <Table loading={loading} columns={[
        { key:"name",    label:"Name",    render:(v,row)=><div><p style={{ fontWeight:600, color:C.t1 }}>{v}</p><p style={{ fontSize:11, color:C.t2 }}>{row.company}</p></div> },
        { key:"email",   label:"Email",   render:v=><span style={{ color:C.t2 }}>{v||"—"}</span> },
        { key:"phone",   label:"Phone",   render:v=><span style={{ color:C.t2 }}>{v||"—"}</span> },
        { key:"address", label:"Address", render:v=><span style={{ color:C.t3, fontSize:12 }}>{v||"—"}</span> },
        { key:"_id", label:"", render:v=><button className="btn-danger" onClick={()=>handleDelete(v)}>Remove</button> },
      ]} rows={filtered} emptyText="No buyers yet"/>
      <Modal open={modal} onClose={()=>setModal(false)} title="Add Buyer">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[{ key:"name",label:"Full Name",ph:"Rajan Mehta" },{ key:"email",label:"Email",ph:"rajan@corp.com",type:"email" },{ key:"phone",label:"Phone",ph:"+91 98765 43210" },{ key:"company",label:"Company",ph:"Mehta Industries" },{ key:"address",label:"Address",ph:"Mumbai" }].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave}>Add Buyer</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersPage({ addToast }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal]     = useState(false);
  const [buyers, setBuyers]   = useState([]);
  const [form, setForm]       = useState({ buyerId:"", productName:"", quantity:"", unitPrice:"", notes:"" });
  const load = async () => {
    setLoading(true);
    try {
      const [oR,bR]=await Promise.allSettled([apiFetch("/orders").then(r=>r.json()),apiFetch("/buyers").then(r=>r.json())]);
      setOrders(safeArr(oR.value,"orders","data")); setBuyers(safeArr(bR.value,"buyers","data"));
    } catch { addToast("Failed","error"); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);
  const filtered = orders.filter(o=>{ const ms=!search||[o.buyerId?.name,o.orderNumber,o.productName].some(f=>f?.toLowerCase().includes(search.toLowerCase())); const mst=statusFilter==="all"||o.status?.toLowerCase()===statusFilter; return ms&&mst; });
  const handleSave = async () => {
    try {
      const r=await apiFetch("/orders",{ method:"POST", body:JSON.stringify(form) });
      if (!r.ok) throw new Error(); addToast("Created","success"); setModal(false); setForm({ buyerId:"", productName:"", quantity:"", unitPrice:"", notes:"" }); load();
    } catch { addToast("Failed","error"); }
  };
  return (
    <PageShell title="Orders" sub={`${orders.length} total orders`}
      actions={<>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="inp" style={{ width:"auto", paddingRight:12 }}>
          {["all","pending","processing","completed","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:200 }}/>
        <button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Order</button>
      </>}
    >
      <Table loading={loading} columns={[
        { key:"orderNumber", label:"Order ID",  render:v=><span style={{ fontFamily:"monospace", fontSize:12, color:C.t2 }}>#{v||"—"}</span> },
        { key:"buyerId",     label:"Buyer",     render:(v,row)=><span style={{ fontWeight:500 }}>{v?.name||row.buyerName||"—"}</span> },
        { key:"productName", label:"Product" },
        { key:"quantity",    label:"Qty",       render:v=><span style={{ fontWeight:600 }}>{v||"—"}</span> },
        { key:"totalAmount", label:"Amount",    render:v=><span style={{ fontWeight:700, color:C.t1 }}>{v?`₹${Number(v).toLocaleString("en-IN")}`:"—"}</span> },
        { key:"createdAt",   label:"Date",      render:v=>v?new Date(v).toLocaleDateString("en-IN"):"—" },
        { key:"status",      label:"Status",    render:v=>statusBadge(v||"pending") },
      ]} rows={filtered} emptyText="No orders found"/>
      <Modal open={modal} onClose={()=>setModal(false)} title="New Order">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <FormField label="Buyer">
            <select value={form.buyerId} onChange={e=>setForm(p=>({...p,buyerId:e.target.value}))} className="inp">
              <option value="">Select buyer…</option>
              {buyers.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </FormField>
          {[{ key:"productName",label:"Product Name",ph:"Product X" },{ key:"quantity",label:"Quantity",ph:"10",type:"number" },{ key:"unitPrice",label:"Unit Price (₹)",ph:"500",type:"number" },{ key:"notes",label:"Notes",ph:"Info…" }].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:6 }}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave}>Create Order</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsPage({ addToast }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try {
        const [uR,oR,sR]=await Promise.allSettled([apiFetch("/users").then(r=>r.json()),apiFetch("/orders").then(r=>r.json()),apiFetch("/salaries").then(r=>r.json())]);
        const users=safeArr(uR.value,"users","data"), orders=safeArr(oR.value,"orders","data"), salaries=safeArr(sR.value,"salaries","data");
        const deptBreakdown=users.reduce((acc,u)=>{ const d=u.department||"Other"; acc[d]=(acc[d]||0)+1; return acc; },{});
        setData({ totalUsers:users.length, activeUsers:users.filter(u=>u.isActive!==false).length, totalOrders:orders.length, completedOrders:orders.filter(o=>o.status==="completed").length, totalRevenue:orders.reduce((s,o)=>s+(o.totalAmount||0),0), totalPayroll:salaries.reduce((s,x)=>s+(x.netSalary||x.totalSalary||0),0), deptBreakdown, deptData:Object.entries(deptBreakdown).map(([name,value])=>({ name,value })) });
      } catch { addToast("Failed","error"); }
      setLoading(false);
    })();
  },[]);
  const fmt=n=>`₹${(n||0).toLocaleString("en-IN")}`;
  const pct=(a,b)=>b?`${((a/b)*100).toFixed(1)}%`:"0%";
  return (
    <PageShell title="Analytics" sub="Performance insights">
      {loading ? <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>{Array(6).fill(0).map((_,i)=><Sk key={i} h={120} r={16}/>)}</div> : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {[
              { l:"Total Employees",  v:data.totalUsers,                          g:`linear-gradient(135deg,${C.accent},${C.accentD})`, icon:Users },
              { l:"Active Rate",      v:pct(data.activeUsers,data.totalUsers),    g:"linear-gradient(135deg,#22c55e,#16a34a)", icon:Activity },
              { l:"Total Revenue",    v:fmt(data.totalRevenue),                   g:"linear-gradient(135deg,#a855f7,#7c3aed)", icon:TrendingUp },
              { l:"Order Completion", v:pct(data.completedOrders,data.totalOrders), g:"linear-gradient(135deg,#06b6d4,#0284c7)", icon:CheckCircle2 },
              { l:"Total Payroll",    v:fmt(data.totalPayroll),                   g:"linear-gradient(135deg,#f59e0b,#d97706)", icon:Wallet },
              { l:"Total Orders",     v:data.totalOrders,                         g:"linear-gradient(135deg,#3b82f6,#2563eb)", icon:Package },
            ].map(s=><StatCard key={s.l} label={s.l} value={s.v} gradient={s.g} icon={s.icon}/>)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ fontSize:14, fontWeight:700, color:C.t1, marginBottom:16 }}>Department Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.deptData} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                  <XAxis type="number" tick={{ fill:C.t3, fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{ fill:C.t2, fontSize:11 }} axisLine={false} tickLine={false} width={80}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" name="Employees" radius={[0,4,4,0]}>
                    {data.deptData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <h2 style={{ fontSize:14, fontWeight:700, color:C.t1, marginBottom:16 }}>Distribution</h2>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={data.deptData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                      {data.deptData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                  {data.deptData.map((d,i)=>(
                    <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:9, height:9, borderRadius:2, background:CHART_COLORS[i%CHART_COLORS.length] }}/>
                        <span style={{ fontSize:12, color:C.t2 }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:C.t1 }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}

// ─── COMPANY ──────────────────────────────────────────────────────────────────
function CompanyPage({ addToast }) {
  const [settings, setSettings] = useState({ companyName:"", email:"", phone:"", address:"", website:"", gstNumber:"" });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  useEffect(()=>{ (async()=>{ setLoading(true); try{ const r=await apiFetch("/company"); const d=await r.json(); setSettings(d?.company||d||settings); }catch{} setLoading(false); })(); },[]);
  const handleSave=async()=>{ setSaving(true); try{ await apiFetch("/company",{ method:"PUT", body:JSON.stringify(settings) }); addToast("Saved","success"); }catch{ addToast("Failed","error"); } setSaving(false); };
  return (
    <PageShell title="Company Settings" sub="Manage your organization">
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:28, maxWidth:600 }}>
        {loading ? <div style={{ display:"flex", flexDirection:"column", gap:14 }}>{Array(6).fill(0).map((_,i)=><Sk key={i} h={42}/>)}</div> : (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[{ key:"companyName",label:"Company Name" },{ key:"email",label:"Email" },{ key:"phone",label:"Phone" },{ key:"website",label:"Website" },{ key:"gstNumber",label:"GST Number" }].map(f=>(
                <FormField key={f.key} label={f.label}><Inp value={settings[f.key]||""} onChange={e=>setSettings(p=>({...p,[f.key]:e.target.value}))}/></FormField>
              ))}
              <div style={{ gridColumn:"1/-1" }}><FormField label="Address"><Inp value={settings.address||""} onChange={e=>setSettings(p=>({...p,address:e.target.value}))}/></FormField></div>
            </div>
            <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
              <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Settings"}</button>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

// ─── AUDIT ────────────────────────────────────────────────────────────────────
function AuditPage({ addToast }) {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  useEffect(()=>{ (async()=>{ setLoading(true); try{ const r=await apiFetch("/audit"); const d=await r.json(); setLogs(safeArr(d,"logs","auditLogs","data")); }catch{} setLoading(false); })(); },[]);
  const filtered=logs.filter(l=>!search||[l.action,l.userId?.name,l.module].some(f=>f?.toLowerCase().includes(search.toLowerCase())));
  return (
    <PageShell title="Audit Log" sub="System activity" actions={<Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width:220 }}/>}>
      <Table loading={loading} columns={[
        { key:"createdAt",label:"Time",   render:v=>v?<span style={{ fontSize:12, color:C.t2 }}>{new Date(v).toLocaleString("en-IN")}</span>:"—" },
        { key:"userId",   label:"User",   render:v=><span style={{ fontWeight:500 }}>{v?.name||"—"}</span> },
        { key:"module",   label:"Module", render:v=><span style={{ color:C.accent }}>{v||"—"}</span> },
        { key:"action",   label:"Action", render:v=><Badge label={v||"—"} color={C.accent}/> },
        { key:"details",  label:"Details",render:v=><span style={{ color:C.t3, fontSize:12 }}>{typeof v==="object"?JSON.stringify(v):v||"—"}</span> },
      ]} rows={filtered} emptyText="No audit records"/>
    </PageShell>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePage({ addToast, user }) {
  const [form, setForm]     = useState({ name:user?.name||"", email:user?.email||"", phone:"", currentPassword:"", newPassword:"" });
  const [saving, setSaving] = useState(false);
  const handleSave=async()=>{ setSaving(true); try{ await apiFetch(`/users/${user?._id||user?.id}`,{ method:"PUT", body:JSON.stringify(form) }); addToast("Updated","success"); }catch{ addToast("Failed","error"); } setSaving(false); };
  return (
    <PageShell title="Profile" sub="Manage your account">
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20, maxWidth:800 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24, display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
          <div style={{ width:80, height:80, borderRadius:20, background:C.accentG, border:`2px solid ${C.accent}33`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, fontWeight:800, color:C.accent }}>{(form.name?.[0]||"U").toUpperCase()}</div>
          <div style={{ textAlign:"center" }}><p style={{ fontWeight:700, fontSize:15, color:C.t1 }}>{form.name||"User"}</p><p style={{ fontSize:12, color:C.t2, marginTop:4 }}>{form.email}</p></div>
          {roleBadge(user?.role)}
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[{ key:"name",label:"Full Name" },{ key:"email",label:"Email",type:"email" },{ key:"phone",label:"Phone" }].map(f=>(
              <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} type={f.type}/></FormField>
            ))}
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20 }}>
              <p style={{ fontSize:11, fontWeight:700, color:C.t3, letterSpacing:".08em", textTransform:"uppercase", marginBottom:16 }}>Change Password</p>
              {[{ key:"currentPassword",label:"Current Password" },{ key:"newPassword",label:"New Password" }].map(f=>(
                <div key={f.key} style={{ marginBottom:16 }}><FormField label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} type="password"/></FormField></div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── TOOLS ────────────────────────────────────────────────────────────────────
function ToolsPage({ addToast }) {
  const tools=[
    { icon:RefreshCw, label:"Sync All Data",       desc:"Force-refresh all cached records", gradient:`linear-gradient(135deg,${C.accent},${C.accentD})`, action:()=>addToast("Sync initiated","info") },
    { icon:FileText,  label:"Export Reports",       desc:"Download payroll and attendance as CSV", gradient:"linear-gradient(135deg,#22c55e,#16a34a)", action:()=>addToast("Export started","info") },
    { icon:Shield,    label:"Clear Audit Log",      desc:"Archive and clear old audit entries", gradient:"linear-gradient(135deg,#f59e0b,#d97706)", action:()=>addToast("Cleared","success") },
    { icon:Activity,  label:"Health Check",         desc:"Verify API and database status", gradient:"linear-gradient(135deg,#06b6d4,#0284c7)", action:async()=>{ try{ await apiFetch("/time"); addToast("All systems operational","success"); }catch{ addToast("API unreachable","error"); } } },
    { icon:Hash,      label:"Recalculate Payroll",  desc:"Recompute all pending salaries", gradient:"linear-gradient(135deg,#a855f7,#7c3aed)", action:()=>addToast("Queued","info") },
    { icon:Users,     label:"Bulk Employee Import", desc:"Import employees from CSV", gradient:"linear-gradient(135deg,#3b82f6,#2563eb)", action:()=>addToast("Coming soon","info") },
  ];
  return (
    <PageShell title="Tools" sub="Administrative utilities">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
        {tools.map(t=>(
          <div key={t.label} className="tool-card" onClick={t.action}>
            <div style={{ width:44, height:44, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", background:t.gradient, flexShrink:0 }}><t.icon size={20} color="#fff"/></div>
            <div><p style={{ fontWeight:700, fontSize:14, color:C.t1, marginBottom:5 }}>{t.label}</p><p style={{ fontSize:12, color:C.t2, lineHeight:1.5 }}>{t.desc}</p></div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm]       = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const handleLogin = async () => {
    if (!form.email||!form.password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    try {
      const r=await fetch(`${API}/auth/login`,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(form) });
      const d=await r.json();
      if (!r.ok) throw new Error(d.message||"Invalid credentials");
      localStorage.setItem("ems_token",d.token||d.accessToken||"");
      localStorage.setItem("ems_user",JSON.stringify(d.user||{ name:"Admin", email:form.email }));
      onLogin(d.user||{ name:"Admin", email:form.email });
    } catch(e) { setError(e.message||"Login failed"); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:`radial-gradient(ellipse at 30% 20%,rgba(99,102,241,0.12) 0%,transparent 55%),radial-gradient(ellipse at 75% 80%,rgba(168,85,247,0.08) 0%,transparent 55%),${C.bg}` }}>
      <div className="fadeUp" style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:16, boxShadow:`0 8px 32px rgba(99,102,241,0.4)` }}><Building2 size={26} color="#fff"/></div>
          <h1 style={{ fontSize:24, fontWeight:800, color:C.t1, letterSpacing:"-.02em", marginBottom:8 }}>Nexus Login Portal</h1>
          <p style={{ fontSize:13, color:C.t2 }}>Sign in to your workspace</p>
        </div>
        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:18, padding:28, boxShadow:"0 24px 64px rgba(0,0,0,0.6)" }}>
          {error && <div style={{ background:C.redG, border:`1px solid ${C.red}33`, borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:13, color:C.red, display:"flex", alignItems:"center", gap:8 }}><AlertCircle size={14}/>{error}</div>}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <FormField label="Email address"><Inp value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="admin@company.com" type="email"/></FormField>
            <FormField label="Password"><Inp value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" type="password"/></FormField>
            <button onClick={handleLogin} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:11, marginTop:4, background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1, boxShadow:`0 4px 20px rgba(99,102,241,0.4)`, transition:"all .2s" }}
              onMouseEnter={e=>{ if(!loading) { e.currentTarget.style.filter="brightness(1.1)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
              onMouseLeave={e=>{ e.currentTarget.style.filter=""; e.currentTarget.style.transform=""; }}
            >{loading?"Signing in…":"Sign In"}</button>
          </div>
        </div>
        <p style={{ textAlign:"center", fontSize:12, color:C.t3, marginTop:20 }}>© 2026 AtoZ EMS. All rights reserved.</p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, onLogout, user }) {
  return (
    <div style={{ width:220, minWidth:220, height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden", background:"rgba(8,12,22,0.97)", borderRight:`1px solid ${C.border}`, backdropFilter:"blur(20px)" }}>
      <div style={{ padding:"20px 16px 16px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 14px rgba(99,102,241,0.4)` }}><Building2 size={19} color="#fff"/></div>
          <div><p style={{ fontWeight:800, fontSize:15, color:C.t1, letterSpacing:"-.02em" }}>AtoZ EMS</p><p style={{ fontSize:10, color:C.t3 }}>Management System</p></div>
        </div>
      </div>
      <nav style={{ flex:1, overflowY:"auto", padding:"10px 8px" }}>
        {NAV.map(sec=>(
          <div key={sec.section} style={{ marginBottom:18 }}>
            <p style={{ fontSize:10, fontWeight:700, color:C.t3, letterSpacing:".1em", padding:"0 8px", marginBottom:5 }}>{sec.section}</p>
            {sec.items.map(item=>(
              <button key={item.id} onClick={()=>setActive(item.id)} className={`nav-btn${active===item.id?" active":""}`}>
                <item.icon size={16} style={{ flexShrink:0 }}/><span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding:"10px 8px", borderTop:`1px solid ${C.border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 10px", borderRadius:11, background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}` }}>
          <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:C.accentG, border:`1px solid ${C.accent}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:C.accent }}>{(user?.name?.[0]||"A").toUpperCase()}</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <p style={{ fontSize:13, fontWeight:600, color:C.t1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name||"Admin"}</p>
            <p style={{ fontSize:10, color:C.t3 }}>{user?.role==="super_admin"?"Super Admin":user?.role==="admin"?"Admin":"Employee"}</p>
          </div>
          <button onClick={onLogout} title="Sign out" style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:C.t3, background:"transparent", border:"none", cursor:"pointer", transition:"all .2s", flexShrink:0 }}
            onMouseEnter={e=>{ e.currentTarget.style.background=C.redG; e.currentTarget.style.color=C.red; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.t3; }}
          ><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function TopBar({ clock }) {
  return (
    <div style={{ height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", background:"rgba(8,12,22,0.9)", borderBottom:`1px solid ${C.border}`, backdropFilter:"blur(20px)", flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:10, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, flex:1, maxWidth:360, cursor:"pointer" }}>
          <Search size={13} color={C.t3}/>
          <span style={{ fontSize:13, color:C.t3 }}>Search anything…</span>
          <span style={{ marginLeft:"auto", fontSize:11, color:C.t3, background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`, borderRadius:5, padding:"1px 6px" }}>⌘K</span>
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.t2, fontWeight:500 }}>
          <Clock size={12} color={C.t3}/>{clock}
        </div>
        <div style={{ position:"relative" }}>
          <button style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:C.t2, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, cursor:"pointer", transition:"all .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color=C.accent; e.currentTarget.style.borderColor=C.accent+"44"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color=C.t2; e.currentTarget.style.borderColor=C.border; }}
          ><Bell size={15}/></button>
          <span style={{ position:"absolute", top:8, right:8, width:7, height:7, borderRadius:"50%", background:C.accent, border:`2px solid ${C.bg}`, animation:"blink 2s infinite" }}/>
        </div>
        {[Moon, Maximize2].map((Icon,i)=>(
          <button key={i} style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:C.t2, background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, cursor:"pointer", transition:"all .2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.color=C.accent; e.currentTarget.style.borderColor=C.accent+"44"; }}
            onMouseLeave={e=>{ e.currentTarget.style.color=C.t2; e.currentTarget.style.borderColor=C.border; }}
          ><Icon size={15}/></button>
        ))}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  injectCSS();
  const [user, setUser]             = useState(()=>{ try{ return JSON.parse(localStorage.getItem("ems_user")); }catch{ return null; } });
  const [activePage, setActivePage] = useState("dashboard");
  const [toasts, setToasts]         = useState([]);
  const [clock, setClock]           = useState("");

  useEffect(()=>{
    const tick=()=>setClock(new Date().toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit", second:"2-digit" }));
    tick(); const id=setInterval(tick,1000); return()=>clearInterval(id);
  },[]);

  const addToast=useCallback((message,type="info")=>{
    const id=Date.now(); setToasts(p=>[...p,{ id,message,type }]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  },[]);

  const handleLogin  = u => setUser(u);
  const handleLogout = () => { localStorage.removeItem("ems_token"); localStorage.removeItem("ems_user"); setUser(null); };

  if (!user) return <LoginPage onLogin={handleLogin}/>;

  const props = { addToast, user, setPage:setActivePage };
  const PAGES = {
    dashboard:  <DashboardPage  {...props}/>,
    employees:  <EmployeesPage  {...props}/>,
    attendance: <AttendancePage {...props}/>,
    worklogs:   <WorklogsPage   {...props}/>,
    salary:     <SalaryPage     {...props}/>,
    buyers:     <BuyersPage     {...props}/>,
    orders:     <OrdersPage     {...props}/>,
    analytics:  <AnalyticsPage  {...props}/>,
    company:    <CompanyPage    {...props}/>,
    audit:      <AuditPage      {...props}/>,
    profile:    <ProfilePage    {...props}/>,
    tools:      <ToolsPage      {...props}/>,
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      <Sidebar active={activePage} setActive={setActivePage} onLogout={handleLogout} user={user}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0 }}>
        <TopBar clock={clock}/>
        <div style={{ flex:1, overflow:"hidden" }}>
          {PAGES[activePage]||PAGES.dashboard}
        </div>
      </div>
      <Toast toasts={toasts}/>
    </div>
  );
}
