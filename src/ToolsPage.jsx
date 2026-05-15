// ToolsPage.jsx — Nexus Pro Tools Hub
// Tools: Web & Social, Calculator (with AC), Currency, Units, Notes (Tiptap + backend)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import {
  Calculator as CalcIcon, Notebook, Globe, ArrowLeftRight, Ruler,
  Bold, Italic, Underline as UnderlineIcon, Highlighter,
  List, ListOrdered, Plus, Trash2, Save, Search,
} from 'lucide-react';

const API = "https://nexus-backend-production-771f.up.railway.app/api";
const getToken = () => localStorage.getItem("ems_token") || "";
const apiFetch = (path, opts = {}) => fetch(`${API}${path}`, {
  ...opts,
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
});

const C = {
  bg:'#0b0d14', surf:'#13151f', alt:'#1a1d29', bdr:'rgba(255,255,255,0.06)',
  acc:'#6366f1', accS:'rgba(99,102,241,.12)', gold:'#D4A24C',
  ok:'#22c55e', warn:'#f59e0b', err:'#ef4444',
  tx:'#f1f5ff', txm:'#8892aa', txs:'#3d4d6a',
  purple:'#a855f7',
};

// ════════════════════════════════════════════════════════════
// CARD + BUTTON HELPERS
// ════════════════════════════════════════════════════════════
const Card = ({children,style={}}) => (
  <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:14,padding:20,...style}}>{children}</div>
);

const Btn = ({children,onClick,variant='primary',size='md',disabled=false,style={}}) => {
  const [h,setH] = useState(false);
  const vs = {
    primary: {bg: h?'#4f46e5':C.acc, color:'#fff'},
    ghost:   {bg: h?C.accS:'transparent', color:C.acc, border:`1px solid ${C.bdr}`},
    danger:  {bg: h?'#dc2626':C.err, color:'#fff'},
    gold:    {bg: h?'#b88a3a':C.gold, color:'#0b0d14'},
  };
  const ss = { sm:{padding:'5px 11px',fontSize:11}, md:{padding:'8px 16px',fontSize:12}, lg:{padding:'11px 22px',fontSize:14} };
  const v = vs[variant]||vs.primary, s = ss[size]||ss.md;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{...v,...s,border:v.border||'none',borderRadius:8,fontWeight:600,cursor:disabled?'not-allowed':'pointer',transition:'all .15s',display:'inline-flex',alignItems:'center',gap:5,opacity:disabled?.6:1,...style}}>
      {children}
    </button>
  );
};

// ════════════════════════════════════════════════════════════
// 1) CALCULATOR — with AC button (Bug #25 / A17)
// ════════════════════════════════════════════════════════════
const Calculator = () => {
  const [display,setDisplay] = useState('0');
  const [prev,setPrev]       = useState(null);
  const [op,setOp]           = useState(null);
  const [newNum,setNewNum]   = useState(true);
  const [mode,setMode]       = useState('basic');
  const [history,setHistory] = useState([]);

  // AC = wipe everything (display + prev + op + history)
  const allClear = () => {
    setDisplay('0'); setPrev(null); setOp(null); setNewNum(true); setHistory([]);
  };

  const press = (val) => {
    if (val==='AC') return allClear();
    if (val==='C') { setDisplay('0'); setNewNum(true); return; }
    if (val==='⌫') { setDisplay(d => d.length>1?d.slice(0,-1):'0'); return; }
    if (val==='%') { setDisplay(d => String(parseFloat(d)/100)); return; }
    if (val==='±') { setDisplay(d => String(-parseFloat(d))); return; }
    if (['+','-','×','÷'].includes(val)) {
      if (prev !== null && op && !newNum) {
        const cur = parseFloat(display);
        const res = {'+':prev+cur,'-':prev-cur,'×':prev*cur,'÷':prev/cur}[op];
        const r = parseFloat(res.toFixed(10));
        setDisplay(String(r));
        setPrev(r);
      } else {
        setPrev(parseFloat(display));
      }
      setOp(val); setNewNum(true); return;
    }
    if (val==='=') {
      if (prev === null || !op) return;
      const cur = parseFloat(display);
      const res = {'+':prev+cur,'-':prev-cur,'×':prev*cur,'÷':prev/cur}[op];
      const r = parseFloat(res.toFixed(10));
      setHistory(h => [`${prev} ${op} ${cur} = ${r}`, ...h.slice(0,4)]);
      setDisplay(String(r)); setPrev(null); setOp(null); setNewNum(true); return;
    }
    if (val==='.') {
      if (newNum) { setDisplay('0.'); setNewNum(false); return; }
      if (!display.includes('.')) setDisplay(d => d+'.');
      return;
    }
    setDisplay(newNum ? val : (display==='0' ? val : display+val));
    setNewNum(false);
  };

  const sciPress = (fn) => {
    const v = parseFloat(display);
    const map = {
      sin:Math.sin(v*Math.PI/180), cos:Math.cos(v*Math.PI/180), tan:Math.tan(v*Math.PI/180),
      log:Math.log10(v), ln:Math.log(v),
      '√':Math.sqrt(v), 'x²':v*v, 'x³':v*v*v, '1/x':1/v
    };
    setDisplay(String(parseFloat(map[fn].toFixed(10))));
    setNewNum(true);
  };

  const basicBtns = [
    [{l:'AC',c:C.err,bold:true}, {l:'C',c:'#475569'}, {l:'±',c:'#475569'}, {l:'÷',c:C.acc}],
    [{l:'7'}, {l:'8'}, {l:'9'}, {l:'×',c:C.acc}],
    [{l:'4'}, {l:'5'}, {l:'6'}, {l:'-',c:C.acc}],
    [{l:'1'}, {l:'2'}, {l:'3'}, {l:'+',c:C.acc}],
    [{l:'.',c:'#475569'}, {l:'0'}, {l:'⌫',c:'#475569'}, {l:'=',c:C.ok}],
  ];
  const sciBtns = [['sin','cos','tan','log'], ['ln','√','x²','x³'], ['1/x','π','e','%']];

  return (
    <div style={{display:'grid',gridTemplateColumns:mode==='scientific'?'1fr 320px':'1fr',gap:16,maxWidth:mode==='scientific'?700:340}}>
      <Card style={{padding:16}}>
        <div style={{display:'flex',gap:6,marginBottom:12}}>
          {['basic','scientific'].map(m => (
            <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'6px',borderRadius:7,border:'none',cursor:'pointer',background:mode===m?C.acc:C.alt,color:mode===m?'#fff':C.txm,fontSize:11,fontWeight:700,letterSpacing:'.04em',textTransform:'capitalize'}}>
              {m}
            </button>
          ))}
        </div>
        <div style={{background:'#0a0f1e',borderRadius:12,padding:'16px 18px',marginBottom:12,minHeight:80,display:'flex',flexDirection:'column',justifyContent:'flex-end',textAlign:'right'}}>
          {op && <div style={{color:C.txm,fontSize:12,marginBottom:2,fontFamily:'monospace'}}>{prev} {op}</div>}
          <div style={{color:'#fff',fontSize:36,fontWeight:200,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',letterSpacing:'-1px'}}>{display}</div>
        </div>
        {mode==='scientific' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginBottom:5}}>
            {sciBtns.flat().map(b => (
              <button key={b} onClick={()=>{
                if (b==='π') setDisplay('3.14159265');
                else if (b==='e') setDisplay('2.71828182');
                else if (b==='%') press('%');
                else sciPress(b);
              }} style={{padding:'9px',borderRadius:8,border:'none',cursor:'pointer',background:'rgba(99,102,241,.15)',color:C.acc,fontSize:12,fontWeight:700}}>
                {b}
              </button>
            ))}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
          {basicBtns.flat().map((b,i) => (
            <button key={i} onClick={()=>press(b.l)} style={{padding:'16px 8px',borderRadius:10,border:'none',cursor:'pointer',background:b.c||C.alt,color:'#fff',fontSize:b.bold?16:18,fontWeight:b.bold?800:(b.c?700:400),letterSpacing:b.bold?'.05em':'normal',transition:'opacity .1s',fontFamily:'monospace'}}
                onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              {b.l}
            </button>
          ))}
        </div>
      </Card>
      {mode==='scientific' && (
        <Card style={{padding:16}}>
          <h4 style={{color:C.tx,fontSize:13,fontWeight:700,marginBottom:10}}>History</h4>
          {history.length === 0
            ? <p style={{color:C.txs,fontSize:12}}>No calculations yet</p>
            : history.map((h,i) => <div key={i} style={{padding:'7px 0',borderBottom:`1px solid ${C.bdr}`,color:C.txm,fontSize:12,fontFamily:'monospace'}}>{h}</div>)
          }
        </Card>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 2) CURRENCY CONVERTER
// ════════════════════════════════════════════════════════════
const CurrencyConverter = () => {
  const [from,setFrom] = useState('USD');
  const [to,setTo]     = useState('INR');
  const [amount,setAmount] = useState('100');
  const [rate,setRate] = useState(null);
  const [loading,setLoading] = useState(false);
  const currencies = ['AED','AFN','ALL','AMD','ANG','AOA','ARS','AUD','AWG','AZN','BAM','BBD','BDT','BGN','BHD','BIF','BMD','BND','BOB','BRL','BSD','BTN','BWP','BYN','BZD','CAD','CDF','CHF','CLP','CNY','COP','CRC','CUP','CVE','CZK','DJF','DKK','DOP','DZD','EGP','ERN','ETB','EUR','FJD','FKP','FOK','GBP','GEL','GGP','GHS','GIP','GMD','GNF','GTQ','GYD','HKD','HNL','HRK','HTG','HUF','IDR','ILS','IMP','INR','IQD','IRR','ISK','JEP','JMD','JOD','JPY','KES','KGS','KHR','KID','KMF','KRW','KWD','KYD','KZT','LAK','LBP','LKR','LRD','LSL','LYD','MAD','MDL','MGA','MKD','MMK','MNT','MOP','MRU','MUR','MVR','MWK','MXN','MYR','MZN','NAD','NGN','NIO','NOK','NPR','NZD','OMR','PAB','PEN','PGK','PHP','PKR','PLN','PYG','QAR','RON','RSD','RUB','RWF','SAR','SBD','SCR','SDG','SEK','SGD','SHP','SLE','SLL','SOS','SRD','SSP','STN','SYP','SZL','THB','TJS','TMT','TND','TOP','TRY','TTD','TVD','TWD','TZS','UAH','UGX','USD','UYU','UZS','VES','VND','VUV','WST','XAF','XCD','XCG','XDR','XOF','XPF','YER','ZAR','ZMW','ZWL'];

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
      .then(r => r.json())
      .then(d => { setRate(d.rates[to]); setLoading(false); })
      .catch(() => setLoading(false));
  }, [from, to]);

  const result = rate ? (parseFloat(amount||0) * rate).toFixed(2) : '—';

  return (
    <Card style={{maxWidth:480}}>
      <h3 style={{color:C.tx,fontSize:14,fontWeight:700,marginBottom:14}}>💱 Currency Converter</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,alignItems:'end'}}>
        <div>
          <label style={{color:C.txm,fontSize:11,fontWeight:600,marginBottom:6,display:'block'}}>From</label>
          <select value={from} onChange={e=>setFrom(e.target.value)} style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 11px',color:C.tx,fontSize:13,outline:'none'}}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button onClick={()=>{ const t=from; setFrom(to); setTo(t); }} style={{background:C.accS,border:`1px solid ${C.bdr}`,borderRadius:8,padding:9,cursor:'pointer',color:C.acc}}>
          <ArrowLeftRight size={14} />
        </button>
        <div>
          <label style={{color:C.txm,fontSize:11,fontWeight:600,marginBottom:6,display:'block'}}>To</label>
          <select value={to} onChange={e=>setTo(e.target.value)} style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 11px',color:C.tx,fontSize:13,outline:'none'}}>
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="Amount"
        style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'10px 13px',color:C.tx,fontSize:14,outline:'none',marginTop:14}} />
      <div style={{marginTop:14,padding:'14px 16px',background:`linear-gradient(135deg, ${C.accS}, transparent)`,borderRadius:10,border:`1px solid ${C.acc}33`}}>
        <p style={{color:C.txm,fontSize:11,marginBottom:4}}>{amount} {from} =</p>
        <p style={{color:C.tx,fontSize:24,fontWeight:800}}>{loading ? '...' : `${result} ${to}`}</p>
        {rate && <p style={{color:C.txs,fontSize:10,marginTop:5}}>1 {from} = {rate.toFixed(4)} {to}</p>}
      </div>
    </Card>
  );
};

// ════════════════════════════════════════════════════════════
// 3) UNIT CONVERTER (kept small + functional)
// ════════════════════════════════════════════════════════════
const UnitConverter = () => {
  const [type,setType]   = useState('length');
  const [from,setFrom]   = useState('m');
  const [to,setTo]       = useState('km');
  const [value,setValue] = useState('1');

  const units = {
    length: { m:1, km:1000, cm:0.01, mm:0.001, ft:0.3048, in:0.0254, yd:0.9144, mi:1609.34 },
    weight: { kg:1, g:0.001, mg:0.000001, lb:0.453592, oz:0.0283495, ton:1000 },
    volume: { l:1, ml:0.001, gal:3.78541, qt:0.946353, pt:0.473176, cup:0.236588 },
  };
  const list = Object.keys(units[type]);
  const result = value && units[type][from] && units[type][to]
    ? (parseFloat(value) * units[type][from] / units[type][to]).toFixed(6).replace(/\.?0+$/, '')
    : '—';

  return (
    <Card style={{maxWidth:480}}>
      <h3 style={{color:C.tx,fontSize:14,fontWeight:700,marginBottom:14}}>📐 Unit Converter</h3>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {Object.keys(units).map(t => (
          <button key={t} onClick={()=>{ setType(t); setFrom(Object.keys(units[t])[0]); setTo(Object.keys(units[t])[1]); }}
            style={{flex:1,padding:'8px',borderRadius:7,border:'none',cursor:'pointer',background:type===t?C.acc:C.alt,color:type===t?'#fff':C.txm,fontSize:11,fontWeight:700,textTransform:'capitalize'}}>
            {t}
          </button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:10,alignItems:'end'}}>
        <div>
          <label style={{color:C.txm,fontSize:11,fontWeight:600,marginBottom:6,display:'block'}}>From</label>
          <select value={from} onChange={e=>setFrom(e.target.value)} style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 11px',color:C.tx,fontSize:13,outline:'none'}}>
            {list.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <button onClick={()=>{ const t=from; setFrom(to); setTo(t); }} style={{background:C.accS,border:`1px solid ${C.bdr}`,borderRadius:8,padding:9,cursor:'pointer',color:C.acc}}>
          <ArrowLeftRight size={14} />
        </button>
        <div>
          <label style={{color:C.txm,fontSize:11,fontWeight:600,marginBottom:6,display:'block'}}>To</label>
          <select value={to} onChange={e=>setTo(e.target.value)} style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 11px',color:C.tx,fontSize:13,outline:'none'}}>
            {list.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <input value={value} onChange={e=>setValue(e.target.value)} type="number"
        style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'10px 13px',color:C.tx,fontSize:14,outline:'none',marginTop:14}} />
      <div style={{marginTop:14,padding:'14px 16px',background:`linear-gradient(135deg, ${C.accS}, transparent)`,borderRadius:10,border:`1px solid ${C.acc}33`}}>
        <p style={{color:C.tx,fontSize:18,fontWeight:800}}>{value} {from} = {result} {to}</p>
      </div>
    </Card>
  );
};

// ════════════════════════════════════════════════════════════
// 4) NOTES — Tiptap rich text + per-user backend (Bug #26 / A18, #27 / A19)
// ════════════════════════════════════════════════════════════
const Notes = () => {
  const [notes, setNotes]   = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const saveTimerRef = useRef(null);

  const active = notes.find(n => n._id === activeId);

  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight.configure({ multicolor: false })],
    content: active?.content || '',
    editorProps: {
      attributes: {
        style: 'min-height:280px;outline:none;padding:16px;color:#e6e7eb;font-size:14px;line-height:1.6;',
      }
    },
    onUpdate: ({ editor }) => {
      if (!activeId) return;
      const html = editor.getHTML();
      setNotes(prev => prev.map(n => n._id === activeId ? { ...n, content: html } : n));
      setSaveStatus('saving');
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => persistNote(activeId, { content: html }), 700);
    }
  }, [activeId]);

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await apiFetch('/notes');
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (cancelled) return;
        const list = d.notes || [];
        setNotes(list);
        if (list.length && !activeId) setActiveId(list[0]._id);
      } catch (e) { console.warn('Notes load failed', e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync editor content when active note changes
  useEffect(() => {
    if (editor && active) {
      const current = editor.getHTML();
      if (current !== (active.content || '')) {
        editor.commands.setContent(active.content || '', false);
      }
    }
  }, [activeId, editor, active]);

  const persistNote = useCallback(async (id, patch) => {
    try {
      const r = await apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setNotes(prev => prev.map(n => n._id === id ? d.note : n));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1200);
    } catch { setSaveStatus('error'); }
  }, []);

  const onTitleChange = (e) => {
    if (!activeId) return;
    const title = e.target.value;
    setNotes(prev => prev.map(n => n._id === activeId ? { ...n, title } : n));
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => persistNote(activeId, { title }), 700);
  };

  const createNote = async () => {
    try {
      const r = await apiFetch('/notes', { method: 'POST', body: JSON.stringify({ title: 'Untitled', content: '' }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setNotes(prev => [d.note, ...prev]);
      setActiveId(d.note._id);
    } catch (e) { console.error(e); }
  };

  const deleteNote = async (id) => {
    if (!confirm('Delete this note?')) return;
    const backup = notes;
    setNotes(prev => prev.filter(n => n._id !== id));
    if (activeId === id) {
      const next = notes.find(n => n._id !== id);
      setActiveId(next ? next._id : null);
    }
    try {
      const r = await apiFetch(`/notes/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
    } catch { setNotes(backup); }
  };

  const TBtn = ({ onClick, active: act, children, label }) => (
    <button type="button" onMouseDown={(e)=>e.preventDefault()} onClick={onClick} title={label}
      style={{background:act?'rgba(99,102,241,0.2)':'transparent',border:`1px solid ${act?'rgba(99,102,241,0.4)':'transparent'}`,borderRadius:6,padding:6,cursor:'pointer',color:act?'#a5a8ff':C.txm,display:'flex',alignItems:'center',justifyContent:'center'}}>
      {children}
    </button>
  );

  return (
    <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:14,height:480}}>
      {/* List */}
      <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:12,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'12px 14px',borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{color:C.tx,fontSize:13,fontWeight:700}}>📝 My Notes ({notes.length})</span>
          <button onClick={createNote} style={{background:'rgba(99,102,241,0.15)',border:`1px solid rgba(99,102,241,0.4)`,borderRadius:6,padding:'4px 8px',cursor:'pointer',color:'#a5a8ff',display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600}}>
            <Plus size={11} /> New
          </button>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {loading && <div style={{padding:16,fontSize:12,color:C.txs}}>Loading…</div>}
          {!loading && notes.length === 0 && (
            <div style={{padding:24,fontSize:12,color:C.txs,textAlign:'center'}}>
              No notes yet.<br/>Click <strong>+ New</strong> to start.
            </div>
          )}
          {notes.map(n => (
            <div key={n._id} onClick={()=>setActiveId(n._id)}
              style={{padding:'12px 14px',borderBottom:`1px solid ${C.bdr}`,cursor:'pointer',background:activeId===n._id?'rgba(99,102,241,0.08)':'transparent',borderLeft:`3px solid ${activeId===n._id?C.acc:'transparent'}`}}>
              <div style={{color:C.tx,fontSize:13,fontWeight:600,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {n.title || 'Untitled'}
              </div>
              <div style={{color:C.txs,fontSize:10,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {(n.content||'').replace(/<[^>]+>/g,'').slice(0,60) || 'Empty'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:12,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {!active ? (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:C.txs,fontSize:13}}>
            Select or create a note to start writing.
          </div>
        ) : (
          <>
            <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',gap:12}}>
              <input value={active.title || ''} onChange={onTitleChange} placeholder="Untitled"
                style={{flex:1,background:'transparent',border:'none',outline:'none',color:C.tx,fontSize:16,fontWeight:600}} />
              <div style={{fontSize:11,color: saveStatus==='error'?C.err: saveStatus==='saving'?C.gold: saveStatus==='saved'?C.ok:C.txs,display:'flex',alignItems:'center',gap:4}}>
                {saveStatus === 'saving' && <><Save size={11}/> Saving…</>}
                {saveStatus === 'saved'  && <><Save size={11}/> Saved</>}
                {saveStatus === 'error'  && 'Save failed'}
                {saveStatus === 'idle'   && 'All changes saved'}
              </div>
              <button onClick={()=>deleteNote(active._id)} title="Delete"
                style={{background:'transparent',border:`1px solid rgba(239,68,68,0.3)`,borderRadius:6,padding:6,cursor:'pointer',color:C.err,display:'flex'}}>
                <Trash2 size={13} />
              </button>
            </div>
            <div style={{padding:'8px 12px',borderBottom:`1px solid ${C.bdr}`,display:'flex',gap:4}}>
              <TBtn onClick={()=>editor.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} label="Bold"><Bold size={13}/></TBtn>
              <TBtn onClick={()=>editor.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} label="Italic"><Italic size={13}/></TBtn>
              <TBtn onClick={()=>editor.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')} label="Underline"><UnderlineIcon size={13}/></TBtn>
              <TBtn onClick={()=>editor.chain().focus().toggleHighlight().run()} active={editor?.isActive('highlight')} label="Highlight"><Highlighter size={13}/></TBtn>
              <div style={{width:1,background:C.bdr,margin:'0 4px'}} />
              <TBtn onClick={()=>editor.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} label="Bullet list"><List size={13}/></TBtn>
              <TBtn onClick={()=>editor.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} label="Numbered list"><ListOrdered size={13}/></TBtn>
            </div>
            <div style={{flex:1,overflowY:'auto'}}>
              <EditorContent editor={editor} />
            </div>
          </>
        )}
      </div>

      {/* Tiptap CSS */}
      <style>{`
        .ProseMirror { caret-color: ${C.acc}; }
        .ProseMirror p { margin: 0 0 .75em 0; }
        .ProseMirror p:last-child { margin-bottom: 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 0 0 .75em 0; }
        .ProseMirror li { margin: .25em 0; }
        .ProseMirror mark { background: ${C.gold}; color: ${C.bg}; padding: 0 2px; border-radius: 2px; }
        .ProseMirror strong { color: #fff; }
        .ProseMirror u { text-decoration-color: ${C.acc}; }
        .ProseMirror:focus { outline: none; }
      `}</style>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// 5) WHATSAPP — real green logo (Bug #24 / A16)
// ════════════════════════════════════════════════════════════
const WhatsAppIcon = ({ size=36 }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#25D366"/>
        <stop offset="100%" stopColor="#128C7E"/>
      </linearGradient>
    </defs>
    <rect width="256" height="256" rx="56" fill="url(#waBg)"/>
    <path fill="#fff" d="M128 50c-43 0-78 35-78 78 0 14 4 27 10 38l-11 40 41-11c11 6 24 10 38 10 43 0 78-35 78-78s-35-77-78-77zm0 142c-12 0-23-3-33-9l-2-1-25 7 7-24-2-3c-7-10-10-22-10-34 0-35 29-64 65-64 17 0 33 7 45 19s19 28 19 45c-1 36-30 64-64 64zm36-48c-2-1-12-6-13-7-2-1-3-1-5 1-1 2-5 7-7 8-1 1-2 2-4 0-2-1-9-3-16-10-6-5-10-12-12-14-1-2 0-3 1-4l3-3c1-1 1-2 2-3 1-2 0-3 0-4 0-1-5-12-7-16-2-4-3-3-5-3h-4c-1 0-3 0-5 2-2 2-7 7-7 16 0 10 7 19 9 21 1 1 13 21 33 28 19 7 19 5 23 5s12-5 14-10c1-5 1-9 1-9-1 0-2-1-4-2z"/>
  </svg>
);

const getFavicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const WebTools = () => {
  const [searchQ,setSearchQ] = useState('');
  const tools = [
    {name:'WhatsApp', desc:'Messaging',     custom:'whatsapp', url:'https://web.whatsapp.com'},
    {name:'ChatGPT',  desc:'AI Assistant',   domain:'chat.openai.com',     url:'https://chat.openai.com'},
    {name:'Gmail',    desc:'Email',          domain:'mail.google.com',     url:'https://mail.google.com'},
    {name:'Drive',    desc:'Cloud storage',  domain:'drive.google.com',    url:'https://drive.google.com'},
    {name:'Meet',     desc:'Video calls',    domain:'meet.google.com',     url:'https://meet.google.com'},
    {name:'Sheets',   desc:'Spreadsheets',   domain:'sheets.google.com',   url:'https://sheets.google.com'},
    {name:'Docs',     desc:'Documents',      domain:'docs.google.com',     url:'https://docs.google.com'},
    {name:'LinkedIn', desc:'Professional',   domain:'linkedin.com',        url:'https://linkedin.com'},
    {name:'X',        desc:'Social',         domain:'x.com',               url:'https://x.com'},
    {name:'Instagram',desc:'Social',         domain:'instagram.com',       url:'https://instagram.com'},
  ];

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:18}}>
        <div style={{flex:1,position:'relative'}}>
          <Search size={14} color={C.txs} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)'}} />
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'&&searchQ.trim())window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQ)}`,'_blank');}}
            placeholder="Search Google…"
            style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:9,padding:'10px 14px 10px 36px',color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}} />
        </div>
        <Btn onClick={()=>window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQ)}`,'_blank')} disabled={!searchQ.trim()}>Search</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10}}>
        {tools.map(t => (
          <div key={t.name} onClick={()=>window.open(t.url,'_blank')}
            style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:12,padding:'16px 12px',cursor:'pointer',textAlign:'center',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.alt;e.currentTarget.style.borderColor=C.acc;e.currentTarget.style.transform='translateY(-2px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.surf;e.currentTarget.style.borderColor=C.bdr;e.currentTarget.style.transform='translateY(0)';}}>
            {t.custom === 'whatsapp'
              ? <div style={{width:36,height:36,marginBottom:8,marginLeft:'auto',marginRight:'auto',display:'flex'}}><WhatsAppIcon size={36}/></div>
              : <img src={getFavicon(t.domain)} alt={t.name} style={{width:36,height:36,marginBottom:8,borderRadius:8}} onError={e=>e.target.style.display='none'} />}
            <div style={{color:C.tx,fontSize:11,fontWeight:700,marginBottom:2}}>{t.name}</div>
            <div style={{color:C.txs,fontSize:10}}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
const TOOLS = [
  {id:'web',      label:'Web & Social', icon: Globe},
  {id:'calc',     label:'Calculator',   icon: CalcIcon},
  {id:'currency', label:'Currency',     icon: ArrowLeftRight},
  {id:'units',    label:'Units',        icon: Ruler},
  {id:'notes',    label:'Notes',        icon: Notebook},
];

export default function ToolsPage() {
  const [active, setActive] = useState('web');
  return (
    <div style={{padding:24,height:'100%',overflow:'auto',background:C.bg}}>
      <h2 style={{color:C.tx,fontSize:19,fontWeight:800,marginBottom:6}}>Tools Hub</h2>
      <p style={{color:C.txm,fontSize:13,marginBottom:18}}>Productivity utilities for your workspace</p>
      <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
        {TOOLS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={()=>setActive(t.id)}
              style={{padding:'8px 16px',borderRadius:8,border:'none',cursor:'pointer',background:active===t.id?C.acc:C.alt,color:active===t.id?'#fff':C.txm,fontWeight:600,fontSize:12,display:'flex',alignItems:'center',gap:6,transition:'all .15s'}}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>
      {active==='web'      && <WebTools />}
      {active==='calc'     && <Calculator />}
      {active==='currency' && <CurrencyConverter />}
      {active==='units'    && <UnitConverter />}
      {active==='notes'    && <Notes />}
    </div>
  );
}



