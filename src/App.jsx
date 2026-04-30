// src/App.jsx — Full EMS Frontend
// MongoDB backend · No Prisma · Railway-ready
import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ChatPage from './ChatPage.jsx';
import ToolsPage from './ToolsPage.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── API helper ────────────────────────────────────────────────
const api = {
  token:   ()    => localStorage.getItem('ems_token'),
  headers: ()    => ({ 'Content-Type':'application/json', ...(api.token()?{Authorization:`Bearer ${api.token()}`}:{}) }),
  async req(method, path, body) {
    const r = await fetch(`${API}/api${path}`, { method, headers: api.headers(), ...(body!==undefined?{body:JSON.stringify(body)}:{}) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || `Error ${r.status}`);
    return d;
  },
  get:  p     => api.req('GET', p),
  post: (p,b) => api.req('POST', p, b),
  put:  (p,b) => api.req('PUT', p, b),
  del:  p     => api.req('DELETE', p),
};

// ── Colours ───────────────────────────────────────────────────
const C = {
  bg:'#0f172a', surf:'#1e293b', alt:'#334155', bdr:'#334155',
  acc:'#6366f1', accH:'#4f46e5', accS:'rgba(99,102,241,.12)',
  ok:'#10b981', okS:'rgba(16,185,129,.12)',
  warn:'#f59e0b', warnS:'rgba(245,158,11,.12)',
  err:'#ef4444', errS:'rgba(239,68,68,.12)',
  tx:'#f1f5f9', txm:'#64748b', txs:'#94a3b8',
  purple:'#8b5cf6', teal:'#14b8a6',
};

// ── Primitives ────────────────────────────────────────────────
const Card = ({children, style={}}) => <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:14,padding:20,...style}}>{children}</div>;

const Btn = ({children,onClick,variant='primary',size='md',disabled=false,style={},type='button'}) => {
  const [hov,setHov]=useState(false);
  const vs={primary:{bg:hov?C.accH:C.acc,color:'#fff',border:'none'},ghost:{bg:hov?C.accS:'transparent',color:C.acc,border:`1px solid ${C.bdr}`},danger:{bg:hov?'#dc2626':C.err,color:'#fff',border:'none'},success:{bg:hov?'#059669':C.ok,color:'#fff',border:'none'},outline:{bg:hov?C.alt:'transparent',color:C.tx,border:`1px solid ${C.bdr}`}};
  const ss={sm:{padding:'5px 12px',fontSize:11},md:{padding:'8px 18px',fontSize:13},lg:{padding:'12px 26px',fontSize:15}};
  const v=vs[variant]||vs.primary; const s=ss[size]||ss.md;
  return <button type={type} onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{background:disabled?C.bdr:v.bg,color:disabled?C.txm:v.color,border:v.border,...s,borderRadius:8,fontWeight:600,cursor:disabled?'not-allowed':'pointer',transition:'all .15s',display:'inline-flex',alignItems:'center',gap:6,...style}}>{children}</button>;
};

const Input = ({label,value,onChange,type='text',placeholder,error,required,autoFocus}) => (
  <div style={{marginBottom:14}}>
    {label&&<label style={{display:'block',color:C.txs,fontSize:11,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:5}}>{label}{required&&' *'}</label>}
    <input autoFocus={autoFocus} type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:'100%',background:C.alt,border:`1px solid ${error?C.err:C.bdr}`,borderRadius:8,padding:'10px 13px',color:C.tx,fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}} />
    {error&&<div style={{color:C.err,fontSize:11,marginTop:3}}>{error}</div>}
  </div>
);

const Select = ({label,value,onChange,options,required}) => (
  <div style={{marginBottom:14}}>
    {label&&<label style={{display:'block',color:C.txs,fontSize:11,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:5}}>{label}{required&&' *'}</label>}
    <select value={value||''} onChange={e=>onChange(e.target.value)} style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'10px 13px',color:C.tx,fontSize:13,outline:'none',boxSizing:'border-box',cursor:'pointer',fontFamily:'inherit'}}>
      {options.map(o=><option key={o.value} value={o.value} style={{background:C.surf}}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({open,onClose,title,children,width=480}) => {
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}} onClick={onClose}>
      <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:16,width:'100%',maxWidth:width,maxHeight:'90vh',overflow:'auto',padding:26}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h2 style={{color:C.tx,fontSize:17,fontWeight:700,margin:0}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.txm,cursor:'pointer',fontSize:22}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({message,type,onClose}) => {
  const cols={success:C.ok,error:C.err,info:C.acc,warning:C.warn};
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[onClose]);
  return (
    <div style={{position:'fixed',bottom:22,right:22,zIndex:2000,background:C.surf,border:`1px solid ${cols[type]||cols.info}`,borderRadius:10,padding:'11px 18px',color:C.tx,fontSize:13,boxShadow:'0 8px 32px rgba(0,0,0,.4)',display:'flex',alignItems:'center',gap:10,minWidth:220,maxWidth:320}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:cols[type]||cols.info,flexShrink:0}} />
      {message}
    </div>
  );
};

const Badge = ({label,color='blue'}) => {
  const m={blue:{bg:C.accS,tx:C.acc},green:{bg:C.okS,tx:C.ok},yellow:{bg:C.warnS,tx:C.warn},red:{bg:C.errS,tx:C.err},gray:{bg:'rgba(100,116,139,.15)',tx:C.txs},purple:{bg:'rgba(139,92,246,.12)',tx:C.purple}};
  const cl=m[color]||m.blue;
  return <span style={{background:cl.bg,color:cl.tx,padding:'2px 9px',borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',whiteSpace:'nowrap'}}>{label}</span>;
};

const Spinner = ({size=36}) => (
  <div style={{display:'flex',justifyContent:'center',padding:48}}>
    <div style={{width:size,height:size,border:`3px solid ${C.bdr}`,borderTop:`3px solid ${C.acc}`,borderRadius:'50%',animation:'spin .8s linear infinite'}} />
  </div>
);

const Avatar = ({name,size=34,color=C.acc}) => {
  const init=(name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  return <div style={{width:size,height:size,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.36,fontWeight:700,color:'#fff',flexShrink:0}}>{init}</div>;
};

const StatCard = ({icon,label,value,sub,color=C.acc}) => (
  <Card style={{position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,right:0,width:56,height:56,borderRadius:'0 14px 0 56px',background:`${color}15`}} />
    <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
      <div style={{width:42,height:42,borderRadius:10,background:`${color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{icon}</div>
      <div>
        <div style={{color:C.txm,fontSize:10,fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:3}}>{label}</div>
        <div style={{color:C.tx,fontSize:26,fontWeight:800,lineHeight:1}}>{value??'—'}</div>
        {sub&&<div style={{color:C.txs,fontSize:11,marginTop:3}}>{sub}</div>}
      </div>
    </div>
  </Card>
);

const ProgressBar = ({value,color=C.acc}) => (
  <div style={{background:C.bdr,borderRadius:5,height:5,overflow:'hidden'}}>
    <div style={{width:`${Math.min(100,Math.max(0,value))}%`,height:'100%',background:color,borderRadius:5,transition:'width .5s'}} />
  </div>
);

// ── Live Clock ────────────────────────────────────────────────
const LiveClock = () => {
  const [time,setTime]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),1000);return()=>clearInterval(t);},[]);
  return <span style={{color:C.txs,fontSize:12,fontFamily:'monospace'}}>{time.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>;
};

// ── Auth Page ─────────────────────────────────────────────────
const AuthPage = ({onLogin}) => {
  const [mode,setMode]=useState('login');
  const [form,setForm]=useState({name:'',email:'',password:'',role:'employee',jobTitle:'',department:''});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [company,setCompany]=useState({name:'EMS',logoUrl:''});

  useEffect(()=>{
    api.get('/company').then(d=>setCompany(d.data)).catch(()=>{});
  },[]);

  const handleSubmit = async () => {
    setError('');
    if (!form.email||!form.password){setError('Email and password required');return;}
    if (mode==='signup'&&!form.name){setError('Name required');return;}
    if (mode==='signup'&&form.password.length<8){setError('Password min 8 chars');return;}
    try {
      setLoading(true);
      const endpoint = mode==='login'?'/auth/login':'/auth/register';
      const d = await api.post(endpoint, form);
      localStorage.setItem('ems_token', d.token);
      onLogin(d.user, d.token);
    } catch(err){ setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Segoe UI',sans-serif",padding:20}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:${C.bg};color:${C.tx}}@keyframes spin{to{transform:rotate(360deg)}}input,select{font-family:inherit}`}</style>
      <div style={{position:'absolute',inset:0,backgroundImage:`radial-gradient(circle at 20% 50%,rgba(99,102,241,.08) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(139,92,246,.06) 0%,transparent 50%)`,pointerEvents:'none'}} />
      <div style={{width:'100%',maxWidth:420,position:'relative'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          {company.logoUrl ? <img src={company.logoUrl} alt="logo" style={{height:52,marginBottom:12,objectFit:'contain'}} /> :
            <div style={{display:'inline-flex',width:52,height:52,borderRadius:15,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:'#fff',marginBottom:12,boxShadow:'0 0 32px rgba(99,102,241,.3)'}}>E</div>}
          <h1 style={{color:C.tx,fontSize:22,fontWeight:800,margin:'0 0 4px'}}>{company.name || 'EMS'}</h1>
          <p style={{color:C.txm,fontSize:13}}>Employee Management System</p>
        </div>

        <div style={{display:'flex',background:C.alt,borderRadius:10,padding:4,marginBottom:20,border:`1px solid ${C.bdr}`}}>
          {[['login','Sign In'],['signup','Register']].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setError('');}} style={{flex:1,padding:'8px 0',borderRadius:7,border:'none',cursor:'pointer',fontWeight:600,fontSize:12,transition:'all .15s',background:mode===m?C.acc:'transparent',color:mode===m?'#fff':C.txs}}>{l}</button>
          ))}
        </div>

        <Card>
          {error&&<div style={{background:C.errS,border:`1px solid ${C.err}30`,borderRadius:8,padding:'9px 13px',color:C.err,fontSize:12,marginBottom:14}}>{error}</div>}
          {mode==='signup'&&<>
            <Input label="Full Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Your full name" required autoFocus />
            <Input label="Job Title" value={form.jobTitle} onChange={v=>setForm(p=>({...p,jobTitle:v}))} placeholder="e.g. Sales Manager" />
            <Input label="Department" value={form.department} onChange={v=>setForm(p=>({...p,department:v}))} placeholder="e.g. Exports" />
          </>}
          <Input label="Email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} type="email" placeholder="you@company.com" required />
          <div style={{position:'relative'}}>
            <Input label="Password" value={form.password} onChange={v=>setForm(p=>({...p,password:v}))} type={showPass?'text':'password'} placeholder="Min 8 characters" required />
            <button onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:12,top:32,background:'none',border:'none',color:C.txm,cursor:'pointer',fontSize:11}}>{showPass?'Hide':'Show'}</button>
          </div>
          <Btn onClick={handleSubmit} disabled={loading} style={{width:'100%',justifyContent:'center',padding:'12px 0',fontSize:14,marginTop:4}}>
            {loading?'Please wait...':(mode==='login'?'Sign In →':'Create Account →')}
          </Btn>
          {mode==='login'&&<p style={{textAlign:'center',marginTop:12,fontSize:12,color:C.txm}}>First time? <span style={{color:C.acc,cursor:'pointer'}} onClick={()=>setMode('signup')}>Create account</span></p>}
          <p style={{textAlign:'center',marginTop:8,fontSize:11,color:C.txm}}>
            <span style={{color:C.acc,cursor:'pointer'}} onClick={()=>alert('Enter your email above, then use Forgot Password on next version')}>Forgot password?</span>
          </p>
        </Card>
      </div>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────
const Sidebar = ({tab,setTab,user,onLogout,company,collapsed,setCollapsed}) => {
  const isAdmin=['admin','super_admin'].includes(user.role);
  const adminNav=[
    {id:'dashboard',icon:'⊞',label:'Dashboard'},
    {id:'employees',icon:'👤',label:'Employees'},
    {id:'attendance',icon:'📋',label:'Attendance'},
    {id:'worklogs',icon:'📝',label:'Work Logs'},
    {id:'salary',icon:'💵',label:'Salary'},
    {id:'buyers',icon:'🤝',label:'Buyers'},
    {id:'orders',icon:'📦',label:'Orders'},
    {id:'analytics',icon:'📊',label:'Analytics'},
    {id:'company',icon:'🏢',label:'Company Settings'},
    {id:'audit',icon:'🔍',label:'Audit Logs'},
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'tools',icon:'🧰',label:'Tools Hub'},
    
  ];
  const empNav=[
    {id:'my-dashboard',icon:'⊞',label:'My Dashboard'},
    {id:'my-attendance',icon:'📋',label:'My Attendance'},
    {id:'worklogs',icon:'📝',label:'Work Log'},
    {id:'my-salary',icon:'💵',label:'My Salary'},
    {id:'profile',icon:'👤',label:'Profile'},
    {id:'chat',icon:'💬',label:'Chat'},
    {id:'tools',icon:'🧰',label:'Tools Hub'},
  ];
  const items=isAdmin?adminNav:empNav;
  const rC={super_admin:C.warn,admin:C.err,employee:C.ok};
  const rB={super_admin:'yellow',admin:'red',employee:'green'};

  return (
    <div style={{width:collapsed?68:220,background:C.surf,borderRight:`1px solid ${C.bdr}`,height:'100vh',position:'fixed',left:0,top:0,display:'flex',flexDirection:'column',transition:'width .2s ease',overflow:'hidden',zIndex:100}}>
      <div style={{padding:collapsed?'14px 10px':'14px 16px',borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',gap:9,minHeight:64}}>
        {company?.logoUrl?<img src={company.logoUrl} alt="logo" style={{width:32,height:32,borderRadius:8,objectFit:'cover',flexShrink:0}} />:
          <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff'}}>E</div>}
        {!collapsed&&<div style={{overflow:'hidden'}}>
          <div style={{color:C.tx,fontWeight:800,fontSize:12,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{company?.name||'EMS'}</div>
          <div style={{color:C.txm,fontSize:9,textTransform:'uppercase',letterSpacing:'.07em'}}>Management System</div>
        </div>}
        <button onClick={()=>setCollapsed(!collapsed)} style={{marginLeft:'auto',background:'none',border:'none',color:C.txm,cursor:'pointer',fontSize:13,flexShrink:0}}>{collapsed?'→':'←'}</button>
      </div>
      <nav style={{flex:1,padding:'8px 6px',overflowY:'auto'}}>
        {items.map(item=>{
          const active=tab===item.id;
          return <div key={item.id} onClick={()=>setTab(item.id)} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,marginBottom:2,cursor:'pointer',background:active?C.accS:'transparent',color:active?C.acc:C.txs,fontWeight:active?700:400,fontSize:12,transition:'all .12s',position:'relative'}}
            onMouseEnter={e=>{if(!active)e.currentTarget.style.background=C.bdr;}}
            onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
            <span style={{fontSize:14,flexShrink:0}}>{item.icon}</span>
            {!collapsed&&<span style={{whiteSpace:'nowrap'}}>{item.label}</span>}
            {active&&<div style={{position:'absolute',right:0,top:'20%',height:'60%',width:3,background:C.acc,borderRadius:'3px 0 0 3px'}} />}
          </div>;
        })}
      </nav>
      <div style={{padding:'8px 6px',borderTop:`1px solid ${C.bdr}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 9px',borderRadius:8}}>
          <Avatar name={user.name} size={28} color={rC[user.role]||C.acc} />
          {!collapsed&&<div style={{overflow:'hidden',flex:1}}>
            <div style={{color:C.tx,fontWeight:700,fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</div>
            <Badge label={user.role.replace('_',' ')} color={rB[user.role]||'blue'} />
          </div>}
        </div>
        <div onClick={onLogout} style={{display:'flex',alignItems:'center',gap:9,padding:'7px 10px',borderRadius:8,cursor:'pointer',color:C.err,fontSize:12,fontWeight:600}}
          onMouseEnter={e=>e.currentTarget.style.background=C.errS} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <span style={{fontSize:13,flexShrink:0}}>⎋</span>{!collapsed&&'Sign Out'}
        </div>
      </div>
    </div>
  );
};

// ── Dashboard (Admin) ─────────────────────────────────────────
const Dashboard = ({user,setTab}) => {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    api.get('/dashboard').then(d=>setData(d.data)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  if (loading) return <Spinner />;
  if (!data)   return <div style={{padding:28,color:C.txm}}>Could not load dashboard.</div>;
  return (
    <div style={{padding:28}}>
      <div style={{marginBottom:22}}>
        <h2 style={{color:C.tx,fontSize:20,fontWeight:800,margin:'0 0 4px'}}>Good {new Date().getHours()<12?'morning':'afternoon'}, {user.name.split(' ')[0]} 👋</h2>
        <p style={{color:C.txm,fontSize:13,margin:0,display:'flex',alignItems:'center',gap:8}}>Today is {new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})} · <LiveClock /></p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:22}}>
        <StatCard icon="👥" label="Total Employees" value={data.users} color={C.acc} />
        <StatCard icon="✅" label="Present Today" value={data.presentToday} color={C.ok} />
        <StatCard icon="💵" label="Pending Salaries" value={data.pendingSalaries} color={C.warn} />
        <StatCard icon="📦" label="Total Orders" value={data.totalOrders} color={C.purple} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Recent Work Logs</h3>
          {data.recentLogs?.length===0?<p style={{color:C.txm,fontSize:12}}>No work logs yet.</p>:
            data.recentLogs?.map(l=>(
              <div key={l._id} style={{display:'flex',gap:9,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.bdr}`}}>
                <Avatar name={l.user?.name||'?'} size={28} />
                <div style={{flex:1}}>
                  <div style={{color:C.tx,fontSize:12,fontWeight:600}}>{l.user?.name}</div>
                  <div style={{color:C.txs,fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.description}</div>
                  <div style={{color:C.txm,fontSize:10}}>{l.date}</div>
                </div>
              </div>
            ))
          }
        </Card>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Quick Actions</h3>
          <div style={{display:'flex',flexDirection:'column',gap:9}}>
            <Btn onClick={()=>setTab('employees')} variant="ghost" style={{justifyContent:'flex-start'}}>👤 Manage Employees</Btn>
            <Btn onClick={()=>setTab('attendance')} variant="ghost" style={{justifyContent:'flex-start'}}>📋 View Attendance</Btn>
            <Btn onClick={()=>setTab('salary')} variant="ghost" style={{justifyContent:'flex-start'}}>💵 Manage Salaries</Btn>
            <Btn onClick={()=>setTab('orders')} variant="ghost" style={{justifyContent:'flex-start'}}>📦 View Orders</Btn>
            <Btn onClick={()=>setTab('analytics')} variant="ghost" style={{justifyContent:'flex-start'}}>📊 Analytics</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Employee Dashboard ────────────────────────────────────────
const EmployeeDashboard = ({user}) => {
  const [att,setAtt]=useState(null);
  const [salary,setSalary]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const today=new Date().toISOString().split('T')[0];

  const load = useCallback(async()=>{
    try {
      const [ar,sr]=await Promise.all([api.get(`/attendance?date=${today}`),api.get('/salaries')]);
      const myAtt=ar.data.find(a=>a.user?._id===user.id||a.user===user.id);
      setAtt(myAtt||null); setSalary(sr.data||[]);
    } catch{}
    setLoading(false);
  },[user.id,today]);

  useEffect(()=>{load();},[load]);

  const handleCheckout=async()=>{
    try { await api.post('/attendance/checkout'); setToast({message:'Checked out successfully',type:'success'}); load(); }
    catch(err){ setToast({message:err.message,type:'error'}); }
  };

  if (loading) return <Spinner />;
  const latestSal=salary[0];
  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{marginBottom:22}}>
        <h2 style={{color:C.tx,fontSize:20,fontWeight:800,margin:'0 0 4px'}}>Hello, {user.name.split(' ')[0]} 👋</h2>
        <p style={{color:C.txm,fontSize:13,margin:0,display:'flex',alignItems:'center',gap:8}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})} · <LiveClock /></p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:22}}>
        <StatCard icon="📋" label="Today's Status" value={att?att.status.charAt(0).toUpperCase()+att.status.slice(1):'Not Checked In'} color={att?.status==='present'?C.ok:att?.status==='late'?C.warn:C.err} />
        <StatCard icon="⏰" label="Check In" value={att?.checkIn?new Date(att.checkIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'—'} color={C.acc} />
        <StatCard icon="⏱" label="Check Out" value={att?.checkOut?new Date(att.checkOut).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):att?'Active':'—'} color={C.teal} />
        <StatCard icon="💵" label="Salary Status" value={latestSal?.status||'—'} color={latestSal?.status==='paid'?C.ok:C.warn} />
      </div>
      {att&&!att.checkOut&&(
        <Card style={{marginBottom:18,background:`linear-gradient(135deg,${C.accS},${C.okS})`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{color:C.tx,fontWeight:700,fontSize:14}}>You are currently checked in</div>
              <div style={{color:C.txm,fontSize:12,marginTop:3}}>Since {new Date(att.checkIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <Btn onClick={handleCheckout} variant="danger">Check Out</Btn>
          </div>
        </Card>
      )}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Recent Salary History</h3>
          {salary.length===0?<p style={{color:C.txm,fontSize:12}}>No salary records yet.</p>:
            salary.slice(0,5).map(s=>(
              <div key={s._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9,paddingBottom:9,borderBottom:`1px solid ${C.bdr}`}}>
                <div>
                  <div style={{color:C.tx,fontSize:12,fontWeight:600}}>{s.month}</div>
                  <div style={{color:C.txm,fontSize:11}}>₹{s.amount?.toLocaleString()}</div>
                </div>
                <Badge label={s.status} color={s.status==='paid'?'green':s.status==='pending'?'yellow':'red'} />
              </div>
            ))
          }
        </Card>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Profile</h3>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
            <Avatar name={user.name} size={48} />
            <div>
              <div style={{color:C.tx,fontWeight:700,fontSize:15}}>{user.name}</div>
              <div style={{color:C.txs,fontSize:12}}>{user.email}</div>
              {user.jobTitle&&<div style={{color:C.txm,fontSize:11}}>{user.jobTitle}</div>}
            </div>
          </div>
          <Badge label={user.role} color="blue" />
        </Card>
      </div>
    </div>
  );
};

// ── Employees ─────────────────────────────────────────────────
const EmployeesPage = ({user}) => {
  const [employees,setEmployees]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [modal,setModal]=useState(false);
  const [editUser,setEditUser]=useState(null);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [form,setForm]=useState({name:'',email:'',password:'',role:'employee',jobTitle:'',department:'',salary:''});

  const load=useCallback(async()=>{
    try{setLoading(true);const r=await api.get(`/users${search?`?search=${search}`:''}`);setEmployees(r.data||[]);}
    catch{}finally{setLoading(false);}
  },[search]);
  useEffect(()=>{load();},[load]);

  const handleSave=async()=>{
    if (!form.name||!form.email){setToast({message:'Name and email required',type:'error'});return;}
    try{
      setSaving(true);
      if(editUser){await api.put(`/users/${editUser._id}`,form);setToast({message:'Updated',type:'success'});}
      else{
        if(!form.password||form.password.length<8){setToast({message:'Password min 8 chars',type:'error'});return;}
        await api.post('/auth/admin/create-employee',form);setToast({message:'Employee created',type:'success'});
      }
      setModal(false);setEditUser(null);setForm({name:'',email:'',password:'',role:'employee',jobTitle:'',department:'',salary:''});await load();
    }catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };

  const handleDelete=async id=>{
    if(!window.confirm('Deactivate this employee?'))return;
    try{await api.del(`/users/${id}`);setToast({message:'Deactivated',type:'info'});await load();}
    catch(err){setToast({message:err.message,type:'error'});}
  };

  const rC={super_admin:'yellow',admin:'red',employee:'green'};

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div><h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Employees</h2><p style={{color:C.txm,fontSize:12,margin:0}}>{employees.length} members</p></div>
        <Btn onClick={()=>{setEditUser(null);setForm({name:'',email:'',password:'',role:'employee',jobTitle:'',department:'',salary:''});setModal(true);}}>+ Add Employee</Btn>
      </div>
      <Card style={{marginBottom:14}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Search employees..."
          style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'8px 13px',color:C.tx,fontSize:12,outline:'none',fontFamily:'inherit'}} />
      </Card>
      {loading?<Spinner />:(
        <Card style={{padding:0}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:`1px solid ${C.bdr}`}}>
              {['Employee','Job Title','Department','Salary','Role','Actions'].map(h=>(
                <th key={h} style={{padding:'11px 16px',textAlign:'left',color:C.txm,fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {employees.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.txm}}>No employees found</td></tr>
              :employees.map((emp,i)=>(
                <tr key={emp._id} style={{borderBottom:i<employees.length-1?`1px solid ${C.bdr}`:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.alt} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'11px 16px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><Avatar name={emp.name} size={28} /><div><div style={{color:C.tx,fontWeight:600,fontSize:12}}>{emp.name}</div><div style={{color:C.txs,fontSize:11}}>{emp.email}</div></div></div></td>
                  <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{emp.jobTitle||'—'}</td>
                  <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{emp.department||'—'}</td>
                  <td style={{padding:'11px 16px',color:C.tx,fontSize:12,fontWeight:600}}>₹{emp.salary?.toLocaleString()||'0'}</td>
                  <td style={{padding:'11px 16px'}}><Badge label={emp.role.replace('_',' ')} color={rC[emp.role]||'blue'} /></td>
                  <td style={{padding:'11px 16px'}}>
                    <div style={{display:'flex',gap:5}}>
                      <Btn size="sm" variant="ghost" onClick={()=>{setEditUser(emp);setForm({name:emp.name,email:emp.email,role:emp.role,jobTitle:emp.jobTitle||'',department:emp.department||'',salary:emp.salary||'',password:''});setModal(true);}}>Edit</Btn>
                      {user.role==='super_admin'&&<Btn size="sm" variant="danger" onClick={()=>handleDelete(emp._id)}>Remove</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title={editUser?'Edit Employee':'Add Employee'}>
        <Input label="Full Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Full name" required />
        <Input label="Email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} type="email" placeholder="employee@company.com" required />
        {!editUser&&<Input label="Password" value={form.password} onChange={v=>setForm(p=>({...p,password:v}))} type="password" placeholder="Min 8 chars" required />}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
          <Input label="Job Title" value={form.jobTitle} onChange={v=>setForm(p=>({...p,jobTitle:v}))} placeholder="e.g. Sales Manager" />
          <Input label="Department" value={form.department} onChange={v=>setForm(p=>({...p,department:v}))} placeholder="e.g. Exports" />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
          <Select label="Role" value={form.role} onChange={v=>setForm(p=>({...p,role:v}))} options={[{value:'employee',label:'Employee'},{value:'admin',label:'Admin'}]} required />
          <Input label="Salary (₹)" value={form.salary} onChange={v=>setForm(p=>({...p,salary:v}))} type="number" placeholder="0" />
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
          <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':editUser?'Save Changes':'Add Employee'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Attendance ────────────────────────────────────────────────
const AttendancePage = ({user}) => {
  const isAdmin=['admin','super_admin'].includes(user.role);
  const today=new Date().toISOString().split('T')[0];
  const currentMonth=today.slice(0,7);
  const [view,setView]=useState('monthly');
  const [month,setMonth]=useState(currentMonth);
  const [date,setDate]=useState(today);
  const [monthlyData,setMonthlyData]=useState([]);
  const [dailyAtt,setDailyAtt]=useState([]);
  const [holidays,setHolidays]=useState([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const [selectedUser,setSelectedUser]=useState('');
  const [employees,setEmployees]=useState([]);
  const [holidayModal,setHolidayModal]=useState(false);
  const [holidayForm,setHolidayForm]=useState({date:today,name:'',type:'holiday'});

  const load=useCallback(async()=>{
    try{
      setLoading(true);
      if(view==='monthly'){
        const q=isAdmin&&selectedUser?`?month=${month}&userId=${selectedUser}`:`?month=${month}`;
        const [mr,hr]=await Promise.all([api.get(`/attendance/monthly${q}`),api.get(`/holidays?month=${month}`)]);
        setMonthlyData(mr.data||[]);
        setHolidays(hr.data||[]);
      } else {
        const r=await api.get(`/attendance?date=${date}`);
        setDailyAtt(r.data||[]);
      }
    }catch{}finally{setLoading(false);}
  },[view,month,date,selectedUser,isAdmin]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{if(isAdmin)api.get('/users').then(r=>setEmployees(r.data||[])).catch(()=>{});},[isAdmin]);

  const handleCheckout=async()=>{
    try{await api.post('/attendance/checkout');setToast({message:'Checked out successfully',type:'success'});load();}
    catch(err){setToast({message:err.message,type:'error'});}
  };

  const handleAddHoliday=async()=>{
    if(!holidayForm.name||!holidayForm.date){setToast({message:'Date and name required',type:'error'});return;}
    try{
      await api.post('/holidays',holidayForm);
      setToast({message:'Holiday added',type:'success'});
      setHolidayModal(false);
      setHolidayForm({date:today,name:'',type:'holiday'});
      load();
    }catch(err){setToast({message:err.message,type:'error'});}
  };

  const handleDeleteHoliday=async(id)=>{
    try{await api.del(`/holidays/${id}`);setToast({message:'Holiday removed',type:'info'});load();}
    catch(err){setToast({message:err.message,type:'error'});}
  };

  const stC={present:'green',late:'yellow',absent:'red','half-day':'purple',holiday:'blue',weekend:'gray',future:'gray'};
  const stBg={present:C.okS,late:C.warnS,absent:C.errS,'half-day':'rgba(139,92,246,.12)',holiday:C.accS,weekend:'rgba(100,116,139,.1)',future:'transparent'};

  const fmt=d=>d?new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true}):'—';

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Attendance</h2>
          <p style={{color:C.txm,fontSize:12,margin:0}}>Track and manage attendance</p>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          {/* View toggle */}
          <div style={{display:'flex',background:C.alt,borderRadius:8,padding:3,border:`1px solid ${C.bdr}`}}>
            {['monthly','daily'].map(v=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:'5px 14px',borderRadius:6,border:'none',cursor:'pointer',background:view===v?C.acc:'transparent',color:view===v?'#fff':C.txs,fontSize:11,fontWeight:600,transition:'all .15s'}}>
                {v==='monthly'?'📅 Monthly':'📋 Daily'}
              </button>
            ))}
          </div>
          {view==='monthly'&&<input type="month" value={month} onChange={e=>setMonth(e.target.value)} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'6px 12px',color:C.tx,fontSize:12,outline:'none',fontFamily:'inherit'}} />}
          {view==='daily'&&<input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'6px 12px',color:C.tx,fontSize:12,outline:'none',fontFamily:'inherit'}} />}
          {isAdmin&&<Btn onClick={()=>setHolidayModal(true)} variant="ghost" size="sm">🎉 Add Holiday</Btn>}
          {!isAdmin&&<Btn variant="danger" onClick={handleCheckout} size="sm">Check Out</Btn>}
        </div>
      </div>

      {/* Admin employee filter */}
      {isAdmin&&view==='monthly'&&(
        <Card style={{marginBottom:14,padding:'12px 16px'}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{color:C.txs,fontSize:12}}>View:</span>
            <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} style={{background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'6px 12px',color:C.tx,fontSize:12,outline:'none',cursor:'pointer',fontFamily:'inherit'}}>
              <option value="">All Employees</option>
              {employees.map(e=><option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
        </Card>
      )}

      {loading?<Spinner />:view==='monthly'?(
        <div>
          {monthlyData.map(userData=>(
            <div key={userData.user._id} style={{marginBottom:24}}>
              {/* Employee header + summary */}
              {isAdmin&&!selectedUser&&(
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <Avatar name={userData.user.name} size={32} />
                  <div>
                    <div style={{color:C.tx,fontWeight:700,fontSize:14}}>{userData.user.name}</div>
                    <div style={{color:C.txs,fontSize:11}}>{userData.user.jobTitle||userData.user.email}</div>
                  </div>
                </div>
              )}

              {/* Summary stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:10,marginBottom:14}}>
                <StatCard icon="✅" label="Present" value={userData.summary.present} color={C.ok} />
                <StatCard icon="⏰" label="Late" value={userData.summary.late} color={C.warn} />
                <StatCard icon="❌" label="Absent" value={userData.summary.absent} color={C.err} />
                <StatCard icon="🎉" label="Holidays" value={userData.summary.holiday} color={C.acc} />
              </div>

              {/* Calendar grid */}
              <Card style={{padding:16}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
                    <div key={d} style={{textAlign:'center',color:C.txs,fontSize:10,fontWeight:700,padding:'4px 0'}}>{d}</div>
                  ))}
                </div>
                {/* Empty cells for first day offset */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
                  {Array(new Date(`${month}-01`).getDay()).fill(null).map((_,i)=>(
                    <div key={`empty-${i}`} />
                  ))}
                  {userData.days.map(day=>(
                    <div key={day.date} title={`${day.date}${day.note?'\n'+day.note:''}`} style={{background:stBg[day.status]||'transparent',borderRadius:8,padding:'6px 4px',textAlign:'center',cursor:'default',border:`1px solid ${day.status==='future'?C.bdr:'transparent'}`}}>
                      <div style={{color:day.status==='future'?C.txm:C.tx,fontSize:12,fontWeight:700}}>{day.day}</div>
                      <div style={{fontSize:9,color:day.status==='present'?C.ok:day.status==='late'?C.warn:day.status==='absent'?C.err:day.status==='holiday'?C.acc:C.txm,fontWeight:600,textTransform:'uppercase',marginTop:2}}>
                        {day.status==='future'?'':day.status==='weekend'?'Off':day.status==='present'?'In':day.status==='late'?'Late':day.status==='absent'?'Out':day.status==='holiday'?'Hol':''}
                      </div>
                      {day.checkIn&&<div style={{fontSize:8,color:C.txs,marginTop:1}}>{fmt(day.checkIn)}</div>}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Holidays list */}
              {holidays.length>0&&(
                <Card style={{marginTop:12,padding:12}}>
                  <div style={{color:C.tx,fontSize:12,fontWeight:700,marginBottom:8}}>🎉 Holidays this month</div>
                  {holidays.map(h=>(
                    <div key={h._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid ${C.bdr}`}}>
                      <div>
                        <span style={{color:C.tx,fontSize:12,fontWeight:600}}>{h.name}</span>
                        <span style={{color:C.txs,fontSize:11,marginLeft:8}}>{h.date}</span>
                      </div>
                      {isAdmin&&<Btn size="sm" variant="danger" onClick={()=>handleDeleteHoliday(h._id)}>Remove</Btn>}
                    </div>
                  ))}
                </Card>
              )}
            </div>
          ))}
        </div>
      ):(
        /* Daily view */
        <div>
          {isAdmin&&(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:18}}>
              <StatCard icon="✅" label="Present" value={dailyAtt.filter(a=>['present','late'].includes(a.status)).length} color={C.ok} />
              <StatCard icon="⏰" label="Late" value={dailyAtt.filter(a=>a.status==='late').length} color={C.warn} />
              <StatCard icon="❌" label="Absent" value={dailyAtt.filter(a=>a.status==='absent').length} color={C.err} />
            </div>
          )}
          <Card style={{padding:0}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:`1px solid ${C.bdr}`}}>
                {[...(isAdmin?['Employee']:[]),'Date','Check In','Check Out','Hours','Status','Note'].map(h=>(
                  <th key={h} style={{padding:'11px 16px',textAlign:'left',color:C.txm,fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {dailyAtt.length===0
                  ?<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:C.txm}}>No records for {date}</td></tr>
                  :dailyAtt.map((a,i)=>(
                    <tr key={a._id} style={{borderBottom:i<dailyAtt.length-1?`1px solid ${C.bdr}`:'none'}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.alt}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      {isAdmin&&<td style={{padding:'11px 16px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><Avatar name={a.user?.name||'?'} size={24} /><span style={{color:C.tx,fontSize:12}}>{a.user?.name||'—'}</span></div></td>}
                      <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{a.date}</td>
                      <td style={{padding:'11px 16px',color:C.tx,fontSize:12,fontWeight:600}}>{fmt(a.checkIn)}</td>
                      <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{fmt(a.checkOut)}</td>
                      <td style={{padding:'11px 16px',color:C.tx,fontSize:12}}>{a.totalHours?a.totalHours.toFixed(1)+' hrs':'Active'}</td>
                      <td style={{padding:'11px 16px'}}><Badge label={a.status} color={stC[a.status]||'gray'} /></td>
                      <td style={{padding:'11px 16px',color:C.txs,fontSize:11}}>{a.note||'—'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Add Holiday Modal */}
      <Modal open={holidayModal} onClose={()=>setHolidayModal(false)} title="Add Holiday">
        <Input label="Date" value={holidayForm.date} onChange={v=>setHolidayForm(p=>({...p,date:v}))} type="date" required />
        <Input label="Holiday Name" value={holidayForm.name} onChange={v=>setHolidayForm(p=>({...p,name:v}))} placeholder="e.g. Eid Al Fitr" required />
        <Select label="Type" value={holidayForm.type} onChange={v=>setHolidayForm(p=>({...p,type:v}))} options={[{value:'holiday',label:'Holiday'},{value:'workday',label:'Working Day'}]} />
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn variant="outline" onClick={()=>setHolidayModal(false)}>Cancel</Btn>
          <Btn onClick={handleAddHoliday}>Add Holiday</Btn>
        </div>
      </Modal>
    </div>
  );
};

  const stC={present:'green',late:'yellow',absent:'red','half-day':'purple'};
  const stats={present:att.filter(a=>['present','late'].includes(a.status)).length,late:att.filter(a=>a.status==='late').length,absent:att.filter(a=>a.status==='absent').length};

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div><h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Attendance</h2><p style={{color:C.txm,fontSize:12,margin:0}}>Track check-in/out</p></div>
        <div style={{display:'flex',gap:9,alignItems:'center'}}>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'7px 13px',color:C.tx,fontSize:12,outline:'none',fontFamily:'inherit'}} />
          {!isAdmin&&<Btn variant="danger" onClick={handleCheckout}>Check Out</Btn>}
        </div>
      </div>
      {isAdmin&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:18}}>
          <StatCard icon="✅" label="Present" value={stats.present} color={C.ok} />
          <StatCard icon="⏰" label="Late" value={stats.late} color={C.warn} />
          <StatCard icon="❌" label="Absent" value={stats.absent} color={C.err} />
        </div>
      )}
      {loading?<Spinner />:(
        <Card style={{padding:0}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:`1px solid ${C.bdr}`}}>
              {[...(isAdmin?['Employee']:[]),'Date','Check In','Check Out','Hours','Status'].map(h=>(
                <th key={h} style={{padding:'11px 16px',textAlign:'left',color:C.txm,fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {att.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.txm}}>No records for {date}</td></tr>
              :att.map((a,i)=>{
                const fmt=d=>d?new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'—';
                return <tr key={a._id} style={{borderBottom:i<att.length-1?`1px solid ${C.bdr}`:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.alt} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {isAdmin&&<td style={{padding:'11px 16px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><Avatar name={a.user?.name||'?'} size={24} /><span style={{color:C.tx,fontSize:12}}>{a.user?.name||'—'}</span></div></td>}
                  <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{a.date}</td>
                  <td style={{padding:'11px 16px',color:C.tx,fontSize:12,fontWeight:600}}>{fmt(a.checkIn)}</td>
                  <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{fmt(a.checkOut)}</td>
                  <td style={{padding:'11px 16px',color:C.tx,fontSize:12}}>{a.totalHours?a.totalHours.toFixed(1)+' hrs':'Active'}</td>
                  <td style={{padding:'11px 16px'}}><Badge label={a.status} color={stC[a.status]||'gray'} /></td>
                </tr>;
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

// ── Work Logs ─────────────────────────────────────────────────
const WorkLogsPage = ({user}) => {
  const isAdmin=['admin','super_admin'].includes(user.role);
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [form,setForm]=useState({description:'',hoursWorked:'',date:new Date().toISOString().split('T')[0]});

  const load=useCallback(async()=>{
    try{setLoading(true);const r=await api.get('/worklogs');setLogs(r.data||[]);}
    catch{}finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const handleSave=async()=>{
    if(!form.description){setToast({message:'Description required',type:'error'});return;}
    try{setSaving(true);await api.post('/worklogs',form);setToast({message:'Work log submitted',type:'success'});setModal(false);setForm({description:'',hoursWorked:'',date:new Date().toISOString().split('T')[0]});await load();}
    catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div><h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Work Logs</h2><p style={{color:C.txm,fontSize:12,margin:0}}>{isAdmin?'All employee logs':'Submit your daily work'}</p></div>
        <Btn onClick={()=>setModal(true)}>+ Add Work Log</Btn>
      </div>
      {loading?<Spinner />:logs.length===0?<Card><p style={{color:C.txm,textAlign:'center',fontSize:13}}>No work logs yet.</p></Card>:(
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {logs.map(l=>(
            <Card key={l._id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div style={{display:'flex',gap:10,flex:1}}>
                  {isAdmin&&<Avatar name={l.user?.name||'?'} size={34} />}
                  <div style={{flex:1}}>
                    {isAdmin&&<div style={{color:C.tx,fontWeight:700,fontSize:13,marginBottom:3}}>{l.user?.name}</div>}
                    <div style={{color:C.txs,fontSize:12,lineHeight:1.6}}>{l.description}</div>
                    {l.tasks?.length>0&&<div style={{marginTop:8,display:'flex',gap:6,flexWrap:'wrap'}}>{l.tasks.map((t,i)=><Badge key={i} label={t.title} color={t.status==='done'?'green':'yellow'} />)}</div>}
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                  <div style={{color:C.tx,fontSize:12,fontWeight:600}}>{l.date}</div>
                  {l.hoursWorked>0&&<div style={{color:C.txm,fontSize:11}}>{l.hoursWorked} hrs</div>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title="Submit Work Log">
        <Input label="Date" value={form.date} onChange={v=>setForm(p=>({...p,date:v}))} type="date" required />
        <div style={{marginBottom:14}}>
          <label style={{display:'block',color:C.txs,fontSize:11,fontWeight:600,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:5}}>What did you work on? *</label>
          <textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Describe your work today..."
            style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 13px',color:C.tx,fontSize:12,outline:'none',resize:'vertical',minHeight:80,boxSizing:'border-box',fontFamily:'inherit'}} />
        </div>
        <Input label="Hours Worked" value={form.hoursWorked} onChange={v=>setForm(p=>({...p,hoursWorked:v}))} type="number" placeholder="e.g. 8" />
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?'Submitting...':'Submit'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Salary ────────────────────────────────────────────────────
const SalaryPage = ({user}) => {
  const isAdmin=['admin','super_admin'].includes(user.role);
  const [salaries,setSalaries]=useState([]);
  const [employees,setEmployees]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({user:'',month:new Date().toISOString().slice(0,7),amount:'',status:'pending',note:''});

  const load=useCallback(async()=>{
    try{setLoading(true);const r=await api.get('/salaries');setSalaries(r.data||[]);if(isAdmin){const ur=await api.get('/users');setEmployees(ur.data||[]);}}
    catch{}finally{setLoading(false);}
  },[isAdmin]);
  useEffect(()=>{load();},[load]);

  const handleSave=async()=>{
    if(!form.amount){setToast({message:'Amount required',type:'error'});return;}
    try{
      setSaving(true);
      if(editId){await api.put(`/salaries/${editId}`,{status:form.status,note:form.note});setToast({message:'Updated',type:'success'});}
      else{if(!form.user){setToast({message:'Select employee',type:'error'});return;}await api.post('/salaries',form);setToast({message:'Salary created',type:'success'});}
      setModal(false);setEditId(null);setForm({user:'',month:new Date().toISOString().slice(0,7),amount:'',status:'pending',note:''});await load();
    }catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };

  const stC={paid:'green',pending:'yellow',due:'red'};

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div><h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Salary</h2><p style={{color:C.txm,fontSize:12,margin:0}}>{salaries.length} records</p></div>
        {isAdmin&&<Btn onClick={()=>{setEditId(null);setForm({user:'',month:new Date().toISOString().slice(0,7),amount:'',status:'pending',note:''});setModal(true);}}>+ Add Salary</Btn>}
      </div>
      {loading?<Spinner />:(
        <Card style={{padding:0}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:`1px solid ${C.bdr}`}}>
              {[...(isAdmin?['Employee']:[]),'Month','Amount','Status','Note',...(isAdmin?['Actions']:[])].map(h=>(
                <th key={h} style={{padding:'11px 16px',textAlign:'left',color:C.txm,fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {salaries.length===0?<tr><td colSpan={6} style={{padding:32,textAlign:'center',color:C.txm}}>No salary records yet</td></tr>
              :salaries.map((s,i)=>(
                <tr key={s._id} style={{borderBottom:i<salaries.length-1?`1px solid ${C.bdr}`:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.alt} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  {isAdmin&&<td style={{padding:'11px 16px'}}><div style={{display:'flex',alignItems:'center',gap:7}}><Avatar name={s.user?.name||'?'} size={24} /><span style={{color:C.tx,fontSize:12}}>{s.user?.name||'—'}</span></div></td>}
                  <td style={{padding:'11px 16px',color:C.tx,fontSize:12,fontWeight:600}}>{s.month}</td>
                  <td style={{padding:'11px 16px',color:C.ok,fontSize:12,fontWeight:700}}>₹{s.amount?.toLocaleString()}</td>
                  <td style={{padding:'11px 16px'}}><Badge label={s.status} color={stC[s.status]||'gray'} /></td>
                  <td style={{padding:'11px 16px',color:C.txs,fontSize:12}}>{s.note||'—'}</td>
                  {isAdmin&&<td style={{padding:'11px 16px'}}><Btn size="sm" variant="ghost" onClick={()=>{setEditId(s._id);setForm({status:s.status,note:s.note||'',amount:s.amount,month:s.month,user:s.user?._id||''});setModal(true);}}>Edit</Btn></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Update Salary':'Add Salary'}>
        {!editId&&<Select label="Employee" value={form.user} onChange={v=>setForm(p=>({...p,user:v}))} options={[{value:'',label:'Select employee'},...employees.map(u=>({value:u._id,label:`${u.name} (${u.email})`}))]} required />}
        {!editId&&<Input label="Month" value={form.month} onChange={v=>setForm(p=>({...p,month:v}))} type="month" required />}
        {!editId&&<Input label="Amount (₹)" value={form.amount} onChange={v=>setForm(p=>({...p,amount:v}))} type="number" placeholder="0" required />}
        <Select label="Status" value={form.status} onChange={v=>setForm(p=>({...p,status:v}))} options={[{value:'pending',label:'Pending'},{value:'paid',label:'Paid'},{value:'due',label:'Due'}]} required />
        <Input label="Note (optional)" value={form.note} onChange={v=>setForm(p=>({...p,note:v}))} placeholder="Any notes..." />
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':editId?'Update':'Add Salary'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Buyers ────────────────────────────────────────────────────
const BuyersPage = () => {
  const [buyers,setBuyers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [editBuyer,setEditBuyer]=useState(null);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [form,setForm]=useState({name:'',company:'',country:'UAE',email:'',phone:'',notes:''});

  const load=useCallback(async()=>{try{setLoading(true);const r=await api.get('/buyers');setBuyers(r.data||[]);}catch{}finally{setLoading(false);}});
  useEffect(()=>{load();},[]);

  const handleSave=async()=>{
    if(!form.name){setToast({message:'Name required',type:'error'});return;}
    try{
      setSaving(true);
      if(editBuyer){await api.put(`/buyers/${editBuyer._id}`,form);}
      else{await api.post('/buyers',form);}
      setToast({message:'Saved',type:'success'});setModal(false);setEditBuyer(null);setForm({name:'',company:'',country:'UAE',email:'',phone:'',notes:''});load();
    }catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div><h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Buyers</h2><p style={{color:C.txm,fontSize:12,margin:0}}>{buyers.length} buyers</p></div>
        <Btn onClick={()=>{setEditBuyer(null);setForm({name:'',company:'',country:'UAE',email:'',phone:'',notes:''});setModal(true);}}>+ Add Buyer</Btn>
      </div>
      {loading?<Spinner />:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:12}}>
          {buyers.length===0?<Card><p style={{color:C.txm,textAlign:'center',fontSize:13}}>No buyers yet.</p></Card>
          :buyers.map(b=>(
            <Card key={b._id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div><div style={{color:C.tx,fontWeight:700,fontSize:13}}>{b.name}</div><div style={{color:C.txs,fontSize:11}}>{b.company}</div></div>
                <Badge label={b.country} color="blue" />
              </div>
              {b.email&&<div style={{color:C.txs,fontSize:11,marginBottom:3}}>✉ {b.email}</div>}
              {b.phone&&<div style={{color:C.txs,fontSize:11,marginBottom:8}}>📞 {b.phone}</div>}
              <Btn size="sm" variant="ghost" onClick={()=>{setEditBuyer(b);setForm({name:b.name,company:b.company||'',country:b.country,email:b.email||'',phone:b.phone||'',notes:b.notes||''});setModal(true);}}>Edit</Btn>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title={editBuyer?'Edit Buyer':'Add Buyer'}>
        <Input label="Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Buyer name" required />
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
          <Input label="Company" value={form.company} onChange={v=>setForm(p=>({...p,company:v}))} placeholder="Company name" />
          <Input label="Country" value={form.country} onChange={v=>setForm(p=>({...p,country:v}))} placeholder="UAE" />
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
          <Input label="Email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} type="email" placeholder="buyer@email.com" />
          <Input label="Phone" value={form.phone} onChange={v=>setForm(p=>({...p,phone:v}))} placeholder="+971..." />
        </div>
        <Input label="Notes" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Any notes..." />
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save Buyer'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Orders ────────────────────────────────────────────────────
const OrdersPage = () => {
  const [orders,setOrders]=useState([]);
  const [buyers,setBuyers]=useState([]);
  const [loading,setLoading]=useState(true);
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const [editOrder,setEditOrder]=useState(null);
  const [form,setForm]=useState({buyer:'',product:'',quantity:'',unit:'KG',price:'',status:'draft',paymentStatus:'pending',notes:''});

  const load=useCallback(async()=>{
    try{setLoading(true);const [or,br]=await Promise.all([api.get('/orders'),api.get('/buyers')]);setOrders(or.data||[]);setBuyers(br.data||[]);}
    catch{}finally{setLoading(false);}
  },[]);
  useEffect(()=>{load();},[load]);

  const handleSave=async()=>{
    if(!form.buyer||!form.product||!form.quantity||!form.price){setToast({message:'Fill required fields',type:'error'});return;}
    try{
      setSaving(true);
      if(editOrder){await api.put(`/orders/${editOrder._id}`,form);}else{await api.post('/orders',form);}
      setToast({message:'Saved',type:'success'});setModal(false);setEditOrder(null);setForm({buyer:'',product:'',quantity:'',unit:'KG',price:'',status:'draft',paymentStatus:'pending',notes:''});load();
    }catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };

  const stC={draft:'gray',confirmed:'blue',shipped:'yellow',delivered:'green',cancelled:'red'};
  const paC={pending:'yellow',partial:'purple',paid:'green',overdue:'red'};

  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
        <div><h2 style={{color:C.tx,fontSize:19,fontWeight:800,margin:'0 0 3px'}}>Orders</h2><p style={{color:C.txm,fontSize:12,margin:0}}>{orders.length} orders</p></div>
        <Btn onClick={()=>{setEditOrder(null);setForm({buyer:'',product:'',quantity:'',unit:'KG',price:'',status:'draft',paymentStatus:'pending',notes:''});setModal(true);}}>+ New Order</Btn>
      </div>
      {loading?<Spinner />:(
        <Card style={{padding:0}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:`1px solid ${C.bdr}`}}>
              {['Order#','Buyer','Product','Qty','Price','Value','Status','Payment','Actions'].map(h=>(
                <th key={h} style={{padding:'10px 14px',textAlign:'left',color:C.txm,fontSize:9,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.length===0?<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:C.txm}}>No orders yet</td></tr>
              :orders.map((o,i)=>(
                <tr key={o._id} style={{borderBottom:i<orders.length-1?`1px solid ${C.bdr}`:'none'}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.alt} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'10px 14px',color:C.acc,fontSize:11,fontWeight:700}}>{o.orderNumber}</td>
                  <td style={{padding:'10px 14px',color:C.tx,fontSize:11}}>{o.buyer?.name||'—'}</td>
                  <td style={{padding:'10px 14px',color:C.tx,fontSize:11}}>{o.product}</td>
                  <td style={{padding:'10px 14px',color:C.txs,fontSize:11}}>{o.quantity} {o.unit}</td>
                  <td style={{padding:'10px 14px',color:C.txs,fontSize:11}}>₹{o.price}</td>
                  <td style={{padding:'10px 14px',color:C.ok,fontSize:11,fontWeight:700}}>₹{o.totalValue?.toLocaleString()}</td>
                  <td style={{padding:'10px 14px'}}><Badge label={o.status} color={stC[o.status]||'gray'} /></td>
                  <td style={{padding:'10px 14px'}}><Badge label={o.paymentStatus} color={paC[o.paymentStatus]||'gray'} /></td>
                  <td style={{padding:'10px 14px'}}><Btn size="sm" variant="ghost" onClick={()=>{setEditOrder(o);setForm({buyer:o.buyer?._id||'',product:o.product,quantity:o.quantity,unit:o.unit,price:o.price,status:o.status,paymentStatus:o.paymentStatus,notes:o.notes||''});setModal(true);}}>Edit</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title={editOrder?'Edit Order':'New Order'} width={520}>
        <Select label="Buyer" value={form.buyer} onChange={v=>setForm(p=>({...p,buyer:v}))} options={[{value:'',label:'Select buyer'},...buyers.map(b=>({value:b._id,label:`${b.name} (${b.company||b.country})`}))]} required />
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:11}}>
          <Input label="Product" value={form.product} onChange={v=>setForm(p=>({...p,product:v}))} placeholder="e.g. Cumin Seeds" required />
          <Input label="Quantity" value={form.quantity} onChange={v=>setForm(p=>({...p,quantity:v}))} type="number" placeholder="0" required />
          <Input label="Unit" value={form.unit} onChange={v=>setForm(p=>({...p,unit:v}))} placeholder="KG" />
        </div>
        <Input label="Price per unit (₹)" value={form.price} onChange={v=>setForm(p=>({...p,price:v}))} type="number" placeholder="0" required />
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
          <Select label="Status" value={form.status} onChange={v=>setForm(p=>({...p,status:v}))} options={[{value:'draft',label:'Draft'},{value:'confirmed',label:'Confirmed'},{value:'shipped',label:'Shipped'},{value:'delivered',label:'Delivered'},{value:'cancelled',label:'Cancelled'}]} />
          <Select label="Payment" value={form.paymentStatus} onChange={v=>setForm(p=>({...p,paymentStatus:v}))} options={[{value:'pending',label:'Pending'},{value:'partial',label:'Partial'},{value:'paid',label:'Paid'},{value:'overdue',label:'Overdue'}]} />
        </div>
        <Input label="Notes" value={form.notes} onChange={v=>setForm(p=>({...p,notes:v}))} placeholder="Any notes..." />
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <Btn variant="outline" onClick={()=>setModal(false)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':'Save Order'}</Btn>
        </div>
      </Modal>
    </div>
  );
};

// ── Analytics ─────────────────────────────────────────────────
const AnalyticsPage = ({user}) => {
  const [data,setData]=useState(null);
  const [attData,setAttData]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    Promise.all([api.get('/dashboard'),api.get('/attendance/summary')]).then(([d,a])=>{setData(d.data);setAttData([{name:'Present',value:a.data.present},{name:'Late',value:a.data.late},{name:'Absent',value:a.data.absent},{name:'Half Day',value:a.data.halfDay}]);}).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  if (loading) return <Spinner />;
  const COLORS=[C.ok,C.warn,C.err,C.purple];
  return (
    <div style={{padding:28}}>
      <h2 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:20}}>Analytics</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,marginBottom:22}}>
        <StatCard icon="👥" label="Employees" value={data?.users} color={C.acc} />
        <StatCard icon="✅" label="Present Today" value={data?.presentToday} color={C.ok} />
        <StatCard icon="💵" label="Pending Salaries" value={data?.pendingSalaries} color={C.warn} />
        <StatCard icon="📦" label="Total Orders" value={data?.totalOrders} color={C.purple} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Attendance This Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart><Pie data={attData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
              {attData.map((_,i)=><Cell key={i} fill={COLORS[i]} />)}
            </Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Summary</h3>
          {[
            {label:'Total Employees',val:data?.users,color:C.acc},
            {label:'Present Today',val:data?.presentToday,color:C.ok},
            {label:'Pending Salaries',val:data?.pendingSalaries,color:C.warn},
            {label:'Total Orders',val:data?.totalOrders,color:C.purple},
          ].map(s=>(
            <div key={s.label} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{color:C.txs,fontSize:12}}>{s.label}</span>
                <span style={{color:s.color,fontWeight:700,fontSize:12}}>{s.val??0}</span>
              </div>
              <div style={{background:C.bdr,borderRadius:3,height:4,overflow:'hidden'}}>
                <div style={{width:`${Math.min(100,(s.val||0)/Math.max(1,data?.users||1)*100)}%`,height:'100%',background:s.color,borderRadius:3}} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

// ── Company Settings ──────────────────────────────────────────
const CompanyPage = () => {
  const [company,setCompany]=useState({name:'',website:'',email:'',phone:'',address:'',officeStartHour:9,officeStartMinute:0,gracePeriodMinutes:15,logoUrl:''});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);

  useEffect(()=>{api.get('/company').then(d=>setCompany(d.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);

  const handleSave=async()=>{
    try{setSaving(true);await api.put('/company',company);setToast({message:'Company settings saved',type:'success'});}
    catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };

  if(loading) return <Spinner />;
  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <h2 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:20}}>Company Settings</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Branding</h3>
          <Input label="Company Name" value={company.name} onChange={v=>setCompany(p=>({...p,name:v}))} placeholder="Your Company Name" required />
          <Input label="Website URL" value={company.website} onChange={v=>setCompany(p=>({...p,website:v}))} placeholder="https://yourcompany.com" />
          <Input label="Logo URL" value={company.logoUrl} onChange={v=>setCompany(p=>({...p,logoUrl:v}))} placeholder="https://..." />
          {company.logoUrl&&<div style={{marginBottom:14}}><img src={company.logoUrl} alt="logo preview" style={{height:48,objectFit:'contain',borderRadius:8}} /></div>}
          <Input label="Email" value={company.email} onChange={v=>setCompany(p=>({...p,email:v}))} type="email" placeholder="info@company.com" />
          <Input label="Phone" value={company.phone} onChange={v=>setCompany(p=>({...p,phone:v}))} placeholder="+91..." />
        </Card>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Attendance Settings</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}>
            <Input label="Office Start Hour" value={company.officeStartHour} onChange={v=>setCompany(p=>({...p,officeStartHour:parseInt(v)}))} type="number" placeholder="9" />
            <Input label="Start Minute" value={company.officeStartMinute} onChange={v=>setCompany(p=>({...p,officeStartMinute:parseInt(v)}))} type="number" placeholder="0" />
          </div>
          <Input label="Grace Period (minutes)" value={company.gracePeriodMinutes} onChange={v=>setCompany(p=>({...p,gracePeriodMinutes:parseInt(v)}))} type="number" placeholder="15" />
          <div style={{background:C.accS,borderRadius:8,padding:'10px 13px',fontSize:12,color:C.acc,marginBottom:14}}>
            ℹ Check-in before {company.officeStartHour}:{String(company.officeStartMinute).padStart(2,'0')} AM = Present<br />
            Check-in before {company.officeStartHour}:{String(company.officeStartMinute+company.gracePeriodMinutes).padStart(2,'0')} AM = Late<br />
            After that = Absent
          </div>
          <Input label="Auto Logout Hours" value={company.autoLogoutHours||10} onChange={v=>setCompany(p=>({...p,autoLogoutHours:parseInt(v)}))} type="number" placeholder="10" />
        </Card>
      </div>
      <div style={{marginTop:18,display:'flex',justifyContent:'flex-end'}}>
        <Btn onClick={handleSave} disabled={saving} size="lg">{saving?'Saving...':'Save All Settings'}</Btn>
      </div>
    </div>
  );
};

// ── Audit Logs ────────────────────────────────────────────────
const AuditPage = () => {
  const [logs,setLogs]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{api.get('/audit').then(d=>setLogs(d.data||[])).catch(()=>{}).finally(()=>setLoading(false));},[]);
  const actionC={LOGIN:'green',LOGOUT:'gray',CREATE_EMPLOYEE:'blue',UPDATE_USER:'yellow',DELETE_USER:'red',CREATE_ORDER:'purple',UPDATE_SALARY:'yellow',SYSTEM_SETUP:'teal'};
  return (
    <div style={{padding:28}}>
      <h2 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:20}}>Audit Logs</h2>
      {loading?<Spinner />:logs.length===0?<Card><p style={{color:C.txm,textAlign:'center',fontSize:13}}>No audit logs.</p></Card>:(
        <Card style={{padding:0}}>
          {logs.map((log,i)=>(
            <div key={log._id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<logs.length-1?`1px solid ${C.bdr}`:'none'}}>
              <div style={{width:32,height:32,borderRadius:8,background:C.accS,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>📋</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:7}}>
                  <Badge label={log.action.replace(/_/g,' ')} color={actionC[log.action]||'gray'} />
                  <span style={{color:C.txs,fontSize:11}}>by {log.user?.name||'System'}</span>
                </div>
                {log.details&&<div style={{color:C.txm,fontSize:10,marginTop:2,fontFamily:'monospace'}}>{JSON.stringify(log.details).slice(0,80)}</div>}
              </div>
              <span style={{color:C.txm,fontSize:11,flexShrink:0}}>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

// ── Profile ───────────────────────────────────────────────────
const ProfilePage = ({user,setUser}) => {
  const [form,setForm]=useState({name:user.name,jobTitle:user.jobTitle||'',department:'',phone:'',password:'',newPassword:''});
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);
  const handleSave=async()=>{
    try{setSaving(true);const updates={name:form.name,jobTitle:form.jobTitle};if(form.newPassword){if(form.newPassword.length<8){setToast({message:'New password min 8 chars',type:'error'});return;}updates.password=form.newPassword;}await api.put(`/users/${user.id}`,updates);setToast({message:'Profile updated',type:'success'});}
    catch(err){setToast({message:err.message,type:'error'});}finally{setSaving(false);}
  };
  return (
    <div style={{padding:28}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <h2 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:20}}>My Profile</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <Card>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
            <Avatar name={user.name} size={56} />
            <div><div style={{color:C.tx,fontWeight:800,fontSize:16}}>{user.name}</div><div style={{color:C.txs,fontSize:12}}>{user.email}</div><div style={{marginTop:5}}><Badge label={user.role.replace('_',' ')} color="blue" /></div></div>
          </div>
          <Input label="Full Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="Your name" />
          <Input label="Job Title" value={form.jobTitle} onChange={v=>setForm(p=>({...p,jobTitle:v}))} placeholder="e.g. Sales Manager" />
          <Btn onClick={handleSave} disabled={saving}>{saving?'Saving...':'Update Profile'}</Btn>
        </Card>
        <Card>
          <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>Change Password</h3>
          <Input label="New Password" value={form.newPassword} onChange={v=>setForm(p=>({...p,newPassword:v}))} type="password" placeholder="Min 8 characters" />
          <div style={{background:C.warnS,borderRadius:8,padding:'9px 13px',fontSize:12,color:C.warn,marginBottom:14}}>⚠ Leave blank to keep your current password.</div>
          <Btn onClick={handleSave} disabled={saving} variant="ghost">{saving?'Saving...':'Update Password'}</Btn>
        </Card>
      </div>
    </div>
  );
};

// ── Header ────────────────────────────────────────────────────
const Header = ({title,user,notifs,unread,onMarkRead,company}) => {
  const [open,setOpen]=useState(false);
  return (
    <div style={{height:54,borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',padding:'0 24px',justifyContent:'space-between',background:C.bg,position:'sticky',top:0,zIndex:50,flexShrink:0}}>
      <h1 style={{color:C.tx,fontSize:16,fontWeight:700,margin:0}}>{title}</h1>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <LiveClock />
        {company?.website&&<a href={company.website} target="_blank" rel="noopener noreferrer" style={{color:C.acc,fontSize:12,textDecoration:'none'}}>🌐 {company.name}</a>}
        <div style={{position:'relative'}}>
          <button onClick={()=>{setOpen(p=>!p);if(!open)onMarkRead();}} style={{padding:'5px 11px',background:open?C.accS:C.surf,border:`1px solid ${C.bdr}`,borderRadius:8,color:C.tx,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:5}}>
            🔔{unread>0&&<span style={{background:C.err,color:'#fff',borderRadius:10,padding:'0 5px',fontSize:9,fontWeight:700}}>{unread}</span>}
          </button>
          {open&&<div style={{position:'absolute',right:0,top:'calc(100% + 7px)',background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:12,width:280,boxShadow:'0 16px 48px rgba(0,0,0,.4)',zIndex:200,overflow:'hidden'}}>
            <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.bdr}`,fontSize:12,fontWeight:700,color:C.tx}}>Notifications</div>
            {notifs.length===0?<div style={{padding:16,textAlign:'center',color:C.txm,fontSize:12}}>No notifications</div>
            :notifs.slice(0,8).map(n=>(
              <div key={n._id} style={{padding:'9px 14px',borderBottom:`1px solid ${C.bdr}`,background:n.read?'transparent':C.accS}}>
                <div style={{color:C.tx,fontSize:11,fontWeight:n.read?400:600}}>{n.title}</div>
                <div style={{color:C.txm,fontSize:10,marginTop:2}}>{n.message}</div>
              </div>
            ))}
          </div>}
        </div>
        <span style={{color:C.txs,fontSize:11}}>{new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
      </div>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────
const TITLES = {
  dashboard:'Dashboard', employees:'Employees', attendance:'Attendance',
  worklogs:'Work Logs', salary:'Salary', buyers:'Buyers', orders:'Orders',
  analytics:'Analytics', company:'Company Settings', audit:'Audit Logs',
  'my-dashboard':'My Dashboard', 'my-attendance':'My Attendance',
  'my-salary':'My Salary', profile:'My Profile',
  chat:'Messages', tools:'Tools Hub',
};

export default function App() {
  const [user,   setUser]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [tab,    setTab]    = useState('dashboard');
  const [collapsed,setCollapsed]= useState(false);
  const [toast,  setToast]  = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);
  const [company,setCompany]= useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);
  const isAdmin = ['admin','super_admin'].includes(user?.role);

  useEffect(()=>{
    const token=localStorage.getItem('ems_token');
    if (!token){setLoading(false);return;}
    Promise.all([api.get('/auth/me'),api.get('/company')]).then(([u,c])=>{setUser(u.user);setCompany(c.data);setTab(isAdminRole(u.user.role)?'dashboard':'my-dashboard');}).catch(()=>localStorage.removeItem('ems_token')).finally(()=>setLoading(false));
  },[]);

  const isAdminRole=r=>['admin','super_admin'].includes(r);

  useEffect(()=>{ 
    if (!user) return;
    const token=localStorage.getItem('ems_token');
    const socket=io(API,{auth:{token},transports:['websocket','polling'],reconnection:true});
    socketRef.current=socket;
    socket.on('notification',data=>{
      setNotifs(p=>[{_id:Date.now().toString(),title:data.title,message:data.message,read:false,createdAt:new Date().toISOString()},...p]);
      setUnread(c=>c+1);
    });
    socket.on('message:new', msg => {
      if (msg.sender?._id !== user.id) {
        setNotifs(p=>[{_id:Date.now().toString(),title:`💬 New message from ${msg.sender?.name||'Someone'}`,message:msg.content||'Sent a file',read:false,createdAt:new Date().toISOString()},...p]);
        setUnread(c=>c+1);
        setChatUnread(c=>c+1);
        if (Notification.permission==='granted') {
          new Notification(`💬 ${msg.sender?.name||'Someone'}`,{body:msg.content||'Sent a file',icon:'/favicon.ico'});
        }
      }
  
    });
    socket.on('online_users', users => setOnlineUsers(users));
    api.get('/notifications').then(d=>{setNotifs(d.data||[]);setUnread(d.unread||0);}).catch(()=>{});
    return()=>{socket.disconnect();};
  },[user?.id]);

  const handleLogin=(userData,token)=>{
    setUser(userData);
    setTab(isAdminRole(userData.role)?'dashboard':'my-dashboard');
    api.get('/company').then(d=>setCompany(d.data)).catch(()=>{});
    setToast({message:`Welcome, ${userData.name.split(' ')[0]}!`,type:'success'});
    if(Notification.permission==='default') Notification.requestPermission();
  };

  const handleLogout=async()=>{
    try{await api.post('/auth/logout');}catch{}
    localStorage.removeItem('ems_token');setUser(null);setCompany(null);setNotifs([]);setUnread(0);
    if(socketRef.current)socketRef.current.disconnect();
    setToast({message:'Signed out',type:'info'});
  };

  const markAllRead=async()=>{try{await api.post('/notifications/mark-read');setNotifs(p=>p.map(n=>({...n,read:true})));setUnread(0);}catch{}};

  if (loading) return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Segoe UI',sans-serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,borderRadius:13,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900,color:'#fff',margin:'0 auto 16px',boxShadow:'0 0 32px rgba(99,102,241,.3)'}}>E</div>
        <div style={{width:28,height:28,border:`3px solid ${C.bdr}`,borderTop:`3px solid ${C.acc}`,borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}} />
        <div style={{color:C.txm,fontSize:12,marginTop:12}}>Loading...</div>
      </div>
    </div>
  );

  if (!user) return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:${C.bg}}input,select,textarea,button{font-family:inherit}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <AuthPage onLogin={handleLogin} />
    </>
  );

  const renderPage=()=>{
    switch(tab){
      case 'dashboard':      return <Dashboard user={user} setTab={setTab} />;
      case 'my-dashboard':   return <EmployeeDashboard user={user} />;
      case 'employees':      return <EmployeesPage user={user} />;
      case 'attendance':
      case 'my-attendance':  return <AttendancePage user={user} />;
      case 'worklogs':       return <WorkLogsPage user={user} />;
      case 'salary':
      case 'my-salary':      return <SalaryPage user={user} />;
      case 'buyers':         return <BuyersPage />;
      case 'orders':         return <OrdersPage />;
      case 'analytics':      return <AnalyticsPage user={user} />;
      case 'company':        return <CompanyPage />;
      case 'audit':          return <AuditPage />;
      case 'profile':        return <ProfilePage user={user} setUser={setUser} />;
      case 'chat':           return <ChatPage user={user} socket={socketRef.current} onlineUsers={onlineUsers} />;
      case 'tools':          return <ToolsPage />;
      default:               return <Dashboard user={user} setTab={setTab} />;
    }
  };

  const sw=collapsed?68:220;
  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',sans-serif;background:${C.bg};color:${C.tx};overflow:hidden}input,select,textarea,button{font-family:inherit}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:${C.bdr};border-radius:3px}@keyframes spin{to{transform:rotate(360deg)}}select option{background:${C.surf}}`}</style>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)} />}
      <Sidebar tab={tab} setTab={setTab} user={user} onLogout={handleLogout} company={company} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{marginLeft:sw,flex:1,display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',transition:'margin-left .2s ease'}}>
        <Header title={TITLES[tab]||tab} user={user} notifs={notifs} unread={unread} onMarkRead={markAllRead} company={company} />
        <div style={{flex:1,overflowY:'auto',overflowX:'hidden'}}>{renderPage()}</div>
      </div>
    </>
  );
}
