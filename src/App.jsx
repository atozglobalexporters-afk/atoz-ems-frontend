import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet,
  ShoppingBag, Package, BarChart3, Shield, UserCircle,
  Wrench, Bell, Search, LogOut, Clock, X, AlertCircle,
  CheckCircle2, Zap, Building2, Plus, ArrowUpRight,
  ChevronRight, ChevronDown, ChevronLeft,
  ClipboardList, Settings, UserPlus, Calendar, Moon,
  Maximize2, Activity, TrendingUp, MessageSquare,
  Edit2, Trash2, Upload, RefreshCw,CheckSquare, Umbrella,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import ChatPage from "./ChatPage";
import { Umbrella, Briefcase, FileText as LeaveIcon } from "lucide-react";
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

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#0a0e17", panel:"#0f1521", card:"#131c2e", cardHov:"#162035",
  border:"rgba(255,255,255,0.06)", borderH:"rgba(99,102,241,0.4)",
  accent:"#6366f1", accentD:"#4f46e5", accentG:"rgba(99,102,241,0.12)",
  green:"#22c55e", greenG:"rgba(34,197,94,0.12)",
  amber:"#f59e0b", amberG:"rgba(245,158,11,0.12)",
  red:"#ef4444", redG:"rgba(239,68,68,0.12)",
  blue:"#3b82f6", purple:"#a855f7", cyan:"#06b6d4",
  t1:"#f1f5ff", t2:"#8892aa", t3:"#3d4d6a",
};
const CC = [C.accent,C.green,C.amber,C.blue,C.purple,C.cyan,C.red];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const injectCSS = () => {
  if (document.getElementById("ems-css")) return;
  const s = document.createElement("style");
  s.id = "ems-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{color-scheme:dark}
    html,body,#root{height:100%;font-family:'Inter',system-ui,sans-serif;background:${C.bg};color:${C.t1};-webkit-font-smoothing:antialiased;overflow:hidden}
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#1a2235;border-radius:4px}
    *{scrollbar-width:thin;scrollbar-color:#1a2235 transparent}
    input,select,textarea,button{font-family:inherit}
    select option{background:${C.card};color:${C.t1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .fadeUp{animation:fadeUp 0.28s ease both}
    .fadeIn{animation:fadeIn 0.2s ease both}
    .skeleton{background:linear-gradient(90deg,${C.card} 25%,${C.cardHov} 50%,${C.card} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}
    .scroll{overflow-y:auto;height:100%}
    .card{background:${C.card};border:1px solid ${C.border};border-radius:16px;transition:all 0.25s ease}
    .card:hover{border-color:${C.borderH};transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 16px rgba(99,102,241,0.08)}
    .nav-btn{width:100%;display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;transition:all 0.18s;background:transparent;color:${C.t2};white-space:nowrap}
    .nav-btn:hover{background:rgba(99,102,241,0.08);color:${C.t1}}
    .nav-btn.active{background:linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1));color:${C.accent};font-weight:600;border:1px solid rgba(99,102,241,0.15)}
    .tr{border-bottom:1px solid ${C.border};transition:background 0.12s}
    .tr:hover{background:rgba(255,255,255,0.02)}
    .inp{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9px;color:${C.t1};font-size:13px;padding:9px 12px;outline:none;transition:all 0.18s}
    .inp:focus{border-color:${C.accent};box-shadow:0 0 0 3px rgba(99,102,241,0.12);background:rgba(99,102,241,0.04)}
    .inp::placeholder{color:${C.t3}}
    .btn-pri{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:9px;border:none;cursor:pointer;font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,${C.accent},${C.accentD});box-shadow:0 4px 12px rgba(99,102,241,0.3);transition:all 0.18s}
    .btn-pri:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(99,102,241,0.4);filter:brightness(1.08)}
    .btn-pri:disabled{opacity:0.5;cursor:not-allowed;transform:none}
    .btn-ghost{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:500;color:${C.t2};background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);transition:all 0.18s}
    .btn-ghost:hover{background:rgba(255,255,255,0.08);color:${C.t1};border-color:rgba(255,255,255,0.15)}
    .btn-danger{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;color:${C.red};background:${C.redG};border:1px solid rgba(239,68,68,0.2);transition:all 0.18s}
    .btn-danger:hover{background:rgba(239,68,68,0.18)}
    .btn-success{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600;color:${C.green};background:${C.greenG};border:1px solid rgba(34,197,94,0.2);transition:all 0.18s}
    .btn-icon{display:inline-flex;align-items:center;justify-content:center;width:29px;height:29px;border-radius:7px;cursor:pointer;border:none;transition:all 0.18s;font-size:12px}
    .tab-btn{padding:7px 16px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.18s}
    .tab-btn.active{background:${C.accent};color:#fff;box-shadow:0 4px 12px rgba(99,102,241,0.3)}
    .tab-btn:not(.active){background:rgba(255,255,255,0.04);color:${C.t2};border:1px solid rgba(255,255,255,0.08)}
    .tab-btn:not(.active):hover{background:rgba(255,255,255,0.08);color:${C.t1}}
    .att-dot{width:8px;height:8px;border-radius:50%;display:inline-block}
    .quick-action{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);color:${C.t1};font-size:13px;font-weight:500;cursor:pointer;transition:all 0.18s;width:100%}
    .quick-action:hover{background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.25)}
  `;
  document.head.appendChild(s);
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  { section:"MAIN", items:[
    {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
    {id:"employees",label:"Employees",icon:Users},
    {id:"attendance",label:"Attendance",icon:CalendarCheck},
    {id:"worklogs",label:"Work Logs",icon:ClipboardList},
    {id:"chat",label:"Messages",icon:MessageSquare},
    {id:"tasks",    label:"Tasks",    icon:CheckSquare},
    {id:"leaves",   label:"Leaves",   icon:Umbrella},
    {id:"holidays", label:"Holidays", icon:Calendar},
  ]},
  { section:"FINANCE", items:[
    {id:"salary",label:"Salary",icon:Wallet},
    {id:"orders",label:"Orders",icon:Package},
    {id:"buyers",label:"Buyers",icon:ShoppingBag},
  ]},
  { section:"MORE", items:[
    {id:"analytics",label:"Analytics",icon:BarChart3},
    {id:"tools",label:"Tools",icon:Wrench},
    {id:"company",label:"Settings",icon:Settings},
    {id:"audit",label:"Audit Log",icon:Shield},
    {id:"profile",label:"Profile",icon:UserCircle},
  ]},
];
const EMP_NAV = [
  { section:"MY WORKSPACE", items:[
    {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
    {id:"attendance",label:"My Attendance",icon:CalendarCheck},
    {id:"worklogs",label:"My Work Logs",icon:ClipboardList},
    {id:"chat",label:"Messages",icon:MessageSquare},
    {id:"tasks",  label:"My Tasks",  icon:CheckSquare},
    {id:"leaves", label:"My Leaves", icon:Umbrella},
  ]},
  { section:"PERSONAL", items:[
    {id:"salary",label:"My Salary",icon:Wallet},
    {id:"profile",label:"Profile",icon:UserCircle},
    {id:"tools",label:"Tools",icon:Wrench},
  ]},
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Sk({h=14,w="80%",r=7}){return <div className="skeleton" style={{height:h,width:w,borderRadius:r}}/>;}

function Badge({label,color=C.accent}){
  return <span style={{display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,color,background:color+"18",border:`1px solid ${color}22`,letterSpacing:".03em",whiteSpace:"nowrap"}}>{label}</span>;
}

function statusBadge(s){
  const sl=s?.toLowerCase();
  if(["active","present","paid","completed","approved","on_time","early"].includes(sl)) return <Badge label={sl==="on_time"?"ON TIME":s?.toUpperCase()} color={C.green}/>;
  if(["inactive","absent","failed","cancelled","rejected"].includes(sl)) return <Badge label={s?.toUpperCase()} color={C.red}/>;
  if(["pending","late","processing","on leave","half_day"].includes(sl)) return <Badge label={sl==="half_day"?"HALF DAY":s?.toUpperCase()} color={C.amber}/>;
  return <Badge label={s?.toUpperCase()||"—"} color={C.t2}/>;
}

function roleBadge(r){
  if(r==="super_admin") return <Badge label="SUPER ADMIN" color={C.purple}/>;
  if(r==="admin") return <Badge label="ADMIN" color={C.accent}/>;
  return <Badge label="EMPLOYEE" color={C.blue}/>;
}

function CustomTooltip({active,payload,label}){
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12}}>
      {label&&<p style={{color:C.t2,marginBottom:6,fontWeight:600}}>{label}</p>}
      {payload.map((p,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:p.color}}/>
          <span style={{color:C.t2}}>{p.name}:</span>
          <span style={{fontWeight:700,color:C.t1}}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// FIXED MODAL — always centers, fixed position, backdrop
function Modal({open,onClose,title,children,width=500}){
  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose();};
    if(open){document.addEventListener("keydown",h);}
    return()=>document.removeEventListener("keydown",h);
  },[open,onClose]);
  if(!open) return null;
  return(
    <div onClick={onClose} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}}>
      <div onClick={e=>e.stopPropagation()} className="fadeUp" style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:width,boxShadow:"0 24px 64px rgba(0,0,0,0.7)",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
          <h3 style={{fontSize:15,fontWeight:700,color:C.t1}}>{title}</h3>
          <button onClick={onClose} style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:C.t2,cursor:"pointer",background:"transparent",border:"none",transition:"all 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.color=C.t1;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.t2;}}
          ><X size={15}/></button>
        </div>
        <div style={{padding:22,overflowY:"auto",flex:1}}>{children}</div>
      </div>
    </div>
  );
}

function Toast({toasts}){
  return(
    <div style={{position:"fixed",bottom:24,right:24,display:"flex",flexDirection:"column",gap:10,zIndex:9998}}>
      {toasts.map(t=>(
        <div key={t.id} className="fadeUp" style={{display:"flex",alignItems:"center",gap:10,background:C.panel,border:`1px solid ${t.type==="success"?C.green+"44":t.type==="error"?C.red+"44":C.border}`,borderRadius:12,padding:"12px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",fontSize:13,fontWeight:500,maxWidth:340,color:C.t1}}>
          {t.type==="success"&&<CheckCircle2 size={15} color={C.green}/>}
          {t.type==="error"&&<AlertCircle size={15} color={C.red}/>}
          {t.type==="info"&&<Zap size={15} color={C.accent}/>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function FormField({label,children}){
  return(
    <div>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:C.t2,marginBottom:7}}>{label}</label>
      {children}
    </div>
  );
}

function Inp({value,onChange,placeholder,type="text",icon:Icon,style:ext,disabled}){
  return(
    <div style={{position:"relative",...ext}}>
      {Icon&&<Icon size={14} color={C.t3} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>}
      <input className="inp" type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{paddingLeft:Icon?32:12,opacity:disabled?0.6:1}}/>
    </div>
  );
}

function StatCard({label,value,sub,deltaUp,gradient,icon:Icon,chart,loading}){
  return(
    <div className="card fadeUp" style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div style={{flex:1}}>
          <p style={{fontSize:11,fontWeight:700,color:C.t2,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>{label}</p>
          {loading?<Sk h={32} w={90}/>:<p style={{fontSize:30,fontWeight:800,color:C.t1,letterSpacing:"-.02em"}}>{value}</p>}
          {sub&&!loading&&(
            <p style={{fontSize:12,marginTop:5,fontWeight:500,color:deltaUp?C.green:C.t2,display:"flex",alignItems:"center",gap:3}}>
              {deltaUp&&<ArrowUpRight size={12}/>}{sub}
            </p>
          )}
        </div>
        <div style={{width:44,height:44,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,background:gradient}}>
          {Icon&&<Icon size={20} color="#fff"/>}
        </div>
      </div>
      {chart&&!loading&&(
        <div style={{height:48,marginLeft:-4,marginRight:-4}}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{top:0,right:0,bottom:0,left:0}}>
              <defs>
                <linearGradient id={`g-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.4}/>
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

function Table({columns,rows,loading,emptyText="No data"}){
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {columns.map(c=><th key={c.key} style={{padding:"11px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:C.t3,letterSpacing:".08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading?Array.from({length:5}).map((_,i)=>(
              <tr key={i} className="tr">
                {columns.map(c=><td key={c.key} style={{padding:"13px 16px"}}><Sk h={13} w={c.w||"80%"}/></td>)}
              </tr>
            )):rows.length===0?(
              <tr><td colSpan={columns.length} style={{padding:"40px 16px",textAlign:"center",fontSize:13,color:C.t2}}>{emptyText}</td></tr>
            ):rows.map((row,i)=>(
              <tr key={row._id||row.id||i} className="tr">
                {columns.map(c=><td key={c.key} style={{padding:"13px 16px",fontSize:13,color:C.t1}}>{c.render?c.render(row[c.key],row):row[c.key]??"—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PageShell({title,sub,actions,children}){
  return(
    <div className="scroll" style={{padding:"28px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:C.t1,letterSpacing:"-.02em"}}>{title}</h1>
          {sub&&<p style={{fontSize:13,color:C.t2,marginTop:4}}>{sub}</p>}
        </div>
        {actions&&<div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>{actions}</div>}
      </div>
      <div className="fadeUp">{children}</div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({addToast,user,setPage}){
  const [loading,setLoading]=useState(true);
  const [users,setUsers]=useState([]);
  const [orders,setOrders]=useState([]);
  const [salaries,setSalaries]=useState([]);
  const [attendance,setAttendance]=useState([]);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        if(isAdmin(user)){
          const [uR,oR,sR,aR]=await Promise.allSettled([
            apiFetch("/users").then(r=>r.json()),
            apiFetch("/orders").then(r=>r.json()),
            apiFetch("/salaries").then(r=>r.json()),
            apiFetch("/attendance").then(r=>r.json()),
          ]);
          setUsers(safeArr(uR.value,"users","data"));
          setOrders(safeArr(oR.value,"orders","data"));
          setSalaries(safeArr(sR.value,"salaries","data"));
          setAttendance(safeArr(aR.value,"attendance","records","data"));
        } else {
          const [aR,sR]=await Promise.allSettled([
            apiFetch("/attendance/monthly").then(r=>r.json()),
            apiFetch("/salaries").then(r=>r.json()),
          ]);
          setAttendance(safeArr(aR.value,"attendance","records","data"));
          setSalaries(safeArr(sR.value,"salaries","data"));
        }
      }catch{addToast("Failed to load dashboard","error");}
      setLoading(false);
    })();
  },[]);

  // Employee dashboard
  if(!isAdmin(user)){
    const myPresent=attendance.filter(a=>["present","on_time","early"].includes(a.status?.toLowerCase())).length;
    const myAbsent=attendance.filter(a=>a.status?.toLowerCase()==="absent").length;
    const myLate=attendance.filter(a=>a.status?.toLowerCase()==="late").length;
    const myHalf=attendance.filter(a=>a.status?.toLowerCase()==="half_day").length;
    const mySal=salaries[0];
    return(
      <div className="scroll" style={{padding:"24px 28px"}}>
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:24,fontWeight:800,color:C.t1}}>My Dashboard</h1>
          <p style={{fontSize:13,color:C.t2,marginTop:3}}>Welcome back, <span style={{color:C.accent,fontWeight:600}}>{user?.name?.split(" ")[0]}</span>!</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:20}}>
          <StatCard label="Days Present" value={loading?"—":myPresent} gradient={`linear-gradient(135deg,${C.green},#16a34a)`} icon={CheckCircle2} loading={loading}/>
          <StatCard label="Days Absent" value={loading?"—":myAbsent} gradient="linear-gradient(135deg,#ef4444,#dc2626)" icon={AlertCircle} loading={loading}/>
          <StatCard label="Days Late" value={loading?"—":myLate} gradient="linear-gradient(135deg,#f59e0b,#d97706)" icon={Clock} loading={loading}/>
          <StatCard label="Half Days" value={loading?"—":myHalf} gradient="linear-gradient(135deg,#06b6d4,#0284c7)" icon={CalendarCheck} loading={loading}/>
        </div>
        {mySal&&(
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:24,marginBottom:16}}>
            <h2 style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:16}}>My Latest Salary</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12}}>
              {[
                {l:"Basic",v:`₹${Number(mySal.basicSalary||0).toLocaleString("en-IN")}`,c:C.t1},
                {l:"Allowances",v:`+₹${Number(mySal.allowances||0).toLocaleString("en-IN")}`,c:C.green},
                {l:"Deductions",v:`-₹${Number(mySal.deductions||0).toLocaleString("en-IN")}`,c:C.red},
                {l:"Net Pay",v:`₹${Number(mySal.netSalary||mySal.totalSalary||0).toLocaleString("en-IN")}`,c:C.accent},
              ].map(x=>(
                <div key={x.l} style={{background:C.panel,borderRadius:10,padding:"12px 16px"}}>
                  <p style={{fontSize:11,color:C.t2,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>{x.l}</p>
                  <p style={{fontSize:18,fontWeight:800,color:x.c}}>{x.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {label:"View Attendance",icon:CalendarCheck,color:C.green,page:"attendance"},
            {label:"Add Work Log",icon:ClipboardList,color:C.accent,page:"worklogs"},
            {label:"Messages",icon:MessageSquare,color:C.purple,page:"chat"},
          ].map(a=>(
            <button key={a.label} onClick={()=>setPage(a.page)} className="quick-action" style={{maxWidth:220}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:9,background:a.color+"22",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <a.icon size={15} color={a.color}/>
                </div>
                <span style={{fontSize:13}}>{a.label}</span>
              </div>
              <ChevronRight size={14} color={C.t3}/>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Admin dashboard
  const today=new Date();
  const todayStr=today.toDateString();
  const todayAtt=attendance.filter(a=>a.date&&new Date(a.date).toDateString()===todayStr);
  const present=todayAtt.filter(a=>["present","on_time","early"].includes(a.status?.toLowerCase())).length;
  const lateC=todayAtt.filter(a=>a.status?.toLowerCase()==="late").length;
  const absentC=todayAtt.filter(a=>a.status?.toLowerCase()==="absent").length;
  const pendSal=salaries.filter(s=>!s.status||s.status==="pending").length;
  const totalEmp=users.length;
  const attRate=totalEmp?Math.round((present/totalEmp)*100):0;
  const thisMonthNew=users.filter(u=>{const d=new Date(u.createdAt);return d.getMonth()===today.getMonth()&&d.getFullYear()===today.getFullYear();}).length;
  const deptMap=users.reduce((acc,u)=>{const d=u.department||"Other";acc[d]=(acc[d]||0)+1;return acc;},{});
  const deptData=Object.entries(deptMap).map(([name,value])=>({name,value}));
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const label=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d.getDay()===0?6:d.getDay()-1];
    const p=attendance.filter(a=>a.date&&new Date(a.date).toDateString()===d.toDateString()&&["present","on_time","early"].includes(a.status?.toLowerCase())).length;
    const ab=attendance.filter(a=>a.date&&new Date(a.date).toDateString()===d.toDateString()&&a.status?.toLowerCase()==="absent").length;
    return{label,present:p,absent:ab};
  });
  const recentUsers=[...users].slice(-5).reverse();
  const sparkData=[3,5,4,7,6,8,totalEmp||1].map(v=>({v}));
  const attSparkData=last7.map(d=>({v:d.present}));
  const salSparkData=[2,3,2,4,3,pendSal,pendSal].map(v=>({v}));
  const ordSparkData=[1,2,3,2,4,3,orders.length||1].map(v=>({v}));

  return(
    <div className="scroll" style={{padding:"24px 28px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,color:C.t1,letterSpacing:"-.02em"}}>Dashboard</h1>
          <p style={{fontSize:13,color:C.t2,marginTop:3}}>Welcome back, <span style={{color:C.accent,fontWeight:600}}>{user?.name?.split(" ")[0]}</span>! Here's what's happening today.</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:12,padding:"9px 16px",fontSize:13,color:C.t2}}>
          <Calendar size={14} color={C.accent}/>
          {today.toLocaleDateString("en-IN",{month:"long",day:"numeric",year:"numeric"})}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:16}}>
        <StatCard label="Total Employees" value={loading?"—":totalEmp} sub={`+${thisMonthNew} this month`} deltaUp gradient={`linear-gradient(135deg,${C.accent},${C.accentD})`} icon={Users} chart={sparkData} loading={loading}/>
        <StatCard label="Present Today" value={loading?"—":present} sub={`${attRate}% attendance rate`} deltaUp gradient="linear-gradient(135deg,#22c55e,#16a34a)" icon={CalendarCheck} chart={attSparkData} loading={loading}/>
        <StatCard label="Pending Salaries" value={loading?"—":pendSal} sub="Needs attention" gradient="linear-gradient(135deg,#f59e0b,#d97706)" icon={Wallet} chart={salSparkData} loading={loading}/>
        <StatCard label="Total Orders" value={loading?"—":orders.length} sub={`${orders.filter(o=>o.status==="completed").length} completed`} deltaUp gradient="linear-gradient(135deg,#3b82f6,#2563eb)" icon={Package} chart={ordSparkData} loading={loading}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14,marginBottom:14}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
            <h2 style={{fontSize:14,fontWeight:700,color:C.t1}}>Recent Employees</h2>
            <button onClick={()=>setPage("employees")} style={{fontSize:12,color:C.accent,fontWeight:600,display:"flex",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer"}}>
              View all <ArrowUpRight size={13}/>
            </button>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["NAME","DEPARTMENT","ROLE","STATUS"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:C.t3,letterSpacing:".08em"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading?Array(4).fill(0).map((_,i)=><tr key={i} className="tr">{[160,100,90,80].map((w,j)=><td key={j} style={{padding:"12px 16px"}}><Sk h={12} w={w}/></td>)}</tr>)
                :recentUsers.map((u,i)=>(
                <tr key={u._id||i} className="tr">
                  <td style={{padding:"12px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:30,height:30,borderRadius:8,background:C.accentG,border:`1px solid ${C.accent}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:C.accent}}>{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{fontSize:13,fontWeight:500}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{padding:"12px 16px",fontSize:13,color:C.t2}}>{u.department||"—"}</td>
                  <td style={{padding:"12px 16px"}}>{roleBadge(u.role)}</td>
                  <td style={{padding:"12px 16px"}}>{statusBadge(u.isActive!==false?"active":"inactive")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
          <h2 style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:14}}>Quick Actions</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {label:"Add Employee",icon:UserPlus,gradient:`linear-gradient(135deg,${C.accent},${C.accentD})`,page:"employees"},
              {label:"View Attendance",icon:CalendarCheck,gradient:"linear-gradient(135deg,#22c55e,#16a34a)",page:"attendance"},
              {label:"Manage Salary",icon:Wallet,gradient:"linear-gradient(135deg,#f59e0b,#d97706)",page:"salary"},
              {label:"View Orders",icon:Package,gradient:"linear-gradient(135deg,#3b82f6,#2563eb)",page:"orders"},
            ].map(a=>(
              <button key={a.label} onClick={()=>setPage(a.page)} className="quick-action">
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:34,height:34,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",background:a.gradient,flexShrink:0}}><a.icon size={15} color="#fff"/></div>
                  <span style={{fontSize:13}}>{a.label}</span>
                </div>
                <ChevronRight size={14} color={C.t3}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 280px",gap:14}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <h2 style={{fontSize:14,fontWeight:700,color:C.t1}}>Attendance This Week</h2>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            {[{c:C.green,l:"Present"},{c:C.red,l:"Absent"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.t2}}>
                <div style={{width:10,height:10,borderRadius:3,background:x.c}}/>{x.l}
              </div>
            ))}
          </div>
          {loading?<Sk h={100}/>:(
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={last7} barSize={10} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                <XAxis dataKey="label" tick={{fill:C.t3,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="present" name="Present" fill={C.green} radius={[4,4,0,0]}/>
                <Bar dataKey="absent" name="Absent" fill={C.red} radius={[4,4,0,0]} fillOpacity={0.7}/>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
          <h2 style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:16}}>Department Wise</h2>
          {loading?<Sk h={120}/>:deptData.length===0?<p style={{color:C.t2,fontSize:13}}>No data</p>:(
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{position:"relative",flexShrink:0}}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={32} outerRadius={50} dataKey="value" strokeWidth={0}>
                      {deptData.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                  <span style={{fontSize:18,fontWeight:800,color:C.t1}}>{totalEmp}</span>
                  <span style={{fontSize:10,color:C.t2}}>Total</span>
                </div>
              </div>
              <div style={{flex:1,display:"flex",flexDirection:"column",gap:7}}>
                {deptData.slice(0,5).map((d,i)=>(
                  <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:8,height:8,borderRadius:2,background:CC[i%CC.length]}}/>
                      <span style={{fontSize:12,color:C.t2}}>{d.name}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:700,color:C.t1}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <h2 style={{fontSize:14,fontWeight:700,color:C.t1}}>Today</h2>
            <span style={{fontSize:12,color:C.t2,fontWeight:600}}>{present}/{totalEmp}</span>
          </div>
          {!loading&&(
            <div style={{height:6,borderRadius:99,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:14}}>
              <div style={{height:"100%",width:`${totalEmp?Math.round(present/totalEmp*100):0}%`,background:`linear-gradient(90deg,${C.green},${C.cyan})`,borderRadius:99,transition:"width .6s ease"}}/>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[{l:"Present",v:present,c:C.green},{l:"Late",v:lateC,c:C.amber},{l:"Absent",v:absentC,c:C.red}].map(m=>(
              <div key={m.l} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:m.c}}/>
                  <span style={{fontSize:12,color:C.t2}}>{m.l}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:C.t1}}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
function EmployeesPage({addToast,user}){
  const [employees,setEmployees]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(false);
  const [editModal,setEditModal]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [form,setForm]=useState({name:"",email:"",password:"",role:"employee",department:"",position:"",basicSalary:""});
  const [editForm,setEditForm]=useState({});
  const [saving,setSaving]=useState(false);
  const [deletedEmp,setDeletedEmp]=useState(null);
  const undoTimer=useRef(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try{const r=await apiFetch("/users");const d=await r.json();setEmployees(safeArr(d,"users","data"));}
    catch{addToast("Failed to load","error");}
    setLoading(false);
  },[]);
  useEffect(()=>{load();},[load]);

  const filtered=employees.filter(e=>!search||[e.name,e.email,e.position,e.department].some(f=>f?.toLowerCase().includes(search.toLowerCase())));

  const handleSave=async()=>{
    if(!form.name||!form.email||!form.password) return addToast("Name, email and password required","error");
    setSaving(true);
    try{
      const r=await apiFetch("/auth/admin/create-employee",{method:"POST",body:JSON.stringify(form)});
      if(!r.ok){const d=await r.json();throw new Error(d.message);}
      addToast("Employee created","success");setModal(false);
      setForm({name:"",email:"",password:"",role:"employee",department:"",position:"",basicSalary:""});load();
    }catch(e){addToast(e.message||"Failed","error");}
    setSaving(false);
  };

  const openEdit=(emp)=>{
    setEditTarget(emp);
    setEditForm({name:emp.name,email:emp.email,role:emp.role,department:emp.department||"",position:emp.position||"",isActive:emp.isActive!==false});
    setEditModal(true);
  };

  const handleEdit=async()=>{
    setSaving(true);
    try{
      const r=await apiFetch(`/users/${editTarget._id}`,{method:"PUT",body:JSON.stringify(editForm)});
      if(!r.ok) throw new Error();
      addToast("Employee updated","success");setEditModal(false);load();
    }catch{addToast("Failed to update","error");}
    setSaving(false);
  };

  const toggleActive=async(emp)=>{
    try{
      await apiFetch(`/users/${emp._id}`,{method:"PUT",body:JSON.stringify({isActive:emp.isActive===false})});
      addToast(emp.isActive===false?"Employee activated ✓":"Employee deactivated","success");load();
    }catch{addToast("Failed","error");}
  };

  const handleDelete=async(emp)=>{
    if(!confirm(`Remove ${emp.name}? You can undo this.`)) return;
    try{
      await apiFetch(`/users/${emp._id}`,{method:"DELETE"});
      setDeletedEmp(emp);
      addToast(`${emp.name} removed. Undo?`,"info");
      undoTimer.current=setTimeout(()=>setDeletedEmp(null),7000);
      load();
    }catch{addToast("Failed to delete","error");}
  };

  const handleUndo=async()=>{
    if(!deletedEmp) return;
    clearTimeout(undoTimer.current);
    try{
      // Re-create the employee
      await apiFetch("/auth/admin/create-employee",{method:"POST",body:JSON.stringify({
        name:deletedEmp.name,email:deletedEmp.email,password:"Nexus@1234",
        role:deletedEmp.role,department:deletedEmp.department,position:deletedEmp.position,
      })});
      addToast(`${deletedEmp.name} restored! Default password: Nexus@1234`,"success");
      setDeletedEmp(null);load();
    }catch{addToast("Undo failed","error");}
  };

  return(
    <PageShell title="Employees" sub={`${employees.length} total members`}
      actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{width:220}}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Employee</button></>}
    >
      {/* Undo bar */}
      {deletedEmp&&(
        <div style={{background:C.amberG,border:`1px solid ${C.amber}44`,borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:C.amber}}>{deletedEmp.name} was removed.</span>
          <button className="btn-ghost" style={{padding:"5px 12px",fontSize:12}} onClick={handleUndo}>↩ Undo</button>
        </div>
      )}
      <Table loading={loading} columns={[
        {key:"name",label:"Name",render:(v,row)=>(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:9,background:C.accentG,border:`1px solid ${C.accent}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.accent}}>{v?.[0]?.toUpperCase()}</div>
            <div><p style={{fontWeight:600,fontSize:13,color:C.t1}}>{v}</p><p style={{fontSize:11,color:C.t2}}>{row.email}</p></div>
          </div>
        )},
        {key:"position",label:"Position",render:v=><span style={{color:C.t2}}>{v||"—"}</span>},
        {key:"department",label:"Department",render:v=><span style={{color:C.t2}}>{v||"—"}</span>},
        {key:"role",label:"Role",render:v=>roleBadge(v)},
        {key:"isActive",label:"Status",render:v=>statusBadge(v!==false?"active":"inactive")},
        {key:"_id",label:"Actions",render:(v,row)=>(
          <div style={{display:"flex",gap:6}}>
            <button className="btn-icon" style={{background:C.accentG,color:C.accent}} onClick={()=>openEdit(row)} title="Edit"><Edit2 size={13}/></button>
            <button className="btn-icon" style={{background:row.isActive===false?C.greenG:C.amberG,color:row.isActive===false?C.green:C.amber}} onClick={()=>toggleActive(row)} title={row.isActive===false?"Activate":"Deactivate"}>
              {row.isActive===false?<CheckCircle2 size={13}/>:<AlertCircle size={13}/>}
            </button>
            <button className="btn-icon" style={{background:C.redG,color:C.red}} onClick={()=>handleDelete(row)} title="Delete"><Trash2 size={13}/></button>
          </div>
        )},
      ]} rows={filtered} emptyText="No employees found"/>

      <Modal open={modal} onClose={()=>setModal(false)} title="Add Employee">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {key:"name",label:"Full Name",ph:"Jane Smith"},
            {key:"email",label:"Email",ph:"jane@company.com",type:"email"},
            {key:"password",label:"Password",ph:"••••••••",type:"password"},
            {key:"position",label:"Position",ph:"Engineer"},
            {key:"department",label:"Department",ph:"Engineering"},
            {key:"basicSalary",label:"Basic Salary (₹)",ph:"50000",type:"number"},
          ].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <FormField label="Role">
            <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} className="inp">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Add Employee"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal} onClose={()=>setEditModal(false)} title="Edit Employee">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {key:"name",label:"Full Name"},
            {key:"email",label:"Email",type:"email"},
            {key:"position",label:"Position"},
            {key:"department",label:"Department"},
          ].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={editForm[f.key]||""} onChange={e=>setEditForm(p=>({...p,[f.key]:e.target.value}))} type={f.type}/></FormField>
          ))}
          <FormField label="Role">
            <select value={editForm.role||"employee"} onChange={e=>setEditForm(p=>({...p,role:e.target.value}))} className="inp">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select value={editForm.isActive?"active":"inactive"} onChange={e=>setEditForm(p=>({...p,isActive:e.target.value==="active"}))} className="inp">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
            <button className="btn-ghost" onClick={()=>setEditModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleEdit} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
function AttendancePage({addToast,user}){
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [tab,setTab]=useState("daily");
  const [month,setMonth]=useState(new Date().getMonth()+1);
  const [year,setYear]=useState(new Date().getFullYear());
  const [overrideModal,setOverrideModal]=useState(false);
  const [overrideForm,setOverrideForm]=useState({userId:"",date:new Date().toISOString().split("T")[0],status:"present",note:""});
  const [users,setUsers]=useState([]);
  const [checkLoading,setCheckLoading]=useState(false);
  const [todayRec,setTodayRec]=useState(null);
  const [settings,setSettings]=useState(null);
  const [search,setSearch]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      if(isAdmin(user)){
        const [aR,uR,sR]=await Promise.allSettled([
          apiFetch(tab==="monthly"?`/attendance?month=${month}&year=${year}`:"/attendance").then(r=>r.json()),
          apiFetch("/users").then(r=>r.json()),
          apiFetch("/company").then(r=>r.json()),
        ]);
        setRecords(safeArr(aR.value,"attendance","records","data"));
        setUsers(safeArr(uR.value,"users","data"));
        setSettings(sR.value?.company||sR.value);
      } else {
        const [aR,sR]=await Promise.allSettled([
          apiFetch(tab==="monthly"?`/attendance/monthly?month=${month}&year=${year}`:"/attendance/today").then(r=>r.json()),
          apiFetch("/company").then(r=>r.json()),
        ]);
        const recs=safeArr(aR.value,"attendance","records","data");
        setRecords(recs);
        setSettings(sR.value?.company||sR.value);
        const today=new Date().toDateString();
        setTodayRec(recs.find(r=>r.date&&new Date(r.date).toDateString()===today)||null);
      }
    }catch{addToast("Failed to load attendance","error");}
    setLoading(false);
  },[tab,month,year,user]);

  useEffect(()=>{load();},[load]);

  const handleCheckIn=async()=>{
    setCheckLoading(true);
    try{
      const r=await apiFetch("/attendance/login",{method:"POST"});
      const d=await r.json();
      if(!r.ok) throw new Error(d.message);
      addToast(`Checked in — ${d.attendance?.status||"Recorded"}`,"success");load();
    }catch(e){addToast(e.message||"Check-in failed","error");}
    setCheckLoading(false);
  };

  const handleCheckOut=async()=>{
    setCheckLoading(true);
    try{
      const r=await apiFetch("/attendance/checkout",{method:"POST"});
      if(!r.ok) throw new Error();
      addToast("Checked out successfully","success");load();
    }catch(e){addToast(e.message||"Check-out failed","error");}
    setCheckLoading(false);
  };

  const handleOverride=async()=>{
    try{
      const r=await apiFetch("/attendance/admin-override",{method:"PUT",body:JSON.stringify(overrideForm)});
      if(!r.ok) throw new Error();
      addToast("Attendance overridden","success");setOverrideModal(false);load();
    }catch{addToast("Failed to override","error");}
  };

  const filtered=records.filter(r=>{
    if(!search) return true;
    const name=r.userId?.name||r.employeeName||"";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // Stats
  const present=filtered.filter(r=>["present","on_time","early"].includes(r.status?.toLowerCase())).length;
  const absent=filtered.filter(r=>r.status?.toLowerCase()==="absent").length;
  const late=filtered.filter(r=>r.status?.toLowerCase()==="late").length;
  const halfDay=filtered.filter(r=>r.status?.toLowerCase()==="half_day").length;
  const total=filtered.length||1;

  // Calendar for monthly view
  const getDaysInMonth=(m,y)=>new Date(y,m,0).getDate();
  const getDotColor=(status)=>{
    const sl=status?.toLowerCase();
    if(["present","on_time","early"].includes(sl)) return C.green;
    if(sl==="absent") return C.red;
    if(sl==="late") return C.amber;
    if(sl==="half_day") return C.blue;
    return C.t3;
  };

  const formatTime=(t)=>{
    if(!t) return "—";
    try{
      const d=new Date(t);
      return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});
    }catch{return t;}
  };

  const formatDate=(t)=>{
    if(!t) return "—";
    try{return new Date(t).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
    catch{return t;}
  };

  return(
    <PageShell title="Attendance" sub={isAdmin(user)?"Manage employee attendance":"Your attendance records"}
      actions={
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button className={`tab-btn ${tab==="daily"?"active":""}`} onClick={()=>setTab("daily")}>Daily</button>
          <button className={`tab-btn ${tab==="monthly"?"active":""}`} onClick={()=>setTab("monthly")}>Monthly</button>
          {tab==="monthly"&&(
            <>
              <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="inp" style={{width:"auto",background:C.card,color:C.t1,border:`1px solid ${C.border}`}}>
                {MONTHS.map((m,i)=><option key={i} value={i+1} style={{background:C.card,color:C.t1}}>{m}</option>)}
              </select>
              <select value={year} onChange={e=>setYear(Number(e.target.value))} className="inp" style={{width:"auto",background:C.card,color:C.t1,border:`1px solid ${C.border}`}}>
                {[2023,2024,2025,2026,2027].map(y=><option key={y} value={y} style={{background:C.card,color:C.t1}}>{y}</option>)}
              </select>
            </>
          )}
          {isAdmin(user)&&<Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee…" icon={Search} style={{width:180}}/>}
          {isAdmin(user)&&<button className="btn-pri" onClick={()=>setOverrideModal(true)}><Edit2 size={14}/>Mark Attendance</button>}
        </div>
      }
    >
      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {[
          {l:"Present",v:present,pct:Math.round(present/total*100),c:C.green,bg:C.greenG},
          {l:"Absent",v:absent,pct:Math.round(absent/total*100),c:C.red,bg:C.redG},
          {l:"Late",v:late,pct:Math.round(late/total*100),c:C.amber,bg:C.amberG},
          {l:"Half Day",v:halfDay,pct:Math.round(halfDay/total*100),c:C.blue,bg:C.blueG||"rgba(59,130,246,0.12)"},
        ].map(x=>(
          <div key={x.l} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 20px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:x.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:x.c}}/>
              </div>
              <span style={{fontSize:12,color:C.t2,fontWeight:600}}>{x.l}</span>
            </div>
            <p style={{fontSize:28,fontWeight:800,color:x.c,marginBottom:4}}>{x.v}</p>
            <p style={{fontSize:12,color:C.t2}}>{x.pct}% of total</p>
          </div>
        ))}
      </div>

      {/* Employee check-in section */}
      {!isAdmin(user)&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <h2 style={{fontSize:15,fontWeight:700,color:C.t1}}>Today's Status</h2>
              {settings?.sessionStartTime&&(
                <p style={{fontSize:12,color:C.t2,marginTop:4}}>
                  Session: {settings.sessionStartTime} — {settings.sessionEndTime} · Grace: {settings.gracePeriod||0} min
                </p>
              )}
              {todayRec&&(
                <div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:C.t2}}>Check-in: <span style={{color:C.green,fontWeight:600}}>{formatTime(todayRec.checkIn||todayRec.loginTime)}</span></span>
                  <span style={{fontSize:12,color:C.t2}}>Check-out: <span style={{color:C.red,fontWeight:600}}>{formatTime(todayRec.checkOut||todayRec.logoutTime)}</span></span>
                  {todayRec.lateBy>0&&<span style={{fontSize:12,color:C.amber,fontWeight:600}}>{todayRec.lateBy} min late</span>}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              {todayRec&&statusBadge(todayRec.status)}
              {!todayRec?.checkIn&&!todayRec?.loginTime&&(
                <button className="btn-pri" onClick={handleCheckIn} disabled={checkLoading}>
                  <CheckCircle2 size={14}/>{checkLoading?"…":"Check In"}
                </button>
              )}
              {(todayRec?.checkIn||todayRec?.loginTime)&&!todayRec?.checkOut&&!todayRec?.logoutTime&&(
                <button className="btn-danger" style={{padding:"8px 16px",fontSize:13}} onClick={handleCheckOut} disabled={checkLoading}>
                  <AlertCircle size={14}/>{checkLoading?"…":"Check Out"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly calendar view */}
      {tab==="monthly"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:20,marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <h2 style={{fontSize:15,fontWeight:700,color:C.t1}}>{MONTHS[month-1]} {year}</h2>
            <div style={{display:"flex",gap:16}}>
              {[{c:C.green,l:"Present"},{c:C.amber,l:"Late"},{c:C.red,l:"Absent"},{c:C.blue,l:"Half Day"}].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.t2}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:x.c}}/>{x.l}
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6}}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:C.t3,padding:"6px 0"}}>{d}</div>
            ))}
            {Array.from({length:new Date(year,month-1,1).getDay()}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:getDaysInMonth(month,year)}).map((_,i)=>{
              const day=i+1;
              const dateStr=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const recs=filtered.filter(r=>{
                if(!r.date) return false;
                const d=new Date(r.date);
                return d.getDate()===day&&d.getMonth()===month-1&&d.getFullYear()===year;
              });
              const isToday=new Date().toDateString()===new Date(year,month-1,day).toDateString();
              return(
                <div key={day} style={{background:isToday?C.accentG:"rgba(255,255,255,0.02)",border:`1px solid ${isToday?C.accent+"44":C.border}`,borderRadius:10,padding:"8px 6px",minHeight:56,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:12,fontWeight:isToday?700:400,color:isToday?C.accent:C.t2}}>{day}</span>
                  <div style={{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"center"}}>
                    {recs.slice(0,4).map((r,ri)=>(
                      <div key={ri} title={`${r.userId?.name||"Employee"}: ${r.status}`} style={{width:7,height:7,borderRadius:"50%",background:getDotColor(r.status)}}/>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Employee","Date","Check In","Check Out","Late By","Hours","Status",...(isAdmin(user)?["Action"]:[])].map(h=>(
                <th key={h} style={{padding:"11px 16px",textAlign:"left",fontSize:10,fontWeight:700,color:C.t3,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading?Array(5).fill(0).map((_,i)=>(
              <tr key={i} className="tr">
                {Array(isAdmin(user)?8:7).fill(0).map((_,j)=><td key={j} style={{padding:"13px 16px"}}><Sk h={13}/></td>)}
              </tr>
            )):filtered.length===0?(
              <tr><td colSpan={isAdmin(user)?8:7} style={{padding:"40px 16px",textAlign:"center",fontSize:13,color:C.t2}}>No attendance records</td></tr>
            ):filtered.map((row,i)=>(
              <tr key={row._id||i} className="tr">
                <td style={{padding:"12px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:30,height:30,borderRadius:8,background:C.accentG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.accent,flexShrink:0}}>
                      {(row.userId?.name||row.employeeName||user?.name||"?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{fontWeight:600,fontSize:13}}>{row.userId?.name||row.employeeName||user?.name||"—"}</p>
                      {row.userId?.department&&<p style={{fontSize:11,color:C.t2}}>{row.userId.department}</p>}
                    </div>
                  </div>
                </td>
                <td style={{padding:"12px 16px",fontSize:13,color:C.t2}}>{formatDate(row.date)}</td>
                <td style={{padding:"12px 16px",fontSize:13,color:C.green,fontWeight:500}}>{formatTime(row.checkIn||row.loginTime)}</td>
                <td style={{padding:"12px 16px",fontSize:13,color:C.red,fontWeight:500}}>{formatTime(row.checkOut||row.logoutTime)}</td>
                <td style={{padding:"12px 16px",fontSize:13}}>{row.lateBy>0?<span style={{color:C.amber,fontWeight:600}}>{row.lateBy} min</span>:"—"}</td>
                <td style={{padding:"12px 16px",fontSize:13}}>{row.hoursWorked?<span style={{color:C.accent,fontWeight:600}}>{row.hoursWorked}h</span>:"—"}</td>
                <td style={{padding:"12px 16px"}}>{statusBadge(row.status||"unknown")}</td>
                {isAdmin(user)&&(
                  <td style={{padding:"12px 16px"}}>
                    <button className="btn-icon" style={{background:C.accentG,color:C.accent}} onClick={()=>{
                      setOverrideForm({userId:row.userId?._id||row.userId||"",date:row.date?new Date(row.date).toISOString().split("T")[0]:new Date().toISOString().split("T")[0],status:row.status||"present",note:""});
                      setOverrideModal(true);
                    }} title="Edit attendance"><Edit2 size={13}/></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={overrideModal} onClose={()=>setOverrideModal(false)} title="Mark Attendance">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <FormField label="Employee">
            <select value={overrideForm.userId} onChange={e=>setOverrideForm(p=>({...p,userId:e.target.value}))} className="inp" style={{background:C.card,color:C.t1}}>
              <option value="" style={{background:C.card}}>Select employee…</option>
              {users.map(u=><option key={u._id} value={u._id} style={{background:C.card,color:C.t1}}>{u.name}</option>)}
            </select>
          </FormField>
          <FormField label="Date"><Inp value={overrideForm.date} onChange={e=>setOverrideForm(p=>({...p,date:e.target.value}))} type="date"/></FormField>
          <FormField label="Status">
            <select value={overrideForm.status} onChange={e=>setOverrideForm(p=>({...p,status:e.target.value}))} className="inp" style={{background:C.card,color:C.t1}}>
              {["present","absent","late","half_day","on_time","early"].map(s=>(
                <option key={s} value={s} style={{background:C.card,color:C.t1}}>{s.replace("_"," ").toUpperCase()}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Note (optional)"><Inp value={overrideForm.note} onChange={e=>setOverrideForm(p=>({...p,note:e.target.value}))} placeholder="Reason…"/></FormField>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn-ghost" onClick={()=>setOverrideModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleOverride}>Apply</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── WORK LOGS ────────────────────────────────────────────────────────────────
function WorklogsPage({addToast,user}){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({description:"",hoursWorked:"",date:new Date().toISOString().split("T")[0],projectName:""});
  const [file,setFile]=useState(null);
  const [saving,setSaving]=useState(false);
  const [deletedLog,setDeletedLog]=useState(null);
  const undoTimer=useRef(null);
  const fileRef=useRef(null);

  const load=async()=>{
    setLoading(true);
    try{const r=await apiFetch("/worklogs");const d=await r.json();setLogs(safeArr(d,"worklogs","data"));}
    catch{addToast("Failed","error");}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const filtered=logs.filter(l=>!search||[l.userId?.name,l.description,l.projectName].some(f=>f?.toLowerCase().includes(search.toLowerCase())));

  const handleSave=async()=>{
    if(!form.description||!form.hoursWorked) return addToast("Description and hours required","error");
    setSaving(true);
    try{
      const fd=new FormData();
      Object.entries(form).forEach(([k,v])=>{if(v) fd.append(k,v);});
      if(file) fd.append("files",file);
      const r=await fetch(`${API}/worklogs`,{method:"POST",headers:{Authorization:`Bearer ${getToken()}`},body:fd});
      if(!r.ok) throw new Error();
      addToast("Work log saved","success");setModal(false);
      setForm({description:"",hoursWorked:"",date:new Date().toISOString().split("T")[0],projectName:""});
      setFile(null);load();
    }catch{addToast("Failed to save","error");}
    setSaving(false);
  };

  const handleDelete=async(log)=>{
    try{
      await apiFetch(`/worklogs/${log._id}`,{method:"DELETE"});
      setDeletedLog(log);
      addToast("Log deleted. Undo?","info");
      undoTimer.current=setTimeout(()=>setDeletedLog(null),7000);
      load();
    }catch{addToast("Failed","error");}
  };

  const handleUndo=async()=>{
    if(!deletedLog) return;
    clearTimeout(undoTimer.current);
    try{
      const fd=new FormData();
      Object.entries({projectName:deletedLog.projectName||"",description:deletedLog.description||"",hoursWorked:deletedLog.hoursWorked||"",date:deletedLog.date||""}).forEach(([k,v])=>{if(v) fd.append(k,v);});
      await fetch(`${API}/worklogs`,{method:"POST",headers:{Authorization:`Bearer ${getToken()}`},body:fd});
      addToast("Work log restored","success");setDeletedLog(null);load();
    }catch{addToast("Undo failed","error");}
  };

  const updateStatus=async(id,status)=>{
    try{
      await apiFetch(`/worklogs/${id}`,{method:"PUT",body:JSON.stringify({status})});
      addToast(`Marked ${status}`,"success");load();
    }catch{addToast("Failed","error");}
  };

  return(
    <PageShell title="Work Logs" sub="Employee task records"
      actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{width:220}}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Log</button></>}
    >
      {deletedLog&&(
        <div style={{background:C.amberG,border:`1px solid ${C.amber}44`,borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:C.amber}}>Work log deleted.</span>
          <button className="btn-ghost" style={{padding:"5px 12px",fontSize:12}} onClick={handleUndo}>↩ Undo</button>
        </div>
      )}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Employee","Project","Description","Hours","Date","Files","Status","Actions"].map(h=>(
                <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:C.t3,letterSpacing:".07em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading?Array(5).fill(0).map((_,i)=>(
              <tr key={i} className="tr">
                {Array(8).fill(0).map((_,j)=><td key={j} style={{padding:"13px 14px"}}><Sk h={13}/></td>)}
              </tr>
            )):filtered.length===0?(
              <tr><td colSpan={8} style={{padding:"40px 16px",textAlign:"center",fontSize:13,color:C.t2}}>No work logs</td></tr>
            ):filtered.map((row,i)=>(
              <tr key={row._id||i} className="tr">
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:28,height:28,borderRadius:7,background:C.accentG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:C.accent,flexShrink:0}}>
                      {(row.userId?.name||row.employeeName||user?.name||"?")[0]?.toUpperCase()}
                    </div>
                    <span style={{fontSize:12,fontWeight:600}}>{row.userId?.name||row.employeeName||user?.name||"—"}</span>
                  </div>
                </td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.accent}}>{row.projectName||"—"}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.t2,maxWidth:200}}>{row.description||"—"}</td>
                <td style={{padding:"12px 14px",fontSize:12}}>{row.hoursWorked?<span style={{color:C.green,fontWeight:600}}>{row.hoursWorked}h</span>:"—"}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.t2}}>{row.date?new Date(row.date).toLocaleDateString("en-IN"):"—"}</td>
                <td style={{padding:"12px 14px"}}>
                  {(row.files||row.fileUrls||[]).length>0?(
                    <a href={`${API.replace("/api","")}${(row.files||row.fileUrls)[0]}`} target="_blank" rel="noreferrer" style={{color:C.accent,fontSize:11,display:"flex",alignItems:"center",gap:3}}>
                      <Upload size={11}/>{(row.files||row.fileUrls).length} file{(row.files||row.fileUrls).length>1?"s":""}
                    </a>
                  ):<span style={{color:C.t3,fontSize:11}}>None</span>}
                </td>
                <td style={{padding:"12px 14px"}}>{row.status?statusBadge(row.status):<Badge label="PENDING" color={C.amber}/>}</td>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {isAdmin(user)&&<>
                      <button className="btn-icon" style={{background:C.greenG,color:C.green,fontSize:10,width:"auto",padding:"3px 7px",borderRadius:6}} onClick={()=>updateStatus(row._id,"approved")}>✓ Approve</button>
                      <button className="btn-icon" style={{background:C.amberG,color:C.amber,fontSize:10,width:"auto",padding:"3px 7px",borderRadius:6}} onClick={()=>updateStatus(row._id,"pending")}>Pending</button>
                      <button className="btn-icon" style={{background:C.redG,color:C.red,fontSize:10,width:"auto",padding:"3px 7px",borderRadius:6}} onClick={()=>updateStatus(row._id,"rejected")}>Reject</button>
                    </>}
                    <button className="btn-icon" style={{background:C.redG,color:C.red}} onClick={()=>handleDelete(row)}><Trash2 size={12}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title="Add Work Log">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {key:"projectName",label:"Project Name",ph:"Project Alpha"},
            {key:"description",label:"Description",ph:"Completed task…"},
            {key:"hoursWorked",label:"Hours Worked",ph:"8",type:"number"},
            {key:"date",label:"Date",type:"date"},
          ].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <FormField label="Attach File (PDF, Image, Doc)">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{display:"none"}} onChange={e=>setFile(e.target.files[0])}/>
              <button className="btn-ghost" onClick={()=>fileRef.current?.click()} style={{padding:"7px 14px"}}><Upload size={14}/>Choose File</button>
              {file&&<span style={{fontSize:12,color:C.green}}>{file.name}</span>}
            </div>
          </FormField>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:6}}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Log"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── SALARY ───────────────────────────────────────────────────────────────────
function SalaryPage({addToast,user}){
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(false);
  const [editModal,setEditModal]=useState(false);
  const [editTarget,setEditTarget]=useState(null);
  const [users,setUsers]=useState([]);
  const [form,setForm]=useState({userId:"",month:"",year:new Date().getFullYear().toString(),basicSalary:"",allowances:"",deductions:"",incentives:"",bonus:""});
  const [saving,setSaving]=useState(false);
  const [deletedRec,setDeletedRec]=useState(null);
  const undoTimer=useRef(null);

  const load=async()=>{
    setLoading(true);
    try{
      if(isAdmin(user)){
        const [sR,uR]=await Promise.allSettled([apiFetch("/salaries").then(r=>r.json()),apiFetch("/users").then(r=>r.json())]);
        setRecords(safeArr(sR.value,"salaries","data"));
        setUsers(safeArr(uR.value,"users","data"));
      } else {
        const r=await apiFetch("/salaries");
        const d=await r.json();
        setRecords(safeArr(d,"salaries","data"));
      }
    }catch{addToast("Failed to load payroll","error");}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const filtered=isAdmin(user)
    ?records.filter(r=>!search||r.userId?.name?.toLowerCase().includes(search.toLowerCase())||r.employeeName?.toLowerCase().includes(search.toLowerCase()))
    :records;

  const calcNet=(r)=>(Number(r.basicSalary||0)+Number(r.allowances||0)+Number(r.incentives||0)+Number(r.bonus||0))-Number(r.deductions||0);
  const total=filtered.reduce((s,r)=>s+(r.netSalary||calcNet(r)||0),0);

  const handleSave=async()=>{
    setSaving(true);
    try{
      const net=calcNet(form);
      const r=await apiFetch("/salaries",{method:"POST",body:JSON.stringify({...form,netSalary:net})});
      if(!r.ok) throw new Error();
      addToast("Created","success");setModal(false);load();
    }catch{addToast("Failed","error");}
    setSaving(false);
  };

  const handleEdit=async()=>{
    setSaving(true);
    try{
      const net=calcNet(editTarget);
      const r=await apiFetch(`/salaries/${editTarget._id}`,{method:"PUT",body:JSON.stringify({...editTarget,netSalary:net})});
      if(!r.ok) throw new Error();
      addToast("Updated","success");setEditModal(false);load();
    }catch{addToast("Failed","error");}
    setSaving(false);
  };

  const handleDelete=async(rec)=>{
    if(!confirm("Delete salary record?")) return;
    try{
      await apiFetch(`/salaries/${rec._id}`,{method:"DELETE"});
      setDeletedRec(rec);
      addToast("Deleted. Undo?","info");
      undoTimer.current=setTimeout(()=>setDeletedRec(null),7000);
      load();
    }catch{addToast("Failed","error");}
  };

  const handleUndo=async()=>{
    if(!deletedRec) return;
    clearTimeout(undoTimer.current);
    try{
      const net=calcNet(deletedRec);
      await apiFetch("/salaries",{method:"POST",body:JSON.stringify({...deletedRec,netSalary:net})});
      addToast("Salary record restored","success");setDeletedRec(null);load();
    }catch{addToast("Undo failed","error");}
  };

  const salaryFields=[
    {key:"basicSalary",label:"Basic Salary (₹)",ph:"50000"},
    {key:"incentives",label:"Incentives (₹)",ph:"5000"},
    {key:"allowances",label:"Allowances (₹)",ph:"3000"},
    {key:"bonus",label:"Bonus / Extra Pay (₹)",ph:"10000"},
    {key:"deductions",label:"Deductions (₹)",ph:"2000"},
  ];

  const adminCols=[
    {key:"userId",label:"Employee",render:(v,row)=><span style={{fontWeight:500}}>{v?.name||row.employeeName||"—"}</span>},
    {key:"month",label:"Month"},
    {key:"year",label:"Year"},
    {key:"basicSalary",label:"Basic",render:v=>v?`₹${Number(v).toLocaleString("en-IN")}`:"—"},
    {key:"incentives",label:"Incentives",render:v=>v?<span style={{color:C.cyan}}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"bonus",label:"Bonus",render:v=>v?<span style={{color:C.purple}}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"allowances",label:"Allowances",render:v=>v?<span style={{color:C.green}}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"deductions",label:"Deductions",render:v=>v?<span style={{color:C.red}}>-₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"netSalary",label:"Net Pay",render:(v,row)=><span style={{fontWeight:700,color:C.t1}}>₹{Number(v||calcNet(row)).toLocaleString("en-IN")}</span>},
    {key:"status",label:"Status",render:v=>statusBadge(v||"pending")},
    {key:"_id",label:"Actions",render:(v,row)=>(
      <div style={{display:"flex",gap:6}}>
        <button className="btn-icon" style={{background:C.accentG,color:C.accent}} onClick={()=>{setEditTarget({...row});setEditModal(true);}}><Edit2 size={13}/></button>
        <button className="btn-icon" style={{background:C.redG,color:C.red}} onClick={()=>handleDelete(row)}><Trash2 size={13}/></button>
      </div>
    )},
  ];

  const empCols=[
    {key:"month",label:"Month"},
    {key:"year",label:"Year"},
    {key:"basicSalary",label:"Basic",render:v=>v?`₹${Number(v).toLocaleString("en-IN")}`:"—"},
    {key:"incentives",label:"Incentives",render:v=>v?<span style={{color:C.cyan}}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"bonus",label:"Bonus",render:v=>v?<span style={{color:C.purple}}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"allowances",label:"Allowances",render:v=>v?<span style={{color:C.green}}>+₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"deductions",label:"Deductions",render:v=>v?<span style={{color:C.red}}>-₹{Number(v).toLocaleString("en-IN")}</span>:"—"},
    {key:"netSalary",label:"Net Pay",render:(v,row)=><span style={{fontWeight:700,color:C.accent}}>₹{Number(v||calcNet(row)).toLocaleString("en-IN")}</span>},
    {key:"status",label:"Status",render:v=>statusBadge(v||"pending")},
  ];

  return(
    <PageShell
      title={isAdmin(user)?"Payroll":"My Salary"}
      sub={isAdmin(user)?`Total: ₹${total.toLocaleString("en-IN")}`:"Your salary breakdown"}
      actions={isAdmin(user)?(
        <><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{width:220}}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Record</button></>
      ):null}
    >
      {deletedRec&&(
        <div style={{background:C.amberG,border:`1px solid ${C.amber}44`,borderRadius:10,padding:"10px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:13,color:C.amber}}>Salary record deleted.</span>
          <button className="btn-ghost" style={{padding:"5px 12px",fontSize:12}} onClick={handleUndo}>↩ Undo</button>
        </div>
      )}
      <Table loading={loading} columns={isAdmin(user)?adminCols:empCols} rows={filtered} emptyText="No payroll records"/>

      <Modal open={modal} onClose={()=>setModal(false)} title="Add Salary Record">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <FormField label="Employee">
            <select value={form.userId} onChange={e=>setForm(p=>({...p,userId:e.target.value}))} className="inp" style={{background:C.card,color:C.t1}}>
              <option value="" style={{background:C.card}}>Select employee…</option>
              {users.map(u=><option key={u._id} value={u._id} style={{background:C.card,color:C.t1}}>{u.name}</option>)}
            </select>
          </FormField>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <FormField label="Month"><Inp value={form.month} onChange={e=>setForm(p=>({...p,month:e.target.value}))} placeholder="January"/></FormField>
            <FormField label="Year"><Inp value={form.year} onChange={e=>setForm(p=>({...p,year:e.target.value}))} placeholder="2025" type="number"/></FormField>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {salaryFields.map(f=>(
              <FormField key={f.key} label={f.label}><Inp value={form[f.key]||""} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type="number"/></FormField>
            ))}
          </div>
          <div style={{background:C.bg,borderRadius:10,padding:"12px 16px"}}>
            <span style={{color:C.t2,fontSize:13}}>Net Pay: </span>
            <span style={{color:C.accent,fontWeight:700,fontSize:18}}>₹{calcNet(form).toLocaleString("en-IN")}</span>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Record"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={editModal} onClose={()=>setEditModal(false)} title="Edit Salary Record">
        {editTarget&&(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {salaryFields.map(f=>(
                <FormField key={f.key} label={f.label}><Inp value={editTarget[f.key]||""} onChange={e=>setEditTarget(p=>({...p,[f.key]:e.target.value}))} type="number"/></FormField>
              ))}
            </div>
            <FormField label="Status">
              <select value={editTarget.status||"pending"} onChange={e=>setEditTarget(p=>({...p,status:e.target.value}))} className="inp" style={{background:C.card,color:C.t1}}>
                {["pending","paid","failed"].map(s=><option key={s} value={s} style={{background:C.card,color:C.t1}}>{s.toUpperCase()}</option>)}
              </select>
            </FormField>
            <div style={{background:C.bg,borderRadius:10,padding:"12px 16px"}}>
              <span style={{color:C.t2,fontSize:13}}>Net Pay: </span>
              <span style={{color:C.accent,fontWeight:700,fontSize:18}}>₹{calcNet(editTarget).toLocaleString("en-IN")}</span>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-ghost" onClick={()=>setEditModal(false)}>Cancel</button>
              <button className="btn-pri" onClick={handleEdit} disabled={saving}>{saving?"Saving…":"Save"}</button>
            </div>
          </div>
        )}
      </Modal>
    </PageShell>
  );
}

// ─── BUYERS ───────────────────────────────────────────────────────────────────
function BuyersPage({addToast}){
  const [buyers,setBuyers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({name:"",email:"",phone:"",company:"",address:""});

  const load=async()=>{
    setLoading(true);
    try{const r=await apiFetch("/buyers");const d=await r.json();setBuyers(safeArr(d,"buyers","data"));}
    catch{addToast("Failed","error");}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const filtered=buyers.filter(b=>!search||[b.name,b.email,b.company].some(f=>f?.toLowerCase().includes(search.toLowerCase())));

  const handleSave=async()=>{
    if(!form.name) return addToast("Name required","error");
    try{
      const r=await apiFetch("/buyers",{method:"POST",body:JSON.stringify(form)});
      if(!r.ok) throw new Error();
      addToast("Added","success");setModal(false);setForm({name:"",email:"",phone:"",company:"",address:""});load();
    }catch{addToast("Failed","error");}
  };

  const handleDelete=async id=>{
    if(!confirm("Remove this buyer?")) return;
    try{await apiFetch(`/buyers/${id}`,{method:"DELETE"});addToast("Removed","success");load();}
    catch{addToast("Failed","error");}
  };

  return(
    <PageShell title="Buyers" sub={`${buyers.length} registered buyers`}
      actions={<><Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{width:220}}/><button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Buyer</button></>}
    >
      <Table loading={loading} columns={[
        {key:"name",label:"Name",render:(v,row)=><div><p style={{fontWeight:600,color:C.t1}}>{v}</p><p style={{fontSize:11,color:C.t2}}>{row.company}</p></div>},
        {key:"email",label:"Email",render:v=><span style={{color:C.t2}}>{v||"—"}</span>},
        {key:"phone",label:"Phone",render:v=><span style={{color:C.t2}}>{v||"—"}</span>},
        {key:"address",label:"Address",render:v=><span style={{color:C.t3,fontSize:12}}>{v||"—"}</span>},
        {key:"_id",label:"",render:v=><button className="btn-danger" onClick={()=>handleDelete(v)}>Remove</button>},
      ]} rows={filtered} emptyText="No buyers yet"/>

      <Modal open={modal} onClose={()=>setModal(false)} title="Add Buyer">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {key:"name",label:"Full Name",ph:"Rajan Mehta"},
            {key:"email",label:"Email",ph:"rajan@corp.com",type:"email"},
            {key:"phone",label:"Phone",ph:"+91 98765 43210"},
            {key:"company",label:"Company",ph:"Mehta Industries"},
            {key:"address",label:"Address",ph:"Mumbai"},
          ].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave}>Add Buyer</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersPage({addToast}){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  const [modal,setModal]=useState(false);
  const [buyers,setBuyers]=useState([]);
  const [form,setForm]=useState({buyerId:"",productName:"",quantity:"",unitPrice:"",hsnCode:"",notes:""});

  const load=async()=>{
    setLoading(true);
    try{
      const [oR,bR]=await Promise.allSettled([apiFetch("/orders").then(r=>r.json()),apiFetch("/buyers").then(r=>r.json())]);
      setOrders(safeArr(oR.value,"orders","data"));setBuyers(safeArr(bR.value,"buyers","data"));
    }catch{addToast("Failed","error");}
    setLoading(false);
  };
  useEffect(()=>{load();},[]);

  const filtered=orders.filter(o=>{
    const ms=!search||[o.buyerId?.name,o.orderNumber,o.productName].some(f=>f?.toLowerCase().includes(search.toLowerCase()));
    const mst=statusFilter==="all"||o.status?.toLowerCase()===statusFilter;
    return ms&&mst;
  });

  const handleSave=async()=>{
    try{
      const r=await apiFetch("/orders",{method:"POST",body:JSON.stringify(form)});
      if(!r.ok) throw new Error();
      addToast("Created","success");setModal(false);setForm({buyerId:"",productName:"",quantity:"",unitPrice:"",hsnCode:"",notes:""});load();
    }catch{addToast("Failed","error");}
  };

  return(
    <PageShell title="Orders" sub={`${orders.length} total orders`}
      actions={<>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="inp" style={{width:"auto",background:C.card,color:C.t1}}>
          {["all","pending","processing","completed","cancelled"].map(s=><option key={s} value={s} style={{background:C.card,color:C.t1}}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{width:200}}/>
        <button className="btn-pri" onClick={()=>setModal(true)}><Plus size={14}/>Add Order</button>
      </>}
    >
      <Table loading={loading} columns={[
        {key:"orderNumber",label:"Order ID",render:v=><span style={{fontFamily:"monospace",fontSize:12,color:C.t2}}>#{v||"—"}</span>},
        {key:"buyerId",label:"Buyer",render:(v,row)=><span style={{fontWeight:500}}>{v?.name||row.buyerName||"—"}</span>},
        {key:"productName",label:"Product"},
        {key:"hsnCode",label:"HSN",render:v=><span style={{color:C.t2,fontSize:12}}>{v||"—"}</span>},
        {key:"quantity",label:"Qty",render:v=><span style={{fontWeight:600}}>{v||"—"}</span>},
        {key:"totalAmount",label:"Amount",render:v=><span style={{fontWeight:700,color:C.t1}}>{v?`₹${Number(v).toLocaleString("en-IN")}`:"—"}</span>},
        {key:"createdAt",label:"Date",render:v=>v?new Date(v).toLocaleDateString("en-IN"):"—"},
        {key:"status",label:"Status",render:v=>statusBadge(v||"pending")},
      ]} rows={filtered} emptyText="No orders found"/>

      <Modal open={modal} onClose={()=>setModal(false)} title="New Order">
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <FormField label="Buyer">
            <select value={form.buyerId} onChange={e=>setForm(p=>({...p,buyerId:e.target.value}))} className="inp" style={{background:C.card,color:C.t1}}>
              <option value="" style={{background:C.card}}>Select buyer…</option>
              {buyers.map(b=><option key={b._id} value={b._id} style={{background:C.card,color:C.t1}}>{b.name}</option>)}
            </select>
          </FormField>
          {[
            {key:"productName",label:"Product Name",ph:"Product X"},
            {key:"hsnCode",label:"HSN Code",ph:"1234"},
            {key:"quantity",label:"Quantity",ph:"10",type:"number"},
            {key:"unitPrice",label:"Unit Price (₹)",ph:"500",type:"number"},
            {key:"notes",label:"Notes",ph:"Info…"},
          ].map(f=>(
            <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} type={f.type}/></FormField>
          ))}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button className="btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave}>Create Order</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsPage({addToast}){
  const [data,setData]=useState(null);
  const [attData,setAttData]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const [uR,oR,sR,aR]=await Promise.allSettled([
          apiFetch("/users").then(r=>r.json()),
          apiFetch("/orders").then(r=>r.json()),
          apiFetch("/salaries").then(r=>r.json()),
          apiFetch("/attendance").then(r=>r.json()),
        ]);
        const users=safeArr(uR.value,"users","data");
        const orders=safeArr(oR.value,"orders","data");
        const salaries=safeArr(sR.value,"salaries","data");
        const att=safeArr(aR.value,"attendance","records","data");
        const deptBreakdown=users.reduce((acc,u)=>{const d=u.department||"Other";acc[d]=(acc[d]||0)+1;return acc;},{});

        // Attendance stats
        const present=att.filter(a=>["present","on_time","early"].includes(a.status?.toLowerCase())).length;
        const absent=att.filter(a=>a.status?.toLowerCase()==="absent").length;
        const late=att.filter(a=>a.status?.toLowerCase()==="late").length;
        const halfDay=att.filter(a=>a.status?.toLowerCase()==="half_day").length;

        setAttData([
          {name:"Present",value:present,color:C.green},
          {name:"Absent",value:absent,color:C.red},
          {name:"Late",value:late,color:C.amber},
          {name:"Half Day",value:halfDay,color:C.blue},
        ]);

        setData({
          totalUsers:users.length,activeUsers:users.filter(u=>u.isActive!==false).length,
          totalOrders:orders.length,completedOrders:orders.filter(o=>o.status==="completed").length,
          totalRevenue:orders.reduce((s,o)=>s+(o.totalAmount||0),0),
          totalPayroll:salaries.reduce((s,x)=>s+(x.netSalary||x.totalSalary||0),0),
          deptBreakdown,deptData:Object.entries(deptBreakdown).map(([name,value])=>({name,value})),
          totalAtt:att.length,present,absent,late,halfDay,
        });
      }catch{addToast("Failed","error");}
      setLoading(false);
    })();
  },[]);

  const fmt=n=>`₹${(n||0).toLocaleString("en-IN")}`;
  const pct=(a,b)=>b?`${((a/b)*100).toFixed(1)}%`:"0%";

  return(
    <PageShell title="Analytics" sub="Performance insights">
      {loading?<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>{Array(6).fill(0).map((_,i)=><Sk key={i} h={120} r={16}/>)}</div>:(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:20}}>
            {[
              {l:"Total Employees",v:data.totalUsers,g:`linear-gradient(135deg,${C.accent},${C.accentD})`,icon:Users},
              {l:"Active Rate",v:pct(data.activeUsers,data.totalUsers),g:"linear-gradient(135deg,#22c55e,#16a34a)",icon:Activity},
              {l:"Total Revenue",v:fmt(data.totalRevenue),g:"linear-gradient(135deg,#a855f7,#7c3aed)",icon:TrendingUp},
              {l:"Order Completion",v:pct(data.completedOrders,data.totalOrders),g:"linear-gradient(135deg,#06b6d4,#0284c7)",icon:CheckCircle2},
              {l:"Total Payroll",v:fmt(data.totalPayroll),g:"linear-gradient(135deg,#f59e0b,#d97706)",icon:Wallet},
              {l:"Total Orders",v:data.totalOrders,g:"linear-gradient(135deg,#3b82f6,#2563eb)",icon:Package},
            ].map(s=><StatCard key={s.l} label={s.l} value={s.v} gradient={s.g} icon={s.icon}/>)}
          </div>

          {/* Attendance Analytics */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,marginBottom:16}}>
            <h2 style={{fontSize:15,fontWeight:700,color:C.t1,marginBottom:16}}>Attendance Analytics</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                  {attData.map(x=>(
                    <div key={x.name} style={{background:C.panel,borderRadius:10,padding:"12px 16px"}}>
                      <p style={{fontSize:11,color:C.t2,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{x.name}</p>
                      <p style={{fontSize:24,fontWeight:800,color:x.color}}>{x.value}</p>
                      <p style={{fontSize:11,color:C.t2,marginTop:3}}>{pct(x.value,data.totalAtt)} of records</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={attData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {attData.map((x,i)=><Cell key={i} fill={x.color}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                  {attData.map(x=>(
                    <div key={x.name} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.t2}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:x.color}}/>{x.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
              <h2 style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:16}}>Department Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.deptData} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                  <XAxis type="number" tick={{fill:C.t3,fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{fill:C.t2,fontSize:11}} axisLine={false} tickLine={false} width={80}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="value" name="Employees" radius={[0,4,4,0]}>
                    {data.deptData.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20}}>
              <h2 style={{fontSize:14,fontWeight:700,color:C.t1,marginBottom:16}}>Department Distribution</h2>
              <div style={{display:"flex",alignItems:"center",gap:20}}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={data.deptData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                      {data.deptData.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}
                    </Pie>
                    <Tooltip content={<CustomTooltip/>}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                  {data.deptData.map((d,i)=>(
                    <div key={d.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{width:9,height:9,borderRadius:2,background:CC[i%CC.length]}}/>
                        <span style={{fontSize:12,color:C.t2}}>{d.name}</span>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:C.t1}}>{d.value}</span>
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

// ─── COMPANY SETTINGS ─────────────────────────────────────────────────────────
function CompanyPage({addToast}){
  const [settings,setSettings]=useState({
    companyName:"",email:"",phone:"",address:"",website:"",gstNumber:"",
    sessionStartTime:"09:00",sessionEndTime:"18:00",
    gracePeriod:15,earlyWindow:30,minimumWorkHours:8,sessionTimeoutHours:8,
  });
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [tab,setTab]=useState("general");

  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{
        const r=await apiFetch("/company");
        const d=await r.json();
        const comp=d?.company||d;
        if(comp&&typeof comp==="object"){
          setSettings(p=>({...p,...comp}));
        }
      }catch{}
      setLoading(false);
    })();
  },[]);

  const handleSave=async()=>{
    setSaving(true);
    try{
      const r=await apiFetch("/company",{method:"PUT",body:JSON.stringify(settings)});
      if(!r.ok) throw new Error();
      addToast("Settings saved successfully","success");
    }catch{addToast("Failed to save — check backend connection","error");}
    setSaving(false);
  };

  return(
    <PageShell title="Company Settings" sub="Configure your organization">
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[{id:"general",l:"General"},{id:"attendance",l:"Attendance Rules"},{id:"session",l:"Session Control"}].map(t=>(
          <button key={t.id} className={`tab-btn ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>
      {loading?<div style={{display:"flex",flexDirection:"column",gap:14}}>{Array(6).fill(0).map((_,i)=><Sk key={i} h={42}/>)}</div>:(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:28,maxWidth:700}}>
          {tab==="general"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[{key:"companyName",label:"Company Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},{key:"website",label:"Website"},{key:"gstNumber",label:"GST Number"}].map(f=>(
                <FormField key={f.key} label={f.label}><Inp value={settings[f.key]||""} onChange={e=>setSettings(p=>({...p,[f.key]:e.target.value}))}/></FormField>
              ))}
              <div style={{gridColumn:"1/-1"}}>
                <FormField label="Address"><Inp value={settings.address||""} onChange={e=>setSettings(p=>({...p,address:e.target.value}))}/></FormField>
              </div>
            </div>
          )}
          {tab==="attendance"&&(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{background:C.panel,borderRadius:12,padding:14,marginBottom:4}}>
                <p style={{fontSize:12,color:C.t2}}>These settings control how attendance statuses are calculated automatically for all employees.</p>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <FormField label="Session Start Time">
                  <input type="time" value={settings.sessionStartTime||"09:00"} onChange={e=>setSettings(p=>({...p,sessionStartTime:e.target.value}))} className="inp"/>
                </FormField>
                <FormField label="Session End Time">
                  <input type="time" value={settings.sessionEndTime||"18:00"} onChange={e=>setSettings(p=>({...p,sessionEndTime:e.target.value}))} className="inp"/>
                </FormField>
                <FormField label="Grace Period (minutes after start = LATE)">
                  <Inp value={String(settings.gracePeriod||"")} onChange={e=>setSettings(p=>({...p,gracePeriod:e.target.value}))} type="number" placeholder="15"/>
                </FormField>
                <FormField label="Early Window (minutes before start = EARLY)">
                  <Inp value={String(settings.earlyWindow||"")} onChange={e=>setSettings(p=>({...p,earlyWindow:e.target.value}))} type="number" placeholder="30"/>
                </FormField>
                <FormField label="Min Work Hours (below = HALF DAY)">
                  <Inp value={String(settings.minimumWorkHours||"")} onChange={e=>setSettings(p=>({...p,minimumWorkHours:e.target.value}))} type="number" placeholder="8"/>
                </FormField>
              </div>
              <div style={{background:C.panel,borderRadius:12,padding:16}}>
                <p style={{fontSize:12,fontWeight:600,color:C.t2,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em"}}>Status Logic</p>
                {[
                  {s:"EARLY",d:`Login more than ${settings.earlyWindow||30} min before ${settings.sessionStartTime||"09:00"}`,c:C.cyan},
                  {s:"ON TIME",d:`Login at or before ${settings.sessionStartTime||"09:00"}`,c:C.green},
                  {s:"LATE",d:`Login within ${settings.gracePeriod||15} min after start`,c:C.amber},
                  {s:"ABSENT",d:"Login after grace period or no login",c:C.red},
                  {s:"HALF DAY",d:`Works less than ${settings.minimumWorkHours||8} hours`,c:C.purple},
                ].map(x=>(
                  <div key={x.s} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <Badge label={x.s} color={x.c}/>
                    <span style={{fontSize:12,color:C.t2}}>{x.d}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab==="session"&&(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={{background:C.panel,borderRadius:12,padding:14}}>
                <p style={{fontSize:12,color:C.t2}}>Control how long employees stay logged in before being automatically signed out.</p>
              </div>
              <FormField label="Default Session Timeout (hours)">
                <Inp value={String(settings.sessionTimeoutHours||"")} onChange={e=>setSettings(p=>({...p,sessionTimeoutHours:e.target.value}))} type="number" placeholder="8"/>
              </FormField>
              <div style={{background:C.amberG,border:`1px solid ${C.amber}33`,borderRadius:10,padding:"12px 16px",fontSize:12,color:C.amber}}>
                After {settings.sessionTimeoutHours||8} hours of login, employees will be automatically signed out.
              </div>
            </div>
          )}
          <div style={{marginTop:24,display:"flex",justifyContent:"flex-end",gap:10}}>
            <span style={{fontSize:12,color:C.t2,alignSelf:"center"}}>Changes apply to all employees</span>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Settings"}</button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

// ─── AUDIT ────────────────────────────────────────────────────────────────────
function AuditPage({addToast}){
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  useEffect(()=>{
    (async()=>{
      setLoading(true);
      try{const r=await apiFetch("/audit");const d=await r.json();setLogs(safeArr(d,"logs","auditLogs","data"));}catch{}
      setLoading(false);
    })();
  },[]);
  const filtered=logs.filter(l=>!search||[l.action,l.userId?.name,l.module].some(f=>f?.toLowerCase().includes(search.toLowerCase())));
  return(
    <PageShell title="Audit Log" sub="System activity" actions={<Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{width:220}}/>}>
      <Table loading={loading} columns={[
        {key:"createdAt",label:"Time",render:v=>v?<span style={{fontSize:12,color:C.t2}}>{new Date(v).toLocaleString("en-IN")}</span>:"—"},
        {key:"userId",label:"User",render:v=><span style={{fontWeight:500}}>{v?.name||"—"}</span>},
        {key:"module",label:"Module",render:v=><span style={{color:C.accent}}>{v||"—"}</span>},
        {key:"action",label:"Action",render:v=><Badge label={v||"—"} color={C.accent}/>},
        {key:"details",label:"Details",render:v=><span style={{color:C.t3,fontSize:12}}>{typeof v==="object"?JSON.stringify(v):v||"—"}</span>},
      ]} rows={filtered} emptyText="No audit records"/>
    </PageShell>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePage({addToast,user}){
  const [form,setForm]=useState({name:user?.name||"",email:user?.email||"",phone:"",currentPassword:"",newPassword:""});
  const [saving,setSaving]=useState(false);
  const handleSave=async()=>{
    setSaving(true);
    try{await apiFetch(`/users/${user?._id||user?.id}`,{method:"PUT",body:JSON.stringify(form)});addToast("Updated","success");}
    catch{addToast("Failed","error");}
    setSaving(false);
  };
  return(
    <PageShell title="Profile" sub="Manage your account">
      <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:20,maxWidth:800}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:24,display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
          <div style={{width:80,height:80,borderRadius:20,background:C.accentG,border:`2px solid ${C.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,fontWeight:800,color:C.accent}}>{(form.name?.[0]||"U").toUpperCase()}</div>
          <div style={{textAlign:"center"}}><p style={{fontWeight:700,fontSize:15,color:C.t1}}>{form.name||"User"}</p><p style={{fontSize:12,color:C.t2,marginTop:4}}>{form.email}</p></div>
          {roleBadge(user?.role)}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:24}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[{key:"name",label:"Full Name"},{key:"email",label:"Email",type:"email"},{key:"phone",label:"Phone"}].map(f=>(
              <FormField key={f.key} label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} type={f.type}/></FormField>
            ))}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:20}}>
              <p style={{fontSize:11,fontWeight:700,color:C.t3,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Change Password</p>
              {[{key:"currentPassword",label:"Current Password"},{key:"newPassword",label:"New Password"}].map(f=>(
                <div key={f.key} style={{marginBottom:16}}><FormField label={f.label}><Inp value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} type="password"/></FormField></div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end"}}>
              <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving?"Saving…":"Save Changes"}</button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// ─── SESSION TIMEOUT ──────────────────────────────────────────────────────────
function useSessionTimeout(user,onLogout){
  useEffect(()=>{
    if(!user) return;
    let timer;
    (async()=>{
      try{
        const r=await apiFetch("/company");
        const d=await r.json();
        const hours=Number((d?.company||d)?.sessionTimeoutHours)||8;
        timer=setTimeout(()=>{alert("Your session has expired. Please log in again.");onLogout();},hours*60*60*1000);
      }catch{}
    })();
    return()=>clearTimeout(timer);
  },[user]);
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({active,setActive,onLogout,user}){
  const nav=isAdmin(user)?ADMIN_NAV:EMP_NAV;
  return(
    <div style={{width:220,minWidth:220,height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden",background:"rgba(8,12,22,0.97)",borderRight:`1px solid ${C.border}`,backdropFilter:"blur(20px)"}}>
      <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${C.accent},${C.purple})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 14px rgba(99,102,241,0.4)`}}><Building2 size={19} color="#fff"/></div>
          <div>
            <p style={{fontWeight:800,fontSize:15,color:C.t1,letterSpacing:"-.02em"}}>NEXUS</p>
            <p style={{fontSize:10,color:C.t3}}>{isAdmin(user)?"Admin Panel":"Employee Portal"}</p>
          </div>
        </div>
      </div>
      <nav style={{flex:1,overflowY:"auto",padding:"10px 8px"}}>
        {nav.map(sec=>(
          <div key={sec.section} style={{marginBottom:18}}>
            <p style={{fontSize:10,fontWeight:700,color:C.t3,letterSpacing:".1em",padding:"0 8px",marginBottom:5}}>{sec.section}</p>
            {sec.items.map(item=>(
              <button key={item.id} onClick={()=>setActive(item.id)} className={`nav-btn${active===item.id?" active":""}`}>
                <item.icon size={16} style={{flexShrink:0}}/><span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div style={{padding:"10px 8px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:11,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`}}>
          <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:C.accentG,border:`1px solid ${C.accent}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.accent}}>{(user?.name?.[0]||"A").toUpperCase()}</div>
          <div style={{flex:1,overflow:"hidden"}}>
            <p style={{fontSize:13,fontWeight:600,color:C.t1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user?.name||"Admin"}</p>
            <p style={{fontSize:10,color:C.t3}}>{user?.role==="super_admin"?"Super Admin":user?.role==="admin"?"Admin":"Employee"}</p>
          </div>
          <button onClick={onLogout} title="Sign out" style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:C.t3,background:"transparent",border:"none",cursor:"pointer",transition:"all .18s",flexShrink:0}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.redG;e.currentTarget.style.color=C.red;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.t3;}}
          ><LogOut size={14}/></button>
        </div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function TopBar({clock}){
  return(
    <div style={{height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",background:"rgba(8,12,22,0.9)",borderBottom:`1px solid ${C.border}`,backdropFilter:"blur(20px)",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,flex:1,maxWidth:360,cursor:"pointer"}}>
          <Search size={13} color={C.t3}/>
          <span style={{fontSize:13,color:C.t3}}>Search anything…</span>
          <span style={{marginLeft:"auto",fontSize:11,color:C.t3,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:5,padding:"1px 6px"}}>⌘K</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:C.t2,fontWeight:500}}>
          <Clock size={12} color={C.t3}/>{clock}
        </div>
        <div style={{position:"relative"}}>
          <button style={{width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:C.t2,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,cursor:"pointer",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.color=C.accent;e.currentTarget.style.borderColor=C.accent+"44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.t2;e.currentTarget.style.borderColor=C.border;}}
          ><Bell size={15}/></button>
          <span style={{position:"absolute",top:8,right:8,width:7,height:7,borderRadius:"50%",background:C.accent,border:`2px solid ${C.bg}`,animation:"blink 2s infinite"}}/>
        </div>
        {[Moon,Maximize2].map((Icon,i)=>(
          <button key={i} style={{width:36,height:36,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",color:C.t2,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,cursor:"pointer",transition:"all .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.color=C.accent;e.currentTarget.style.borderColor=C.accent+"44";}}
            onMouseLeave={e=>{e.currentTarget.style.color=C.t2;e.currentTarget.style.borderColor=C.border;}}
          ><Icon size={15}/></button>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({onLogin}){
  const [form,setForm]=useState({email:"",password:""});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [showForgot,setShowForgot]=useState(false);
  const [forgotEmail,setForgotEmail]=useState("");
  const [forgotSent,setForgotSent]=useState(false);

  const handleLogin=async()=>{
    if(!form.email||!form.password) return setError("Please fill in all fields");
    setLoading(true);setError("");
    try{
      const r=await fetch(`${API}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d=await r.json();
      if(!r.ok) throw new Error(d.message||"Invalid credentials");
      localStorage.setItem("ems_token",d.token||d.accessToken||"");
      localStorage.setItem("ems_user",JSON.stringify(d.user||{name:"Admin",email:form.email}));
      onLogin(d.user||{name:"Admin",email:form.email});
    }catch(e){setError(e.message||"Login failed");}
    setLoading(false);
  };

  const handleForgot=async()=>{
    if(!forgotEmail) return;
    try{
      await fetch(`${API}/auth/forgot-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:forgotEmail})});
      setForgotSent(true);
    }catch{}
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:`radial-gradient(ellipse at 30% 20%,rgba(99,102,241,0.12) 0%,transparent 55%),radial-gradient(ellipse at 75% 80%,rgba(168,85,247,0.08) 0%,transparent 55%),${C.bg}`}}>
      <div className="fadeUp" style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,borderRadius:18,background:`linear-gradient(135deg,${C.accent},${C.purple})`,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:`0 8px 32px rgba(99,102,241,0.4)`}}><Building2 size={28} color="#fff"/></div>
          <h1 style={{fontSize:26,fontWeight:800,color:C.t1,letterSpacing:"-.02em",marginBottom:6}}>Nexus Portal</h1>
          <p style={{fontSize:13,color:C.t2}}>Sign in to your workspace</p>
        </div>

        {!showForgot?(
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:20,padding:30,boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
            {error&&<div style={{background:C.redG,border:`1px solid ${C.red}33`,borderRadius:10,padding:"10px 14px",marginBottom:20,fontSize:13,color:C.red,display:"flex",alignItems:"center",gap:8}}><AlertCircle size={14}/>{error}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <FormField label="Email address"><Inp value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="admin@nexus.com" type="email"/></FormField>
              <FormField label="Password"><Inp value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="••••••••" type="password"/></FormField>
              <div style={{textAlign:"right"}}>
                <button onClick={()=>setShowForgot(true)} style={{background:"none",border:"none",color:C.accent,fontSize:12,cursor:"pointer",fontWeight:500}}>Forgot password?</button>
              </div>
              <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:12,background:`linear-gradient(135deg,${C.accent},${C.accentD})`,color:"#fff",fontSize:14,fontWeight:700,border:"none",cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1,boxShadow:`0 4px 20px rgba(99,102,241,0.4)`,transition:"all .18s"}}
                onMouseEnter={e=>{if(!loading){e.currentTarget.style.filter="brightness(1.1)";e.currentTarget.style.transform="translateY(-1px)";}}}
                onMouseLeave={e=>{e.currentTarget.style.filter="";e.currentTarget.style.transform="";}}
              >{loading?"Signing in…":"Sign In"}</button>
            </div>
          </div>
        ):(
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:20,padding:30,boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}>
            <button onClick={()=>setShowForgot(false)} style={{background:"none",border:"none",color:C.t2,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4,marginBottom:16}}><ChevronLeft size={14}/>Back to login</button>
            <h3 style={{fontSize:16,fontWeight:700,color:C.t1,marginBottom:6}}>Reset Password</h3>
            <p style={{fontSize:13,color:C.t2,marginBottom:20}}>Enter your email address and we'll send you a reset link.</p>
            {forgotSent?(
              <div style={{background:C.greenG,border:`1px solid ${C.green}33`,borderRadius:10,padding:"12px 16px",fontSize:13,color:C.green}}>Reset link sent! Check your email.</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <FormField label="Email address"><Inp value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="your@email.com" type="email"/></FormField>
                <button onClick={handleForgot} className="btn-pri" style={{width:"100%",justifyContent:"center",padding:"12px"}}>Send Reset Link</button>
              </div>
            )}
          </div>
        )}

        <p style={{textAlign:"center",fontSize:11,color:C.t3,marginTop:24,lineHeight:1.6}}>
          © 2026 Nexus Enterprises Exporters Private Limited.<br/>
          All Rights Reserved. Powered by <span style={{color:C.accent,fontWeight:600}}>Nexus TZ</span>
        </p>
      </div>
    </div>
  );
}

// ─── TASKS PAGE ───────────────────────────────────────────────────────────────
function TasksPage({ addToast, user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", assignedTo: "", deadline: "", priority: "medium" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tR, uR] = await Promise.allSettled([
        apiFetch("/tasks").then(r => r.json()),
        isAdmin(user) ? apiFetch("/users").then(r => r.json()) : Promise.resolve([]),
      ]);
      setTasks(safeArr(tR.value, "tasks", "data"));
      if (isAdmin(user)) setUsers(safeArr(uR.value, "users", "data"));
    } catch { addToast("Failed to load tasks", "error"); }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(t =>
    !search || [t.title, t.description, t.assignedTo?.name].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!form.title || !form.assignedTo) return addToast("Title and assignee required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/tasks", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Task assigned", "success");
      setModal(false);
      setForm({ title: "", description: "", assignedTo: "", deadline: "", priority: "medium" });
      load();
    } catch { addToast("Failed to create task", "error"); }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/tasks/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      addToast(`Task marked ${status}`, "success");
      load();
    } catch { addToast("Failed to update", "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await apiFetch(`/tasks/${id}`, { method: "DELETE" });
      addToast("Task deleted", "success");
      load();
    } catch { addToast("Failed", "error"); }
  };

  const priorityColor = (p) => {
    if (p === "high") return C.red;
    if (p === "medium") return C.amber;
    return C.green;
  };

  const statusColor = (s) => {
    if (s === "completed") return C.green;
    if (s === "in_progress") return C.accent;
    if (s === "cancelled") return C.red;
    return C.amber;
  };

  return (
    <PageShell
      title={isAdmin(user) ? "Task Management" : "My Tasks"}
      sub={isAdmin(user) ? "Assign and track employee tasks" : "Tasks assigned to you"}
      actions={
        <>
          <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" icon={Search} style={{ width: 220 }} />
          {isAdmin(user) && <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Assign Task</button>}
        </>
      }
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array(4).fill(0).map((_, i) => <Sk key={i} h={80} r={12} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", color: C.t2, fontSize: 14 }}>
          No tasks found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(task => (
            <div key={task._id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.t1 }}>{task.title}</h3>
                    <Badge label={(task.priority || "medium").toUpperCase()} color={priorityColor(task.priority)} />
                    <Badge label={(task.status || "pending").replace("_", " ").toUpperCase()} color={statusColor(task.status)} />
                  </div>
                  {task.description && <p style={{ fontSize: 13, color: C.t2, marginBottom: 8 }}>{task.description}</p>}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {task.assignedTo && (
                      <span style={{ fontSize: 12, color: C.t2 }}>
                        👤 <span style={{ color: C.t1, fontWeight: 500 }}>{task.assignedTo?.name || "—"}</span>
                      </span>
                    )}
                    {task.deadline && (
                      <span style={{ fontSize: 12, color: new Date(task.deadline) < new Date() ? C.red : C.t2 }}>
                        📅 {new Date(task.deadline).toLocaleDateString("en-IN")}
                        {new Date(task.deadline) < new Date() && task.status !== "completed" && <span style={{ color: C.red, fontWeight: 600 }}> (Overdue)</span>}
                      </span>
                    )}
                    {task.createdAt && (
                      <span style={{ fontSize: 12, color: C.t3 }}>Created {new Date(task.createdAt).toLocaleDateString("en-IN")}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {/* Employee can update status */}
                  {!isAdmin(user) && task.status !== "completed" && (
                    <>
                      <button className="btn-icon" style={{ background: C.accentG, color: C.accent, width: "auto", padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600 }}
                        onClick={() => updateStatus(task._id, "in_progress")}>In Progress</button>
                      <button className="btn-icon" style={{ background: C.greenG, color: C.green, width: "auto", padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600 }}
                        onClick={() => updateStatus(task._id, "completed")}>✓ Done</button>
                    </>
                  )}
                  {/* Admin controls */}
                  {isAdmin(user) && (
                    <>
                      {task.status !== "completed" && (
                        <button className="btn-icon" style={{ background: C.greenG, color: C.green, width: "auto", padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600 }}
                          onClick={() => updateStatus(task._id, "completed")}>✓ Complete</button>
                      )}
                      <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(task._id)}><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Assign New Task">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Task Title">
            <Inp value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Complete monthly report" />
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Task details…" className="inp" style={{ height: 80, resize: "vertical" }} />
          </FormField>
          <FormField label="Assign To">
            <select value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))} className="inp" style={{ background: C.card, color: C.t1 }}>
              <option value="" style={{ background: C.card }}>Select employee…</option>
              {users.map(u => <option key={u._id} value={u._id} style={{ background: C.card, color: C.t1 }}>{u.name}</option>)}
            </select>
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Deadline">
              <Inp value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} type="date" />
            </FormField>
            <FormField label="Priority">
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="inp" style={{ background: C.card, color: C.t1 }}>
                <option value="low" style={{ background: C.card }}>Low</option>
                <option value="medium" style={{ background: C.card }}>Medium</option>
                <option value="high" style={{ background: C.card }}>High</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Assign Task"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── LEAVE PAGE ───────────────────────────────────────────────────────────────
function LeavePage({ addToast, user }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ reason: "", fromDate: "", toDate: "", type: "sick" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/leaves");
      const d = await r.json();
      setLeaves(safeArr(d, "leaves", "data"));
    } catch { addToast("Failed to load leaves", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = leaves.filter(l =>
    !search || [l.userId?.name, l.reason, l.type].some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async () => {
    if (!form.reason || !form.fromDate || !form.toDate) return addToast("All fields required", "error");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (file) fd.append("file", file);
      const r = await fetch(`${API}/leaves`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!r.ok) throw new Error();
      addToast("Leave request submitted", "success");
      setModal(false);
      setForm({ reason: "", fromDate: "", toDate: "", type: "sick" });
      setFile(null);
      load();
    } catch { addToast("Failed to submit", "error"); }
    setSaving(false);
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const r = await apiFetch(`/leaves/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error();
      addToast(`Leave ${status}`, "success");
      load();
    } catch { addToast("Failed to update", "error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this leave request?")) return;
    try {
      await apiFetch(`/leaves/${id}`, { method: "DELETE" });
      addToast("Removed", "success");
      load();
    } catch { addToast("Failed", "error"); }
  };

  const leaveStatusColor = (s) => {
    if (s === "approved") return C.green;
    if (s === "rejected") return C.red;
    if (s === "removed") return C.t3;
    return C.amber;
  };

  const getDays = (from, to) => {
    if (!from || !to) return 0;
    const diff = new Date(to) - new Date(from);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <PageShell
      title={isAdmin(user) ? "Leave Management" : "My Leave Requests"}
      sub={isAdmin(user) ? "Review and manage employee leaves" : "Request and track your leaves"}
      actions={
        <>
          {isAdmin(user) && <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" icon={Search} style={{ width: 220 }} />}
          {!isAdmin(user) && <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Request Leave</button>}
        </>
      }
    >
      {/* Stats for admin */}
      {isAdmin(user) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { l: "Total Requests", v: leaves.length, c: C.accent },
            { l: "Pending", v: leaves.filter(l => l.status === "pending" || !l.status).length, c: C.amber },
            { l: "Approved", v: leaves.filter(l => l.status === "approved").length, c: C.green },
            { l: "Rejected", v: leaves.filter(l => l.status === "rejected").length, c: C.red },
          ].map(x => (
            <div key={x.l} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px" }}>
              <p style={{ fontSize: 11, color: C.t2, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{x.l}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: x.c }}>{x.v}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array(4).fill(0).map((_, i) => <Sk key={i} h={90} r={12} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", color: C.t2, fontSize: 14 }}>
          No leave requests found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(leave => (
            <div key={leave._id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accentG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.accent }}>
                      {(leave.userId?.name || user?.name || "?")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: C.t1 }}>{leave.userId?.name || user?.name || "—"}</p>
                      <p style={{ fontSize: 11, color: C.t2 }}>{(leave.type || "sick").toUpperCase()} LEAVE</p>
                    </div>
                    <Badge label={(leave.status || "PENDING").toUpperCase()} color={leaveStatusColor(leave.status)} />
                  </div>
                  <p style={{ fontSize: 13, color: C.t2, marginBottom: 8 }}>{leave.reason}</p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: C.t2 }}>
                      📅 {leave.fromDate ? new Date(leave.fromDate).toLocaleDateString("en-IN") : "—"} → {leave.toDate ? new Date(leave.toDate).toLocaleDateString("en-IN") : "—"}
                    </span>
                    <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>
                      {getDays(leave.fromDate, leave.toDate)} day{getDays(leave.fromDate, leave.toDate) !== 1 ? "s" : ""}
                    </span>
                    {leave.fileUrl && (
                      <a href={`${API.replace("/api", "")}${leave.fileUrl}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, color: C.accent, display: "flex", alignItems: "center", gap: 4 }}>
                        <Upload size={11} /> Attachment
                      </a>
                    )}
                    {leave.reviewedBy && (
                      <span style={{ fontSize: 12, color: C.t3 }}>Reviewed by: {leave.reviewedBy?.name}</span>
                    )}
                  </div>
                </div>
                {isAdmin(user) && (
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexDirection: "column", alignItems: "flex-end" }}>
                    {leave.status !== "approved" && (
                      <button className="btn-success" onClick={() => updateLeaveStatus(leave._id, "approved")}>✓ Approve</button>
                    )}
                    {leave.status !== "rejected" && (
                      <button className="btn-danger" onClick={() => updateLeaveStatus(leave._id, "rejected")}>✗ Reject</button>
                    )}
                    {leave.status === "pending" || !leave.status ? (
                      <button className="btn-ghost" style={{ padding: "5px 11px", fontSize: 12 }} onClick={() => updateLeaveStatus(leave._id, "pending")}>Pending</button>
                    ) : null}
                    <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(leave._id)}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Request Leave">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Leave Type">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="inp" style={{ background: C.card, color: C.t1 }}>
              {["sick", "casual", "annual", "emergency", "maternity", "paternity", "other"].map(t => (
                <option key={t} value={t} style={{ background: C.card, color: C.t1 }}>{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>
              ))}
            </select>
          </FormField>
          <FormField label="Reason">
            <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="Explain the reason for leave…" className="inp" style={{ height: 80, resize: "vertical" }} />
          </FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="From Date">
              <Inp value={form.fromDate} onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))} type="date" />
            </FormField>
            <FormField label="To Date">
              <Inp value={form.toDate} onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))} type="date" />
            </FormField>
          </div>
          {form.fromDate && form.toDate && (
            <div style={{ background: C.accentG, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.accent }}>
              Duration: {getDays(form.fromDate, form.toDate)} day{getDays(form.fromDate, form.toDate) !== 1 ? "s" : ""}
            </div>
          )}
          <FormField label="Supporting Document (optional)">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
              <button className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ padding: "7px 14px" }}><Upload size={14} />Attach File</button>
              {file && <span style={{ fontSize: 12, color: C.green }}>{file.name}</span>}
            </div>
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Submitting…" : "Submit Request"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── HOLIDAY PAGE ─────────────────────────────────────────────────────────────
function HolidayPage({ addToast, user }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", date: "", type: "public", description: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiFetch("/holidays");
      const d = await r.json();
      setHolidays(safeArr(d, "holidays", "data"));
    } catch { addToast("Failed to load holidays", "error"); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.name || !form.date) return addToast("Name and date required", "error");
    setSaving(true);
    try {
      const r = await apiFetch("/holidays", { method: "POST", body: JSON.stringify(form) });
      if (!r.ok) throw new Error();
      addToast("Holiday added", "success");
      setModal(false);
      setForm({ name: "", date: "", type: "public", description: "" });
      load();
    } catch { addToast("Failed to add holiday", "error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this holiday?")) return;
    try {
      await apiFetch(`/holidays/${id}`, { method: "DELETE" });
      addToast("Holiday removed", "success");
      load();
    } catch { addToast("Failed", "error"); }
  };

  const upcoming = holidays.filter(h => new Date(h.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = holidays.filter(h => new Date(h.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeColor = (t) => {
    if (t === "public") return C.accent;
    if (t === "optional") return C.amber;
    if (t === "restricted") return C.purple;
    return C.green;
  };

  return (
    <PageShell
      title="Holidays"
      sub={`${holidays.length} holidays this year`}
      actions={isAdmin(user) ? <button className="btn-pri" onClick={() => setModal(true)}><Plus size={14} />Add Holiday</button> : null}
    >
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array(5).fill(0).map((_, i) => <Sk key={i} h={64} r={12} />)}
        </div>
      ) : holidays.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "40px 20px", textAlign: "center", color: C.t2, fontSize: 14 }}>
          No holidays added yet. {isAdmin(user) && "Add the first holiday!"}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 12 }}>
                Upcoming Holidays <Badge label={String(upcoming.length)} color={C.green} />
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.map(h => (
                  <div key={h._id} style={{ background: C.card, border: `1px solid ${C.green}22`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ background: C.greenG, borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 60 }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{new Date(h.date).getDate()}</p>
                        <p style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>{new Date(h.date).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</p>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: C.t1, marginBottom: 3 }}>{h.name}</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Badge label={(h.type || "public").toUpperCase()} color={typeColor(h.type)} />
                          <span style={{ fontSize: 12, color: C.t2 }}>{new Date(h.date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                        {h.description && <p style={{ fontSize: 12, color: C.t3, marginTop: 3 }}>{h.description}</p>}
                      </div>
                    </div>
                    {isAdmin(user) && (
                      <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(h._id)}><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: C.t2, marginBottom: 12 }}>Past Holidays</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {past.map(h => (
                  <div key={h._id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", textAlign: "center", minWidth: 54 }}>
                        <p style={{ fontSize: 17, fontWeight: 800, color: C.t2 }}>{new Date(h.date).getDate()}</p>
                        <p style={{ fontSize: 10, color: C.t3, fontWeight: 600 }}>{new Date(h.date).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</p>
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13, color: C.t2, marginBottom: 2 }}>{h.name}</p>
                        <Badge label={(h.type || "public").toUpperCase()} color={C.t3} />
                      </div>
                    </div>
                    {isAdmin(user) && (
                      <button className="btn-icon" style={{ background: C.redG, color: C.red }} onClick={() => handleDelete(h._id)}><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add Holiday">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Holiday Name">
            <Inp value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Eid Al-Fitr" />
          </FormField>
          <FormField label="Date">
            <Inp value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" />
          </FormField>
          <FormField label="Type">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="inp" style={{ background: C.card, color: C.t1 }}>
              {["public", "optional", "restricted", "company"].map(t => (
                <option key={t} value={t} style={{ background: C.card, color: C.t1 }}>{t.charAt(0).toUpperCase() + t.slice(1)} Holiday</option>
              ))}
            </select>
          </FormField>
          <FormField label="Description (optional)">
            <Inp value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Holiday description…" />
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn-pri" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Add Holiday"}</button>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  injectCSS();
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("ems_user"));}catch{return null;}});
  const [activePage,setActivePage]=useState("dashboard");
  const [toasts,setToasts]=useState([]);
  const [clock,setClock]=useState("");

  useEffect(()=>{
    const tick=()=>setClock(new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[]);

  const addToast=useCallback((message,type="info")=>{
    const id=Date.now();setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  },[]);

  const handleLogin=u=>setUser(u);
  const handleLogout=()=>{localStorage.removeItem("ems_token");localStorage.removeItem("ems_user");setUser(null);};

  useSessionTimeout(user,handleLogout);

  if(!user) return <LoginPage onLogin={handleLogin}/>;

  const props={addToast,user,setPage:setActivePage};

  const ADMIN_PAGES={
    dashboard:<DashboardPage {...props}/>,
    employees:<EmployeesPage {...props}/>,
    attendance:<AttendancePage {...props}/>,
    worklogs:<WorklogsPage {...props}/>,
    salary:<SalaryPage {...props}/>,
    buyers:<BuyersPage {...props}/>,
    orders:<OrdersPage {...props}/>,
    analytics:<AnalyticsPage {...props}/>,
    company:<CompanyPage {...props}/>,
    audit:<AuditPage {...props}/>,
    profile:<ProfilePage {...props}/>,
    tasks:<TasksPage {...props}/>,
    leaves:<LeavePage {...props}/>,
    holidays:<HolidayPage {...props}/>,
    tools:<ToolsPage/>,
    chat:<ChatPage user={{id:user?._id||user?.id,name:user?.name,role:user?.role}} socket={null} onlineUsers={[]}/>,
  };

  const EMP_PAGES={
    dashboard:<DashboardPage {...props}/>,
    attendance:<AttendancePage {...props}/>,
    worklogs:<WorklogsPage {...props}/>,
    salary:<SalaryPage {...props}/>,
    profile:<ProfilePage {...props}/>,
    tasks:<TasksPage {...props}/>,
    leaves:<LeavePage {...props}/>,
    tools:<ToolsPage/>,
    chat:<ChatPage user={{id:user?._id||user?.id,name:user?.name,role:user?.role}} socket={null} onlineUsers={[]}/>,
  };

  const PAGES=isAdmin(user)?ADMIN_PAGES:EMP_PAGES;
  const currentPage=PAGES[activePage]||PAGES.dashboard;

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
      <Sidebar active={activePage} setActive={setActivePage} onLogout={handleLogout} user={user}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        <TopBar clock={clock}/>
        <div style={{flex:1,overflow:"hidden"}}>
          {currentPage}
        </div>
      </div>
      <Toast toasts={toasts}/>
    </div>
  );
}
