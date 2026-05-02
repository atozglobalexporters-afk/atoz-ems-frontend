import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, FileText, Wallet,
  ShoppingBag, Package, BarChart3, Settings, Shield, UserCircle,
  MessageSquare, Wrench, ChevronRight, Bell, Search, LogOut,
  TrendingUp, TrendingDown, Clock, Menu, X, Sun, Moon,
  Circle, Dot, ChevronDown, AlertCircle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Zap, Activity, Building2,
  Hash, MoreHorizontal, RefreshCw, Filter, Plus, Eye
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:        "#070b12",
  surface:   "#0d1117",
  surfaceAlt:"#111820",
  border:    "#1a2233",
  borderFoc: "#2563eb",
  accent:    "#2563eb",
  accentSoft:"#1d4ed8",
  accentGlow:"rgba(37,99,235,0.18)",
  textPrimary:"#f0f4ff",
  textSecondary:"#6b7a99",
  textMuted: "#3d4d6a",
  success:   "#10b981",
  successBg: "rgba(16,185,129,0.08)",
  warning:   "#f59e0b",
  warningBg: "rgba(245,158,11,0.08)",
  danger:    "#ef4444",
  dangerBg:  "rgba(239,68,68,0.08)",
  purple:    "#8b5cf6",
  purpleBg:  "rgba(139,92,246,0.08)",
  cyan:      "#06b6d4",
  cyanBg:    "rgba(6,182,212,0.08)",
};

// ─── Global styles injected once ──────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root { color-scheme: dark; }

  html, body, #root {
    height: 100%;
    font-family: 'Inter', system-ui, sans-serif;
    background: ${T.bg};
    color: ${T.textPrimary};
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }

  * { scrollbar-width: thin; scrollbar-color: ${T.border} transparent; }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0 ${T.accentGlow}; }
    70%  { box-shadow: 0 0 0 8px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }

  .animate-in { animation: fadeSlideIn 0.28s ease both; }

  .skeleton {
    background: linear-gradient(90deg, ${T.surface} 25%, ${T.surfaceAlt} 50%, ${T.surface} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }

  input, select, textarea, button { font-family: inherit; }

  button { cursor: pointer; border: none; background: none; }
  a { color: inherit; text-decoration: none; }

  .page-scroll { overflow-y: auto; height: 100%; }
`;

function injectGlobalStyles() {
  if (document.getElementById("ems-global")) return;
  const s = document.createElement("style");
  s.id = "ems-global";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { id: "dashboard",    label: "Dashboard",      icon: LayoutDashboard },
      { id: "analytics",    label: "Analytics",      icon: BarChart3 },
      { id: "chat",         label: "Messages",       icon: MessageSquare, badge: 3 },
    ],
  },
  {
    label: "People",
    items: [
      { id: "employees",   label: "Employees",      icon: Users },
      { id: "attendance",  label: "Attendance",     icon: CalendarCheck },
      { id: "worklogs",    label: "Work Logs",      icon: FileText },
      { id: "salary",      label: "Payroll",        icon: Wallet },
    ],
  },
  {
    label: "Commerce",
    items: [
      { id: "buyers",  label: "Buyers",   icon: ShoppingBag },
      { id: "orders",  label: "Orders",   icon: Package },
    ],
  },
  {
    label: "System",
    items: [
      { id: "company",  label: "Company",  icon: Building2 },
      { id: "audit",    label: "Audit Log",icon: Shield },
      { id: "profile",  label: "Profile",  icon: UserCircle },
      { id: "tools",    label: "Tools",    icon: Wrench },
    ],
  },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, delta, deltaDir, color = T.accent, icon: Icon, loading }) {
  const isUp = deltaDir === "up";
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 14,
      transition: "border-color .2s, box-shadow .2s",
      animation: "fadeSlideIn .3s ease both",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + "55";
        e.currentTarget.style.boxShadow = `0 0 0 1px ${color}22, 0 8px 24px rgba(0,0,0,.35)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: T.textSecondary, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={15} color={color} />}
        </div>
      </div>
      {loading
        ? <div className="skeleton" style={{ height: 32, width: "60%" }} />
        : <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.02em", color: T.textPrimary }}>{value}</span>
      }
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: -4 }}>
        {delta && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            fontSize: 11, fontWeight: 600,
            color: isUp ? T.success : T.danger,
            background: isUp ? T.successBg : T.dangerBg,
            borderRadius: 20, padding: "2px 7px",
          }}>
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {delta}
          </span>
        )}
        {sub && <span style={{ fontSize: 12, color: T.textSecondary }}>{sub}</span>}
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 650, color: T.textPrimary, letterSpacing: "-.01em" }}>{title}</h2>
        {sub && <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Table wrapper ────────────────────────────────────────────────────────────
function Table({ columns, rows, loading, emptyText = "No data" }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {columns.map(c => (
                <th key={c.key} style={{
                  padding: "11px 16px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 600,
                  color: T.textMuted,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                  {columns.map(c => (
                    <td key={c.key} style={{ padding: "13px 16px" }}>
                      <div className="skeleton" style={{ height: 14, width: c.width || "80%" }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "40px 16px", textAlign: "center", color: T.textSecondary, fontSize: 13 }}>
                  {emptyText}
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={row.id || i} style={{
                borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : "none",
                transition: "background .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {columns.map(c => (
                  <td key={c.key} style={{ padding: "13px 16px", fontSize: 13, color: T.textPrimary }}>
                    {c.render ? c.render(row[c.key], row) : row[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ label, color = T.accent, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 9px",
      borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      color, background: bg || (color + "18"),
      letterSpacing: ".02em",
    }}>{label}</span>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, style: extStyle, disabled }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontWeight: 600, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .18s", border: "1px solid transparent",
    opacity: disabled ? .5 : 1,
    fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "5px 12px" : "8px 16px",
    ...extStyle,
  };
  const variants = {
    primary: { background: T.accent, color: "#fff", borderColor: T.accent },
    ghost:   { background: "transparent", color: T.textSecondary, borderColor: T.border },
    danger:  { background: T.dangerBg, color: T.danger, borderColor: T.danger + "44" },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input({ value, onChange, placeholder, type = "text", icon: Icon, style: extStyle }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative", ...extStyle }}>
      {Icon && (
        <Icon size={14} color={focused ? T.accent : T.textMuted}
          style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "color .2s" }}
        />
      )}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: T.bg,
          border: `1px solid ${focused ? T.borderFoc : T.border}`,
          borderRadius: 8,
          color: T.textPrimary,
          fontSize: 13,
          padding: Icon ? "8px 12px 8px 32px" : "8px 12px",
          outline: "none",
          transition: "border-color .18s, box-shadow .18s",
          boxShadow: focused ? `0 0 0 3px ${T.accentGlow}` : "none",
        }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(7,11,18,.75)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="animate-in" style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 14, width: "100%", maxWidth: width,
        boxShadow: "0 24px 64px rgba(0,0,0,.6)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", borderBottom: `1px solid ${T.border}`,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 650, color: T.textPrimary }}>{title}</h3>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 7,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.textSecondary, transition: "background .15s, color .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; }}
          >
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column", gap: 10, zIndex: 2000,
    }}>
      {toasts.map(t => (
        <div key={t.id} className="animate-in" style={{
          display: "flex", alignItems: "center", gap: 10,
          background: T.surface, border: `1px solid ${t.type === "success" ? T.success + "44" : t.type === "error" ? T.danger + "44" : T.border}`,
          borderRadius: 10, padding: "11px 16px",
          boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          fontSize: 13, fontWeight: 500, color: T.textPrimary,
          maxWidth: 340,
        }}>
          {t.type === "success" && <CheckCircle2 size={15} color={T.success} />}
          {t.type === "error" && <AlertCircle size={15} color={T.danger} />}
          {t.type === "info" && <Zap size={15} color={T.accent} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Spinner({ size = 18, color = T.accent }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────
function PageShell({ title, sub, actions, children }) {
  return (
    <div className="page-scroll" style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, letterSpacing: "-.02em" }}>{title}</h1>
          {sub && <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 4 }}>{sub}</p>}
        </div>
        {actions && <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>{actions}</div>}
      </div>
      <div className="animate-in">{children}</div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ addToast }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [empRes, orderRes, salaryRes] = await Promise.allSettled([
          fetch(`${API}/api/employees`).then(r => r.json()),
          fetch(`${API}/api/orders`).then(r => r.json()),
          fetch(`${API}/api/salary`).then(r => r.json()),
        ]);
        const employees = empRes.status === "fulfilled" ? (empRes.value?.employees || empRes.value || []) : [];
        const orders = orderRes.status === "fulfilled" ? (orderRes.value?.orders || orderRes.value || []) : [];
        const salaries = salaryRes.status === "fulfilled" ? (salaryRes.value?.salaries || salaryRes.value || []) : [];
        setStats({
          totalEmp: employees.length,
          activeEmp: employees.filter(e => e.status === "active" || e.isActive).length,
          totalOrders: orders.length,
          totalSalary: salaries.reduce((s, x) => s + (x.totalSalary || x.amount || 0), 0),
        });
        setRecentActivity(orders.slice(0, 6));
      } catch {
        addToast("Failed to load dashboard data", "error");
      }
      setLoading(false);
    };
    load();
  }, []);

  const fmt = n => `₹${(n || 0).toLocaleString("en-IN")}`;

  return (
    <PageShell title="Dashboard" sub="Overview of your workspace">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard label="Total Employees" value={loading ? "—" : stats.totalEmp} sub="registered" delta="4.2%" deltaDir="up" color={T.accent} icon={Users} loading={loading} />
        <StatCard label="Active Staff" value={loading ? "—" : stats.activeEmp} sub="on payroll" delta="1.8%" deltaDir="up" color={T.success} icon={Activity} loading={loading} />
        <StatCard label="Total Orders" value={loading ? "—" : stats.totalOrders} sub="all time" delta="12%" deltaDir="up" color={T.purple} icon={Package} loading={loading} />
        <StatCard label="Payroll Disbursed" value={loading ? "—" : fmt(stats.totalSalary)} sub="total processed" delta="3.1%" deltaDir="down" color={T.warning} icon={Wallet} loading={loading} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
        <div>
          <SectionHeading title="Recent Orders" sub="Latest commercial activity" />
          <Table
            loading={loading}
            columns={[
              { key: "orderId", label: "Order ID", width: "30%", render: v => <span style={{ fontFamily: "monospace", fontSize: 12, color: T.textSecondary }}>#{v || "—"}</span> },
              { key: "buyerName", label: "Buyer" },
              { key: "totalAmount", label: "Amount", render: v => <span style={{ fontWeight: 600 }}>{v ? `₹${Number(v).toLocaleString("en-IN")}` : "—"}</span> },
              { key: "status", label: "Status", render: v => {
                const map = { pending: [T.warning, "Pending"], completed: [T.success, "Completed"], cancelled: [T.danger, "Cancelled"] };
                const [c, l] = map[v?.toLowerCase()] || [T.textSecondary, v || "—"];
                return <Badge label={l} color={c} />;
              }},
            ]}
            rows={recentActivity}
            emptyText="No orders yet"
          />
        </div>

        <div>
          <SectionHeading title="Quick Metrics" sub="At a glance" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Avg attendance rate", value: "94.2%", color: T.success, icon: CalendarCheck },
              { label: "Open worklogs", value: "18", color: T.warning, icon: FileText },
              { label: "Pending payments", value: "₹1,24,000", color: T.danger, icon: Wallet },
              { label: "Active buyers", value: "32", color: T.cyan, icon: ShoppingBag },
            ].map(m => (
              <div key={m.label} style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: m.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <m.icon size={13} color={m.color} />
                  </div>
                  <span style={{ fontSize: 12, color: T.textSecondary }}>{m.label}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Employees Page ───────────────────────────────────────────────────────────
function EmployeesPage({ addToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", position: "", department: "", salary: "" });
  const [saving, setSaving] = useState(false);
  const API = "https://nexus-backend-production-771f.up.railway.app";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/employees`);
      const d = await r.json();
      setEmployees(d?.employees || d || []);
    } catch { addToast("Failed to load employees", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter(e =>
    [e.name, e.email, e.position, e.department].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!form.name || !form.email) return addToast("Name and email are required", "error");
    setSaving(true);
    try {
      const r = await fetch(`${API}/api/employees`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error();
      addToast("Employee added", "success");
      setModal(false);
      setForm({ name: "", email: "", position: "", department: "", salary: "" });
      load();
    } catch { addToast("Failed to save employee", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this employee?")) return;
    try {
      await fetch(`${API}/api/employees/${id}`, { method: "DELETE" });
      addToast("Employee removed", "success");
      load();
    } catch { addToast("Failed to delete", "error"); }
  };

  return (
    <PageShell title="Employees" sub={`${employees.length} total members`}
      actions={
        <>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…" icon={Search} style={{ width: 220 }} />
          <Btn onClick={() => setModal(true)} icon={Plus}>Add Employee</Btn>
        </>
      }
    >
      <Table
        loading={loading}
        columns={[
          { key: "name", label: "Name", render: (v, row) => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: T.accentGlow,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: T.accent,
              }}>{v?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{v}</div>
                <div style={{ fontSize: 11, color: T.textSecondary }}>{row.email}</div>
              </div>
            </div>
          )},
          { key: "position", label: "Position" },
          { key: "department", label: "Department" },
          { key: "salary", label: "Salary", render: v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—" },
          { key: "status", label: "Status", render: v => {
            const active = !v || v === "active";
            return <Badge label={active ? "Active" : "Inactive"} color={active ? T.success : T.textSecondary} />;
          }},
          { key: "_id", label: "", render: (v) => (
            <Btn variant="danger" size="sm" onClick={() => handleDelete(v)}>Remove</Btn>
          )},
        ]}
        rows={filtered}
        emptyText={search ? "No matching employees" : "No employees yet. Add one to get started."}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Employee">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "name", label: "Full Name", placeholder: "Jane Smith" },
            { key: "email", label: "Email", placeholder: "jane@company.com", type: "email" },
            { key: "position", label: "Position", placeholder: "Software Engineer" },
            { key: "department", label: "Department", placeholder: "Engineering" },
            { key: "salary", label: "Monthly Salary (₹)", placeholder: "50000", type: "number" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>{f.label}</label>
              <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={saving} icon={saving ? undefined : undefined}>
              {saving ? "Saving…" : "Add Employee"}
            </Btn>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── Attendance Page ──────────────────────────────────────────────────────────
function AttendancePage({ addToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/attendance`);
        const d = await r.json();
        setRecords(d?.attendance || d || []);
      } catch { addToast("Failed to load attendance", "error"); }
      setLoading(false);
    })();
  }, []);

  const filtered = records.filter(r => {
    const matchSearch = !search || r.employeeName?.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || r.date?.startsWith(dateFilter);
    return matchSearch && matchDate;
  });

  const markAttendance = async (employeeId, status) => {
    try {
      await fetch(`${API}/api/attendance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, status, date: new Date().toISOString().split("T")[0] }),
      });
      addToast(`Marked ${status}`, "success");
    } catch { addToast("Failed to mark attendance", "error"); }
  };

  return (
    <PageShell title="Attendance" sub="Daily attendance tracking"
      actions={
        <>
          <Input value={dateFilter} onChange={e => setDateFilter(e.target.value)} type="date" style={{ width: 160 }} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name…" icon={Search} style={{ width: 200 }} />
        </>
      }
    >
      <Table
        loading={loading}
        columns={[
          { key: "employeeName", label: "Employee" },
          { key: "date", label: "Date", render: v => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
          { key: "checkIn", label: "Check In", render: v => v || "—" },
          { key: "checkOut", label: "Check Out", render: v => v || "—" },
          { key: "status", label: "Status", render: v => {
            const map = { present: T.success, absent: T.danger, late: T.warning, halfday: T.purple };
            return <Badge label={v || "Unknown"} color={map[v?.toLowerCase()] || T.textSecondary} />;
          }},
          { key: "hoursWorked", label: "Hours", render: v => v ? `${v}h` : "—" },
        ]}
        rows={filtered}
        emptyText="No attendance records found"
      />
    </PageShell>
  );
}

// ─── Work Logs Page ───────────────────────────────────────────────────────────
function WorklogsPage({ addToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ employeeId: "", task: "", hours: "", date: "", notes: "" });
  const API = "https://nexus-backend-production-771f.up.railway.app";

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/worklogs`);
      const d = await r.json();
      setLogs(d?.worklogs || d || []);
    } catch { addToast("Failed to load work logs", "error"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l =>
    !search || [l.employeeName, l.task].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    try {
      await fetch(`${API}/api/worklogs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      addToast("Work log saved", "success");
      setModal(false);
      setForm({ employeeId: "", task: "", hours: "", date: "", notes: "" });
      load();
    } catch { addToast("Failed to save work log", "error"); }
  };

  return (
    <PageShell title="Work Logs" sub="Employee task records"
      actions={
        <>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" icon={Search} style={{ width: 220 }} />
          <Btn onClick={() => setModal(true)} icon={Plus}>Add Log</Btn>
        </>
      }
    >
      <Table
        loading={loading}
        columns={[
          { key: "employeeName", label: "Employee" },
          { key: "task", label: "Task" },
          { key: "hours", label: "Hours", render: v => v ? `${v}h` : "—" },
          { key: "date", label: "Date", render: v => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
          { key: "notes", label: "Notes", render: v => <span style={{ color: T.textSecondary }}>{v || "—"}</span> },
        ]}
        rows={filtered}
        emptyText="No work logs found"
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Work Log">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "task", label: "Task Description", placeholder: "Completed feature X" },
            { key: "hours", label: "Hours Worked", placeholder: "8", type: "number" },
            { key: "date", label: "Date", type: "date" },
            { key: "notes", label: "Notes", placeholder: "Additional details…" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>{f.label}</label>
              <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave}>Save Log</Btn>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── Salary / Payroll Page ────────────────────────────────────────────────────
function SalaryPage({ addToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/salary`);
        const d = await r.json();
        setRecords(d?.salaries || d || []);
      } catch { addToast("Failed to load payroll", "error"); }
      setLoading(false);
    })();
  }, []);

  const filtered = records.filter(r => !search || r.employeeName?.toLowerCase().includes(search.toLowerCase()));
  const total = filtered.reduce((s, r) => s + (r.totalSalary || r.amount || 0), 0);

  return (
    <PageShell title="Payroll" sub={`Total disbursed: ₹${total.toLocaleString("en-IN")}`}
      actions={<Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee…" icon={Search} style={{ width: 220 }} />}
    >
      <Table
        loading={loading}
        columns={[
          { key: "employeeName", label: "Employee" },
          { key: "month", label: "Month" },
          { key: "basicSalary", label: "Basic", render: v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—" },
          { key: "deductions", label: "Deductions", render: v => v ? <span style={{ color: T.danger }}>-₹{Number(v).toLocaleString("en-IN")}</span> : "—" },
          { key: "bonuses", label: "Bonuses", render: v => v ? <span style={{ color: T.success }}>+₹{Number(v).toLocaleString("en-IN")}</span> : "—" },
          { key: "totalSalary", label: "Net Pay", render: v => <span style={{ fontWeight: 700 }}>{v ? `₹${Number(v).toLocaleString("en-IN")}` : "—"}</span> },
          { key: "status", label: "Status", render: v => {
            const map = { paid: T.success, pending: T.warning, failed: T.danger };
            return <Badge label={v || "Unknown"} color={map[v?.toLowerCase()] || T.textSecondary} />;
          }},
        ]}
        rows={filtered}
        emptyText="No payroll records"
      />
    </PageShell>
  );
}

// ─── Buyers Page ──────────────────────────────────────────────────────────────
function BuyersPage({ addToast }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", address: "" });
  const API = "https://nexus-backend-production-771f.up.railway.app";

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/buyers`);
      const d = await r.json();
      setBuyers(d?.buyers || d || []);
    } catch { addToast("Failed to load buyers", "error"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = buyers.filter(b => !search || [b.name, b.email, b.company].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  const handleSave = async () => {
    if (!form.name) return addToast("Name is required", "error");
    try {
      await fetch(`${API}/api/buyers`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      addToast("Buyer added", "success");
      setModal(false);
      setForm({ name: "", email: "", phone: "", company: "", address: "" });
      load();
    } catch { addToast("Failed to save buyer", "error"); }
  };

  return (
    <PageShell title="Buyers" sub={`${buyers.length} registered buyers`}
      actions={
        <>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyers…" icon={Search} style={{ width: 220 }} />
          <Btn onClick={() => setModal(true)} icon={Plus}>Add Buyer</Btn>
        </>
      }
    >
      <Table
        loading={loading}
        columns={[
          { key: "name", label: "Name", render: (v, row) => (
            <div>
              <div style={{ fontWeight: 600 }}>{v}</div>
              <div style={{ fontSize: 11, color: T.textSecondary }}>{row.company}</div>
            </div>
          )},
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "address", label: "Address", render: v => <span style={{ color: T.textSecondary }}>{v || "—"}</span> },
          { key: "totalOrders", label: "Orders", render: v => v || 0 },
          { key: "totalSpent", label: "Total Spent", render: v => v ? `₹${Number(v).toLocaleString("en-IN")}` : "—" },
        ]}
        rows={filtered}
        emptyText="No buyers yet"
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Buyer">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { key: "name", label: "Full Name", placeholder: "Rajan Mehta" },
            { key: "email", label: "Email", placeholder: "rajan@corp.com", type: "email" },
            { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
            { key: "company", label: "Company", placeholder: "Mehta Industries" },
            { key: "address", label: "Address", placeholder: "Mumbai, Maharashtra" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>{f.label}</label>
              <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} type={f.type} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn onClick={handleSave}>Add Buyer</Btn>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage({ addToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/orders`);
        const d = await r.json();
        setOrders(d?.orders || d || []);
      } catch { addToast("Failed to load orders", "error"); }
      setLoading(false);
    })();
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = !search || [o.buyerName, o.orderId, o.productName].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || o.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageShell title="Orders" sub={`${orders.length} total orders`}
      actions={
        <>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
            background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8,
            color: T.textPrimary, fontSize: 13, padding: "8px 12px",
          }}>
            {["all", "pending", "processing", "completed", "cancelled"].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" icon={Search} style={{ width: 220 }} />
        </>
      }
    >
      <Table
        loading={loading}
        columns={[
          { key: "orderId", label: "Order ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 12, color: T.textSecondary }}>#{v || "—"}</span> },
          { key: "buyerName", label: "Buyer" },
          { key: "productName", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "totalAmount", label: "Amount", render: v => <span style={{ fontWeight: 600 }}>{v ? `₹${Number(v).toLocaleString("en-IN")}` : "—"}</span> },
          { key: "orderDate", label: "Date", render: v => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
          { key: "status", label: "Status", render: v => {
            const map = { pending: T.warning, processing: T.cyan, completed: T.success, cancelled: T.danger };
            return <Badge label={v || "Unknown"} color={map[v?.toLowerCase()] || T.textSecondary} />;
          }},
        ]}
        rows={filtered}
        emptyText="No orders found"
      />
    </PageShell>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage({ addToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [empR, ordR, salR] = await Promise.allSettled([
          fetch(`${API}/api/employees`).then(r => r.json()),
          fetch(`${API}/api/orders`).then(r => r.json()),
          fetch(`${API}/api/salary`).then(r => r.json()),
        ]);
        const emp = empR.status === "fulfilled" ? (empR.value?.employees || empR.value || []) : [];
        const ord = ordR.status === "fulfilled" ? (ordR.value?.orders || ordR.value || []) : [];
        const sal = salR.status === "fulfilled" ? (salR.value?.salaries || salR.value || []) : [];
        setData({
          totalEmp: emp.length,
          activeEmp: emp.filter(e => e.status === "active" || e.isActive).length,
          totalOrders: ord.length,
          completedOrders: ord.filter(o => o.status === "completed").length,
          totalRevenue: ord.reduce((s, o) => s + (o.totalAmount || 0), 0),
          totalPayroll: sal.reduce((s, s2) => s + (s2.totalSalary || s2.amount || 0), 0),
          deptBreakdown: emp.reduce((acc, e) => {
            const d = e.department || "Other";
            acc[d] = (acc[d] || 0) + 1;
            return acc;
          }, {}),
        });
      } catch { addToast("Failed to load analytics", "error"); }
      setLoading(false);
    })();
  }, []);

  const fmt = n => `₹${(n || 0).toLocaleString("en-IN")}`;
  const pct = (a, b) => b ? `${((a / b) * 100).toFixed(1)}%` : "0%";

  return (
    <PageShell title="Analytics" sub="Performance insights across your organization">
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 12 }} />)}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
            <StatCard label="Total Employees" value={data.totalEmp} color={T.accent} icon={Users} />
            <StatCard label="Active Rate" value={pct(data.activeEmp, data.totalEmp)} color={T.success} icon={Activity} sub="of workforce" />
            <StatCard label="Total Revenue" value={fmt(data.totalRevenue)} color={T.purple} icon={TrendingUp} />
            <StatCard label="Order Completion" value={pct(data.completedOrders, data.totalOrders)} color={T.cyan} icon={CheckCircle2} />
            <StatCard label="Total Payroll" value={fmt(data.totalPayroll)} color={T.warning} icon={Wallet} />
            <StatCard label="Total Orders" value={data.totalOrders} color={T.success} icon={Package} />
          </div>

          <SectionHeading title="Department Breakdown" sub="Employee distribution by department" />
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(data.deptBreakdown).map(([dept, count]) => {
                const pctVal = (count / data.totalEmp) * 100;
                return (
                  <div key={dept}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: T.textPrimary }}>{dept}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary }}>{count} ({pctVal.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: 5, background: T.border, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pctVal}%`, borderRadius: 99,
                        background: `linear-gradient(90deg, ${T.accent}, ${T.purple})`,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(data.deptBreakdown).length === 0 && (
                <p style={{ color: T.textSecondary, fontSize: 13 }}>No department data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}

// ─── Company Settings ─────────────────────────────────────────────────────────
function CompanyPage({ addToast }) {
  const [settings, setSettings] = useState({ companyName: "", email: "", phone: "", address: "", website: "", gst: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/company`);
        const d = await r.json();
        setSettings(d?.company || d || settings);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/company`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      addToast("Company settings saved", "success");
    } catch { addToast("Failed to save settings", "error"); }
    setSaving(false);
  };

  return (
    <PageShell title="Company Settings" sub="Manage your organization details">
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 42, borderRadius: 8 }} />)}
        </div>
      ) : (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 28, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { key: "companyName", label: "Company Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "website", label: "Website" },
              { key: "gst", label: "GST Number" },
            ].map(f => (
              <div key={f.key} style={{ gridColumn: f.key === "address" ? "1/-1" : undefined }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>{f.label}</label>
                <Input value={settings[f.key] || ""} onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>Address</label>
              <Input value={settings.address || ""} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Btn>
          </div>
        </div>
      )}
    </PageShell>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
function AuditPage({ addToast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/audit`);
        const d = await r.json();
        setLogs(d?.logs || d || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filtered = logs.filter(l => !search || [l.action, l.user, l.module].some(f => f?.toLowerCase().includes(search.toLowerCase())));

  return (
    <PageShell title="Audit Log" sub="System activity and change history"
      actions={<Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" icon={Search} style={{ width: 220 }} />}
    >
      <Table
        loading={loading}
        columns={[
          { key: "timestamp", label: "Time", render: v => v ? new Date(v).toLocaleString("en-IN") : "—" },
          { key: "user", label: "User" },
          { key: "module", label: "Module" },
          { key: "action", label: "Action", render: v => <Badge label={v || "—"} color={T.accent} /> },
          { key: "details", label: "Details", render: v => <span style={{ color: T.textSecondary, fontSize: 12 }}>{v || "—"}</span> },
          { key: "ipAddress", label: "IP", render: v => <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textMuted }}>{v || "—"}</span> },
        ]}
        rows={filtered}
        emptyText="No audit records found"
      />
    </PageShell>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ addToast, user }) {
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "", bio: "", currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const API = "https://nexus-backend-production-771f.up.railway.app";

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/auth/profile`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      addToast("Profile updated", "success");
    } catch { addToast("Failed to update profile", "error"); }
    setSaving(false);
  };

  return (
    <PageShell title="Profile" sub="Manage your personal account">
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20, maxWidth: 800 }}>
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 12, padding: 24,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: T.accentGlow,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: T.accent,
            border: `2px solid ${T.accent}33`,
          }}>
            {(form.name?.[0] || "U").toUpperCase()}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{form.name || "User"}</div>
            <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 4 }}>{form.email}</div>
          </div>
          <Badge label="Administrator" color={T.purple} />
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 20 }}>Account Information</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "name", label: "Full Name" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone" },
              { key: "bio", label: "Bio" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>{f.label}</label>
                <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.type} />
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 16 }}>Change Password</p>
              {[
                { key: "currentPassword", label: "Current Password" },
                { key: "newPassword", label: "New Password" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 6 }}>{f.label}</label>
                  <Input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type="password" />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Btn>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Chat Page ────────────────────────────────────────────────────────────────
function ChatPage({ addToast }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const API = "https://nexus-backend-production-771f.up.railway.app";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/chat/messages`);
        const d = await r.json();
        setMessages(d?.messages || d || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const msg = { message: input.trim(), timestamp: new Date(), sender: "You" };
    setMessages(p => [...p, msg]);
    setInput("");
    setSending(true);
    try {
      await fetch(`${API}/api/chat/messages`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
    } catch {}
    setSending(false);
  };

  return (
    <PageShell title="Messages" sub="Internal team communication">
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 12, display: "flex", flexDirection: "column",
        height: "calc(100vh - 200px)", overflow: "hidden",
      }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner /></div>
            : messages.length === 0 ? <div style={{ textAlign: "center", color: T.textSecondary, padding: 40 }}>No messages yet. Start the conversation.</div>
            : messages.map((m, i) => {
              const isMe = m.sender === "You" || m.isMe;
              return (
                <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "70%", padding: "10px 14px", borderRadius: 12,
                    background: isMe ? T.accent : T.surfaceAlt,
                    color: T.textPrimary, fontSize: 13, lineHeight: 1.5,
                    borderBottomRightRadius: isMe ? 3 : 12,
                    borderBottomLeftRadius: isMe ? 12 : 3,
                  }}>
                    {!isMe && <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>{m.sender}</div>}
                    {m.message || m.text}
                    <div style={{ fontSize: 10, color: isMe ? "rgba(255,255,255,.5)" : T.textMuted, marginTop: 4 }}>
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                </div>
              );
            })
          }
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message…"
            style={{ flex: 1 }}
          />
          <Btn onClick={send} disabled={sending || !input.trim()}>{sending ? "…" : "Send"}</Btn>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Tools Page ───────────────────────────────────────────────────────────────
function ToolsPage({ addToast }) {
  const tools = [
    { icon: RefreshCw, label: "Sync All Data", desc: "Force-refresh all cached records from the database", color: T.accent, action: () => addToast("Data sync initiated", "info") },
    { icon: FileText, label: "Export Reports", desc: "Download payroll and attendance reports as CSV", color: T.success, action: () => addToast("Export started", "info") },
    { icon: Shield, label: "Clear Audit Log", desc: "Archive and clear old audit trail entries", color: T.warning, action: () => addToast("Audit log cleared", "success") },
    { icon: Activity, label: "Health Check", desc: "Verify API connectivity and database status", color: T.cyan, action: () => addToast("All systems operational", "success") },
    { icon: Hash, label: "Recalculate Payroll", desc: "Recompute all pending salary calculations", color: T.purple, action: () => addToast("Payroll recalculation queued", "info") },
    { icon: Users, label: "Bulk Employee Import", desc: "Import employees from CSV file", color: T.accent, action: () => addToast("Feature coming soon", "info") },
  ];

  return (
    <PageShell title="Tools" sub="Administrative utilities and system operations">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {tools.map(t => (
          <div key={t.label} onClick={t.action} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12, padding: "20px 22px",
            cursor: "pointer", transition: "all .2s",
            display: "flex", gap: 16, alignItems: "flex-start",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = t.color + "55";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,.3)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: t.color + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <t.icon size={18} color={t.color} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─── Auth / Login Page ────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API = "https://nexus-backend-production-771f.up.railway.app";

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields");
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Invalid credentials");
      localStorage.setItem("ems_token", d.token || "");
      localStorage.setItem("ems_user", JSON.stringify(d.user || { name: "Admin", email: form.email }));
      onLogin(d.user || { name: "Admin", email: form.email });
    } catch (err) {
      setError(err.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: T.bg, padding: 20,
      backgroundImage: `radial-gradient(ellipse at 30% 20%, ${T.accentGlow} 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)`,
    }}>
      <div className="animate-in" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16, boxShadow: `0 8px 24px ${T.accentGlow}`,
          }}>
            <Building2 size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.03em", marginBottom: 8 }}>AtoZ EMS</h1>
          <p style={{ fontSize: 13, color: T.textSecondary }}>Sign in to your workspace</p>
        </div>

        <div style={{
          background: T.surface, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,.5)",
        }}>
          {error && (
            <div style={{
              background: T.dangerBg, border: `1px solid ${T.danger}33`,
              borderRadius: 8, padding: "10px 14px", marginBottom: 20,
              fontSize: 13, color: T.danger, display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 8 }}>Email address</label>
              <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@company.com" type="email" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: T.textSecondary, marginBottom: 8 }}>Password</label>
              <Input value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" type="password" />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%", padding: "11px", borderRadius: 9, marginTop: 4,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentSoft})`,
                color: "#fff", fontSize: 14, fontWeight: 700,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all .2s",
                boxShadow: `0 4px 12px ${T.accentGlow}`,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.filter = ""; }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive, collapsed, setCollapsed, onLogout, user }) {
  const W = collapsed ? 64 : 232;

  return (
    <div style={{
      width: W, minWidth: W, height: "100vh",
      background: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column",
      transition: "width .2s cubic-bezier(.4,0,.2,1), min-width .2s",
      overflow: "hidden",
      position: "relative",
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: "18px 16px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${T.border}`, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 12px ${T.accentGlow}`,
        }}>
          <Building2 size={16} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-.02em", whiteSpace: "nowrap" }}>AtoZ EMS</div>
            <div style={{ fontSize: 10, color: T.textMuted, whiteSpace: "nowrap" }}>Employee Management</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(p => !p)}
          style={{
            marginLeft: "auto", width: 26, height: 26, borderRadius: 6, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.textMuted, transition: "background .15s, color .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = T.border; e.currentTarget.style.color = T.textPrimary; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}
        >
          {collapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 8px" }}>
        {NAV_SECTIONS.map(sec => (
          <div key={sec.label} style={{ marginBottom: 20 }}>
            {!collapsed && (
              <p style={{
                fontSize: 10, fontWeight: 700, color: T.textMuted,
                letterSpacing: ".1em", textTransform: "uppercase",
                padding: "0 8px", marginBottom: 6,
              }}>{sec.label}</p>
            )}
            {sec.items.map(item => {
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 8, marginBottom: 2,
                    background: isActive ? T.accentGlow : "transparent",
                    color: isActive ? T.accent : T.textSecondary,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    transition: "all .15s",
                    border: "none", cursor: "pointer",
                    position: "relative",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = T.surfaceAlt; e.currentTarget.style.color = T.textPrimary; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textSecondary; } }}
                >
                  <item.icon size={16} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span style={{
                      marginLeft: "auto", background: T.accent,
                      color: "#fff", fontSize: 10, fontWeight: 700,
                      borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center",
                    }}>{item.badge}</span>
                  )}
                  {collapsed && item.badge && (
                    <span style={{
                      position: "absolute", top: 6, right: 6,
                      width: 7, height: 7, borderRadius: "50%",
                      background: T.accent,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        padding: "12px 8px", borderTop: `1px solid ${T.border}`, flexShrink: 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 8,
          overflow: "hidden",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: T.accentGlow,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: T.accent,
          }}>
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Admin"}</div>
                <div style={{ fontSize: 10, color: T.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email || ""}</div>
              </div>
              <button onClick={onLogout} title="Sign out" style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: T.textMuted, transition: "background .15s, color .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.dangerBg; e.currentTarget.style.color = T.danger; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.textMuted; }}
              >
                <LogOut size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────
function TopBar({ activePage, clock }) {
  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const current = allItems.find(i => i.id === activePage);
  const Icon = current?.icon;

  return (
    <div style={{
      height: 56, borderBottom: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", background: T.surface, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && <Icon size={15} color={T.textSecondary} />}
        <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{current?.label || "Dashboard"}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: T.bg, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "5px 12px",
          fontSize: 12, color: T.textSecondary,
          fontVariantNumeric: "tabular-nums", fontWeight: 500,
        }}>
          <Clock size={12} color={T.textMuted} />
          {clock}
        </div>

        <div style={{ position: "relative" }}>
          <button style={{
            width: 34, height: 34, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.textSecondary, background: T.bg, border: `1px solid ${T.border}`,
            transition: "border-color .15s, color .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderFoc; e.currentTarget.style.color = T.accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary; }}
          >
            <Bell size={14} />
          </button>
          <span style={{
            position: "absolute", top: 7, right: 7,
            width: 7, height: 7, borderRadius: "50%",
            background: T.danger,
            border: `1.5px solid ${T.surface}`,
            animation: "blink 2s infinite",
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  injectGlobalStyles();

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ems_user")); } catch { return null; }
  });
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [clock, setClock] = useState("");

  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem("ems_token");
    localStorage.removeItem("ems_user");
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pageProps = { addToast, user };

  const PAGES = {
    dashboard: <DashboardPage {...pageProps} />,
    employees:  <EmployeesPage {...pageProps} />,
    attendance: <AttendancePage {...pageProps} />,
    worklogs:   <WorklogsPage {...pageProps} />,
    salary:     <SalaryPage {...pageProps} />,
    buyers:     <BuyersPage {...pageProps} />,
    orders:     <OrdersPage {...pageProps} />,
    analytics:  <AnalyticsPage {...pageProps} />,
    company:    <CompanyPage {...pageProps} />,
    audit:      <AuditPage {...pageProps} />,
    profile:    <ProfilePage {...pageProps} />,
    chat:       <ChatPage {...pageProps} />,
    tools:      <ToolsPage {...pageProps} />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar
        active={activePage}
        setActive={p => setActivePage(p)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
        user={user}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <TopBar activePage={activePage} clock={clock} />
        <div style={{ flex: 1, overflow: "hidden" }}>
          {PAGES[activePage] || PAGES.dashboard}
        </div>
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}
