// ToolsPage.jsx — Super App Tools Hub
import { useState, useEffect } from 'react';

const C = {
  bg:'#0f172a', surf:'#1e293b', alt:'#334155', bdr:'#334155',
  acc:'#6366f1', accS:'rgba(99,102,241,.12)',
  ok:'#10b981', warn:'#f59e0b', err:'#ef4444',
  tx:'#f1f5f9', txm:'#64748b', txs:'#94a3b8',
  purple:'#8b5cf6', teal:'#14b8a6',
};

const Card = ({children,style={}}) => <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:14,padding:20,...style}}>{children}</div>;
const Btn = ({children,onClick,variant='primary',size='md',disabled=false,style={}}) => {
  const [h,setH]=useState(false);
  const vs={primary:{bg:h?'#4f46e5':C.acc,color:'#fff'},ghost:{bg:h?C.accS:'transparent',color:C.acc,border:`1px solid ${C.bdr}`},danger:{bg:h?'#dc2626':C.err,color:'#fff'}};
  const ss={sm:{padding:'5px 11px',fontSize:11},md:{padding:'8px 16px',fontSize:12},lg:{padding:'11px 22px',fontSize:14}};
  const v=vs[variant]||vs.primary; const s=ss[size]||ss.md;
  return <button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{...v,...s,border:v.border||'none',borderRadius:8,fontWeight:600,cursor:disabled?'not-allowed':'pointer',transition:'all .15s',display:'inline-flex',alignItems:'center',gap:5,opacity:disabled?.6:1,...style}}>{children}</button>;
};

// ── Calculator ────────────────────────────────────────────────
const Calculator = () => {
  const [display,setDisplay]=useState('0');
  const [prev,setPrev]=useState(null);
  const [op,setOp]=useState(null);
  const [newNum,setNewNum]=useState(true);
  const [mode,setMode]=useState('basic');

  const press = (val) => {
    if (val==='C'){setDisplay('0');setPrev(null);setOp(null);setNewNum(true);return;}
    if (val==='⌫'){setDisplay(d=>d.length>1?d.slice(0,-1):'0');return;}
    if (val==='%'){setDisplay(d=>String(parseFloat(d)/100));return;}
    if (val==='±'){setDisplay(d=>String(-parseFloat(d)));return;}
    if (['+','-','×','÷'].includes(val)){setPrev(parseFloat(display));setOp(val);setNewNum(true);return;}
    if (val==='='){
      if (prev===null||!op)return;
      const cur=parseFloat(display);
      const res={'+':prev+cur,'-':prev-cur,'×':prev*cur,'÷':prev/cur}[op];
      setDisplay(String(parseFloat(res.toFixed(10))));
      setPrev(null);setOp(null);setNewNum(true);return;
    }
    if (val==='.'){if(newNum){setDisplay('0.');setNewNum(false);return;}if(!display.includes('.'))setDisplay(d=>d+'.');return;}
    setDisplay(newNum?val:display==='0'?val:display+val);
    setNewNum(false);
  };

  const sciPress = (fn) => {
    const v=parseFloat(display);
    const res={sin:Math.sin(v*Math.PI/180),cos:Math.cos(v*Math.PI/180),tan:Math.tan(v*Math.PI/180),log:Math.log10(v),ln:Math.log(v),sqrt:Math.sqrt(v),'x²':v*v,'x³':v*v*v,'1/x':1/v}[fn];
    setDisplay(String(parseFloat(res.toFixed(10))));setNewNum(true);
  };

  const basicBtns=[['C','±','%','÷'],['7','8','9','×'],['4','5','6','-'],['1','2','3','+'],['.','0','⌫','=']];
  const sciBtns=[['sin','cos','tan','log'],['ln','√','x²','x³'],['1/x','π','e','(']];

  return (
    <Card style={{maxWidth:280}}>
      <div style={{display:'flex',gap:6,marginBottom:10}}>
        {['basic','scientific'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'5px',borderRadius:6,border:'none',cursor:'pointer',background:mode===m?C.acc:C.alt,color:mode===m?'#fff':C.txs,fontSize:11,fontWeight:600}}>{m.charAt(0).toUpperCase()+m.slice(1)}</button>)}
      </div>
      <div style={{background:C.bg,borderRadius:10,padding:'12px 14px',marginBottom:10,textAlign:'right'}}>
        {op&&<div style={{color:C.txs,fontSize:11}}>{prev} {op}</div>}
        <div style={{color:C.tx,fontSize:28,fontWeight:300,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis'}}>{display}</div>
      </div>
      {mode==='scientific'&&(
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,marginBottom:4}}>
          {sciBtns.flat().map(b=>(
            <button key={b} onClick={()=>b==='π'?setDisplay('3.14159265'):b==='e'?setDisplay('2.71828182'):sciPress(b)} style={{padding:'7px',borderRadius:7,border:'none',cursor:'pointer',background:C.alt,color:C.acc,fontSize:11,fontWeight:600}}>{b}</button>
          ))}
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
        {basicBtns.flat().map(b=>{
          const isOp=['+','-','×','÷','='].includes(b);
          const isDark=['C','±','%'].includes(b);
          return <button key={b} onClick={()=>press(b)} style={{padding:'12px',borderRadius:9,border:'none',cursor:'pointer',background:isOp?C.acc:isDark?C.alt:C.bg,color:isOp?'#fff':C.tx,fontSize:16,fontWeight:isOp?700:400,transition:'opacity .1s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.8'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>{b}</button>;
        })}
      </div>
    </Card>
  );
};

// ── Currency Converter ────────────────────────────────────────
const CurrencyConverter = () => {
  const rates = { USD:1, INR:83.5, AED:3.67, EUR:0.92, GBP:0.79, JPY:151.2, SGD:1.34, CAD:1.36, AUD:1.52, CNY:7.24, SAR:3.75, QAR:3.64, KWD:0.31, BHD:0.38, OMR:0.38, PKR:278.5, BDT:110.5, LKR:305.0, MYR:4.72, IDR:15800, THB:35.1, PHP:56.8, VND:24500, KRW:1330, HKD:7.82, TWD:31.5, MXN:17.2, BRL:5.0, ZAR:18.6, NGN:1580, EGP:48.5, TRY:32.1, RUB:91.5, CHF:0.90, SEK:10.5, NOK:10.7, DKK:6.88, PLN:4.02, CZK:23.1, HUF:360, RON:4.57, BGN:1.80, HRK:7.0, RSD:108, UAH:38.5, NZD:1.63, FJD:2.27, PGK:3.73 };
  const [amount,setAmount]=useState('1');
  const [from,setFrom]=useState('USD');
  const [to,setTo]=useState('INR');
  const result = (parseFloat(amount)||0) / rates[from] * rates[to];
  const currencies = Object.keys(rates);
  return (
    <Card>
      <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:14}}>💱 Currency Converter</h3>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
        <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" style={{flex:1,background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 12px',color:C.tx,fontSize:14,fontWeight:700,outline:'none',fontFamily:'inherit'}} />
        <select value={from} onChange={e=>setFrom(e.target.value)} style={{background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 10px',color:C.tx,fontSize:12,outline:'none',cursor:'pointer',fontFamily:'inherit'}}>
          {currencies.map(c=><option key={c} value={c} style={{background:C.surf}}>{c}</option>)}
        </select>
      </div>
      <div style={{textAlign:'center',marginBottom:12}}>
        <button onClick={()=>{const t=from;setFrom(to);setTo(t);}} style={{background:C.accS,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'6px 16px',color:C.acc,cursor:'pointer',fontSize:16}}>⇅</button>
      </div>
      <div style={{background:C.bg,borderRadius:10,padding:'14px',textAlign:'center',marginBottom:12}}>
        <div style={{color:C.txs,fontSize:11,marginBottom:4}}>{amount} {from} =</div>
        <div style={{color:C.ok,fontSize:24,fontWeight:800,fontFamily:'monospace'}}>{result.toFixed(2)}</div>
        <div style={{color:C.tx,fontSize:13,fontWeight:600}}>{to}</div>
      </div>
      <select value={to} onChange={e=>setTo(e.target.value)} style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 10px',color:C.tx,fontSize:12,outline:'none',cursor:'pointer',fontFamily:'inherit'}}>
        {currencies.map(c=><option key={c} value={c} style={{background:C.surf}}>{c}</option>)}
      </select>
      <div style={{color:C.txm,fontSize:10,marginTop:8,textAlign:'center'}}>Rates approximate · Updated regularly</div>
    </Card>
  );
};

// ── Unit Converter ────────────────────────────────────────────
const UnitConverter = () => {
  const cats = {
    Weight:{KG:1,LB:2.205,OZ:35.274,G:1000,TON:0.001},
    Length:{M:1,KM:0.001,CM:100,MM:1000,INCH:39.37,FT:3.281,MILE:0.000621},
    Temperature:null,
  };
  const [cat,setCat]=useState('Weight');
  const [val,setVal]=useState('1');
  const [from,setFrom]=useState('KG');
  const [to,setTo]=useState('LB');

  const convert = () => {
    if (cat==='Temperature') {
      const v=parseFloat(val)||0;
      if(from==='C'&&to==='F')return(v*9/5+32).toFixed(2);
      if(from==='F'&&to==='C')return((v-32)*5/9).toFixed(2);
      if(from==='C'&&to==='K')return(v+273.15).toFixed(2);
      if(from==='K'&&to==='C')return(v-273.15).toFixed(2);
      if(from==='F'&&to==='K')return((v-32)*5/9+273.15).toFixed(2);
      if(from==='K'&&to==='F')return((v-273.15)*9/5+32).toFixed(2);
      return v.toFixed(2);
    }
    const r=cats[cat]; return((parseFloat(val)||0)/r[from]*r[to]).toFixed(4);
  };

  const units=cat==='Temperature'?['C','F','K']:Object.keys(cats[cat]||{});
  return (
    <Card>
      <h3 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:12}}>📐 Unit Converter</h3>
      <div style={{display:'flex',gap:5,marginBottom:12}}>
        {Object.keys(cats).map(c=><button key={c} onClick={()=>{setCat(c);const u=c==='Temperature'?['C','F','K']:Object.keys(cats[c]);setFrom(u[0]);setTo(u[1]);}} style={{flex:1,padding:'5px',borderRadius:6,border:'none',cursor:'pointer',background:cat===c?C.acc:C.alt,color:cat===c?'#fff':C.txs,fontSize:10,fontWeight:600}}>{c}</button>)}
      </div>
      <input value={val} onChange={e=>setVal(e.target.value)} type="number" style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 12px',color:C.tx,fontSize:14,outline:'none',marginBottom:8,boxSizing:'border-box',fontFamily:'inherit'}} />
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center',marginBottom:12}}>
        <select value={from} onChange={e=>setFrom(e.target.value)} style={{background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'8px',color:C.tx,fontSize:12,outline:'none',cursor:'pointer',fontFamily:'inherit'}}>
          {units.map(u=><option key={u} value={u} style={{background:C.surf}}>{u}</option>)}
        </select>
        <span style={{color:C.txs,fontSize:14}}>→</span>
        <select value={to} onChange={e=>setTo(e.target.value)} style={{background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'8px',color:C.tx,fontSize:12,outline:'none',cursor:'pointer',fontFamily:'inherit'}}>
          {units.map(u=><option key={u} value={u} style={{background:C.surf}}>{u}</option>)}
        </select>
      </div>
      <div style={{background:C.bg,borderRadius:10,padding:'12px',textAlign:'center'}}>
        <div style={{color:C.ok,fontSize:22,fontWeight:800,fontFamily:'monospace'}}>{convert()}</div>
        <div style={{color:C.txs,fontSize:11}}>{val} {from} = {convert()} {to}</div>
      </div>
    </Card>
  );
};

// ── Notes ─────────────────────────────────────────────────────
const NotesApp = () => {
  const [notes,setNotes]=useState(()=>{try{return JSON.parse(localStorage.getItem('ems_notes')||'[]');}catch{return [];}});
  const [active,setActive]=useState(null);
  const [title,setTitle]=useState('');
  const [body,setBody]=useState('');
  const [saved,setSaved]=useState(false);

  const save = () => {
    if (!title.trim()) return;
    const id = active||Date.now().toString();
    const note = { id, title, body, updatedAt: new Date().toISOString() };
    const updated = active ? notes.map(n=>n.id===active?note:n) : [note,...notes];
    setNotes(updated);
    localStorage.setItem('ems_notes', JSON.stringify(updated));
    setActive(id);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const del = (id) => {
    const n=notes.filter(n=>n.id!==id);
    setNotes(n);
    localStorage.setItem('ems_notes',JSON.stringify(n));
    if(active===id){setActive(null);setTitle('');setBody('');}
  };

  const newNote = () => { setActive(null);setTitle('');setBody('');setSaved(false); };

  return (
    <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:14,height:380}}>
      <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:12,overflow:'hidden',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'10px 12px',borderBottom:`1px solid ${C.bdr}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:C.tx,fontSize:12,fontWeight:700}}>📝 Notes ({notes.length})</span>
          <button onClick={newNote} style={{background:C.acc,border:'none',borderRadius:6,padding:'3px 9px',color:'#fff',cursor:'pointer',fontSize:10,fontWeight:600}}>+ New</button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {notes.length===0?<div style={{padding:16,color:C.txm,fontSize:12,textAlign:'center'}}>No notes yet</div>
          :notes.map(n=>(
            <div key={n.id} onClick={()=>{setActive(n.id);setTitle(n.title);setBody(n.body);setSaved(false);}} style={{padding:'9px 12px',borderBottom:`1px solid ${C.bdr}`,cursor:'pointer',background:active===n.id?C.accS:'transparent'}}
              onMouseEnter={e=>{if(active!==n.id)e.currentTarget.style.background=C.alt;}} onMouseLeave={e=>{if(active!==n.id)e.currentTarget.style.background='transparent';}}>
              <div style={{color:C.tx,fontSize:12,fontWeight:600,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.title}</div>
              <div style={{color:C.txs,fontSize:10}}>{new Date(n.updatedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:12,padding:14,display:'flex',flexDirection:'column',gap:8}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Note title..." style={{background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 12px',color:C.tx,fontSize:14,fontWeight:600,outline:'none',fontFamily:'inherit'}} />
        <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your note here..." style={{flex:1,background:C.bg,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'10px 12px',color:C.tx,fontSize:12,outline:'none',resize:'none',lineHeight:1.6,fontFamily:'inherit'}} />
        <div style={{display:'flex',gap:7,alignItems:'center'}}>
          <Btn onClick={save} disabled={!title.trim()}>💾 Save</Btn>
          {active&&<Btn variant="danger" onClick={()=>del(active)}>🗑 Delete</Btn>}
          {saved&&<span style={{color:C.ok,fontSize:11,fontWeight:600}}>✅ Saved!</span>}
        </div>
      </div>
    </div>
  );
};

// ── Web Tools ─────────────────────────────────────────────────
const WebTools = () => {
  const [searchQ,setSearchQ]=useState('');
  const tools = [
    {icon:'🤖',name:'ChatGPT',desc:'AI Assistant',action:()=>window.open('https://chat.openai.com','_blank')},
    {icon:'📧',name:'Gmail',desc:'Company email',action:()=>window.open('https://mail.google.com','_blank')},
    {icon:'📁',name:'Google Drive',desc:'Shared documents',action:()=>window.open('https://drive.google.com','_blank')},
    {icon:'📅',name:'Google Meet',desc:'Start or join meeting',action:()=>window.open('https://meet.google.com','_blank')},
    {icon:'📊',name:'Google Sheets',desc:'Spreadsheets',action:()=>window.open('https://sheets.google.com','_blank')},
    {icon:'📄',name:'Google Docs',desc:'Documents',action:()=>window.open('https://docs.google.com','_blank')},
    {icon:'📸',name:'Instagram',desc:'Social media',action:()=>window.open('https://instagram.com','_blank')},
    {icon:'🐦',name:'Twitter / X',desc:'Social media',action:()=>window.open('https://x.com','_blank')},
    {icon:'💼',name:'LinkedIn',desc:'Professional network',action:()=>window.open('https://linkedin.com','_blank')},
    {icon:'💬',name:'WhatsApp Web',desc:'Messaging',action:()=>window.open('https://web.whatsapp.com','_blank')},
  ];
  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:16}}>
        <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQ)}`,'_blank');}} placeholder="🔍 Search Google..." style={{flex:1,background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:9,padding:'9px 14px',color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit'}} />
        <Btn onClick={()=>window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQ)}`,'_blank')} disabled={!searchQ.trim()}>Search</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
        {tools.map(t=>(
          <div key={t.name} onClick={t.action} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:11,padding:'14px 12px',cursor:'pointer',textAlign:'center',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.alt;e.currentTarget.style.borderColor=C.acc;}} onMouseLeave={e=>{e.currentTarget.style.background=C.surf;e.currentTarget.style.borderColor=C.bdr;}}>
            <div style={{fontSize:24,marginBottom:6}}>{t.icon}</div>
            <div style={{color:C.tx,fontSize:11,fontWeight:700,marginBottom:2}}>{t.name}</div>
            <div style={{color:C.txs,fontSize:10}}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Tools Page ───────────────────────────────────────────
const TOOLS = [
  {id:'web',icon:'🌐',label:'Web & Social'},
  {id:'calc',icon:'🧮',label:'Calculator'},
  {id:'currency',icon:'💱',label:'Currency'},
  {id:'units',icon:'📐',label:'Units'},
  {id:'notes',icon:'📝',label:'Notes'},
];

export default function ToolsPage() {
  const [active,setActive]=useState('web');
  return (
    <div style={{padding:24,height:'100%',overflow:'auto'}}>
      <h2 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:16}}>🧰 Tools Hub</h2>
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {TOOLS.map(t=>(
          <button key={t.id} onClick={()=>setActive(t.id)} style={{padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',background:active===t.id?C.acc:C.alt,color:active===t.id?'#fff':C.txs,fontWeight:600,fontSize:12,transition:'all .15s',display:'flex',alignItems:'center',gap:5}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {active==='web'&&<WebTools />}
      {active==='calc'&&<Calculator />}
      {active==='currency'&&<CurrencyConverter />}
      {active==='units'&&<UnitConverter />}
      {active==='notes'&&<NotesApp />}
    </div>
  );
}