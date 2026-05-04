// ChatPage.jsx — Nexus EMS Internal Messaging
// Uses existing /api/users endpoint + localStorage for message persistence
import { useState, useEffect, useRef, useCallback } from 'react';

const API = "https://nexus-backend-production-771f.up.railway.app/api";
const getToken = () => localStorage.getItem("ems_token") || "";
const apiFetch = (path, opts = {}) =>
  fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
  });

const C = {
  bg: "#0b0d14", panel: "#0f1117", card: "#13151f",
  border: "rgba(255,255,255,0.06)", accent: "#6366f1",
  accentG: "rgba(99,102,241,0.12)", green: "#22c55e",
  red: "#ef4444", t1: "#f1f5ff", t2: "#8892aa", t3: "#3d4d6a",
};

const COLORS = ["#6366f1","#22c55e","#f59e0b","#3b82f6","#a855f7","#06b6d4","#ef4444","#f97316"];
const colorFor = name => COLORS[(name?.charCodeAt(0)||0) % COLORS.length];
const formatTime = ts => {
  if (!ts) return "";
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  return d.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
};

const Avatar = ({ name, size=34 }) => {
  const init = (name||"?").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
  const color = colorFor(name);
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:color+"33",border:`2px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:700,color,flexShrink:0}}>
      {init}
    </div>
  );
};

const getConvId = (uid1, uid2) => [uid1,uid2].sort().join("_");
const getMsgs = id => { try { return JSON.parse(localStorage.getItem(`nx_chat_${id}`)||"[]"); } catch { return []; } };
const saveMsgs = (id, msgs) => localStorage.setItem(`nx_chat_${id}`, JSON.stringify(msgs.slice(-200)));

export default function ChatPage({ user }) {
  const [users, setUsers]       = useState([]);
  const [active, setActive]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText]         = useState("");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const endRef   = useRef(null);
  const inputRef = useRef(null);
  const myId   = user?.id || user?._id || "";
  const myName = user?.name || "Me";

  const scrollBottom = () => setTimeout(() => endRef.current?.scrollIntoView({behavior:"smooth"}), 50);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await apiFetch("/users");
        const d = await r.json();
        setUsers((d.users||d.data||[]).filter(u=>(u._id||u.id)!==myId));
      } catch {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    setMessages(getMsgs(getConvId(myId, active._id)));
    scrollBottom();
    inputRef.current?.focus();
  }, [active]);

  const send = useCallback(() => {
    if (!text.trim() || !active) return;
    const cid = getConvId(myId, active._id);
    const msg = { id: Date.now()+Math.random(), senderId:myId, senderName:myName, content:text.trim(), ts:new Date().toISOString() };
    const updated = [...getMsgs(cid), msg];
    saveMsgs(cid, updated);
    setMessages(updated);
    setText("");
    scrollBottom();
  }, [text, active, myId, myName]);

  const del = id => {
    if (!active) return;
    const cid = getConvId(myId, active._id);
    const updated = getMsgs(cid).filter(m=>m.id!==id);
    saveMsgs(cid, updated);
    setMessages(updated);
  };

  const lastMsg = u => { const m = getMsgs(getConvId(myId,u._id)); return m[m.length-1]||null; };
  const filtered = users.filter(u=>!search||u.name?.toLowerCase().includes(search.toLowerCase())||u.department?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden",background:C.bg}}>
      {/* Sidebar */}
      <div style={{width:280,minWidth:280,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.panel}}>
        <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:15,fontWeight:700,color:C.t1,marginBottom:10}}>Messages</h2>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..." style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 12px",color:C.t1,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}} />
        </div>
        <div style={{padding:"6px 14px",background:C.accentG,borderBottom:`1px solid ${C.border}`}}>
          <p style={{fontSize:10,color:C.accent,fontWeight:600}}>Messages saved locally on this device</p>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>
          {loading ? (
            <p style={{padding:24,textAlign:"center",color:C.t3,fontSize:13}}>Loading...</p>
          ) : filtered.map(u => {
            const last=lastMsg(u), isAct=active?._id===u._id;
            return (
              <div key={u._id} onClick={()=>setActive(u)}
                style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:isAct?C.accentG:"transparent",borderLeft:`3px solid ${isAct?C.accent:"transparent"}`,transition:"all .15s"}}
                onMouseEnter={e=>{if(!isAct)e.currentTarget.style.background="rgba(255,255,255,0.03)";}}
                onMouseLeave={e=>{if(!isAct)e.currentTarget.style.background="transparent";}}>
                <Avatar name={u.name} size={38} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{color:C.t1,fontWeight:600,fontSize:13}}>{u.name}</span>
                    {last&&<span style={{color:C.t3,fontSize:10}}>{formatTime(last.ts)}</span>}
                  </div>
                  <p style={{color:C.t3,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginTop:2}}>
                    {last?(last.senderId===myId?`You: ${last.content}`:last.content):(u.position||u.department||u.role||"Employee")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      {active ? (
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"12px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.panel,flexShrink:0}}>
            <Avatar name={active.name} size={38} />
            <div>
              <p style={{fontSize:14,fontWeight:700,color:C.t1}}>{active.name}</p>
              <p style={{fontSize:11,color:C.t3}}>{active.position||active.department||active.role||"Employee"}</p>
            </div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:8}}>
            {messages.length===0 ? (
              <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
                <Avatar name={active.name} size={56} />
                <p style={{color:C.t1,fontSize:14,fontWeight:600}}>{active.name}</p>
                <p style={{color:C.t3,fontSize:12}}>Send a message to start the conversation</p>
              </div>
            ) : messages.map(msg => {
              const isMine = msg.senderId===myId;
              return (
                <div key={msg.id} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",gap:8,alignItems:"flex-end"}}>
                  {!isMine&&<Avatar name={msg.senderName} size={26} />}
                  <div style={{maxWidth:"65%"}}>
                    {!isMine&&<p style={{color:C.t3,fontSize:10,marginBottom:3,paddingLeft:2}}>{msg.senderName}</p>}
                    <div style={{background:isMine?C.accent:"#1a1d2e",borderRadius:isMine?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"9px 13px"}}>
                      <p style={{color:isMine?"#fff":C.t1,fontSize:13,lineHeight:1.5,wordBreak:"break-word"}}>{msg.content}</p>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4,justifyContent:"flex-end"}}>
                        <span style={{color:isMine?"rgba(255,255,255,0.5)":C.t3,fontSize:10}}>{formatTime(msg.ts)}</span>
                        {isMine&&<span style={{color:"rgba(255,255,255,0.5)",fontSize:11}}>✓</span>}
                      </div>
                    </div>
                    {isMine&&(
                      <div style={{display:"flex",justifyContent:"flex-end",marginTop:2}}>
                        <button onClick={()=>del(msg.id)} style={{background:"none",border:"none",color:C.t3,cursor:"pointer",fontSize:10,padding:"1px 4px"}} onMouseEnter={e=>e.target.style.color=C.red} onMouseLeave={e=>e.target.style.color=C.t3}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,alignItems:"center",background:C.panel,flexShrink:0}}>
            <input ref={inputRef} value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder={`Message ${active.name}...`}
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",color:C.t1,fontSize:13,outline:"none",fontFamily:"inherit"}} />
            <button onClick={send} disabled={!text.trim()}
              style={{background:text.trim()?C.accent:"#1a1d2e",border:"none",borderRadius:10,padding:"10px 18px",color:text.trim()?"#fff":C.t3,cursor:text.trim()?"pointer":"not-allowed",fontWeight:700,fontSize:13,transition:"all .15s",flexShrink:0}}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
          <div style={{width:72,height:72,borderRadius:20,background:C.accentG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>💬</div>
          <p style={{color:C.t1,fontSize:16,fontWeight:700}}>Nexus Messages</p>
          <p style={{color:C.t2,fontSize:13,textAlign:"center",maxWidth:280}}>Select an employee from the left to start a conversation</p>
        </div>
      )}
    </div>
  );
}
