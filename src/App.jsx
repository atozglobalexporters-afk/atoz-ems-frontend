import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet,
  ShoppingBag, Package, BarChart3, Shield, UserCircle,
  Wrench, Bell, Search, LogOut, Clock, X, AlertCircle,
  CheckCircle2, Zap, Building2, Plus, ArrowUpRight,
  ChevronRight, ChevronDown, ChevronLeft, ChevronUp,
  ClipboardList, Settings, UserPlus, Calendar, Moon,
  Maximize2, Activity, TrendingUp, MessageSquare,
  Edit2, Trash2, Upload, RefreshCw, Menu, ListTodo,
  Briefcase, DollarSign, FileText, Star, MapPin,
  CreditCard, PieChart as PieIcon, Layers, Tag,
  Target, CheckSquare, Send, UserCheck, AlignLeft,
  Hash, Globe, Award, Eye, EyeOff, Copy,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import ChatPage from "./ChatPage";
import ToolsPage from "./ToolsPage";

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
const isAdmin = (u) => u?.role === "admin" || u?.role === "super_admin";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:      "#0b0d14",
  panel:   "#0f1117",
  card:    "#13151f",
  cardHov: "#181b28",
  border:  "rgba(255,255,255,0.06)",
  borderH: "rgba(99,102,241,0.4)",
  accent:  "#6366f1",
  accentD: "#4f46e5",
  accentG: "rgba(99,102,241,0.12)",
  green:   "#22c55e", greenG:  "rgba(34,197,94,0.12)",
  amber:   "#f59e0b", amberG:  "rgba(245,158,11,0.12)",
  red:     "#ef4444", redG:    "rgba(239,68,68,0.12)",
  blue:    "#3b82f6", blueG:   "rgba(59,130,246,0.12)",
  purple:  "#a855f7", purpleG: "rgba(168,85,247,0.12)",
  cyan:    "#06b6d4", cyanG:   "rgba(6,182,212,0.12)",
  orange:  "#f97316", orangeG: "rgba(249,115,22,0.12)",
  t1: "#f1f5ff",
  t2: "#8892aa",
  t3: "#3d4d6a",
};
const CC = [C.accent, C.green, C.amber, C.blue, C.purple, C.cyan, C.red, C.orange];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── SIDEBAR NAV CONFIG (matches reference image exactly) ─────────────────────
const ADMIN_NAV = [
  { section: "MANAGEMENT", items: [
    { id:"dashboard",     label:"Dashboard",          icon: LayoutDashboard },
    { id:"employees",     label:"Employees",           icon: Users },
    { id:"departments",   label:"Departments",         icon: Layers },
    { id:"roles",         label:"Roles & Permissions", icon: Shield },
    { id:"organization",  label:"Organization",        icon: Building2 },
  ]},
  { section: "ATTENDANCE", items: [
    { id:"attendance",    label:"Attendance",          icon: CalendarCheck },
    { id:"leaves",        label:"Leave Management",    icon: FileText },
    { id:"holidays",      label:"Holidays",            icon: Calendar },
    { id:"shifts",        label:"Shift Management",    icon: Clock },
  ]},
  { section: "WORK", items: [
    { id:"tasks",         label:"Tasks",               icon: ListTodo },
    { id:"worklogs",      label:"Work Logs",           icon: ClipboardList },
    { id:"projects",      label:"Projects",            icon: Briefcase },
    { id:"timesheet",     label:"Timesheet",           icon: Activity },
  ]},
  { section: "EXPORT", items: [
    { id:"orders",        label:"Orders",              icon: ShoppingBag },
    { id:"buyers",        label:"Buyers",              icon: Package },
  ]},
  { section: "FINANCE", items: [
    { id:"payroll",       label:"Payroll",             icon: CreditCard },
    { id:"salary",        label:"Salary Management",   icon: Wallet },
    { id:"expenses",      label:"Expenses",            icon: DollarSign },
    { id:"reports",       label:"Reports",             icon: PieIcon },
  ]},
  { section: "COMMUNICATION", items: [
    { id:"chat",          label:"Chat",                icon: MessageSquare },
    { id:"announcements", label:"Announcements",       icon: Bell },
  ]},
  { section: "SYSTEM", items: [
    { id:"company",       label:"Settings",            icon: Settings },
    { id:"audit",         label:"Audit Logs",          icon: Shield },
    { id:"tools",         label:"Tools",               icon: Wrench },
    { id:"profile",       label:"Profile",             icon: UserCircle },
  ]},
];

const EMP_NAV = [
  { section: "MAIN", items: [
    { id:"dashboard",     label:"Dashboard",           icon: LayoutDashboard },
    { id:"profile",       label:"My Profile",          icon: UserCircle },
    { id:"attendance",    label:"Attendance",          icon: CalendarCheck },
    { id:"worklogs",      label:"Worklogs",            icon: ClipboardList },
    { id:"tasks",         label:"Tasks",               icon: ListTodo },
    { id:"leaves",        label:"Leave Requests",      icon: FileText },
    { id:"salary",        label:"My Payslip",          icon: Wallet },
    { id:"notifications", label:"Notifications",       icon: Bell },
  ]},
  { section: "COMMUNICATION", items: [
    { id:"chat",          label:"Chat",                icon: MessageSquare },
  ]},
  { section: "TOOLS", items: [
    { id:"tools",         label:"Tools Hub",           icon: Wrench },
  ]},
];

// ─── INJECT CSS ───────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById("nexus-css")) return;
  const s = document.createElement("style");
  s.id = "nexus-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { color-scheme: dark; }
    html, body, #root {
      height: 100%;
      font-family: 'Inter', system-ui, sans-serif;
      background: ${C.bg};
      color: ${C.t1};
      -webkit-font-smoothing: antialiased;
      overflow: hidden;
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
    * { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,0.2) transparent; }
    input, select, textarea, button { font-family: inherit; }
    select option { background: ${C.card}; color: ${C.t1}; }

    /* Animations */
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
    @keyframes slideIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }

    .fadeUp { animation: fadeUp 0.3s ease both; }
    .fadeIn  { animation: fadeIn 0.2s ease both; }
    .skeleton { background: linear-gradient(90deg, ${C.card} 25%, ${C.cardHov} 50%, ${C.card} 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
    .scroll { overflow-y: auto; height: 100%; }

    /* Cards */
    .card {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 16px;
      transition: all 0.2s ease;
    }
    .card:hover {
      border-color: rgba(99,102,241,0.18);
      box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08);
      transform: translateY(-1px);
    }

    /* Sidebar nav buttons */
    .nav-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.18s ease;
      background: transparent;
      color: ${C.t2};
      white-space: nowrap;
      text-align: left;
    }
    .nav-btn:hover {
      background: rgba(99,102,241,0.08);
      color: ${C.t1};
    }
    .nav-btn.active {
      background: linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.12));
      color: #fff;
      font-weight: 600;
      border: 1px solid rgba(99,102,241,0.3);
      box-shadow: 0 2px 12px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .nav-btn.active svg { color: ${C.accent}; }
    .nav-btn:hover:not(.active) { background: rgba(255,255,255,0.05); color: ${C.t1}; transform: translateX(2px); }
    .nav-btn-collapsed {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      transition: all 0.18s ease;
      background: transparent;
      color: ${C.t2};
      position: relative;
    }
    .nav-btn-collapsed:hover { background: rgba(99,102,241,0.08); color: ${C.t1}; }
    .nav-btn-collapsed.active {
      background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15));
      color: ${C.accent};
      border: 1px solid rgba(99,102,241,0.25);
    }
    .nav-btn-collapsed .tooltip {
      display: none;
      position: absolute;
      left: 48px;
      top: 50%;
      transform: translateY(-50%);
      background: ${C.panel};
      border: 1px solid ${C.border};
      color: ${C.t1};
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      padding: 6px 10px;
      border-radius: 8px;
      z-index: 1000;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .nav-btn-collapsed:hover .tooltip { display: block; }

    /* Sidebar transition */
    .sidebar-expanded { width: 240px; min-width: 240px; }
    .sidebar-collapsed { width: 64px; min-width: 64px; }
    .sidebar-transition { transition: width 0.3s ease, min-width 0.3s ease; }

    /* Table rows */
    .tr { border-bottom: 1px solid ${C.border}; transition: all 0.12s; }
    .tr:hover { background: rgba(99,102,241,0.05); }
    .tr:last-child { border-bottom: none; }

    /* Inputs */
    .inp {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: ${C.t1};
      font-size: 13px;
      padding: 9px 12px;
      outline: none;
      transition: all 0.18s;
    }
    .inp:focus {
      border-color: ${C.accent};
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
      background: rgba(99,102,241,0.04);
    }
    .inp:hover:not(:focus) { border-color: rgba(255,255,255,0.14); }
    .inp::placeholder { color: ${C.t3}; }

    /* Buttons */
    .btn-pri {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border-radius: 10px; border: none; cursor: pointer;
      font-size: 13px; font-weight: 600; color: #fff;
      background: linear-gradient(135deg, ${C.accent}, ${C.accentD});
      box-shadow: 0 4px 16px rgba(99,102,241,0.3);
      transition: all 0.18s;
      position: relative; overflow: hidden;
    }
    .btn-pri::after { content:""; position:absolute; inset:0; background:rgba(255,255,255,0); transition:background 0.18s; }
    .btn-pri:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.5); }
    .btn-pri:hover::after { background:rgba(255,255,255,0.06); }
    .btn-pri:active { transform: translateY(0); }
    .btn-pri:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 16px; border-radius: 10px; cursor: pointer;
      font-size: 13px; font-weight: 500; color: ${C.t2};
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      transition: all 0.18s;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.08); color: ${C.t1}; border-color: rgba(255,255,255,0.14); }
    .btn-danger {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px; cursor: pointer;
      font-size: 12px; font-weight: 600; color: ${C.red};
      background: ${C.redG}; border: 1px solid rgba(239,68,68,0.2);
      transition: all 0.18s;
    }
    .btn-danger:hover { background: rgba(239,68,68,0.2); }
    .btn-success {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 12px; border-radius: 8px; cursor: pointer;
      font-size: 12px; font-weight: 600; color: ${C.green};
      background: ${C.greenG}; border: 1px solid rgba(34,197,94,0.2);
      transition: all 0.18s;
    }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border-radius: 8px;
      cursor: pointer; border: none; transition: all 0.18s;
    }
    .tab-btn {
      padding: 7px 16px; border-radius: 8px; border: none;
      cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.18s;
    }
    .tab-btn.active { background: ${C.accent}; color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .tab-btn:not(.active) { background: rgba(255,255,255,0.04); color: ${C.t2}; border: 1px solid rgba(255,255,255,0.08); }
    .tab-btn:not(.active):hover { background: rgba(255,255,255,0.08); color: ${C.t1}; }

    /* Quick actions */
    .quick-action {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; border-radius: 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      color: ${C.t1}; font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.18s; width: 100%;
    }
    .quick-action:hover {
      background: rgba(99,102,241,0.08);
      border-color: rgba(99,102,241,0.25);
      transform: translateX(2px);
    }

    /* Progress bars */
    .progress-bar { height: 6px; border-radius: 99px; background: rgba(255,255,255,0.06); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }

    /* Topbar search */
    .search-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 8px 14px; border-radius: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      cursor: text; transition: all 0.18s;
      flex: 1; max-width: 380px;
    }
    .search-bar:hover { border-color: rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); }

    /* Icon buttons in topbar */
    .icon-btn {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: ${C.t2}; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      cursor: pointer; transition: all 0.18s;
    }
    .icon-btn:hover { color: ${C.accent}; border-color: rgba(99,102,241,0.35); background: rgba(99,102,241,0.08); }

    /* Stat cards sparkline area */
    .stat-icon {
      width: 46px; height: 46px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    /* Event cards in right panel */
    .event-card {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: 10px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      cursor: pointer; transition: all 0.18s;
    }
    .event-card:hover { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.2); }

    /* Activity items */
    .activity-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .activity-item:last-child { border-bottom: none; }

    /* Performer row */
    .performer-row { padding: 8px 0; }

    /* Status dot */
    .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }

    /* System status row */
    .sys-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 12px;
    }
    .sys-row:last-child { border-bottom: none; }
  `;
  document.head.appendChild(s);
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Sk({ h = 14, w = "80%", r = 7 }) {
  return <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />;
}

function Badge({ label, color = C.accent }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      color, background: color + "18",
      border: `1px solid ${color}28`,
      letterSpacing: ".03em", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function statusBadge(s) {
  const sl = s?.toLowerCase();
  if (["active","present","paid","completed","approved","on_time","early"].includes(sl))
    return <Badge label={sl === "on_time" ? "ON TIME" : s?.toUpperCase()} color={C.green} />;
  if (["inactive","absent","failed","cancelled","rejected"].includes(sl))
    return <Badge label={s?.toUpperCase()} color={C.red} />;
  if (["pending","late","processing","on leave","half_day"].includes(sl))
    return <Badge label={sl === "half_day" ? "HALF DAY" : s?.toUpperCase()} color={C.amber} />;
  return <Badge label={s?.toUpperCase() || "—"} color={C.t2} />;
}

function roleBadge(r) {
  if (r === "super_admin") return <Badge label="SUPER ADMIN" color={C.purple} />;
  if (r === "admin")       return <Badge label="ADMIN"       color={C.accent} />;
  return                          <Badge label="EMPLOYEE"    color={C.blue}   />;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      {label && <p style={{ color: C.t2, marginBottom: 6, fontWeight: 600 }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ color: C.t2 }}>{p.name}:</span>
          <span style={{ fontWeight: 700, color: C.t1 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function Modal({ open, onClose, title, children, width = 500 }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} className="fadeUp" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 20, width: "100%", maxWidth: width, boxShadow: "0 32px 80px rgba(0,0,0,0.7)", maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{title}</h3>
          <button onClick={onClose} className="icon-btn" style={{ width: 28, height: 28, background: "transparent", border: "none" }}><X size={14} /></button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 10, zIndex: 9998 }}>
      {toasts.map(t => (
        <div key={t.id} className="fadeUp" style={{ display: "flex", alignItems: "center", gap: 10, background: C.panel, border: `1px solid ${t.type === "success" ? C.green + "44" : t.type === "error" ? C.red + "44" : C.border}`, borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", fontSize: 13, fontWeight: 500, maxWidth: 340, color: C.t1 }}>
          {t.type === "success" && <CheckCircle2 size={15} color={C.green} />}
          {t.type === "error"   && <AlertCircle  size={15} color={C.red}   />}
          {t.type === "info"    && <Zap          size={15} color={C.accent} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.t2, marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text", icon: Icon, style: ext, disabled }) {
  return (
    <div style={{ position: "relative", ...ext }}>
      {Icon && <Icon size={14} color={C.t3} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />}
      <input className="inp" type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ paddingLeft: Icon ? 34 : 12, opacity: disabled ? 0.6 : 1 }} />
    </div>
  );
}

function PageShell({ title, sub, actions, children }) {
  return (
    <div className="scroll" style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.t1, letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: 10 }}>{title}</h1>
          {sub && <p style={{ fontSize: 13, color: C.t2, marginTop: 5 }}>{sub}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>{actions}</div>}
      </div>
      <div className="fadeUp">{children}</div>
    </div>
  );
}

function Table({ columns, rows, loading, emptyText = "No data" }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {columns.map(c => <th key={c.key} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="tr">
                {columns.map(c => <td key={c.key} style={{ padding: "13px 16px" }}><Sk h={13} w={c.w || "80%"} /></td>)}
              </tr>
            )) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: "48px 16px", textAlign: "center", fontSize: 13, color: C.t2 }}>{emptyText}</td></tr>
            ) : rows.map((row, i) => (
              <tr key={row._id || row.id || i} className="tr">
                {columns.map(c => <td key={c.key} style={{ padding: "13px 16px", fontSize: 13, color: C.t1 }}>{c.render ? c.render(row[c.key], row) : row[c.key] ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── STAT CARD (with sparkline) ───────────────────────────────────────────────
function StatCard({ label, value, sub, deltaUp, gradient, icon: Icon, chart, loading, iconColor = "#fff" }) {
  return (
    <div className="card fadeUp" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: chart ? 12 : 0 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.t2, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>{label}</p>
          {loading ? <Sk h={32} w={90} /> : <p style={{ fontSize: 30, fontWeight: 800, color: C.t1, letterSpacing: "-.02em" }}>{value}</p>}
          {sub && !loading && (
            <p style={{ fontSize: 12, marginTop: 5, fontWeight: 500, color: deltaUp ? C.green : C.t2, display: "flex", alignItems: "center", gap: 3 }}>
              {deltaUp && <ArrowUpRight size={12} />}{sub}
            </p>
          )}
        </div>
        <div className="stat-icon" style={{ background: gradient }}>
          {Icon && <Icon size={20} color={iconColor} />}
        </div>
      </div>
      {chart && !loading && (
        <div style={{ height: 48, marginLeft: -4, marginRight: -4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={C.green} strokeWidth={1.5} fill={`url(#sg-${label})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── SESSION TIMEOUT ──────────────────────────────────────────────────────────
function useSessionTimeout(user, onLogout) {
  useEffect(() => {
    if (!user) return;
    let timer;
    (async () => {
      try {
        const r = await apiFetch("/company");
        const d = await r.json();
        const hours = Number((d?.company || d)?.sessionTimeoutHours) || 8;
        timer = setTimeout(() => { alert("Your session has expired. Please log in again."); onLogout(); }, hours * 60 * 60 * 1000);
      } catch {}
    })();
    return () => clearTimeout(timer);
  }, [user]);
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, onLogout, user, collapsed, setCollapsed }) {
  const nav = isAdmin(user) ? ADMIN_NAV : EMP_NAV;
  const roleLabel = user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : "Employee";

  return (
    <div
      className={`sidebar-transition ${collapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "linear-gradient(180deg, #090b12 0%, #0b0d18 100%)",
        borderRight: `1px solid ${C.border}`,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? "18px 12px" : "18px 16px",
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        justifyContent: collapsed ? "center" : "flex-start",
        minHeight: 68,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${C.accent}, ${C.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, boxShadow: `0 4px 16px rgba(99,102,241,0.45)`,
        }}>
          <Building2 size={18} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontWeight: 800, fontSize: 16, color: C.t1, letterSpacing: "-.01em", lineHeight: 1 }}>NEXUS</p>
            <p style={{ fontSize: 10, color: C.t3, marginTop: 2, fontWeight: 500 }}>EMS PRO</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "10px 8px" : "10px 10px" }}>
        {nav.map(sec => (
          <div key={sec.section} style={{ marginBottom: collapsed ? 16 : 20 }}>
            {!collapsed && (
              <p style={{ fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".1em", padding: "0 8px", marginBottom: 4 }}>
                {sec.section}
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: collapsed ? "center" : "stretch" }}>
              {sec.items.map(item => (
                collapsed ? (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`nav-btn-collapsed${active === item.id ? " active" : ""}`}
                    title={item.label}
                  >
                    <item.icon size={17} />
                    <span className="tooltip">{item.label}</span>
                  </button>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`nav-btn${active === item.id ? " active" : ""}`}
                  >
                    <item.icon size={16} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Collapse */}
      <div style={{ borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
        {/* User strip */}
        {!collapsed && (
          <div style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: C.accentG, border: `1px solid ${C.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.accent }}>
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.t1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Admin"}</p>
                <p style={{ fontSize: 10, color: C.t3 }}>{roleLabel}</p>
              </div>
              <button onClick={onLogout} title="Sign out"
                style={{ width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: C.t3, background: "transparent", border: "none", cursor: "pointer", transition: "all .18s", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = C.redG; e.currentTarget.style.color = C.red; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.t3; }}
              ><LogOut size={14} /></button>
            </div>
          </div>
        )}
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(p => { const next = !p; localStorage.setItem("nx_sidebar", next ? "1" : "0"); return next; })}
          style={{
            width: "100%", padding: "12px", display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8, background: "transparent", border: "none", cursor: "pointer",
            color: C.t3, fontSize: 12, fontWeight: 600,
            borderTop: `1px solid ${C.border}`, transition: "all .18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.t1; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.t3; e.currentTarget.style.background = "transparent"; }}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </div>
  );
}

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
function GlobalSearch({ onNavigate, user }) {
  const [query, setQuery]       = useState("");
  const [open, setOpen]         = useState(false);
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [cursor, setCursor]     = useState(-1);
  const inputRef  = useRef(null);
  const dropRef   = useRef(null);
  const debounce  = useRef(null);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setCursor(-1); inputRef.current?.blur(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch & search across all data
  const runSearch = async (q) => {
    if (!q.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const endpoints = isAdmin(user)
        ? ["/users", "/tasks", "/projects", "/leaves", "/announcements", "/expenses", "/departments", "/shifts"]
        : ["/tasks", "/projects", "/leaves", "/announcements", "/expenses"];

      const fetches = await Promise.allSettled(endpoints.map(ep => apiFetch(ep).then(r => r.json())));

      const ql = q.toLowerCase();
      const hits = [];

      // Users / Employees
      const users = safeArr(fetches[0]?.value, "users", "data");
      users.filter(u => u.name?.toLowerCase().includes(ql) || u.email?.toLowerCase().includes(ql) || u.department?.toLowerCase().includes(ql) || u.position?.toLowerCase().includes(ql))
        .slice(0, 4).forEach(u => hits.push({ category: "Employees", label: u.name, sub: u.position || u.department || u.email, page: "employees", icon: "👤", color: C.accent, id: u._id }));

      // Tasks
      const taskIdx = isAdmin(user) ? 1 : 0;
      const tasks = safeArr(fetches[taskIdx]?.value, "tasks", "data");
      tasks.filter(t => t.title?.toLowerCase().includes(ql) || t.description?.toLowerCase().includes(ql))
        .slice(0, 3).forEach(t => hits.push({ category: "Tasks", label: t.title, sub: `${t.status || "pending"} · ${t.priority || "medium"} priority`, page: "tasks", icon: "✓", color: C.green, id: t._id }));

      // Projects
      const projIdx = isAdmin(user) ? 2 : 1;
      const projects = safeArr(fetches[projIdx]?.value, "projects", "data");
      projects.filter(p => p.name?.toLowerCase().includes(ql) || p.description?.toLowerCase().includes(ql))
        .slice(0, 3).forEach(p => hits.push({ category: "Projects", label: p.name, sub: p.status || "active", page: "projects", icon: "◈", color: C.purple, id: p._id }));

      // Leaves
      const leaveIdx = isAdmin(user) ? 3 : 2;
      const leaves = safeArr(fetches[leaveIdx]?.value, "leaves", "data");
      leaves.filter(l => l.reason?.toLowerCase().includes(ql) || l.type?.toLowerCase().includes(ql) || l.userId?.name?.toLowerCase().includes(ql))
        .slice(0, 2).forEach(l => hits.push({ category: "Leaves", label: l.userId?.name || user?.name || "Leave Request", sub: `${l.type} · ${l.status || "pending"}`, page: "leaves", icon: "📋", color: C.amber, id: l._id }));

      // Announcements
      const annIdx = isAdmin(user) ? 4 : 3;
      const anns = safeArr(fetches[annIdx]?.value, "announcements", "data");
      anns.filter(a => a.title?.toLowerCase().includes(ql) || a.content?.toLowerCase().includes(ql))
        .slice(0, 2).forEach(a => hits.push({ category: "Announcements", label: a.title, sub: a.priority || "normal", page: "announcements", icon: "📣", color: C.blue, id: a._id }));

      // Expenses
      const expIdx = isAdmin(user) ? 5 : 4;
      const expenses = safeArr(fetches[expIdx]?.value, "expenses", "data");
      expenses.filter(e => e.title?.toLowerCase().includes(ql) || e.category?.toLowerCase().includes(ql))
        .slice(0, 2).forEach(e => hits.push({ category: "Expenses", label: e.title, sub: `₹${Number(e.amount||0).toLocaleString("en-IN")} · ${e.status || "pending"}`, page: "expenses", icon: "₹", color: C.cyan, id: e._id }));

      // Departments (admin only)
      if (isAdmin(user)) {
        const depts = safeArr(fetches[6]?.value, "departments", "data");
        depts.filter(d => d.name?.toLowerCase().includes(ql) || d.description?.toLowerCase().includes(ql))
          .slice(0, 2).forEach(d => hits.push({ category: "Departments", label: d.name, sub: d.description || "Department", page: "departments", icon: "🏢", color: C.orange, id: d._id }));
      }

      // Static nav page matches
      const pages = [
        { label: "Dashboard",        page: "dashboard",     icon: "⊞", color: C.accent },
        { label: "Employees",        page: "employees",     icon: "👥", color: C.accent },
        { label: "Attendance",       page: "attendance",    icon: "📅", color: C.green },
        { label: "Leave Management", page: "leaves",        icon: "📋", color: C.amber },
        { label: "Holidays",         page: "holidays",      icon: "🎉", color: C.red },
        { label: "Shift Management", page: "shifts",        icon: "⏰", color: C.blue },
        { label: "Tasks",            page: "tasks",         icon: "✓",  color: C.green },
        { label: "Work Logs",        page: "worklogs",      icon: "📝", color: C.cyan },
        { label: "Projects",         page: "projects",      icon: "◈",  color: C.purple },
        { label: "Timesheet",        page: "timesheet",     icon: "🕐", color: C.blue },
        { label: "Payroll",          page: "payroll",       icon: "💳", color: C.green },
        { label: "Salary",           page: "salary",        icon: "💰", color: C.amber },
        { label: "Expenses",         page: "expenses",      icon: "₹",  color: C.cyan },
        { label: "Reports",          page: "reports",       icon: "📊", color: C.purple },
        { label: "Announcements",    page: "announcements", icon: "📣", color: C.blue },
        { label: "Departments",      page: "departments",   icon: "🏢", color: C.orange },
        { label: "Roles",            page: "roles",         icon: "🛡",  color: C.purple },
        { label: "Organization",     page: "organization",  icon: "🏛",  color: C.accent },
        { label: "Audit Logs",       page: "audit",         icon: "🔍", color: C.red },
        { label: "Settings",         page: "company",       icon: "⚙",  color: C.t2 },
        { label: "Chat",             page: "chat",          icon: "💬", color: C.green },
        { label: "Profile",          page: "profile",       icon: "👤", color: C.accent },
        { label: "Tools",            page: "tools",         icon: "🔧", color: C.amber },
        { label: "Buyers",           page: "buyers",        icon: "🛒", color: C.blue },
        { label: "Orders",           page: "orders",        icon: "📦", color: C.purple },
      ];
      pages.filter(p => p.label.toLowerCase().includes(ql))
        .slice(0, 3).forEach(p => hits.push({ category: "Pages", label: `Go to ${p.label}`, sub: "Page", page: p.page, icon: p.icon, color: p.color }));

      setResults(hits);
    } catch { setResults([]); }
    setLoading(false);
    setCursor(-1);
  };

  const handleChange = e => {
    const q = e.target.value;
    setQuery(q);
    setOpen(true);
    clearTimeout(debounce.current);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    debounce.current = setTimeout(() => runSearch(q), 280);
  };

  const handleKey = e => {
    const flat = results;
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(p => Math.min(p + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(p => Math.max(p - 1, -1)); }
    if (e.key === "Enter" && cursor >= 0 && flat[cursor]) {
      navigate(flat[cursor]);
    }
  };

  const navigate = item => {
    onNavigate(item.page);
    setQuery(""); setResults([]); setOpen(false); setCursor(-1);
    inputRef.current?.blur();
  };

  const clear = () => { setQuery(""); setResults([]); setOpen(false); setCursor(-1); };

  // Group results by category
  const grouped = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  let flatIdx = 0;

  return (
    <div style={{ position: "relative", flex: 1, maxWidth: 480 }} ref={dropRef}>
      <div className="search-bar" style={{ cursor: "text" }} onClick={() => { inputRef.current?.focus(); if (query) setOpen(true); }}>
        <Search size={13} color={C.t3} />
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => { if (query) setOpen(true); }}
          placeholder="Search employees, tasks, projects, pages… (⌘K)"
          style={{ background: "transparent", border: "none", outline: "none", color: C.t1, fontSize: 13, flex: 1, minWidth: 0 }}
        />
        {query
          ? <button onClick={clear} style={{ background: "none", border: "none", cursor: "pointer", color: C.t3, display: "flex", alignItems: "center" }}><X size={13} /></button>
          : <span style={{ marginLeft: "auto", fontSize: 10, color: C.t3, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 6px", flexShrink: 0, whiteSpace: "nowrap" }}>⌘K</span>
        }
      </div>

      {open && query.trim() && (
        <div className="fadeIn" style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: C.panel, border: `1px solid ${C.borderH}`,
          borderRadius: 14, boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          zIndex: 9999, overflow: "hidden", maxHeight: 420, overflowY: "auto",
        }}>
          {loading ? (
            <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.accent}`, borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
              <span style={{ fontSize: 13, color: C.t2 }}>Searching across all data…</span>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: C.t2 }}>No results for <strong style={{ color: C.t1 }}>"{query}"</strong></p>
              <p style={{ fontSize: 12, color: C.t3, marginTop: 6 }}>Try searching for a name, page, or keyword</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".1em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}` }}>
                  {cat}
                </div>
                {items.map(item => {
                  const idx = flatIdx++;
                  const isActive = cursor === idx;
                  return (
                    <div
                      key={item.id || item.label}
                      onMouseEnter={() => setCursor(idx)}
                      onClick={() => navigate(item)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 14px", cursor: "pointer",
                        background: isActive ? `rgba(99,102,241,0.12)` : "transparent",
                        borderLeft: isActive ? `3px solid ${C.accent}` : "3px solid transparent",
                        transition: "all .12s",
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: item.color + "18", border: `1px solid ${item.color}28`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14,
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? C.t1 : C.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: C.t3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.sub}</p>
                      </div>
                      <div style={{ fontSize: 10, color: C.t3, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 5, padding: "2px 7px", flexShrink: 0, fontWeight: 600 }}>
                        {item.page}
                      </div>
                      {isActive && <ChevronRight size={13} color={C.accent} style={{ flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div style={{ padding: "8px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.t3 }}>↑↓ navigate</span>
            <span style={{ fontSize: 11, color: C.t3 }}>↵ select</span>
            <span style={{ fontSize: 11, color: C.t3 }}>Esc close</span>
            <span style={{ fontSize: 11, color: C.t3, marginLeft: "auto" }}>{results.length} result{results.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
function TopBar({ clock, user, onNavigate, onToggleSidebar }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    apiFetch("/notifications").then(r => r.json())
      .then(d => setNotifs(safeArr(d, "notifications", "data").slice(0, 5)))
      .catch(() => {});
  }, []);

  const markAllRead = async () => {
    try { await apiFetch("/notifications/mark-read", { method: "POST" }); setNotifs([]); } catch {}
  };

  return (
    <div style={{
      height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 22px", background: "rgba(8,10,20,0.95)",
      borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(20px)",
      flexShrink: 0, gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <button
          onClick={onToggleSidebar}
          className="icon-btn"
          title="Toggle sidebar"
          style={{ flexShrink: 0 }}
        >
          <Menu size={16} />
        </button>
        <GlobalSearch onNavigate={onNavigate} user={user} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Clock */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.t2, fontWeight: 500, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px" }}>
          <Clock size={11} color={C.t3} />{clock}
        </div>

        {/* Moon */}
        <button className="icon-btn"><Moon size={15} /></button>

        {/* Fullscreen */}
        <button className="icon-btn" onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }}>
          <Maximize2 size={15} />
        </button>

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => setNotifOpen(p => !p)} style={{ position: "relative" }}>
            <Bell size={15} />
            {notifs.length > 0 && <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: C.accent, border: `2px solid ${C.bg}`, animation: "blink 2s infinite" }} />}
          </button>
          {notifOpen && (
            <div className="fadeIn" style={{ position: "absolute", top: 44, right: 0, width: 300, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.6)", zIndex: 1000, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Notifications</span>
                {notifs.length > 0
                  ? <button onClick={markAllRead} style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: "none", border: "none", cursor: "pointer" }}>Mark all read</button>
                  : <span style={{ fontSize: 11, color: C.t3 }}>All caught up</span>
                }
              </div>
              {notifs.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: C.t3, fontSize: 13 }}>No new notifications</div>
              ) : notifs.map((n, i) => (
                <div key={n._id || i} style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10, borderBottom: `1px solid ${C.border}`, cursor: "pointer", transition: "background .18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 12, color: C.t1, fontWeight: 500 }}>{n.message || n.text || "Notification"}</p>
                    <p style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{n.createdAt ? new Date(n.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "Just now"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{user?.name?.split(" ")[0] || "Admin"}</p>
            <p style={{ fontSize: 10, color: C.t3 }}>{user?.role === "super_admin" ? "Super Admin" : user?.role === "admin" ? "Admin" : "Employee"}</p>
          </div>
          <ChevronDown size={12} color={C.t3} />
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ addToast, user, setPage }) {
  const [loading, setLoading]       = useState(true);
  const [users, setUsers]           = useState([]);
  const [salaries, setSalaries]     = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [leaves, setLeaves]         = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [holidays, setHolidays]     = useState([]);
  const [auditLogs, setAuditLogs]   = useState([]);
  // Employee session state
  const [todayRec, setTodayRec]     = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [liveTime, setLiveTime]     = useState(new Date());
  const [elapsed, setElapsed]       = useState(0);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => {
      setLiveTime(new Date());
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      if (isAdmin(user)) {
        const [uR, sR, aR, tR, lR, hR, annR, audR] = await Promise.allSettled([
          apiFetch("/users").then(r => r.json()),
          apiFetch("/salaries").then(r => r.json()),
          apiFetch("/attendance").then(r => r.json()),
          apiFetch("/tasks").then(r => r.json()),
          apiFetch("/leaves").then(r => r.json()),
          apiFetch("/holidays").then(r => r.json()),
          apiFetch("/announcements").then(r => r.json()),
          apiFetch("/audit").then(r => r.json()),
        ]);
        setUsers(safeArr(uR.value, "users", "data"));
        setSalaries(safeArr(sR.value, "salaries", "data"));
        setAttendance(safeArr(aR.value, "attendance", "records", "data"));
        setTasks(safeArr(tR.value, "tasks", "data"));
        setLeaves(safeArr(lR.value, "leaves", "data"));
        setHolidays(safeArr(hR.value, "holidays", "data"));
        setAnnouncements(safeArr(annR.value, "announcements", "data"));
        setAuditLogs(safeArr(audR.value, "logs", "data"));
      } else {
        const [aR, sR, tR, lR, annR] = await Promise.allSettled([
          apiFetch("/attendance/monthly").then(r => r.json()),
          apiFetch("/salaries").then(r => r.json()),
          apiFetch("/tasks").then(r => r.json()),
          apiFetch("/leaves").then(r => r.json()),
          apiFetch("/announcements").then(r => r.json()),
        ]);
        const attRecs = safeArr(aR.value, "attendance", "records", "data");
        setAttendance(attRecs);
        setSalaries(safeArr(sR.value, "salaries", "data"));
        setTasks(safeArr(tR.value, "tasks", "data"));
        setLeaves(safeArr(lR.value, "leaves", "data"));
        setAnnouncements(safeArr(annR.value, "announcements", "data"));
        const today = new Date().toDateString();
        setTodayRec(attRecs.find(r => r.date && new Date(r.date).toDateString() === today) || null);
      }
    } catch { addToast("Failed to load dashboard", "error"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // ── EMPLOYEE SESSION ACTIONS ──────────────────────────────────────────────
  const handleStartSession = async () => {
    setSessionLoading(true);
    try {
      const r = await apiFetch("/attendance/login", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed");
      addToast(d.message || "Session started!", "success");
      await load();
    } catch (e) { addToast(e.message || "Could not start session", "error"); }
    setSessionLoading(false);
  };

  const handleEndSession = async () => {
    setSessionLoading(true);
    try {
      const r = await apiFetch("/attendance/checkout", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Failed");
      addToast("Session ended. " + (d.attendance?.totalHours ? `Total: ${d.attendance.totalHours}h` : ""), "success");
      await load();
    } catch (e) { addToast(e.message || "Could not end session", "error"); }
    setSessionLoading(false);
  };

  // ── EMPLOYEE DASHBOARD ────────────────────────────────────────────────────
  if (!isAdmin(user)) {
    const today         = new Date();
    const thisMonth     = attendance.filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    const myPresent     = thisMonth.filter(a => ["present","on_time","early","late"].includes(a.status?.toLowerCase())).length;
    const myAbsent      = thisMonth.filter(a => a.status?.toLowerCase() === "absent").length;
    const myLate        = thisMonth.filter(a => a.status?.toLowerCase() === "late").length;
    const mySal         = salaries[0];
    const myTasks       = tasks.length;
    const myDone        = tasks.filter(t => t.status === "completed").length;
    const myInProg      = tasks.filter(t => t.status === "in_progress").length;
    const myPending     = tasks.filter(t => t.status === "pending").length;
    const myLeaves      = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === "pending").length;
    const sessionActive = todayRec?.sessionActive || (todayRec?.checkIn && !todayRec?.checkOut);
    const sessionDone   = todayRec?.checkOut;

    // Live elapsed display
    const elapsedSecs = todayRec?.checkIn && !sessionDone
      ? Math.floor((liveTime - new Date(todayRec.checkIn)) / 1000)
      : todayRec?.totalHours ? Math.round(todayRec.totalHours * 3600) : 0;
    const fmtElapsed = s => {
      const h = Math.floor(Math.abs(s) / 3600);
      const m = Math.floor((Math.abs(s) % 3600) / 60);
      const sec = Math.abs(s) % 60;
      return `${String(h).padStart(2,"0")}h : ${String(m).padStart(2,"0")}m : ${String(sec).padStart(2,"0")}s`;
    };

    // Weekly chart
    const myLast7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 6 + i);
      const label = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d.getDay() === 0 ? 6 : d.getDay() - 1];
      const rec = attendance.find(a => a.date && new Date(a.date).toDateString() === d.toDateString());
      const hrs = rec?.totalHours || rec?.hoursWorked || (["present","on_time","early"].includes(rec?.status?.toLowerCase()) ? 8 : 0);
      return { label, value: Number(hrs) || 0 };
    });

    // Today's status color/label
    const sessionStatusColor = sessionDone ? C.blue : sessionActive ? C.green : C.t3;
    const sessionStatusLabel = sessionDone ? "Completed" : sessionActive ? "● Live" : "Not Started";

    // Task priority breakdown
    const highTasks = tasks.filter(t => t.priority === "high" && t.status !== "completed");
    const medTasks  = tasks.filter(t => t.priority === "medium" && t.status !== "completed");

    return (
      <div className="scroll" style={{ padding: "22px 24px" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.t1, letterSpacing: "-.02em" }}>
              Good {liveTime.getHours() < 12 ? "Morning" : liveTime.getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0] || "there"}! 👋
            </h1>
            <p style={{ fontSize: 13, color: C.t2, marginTop: 4 }}>Here's what's happening today.</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.t1, fontVariantNumeric: "tabular-nums" }}>
              {liveTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p style={{ fontSize: 12, color: C.t2 }}>
              {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* ── Top Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {/* Attendance Today */}
          <div className="card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.green + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarCheck size={16} color={C.green} />
              </div>
              <span style={{ fontSize: 12, color: C.t2, fontWeight: 600 }}>Attendance Today</span>
            </div>
            {loading ? <Sk h={28} /> : <>
              <p style={{ fontSize: 22, fontWeight: 800, color: sessionDone ? C.blue : sessionActive ? C.green : C.t3, marginBottom: 4 }}>
                {todayRec ? (sessionDone ? "Completed" : sessionActive ? "Active" : todayRec.status || "Present") : "Not Started"}
              </p>
              <p style={{ fontSize: 11, color: sessionStatusColor, fontWeight: 600 }}>{sessionStatusLabel}</p>
            </>}
          </div>

          {/* Worklogs today */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList size={16} color={C.accent} />
              </div>
              <span style={{ fontSize: 12, color: C.t2, fontWeight: 600 }}>Days Present</span>
            </div>
            {loading ? <Sk h={28} /> : <>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.accent }}>{myPresent}</p>
              <p style={{ fontSize: 11, color: C.t2 }}>This month · {myLate} late · {myAbsent} absent</p>
            </>}
          </div>

          {/* Pending Tasks */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amber + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ListTodo size={16} color={C.amber} />
              </div>
              <span style={{ fontSize: 12, color: C.t2, fontWeight: 600 }}>Pending Tasks</span>
            </div>
            {loading ? <Sk h={28} /> : <>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.amber }}>{myTasks - myDone}</p>
              <p style={{ fontSize: 11, color: C.t2 }}>{myTasks} total · {myDone} done</p>
            </>}
          </div>

          {/* Leave Balance */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.purple + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={16} color={C.purple} />
              </div>
              <span style={{ fontSize: 12, color: C.t2, fontWeight: 600 }}>Leave Requests</span>
            </div>
            {loading ? <Sk h={28} /> : <>
              <p style={{ fontSize: 28, fontWeight: 800, color: C.purple }}>{myLeaves}</p>
              <p style={{ fontSize: 11, color: C.t2 }}>{pendingLeaves} pending approval</p>
            </>}
          </div>
        </div>

        {/* ── Main 2-col layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18 }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* My Work Session Card */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>My Work Session</h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: sessionStatusColor, background: sessionStatusColor + "18", padding: "4px 10px", borderRadius: 20 }}>
                  {sessionStatusLabel}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, color: C.t2, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Start Time</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: todayRec?.checkIn ? C.green : C.t3 }}>
                    {todayRec?.checkIn ? new Date(todayRec.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                  <p style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>
                    {todayRec?.checkIn ? today.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not started"}
                  </p>
                </div>
                <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, color: C.t2, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Elapsed Time</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: sessionActive ? C.accent : C.t3, fontVariantNumeric: "tabular-nums" }}>
                    {sessionActive ? fmtElapsed(elapsedSecs) : todayRec?.totalHours ? `${Number(todayRec.totalHours).toFixed(1)}h total` : "—"}
                  </p>
                  <p style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{sessionActive ? "Running" : sessionDone ? "Session ended" : "Awaiting start"}</p>
                </div>
                <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 11, color: C.t2, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>End Time</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: todayRec?.checkOut ? C.red : C.t3 }}>
                    {todayRec?.checkOut ? new Date(todayRec.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                  <p style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{todayRec?.checkOut ? "Checked out" : "Still running"}</p>
                </div>
              </div>
              {/* Session button */}
              {!sessionDone ? (
                sessionActive ? (
                  <button
                    onClick={handleEndSession}
                    disabled={sessionLoading}
                    style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.red},#dc2626)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: sessionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: sessionLoading ? 0.7 : 1, transition: "opacity .2s" }}
                  >
                    <AlertCircle size={16} />
                    {sessionLoading ? "Ending…" : "End Session"}
                  </button>
                ) : (
                  <button
                    onClick={handleStartSession}
                    disabled={sessionLoading}
                    style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.accent},${C.accentD})`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: sessionLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: sessionLoading ? 0.7 : 1, transition: "opacity .2s" }}
                  >
                    <CheckCircle2 size={16} />
                    {sessionLoading ? "Starting…" : "Start Session"}
                  </button>
                )
              ) : (
                <div style={{ padding: "12px 16px", background: C.blue + "14", border: `1px solid ${C.blue}33`, borderRadius: 12, textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>✓ Session completed for today · {todayRec?.totalHours ? `${Number(todayRec.totalHours).toFixed(1)}h worked` : ""}</p>
                </div>
              )}
            </div>

            {/* Attendance Chart + Tasks side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Attendance this week */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Attendance (This Week)</h2>
                  <button onClick={() => setPage("attendance")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
                </div>
                {loading ? <Sk h={130} /> : (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={myLast7} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<CustomTooltip />} formatter={v => [`${v}h`, "Hours"]} />
                      <Bar dataKey="value" name="Hours" fill={C.accent} radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <div style={{ display: "flex", gap: 14, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                  {[{ l: "Present", v: myPresent, c: C.green }, { l: "Late", v: myLate, c: C.amber }, { l: "Absent", v: myAbsent, c: C.red }].map(x => (
                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: x.c }} />
                      <span style={{ fontSize: 11, color: C.t3 }}>{x.l}: <span style={{ color: x.c, fontWeight: 700 }}>{x.v}</span></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task progress */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Task Progress</h2>
                  <button onClick={() => setPage("tasks")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
                </div>
                {loading ? <Sk h={130} /> : myTasks === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: C.t3, fontSize: 13 }}>No tasks assigned</div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ResponsiveContainer width={90} height={90}>
                          <PieChart>
                            <Pie data={[{ value: myDone }, { value: myTasks - myDone }]} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="value" strokeWidth={0}>
                              <Cell fill={C.green} />
                              <Cell fill="rgba(255,255,255,0.05)" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: C.t1 }}>{myTasks ? Math.round(myDone/myTasks*100) : 0}%</span>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {[{ l: "Completed", v: myDone, c: C.green }, { l: "In Progress", v: myInProg, c: C.blue }, { l: "Pending", v: myPending, c: C.amber }].map(x => (
                          <div key={x.l} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                              <span style={{ fontSize: 11, color: C.t2 }}>{x.l}</span>
                              <span style={{ fontSize: 11, color: x.c, fontWeight: 700 }}>{x.v}</span>
                            </div>
                            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                              <div style={{ height: "100%", width: `${myTasks ? x.v/myTasks*100 : 0}%`, background: x.c, borderRadius: 4, transition: "width .4s" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Today's Tasks</h2>
                <button onClick={() => setPage("tasks")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              {loading ? Array(3).fill(0).map((_,i) => <Sk key={i} h={40} style={{ marginBottom: 8 }} />) : tasks.length === 0 ? (
                <p style={{ color: C.t2, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No tasks assigned</p>
              ) : tasks.filter(t => t.status !== "completed").slice(0, 5).map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.priority === "high" ? C.red : t.priority === "medium" ? C.amber : C.green, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: C.t1, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</p>
                    {t.dueDate && <p style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>Due: {new Date(t.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: t.priority === "high" ? C.red + "22" : t.priority === "medium" ? C.amber + "22" : C.green + "22", color: t.priority === "high" ? C.red : t.priority === "medium" ? C.amber : C.green, textTransform: "capitalize", flexShrink: 0 }}>
                    {t.priority || "Normal"}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Access */}
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Quick Access</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
                {[
                  { label: "Mark Attendance", sub: "Start / End session", icon: CalendarCheck, color: C.green,  page: "attendance" },
                  { label: "Submit Worklog",  sub: "Log your work",        icon: ClipboardList, color: C.accent, page: "worklogs" },
                  { label: "Request Leave",   sub: "Apply for leave",      icon: FileText,      color: C.amber,  page: "leaves" },
                  { label: "View Payslip",    sub: "Salary details",       icon: Wallet,        color: C.blue,   page: "salary" },
                  { label: "Chat",            sub: "Team communication",   icon: MessageSquare, color: C.purple, page: "chat" },
                  { label: "Tools Hub",       sub: "Useful tools",         icon: Wrench,        color: C.cyan,   page: "tools" },
                ].map(a => (
                  <button key={a.label} onClick={() => setPage(a.page)} style={{ background: a.color + "10", border: `1px solid ${a.color}22`, borderRadius: 14, padding: "16px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transition: "all .18s", textAlign: "center" }}
                    onMouseEnter={e => { e.currentTarget.style.background = a.color + "20"; e.currentTarget.style.borderColor = a.color + "55"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = a.color + "10"; e.currentTarget.style.borderColor = a.color + "22"; }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: a.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <a.icon size={20} color={a.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{a.label}</p>
                      <p style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{a.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Latest Salary */}
            {mySal && (
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>My Payslip</h3>
                  <button onClick={() => setPage("salary")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View →</button>
                </div>
                <div style={{ padding: "12px 14px", background: C.accentG, borderRadius: 10, marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: C.t2, marginBottom: 4 }}>Net Salary · {MONTHS[(mySal.month || new Date().getMonth() + 1) - 1]}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: C.accent }}>₹{Number(mySal.netSalary || mySal.totalSalary || 0).toLocaleString("en-IN")}</p>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: C.t2 }}>Status</span>
                  <span style={{ color: mySal.status === "paid" ? C.green : C.amber, fontWeight: 700, textTransform: "capitalize" }}>{mySal.status || "Pending"}</span>
                </div>
              </div>
            )}

            {/* Upcoming Leave */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Leave Requests</h3>
                <button onClick={() => setPage("leaves")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              {loading ? <Sk h={60} /> : leaves.length === 0 ? (
                <p style={{ fontSize: 12, color: C.t3, textAlign: "center", padding: "12px 0" }}>No leave requests</p>
              ) : leaves.slice(0, 3).map((l, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: C.t1, fontWeight: 600, textTransform: "capitalize" }}>{l.type || l.leaveType || "Leave"}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: l.status === "approved" ? C.green + "22" : l.status === "rejected" ? C.red + "22" : C.amber + "22", color: l.status === "approved" ? C.green : l.status === "rejected" ? C.red : C.amber, textTransform: "capitalize" }}>
                      {l.status || "Pending"}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: C.t3, marginTop: 3 }}>
                    {l.from ? new Date(l.from).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""} — {l.to ? new Date(l.to).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""} · {l.days || "?"} days
                  </p>
                </div>
              ))}
              <button onClick={() => setPage("leaves")} style={{ marginTop: 12, width: "100%", padding: "9px", background: C.accentG, border: `1px solid ${C.accent}33`, borderRadius: 9, color: C.accent, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                + Apply Leave
              </button>
            </div>

            {/* Latest Announcements */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Announcements</h3>
                <button onClick={() => setPage("announcements")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              {loading ? <Sk h={80} /> : announcements.length === 0 ? (
                <p style={{ fontSize: 12, color: C.t3, textAlign: "center", padding: "12px 0" }}>No announcements</p>
              ) : announcements.slice(0, 3).map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bell size={13} color={C.accent} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: C.t1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</p>
                    <p style={{ fontSize: 10, color: C.t3, marginTop: 2 }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Motivational banner */}
            <div style={{ padding: "18px 20px", background: `linear-gradient(135deg,${C.accent}22,${C.purple}18)`, border: `1px solid ${C.accent}33`, borderRadius: 16 }}>
              <p style={{ fontSize: 13, color: C.accent, fontWeight: 700, fontStyle: "italic", lineHeight: 1.5 }}>"Stay focused, keep building, and success will follow."</p>
              <p style={{ fontSize: 11, color: C.t3, marginTop: 6 }}>— Your future is created by what you do today.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
  const today    = new Date();
  const todayStr = today.toDateString();
  const todayAtt = attendance.filter(a => a.date && new Date(a.date).toDateString() === todayStr);
  const present  = todayAtt.filter(a => ["present","on_time","early"].includes(a.status?.toLowerCase())).length;
  const onLeave  = todayAtt.filter(a => a.status?.toLowerCase() === "on leave").length;
  const absent   = todayAtt.filter(a => a.status?.toLowerCase() === "absent").length;
  const totalEmp = users.length;
  const newThisMonth = users.filter(u => { const d = new Date(u.createdAt); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(); }).length;

  const deptMap   = users.reduce((acc, u) => { const d = u.department || "Other"; acc[d] = (acc[d] || 0) + 1; return acc; }, {});
  const deptData  = Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  const totalDept = deptData.reduce((s, d) => s + d.value, 0) || 1;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const labels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const label  = labels[d.getDay() === 0 ? 6 : d.getDay() - 1];
    const p   = attendance.filter(a => a.date && new Date(a.date).toDateString() === d.toDateString() && ["present","on_time","early"].includes(a.status?.toLowerCase())).length;
    const pct = totalEmp ? Math.round(p / totalEmp * 100) : 0;
    return { label, value: pct, present: p };
  });

  const recentUsers = [...users].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const sparkEmp    = [3,5,4,7,6,8,totalEmp||1].map(v => ({ v }));
  const sparkAtt    = last7.map(d => ({ v: d.present }));
  const sparkLeave  = [1,2,1,3,2,onLeave||1,onLeave||1].map(v => ({ v }));
  const sparkAbsent = [2,1,3,2,1,2,absent||1].map(v => ({ v }));

  const performers = users.slice(0, 5).map((u, i) => ({
    name: u.name, role: u.position || u.department || "Employee", score: 98 - i * 2,
  }));

  const pendingLeaves = leaves.filter(l => !l.status || l.status === "pending");
  const approvedLeaves = leaves.filter(l => l.status === "approved");
  const leaveTypes = [
    { name: "Casual Leave",   value: leaves.filter(l=>l.type==="casual").length   || 12, pct: 37.5, color: C.accent },
    { name: "Sick Leave",     value: leaves.filter(l=>l.type==="sick").length     || 8,  pct: 25,   color: C.green },
    { name: "Earned Leave",   value: leaves.filter(l=>l.type==="earned").length   || 7,  pct: 21.9, color: C.amber },
    { name: "Personal Leave", value: leaves.filter(l=>l.type==="personal").length || 5,  pct: 15.6, color: C.cyan },
  ];
  const totalLeaves = leaveTypes.reduce((s, l) => s + l.value, 0);

  const events = [
    { title: "Team Meeting",       date: "Today, 10:00 AM",  color: C.accent,  icon: Users },
    { title: "Project Deadline",   date: "22 May 2025",      color: C.red,     icon: Briefcase },
    { title: "Payroll Processing", date: "25 May 2025",      color: C.green,   icon: Wallet },
    { title: "Company Offsite",    date: "30 May 2025",      color: C.amber,   icon: Building2 },
  ];

  const activities = [
    { name: "Priya Singh",  action: "marked attendance",        time: "2 minutes ago",  dot: C.green },
    { name: "Rahul Verma",  action: "submitted work log",        time: "15 minutes ago", dot: C.red },
    { name: "Amit Kumar",   action: "joined as new employee",    time: "1 hour ago",     dot: C.green },
    { name: "Payroll",      action: "for April 2025 generated",  time: "2 hours ago",    dot: C.amber },
    { name: "Neha Patel",   action: "leave request approved",    time: "3 hours ago",    dot: C.green },
  ];

  const sysStatus = [
    { label: "Server Status", status: "Operational", ok: true },
    { label: "Database",      status: "Operational", ok: true },
    { label: "Backup Status", status: "Operational", ok: true },
    { label: "Email Service", status: "Operational", ok: true },
  ];

  return (
    <div className="scroll" style={{ padding: "20px 22px" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.t1, letterSpacing: "-.02em" }}>
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}! 👋
          </h1>
          <p style={{ fontSize: 13, color: C.t2, marginTop: 4 }}>Here's what's happening with your organization today.</p>
        </div>
        <div style={{ fontSize: 13, color: C.t2, fontWeight: 500 }}>
          {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
      </div>

      {/* ── Main 2-col layout: content | right panel ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 276px", gap: 16 }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {[
              { label:"Total Employees", value: totalEmp,  sub:`+${newThisMonth} this month`,                                       deltaUp: true,  gradient:`linear-gradient(135deg,${C.accent},${C.accentD})`, icon:Users,        chart:sparkEmp },
              { label:"Present Today",   value: present,   sub:`${totalEmp?Math.round(present/totalEmp*100):0}% of total`,          deltaUp: true,  gradient:"linear-gradient(135deg,#22c55e,#16a34a)",            icon:CheckCircle2, chart:sparkAtt },
              { label:"On Leave",        value: onLeave,   sub:`${totalEmp?Math.round(onLeave/totalEmp*100):0}% of total`,          deltaUp: false, gradient:"linear-gradient(135deg,#f59e0b,#d97706)",            icon:Calendar,     chart:sparkLeave },
              { label:"Absent",          value: absent,    sub:`${totalEmp?Math.round(absent/totalEmp*100):0}% of total`,           deltaUp: false, gradient:"linear-gradient(135deg,#ef4444,#dc2626)",            icon:AlertCircle,  chart:sparkAbsent },
            ].map(s => (
              <StatCard key={s.label} label={s.label} value={loading?"—":s.value} sub={s.sub} deltaUp={s.deltaUp} gradient={s.gradient} icon={s.icon} chart={s.chart} loading={loading} />
            ))}
          </div>

          {/* Attendance Overview + Department Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Attendance area chart */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Attendance Overview</h2>
                <div style={{ fontSize: 11, color: C.t2, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  This Week <ChevronDown size={11} />
                </div>
              </div>
              {loading ? <Sk h={150} /> : (
                <>
                  <div style={{ textAlign: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{last7.find(d => d.label === ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][today.getDay()===0?6:today.getDay()-1])?.value || 0}%</span>
                  </div>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={last7} margin={{ top: 5, right: 5, bottom: 0, left: -28 }}>
                      <defs>
                        <linearGradient id="attG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.accent} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={C.accent} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`} />
                      <Tooltip content={<CustomTooltip />} formatter={v=>[`${v}%`,"Attendance Rate"]} />
                      <Area type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2.5} fill="url(#attG)" dot={{ fill: C.accent, r: 4, strokeWidth: 2, stroke: C.bg }} activeDot={{ r: 6 }} name="Attendance Rate" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent }} />
                    <span style={{ fontSize: 11, color: C.t3 }}>Attendance Rate</span>
                  </div>
                </>
              )}
            </div>

            {/* Department Overview donut */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Department Overview</h2>
                <div style={{ fontSize: 11, color: C.t2, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  This Month <ChevronDown size={11} />
                </div>
              </div>
              {loading ? <Sk h={150} /> : deptData.length === 0 ? (
                <p style={{ color: C.t2, fontSize: 13, paddingTop: 50, textAlign: "center" }}>No data yet</p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie data={deptData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" strokeWidth={2} stroke={C.card}>
                          {deptData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>{totalEmp}</span>
                      <span style={{ fontSize: 10, color: C.t2 }}>Total</span>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {deptData.slice(0, 6).map((d, i) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 9, height: 9, borderRadius: 2, background: CC[i % CC.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: C.t2 }}>{d.name}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{d.value}</span>
                          <span style={{ fontSize: 10, color: C.t3 }}>({Math.round(d.value/totalDept*100)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activities + Top Performers + Leave Overview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* Recent Activities */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Recent Activities</h2>
                <button onClick={() => setPage("audit")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
              </div>
              {activities.map((a, i) => (
                <div key={i} className="activity-item">
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: a.dot + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: a.dot, flexShrink: 0 }}>
                    {a.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, color: C.t1, lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 700 }}>{a.name}</span> {a.action}
                    </p>
                    <p style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{a.time}</p>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, flexShrink: 0, marginTop: 5 }} />
                </div>
              ))}
            </div>

            {/* Top Performers */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Top Performers</h2>
                <div style={{ fontSize: 11, color: C.t2, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  This Month <ChevronDown size={11} />
                </div>
              </div>
              {loading ? Array(5).fill(0).map((_, i) => <Sk key={i} h={34} style={{ marginBottom: 10 }} />) :
                performers.map((p, i) => (
                  <div key={i} className="performer-row">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: CC[i%CC.length]+"28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: CC[i%CC.length], flexShrink: 0 }}>
                        {p.name?.[0]?.toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: C.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                        <p style={{ fontSize: 10, color: C.t3 }}>{p.role}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{p.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${p.score}%`, background: `linear-gradient(90deg,${CC[i%CC.length]},${CC[(i+1)%CC.length]})` }} />
                    </div>
                  </div>
                ))
              }
              <button onClick={() => setPage("employees")} style={{ marginTop: 10, width: "100%", fontSize: 11, color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View All Performers</button>
            </div>

            {/* Leave Overview */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Leave Overview</h2>
                <div style={{ fontSize: 11, color: C.t2, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  This Month <ChevronDown size={11} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={leaveTypes} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={2} stroke={C.card}>
                        {leaveTypes.map((l, i) => <Cell key={i} fill={l.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.t1 }}>{totalLeaves}</span>
                    <span style={{ fontSize: 8, color: C.t2 }}>Total</span>
                    <span style={{ fontSize: 7, color: C.t3 }}>Leaves</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
                  {leaveTypes.map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: C.t2 }}>{l.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.t1 }}>{l.value}</span>
                        <span style={{ fontSize: 10, color: C.t3 }}>({l.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setPage("leaves")} style={{ width: "100%", fontSize: 11, color: C.accent, background: "none", border: "none", cursor: "pointer", fontWeight: 600, textAlign: "center" }}>View Leave Calendar</button>
            </div>
          </div>

          {/* Recently Joined Employees */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>Recently Joined Employees</h2>
              <button onClick={() => setPage("employees")} style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
            </div>
            {loading ? (
              <div style={{ display: "flex", gap: 12 }}>{Array(5).fill(0).map((_, i) => <Sk key={i} h={90} w={150} />)}</div>
            ) : recentUsers.length === 0 ? (
              <p style={{ fontSize: 13, color: C.t2, textAlign: "center", padding: "20px 0" }}>No employees yet</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10 }}>
                {recentUsers.map((u, i) => (
                  <div key={u._id||i} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center", transition: "all .18s", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = CC[i%CC.length]+"44"; e.currentTarget.style.background = CC[i%CC.length]+"08"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: CC[i%CC.length]+"28", border: `1px solid ${CC[i%CC.length]}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: CC[i%CC.length], margin: "0 auto 10px" }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>{u.position || u.department || "Employee"}</p>
                    <p style={{ fontSize: 10, color: C.t3, marginTop: 4 }}>Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "Recently"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Upcoming Events */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Upcoming Events</h2>
              <button style={{ fontSize: 11, color: C.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>View All</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {events.map((ev, i) => (
                <div key={i} className="event-card">
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: ev.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <ev.icon size={14} color={ev.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{ev.title}</p>
                    <p style={{ fontSize: 11, color: C.t3, marginTop: 1 }}>{ev.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Quick Actions</h2>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: C.accentG, border: `1px solid ${C.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Plus size={13} color={C.accent} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Add New Employee", icon: UserPlus,    color: C.accent,  page: "employees" },
                { label: "Assign Task",      icon: ListTodo,    color: C.orange,  page: "tasks" },
                { label: "Mark Attendance",  icon: CheckCircle2,color: C.green,   page: "attendance" },
                { label: "Generate Payroll", icon: Wallet,      color: C.blue,    page: "salary" },
                { label: "View Reports",     icon: BarChart3,   color: C.purple,  page: "reports" },
              ].map(a => (
                <button key={a.label} onClick={() => setPage(a.page)} className="quick-action" style={{ padding: "9px 11px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: a.color+"22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <a.icon size={13} color={a.color} />
                    </div>
                    <span style={{ fontSize: 12 }}>{a.label}</span>
                  </div>
                  <ChevronRight size={12} color={C.t3} />
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="card" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 4 }}>System Status</h2>
            <p style={{ fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 12 }}>All Systems Operational</p>
            <div>
              {sysStatus.map((s, i) => (
                <div key={i} className="sys-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.ok ? C.green : C.red }} />
                    <span style={{ color: C.t2, fontSize: 12 }}>{s.label}</span>
                  </div>
                  <span style={{ color: s.ok ? C.green : C.red, fontWeight: 600, fontSize: 12 }}>{s.status}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.t2 }}>Storage</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>78% Used</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "78%", background: `linear-gradient(90deg,${C.accent},${C.purple})` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EMPLOYEE DETAIL PAGE ─────────────────────────────────────────────────────
function EmployeeDetailPage({ emp, onBack, addToast, user }) {
  const [tasks, setTasks]       = useState([]);
  const [worklogs, setWorklogs] = useState([]);
  const [attendance, setAtt]    = useState([]);
  const [salary, setSalary]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("overview");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [tR, wR, aR, sR] = await Promise.allSettled([
          apiFetch(`/tasks?userId=${emp._id}`).then(r => r.json()),
          apiFetch(`/worklogs?userId=${emp._id}`).then(r => r.json()),
          apiFetch(`/attendance?userId=${emp._id}`).then(r => r.json()),
          apiFetch(`/salaries?userId=${emp._id}`).then(r => r.json()),
        ]);
        setTasks(safeArr(tR.value, "tasks", "data"));
        setWorklogs(safeArr(wR.value, "worklogs", "data"));
        setAtt(safeArr(aR.value, "attendance", "records", "data"));
        setSalary(safeArr(sR.value, "salaries", "data"));
      } catch {}
      setLoading(false);
    })();
  }, [emp._id]);

  const present = attendance.filter(a => ["present","on_time","early"].includes(a.status?.toLowerCase())).length;
  const absent  = attendance.filter(a => a.status?.toLowerCase() === "absent").length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const inProg    = tasks.filter(t => t.status === "in_progress").length;
  const overdue   = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed").length;
  const totalHours = worklogs.reduce((s, w) => s + Number(w.hoursWorked || 0), 0);
  const latestSal = salary[0];

  const tabs = ["overview", "tasks", "worklogs", "attendance", "salary"];

  return (
    <div className="scroll" style={{ padding: "24px 28px" }}>
      {/* Header with back */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <button onClick={onBack} className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13, gap: 6 }}>
          <ChevronLeft size={15} />Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.t3 }}>
          <span style={{ cursor: "pointer", color: C.accent }} onClick={onBack}>Employees</span>
          <ChevronRight size={12} />
          <span style={{ color: C.t2 }}>{emp.name}</span>
        </div>
        {isAdmin(user) && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="btn-ghost" style={{ fontSize: 13 }}><Edit2 size={14} />Edit Employee</button>
            <button className="btn-pri" style={{ fontSize: 13 }}><ListTodo size={14} />Assign Task</button>
          </div>
        )}
      </div>

      {/* Profile Banner */}
      <div className="card fadeUp" style={{ padding: 24, marginBottom: 18, background: `linear-gradient(135deg, ${C.card} 0%, rgba(99,102,241,0.06) 100%)` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: `0 8px 24px rgba(99,102,241,0.4)` }}>
            {emp.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.t1 }}>{emp.name}</h1>
              {roleBadge(emp.role)}
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: emp.isActive !== false ? C.greenG : C.redG, color: emp.isActive !== false ? C.green : C.red, fontWeight: 700 }}>
                {emp.isActive !== false ? "● Active" : "● Inactive"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: C.t2, marginBottom: 10 }}>{emp.position || "Employee"} — {emp.department || "No Department"}</p>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {emp.email && <span style={{ fontSize: 12, color: C.t3, display: "flex", alignItems: "center", gap: 5 }}><Bell size={12} />{emp.email}</span>}
              {emp.phone && <span style={{ fontSize: 12, color: C.t3, display: "flex", alignItems: "center", gap: 5 }}><Hash size={12} />{emp.phone}</span>}
              {emp.employeeId && <span style={{ fontSize: 12, color: C.t3, display: "flex", alignItems: "center", gap: 5 }}><Award size={12} />ID: {emp.employeeId}</span>}
              {emp.joinDate && <span style={{ fontSize: 12, color: C.t3, display: "flex", alignItems: "center", gap: 5 }}><Calendar size={12} />Joined: {new Date(emp.joinDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
            </div>
          </div>
          {/* KPI chips */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, flexShrink: 0 }}>
            {[{ l: "Tasks", v: tasks.length, c: C.accent }, { l: "Completed", v: completed, c: C.green }, { l: "In Progress", v: inProg, c: C.blue }, { l: "Overdue", v: overdue, c: C.red }].map(k => (
              <div key={k.l} style={{ textAlign: "center", padding: "10px 16px", background: k.c + "14", borderRadius: 10, border: `1px solid ${k.c}28` }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: k.c }}>{loading ? "—" : k.v}</p>
                <p style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: ".06em" }}>{k.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18, background: C.card, padding: 4, borderRadius: 12, border: `1px solid ${C.border}`, width: "fit-content" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 18px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .18s", background: tab === t ? C.accent : "transparent", color: tab === t ? "#fff" : C.t2, textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Attendance summary */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Attendance Summary (This Month)</h3>
            {loading ? <Sk h={100} /> : (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative" }}>
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={[{ value: present }, { value: absent }, { value: Math.max(0, attendance.length - present - absent) }]} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="value" strokeWidth={0}>
                        <Cell fill={C.green} /><Cell fill={C.red} /><Cell fill={C.amber} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.t1 }}>{attendance.length}</span>
                    <span style={{ fontSize: 9, color: C.t3 }}>Days</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[{ l: "Present", v: present, c: C.green }, { l: "Absent", v: absent, c: C.red }, { l: "Half Day", v: attendance.filter(a => a.status?.toLowerCase() === "half_day").length, c: C.amber }].map(x => (
                    <div key={x.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c }} /><span style={{ fontSize: 12, color: C.t2 }}>{x.l}</span></div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{x.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Work Log Summary */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Work Log Summary (This Month)</h3>
            {loading ? <Sk h={100} /> : (
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1, textAlign: "center", padding: 14, background: C.accentG, borderRadius: 10 }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>{totalHours.toFixed(1)}h</p>
                    <p style={{ fontSize: 11, color: C.t2, marginTop: 3 }}>Total Hours</p>
                  </div>
                  <div style={{ flex: 1, textAlign: "center", padding: 14, background: C.greenG, borderRadius: 10 }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: C.green }}>{worklogs.filter(w => w.status === "approved").length}</p>
                    <p style={{ fontSize: 11, color: C.t2, marginTop: 3 }}>Approved</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {worklogs.slice(0, 3).map((w, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                      <span style={{ fontSize: 12, color: C.t2 }}>{w.description?.slice(0, 30) || "—"}</span>
                      <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>{w.hoursWorked}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Salary Info */}
          {latestSal && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Latest Salary — {MONTHS[(latestSal.month||1)-1]} {latestSal.year}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ l: "Basic", v: latestSal.basicSalary, c: C.t1 }, { l: "Allowances", v: latestSal.allowances, c: C.green }, { l: "Deductions", v: latestSal.deductions, c: C.red }, { l: "Net Pay", v: latestSal.netSalary || latestSal.totalSalary, c: C.accent }].map(s => (
                  <div key={s.l} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: 9 }}>
                    <p style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", marginBottom: 4 }}>{s.l}</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: s.c }}>₹{Number(s.v||0).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manager info / join date */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Employee Info</h3>
            {[{ l: "Employee ID", v: emp.employeeId || "NEX-EMP-" + (emp._id?.slice(-4) || "0001") }, { l: "Email", v: emp.email }, { l: "Phone", v: emp.phone || "Not set" }, { l: "Department", v: emp.department || "—" }, { l: "Position", v: emp.position || "—" }, { l: "Join Date", v: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString("en-IN") : emp.createdAt ? new Date(emp.createdAt).toLocaleDateString("en-IN") : "—" }, { l: "Manager", v: emp.manager || "Rohit Sharma" }].map(f => (
              <div key={f.l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.t3 }}>{f.l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {loading ? Array(4).fill(0).map((_, i) => <Sk key={i} h={120} />) : tasks.length === 0 ? <p style={{ color: C.t2, fontSize: 13 }}>No tasks assigned</p> : tasks.map((t, i) => (
            <div key={t._id || i} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {statusBadge(t.status || "pending")}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: (t.priority === "high" ? C.red : t.priority === "medium" ? C.amber : C.green) + "22", color: t.priority === "high" ? C.red : t.priority === "medium" ? C.amber : C.green }}>{t.priority || "medium"}</span>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 6 }}>{t.title}</h3>
              <p style={{ fontSize: 12, color: C.t2 }}>{t.description?.slice(0, 80) || "—"}</p>
              {t.deadline && <p style={{ fontSize: 11, color: C.t3, marginTop: 8 }}>Due: {new Date(t.deadline).toLocaleDateString("en-IN")}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === "worklogs" && (
        <Table loading={loading} columns={[
          { key: "projectName", label: "Project", render: v => <span style={{ color: C.accent, fontSize: 12 }}>{v || "—"}</span> },
          { key: "description", label: "Description", render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v?.slice(0, 50) || "—"}</span> },
          { key: "hoursWorked", label: "Hours", render: v => <span style={{ color: C.green, fontWeight: 600 }}>{v}h</span> },
          { key: "date", label: "Date", render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
          { key: "status", label: "Status", render: v => statusBadge(v || "pending") },
        ]} rows={worklogs} emptyText="No work logs" />
      )}

      {tab === "attendance" && (
        <Table loading={loading} columns={[
          { key: "date", label: "Date", render: v => <span style={{ color: C.t2 }}>{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
          { key: "checkIn", label: "Check In", render: (v, row) => <span style={{ color: C.green }}>{v ? new Date(v).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : row.loginTime ? new Date(row.loginTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</span> },
          { key: "checkOut", label: "Check Out", render: (v, row) => <span style={{ color: C.red }}>{v ? new Date(v).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : row.logoutTime ? new Date(row.logoutTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}</span> },
          { key: "hoursWorked", label: "Total Hours", render: v => v ? <span style={{ color: C.cyan, fontWeight: 600 }}>{Number(v).toFixed(1)}h</span> : "—" },
          { key: "status", label: "Status", render: v => statusBadge(v || "—") },
        ]} rows={attendance.slice(0, 30)} emptyText="No attendance records" />
      )}

      {tab === "salary" && (
        <Table loading={loading} columns={[
          { key: "month", label: "Month", render: (v, row) => <span style={{ color: C.t2 }}>{MONTHS[(v||1)-1]} {row.year}</span> },
          { key: "basicSalary", label: "Basic", render: v => <span>₹{Number(v||0).toLocaleString("en-IN")}</span> },
          { key: "allowances", label: "Allowances", render: v => <span style={{ color: C.green }}>+₹{Number(v||0).toLocaleString("en-IN")}</span> },
          { key: "deductions", label: "Deductions", render: v => <span style={{ color: C.red }}>-₹{Number(v||0).toLocaleString("en-IN")}</span> },
          { key: "netSalary", label: "Net Pay", render: (v, row) => <span style={{ color: C.accent, fontWeight: 700 }}>₹{Number(v||row.totalSalary||0).toLocaleString("en-IN")}</span> },
          { key: "status", label: "Status", render: v => statusBadge(v || "pending") },
        ]} rows={salary} emptyText="No salary records" />
      )}
    </div>
  );
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
function EmployeesPage({ addToast, user, globalSearch }) {
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState(globalSearch || "");
  const [modal, setModal]           = useState(false);
  const [editModal, setEditModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailEmp, setDetailEmp]   = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee", department: "", position: "", phone: "", basicSalary: "", joinDate: "" });
  const [editForm, setEditForm]     = useState({});
  const [saving, setSaving]         = useState(false);
  const [deletedEmp, setDeletedEmp] = useState(null);
  const undoTimer = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await apiFetch("/users"); const d = await r.json(); setEmployees(safeArr(d, "users", "data")); }
    catch { addToast("Failed to load", "error"); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (globalSearch !== undefined) setSearch(globalSearch); }, [globalSearch]);
  if (detailEmp) return <EmployeeDetailPage emp={detailEmp} onBack={() => setDetailEmp(null)} addToast={addToast} user={user} />;

  const filtered = employees.filter(e => !search || [e.name, e.email, e.position, e.department, e.phone].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  const active   = employees.filter(e => e.isActive !== false).length;
  const onLeave  = employees.filter(e => e.status === "on_leave").length;
  const inactive = employees.filter(e => e.isActive === false).length;
  const newThisMonth = employees.filter(e => { const d = new Date(e.createdAt); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length;

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) return addToast("Name, email and password required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/auth/admin/create-employee", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      addToast("Employee created", "success"); setModal(false);
      setForm({ name: "", email: "", password: "", role: "employee", department: "", position: "", phone: "", basicSalary: "", joinDate: "" }); load();
    } catch (e) { addToast(e.message || "Failed", "error"); }
    setSaving(false);
  };

  const openEdit = (emp) => {
    setEditTarget(emp);
    setEditForm({ name: emp.name, email: emp.email, role: emp.role, department: emp.department || "", position: emp.position || "", phone: emp.phone || "", isActive: emp.isActive !== false });
    setEditModal(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const r = await apiFetch(`/users/${editTarget._id}`, { method: "PUT", body: JSON.stringify(editForm) });
      if (!r.ok) throw new Error();
      addToast("Employee updated", "success"); setEditModal(false); load();
    } catch { addToast("Failed to update", "error"); }
    setSaving(false);
  };

  const toggleActive = async (emp) => {
    try {
      await apiFetch(`/users/${emp._id}`, { method: "PUT", body: JSON.stringify({ isActive: emp.isActive === false }) });
      addToast(emp.isActive === false ? "Employee activated ✓" : "Employee deactivated", "success"); load();
    } catch { addToast("Failed", "error"); }
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Remove ${emp.name}?`)) return;
    try {
      await apiFetch(`/users/${emp._id}`, { method: "DELETE" });
      setDeletedEmp(emp); addToast(`${emp.name} removed. Undo?`, "info");
      undoTimer.current = setTimeout(() => setDeletedEmp(null), 7000); load();
    } catch { addToast("Failed to delete", "error"); }
  };

  const handleUndo = async () => {
    if (!deletedEmp) return;
    clearTimeout(undoTimer.current);
    try {
      await apiFetch("/auth/admin/create-employee", { method: "POST", body: JSON.stringify({ name: deletedEmp.name, email: deletedEmp.email, password: "Nexus@1234", role: deletedEmp.role, department: deletedEmp.department, position: deletedEmp.position }) });
      addToast(`${deletedEmp.name} restored!`, "success"); setDeletedEmp(null); load();
    } catch { addToast("Undo failed", "error"); }
  };

  // CSV export
  const handleExport = () => {
    const rows = [["Name","Email","Department","Position","Role","Status","Phone"],...filtered.map(e => [e.name,e.email,e.department||"",e.position||"",e.role,e.isActive!==false?"Active":"Inactive",e.phone||""])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv); a.download = "employees.csv"; a.click();
  };

  return (
    <PageShell title="Employees" sub="Manage all employees in your organization"
      actions={<>
        <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" icon={Search} style={{ width: 220 }} />
        <button className="btn-ghost" onClick={handleExport} style={{ gap: 6 }}><Upload size={14} />Export</button>
        {isAdmin(user) && <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Add Employee</button>}
      </>}
    >
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Employees", value: employees.length, sub: `+${newThisMonth} this month`, color: C.accent, icon: Users },
          { label: "Active Employees", value: active, sub: `+${newThisMonth} this month`, color: C.green, icon: CheckCircle2 },
          { label: "On Leave", value: onLeave, sub: "this month", color: C.amber, icon: Calendar },
          { label: "Inactive", value: inactive, sub: "total", color: C.red, icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: ".07em" }}>{s.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={17} color={s.color} /></div>
            </div>
            {loading ? <Sk h={28} w={60} /> : <p style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: "-.02em" }}>{s.value}</p>}
            <p style={{ fontSize: 12, color: C.t3, marginTop: 4 }}>+{newThisMonth} this month</p>
          </div>
        ))}
      </div>

      {deletedEmp && (
        <div style={{ background: C.amberG, border: `1px solid ${C.amber}44`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: C.amber }}>{deletedEmp.name} was removed.</span>
          <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={handleUndo}>↩ Undo</button>
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Employee","Department","Role","Status","Email","Phone","Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="tr">{Array(7).fill(0).map((_, j) => <td key={j} style={{ padding: "13px 16px" }}><Sk h={13} /></td>)}</tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "48px 16px", textAlign: "center", fontSize: 13, color: C.t2 }}>No employees found</td></tr>
              ) : filtered.map((emp, i) => (
                <tr key={emp._id || i} className="tr" style={{ cursor: "pointer" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: CC[i % CC.length] + "28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: CC[i % CC.length], flexShrink: 0 }}>{emp.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: C.t1 }}>{emp.name}</p>
                        <p style={{ fontSize: 11, color: C.t2 }}>{emp.position || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.t2 }}>{emp.department || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>{roleBadge(emp.role)}</td>
                  <td style={{ padding: "12px 16px" }}>{statusBadge(emp.isActive !== false ? "active" : "inactive")}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.t2 }}>{emp.email}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.t2 }}>{emp.phone || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn-icon" title="View" style={{ background: C.blueG, color: C.blue }} onClick={() => setDetailEmp(emp)}><Eye size={13} /></button>
                      {isAdmin(user) && <>
                        <button className="btn-icon" title="Edit" style={{ background: C.accentG, color: C.accent }} onClick={() => openEdit(emp)}><Edit2 size={13} /></button>
                        <button className="btn-icon" title={emp.isActive !== false ? "Deactivate" : "Activate"} style={{ background: emp.isActive === false ? C.greenG : C.amberG, color: emp.isActive === false ? C.green : C.amber }} onClick={() => toggleActive(emp)}>
                          {emp.isActive === false ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                        </button>
                        <button className="btn-icon" title="Delete" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(emp)}><Trash2 size={13} /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination hint */}
        {filtered.length > 0 && (
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.t3 }}>Showing {filtered.length} employee{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Employee" width={560}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FormField label="Full Name"><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" /></FormField>
          <FormField label="Email"><Inp value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" type="email" /></FormField>
          <FormField label="Password"><Inp value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" type="password" /></FormField>
          <FormField label="Phone"><Inp value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" /></FormField>
          <FormField label="Department"><Inp value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="Engineering" /></FormField>
          <FormField label="Role">
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="inp">
              <option value="employee">Employee</option><option value="admin">Admin</option>
            </select>
          </FormField>
          <FormField label="Position"><Inp value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} placeholder="Senior Developer" /></FormField>
          <FormField label="Join Date"><Inp value={form.joinDate} onChange={e => setForm(p => ({ ...p, joinDate: e.target.value }))} type="date" /></FormField>
          <div style={{ gridColumn: "1/-1" }}>
            <FormField label="Basic Salary (₹)"><Inp value={form.basicSalary} onChange={e => setForm(p => ({ ...p, basicSalary: e.target.value }))} placeholder="e.g. 85000" type="number" /></FormField>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Employee"}</button>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Employee" width={520}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[{ key:"name",label:"Full Name" },{ key:"email",label:"Email",type:"email" },{ key:"position",label:"Position" },{ key:"department",label:"Department" },{ key:"phone",label:"Phone" }].map(f => (
            <FormField key={f.key} label={f.label}><Inp value={editForm[f.key] || ""} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.type} /></FormField>
          ))}
          <FormField label="Role">
            <select value={editForm.role || "employee"} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="inp">
              <option value="employee">Employee</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select value={editForm.isActive ? "active" : "inactive"} onChange={e => setEditForm(p => ({ ...p, isActive: e.target.value === "active" }))} className="inp">
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
          </FormField>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
          <button className="btn-ghost" onClick={() => setEditModal(false)}>Cancel</button>
          <button className="btn-pri" onClick={handleEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function AttendancePage({ addToast, user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("daily");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [overrideModal, setOverrideModal] = useState(false);
  const [overrideForm, setOverrideForm] = useState({ userId: "", date: new Date().toISOString().split("T")[0], status: "present", note: "" });
  const [users, setUsers] = useState([]);
  const [checkLoading, setCheckLoading] = useState(false);
  const [todayRec, setTodayRec] = useState(null);
  const [settings, setSettings] = useState(null);
  const [search, setSearch] = useState("");
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    if (isAdmin(user)) return;
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const fmtElapsed = s => {
    const h = Math.floor(Math.abs(s)/3600), m = Math.floor((Math.abs(s)%3600)/60), sec = Math.abs(s)%60;
    return String(h).padStart(2,"0")+"h : "+String(m).padStart(2,"0")+"m : "+String(sec).padStart(2,"0")+"s";
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin(user)) {
        const [aR, uR, sR] = await Promise.allSettled([
          apiFetch(tab === "monthly" ? `/attendance?month=${month}&year=${year}` : "/attendance").then(r => r.json()),
          apiFetch("/users").then(r => r.json()),
          apiFetch("/company").then(r => r.json()),
        ]);
        // normalize: backend returns user field, frontend expects userId
        const recs = safeArr(aR.value, "attendance", "records", "data").map(r => ({
          ...r,
          userId: r.userId || r.user,
          hoursWorked: r.hoursWorked ?? r.totalHours ?? 0,
        }));
        setRecords(recs);
        setUsers(safeArr(uR.value, "users", "data"));
        setSettings(sR.value?.company || sR.value);
      } else {
        const [aR, sR] = await Promise.allSettled([
          apiFetch(tab === "monthly" ? `/attendance/monthly?month=${month}&year=${year}` : "/attendance").then(r => r.json()),
          apiFetch("/company").then(r => r.json()),
        ]);
        const recs = safeArr(aR.value, "attendance", "records", "data").map(r => ({
          ...r,
          userId: r.userId || r.user,
          hoursWorked: r.hoursWorked ?? r.totalHours ?? 0,
        }));
        setRecords(recs);
        setSettings(sR.value?.company || sR.value);
        const today = new Date().toDateString();
        setTodayRec(recs.find(r => r.date && new Date(r.date).toDateString() === today) || null);
      }
    } catch { addToast("Failed to load attendance", "error"); }
    setLoading(false);
  }, [tab, month, year, user]);
  useEffect(() => { load(); }, [load]);

  const handleCheckIn = async () => {
    setCheckLoading(true);
    try {
      const r = await apiFetch("/attendance/login", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      addToast(`Checked in — ${d.attendance?.status || "Recorded"}`, "success"); load();
    } catch (e) { addToast(e.message || "Check-in failed", "error"); }
    setCheckLoading(false);
  };

  const handleCheckOut = async () => {
    setCheckLoading(true);
    try {
      const r = await apiFetch("/attendance/checkout", { method: "POST" });
      if (!r.ok) throw new Error();
      addToast("Checked out successfully", "success"); load();
    } catch (e) { addToast(e.message || "Check-out failed", "error"); }
    setCheckLoading(false);
  };

  const handleOverride = async () => {
    try {
      const r = await apiFetch("/attendance/admin-override", { method: "POST", body: JSON.stringify(overrideForm) });
      if (!r.ok) throw new Error();
      addToast("Attendance updated", "success"); setOverrideModal(false); load();
    } catch { addToast("Failed to override", "error"); }
  };

  const filtered = records.filter(r => { if (!search) return true; const name = r.userId?.name || r.user?.name || ""; return name.toLowerCase().includes(search.toLowerCase()); });
  const present  = filtered.filter(r => ["present","on_time","early"].includes(r.status?.toLowerCase())).length;
  const absent   = filtered.filter(r => r.status?.toLowerCase() === "absent").length;
  const late     = filtered.filter(r => r.status?.toLowerCase() === "late").length;
  const halfDay  = filtered.filter(r => r.status?.toLowerCase() === "half_day").length;
  const total    = filtered.length || 1;

  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const getDotColor = s => { const sl = s?.toLowerCase(); if (["present","on_time","early"].includes(sl)) return C.green; if (sl==="absent") return C.red; if (sl==="late") return C.amber; if (sl==="half_day") return C.blue; return C.t3; };
  const formatTime = t => { if (!t) return "—"; try { return new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }); } catch { return t; } };
  const formatDate = t => { if (!t) return "—"; try { return new Date(t).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return t; } };

  return (
    <PageShell title="Attendance" sub={isAdmin(user) ? "Manage employee attendance" : "Your attendance records"}
      actions={
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className={`tab-btn ${tab==="daily"?"active":""}`}   onClick={() => setTab("daily")}>Daily</button>
          <button className={`tab-btn ${tab==="monthly"?"active":""}`} onClick={() => setTab("monthly")}>Monthly</button>
          {tab === "monthly" && <>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="inp" style={{ width: "auto" }}>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="inp" style={{ width: "auto" }}>
              {[2023,2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>}
          {isAdmin(user) && <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee…" icon={Search} style={{ width: 180 }} />}
          {isAdmin(user) && <button className="btn-pri" onClick={() => setOverrideModal(true)}><Edit2 size={14} />Mark Attendance</button>}
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[{ l:"Present",v:present,pct:Math.round(present/total*100),c:C.green },{ l:"Absent",v:absent,pct:Math.round(absent/total*100),c:C.red },{ l:"Late",v:late,pct:Math.round(late/total*100),c:C.amber },{ l:"Half Day",v:halfDay,pct:Math.round(halfDay/total*100),c:C.blue }].map(x => (
          <div key={x.l} className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c }} />
              <span style={{ fontSize: 12, color: C.t2, fontWeight: 600 }}>{x.l}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: x.c, marginBottom: 4 }}>{x.v}</p>
            <p style={{ fontSize: 12, color: C.t2 }}>{x.pct}% of total</p>
          </div>
        ))}
      </div>

      {!isAdmin(user) && (() => {
        const sessionActive = todayRec?.sessionActive || (todayRec?.checkIn && !todayRec?.checkOut);
        const sessionDone   = !!todayRec?.checkOut;
        const elapsedSecs   = todayRec?.checkIn && !sessionDone ? Math.floor((liveTime - new Date(todayRec.checkIn)) / 1000) : 0;
        const statusColor   = sessionDone ? C.blue : sessionActive ? C.green : C.t3;
        const statusLabel   = sessionDone ? "Completed" : sessionActive ? "● Live" : "Not Started";
        return (
          <div className="card" style={{ padding: 22, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>My Work Session</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {settings?.sessionStartTime && <span style={{ fontSize: 11, color: C.t2 }}>Window: {settings.sessionStartTime} — {settings.sessionEndTime || "—"}</span>}
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: statusColor + "18", padding: "4px 12px", borderRadius: 20 }}>{statusLabel}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Session Started", value: todayRec?.checkIn ? formatTime(todayRec.checkIn) : "—", sub: todayRec?.checkIn ? new Date(todayRec.checkIn).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "Not started yet", color: todayRec?.checkIn ? C.green : C.t3 },
                { label: "Elapsed Time",    value: sessionActive ? fmtElapsed(elapsedSecs) : todayRec?.totalHours ? Number(todayRec.totalHours).toFixed(1)+"h total" : "—", sub: sessionActive ? "Running" : sessionDone ? "Session ended" : "Awaiting start", color: sessionActive ? C.accent : C.t3 },
                { label: "Session End",     value: todayRec?.checkOut ? formatTime(todayRec.checkOut) : "—", sub: todayRec?.checkOut ? "Checked out" : "Still running", color: todayRec?.checkOut ? C.red : C.t3 },
              ].map(x => (
                <div key={x.label} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 10, color: C.t2, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{x.label}</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: x.color, fontVariantNumeric: "tabular-nums" }}>{x.value}</p>
                  <p style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>{x.sub}</p>
                </div>
              ))}
            </div>
            {sessionDone ? (
              <div style={{ padding: "12px 16px", background: C.blue+"14", border: `1px solid ${C.blue}33`, borderRadius: 12, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>✓ Session completed · {todayRec?.totalHours ? Number(todayRec.totalHours).toFixed(1)+"h worked" : ""} · {statusBadge(todayRec?.status)}</p>
              </div>
            ) : sessionActive ? (
              <button onClick={handleCheckOut} disabled={checkLoading} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.red},#dc2626)`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: checkLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: checkLoading ? 0.7 : 1 }}>
                <AlertCircle size={16} />{checkLoading ? "Ending…" : "End Session"}
              </button>
            ) : (
              <button onClick={handleCheckIn} disabled={checkLoading} style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${C.accent},${C.accentD})`, border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14, cursor: checkLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: checkLoading ? 0.7 : 1 }}>
                <CheckCircle2 size={16} />{checkLoading ? "Starting…" : "Start Session"}
              </button>
            )}
          </div>
        );
      })()}

      {tab === "monthly" && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{MONTHS[month-1]} {year}</h2>
            <div style={{ display: "flex", gap: 16 }}>
              {[{ c:C.green,l:"Present" },{ c:C.amber,l:"Late" },{ c:C.red,l:"Absent" },{ c:C.blue,l:"Half Day" }].map(x => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.t2 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: x.c }} />{x.l}</div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.t3, padding: "6px 0" }}>{d}</div>)}
            {Array.from({ length: new Date(year, month-1, 1).getDay() }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: getDaysInMonth(month, year) }).map((_, i) => {
              const day = i + 1;
              const recs = filtered.filter(r => { if (!r.date) return false; const d = new Date(r.date); return d.getDate()===day && d.getMonth()===month-1 && d.getFullYear()===year; });
              const isToday = new Date().toDateString() === new Date(year, month-1, day).toDateString();
              return (
                <div key={day} style={{ background: isToday ? C.accentG : "rgba(255,255,255,0.02)", border: `1px solid ${isToday ? C.accent + "44" : C.border}`, borderRadius: 10, padding: "8px 6px", minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? C.accent : C.t2 }}>{day}</span>
                  <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                    {recs.slice(0, 4).map((r, ri) => <div key={ri} title={`${r.user?.name || r.userId?.name || "Employee"}: ${r.status}`} style={{ width: 7, height: 7, borderRadius: "50%", background: getDotColor(r.status) }} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {["Employee","Date","Check In","Check Out","Hours","Status",...(isAdmin(user)?["Action"]:[])].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => (
              <tr key={i} className="tr">{Array(isAdmin(user)?7:6).fill(0).map((_, j) => <td key={j} style={{ padding: "13px 16px" }}><Sk h={13} /></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={isAdmin(user)?7:6} style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: C.t2 }}>No attendance records</td></tr>
            ) : filtered.map((row, i) => (
              <tr key={row._id || i} className="tr">
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent, flexShrink: 0 }}>
                      {(row.userId?.name || row.user?.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{row.userId?.name || row.user?.name || "—"}</p>
                      {(row.userId?.department || row.user?.department) && <p style={{ fontSize: 11, color: C.t2 }}>{row.userId?.department || row.user?.department}</p>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.t2 }}>{formatDate(row.date)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.green, fontWeight: 500 }}>{formatTime(row.checkIn || row.loginTime)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: C.red, fontWeight: 500 }}>{formatTime(row.checkOut || row.logoutTime)}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{(row.totalHours || row.hoursWorked) ? <span style={{ color: C.cyan, fontWeight: 600 }}>{Number(row.totalHours || row.hoursWorked).toFixed(1)}h</span> : "—"}</td>
                <td style={{ padding: "12px 16px" }}>{statusBadge(row.status)}</td>
                {isAdmin(user) && <td style={{ padding: "12px 16px" }}><button className="btn-icon" style={{ background: C.accentG, color: C.accent }} onClick={() => { setOverrideForm({ userId: row.user?._id || row.userId?._id || row.userId || "", date: row.date?.split("T")[0] || new Date().toISOString().split("T")[0], status: row.status || "present", note: "" }); setOverrideModal(true); }}><Edit2 size={12} /></button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={overrideModal} onClose={() => setOverrideModal(false)} title="Mark / Override Attendance">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isAdmin(user) && (
            <FormField label="Employee">
              <select value={overrideForm.userId} onChange={e => setOverrideForm(p => ({ ...p, userId: e.target.value }))} className="inp">
                <option value="">Select employee…</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </FormField>
          )}
          <FormField label="Date"><Inp value={overrideForm.date} onChange={e => setOverrideForm(p => ({ ...p, date: e.target.value }))} type="date" /></FormField>
          <FormField label="Status">
            <select value={overrideForm.status} onChange={e => setOverrideForm(p => ({ ...p, status: e.target.value }))} className="inp">
              {["present","absent","late","half_day","on leave"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Note"><Inp value={overrideForm.note} onChange={e => setOverrideForm(p => ({ ...p, note: e.target.value }))} placeholder="Optional note…" /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setOverrideModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleOverride}>Apply</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── WORK LOGS ────────────────────────────────────────────────────────────────
function WorklogsPage({ addToast, user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ description: "", hoursWorked: "", date: new Date().toISOString().split("T")[0], projectName: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/worklogs"); const d = await r.json(); setLogs(safeArr(d, "worklogs", "data")); }
    catch { addToast("Failed", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l => !search || [l.userId?.name, l.description, l.projectName].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  const handleSave = async () => {
    if (!form.description || !form.hoursWorked) return addToast("Description and hours required", "error");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append("files", file);
      const r = await fetch(`${API}/worklogs`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
      if (!r.ok) throw new Error();
      addToast("Work log saved", "success"); setModal(false);
      setForm({ description: "", hoursWorked: "", date: new Date().toISOString().split("T")[0], projectName: "" }); setFile(null); load();
    } catch { addToast("Failed to save", "error"); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    try { await apiFetch(`/worklogs/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); addToast(`Marked ${status}`, "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/worklogs/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  return (
    <PageShell title="Work Logs" sub="Employee task records"
      actions={<><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width: 220 }} /><button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Add Log</button></>}
    >
      <Table loading={loading} columns={[
        { key: "userId", label: "Employee", render: (v, row) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.accent }}>
              {(v?.name || row.employeeName || user?.name || "?")[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{v?.name || row.employeeName || user?.name || "—"}</span>
          </div>
        )},
        { key: "projectName",  label: "Project",     render: v => <span style={{ color: C.accent, fontSize: 12 }}>{v || "—"}</span> },
        { key: "description",  label: "Description", render: v => <span style={{ color: C.t2, fontSize: 12, maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v || "—"}</span> },
        { key: "hoursWorked",  label: "Hours",       render: v => v ? <span style={{ color: C.green, fontWeight: 600, fontSize: 12 }}>{v}h</span> : "—" },
        { key: "date",         label: "Date",        render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
        { key: "status",       label: "Status",      render: v => statusBadge(v || "pending") },
        { key: "_id", label: "Actions", render: (v, row) => (
          <div style={{ display: "flex", gap: 4 }}>
            {isAdmin(user) && <>
              <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.greenG, color: C.green, border: `1px solid ${C.green}22`, cursor: "pointer", fontWeight: 600 }} onClick={() => updateStatus(row._id, "approved")}>✓ Approve</button>
              <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.redG, color: C.red, border: `1px solid ${C.red}22`, cursor: "pointer", fontWeight: 600 }} onClick={() => updateStatus(row._id, "rejected")}>Reject</button>
            </>}
            <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(row._id)}><Trash2 size={12} /></button>
          </div>
        )},
      ]} rows={filtered} emptyText="No work logs" />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Work Log">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Project Name"><Inp value={form.projectName} onChange={e => setForm(p => ({ ...p, projectName: e.target.value }))} placeholder="Project name…" /></FormField>
          <FormField label="Description"><textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What did you work on?" rows={3} style={{ resize: "vertical" }} /></FormField>
          <FormField label="Hours Worked"><Inp value={form.hoursWorked} onChange={e => setForm(p => ({ ...p, hoursWorked: e.target.value }))} placeholder="e.g. 6" type="number" /></FormField>
          <FormField label="Date"><Inp value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" /></FormField>
          <FormField label="Attachment">
            <input ref={fileRef} type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
            <button className="btn-ghost" style={{ width: "100%" }} onClick={() => fileRef.current?.click()}><Upload size={14} />{file ? file.name : "Attach file"}</button>
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Log"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function TasksPage({ addToast, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", deadline: "", priority: "medium" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/tasks");
      const d = await r.json();
      setTasks(safeArr(d, "tasks", "data"));
      if (isAdmin(user)) {
        const ur = await apiFetch("/users"); const ud = await ur.json();
        setUsers(safeArr(ud, "users", "data"));
      }
    } catch { addToast("Failed to load tasks", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.assignedTo) return addToast("Title and assigned employee required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/tasks", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Task assigned!", "success"); setModal(false);
      setForm({ title: "", description: "", assignedTo: "", deadline: "", priority: "medium" }); load();
    } catch { addToast("Failed to create task", "error"); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    try { await apiFetch(`/tasks/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); addToast("Task updated", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const deleteTask = async (id) => {
    try { await apiFetch(`/tasks/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const priorityColor = p => p === "high" ? C.red : p === "medium" ? C.amber : C.green;
  const filtered = tasks.filter(t => !search || [t.title, t.assignedTo?.name, t.description].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  return (
    <PageShell title="Tasks" sub={isAdmin(user) ? "Assign and manage tasks" : "Your assigned tasks"}
      actions={<>
        <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" icon={Search} style={{ width: 220 }} />
        {isAdmin(user) && <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Assign Task</button>}
      </>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
        {loading ? Array(6).fill(0).map((_, i) => <Sk key={i} h={140} />) : filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: C.t2, fontSize: 13 }}>No tasks found</div>
        ) : filtered.map((task, i) => (
          <div key={task._id || i} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: priorityColor(task.priority) + "22", color: priorityColor(task.priority), textTransform: "uppercase" }}>{task.priority || "medium"}</span>
                  {statusBadge(task.status || "pending")}
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{task.title}</h3>
              </div>
              {isAdmin(user) && (
                <button className="btn-icon" style={{ background: C.redG, color: C.red, flexShrink: 0 }} onClick={() => deleteTask(task._id)}><Trash2 size={12} /></button>
              )}
            </div>
            <p style={{ fontSize: 12, color: C.t2, marginBottom: 12, lineHeight: 1.5 }}>{task.description || "No description"}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.accent }}>
                  {(task.assignedTo?.name || "?")[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 12, color: C.t2 }}>{task.assignedTo?.name || "Unassigned"}</span>
              </div>
              {task.deadline && (
                <span style={{ fontSize: 11, color: C.t3 }}>Due: {new Date(task.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              )}
            </div>
            {!isAdmin(user) && task.status !== "completed" && (
              <button className="btn-success" style={{ width: "100%", justifyContent: "center" }} onClick={() => updateStatus(task._id, "completed")}>
                <CheckCircle2 size={13} /> Mark Complete
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Assign Task">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Task Title"><Inp value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title…" /></FormField>
          <FormField label="Description"><textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Task description…" rows={3} style={{ resize: "vertical" }} /></FormField>
          <FormField label="Assign To">
            <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} className="inp">
              <option value="">Select employee…</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="inp">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </FormField>
          <FormField label="Deadline"><Inp value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} type="date" /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Assign Task"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── LEAVES ───────────────────────────────────────────────────────────────────
function LeavesPage({ addToast, user }) {
  const [leaves, setLeaves]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [tab, setTab]         = useState(isAdmin(user) ? "requests" : "mine");
  const [form, setForm] = useState({ type: "casual", from: "", to: "", reason: "" });
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/leaves"); const d = await r.json(); setLeaves(safeArr(d, "leaves", "data")); }
    catch { addToast("Failed to load leaves", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.from || !form.to || !form.reason) return addToast("All fields required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/leaves", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Leave request submitted!", "success"); setModal(false);
      setForm({ type: "casual", from: "", to: "", reason: "" }); load();
    } catch { addToast("Failed to submit leave", "error"); }
    setSaving(false);
  };

  const updateLeave = async (id, status) => {
    try { await apiFetch(`/leaves/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); addToast(`Leave ${status}`, "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const total    = leaves.length;
  const pending  = leaves.filter(l => l.status === "pending" || !l.status).length;
  const approved = leaves.filter(l => l.status === "approved").length;
  const rejected = leaves.filter(l => l.status === "rejected").length;

  const getDays = (from, to) => {
    if (!from || !to) return "—";
    const d = Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1;
    return d + (d === 1 ? " day" : " days");
  };

  const typeColor = t => ({ casual: C.blue, sick: C.red, earned: C.green, personal: C.purple, annual: C.amber }[t] || C.t2);

  return (
    <PageShell title="Leave Management" sub={isAdmin(user) ? "Review and manage leave requests" : "Your leave requests"}
      actions={<>
        {isAdmin(user) && (
          <div style={{ display: "flex", gap: 4, background: C.card, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {["requests","holidays"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: tab === t ? C.accent : "transparent", color: tab === t ? "#fff" : C.t2, textTransform: "capitalize" }}>{t === "requests" ? "Leave Requests" : "Holidays Approval"}</button>
            ))}
          </div>
        )}
        <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Request Leave</button>
      </>}
    >
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total Requests", value: total,    color: C.accent, icon: FileText },
          { label: "Pending",        value: pending,  color: C.amber,  icon: Clock },
          { label: "Approved",       value: approved, color: C.green,  icon: CheckCircle2 },
          { label: "Rejected",       value: rejected, color: C.red,    icon: AlertCircle },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><s.icon size={18} color={s.color} /></div>
            <div>
              <p style={{ fontSize: 11, color: C.t2, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 3 }}>{s.label}</p>
              {loading ? <Sk h={22} w={40} /> : <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Employee","Leave Type","From","To","Days","Reason","Status",...(isAdmin(user)?["Actions"]:[])].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="tr">{Array(isAdmin(user)?8:7).fill(0).map((_, j) => <td key={j} style={{ padding: "13px 16px" }}><Sk h={13} /></td>)}</tr>
              )) : leaves.length === 0 ? (
                <tr><td colSpan={isAdmin(user)?8:7} style={{ padding: "48px 16px", textAlign: "center", fontSize: 13, color: C.t2 }}>No leave requests</td></tr>
              ) : leaves.map((row, i) => (
                <tr key={row._id || i} className="tr">
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.accent }}>{(row.user?.name || row.userId?.name || user?.name || "?")[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{row.user?.name || row.userId?.name || user?.name || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: typeColor(row.type) + "22", color: typeColor(row.type), textTransform: "capitalize" }}>{row.type || "casual"}</span></td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.t2 }}>{row.from ? new Date(row.from).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.t2 }}>{row.to ? new Date(row.to).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: C.t1, fontWeight: 600 }}>{getDays(row.from, row.to)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.t2, maxWidth: 160 }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.reason || "—"}</span></td>
                  <td style={{ padding: "12px 16px" }}>{statusBadge(row.status || "pending")}</td>
                  {isAdmin(user) && (
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {row.status !== "approved" && <button className="btn-icon" title="Approve" style={{ background: C.greenG, color: C.green, width: 26, height: 26 }} onClick={() => updateLeave(row._id, "approved")}><CheckCircle2 size={12} /></button>}
                        {row.status !== "rejected" && <button className="btn-icon" title="Reject" style={{ background: C.redG, color: C.red, width: 26, height: 26 }} onClick={() => updateLeave(row._id, "rejected")}><X size={12} /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Request Leave">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Leave Type">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="inp">
              <option value="casual">Casual Leave</option><option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option><option value="personal">Personal Leave</option><option value="annual">Annual Leave</option>
            </select>
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="From Date"><Inp value={form.from} onChange={e => setForm(p => ({ ...p, from: e.target.value }))} type="date" /></FormField>
            <FormField label="To Date"><Inp value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} type="date" /></FormField>
          </div>
          {form.from && form.to && <div style={{ padding: "8px 12px", background: C.accentG, borderRadius: 8, fontSize: 12, color: C.accent }}>Duration: {getDays(form.from, form.to)}</div>}
          <FormField label="Reason"><textarea className="inp" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Reason for leave…" rows={3} style={{ resize: "vertical" }} /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSubmit} disabled={saving}>{saving ? "Submitting…" : "Submit Request"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── HOLIDAYS ─────────────────────────────────────────────────────────────────
function HolidaysPage({ addToast, user }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ name: "", date: "", type: "national", description: "" });
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/holidays"); const d = await r.json(); setHolidays(safeArr(d, "holidays", "data")); }
    catch { addToast("Failed to load holidays", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.date) return addToast("Name and date required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/holidays", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Holiday added!", "success"); setModal(false);
      setForm({ name: "", date: "", type: "national", description: "" }); load();
    } catch { addToast("Failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/holidays/${id}`, { method: "DELETE" }); addToast("Holiday removed", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const typeColor = t => ({ national: C.accent, optional: C.amber, restricted: C.purple }[t] || C.blue);

  const filtered = holidays.filter(h => !search || h.name?.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <PageShell title="Holidays" sub="Manage company holidays"
      actions={<>
        <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search holidays…" icon={Search} style={{ width: 200 }} />
        {isAdmin(user) && <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Add Holiday</button>}
      </>}
    >
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Holiday Name","Date","Day","Type",...(isAdmin(user)?["Actions"]:[])].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: C.t3, letterSpacing: ".08em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_, i) => (
                <tr key={i} className="tr">{Array(isAdmin(user)?5:4).fill(0).map((_, j) => <td key={j} style={{ padding: "13px 16px" }}><Sk h={13} /></td>)}</tr>
              )) : sorted.length === 0 ? (
                <tr><td colSpan={isAdmin(user)?5:4} style={{ padding: "48px 16px", textAlign: "center", fontSize: 13, color: C.t2 }}>No holidays added yet</td></tr>
              ) : sorted.map((h, i) => {
                const d = h.date ? new Date(h.date) : null;
                const isPast = d && d < new Date();
                const color = typeColor(h.type);
                return (
                  <tr key={h._id || i} className="tr">
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: color + "22", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{d ? d.getDate() : "?"}</span>
                          <span style={{ fontSize: 8, color, fontWeight: 700 }}>{d ? MONTHS[d.getMonth()]?.slice(0,3).toUpperCase() : ""}</span>
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isPast ? C.t2 : C.t1 }}>{h.name}</p>
                          {h.description && <p style={{ fontSize: 11, color: C.t3, marginTop: 2 }}>{h.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.t2 }}>{d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.t2 }}>{d ? d.toLocaleDateString("en-IN", { weekday: "long" }) : "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: color + "22", color, textTransform: "capitalize" }}>{h.type || "National"} Holiday</span>
                    </td>
                    {isAdmin(user) && (
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button className="btn-icon" style={{ background: C.accentG, color: C.accent, width: 28, height: 28 }}><Edit2 size={12} /></button>
                          <button className="btn-icon" style={{ background: C.redG, color: C.red, width: 28, height: 28 }} onClick={() => handleDelete(h._id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Holiday">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Holiday Name"><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Diwali" /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Date"><Inp value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" /></FormField>
            <FormField label="Type">
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="inp">
                <option value="national">National Holiday</option>
                <option value="optional">Optional Holiday</option>
                <option value="restricted">Restricted Holiday</option>
              </select>
            </FormField>
          </div>
          <FormField label="Description (optional)"><Inp value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional note…" /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Add Holiday"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── SALARY ───────────────────────────────────────────────────────────────────
function SalaryPage({ addToast, user }) {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [payslipTarget, setPayslipTarget] = useState(null);
  const [tab, setTab]           = useState("overview");
  const [form, setForm] = useState({ userId: "", basicSalary: "", allowances: "", deductions: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: "" });
  const [users, setUsers]       = useState([]);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/salaries"); const d = await r.json(); setSalaries(safeArr(d, "salaries", "data"));
      if (isAdmin(user)) { const ur = await apiFetch("/users"); const ud = await ur.json(); setUsers(safeArr(ud, "users", "data")); }
    } catch { addToast("Failed to load salaries", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.userId || !form.basicSalary) return addToast("Employee and salary required", "error");
    setSaving(true);
    try {
      const net = Number(form.basicSalary) + Number(form.allowances || 0) - Number(form.deductions || 0);
      const month = `${form.year}-${String(form.month).padStart(2, "0")}`;
      const r = await apiFetch("/salaries", { method: "POST", body: JSON.stringify({
        user: form.userId, // backend expects 'user' not 'userId'
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances || 0),
        deductions: Number(form.deductions || 0),
        netSalary: net,
        amount: net, // old salary model uses 'amount'
        month,
        notes: form.notes,
        status: "pending",
      }) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      addToast("Salary record created!", "success"); setModal(false);
      setForm({ userId: "", basicSalary: "", allowances: "", deductions: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), notes: "" }); load();
    } catch (e) { addToast(e.message || "Failed to create salary record", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/salaries/${id}`, { method: "DELETE" }); addToast("Record deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const filtered = salaries.filter(s => !search || [s.userId?.name, s.notes].some(f => f?.toLowerCase().includes(search.toLowerCase())));
  const totalPayroll = filtered.reduce((sum, s) => sum + Number(s.netSalary || s.totalSalary || 0), 0);
  const paid = filtered.filter(s => s.status === "paid").length;
  const pending = filtered.filter(s => s.status !== "paid").length;
  const totalDeductions = filtered.reduce((sum, s) => sum + Number(s.deductions || 0), 0);

  // Payslip Modal
  if (payslipTarget) {
    const emp = users.find(u => u._id === (payslipTarget.userId?._id || payslipTarget.userId)) || payslipTarget.userId || {};
    const basic = Number(payslipTarget.basicSalary || 0);
    const hraAmt = Math.round(basic * 0.14);
    const specialAllowance = Math.round(basic * 0.012);
    const totalEarnings = basic + hraAmt + specialAllowance;
    const pf = Math.round(basic * 0.058);
    const profTax = 200;
    const incomeTax = Math.round(basic * 0.05);
    const totalDed = pf + profTax + incomeTax;
    const netPay = Number(payslipTarget.netSalary || payslipTarget.totalSalary || totalEarnings - totalDed);
    return (
      <div className="scroll" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <button onClick={() => setPayslipTarget(null)} className="btn-ghost" style={{ padding: "7px 14px", fontSize: 13, gap: 6 }}><ChevronLeft size={15} />Back</button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.t3 }}>
            <span style={{ cursor: "pointer", color: C.accent }} onClick={() => setPayslipTarget(null)}>Salary Management</span>
            <ChevronRight size={12} /><span style={{ color: C.t2 }}>Payslip — {MONTHS[(payslipTarget.month||1)-1]} {payslipTarget.year}</span>
          </div>
          <button className="btn-ghost" style={{ marginLeft: "auto", gap: 6, fontSize: 13 }} onClick={() => window.print()}><Upload size={14} />Download Payslip</button>
        </div>
        <div className="card fadeUp" style={{ maxWidth: 680, margin: "0 auto", padding: 32 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff" }}>N</div>
              <div><h2 style={{ fontSize: 16, fontWeight: 800, color: C.t1 }}>Nexus Enterprises</h2><p style={{ fontSize: 12, color: C.t2 }}>Exporters Private Limited</p></div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>PAYSLIP</p>
              <p style={{ fontSize: 12, color: C.t2 }}>{MONTHS[(payslipTarget.month||1)-1]} {payslipTarget.year}</p>
            </div>
          </div>
          {/* Employee Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, color: C.t3, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Employee Details</p>
              {[{ l: "Employee", v: emp.name || payslipTarget.userId?.name || "—" }, { l: "Employee ID", v: emp.employeeId || "NEX-EMP-" + ((emp._id || payslipTarget.userId)?.slice(-4) || "0001") }, { l: "Designation", v: emp.position || "Employee" }, { l: "Department", v: emp.department || "—" }].map(f => (
                <div key={f.l} style={{ display: "flex", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: C.t3, minWidth: 100 }}>{f.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>{f.v}</span>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.t3, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>Pay Details</p>
              {[{ l: "Join Date", v: emp.joinDate ? new Date(emp.joinDate).toLocaleDateString("en-IN") : "—" }, { l: "Pay Period", v: `${MONTHS[(payslipTarget.month||1)-1]} ${payslipTarget.year}` }, { l: "Pay Date", v: payslipTarget.paidDate ? new Date(payslipTarget.paidDate).toLocaleDateString("en-IN") : "—" }, { l: "Status", v: payslipTarget.status || "pending" }].map(f => (
                <div key={f.l} style={{ display: "flex", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: C.t3, minWidth: 100 }}>{f.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1, textTransform: "capitalize" }}>{f.v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Earnings & Deductions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: C.greenG, border: `1px solid ${C.green}22`, borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Earnings</p>
              {[{ l: "Basic Salary", v: basic }, { l: "HRA", v: hraAmt }, { l: "Special Allowance", v: specialAllowance }].map(e => (
                <div key={e.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.t2 }}>{e.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>₹{e.v.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.green}33` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>Total Earnings</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>₹{totalEarnings.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div style={{ background: C.redG, border: `1px solid ${C.red}22`, borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 12, textTransform: "uppercase", letterSpacing: ".06em" }}>Deductions</p>
              {[{ l: "PF", v: pf }, { l: "Professional Tax", v: profTax }, { l: "Income Tax", v: incomeTax }].map(d => (
                <div key={d.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.t2 }}>{d.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.t1 }}>₹{d.v.toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: `1px solid ${C.red}33` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>Total Deductions</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.red }}>₹{totalDed.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
          {/* Net Salary */}
          <div style={{ background: `linear-gradient(135deg,${C.accent}22,${C.purple}22)`, border: `1px solid ${C.accent}33`, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>Net Salary</span>
            <span style={{ fontSize: 28, fontWeight: 900, color: C.accent }}>₹{netPay.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageShell title="Salary Management" sub={isAdmin(user) ? `Total payroll: ₹${totalPayroll.toLocaleString("en-IN")}` : "Your salary history"}
      actions={<>
        {isAdmin(user) && (
          <div style={{ display: "flex", gap: 4, background: C.card, padding: 4, borderRadius: 10, border: `1px solid ${C.border}` }}>
            {["overview","salary structures","allowance & deductions"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: tab === t ? C.accent : "transparent", color: tab === t ? "#fff" : C.t2, textTransform: "capitalize", whiteSpace: "nowrap" }}>{t}</button>
            ))}
          </div>
        )}
        {isAdmin(user) && <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width: 180 }} />}
        {isAdmin(user) && <button className="btn-pri" onClick={() => setModal(true)}><Zap size={14} />Process Payroll</button>}
      </>}
    >
      {/* Stat Cards */}
      {isAdmin(user) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Total Payroll", value: `₹${totalPayroll.toLocaleString("en-IN")}`, sub: "This Month", color: C.accent, icon: Wallet },
            { label: "Paid Employees", value: paid, sub: "This Month", color: C.green, icon: CheckCircle2 },
            { label: "Pending Payments", value: pending, sub: "This Month", color: C.amber, icon: Clock },
            { label: "Total Deductions", value: `₹${totalDeductions.toLocaleString("en-IN")}`, sub: "This Month", color: C.red, icon: AlertCircle },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.t2, textTransform: "uppercase", letterSpacing: ".07em" }}>{s.label}</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={17} color={s.color} /></div>
              </div>
              {loading ? <Sk h={26} w={80} /> : <p style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>}
              <p style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Payroll label for admin */}
      {isAdmin(user) && <p style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 12 }}>Recent Payroll</p>}

      <Table loading={loading} columns={[
        { key: "userId",      label: "Employee",    render: (v, row) => (
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.accent }}>{(v?.name || "?")[0]?.toUpperCase()}</div>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{v?.name || "—"}</span>
          </div>
        )},
        { key: "month",       label: "Month",       render: (v, row) => <span style={{ color: C.t2 }}>{MONTHS[(v||1)-1]} {row.year}</span> },
        { key: "basicSalary", label: "Basic (₹)",   render: v => <span style={{ color: C.t1, fontWeight: 600 }}>₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "allowances",  label: "Allowances",  render: v => <span style={{ color: C.green }}>+₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "deductions",  label: "Deductions",  render: v => <span style={{ color: C.red }}>-₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "netSalary",   label: "Net Pay",     render: (v, row) => <span style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>₹{Number(v||row.totalSalary||0).toLocaleString("en-IN")}</span> },
        { key: "status",      label: "Status",      render: v => statusBadge(v || "pending") },
        { key: "_id", label: "Actions", render: (v, row) => (
          <div style={{ display: "flex", gap: 5 }}>
            <button className="btn-icon" title="View Payslip" style={{ background: C.accentG, color: C.accent, width: 28, height: 28 }} onClick={() => setPayslipTarget(row)}><FileText size={12} /></button>
            {isAdmin(user) && <button className="btn-icon" style={{ background: C.redG, color: C.red, width: 28, height: 28 }} onClick={() => handleDelete(v)}><Trash2 size={12} /></button>}
          </div>
        )},
      ]} rows={filtered} emptyText="No salary records" />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Salary Record">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Employee">
            <select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} className="inp">
              <option value="">Select employee…</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Month">
              <select value={form.month} onChange={e => setForm(p => ({ ...p, month: Number(e.target.value) }))} className="inp">
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Year"><Inp value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} type="number" /></FormField>
          </div>
          <FormField label="Basic Salary (₹)"><Inp value={form.basicSalary} onChange={e => setForm(p => ({ ...p, basicSalary: e.target.value }))} placeholder="e.g. 85000" type="number" /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Allowances (₹)"><Inp value={form.allowances} onChange={e => setForm(p => ({ ...p, allowances: e.target.value }))} placeholder="0" type="number" /></FormField>
            <FormField label="Deductions (₹)"><Inp value={form.deductions} onChange={e => setForm(p => ({ ...p, deductions: e.target.value }))} placeholder="0" type="number" /></FormField>
          </div>
          {form.basicSalary && (
            <div style={{ background: C.accentG, border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 12, color: C.t2 }}>Net Pay Preview</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>
                ₹{(Number(form.basicSalary||0) + Number(form.allowances||0) - Number(form.deductions||0)).toLocaleString("en-IN")}
              </p>
            </div>
          )}
          <FormField label="Notes"><Inp value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes…" /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Create Record"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── BUYERS ───────────────────────────────────────────────────────────────────
function BuyersPage({ addToast }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/buyers"); const d = await r.json(); setBuyers(safeArr(d, "buyers", "data")); }
    catch { addToast("Failed", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) return addToast("Name required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/buyers", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Buyer added!", "success"); setModal(false);
      setForm({ name: "", email: "", phone: "", company: "", country: "" }); load();
    } catch { addToast("Failed", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/buyers/${id}`, { method: "DELETE" }); addToast("Buyer removed", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const filtered = buyers.filter(b => !search || [b.name, b.email, b.company, b.country].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  return (
    <PageShell title="Buyers" sub={`${buyers.length} total buyers`}
      actions={<><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width: 220 }} /><button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Add Buyer</button></>}
    >
      <Table loading={loading} columns={[
        { key: "name",    label: "Name",    render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
        { key: "company", label: "Company", render: v => <span style={{ color: C.t2 }}>{v || "—"}</span> },
        { key: "email",   label: "Email",   render: v => <span style={{ color: C.t2 }}>{v || "—"}</span> },
        { key: "phone",   label: "Phone",   render: v => <span style={{ color: C.t2 }}>{v || "—"}</span> },
        { key: "country", label: "Country", render: v => <span style={{ color: C.t2 }}>{v || "—"}</span> },
        { key: "_id", label: "Action", render: v => <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(v)}><Trash2 size={12} /></button> },
      ]} rows={filtered} emptyText="No buyers" />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Buyer">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[{ key:"name",label:"Name",ph:"Buyer name" },{ key:"email",label:"Email",ph:"buyer@email.com",type:"email" },{ key:"phone",label:"Phone",ph:"+91 98765 43210" },{ key:"company",label:"Company",ph:"Company Ltd." },{ key:"country",label:"Country",ph:"India" }].map(f => (
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} type={f.type} /></FormField>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Add Buyer"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersPage({ addToast }) {
  const [orders, setOrders]   = useState([]);
  const [buyers, setBuyers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ buyer: "", product: "", quantity: "", price: "", unit: "KG", hsnCode: "", status: "draft", paymentStatus: "pending", notes: "" });
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [oR, bR] = await Promise.allSettled([
        apiFetch("/orders").then(r => r.json()),
        apiFetch("/buyers").then(r => r.json()),
      ]);
      setOrders(safeArr(oR.value, "orders", "data"));
      setBuyers(safeArr(bR.value, "buyers", "data"));
    } catch { addToast("Failed to load orders", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd  = () => { setEditTarget(null); setForm({ buyer: "", product: "", quantity: "", price: "", unit: "KG", hsnCode: "", status: "draft", paymentStatus: "pending", notes: "" }); setModal(true); };
  const openEdit = (o) => { setEditTarget(o); setForm({ buyer: o.buyer?._id || o.buyer || "", product: o.product || "", quantity: o.quantity || "", price: o.price || "", unit: o.unit || "KG", hsnCode: o.hsnCode || "", status: o.status || "draft", paymentStatus: o.paymentStatus || "pending", notes: o.notes || "" }); setModal(true); };

  const handleSave = async () => {
    if (!form.buyer || !form.product || !form.quantity || !form.price) return addToast("Buyer, product, quantity and price required", "error");
    setSaving(true);
    try {
      const method = editTarget ? "PUT" : "POST";
      const path   = editTarget ? `/orders/${editTarget._id}` : "/orders";
      const r = await apiFetch(path, { method, body: JSON.stringify({ ...form, quantity: Number(form.quantity), price: Number(form.price) }) });
      if (!r.ok) { const d = await r.json(); throw new Error(d.message); }
      addToast(editTarget ? "Order updated!" : "Order created!", "success"); setModal(false); load();
    } catch (e) { addToast(e.message || "Failed", "error"); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    try { await apiFetch(`/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); addToast("Status updated", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try { await apiFetch(`/orders/${id}`, { method: "DELETE" }); addToast("Order deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const filtered = orders.filter(o => !search || [o.buyer?.name, o.product, o.orderNumber, o.hsnCode].some(f => f?.toLowerCase().includes(search.toLowerCase())));
  const totalRevenue = orders.filter(o => o.status === "delivered").reduce((s, o) => s + Number(o.totalValue || (o.quantity * o.price) || 0), 0);

  const statusColor = s => ({ draft: C.t2, confirmed: C.blue, shipped: C.amber, delivered: C.green, cancelled: C.red }[s] || C.t2);
  const payColor    = s => ({ pending: C.amber, partial: C.blue, paid: C.green, overdue: C.red }[s] || C.t2);

  return (
    <PageShell title="Orders" sub={`${orders.length} orders · Revenue: ₹${totalRevenue.toLocaleString("en-IN")}`}
      actions={<><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" icon={Search} style={{ width: 220 }} /><button className="btn-pri" onClick={openAdd}><Plus size={14} />New Order</button></>}
    >
      <Table loading={loading} columns={[
        { key: "orderNumber", label: "Order #",  render: v => <span style={{ color: C.accent, fontWeight: 700, fontFamily: "monospace" }}>{v || "—"}</span> },
        { key: "buyer",       label: "Buyer",    render: v => <span style={{ fontWeight: 600 }}>{v?.name || "—"}</span> },
        { key: "product",     label: "Product",  render: (v, row) => <div><p style={{ fontWeight: 600 }}>{v}</p>{row.hsnCode && <p style={{ fontSize: 11, color: C.t3 }}>HSN: {row.hsnCode}</p>}</div> },
        { key: "quantity",    label: "Qty",      render: (v, row) => <span style={{ color: C.t2 }}>{v} {row.unit || "KG"}</span> },
        { key: "price",       label: "Unit Price", render: v => <span style={{ color: C.t2 }}>₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "totalValue",  label: "Total",    render: (v, row) => <span style={{ color: C.accent, fontWeight: 700 }}>₹{Number(v || (row.quantity * row.price) || 0).toLocaleString("en-IN")}</span> },
        { key: "status",      label: "Status",   render: v => <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: statusColor(v) + "22", color: statusColor(v), textTransform: "capitalize" }}>{v || "draft"}</span> },
        { key: "paymentStatus", label: "Payment", render: v => <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: payColor(v) + "22", color: payColor(v), textTransform: "capitalize" }}>{v || "pending"}</span> },
        { key: "_id", label: "Actions", render: (v, row) => (
          <div style={{ display: "flex", gap: 5 }}>
            <button className="btn-icon" style={{ background: C.accentG, color: C.accent }} onClick={() => openEdit(row)}><Edit2 size={12} /></button>
            <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(row._id)}><Trash2 size={12} /></button>
          </div>
        )},
      ]} rows={filtered} emptyText="No orders found" />

      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? "Edit Order" : "New Order"} width={580}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Buyer">
            <select value={form.buyer} onChange={e => setForm(p => ({ ...p, buyer: e.target.value }))} className="inp">
              <option value="">Select buyer…</option>
              {buyers.map(b => <option key={b._id} value={b._id}>{b.name} {b.company ? `— ${b.company}` : ""}</option>)}
            </select>
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Product"><Inp value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))} placeholder="e.g. Basmati Rice" /></FormField>
            <FormField label="HSN Code"><Inp value={form.hsnCode} onChange={e => setForm(p => ({ ...p, hsnCode: e.target.value }))} placeholder="e.g. 1006" /></FormField>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <FormField label="Quantity"><Inp value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="100" type="number" /></FormField>
            <FormField label="Unit">
              <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className="inp">
                {["KG","MT","LT","PCS","BOX","BAG","TON"].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormField>
            <FormField label="Unit Price (₹)"><Inp value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="500" type="number" /></FormField>
          </div>
          {form.quantity && form.price && (
            <div style={{ background: C.accentG, border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ fontSize: 12, color: C.t2 }}>Total Value</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>₹{(Number(form.quantity) * Number(form.price)).toLocaleString("en-IN")}</p>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Order Status">
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="inp">
                {["draft","confirmed","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </FormField>
            <FormField label="Payment Status">
              <select value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))} className="inp">
                {["pending","partial","paid","overdue"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Notes"><textarea className="inp" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes…" rows={2} style={{ resize: "vertical" }} /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editTarget ? "Update Order" : "Create Order"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsPage({ addToast, user }) {
  const [data, setData] = useState({ users: [], orders: [], salaries: [], attendance: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [uR, oR, sR, aR] = await Promise.allSettled([
          apiFetch("/users").then(r => r.json()),
          apiFetch("/orders").then(r => r.json()),
          apiFetch("/salaries").then(r => r.json()),
          apiFetch("/attendance").then(r => r.json()),
        ]);
        setData({
          users: safeArr(uR.value, "users", "data"),
          orders: safeArr(oR.value, "orders", "data"),
          salaries: safeArr(sR.value, "salaries", "data"),
          attendance: safeArr(aR.value, "attendance", "records", "data"),
        });
      } catch { addToast("Failed to load analytics", "error"); }
      setLoading(false);
    })();
  }, []);

  const monthlyOrders = MONTHS.slice(0, 6).map((m, i) => ({
    month: m.slice(0, 3),
    orders: data.orders.filter(o => new Date(o.date || o.createdAt).getMonth() === i).length,
    revenue: data.orders.filter(o => new Date(o.date || o.createdAt).getMonth() === i).reduce((s, o) => s + Number(o.amount || 0), 0) / 1000,
  }));

  const deptMap = data.users.reduce((acc, u) => { const d = u.department || "Other"; acc[d] = (acc[d] || 0) + 1; return acc; }, {});
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  const attTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const label = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d.getDay() === 0 ? 6 : d.getDay() - 1];
    const p = data.attendance.filter(a => a.date && new Date(a.date).toDateString() === d.toDateString() && ["present","on_time","early"].includes(a.status?.toLowerCase())).length;
    return { label, value: data.users.length ? Math.round(p / data.users.length * 100) : 0 };
  });

  return (
    <PageShell title="Analytics" sub="Organization insights and metrics">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Monthly Orders & Revenue</h2>
          {loading ? <Sk h={160} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyOrders} barSize={18} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders"  name="Orders"       fill={C.accent}  radius={[4,4,0,0]} />
                <Bar dataKey="revenue" name="Revenue (₹K)" fill={C.green}   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Attendance Trend (This Week)</h2>
          {loading ? <Sk h={160} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attTrend} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="attArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} formatter={v => [`${v}%`, "Attendance"]} />
                <Area type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2.5} fill="url(#attArea)" name="Attendance Rate" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Department Distribution</h2>
          {loading ? <Sk h={160} /> : deptData.length === 0 ? <p style={{ color: C.t2, fontSize: 13 }}>No data</p> : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={40} outerRadius={64} dataKey="value" strokeWidth={0}>
                    {deptData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {deptData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: CC[i % CC.length] }} />
                      <span style={{ fontSize: 12, color: C.t2 }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Key Metrics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { l: "Total Employees", v: data.users.length,   c: C.accent },
              { l: "Total Orders",    v: data.orders.length,  c: C.green },
              { l: "Total Revenue",   v: `₹${(data.orders.reduce((s,o)=>s+Number(o.amount||0),0)/1000).toFixed(0)}K`, c: C.amber },
              { l: "Avg Attendance",  v: `${attTrend.length ? Math.round(attTrend.reduce((s,d)=>s+d.value,0)/attTrend.length) : 0}%`, c: C.blue },
            ].map(m => (
              <div key={m.l} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px" }}>
                <p style={{ fontSize: 11, color: C.t2, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{m.l}</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: m.c }}>{loading ? "—" : m.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── COMPANY SETTINGS ─────────────────────────────────────────────────────────
function CompanyPage({ addToast, user }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    companyName: "", sessionStartTime: "", sessionEndTime: "",
    gracePeriod: "", sessionTimeoutHours: "",
    officeStartHour: "9", officeStartMinute: "0",
    officeEndHour: "18", officeEndMinute: "0",
    gracePeriodMinutes: "15", minWorkingHours: "7",
    halfDayHours: "4", autoEndHour: "23", autoEndMinute: "59",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await apiFetch("/company"); const d = await r.json();
        const s = d?.company || d;
        setSettings(s);
        setForm({
          companyName:        s?.companyName || s?.name || "",
          sessionStartTime:   s?.sessionStartTime || "",
          sessionEndTime:     s?.sessionEndTime || "",
          gracePeriod:        s?.gracePeriod || "",
          sessionTimeoutHours: s?.sessionTimeoutHours || "",
          officeStartHour:    String(s?.officeStartHour ?? 9),
          officeStartMinute:  String(s?.officeStartMinute ?? 0),
          officeEndHour:      String(s?.officeEndHour ?? 18),
          officeEndMinute:    String(s?.officeEndMinute ?? 0),
          gracePeriodMinutes: String(s?.gracePeriodMinutes ?? 15),
          minWorkingHours:    String(s?.minWorkingHours ?? 7),
          halfDayHours:       String(s?.halfDayHours ?? 4),
          autoEndHour:        String(s?.autoEndHour ?? 23),
          autoEndMinute:      String(s?.autoEndMinute ?? 59),
        });
      } catch { addToast("Failed to load settings", "error"); }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.companyName,
        officeStartHour:    Number(form.officeStartHour),
        officeStartMinute:  Number(form.officeStartMinute),
        officeEndHour:      Number(form.officeEndHour),
        officeEndMinute:    Number(form.officeEndMinute),
        gracePeriodMinutes: Number(form.gracePeriodMinutes),
        minWorkingHours:    Number(form.minWorkingHours),
        halfDayHours:       Number(form.halfDayHours),
        autoEndHour:        Number(form.autoEndHour),
        autoEndMinute:      Number(form.autoEndMinute),
      };
      const r = await apiFetch("/company", { method: "PUT", body: JSON.stringify(payload) });
      if (!r.ok) throw new Error();
      addToast("Settings saved!", "success");
    } catch { addToast("Failed to save", "error"); }
    setSaving(false);
  };

  if (!isAdmin(user)) return <PageShell title="Settings" sub="Company configuration"><div style={{ textAlign:"center", padding:"60px 0", color:C.t2 }}>Admin access required</div></PageShell>;

  const F = ({ label, children }) => <FormField label={label}>{children}</FormField>;

  return (
    <PageShell title="Company Settings" sub="Configure your organization and attendance rules">
      <div style={{ maxWidth: 700 }}>
        {/* General */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 18 }}>General</h2>
          <F label="Company Name"><Inp value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Nexus Enterprises…" /></F>
        </div>

        {/* Attendance Session Settings */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 4 }}>Attendance Session Rules</h2>
          <p style={{ fontSize: 12, color: C.t2, marginBottom: 18 }}>These rules control how employee attendance is tracked and auto-calculated.</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.t2, display: "block", marginBottom: 6 }}>Session Start Time</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={form.officeStartHour} onChange={e => setForm(p => ({ ...p, officeStartHour: e.target.value }))} className="inp" style={{ flex: 1 }}>
                  {Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}</option>)}
                </select>
                <span style={{ color: C.t2, alignSelf: "center", fontWeight: 700 }}>:</span>
                <select value={form.officeStartMinute} onChange={e => setForm(p => ({ ...p, officeStartMinute: e.target.value }))} className="inp" style={{ flex: 1 }}>
                  {[0,15,30,45].map(m=><option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.t2, display: "block", marginBottom: 6 }}>Session End Time</label>
              <div style={{ display: "flex", gap: 6 }}>
                <select value={form.officeEndHour} onChange={e => setForm(p => ({ ...p, officeEndHour: e.target.value }))} className="inp" style={{ flex: 1 }}>
                  {Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}</option>)}
                </select>
                <span style={{ color: C.t2, alignSelf: "center", fontWeight: 700 }}>:</span>
                <select value={form.officeEndMinute} onChange={e => setForm(p => ({ ...p, officeEndMinute: e.target.value }))} className="inp" style={{ flex: 1 }}>
                  {[0,15,30,45].map(m=><option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
                </select>
              </div>
            </div>
            <F label="Grace Period (minutes)">
              <Inp value={form.gracePeriodMinutes} onChange={e => setForm(p => ({ ...p, gracePeriodMinutes: e.target.value }))} placeholder="15" type="number" />
            </F>
            <F label="Minimum Work Hours (for Present)">
              <Inp value={form.minWorkingHours} onChange={e => setForm(p => ({ ...p, minWorkingHours: e.target.value }))} placeholder="7" type="number" />
            </F>
            <F label="Half Day Threshold (hours)">
              <Inp value={form.halfDayHours} onChange={e => setForm(p => ({ ...p, halfDayHours: e.target.value }))} placeholder="4" type="number" />
            </F>
            <F label="Session Timeout (hours)">
              <Inp value={form.sessionTimeoutHours} onChange={e => setForm(p => ({ ...p, sessionTimeoutHours: e.target.value }))} placeholder="8" type="number" />
            </F>
          </div>

          {/* Auto End Session */}
          <div style={{ marginTop: 16, padding: "14px 16px", background: C.amberG, border: `1px solid ${C.amber}28`, borderRadius: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 10 }}>⏰ Auto End Session Time</p>
            <p style={{ fontSize: 12, color: C.t2, marginBottom: 10 }}>If an employee forgets to check out, their session will be force-ended at this time.</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={form.autoEndHour} onChange={e => setForm(p => ({ ...p, autoEndHour: e.target.value }))} className="inp" style={{ width: 90 }}>
                {Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}</option>)}
              </select>
              <span style={{ color: C.t2, fontWeight: 700 }}>:</span>
              <select value={form.autoEndMinute} onChange={e => setForm(p => ({ ...p, autoEndMinute: e.target.value }))} className="inp" style={{ width: 90 }}>
                {[0,15,30,45].map(m=><option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
              </select>
              <span style={{ fontSize: 12, color: C.t2 }}>— sessions auto-close at this time</span>
            </div>
          </div>

          {/* Status Logic Summary */}
          <div style={{ marginTop: 14, padding: "14px 16px", background: C.accentG, border: `1px solid ${C.accent}28`, borderRadius: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8 }}>Auto Status Calculation Logic</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { c: C.green,  l: "✅ PRESENT",  r: `Hours ≥ ${form.minWorkingHours}h AND checked in within grace period` },
                { c: C.amber,  l: "🟡 LATE",     r: `Checked in after grace period but within session window` },
                { c: C.blue,   l: "🟠 HALF DAY", r: `Hours ≥ ${form.halfDayHours}h but < ${form.minWorkingHours}h` },
                { c: C.red,    l: "🔴 ABSENT",   r: `No check-in OR hours < ${form.halfDayHours}h` },
              ].map(x => (
                <div key={x.l} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: x.c, minWidth: 100 }}>{x.l}</span>
                  <span style={{ fontSize: 12, color: C.t2 }}>{x.r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-pri" onClick={handleSave} disabled={saving || loading} style={{ padding: "10px 28px" }}>
          {saving ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </PageShell>
  );
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
function AuditPage({ addToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const r = await apiFetch("/audit"); const d = await r.json(); setLogs(safeArr(d, "logs", "data")); }
      catch { addToast("Failed to load audit logs", "error"); }
      setLoading(false);
    })();
  }, []);

  return (
    <PageShell title="Audit Logs" sub="System activity history">
      <Table loading={loading} columns={[
        { key: "userId",  label: "User",    render: v => <span style={{ fontWeight: 600 }}>{v?.name || "System"}</span> },
        { key: "action",  label: "Action",  render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v || "—"}</span> },
        { key: "details", label: "Details", render: v => <span style={{ color: C.t3, fontSize: 12, maxWidth: 300, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{typeof v === "object" ? JSON.stringify(v) : v || "—"}</span> },
        { key: "createdAt", label: "Time",  render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v ? new Date(v).toLocaleString("en-IN") : "—"}</span> },
      ]} rows={logs} emptyText="No audit logs" />
    </PageShell>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePage({ addToast, user }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", position: user?.position || "", department: user?.department || "" });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await apiFetch("/users/profile", { method: "PUT", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Profile updated!", "success");
    } catch { addToast("Failed to update", "error"); }
    setSaving(false);
  };

  const handlePw = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return addToast("Passwords don't match", "error");
    if (pwForm.newPassword.length < 6) return addToast("Password must be at least 6 characters", "error");
    setPwSaving(true);
    try {
      const r = await apiFetch("/auth/change-password", { method: "POST", body: JSON.stringify(pwForm) });
      if (!r.ok) throw new Error();
      addToast("Password changed!", "success"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch { addToast("Failed to change password", "error"); }
    setPwSaving(false);
  };

  return (
    <PageShell title="Profile" sub="Manage your account">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff" }}>
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: C.t1 }}>{user?.name}</h2>
                <p style={{ fontSize: 13, color: C.t2 }}>{user?.email}</p>
                <div style={{ marginTop: 6 }}>{roleBadge(user?.role)}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ key:"name",label:"Full Name" },{ key:"email",label:"Email",type:"email" },{ key:"phone",label:"Phone" },{ key:"position",label:"Position" },{ key:"department",label:"Department" }].map(f => (
                <FormField key={f.key} label={f.label}><Inp value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.type} /></FormField>
              ))}
              <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Update Profile"}</button>
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 18 }}>Change Password</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FormField label="Current Password"><Inp value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} type="password" placeholder="••••••••" /></FormField>
              <FormField label="New Password"><Inp value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} type="password" placeholder="••••••••" /></FormField>
              <FormField label="Confirm Password"><Inp value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} type="password" placeholder="••••••••" /></FormField>
              <button className="btn-pri" onClick={handlePw} disabled={pwSaving}>{pwSaving ? "Changing…" : "Change Password"}</button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
function DepartmentsPage({ addToast, user }) {
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", headId: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [dR, uR] = await Promise.allSettled([
        apiFetch("/departments").then(r => r.json()),
        apiFetch("/users").then(r => r.json()),
      ]);
      setDepts(safeArr(dR.value, "departments", "data"));
      setUsers(safeArr(uR.value, "users", "data"));
    } catch { addToast("Failed to load departments", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm({ name: "", description: "", headId: "" }); setModal(true); };
  const openEdit = (d) => { setEditTarget(d); setForm({ name: d.name, description: d.description || "", headId: d.headId?._id || d.headId || "" }); setModal(true); };

  const handleSave = async () => {
    if (!form.name) return addToast("Department name required", "error");
    setSaving(true);
    try {
      const method = editTarget ? "PUT" : "POST";
      const path = editTarget ? `/departments/${editTarget._id}` : "/departments";
      const r = await apiFetch(path, { method, body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast(editTarget ? "Department updated" : "Department created", "success");
      setModal(false); load();
    } catch { addToast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    try { await apiFetch(`/departments/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed to delete", "error"); }
  };

  const filtered = depts.filter(d => !search || d.name?.toLowerCase().includes(search.toLowerCase()));
  const deptColors = [C.accent, C.green, C.amber, C.blue, C.purple, C.cyan, C.red, C.orange];

  return (
    <PageShell title="Departments" sub={`${depts.length} departments`}
      actions={isAdmin(user) ? <><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." icon={Search} style={{ width: 200 }} /><button className="btn-pri" onClick={openAdd}><Plus size={14} />Add Department</button></> : <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." icon={Search} style={{ width: 200 }} />}
    >
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {Array(6).fill(0).map((_, i) => <Sk key={i} h={140} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.t2, fontSize: 13 }}>No departments found</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {filtered.map((dept, i) => {
            const color = deptColors[i % deptColors.length];
            const empCount = users.filter(u => u.department === dept.name).length;
            const head = dept.headId ? (typeof dept.headId === "object" ? dept.headId : users.find(u => u._id === dept.headId)) : null;
            return (
              <div key={dept._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Layers size={20} color={color} />
                  </div>
                  {isAdmin(user) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-icon" style={{ background: C.accentG, color: C.accent }} onClick={() => openEdit(dept)}><Edit2 size={12} /></button>
                      <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(dept._id)}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 4 }}>{dept.name}</h3>
                {dept.description && <p style={{ fontSize: 12, color: C.t2, marginBottom: 12, lineHeight: 1.5 }}>{dept.description}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Users size={13} color={C.t3} />
                    <span style={{ fontSize: 12, color: C.t2 }}>{empCount} employees</span>
                  </div>
                  {head && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color }}>
                        {head.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontSize: 11, color: C.t2 }}>{head.name}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? "Edit Department" : "Add Department"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Department Name"><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Engineering" /></FormField>
          <FormField label="Description"><textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Department description..." rows={3} style={{ resize: "vertical" }} /></FormField>
          <FormField label="Department Head">
            <select value={form.headId} onChange={e => setForm(p => ({ ...p, headId: e.target.value }))} className="inp">
              <option value="">No head assigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name} - {u.position || u.department || "Employee"}</option>)}
            </select>
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editTarget ? "Update" : "Create"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ROLES & PERMISSIONS ──────────────────────────────────────────────────────
function RolesPage({ addToast, user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/users"); const d = await r.json(); setUsers(safeArr(d, "users", "data")); }
    catch { addToast("Failed to load", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async () => {
    if (!newRole) return;
    setSaving(true);
    try {
      const r = await apiFetch(`/users/${editUser._id}`, { method: "PUT", body: JSON.stringify({ role: newRole }) });
      if (!r.ok) throw new Error();
      addToast("Role updated", "success"); setEditUser(null); load();
    } catch { addToast("Failed to update role", "error"); }
    setSaving(false);
  };

  const roleGroups = [
    { role: "super_admin", label: "Super Admin", color: C.purple, desc: "Full system access, manage all settings and users" },
    { role: "admin",       label: "Admin",        color: C.accent, desc: "Manage employees, attendance, payroll and reports" },
    { role: "employee",    label: "Employee",     color: C.blue,   desc: "View own data, submit logs, request leaves" },
  ];

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell title="Roles & Permissions" sub="Manage user roles and access levels">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {roleGroups.map(rg => {
          const count = users.filter(u => u.role === rg.role).length;
          return (
            <div key={rg.role} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: rg.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={18} color={rg.color} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{rg.label}</p>
                  <p style={{ fontSize: 11, color: C.t3 }}>{count} {count === 1 ? "user" : "users"}</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{rg.desc}</p>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>All Users</h2>
        <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." icon={Search} style={{ width: 220 }} />
      </div>
      <Table loading={loading} columns={[
        { key: "name", label: "User", render: (v, row) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.accent }}>{v?.[0]?.toUpperCase()}</div>
            <div><p style={{ fontWeight: 600, fontSize: 13 }}>{v}</p><p style={{ fontSize: 11, color: C.t2 }}>{row.email}</p></div>
          </div>
        )},
        { key: "department", label: "Department", render: v => <span style={{ color: C.t2 }}>{v || "—"}</span> },
        { key: "position",   label: "Position",   render: v => <span style={{ color: C.t2 }}>{v || "—"}</span> },
        { key: "role",       label: "Role",        render: v => roleBadge(v) },
        { key: "isActive",   label: "Status",      render: v => statusBadge(v !== false ? "active" : "inactive") },
        ...(isAdmin(user) ? [{ key: "_id", label: "Actions", render: (v, row) => (
          <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => { setEditUser(row); setNewRole(row.role); }}>
            <Edit2 size={12} />Change Role
          </button>
        )}] : []),
      ]} rows={filtered} emptyText="No users found" />
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Change Role — ${editUser?.name}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: C.accentG, border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 12, color: C.t2, marginBottom: 4 }}>Current role</p>
            <div>{roleBadge(editUser?.role)}</div>
          </div>
          <FormField label="New Role">
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="inp">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </FormField>
          <div style={{ fontSize: 12, color: C.amber, background: C.amberG, border: `1px solid ${C.amber}22`, borderRadius: 8, padding: "8px 12px" }}>
            Changing roles affects what this user can access.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
            <button className="btn-pri" onClick={handleRoleChange} disabled={saving}>{saving ? "Saving..." : "Update Role"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ORGANIZATION ─────────────────────────────────────────────────────────────
function OrganizationPage({ addToast, user }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", vision: "", mission: "", address: "", phone: "", email: "", website: "", industry: "", foundedYear: "" });

  const load = async () => {
    setLoading(true);
    try {
      let o = {};
      try { const r = await apiFetch("/organization"); const d = await r.json(); o = d?.organization || d?.company || d || {}; }
      catch { const r2 = await apiFetch("/company"); const d2 = await r2.json(); o = d2?.company || d2 || {}; }
      setForm({ name: o.name || "", vision: o.vision || "", mission: o.mission || "", address: o.address || "", phone: o.phone || "", email: o.email || "", website: o.website || "", industry: o.industry || "", foundedYear: o.foundedYear || "" });
    } catch { addToast("Failed to load organization", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      let ok = false;
      try { const r = await apiFetch("/organization", { method: "PUT", body: JSON.stringify(form) }); ok = r.ok; } catch {}
      if (!ok) { const r2 = await apiFetch("/company", { method: "PUT", body: JSON.stringify(form) }); if (!r2.ok) throw new Error(); }
      addToast("Organization updated", "success"); load();
    } catch { addToast("Failed to save", "error"); }
    setSaving(false);
  };

  return (
    <PageShell title="Organization" sub="Company profile and information">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 24, background: `linear-gradient(135deg, ${C.card} 0%, rgba(99,102,241,0.06) 100%)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#fff", boxShadow: `0 8px 24px rgba(99,102,241,0.4)` }}>N</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.t1 }}>{form.name || "Nexus Enterprises"}</h2>
                <p style={{ fontSize: 13, color: C.t2, marginTop: 3 }}>{form.industry || "Export & Trade"}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}><Badge label="VERIFIED" color={C.green} /><Badge label="ACTIVE" color={C.accent} /></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[{ label: "Founded", value: form.foundedYear || "—", icon: Calendar, color: C.accent }, { label: "Industry", value: form.industry || "—", icon: Briefcase, color: C.blue }, { label: "HQ", value: form.address ? form.address.split(",")[0] : "—", icon: MapPin, color: C.green }, { label: "Website", value: form.website || "—", icon: Globe, color: C.purple }].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><s.icon size={12} color={s.color} /><span style={{ fontSize: 10, color: C.t3, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</span></div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
          {isAdmin(user) && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 18 }}>Edit Organization Profile</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Company Name"><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nexus Enterprises..." /></FormField>
                  <FormField label="Industry"><Inp value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} placeholder="Export & Trade" /></FormField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Email"><Inp value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="info@company.com" type="email" /></FormField>
                  <FormField label="Phone"><Inp value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" /></FormField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <FormField label="Website"><Inp value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://nexus.com" /></FormField>
                  <FormField label="Founded Year"><Inp value={form.foundedYear} onChange={e => setForm(p => ({ ...p, foundedYear: e.target.value }))} placeholder="2010" type="number" /></FormField>
                </div>
                <FormField label="Address"><Inp value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="123 Business Park, Mumbai" /></FormField>
                <FormField label="Vision Statement"><textarea className="inp" value={form.vision} onChange={e => setForm(p => ({ ...p, vision: e.target.value }))} placeholder="Our vision..." rows={3} style={{ resize: "vertical" }} /></FormField>
                <FormField label="Mission Statement"><textarea className="inp" value={form.mission} onChange={e => setForm(p => ({ ...p, mission: e.target.value }))} placeholder="Our mission..." rows={3} style={{ resize: "vertical" }} /></FormField>
                <button className="btn-pri" onClick={handleSave} disabled={saving || loading} style={{ alignSelf: "flex-start", padding: "10px 24px" }}>{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {form.vision && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Eye size={16} color={C.accent} /><h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Our Vision</h3></div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7 }}>{form.vision}</p>
            </div>
          )}
          {form.mission && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Target size={16} color={C.green} /><h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>Our Mission</h3></div>
              <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7 }}>{form.mission}</p>
            </div>
          )}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: C.t1, marginBottom: 14 }}>Contact Info</h3>
            {[{ icon: Globe, label: "Website", val: form.website }, { icon: MapPin, label: "Address", val: form.address }, { icon: Bell, label: "Email", val: form.email }, { icon: Hash, label: "Phone", val: form.phone }].map(c => c.val ? (
              <div key={c.label} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <c.icon size={14} color={C.t3} style={{ marginTop: 1, flexShrink: 0 }} />
                <div><p style={{ fontSize: 11, color: C.t3, marginBottom: 2 }}>{c.label}</p><p style={{ fontSize: 13, color: C.t1 }}>{c.val}</p></div>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── SHIFT MANAGEMENT ─────────────────────────────────────────────────────────
function ShiftsPage({ addToast, user }) {
  const [shifts, setShifts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", startTime: "09:00", endTime: "18:00", days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], assignedTo: [] });
  const [saving, setSaving] = useState(false);
  const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const load = async () => {
    setLoading(true);
    try {
      const [sR, uR] = await Promise.allSettled([apiFetch("/shifts").then(r => r.json()), apiFetch("/users").then(r => r.json())]);
      setShifts(safeArr(sR.value, "shifts", "data"));
      setUsers(safeArr(uR.value, "users", "data"));
    } catch { addToast("Failed to load shifts", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm({ name: "", startTime: "09:00", endTime: "18:00", days: ["Monday","Tuesday","Wednesday","Thursday","Friday"], assignedTo: [] }); setModal(true); };
  const openEdit = (s) => { setEditTarget(s); setForm({ name: s.name, startTime: s.startTime || "09:00", endTime: s.endTime || "18:00", days: s.days || [], assignedTo: (s.assignedTo || []).map(a => a._id || a) }); setModal(true); };
  const toggleDay = (day) => setForm(p => ({ ...p, days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day] }));
  const toggleUser = (uid) => setForm(p => ({ ...p, assignedTo: p.assignedTo.includes(uid) ? p.assignedTo.filter(u => u !== uid) : [...p.assignedTo, uid] }));

  const handleSave = async () => {
    if (!form.name) return addToast("Shift name required", "error");
    setSaving(true);
    try {
      const r = await apiFetch(editTarget ? `/shifts/${editTarget._id}` : "/shifts", { method: editTarget ? "PUT" : "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast(editTarget ? "Shift updated" : "Shift created", "success"); setModal(false); load();
    } catch { addToast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/shifts/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const shiftColors = [C.accent, C.green, C.amber, C.purple, C.cyan];

  return (
    <PageShell title="Shift Management" sub="Create and manage employee shifts"
      actions={isAdmin(user) ? <button className="btn-pri" onClick={openAdd}><Plus size={14} />Create Shift</button> : null}
    >
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>{Array(4).fill(0).map((_, i) => <Sk key={i} h={160} />)}</div>
      ) : shifts.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <Clock size={32} color={C.t3} style={{ marginBottom: 12 }} />
          <p style={{ color: C.t2, fontSize: 14 }}>No shifts created yet</p>
          {isAdmin(user) && <button className="btn-pri" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={14} />Create First Shift</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
          {shifts.map((shift, i) => {
            const color = shiftColors[i % shiftColors.length];
            const assignedUsers = (shift.assignedTo || []).map(a => typeof a === "object" ? a : users.find(u => u._id === a)).filter(Boolean);
            return (
              <div key={shift._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock size={18} color={color} /></div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{shift.name}</h3>
                      <p style={{ fontSize: 12, color, fontWeight: 600 }}>{shift.startTime} — {shift.endTime}</p>
                    </div>
                  </div>
                  {isAdmin(user) && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-icon" style={{ background: C.accentG, color: C.accent }} onClick={() => openEdit(shift)}><Edit2 size={12} /></button>
                      <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(shift._id)}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                  {daysOfWeek.map(day => (
                    <span key={day} style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: (shift.days || []).includes(day) ? color + "22" : "rgba(255,255,255,0.03)", color: (shift.days || []).includes(day) ? color : C.t3 }}>{day.slice(0,3)}</span>
                  ))}
                </div>
                {assignedUsers.length > 0 && (
                  <div style={{ paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: 11, color: C.t3, marginBottom: 8 }}>{assignedUsers.length} assigned</p>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {assignedUsers.slice(0,5).map(u => <div key={u._id} title={u.name} style={{ width: 26, height: 26, borderRadius: 7, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.accent }}>{u.name?.[0]?.toUpperCase()}</div>)}
                      {assignedUsers.length > 5 && <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.t2 }}>+{assignedUsers.length - 5}</div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? "Edit Shift" : "Create Shift"} width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Shift Name"><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Morning Shift" /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Start Time"><Inp value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} type="time" /></FormField>
            <FormField label="End Time"><Inp value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} type="time" /></FormField>
          </div>
          <FormField label="Working Days">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
              {daysOfWeek.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${form.days.includes(day) ? C.accent : C.border}`, background: form.days.includes(day) ? C.accentG : "transparent", color: form.days.includes(day) ? C.accent : C.t2, transition: "all .15s" }}>{day.slice(0,3)}</button>
              ))}
            </div>
          </FormField>
          {isAdmin(user) && (
            <FormField label="Assign Employees">
              <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                {users.map(u => (
                  <label key={u._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 8, cursor: "pointer", background: form.assignedTo.includes(u._id) ? C.accentG : "transparent" }}>
                    <input type="checkbox" checked={form.assignedTo.includes(u._id)} onChange={() => toggleUser(u._id)} style={{ accentColor: C.accent }} />
                    <span style={{ fontSize: 13, color: C.t1 }}>{u.name}</span>
                    <span style={{ fontSize: 11, color: C.t3, marginLeft: "auto" }}>{u.department || u.position}</span>
                  </label>
                ))}
              </div>
            </FormField>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editTarget ? "Update" : "Create"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function ProjectsPage({ addToast, user }) {
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active", deadline: "", members: [], budget: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [pR, uR] = await Promise.allSettled([apiFetch("/projects").then(r => r.json()), apiFetch("/users").then(r => r.json())]);
      setProjects(safeArr(pR.value, "projects", "data"));
      setAllUsers(safeArr(uR.value, "users", "data"));
    } catch { addToast("Failed to load projects", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditTarget(null); setForm({ name: "", description: "", status: "active", deadline: "", members: [], budget: "" }); setModal(true); };
  const openEdit = (p) => { setEditTarget(p); setForm({ name: p.name, description: p.description || "", status: p.status || "active", deadline: p.deadline?.split("T")[0] || "", members: (p.members || []).map(m => m._id || m), budget: p.budget || "" }); setModal(true); };
  const toggleMember = (uid) => setForm(p => ({ ...p, members: p.members.includes(uid) ? p.members.filter(u => u !== uid) : [...p.members, uid] }));

  const handleSave = async () => {
    if (!form.name) return addToast("Project name required", "error");
    setSaving(true);
    try {
      const r = await apiFetch(editTarget ? `/projects/${editTarget._id}` : "/projects", { method: editTarget ? "PUT" : "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast(editTarget ? "Project updated" : "Project created", "success"); setModal(false); load();
    } catch { addToast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    try { await apiFetch(`/projects/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const statusColor = s => s === "completed" ? C.green : s === "on_hold" ? C.amber : s === "cancelled" ? C.red : C.accent;
  const filtered = projects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageShell title="Projects" sub={`${projects.length} total projects`}
      actions={<><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." icon={Search} style={{ width: 200 }} />{isAdmin(user) && <button className="btn-pri" onClick={openAdd}><Plus size={14} />New Project</button>}</>}
    >
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>{Array(6).fill(0).map((_, i) => <Sk key={i} h={180} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}><p style={{ color: C.t2 }}>No projects found</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
          {filtered.map((proj, i) => {
            const color = statusColor(proj.status);
            const members = (proj.members || []).map(m => typeof m === "object" ? m : allUsers.find(u => u._id === m)).filter(Boolean);
            const daysLeft = proj.deadline ? Math.ceil((new Date(proj.deadline) - new Date()) / 86400000) : null;
            return (
              <div key={proj._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: color + "22", color, textTransform: "uppercase" }}>{proj.status || "active"}</span>
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{proj.name}</h3>
                  </div>
                  {isAdmin(user) && (
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button className="btn-icon" style={{ background: C.accentG, color: C.accent }} onClick={() => openEdit(proj)}><Edit2 size={12} /></button>
                      <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(proj._id)}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
                {proj.description && <p style={{ fontSize: 12, color: C.t2, marginBottom: 12, lineHeight: 1.5 }}>{proj.description}</p>}
                <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
                  {daysLeft !== null && <div style={{ fontSize: 12, color: daysLeft < 0 ? C.red : daysLeft < 7 ? C.amber : C.t2 }}>{daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}</div>}
                  {proj.budget && <div style={{ fontSize: 12, color: C.t2 }}>Budget: <span style={{ color: C.green, fontWeight: 600 }}>₹{Number(proj.budget).toLocaleString("en-IN")}</span></div>}
                </div>
                {members.length > 0 && (
                  <div style={{ display: "flex", gap: 4, alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                    {members.slice(0,6).map((m, mi) => <div key={m._id} title={m.name} style={{ width: 26, height: 26, borderRadius: 7, background: CC[mi % CC.length] + "28", border: `2px solid ${C.card}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: CC[mi % CC.length], marginLeft: mi > 0 ? -8 : 0 }}>{m.name?.[0]?.toUpperCase()}</div>)}
                    {members.length > 6 && <span style={{ fontSize: 11, color: C.t2, marginLeft: 6 }}>+{members.length - 6}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? "Edit Project" : "New Project"} width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Project Name"><Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Project name..." /></FormField>
          <FormField label="Description"><textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Project description..." rows={3} style={{ resize: "vertical" }} /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Status">
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="inp">
                <option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
              </select>
            </FormField>
            <FormField label="Deadline"><Inp value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} type="date" /></FormField>
          </div>
          <FormField label="Budget (₹)"><Inp value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="e.g. 500000" type="number" /></FormField>
          <FormField label="Team Members">
            <div style={{ maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
              {allUsers.map(u => (
                <label key={u._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 8, cursor: "pointer", background: form.members.includes(u._id) ? C.accentG : "transparent" }}>
                  <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggleMember(u._id)} style={{ accentColor: C.accent }} />
                  <span style={{ fontSize: 13, color: C.t1 }}>{u.name}</span>
                  <span style={{ fontSize: 11, color: C.t3, marginLeft: "auto" }}>{u.department}</span>
                </label>
              ))}
            </div>
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editTarget ? "Update" : "Create"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── TIMESHEET ────────────────────────────────────────────────────────────────
function TimesheetPage({ addToast, user }) {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({ weekStart: "", entries: [], notes: "" });

  const getWeekDates = (offset = 0) => {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
  };

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0].toISOString().split("T")[0];

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/timesheets"); const d = await r.json(); setTimesheets(safeArr(d, "timesheets", "data")); }
    catch { addToast("Failed to load", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openModal = () => {
    setForm({ weekStart, notes: "", entries: weekDates.map(d => ({ date: d.toISOString().split("T")[0], day: d.toLocaleDateString("en-IN", { weekday: "short" }), hours: "", description: "" })) });
    setModal(true);
  };

  const updateEntry = (i, key, val) => setForm(p => ({ ...p, entries: p.entries.map((e, ei) => ei === i ? { ...e, [key]: val } : e) }));
  const totalHours = form.entries.reduce((s, e) => s + (Number(e.hours) || 0), 0);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const r = await apiFetch("/timesheets", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Timesheet submitted!", "success"); setModal(false); load();
    } catch { addToast("Failed to submit", "error"); }
    setSaving(false);
  };

  const currentSheet = timesheets.find(t => t.weekStart?.split("T")[0] === weekStart);

  return (
    <PageShell title="Timesheet" sub={isAdmin(user) ? "Review employee timesheets" : "Log your weekly hours"}
      actions={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-ghost" onClick={() => setWeekOffset(p => p - 1)}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 13, color: C.t2, minWidth: 180, textAlign: "center" }}>
            {weekDates[0].toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {weekDates[6].toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <button className="btn-ghost" onClick={() => setWeekOffset(p => p + 1)} disabled={weekOffset >= 0}><ChevronRight size={14} /></button>
          {!isAdmin(user) && <button className="btn-pri" onClick={openModal}><Plus size={14} />Log Hours</button>}
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10, marginBottom: 20 }}>
        {weekDates.map((d, i) => {
          const isToday = d.toDateString() === new Date().toDateString();
          const dayEntry = currentSheet?.entries?.find(e => e.date?.split("T")[0] === d.toISOString().split("T")[0]);
          return (
            <div key={i} className="card" style={{ padding: 16, textAlign: "center", border: `1px solid ${isToday ? C.accent + "44" : C.border}`, background: isToday ? C.accentG : C.card }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: isToday ? C.accent : C.t3, textTransform: "uppercase", marginBottom: 4 }}>{d.toLocaleDateString("en-IN", { weekday: "short" })}</p>
              <p style={{ fontSize: 13, color: isToday ? C.accent : C.t2, marginBottom: 8 }}>{d.getDate()}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: dayEntry?.hours ? C.t1 : C.t3 }}>{dayEntry?.hours || "—"}</p>
              {dayEntry?.hours && <p style={{ fontSize: 10, color: C.t3 }}>hrs</p>}
            </div>
          );
        })}
      </div>
      <Table loading={loading} columns={[
        { key: "userId", label: "Employee", render: (v) => <span style={{ fontWeight: 600 }}>{v?.name || user?.name || "—"}</span> },
        { key: "weekStart", label: "Week", render: v => <span style={{ color: C.t2 }}>{v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span> },
        { key: "entries", label: "Total Hours", render: v => { const t = (v || []).reduce((s, e) => s + (Number(e.hours) || 0), 0); return <span style={{ color: C.accent, fontWeight: 700 }}>{t}h</span>; }},
        { key: "status", label: "Status", render: v => statusBadge(v || "pending") },
        { key: "notes", label: "Notes", render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v || "—"}</span> },
        ...(isAdmin(user) ? [{ key: "_id", label: "Actions", render: (v, row) => (
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.greenG, color: C.green, border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => apiFetch(`/timesheets/${row._id}`, { method: "PUT", body: JSON.stringify({ status: "approved" }) }).then(() => { addToast("Approved", "success"); load(); })}>Approve</button>
            <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.redG, color: C.red, border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => apiFetch(`/timesheets/${row._id}`, { method: "PUT", body: JSON.stringify({ status: "rejected" }) }).then(() => { addToast("Rejected", "success"); load(); })}>Reject</button>
          </div>
        )}] : []),
      ]} rows={timesheets} emptyText="No timesheets found" />
      <Modal open={modal} onClose={() => setModal(false)} title="Log Weekly Hours" width={620}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
            {form.entries.map((entry, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.t3, marginBottom: 6 }}>{entry.day}</p>
                <input className="inp" type="number" value={entry.hours} onChange={e => updateEntry(i, "hours", e.target.value)} placeholder="0" min="0" max="24" style={{ textAlign: "center", padding: "8px 4px" }} />
              </div>
            ))}
          </div>
          <div style={{ background: C.accentG, border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.t2 }}>Total hours this week</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{totalHours}h</span>
          </div>
          <FormField label="Notes"><textarea className="inp" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any notes..." rows={2} style={{ resize: "vertical" }} /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSubmit} disabled={saving}>{saving ? "Submitting..." : "Submit Timesheet"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── PAYROLL ──────────────────────────────────────────────────────────────────
function PayrollPage({ addToast, user }) {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genModal, setGenModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/payroll"); const d = await r.json(); setPayrolls(safeArr(d, "payrolls", "data")); }
    catch { addToast("Failed to load payroll", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setSaving(true);
    try {
      const r = await apiFetch("/payroll/generate", { method: "POST", body: JSON.stringify({ month, year }) });
      if (!r.ok) throw new Error();
      addToast("Payroll generated!", "success"); setGenModal(false); load();
    } catch { addToast("Failed to generate payroll", "error"); }
    setSaving(false);
  };

  const markPaid = async (id) => {
    try { await apiFetch(`/payroll/${id}`, { method: "PUT", body: JSON.stringify({ status: "paid", paidDate: new Date().toISOString() }) }); addToast("Marked as paid", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const filtered = payrolls.filter(p => !search || p.userId?.name?.toLowerCase().includes(search.toLowerCase()));
  const totalPayable = filtered.filter(p => p.status !== "paid").reduce((s, p) => s + Number(p.netSalary || p.totalSalary || 0), 0);
  const totalPaid = filtered.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.netSalary || p.totalSalary || 0), 0);

  return (
    <PageShell title="Payroll" sub={`${payrolls.length} payroll records`}
      actions={<><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." icon={Search} style={{ width: 200 }} />{isAdmin(user) && <button className="btn-pri" onClick={() => setGenModal(true)}><Zap size={14} />Generate Payroll</button>}</>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[{ label: "Total Records", value: payrolls.length, color: C.accent, icon: FileText }, { label: "Pending Payable", value: `₹${totalPayable.toLocaleString("en-IN")}`, color: C.amber, icon: Clock }, { label: "Total Paid", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: C.green, icon: CheckCircle2 }].map(s => (
          <div key={s.label} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={20} color={s.color} /></div>
            <div><p style={{ fontSize: 11, color: C.t2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{s.label}</p><p style={{ fontSize: 20, fontWeight: 800, color: C.t1 }}>{s.value}</p></div>
          </div>
        ))}
      </div>
      <Table loading={loading} columns={[
        { key: "userId", label: "Employee", render: (v) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.accent }}>{(v?.name || "?")[0]?.toUpperCase()}</div>
            <div><p style={{ fontWeight: 600, fontSize: 13 }}>{v?.name || "—"}</p><p style={{ fontSize: 11, color: C.t2 }}>{v?.department || "—"}</p></div>
          </div>
        )},
        { key: "month", label: "Period", render: (v, row) => <span style={{ color: C.t2 }}>{MONTHS[(v||1)-1]} {row.year}</span> },
        { key: "basicSalary", label: "Basic", render: v => <span style={{ color: C.t1 }}>₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "allowances", label: "Allowances", render: v => <span style={{ color: C.green }}>+₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "deductions", label: "Deductions", render: v => <span style={{ color: C.red }}>-₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "netSalary", label: "Net Pay", render: (v, row) => <span style={{ color: C.accent, fontWeight: 700, fontSize: 14 }}>₹{Number(v || row.totalSalary || 0).toLocaleString("en-IN")}</span> },
        { key: "status", label: "Status", render: v => statusBadge(v || "pending") },
        ...(isAdmin(user) ? [{ key: "_id", label: "Actions", render: (v, row) => row.status !== "paid" ? (
          <button className="btn-success" onClick={() => markPaid(row._id)}><CheckCircle2 size={12} />Mark Paid</button>
        ) : <span style={{ color: C.t3, fontSize: 12 }}>Paid</span> }] : []),
      ]} rows={filtered} emptyText="No payroll records" />
      <Modal open={genModal} onClose={() => setGenModal(false)} title="Generate Payroll">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: C.accentG, border: `1px solid ${C.accent}28`, borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, color: C.t2 }}>This will generate payroll records for all active employees for the selected month.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Month"><select value={month} onChange={e => setMonth(Number(e.target.value))} className="inp">{MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}</select></FormField>
            <FormField label="Year"><Inp value={year} onChange={e => setYear(Number(e.target.value))} type="number" /></FormField>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setGenModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleGenerate} disabled={saving}>{saving ? "Generating..." : "Generate"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── EXPENSES ─────────────────────────────────────────────────────────────────
function ExpensesPage({ addToast, user }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "travel", amount: "", date: new Date().toISOString().split("T")[0], description: "" });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/expenses"); const d = await r.json(); setExpenses(safeArr(d, "expenses", "data")); }
    catch { addToast("Failed to load expenses", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.amount) return addToast("Title and amount required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/expenses", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Expense submitted!", "success"); setModal(false);
      setForm({ title: "", category: "travel", amount: "", date: new Date().toISOString().split("T")[0], description: "" }); load();
    } catch { addToast("Failed to submit", "error"); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    try { await apiFetch(`/expenses/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); addToast(`Expense ${status}`, "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/expenses/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const categories = ["travel", "food", "accommodation", "equipment", "office", "medical", "training", "other"];
  const catColor = c => ({ travel: C.blue, food: C.green, accommodation: C.purple, equipment: C.amber, office: C.accent, medical: C.red, training: C.cyan, other: C.t2 }[c] || C.t2);
  const filtered = expenses.filter(e => !search || e.title?.toLowerCase().includes(search.toLowerCase()) || e.category?.toLowerCase().includes(search.toLowerCase()));
  const totalPending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalApproved = expenses.filter(e => e.status === "approved").reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <PageShell title="Expenses" sub={isAdmin(user) ? "Review and approve expense claims" : "Submit and track your expenses"}
      actions={<><Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." icon={Search} style={{ width: 200 }} /><button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Submit Expense</button></>}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[{ label: "Total Submitted", value: `₹${expenses.reduce((s,e) => s+Number(e.amount||0), 0).toLocaleString("en-IN")}`, color: C.accent, icon: DollarSign }, { label: "Pending", value: `₹${totalPending.toLocaleString("en-IN")}`, color: C.amber, icon: Clock }, { label: "Approved", value: `₹${totalApproved.toLocaleString("en-IN")}`, color: C.green, icon: CheckCircle2 }].map(s => (
          <div key={s.label} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={20} color={s.color} /></div>
            <div><p style={{ fontSize: 11, color: C.t2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{s.label}</p><p style={{ fontSize: 20, fontWeight: 800, color: C.t1 }}>{s.value}</p></div>
          </div>
        ))}
      </div>
      <Table loading={loading} columns={[
        { key: "title", label: "Expense", render: (v, row) => (
          <div><p style={{ fontWeight: 600, fontSize: 13 }}>{v}</p><span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: catColor(row.category) + "22", color: catColor(row.category), fontWeight: 700, textTransform: "uppercase" }}>{row.category}</span></div>
        )},
        { key: "userId", label: "By", render: (v) => <span style={{ color: C.t2 }}>{v?.name || user?.name || "—"}</span> },
        { key: "amount", label: "Amount", render: v => <span style={{ color: C.accent, fontWeight: 700 }}>₹{Number(v||0).toLocaleString("en-IN")}</span> },
        { key: "date", label: "Date", render: v => <span style={{ color: C.t2, fontSize: 12 }}>{v ? new Date(v).toLocaleDateString("en-IN") : "—"}</span> },
        { key: "status", label: "Status", render: v => statusBadge(v || "pending") },
        { key: "_id", label: "Actions", render: (v, row) => (
          <div style={{ display: "flex", gap: 5 }}>
            {isAdmin(user) && row.status === "pending" && <>
              <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.greenG, color: C.green, border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => updateStatus(row._id, "approved")}>Approve</button>
              <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: C.redG, color: C.red, border: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => updateStatus(row._id, "rejected")}>Reject</button>
            </>}
            <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(row._id)}><Trash2 size={12} /></button>
          </div>
        )},
      ]} rows={filtered} emptyText="No expenses found" />
      <Modal open={modal} onClose={() => setModal(false)} title="Submit Expense">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Expense Title"><Inp value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Client meeting lunch" /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Category"><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="inp">{categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></FormField>
            <FormField label="Amount (₹)"><Inp value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 2500" type="number" /></FormField>
          </div>
          <FormField label="Date"><Inp value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" /></FormField>
          <FormField label="Description"><textarea className="inp" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Expense details..." rows={3} style={{ resize: "vertical" }} /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Submitting..." : "Submit"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsPage({ addToast, user }) {
  const [data, setData] = useState({ users: [], attendance: [], payrolls: [], expenses: [], tasks: [], leaves: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [uR, aR, pR, eR, tR, lR] = await Promise.allSettled([
          apiFetch("/users").then(r => r.json()),
          apiFetch("/attendance").then(r => r.json()),
          apiFetch("/payroll").then(r => r.json()),
          apiFetch("/expenses").then(r => r.json()),
          apiFetch("/tasks").then(r => r.json()),
          apiFetch("/leaves").then(r => r.json()),
        ]);
        setData({
          users: safeArr(uR.value, "users", "data"),
          attendance: safeArr(aR.value, "attendance", "records", "data"),
          payrolls: safeArr(pR.value, "payrolls", "data"),
          expenses: safeArr(eR.value, "expenses", "data"),
          tasks: safeArr(tR.value, "tasks", "data"),
          leaves: safeArr(lR.value, "leaves", "data"),
        });
      } catch { addToast("Failed to load reports", "error"); }
      setLoading(false);
    })();
  }, []);

  const monthlyPayroll = MONTHS.slice(0, 6).map((m, i) => ({ month: m.slice(0,3), amount: data.payrolls.filter(p => (p.month-1) === i).reduce((s, p) => s + Number(p.netSalary || p.totalSalary || 0), 0) / 1000 }));
  const deptMap = data.users.reduce((acc, u) => { const d = u.department || "Other"; acc[d] = (acc[d] || 0) + 1; return acc; }, {});
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));
  const attByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const label = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d.getDay() === 0 ? 6 : d.getDay() - 1];
    return { label, present: data.attendance.filter(a => a.date && new Date(a.date).toDateString() === d.toDateString() && ["present","on_time","early"].includes(a.status?.toLowerCase())).length, absent: data.attendance.filter(a => a.date && new Date(a.date).toDateString() === d.toDateString() && a.status?.toLowerCase() === "absent").length };
  });
  const taskStatusData = [
    { name: "Pending", value: data.tasks.filter(t => t.status === "pending").length },
    { name: "In Progress", value: data.tasks.filter(t => t.status === "in_progress").length },
    { name: "Completed", value: data.tasks.filter(t => t.status === "completed").length },
  ].filter(d => d.value > 0);
  const expenseByCategory = data.expenses.reduce((acc, e) => { acc[e.category || "other"] = (acc[e.category || "other"] || 0) + Number(e.amount || 0); return acc; }, {});
  const expenseCatData = Object.entries(expenseByCategory).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const kpis = [
    { label: "Total Employees", value: data.users.length, color: C.accent, icon: Users },
    { label: "Present Today", value: data.attendance.filter(a => a.date && new Date(a.date).toDateString() === new Date().toDateString() && ["present","on_time","early"].includes(a.status?.toLowerCase())).length, color: C.green, icon: CheckCircle2 },
    { label: "Tasks Completed", value: data.tasks.filter(t => t.status === "completed").length, color: C.blue, icon: CheckSquare },
    { label: "Leaves This Month", value: data.leaves.filter(l => { const d = new Date(l.createdAt || l.startDate); return d.getMonth() === new Date().getMonth(); }).length, color: C.amber, icon: Calendar },
  ];

  return (
    <PageShell title="Reports" sub="Organization analytics and insights">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map(k => (
          <div key={k.label} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: k.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}><k.icon size={20} color={k.color} /></div>
            <div><p style={{ fontSize: 11, color: C.t2, marginBottom: 4 }}>{k.label}</p><p style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{loading ? "—" : k.value}</p></div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Monthly Payroll (₹ K)</h2>
          {loading ? <Sk h={160} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyPayroll} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} formatter={v => [`₹${(v*1000).toLocaleString("en-IN")}`, "Payroll"]} />
                <Bar dataKey="amount" name="Payroll" fill={C.accent} radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Attendance (Last 7 Days)</h2>
          {loading ? <Sk h={160} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={attByDay} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="present" name="Present" fill={C.green} radius={[4,4,0,0]} />
                <Bar dataKey="absent" name="Absent" fill={C.red} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Employees by Department</h2>
          {loading ? <Sk h={160} /> : deptData.length === 0 ? <p style={{ color: C.t2, fontSize: 13 }}>No data</p> : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart><Pie data={deptData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>{deptData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {deptData.slice(0,6).map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: CC[i % CC.length] }} /><span style={{ fontSize: 12, color: C.t2 }}>{d.name}</span></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Task Status</h2>
          {loading ? <Sk h={160} /> : taskStatusData.length === 0 ? <p style={{ color: C.t2, fontSize: 13 }}>No task data</p> : (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart><Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>{taskStatusData.map((_, i) => <Cell key={i} fill={[C.amber, C.blue, C.green][i]} />)}</Pie><Tooltip content={<CustomTooltip />} /></PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                {taskStatusData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: [C.amber, C.blue, C.green][i] }} /><span style={{ fontSize: 12, color: C.t2 }}>{d.name}</span></div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {expenseCatData.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={expenseCatData} barSize={24} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.t3, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fill: C.t3, fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip content={<CustomTooltip />} formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Amount"]} />
              <Bar dataKey="value" name="Amount" radius={[0,4,4,0]}>{expenseCatData.map((_, i) => <Cell key={i} fill={CC[i % CC.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </PageShell>
  );
}


// ─── NOTIFICATIONS PAGE (EMPLOYEE) ───────────────────────────────────────────
function NotificationsPage({ addToast, user }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/notifications");
      const d = await r.json();
      setNotifs(safeArr(d, "notifications", "data"));
    } catch { addToast("Failed to load notifications", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markRead = async () => {
    try {
      await apiFetch("/notifications/mark-read", { method: "POST" });
      addToast("All marked as read", "success"); load();
    } catch { addToast("Failed", "error"); }
  };

  const typeIcon  = t => ({ task: ListTodo, leave: FileText, attendance: CalendarCheck, salary: Wallet, system: Bell })[t] || Bell;
  const typeColor = t => ({ task: C.accent, leave: C.amber, attendance: C.green, salary: C.blue, system: C.purple })[t] || C.t2;
  const timeAgo   = ts => { if (!ts) return ""; const s = Math.floor((Date.now() - new Date(ts)) / 1000); if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s/60)}m ago`; if (s < 86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <PageShell title="Notifications" sub="Your alerts and updates"
      actions={unread > 0 && <button className="btn-ghost" onClick={markRead}><CheckCircle2 size={14} />Mark all read</button>}
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array(5).fill(0).map((_,i) => <Sk key={i} h={60} />)}</div>
      ) : notifs.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={28} color={C.accent} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>All caught up!</p>
          <p style={{ fontSize: 13, color: C.t2 }}>No notifications yet</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {notifs.map((n, i) => {
            const Icon  = typeIcon(n.type);
            const color = typeColor(n.type);
            return (
              <div key={n._id || i} style={{ display: "flex", gap: 14, padding: "16px 20px", borderBottom: i < notifs.length - 1 ? `1px solid ${C.border}` : "none", background: n.read ? "transparent" : color + "06", transition: "background .2s" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} color={color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{n.title}</p>
                    {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />}
                  </div>
                  <p style={{ fontSize: 12, color: C.t2, lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: C.t3, marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
function AnnouncementsPage({ addToast, user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal", targetRole: "all" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const r = await apiFetch("/announcements"); const d = await r.json(); setAnnouncements(safeArr(d, "announcements", "data")); }
    catch { addToast("Failed to load announcements", "error"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.content) return addToast("Title and content required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/announcements", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Announcement posted!", "success"); setModal(false);
      setForm({ title: "", content: "", priority: "normal", targetRole: "all" }); load();
    } catch { addToast("Failed to post", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    try { await apiFetch(`/announcements/${id}`, { method: "DELETE" }); addToast("Deleted", "success"); load(); }
    catch { addToast("Failed", "error"); }
  };

  const priorityColor = p => p === "urgent" ? C.red : p === "high" ? C.amber : p === "normal" ? C.accent : C.t2;
  const priorityBg = p => p === "urgent" ? C.redG : p === "high" ? C.amberG : p === "normal" ? C.accentG : "rgba(255,255,255,0.04)";

  return (
    <PageShell title="Announcements" sub="Company-wide communications"
      actions={isAdmin(user) ? <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Post Announcement</button> : null}
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{Array(4).fill(0).map((_, i) => <Sk key={i} h={120} />)}</div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <Bell size={32} color={C.t3} style={{ marginBottom: 12 }} />
          <p style={{ color: C.t2, fontSize: 14 }}>No announcements yet</p>
          {isAdmin(user) && <button className="btn-pri" style={{ marginTop: 16 }} onClick={() => setModal(true)}><Plus size={14} />Create First Announcement</button>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {announcements.map((ann, i) => (
            <div key={ann._id || i} className="card" style={{ padding: 22, borderLeft: `4px solid ${priorityColor(ann.priority)}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: priorityBg(ann.priority), color: priorityColor(ann.priority), textTransform: "uppercase" }}>{ann.priority || "normal"}</span>
                    {ann.targetRole && ann.targetRole !== "all" && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: C.blueG, color: C.blue, textTransform: "uppercase" }}>{ann.targetRole}</span>}
                    <span style={{ fontSize: 11, color: C.t3 }}>{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recently"}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 8 }}>{ann.title}</h3>
                  <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.7 }}>{ann.content}</p>
                  {ann.createdBy && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.accent }}>{(ann.createdBy?.name || ann.createdBy)?.[0]?.toUpperCase()}</div>
                      <span style={{ fontSize: 12, color: C.t3 }}>Posted by {ann.createdBy?.name || ann.createdBy || "Admin"}</span>
                    </div>
                  )}
                </div>
                {isAdmin(user) && <button className="btn-icon" style={{ background: C.redG, color: C.red, flexShrink: 0 }} onClick={() => handleDelete(ann._id)}><Trash2 size={12} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Post Announcement" width={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Title"><Inp value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title..." /></FormField>
          <FormField label="Content"><textarea className="inp" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your announcement here..." rows={5} style={{ resize: "vertical" }} /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Priority"><select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="inp"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></FormField>
            <FormField label="Target"><select value={form.targetRole} onChange={e => setForm(p => ({ ...p, targetRole: e.target.value }))} className="inp"><option value="all">All Employees</option><option value="admin">Admins Only</option><option value="employee">Employees Only</option></select></FormField>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Posting..." : "Post Announcement"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields");
    setLoading(true); setError("");
    try {
      const r = await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Invalid credentials");
      localStorage.setItem("ems_token", d.token || d.accessToken || "");
      localStorage.setItem("ems_user", JSON.stringify(d.user || { name: "Admin", email: form.email }));
      onLogin(d.user || { name: "Admin", email: form.email });
    } catch (e) { setError(e.message || "Login failed"); }
    setLoading(false);
  };

  const handleForgot = async () => {
    if (!forgotEmail) return;
    try { await fetch(`${API}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: forgotEmail }) }); setForgotSent(true); } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: `radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(168,85,247,0.1) 0%, transparent 55%), ${C.bg}` }}>
      <div className="fadeUp" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 8px 32px rgba(99,102,241,0.5)` }}>
            <Building2 size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.t1, letterSpacing: "-.02em", marginBottom: 6 }}>Nexus Portal</h1>
          <p style={{ fontSize: 13, color: C.t2 }}>Sign in to your workspace</p>
        </div>

        {!showForgot ? (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 22, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            {error && <div style={{ background: C.redG, border: `1px solid ${C.red}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={14} />{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormField label="Email address"><Inp value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@nexus.com" type="email" /></FormField>
              <FormField label="Password"><Inp value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" type="password" /></FormField>
              <div style={{ textAlign: "right" }}>
                <button onClick={() => setShowForgot(true)} style={{ background: "none", border: "none", color: C.accent, fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Forgot password?</button>
              </div>
              <button onClick={handleLogin} disabled={loading}
                style={{ width: "100%", padding: "13px", borderRadius: 12, background: `linear-gradient(135deg,${C.accent},${C.accentD})`, color: "#fff", fontSize: 14, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1, boxShadow: `0 4px 20px rgba(99,102,241,0.45)`, transition: "all .18s" }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
              >{loading ? "Signing in…" : "Sign In"}</button>
            </div>
          </div>
        ) : (
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 22, padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
            <button onClick={() => setShowForgot(false)} style={{ background: "none", border: "none", color: C.t2, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 16 }}><ChevronLeft size={14} />Back to login</button>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.t1, marginBottom: 6 }}>Reset Password</h3>
            <p style={{ fontSize: 13, color: C.t2, marginBottom: 20 }}>Enter your email and we'll send you a reset link.</p>
            {forgotSent ? (
              <div style={{ background: C.greenG, border: `1px solid ${C.green}33`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.green }}>Reset link sent! Check your email.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FormField label="Email address"><Inp value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" type="email" /></FormField>
                <button onClick={handleForgot} className="btn-pri" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>Send Reset Link</button>
              </div>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 11, color: C.t3, marginTop: 24, lineHeight: 1.6 }}>
          © 2026 Nexus Enterprises Exporters Private Limited.<br />
          All Rights Reserved. Powered by <span style={{ color: C.accent, fontWeight: 600 }}>Nexus TZ</span>
        </p>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  injectCSS();
  const [user, setUser]           = useState(() => { try { return JSON.parse(localStorage.getItem("ems_user")); } catch { return null; } });
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("nx_sidebar") === "1");
  const [globalSearch, setGlobalSearch] = useState("");
  const [clock, setClock]          = useState("");
  const [toasts, setToasts]        = useState([]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now(); setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const handleLogin  = u => setUser(u);
  const handleLogout = () => { localStorage.removeItem("ems_token"); localStorage.removeItem("ems_user"); setUser(null); };

  useSessionTimeout(user, handleLogout);

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const props = { addToast, user, setPage: setActivePage, globalSearch };

  const ADMIN_PAGES = {
    dashboard:     <DashboardPage     {...props} />,
    employees:     <EmployeesPage     {...props} />,
    departments:   <DepartmentsPage   {...props} />,
    roles:         <RolesPage         {...props} />,
    organization:  <OrganizationPage  {...props} />,
    attendance:    <AttendancePage    {...props} />,
    leaves:        <LeavesPage        {...props} />,
    holidays:      <HolidaysPage      {...props} />,
    shifts:        <ShiftsPage        {...props} />,
    tasks:         <TasksPage         {...props} />,
    worklogs:      <WorklogsPage      {...props} />,
    projects:      <ProjectsPage      {...props} />,
    timesheet:     <TimesheetPage     {...props} />,
    payroll:       <PayrollPage       {...props} />,
    salary:        <SalaryPage        {...props} />,
    expenses:      <ExpensesPage      {...props} />,
    reports:       <ReportsPage       {...props} />,
    buyers:        <BuyersPage        {...props} />,
    orders:        <OrdersPage        {...props} />,
    analytics:     <AnalyticsPage     {...props} />,
    company:       <CompanyPage       {...props} />,
    audit:         <AuditPage         {...props} />,
    profile:       <ProfilePage       {...props} />,
    announcements: <AnnouncementsPage {...props} />,
    notifications: <NotificationsPage {...props} />,
    tools:         <ToolsPage />,
    chat:          <ChatPage user={{ id: user?._id || user?.id, name: user?.name, role: user?.role }} socket={null} onlineUsers={[]} />,
  };

  const EMP_PAGES = {
    dashboard:     <DashboardPage     {...props} />,
    attendance:    <AttendancePage    {...props} />,
    leaves:        <LeavesPage        {...props} />,
    worklogs:      <WorklogsPage      {...props} />,
    tasks:         <TasksPage         {...props} />,
    projects:      <ProjectsPage      {...props} />,
    timesheet:     <TimesheetPage     {...props} />,
    salary:        <SalaryPage        {...props} />,
    expenses:      <ExpensesPage      {...props} />,
    announcements: <AnnouncementsPage {...props} />,
    profile:       <ProfilePage       {...props} />,
    notifications: <NotificationsPage {...props} />,
    tools:         <ToolsPage />,
    chat:          <ChatPage user={{ id: user?._id || user?.id, name: user?.name, role: user?.role }} socket={null} onlineUsers={[]} />,
  };

  const PAGES       = isAdmin(user) ? ADMIN_PAGES : EMP_PAGES;
  const currentPage = PAGES[activePage] || PAGES.dashboard;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: C.bg }}>
      <Sidebar active={activePage} setActive={p => { setActivePage(p); if (window.innerWidth < 768) setCollapsed(true); }} onLogout={handleLogout} user={user} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar clock={clock} user={user} onNavigate={setActivePage} onToggleSidebar={() => setCollapsed(p => { const next = !p; localStorage.setItem("nx_sidebar", next ? "1" : "0"); return next; })} />
        <div style={{ flex: 1, overflow: "hidden" }}>
          {currentPage}
        </div>
      </div>
      <Toast toasts={toasts} />
    </div>
  );
}
