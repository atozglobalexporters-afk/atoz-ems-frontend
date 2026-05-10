// ChatPage.jsx — Nexus Pro real-backend chat
// Bugs fixed: #19 file upload, #20 edit, #21 Edited label, #22 delete, #23 undo
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, MessageCircle, Send, Paperclip, Mic, MoreVertical, ArrowLeft,
  Edit2, Trash2, Reply, Smile, X, Check, Image as ImageIcon, FileText,
  StopCircle, Play, Download, Phone, Video,
} from 'lucide-react';

const API = "https://nexus-backend-production-771f.up.railway.app/api";
const HOST = API.replace(/\/api\/?$/, '');
const getToken = () => localStorage.getItem("ems_token") || "";
const apiFetch = (path, opts = {}) => fetch(`${API}${path}`, {
  ...opts,
  headers: { ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }), Authorization: `Bearer ${getToken()}`, ...(opts.headers || {}) },
});

const C = {
  bg:'#0b0d14', surf:'#13151f', alt:'#1a1d29', bdr:'rgba(255,255,255,0.06)',
  acc:'#6366f1', accS:'rgba(99,102,241,0.12)', gold:'#D4A24C',
  ok:'#22c55e', warn:'#f59e0b', err:'#ef4444',
  tx:'#f1f5ff', txm:'#8892aa', txs:'#3d4d6a',
  bubbleMe:'#6366f1', bubbleThem:'#1a1d29',
};

const fmtTime = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const fmtDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  const yest  = new Date(); yest.setDate(yest.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yest.toDateString())  return 'Yesterday';
  return date.toLocaleDateString();
};

const Initials = ({ name = '', size = 36, color = C.acc }) => {
  const i = (name||'?').split(' ').map(s=>s[0]).filter(Boolean).slice(0,2).join('').toUpperCase() || '?';
  return (
    <div style={{width:size,height:size,borderRadius:size/2,background:color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:size*0.35,flexShrink:0}}>
      {i}
    </div>
  );
};

const REACTIONS = ['👍','❤️','😂','😮','😢','🙏'];

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function ChatPage({ user: currentUser, addToast }) {
  const me = currentUser || JSON.parse(localStorage.getItem("ems_user") || '{}');
  const myId = me.id || me._id;

  const [convs, setConvs] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');
  const [pollTick, setPollTick] = useState(0);

  const activeConv = convs.find(c => c._id === activeConvId);

  // Polling fallback (3s) — replace with Socket.io in Tier 2
  useEffect(() => {
    const t = setInterval(() => setPollTick(x => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  // Load conversations + users
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          apiFetch('/chat/conversations'),
          apiFetch('/users'),
        ]);
        if (cancelled) return;
        if (r1.ok) {
          const d = await r1.json();
          setConvs(d.data || []);
        }
        if (r2.ok) {
          const d = await r2.json();
          setUsers((d.users || []).filter(u => (u._id || u.id) !== myId));
        }
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [myId, pollTick]);

  const startDirectChat = async (otherUserId) => {
    try {
      const r = await apiFetch('/chat/conversations', { method: 'POST', body: JSON.stringify({ memberId: otherUserId, type: 'direct' }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setActiveConvId(d.data._id);
      setShowNewChat(false);
      // Refresh list
      const r2 = await apiFetch('/chat/conversations');
      if (r2.ok) { const dd = await r2.json(); setConvs(dd.data || []); }
    } catch (e) { addToast?.('Could not start chat', 'error'); }
  };

  const filtered = convs.filter(c => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    if (c.type === 'group') return (c.name || '').toLowerCase().includes(s);
    const other = c.members.find(m => (m._id || m.id) !== myId);
    return (other?.name || '').toLowerCase().includes(s);
  });

  return (
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',height:'calc(100vh - 70px)',background:C.bg,overflow:'hidden'}}>
      {/* Sidebar */}
      <div style={{borderRight:`1px solid ${C.bdr}`,display:'flex',flexDirection:'column',background:C.surf}}>
        <div style={{padding:16,borderBottom:`1px solid ${C.bdr}`}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <h2 style={{color:C.tx,fontSize:18,fontWeight:800,margin:0}}>Messages</h2>
            <button onClick={()=>setShowNewChat(true)} title="New chat"
              style={{background:'rgba(99,102,241,0.15)',border:`1px solid ${C.acc}40`,borderRadius:8,padding:6,cursor:'pointer',color:C.acc,display:'flex'}}>
              <MessageCircle size={16}/>
            </button>
          </div>
          <div style={{position:'relative'}}>
            <Search size={13} color={C.txs} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats…"
              style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'8px 11px 8px 32px',color:C.tx,fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {filtered.length === 0 && (
            <div style={{padding:24,textAlign:'center',color:C.txs,fontSize:12}}>
              No conversations yet.<br/>Click the message icon to start.
            </div>
          )}
          {filtered.map(c => {
            const other = c.type === 'direct' ? c.members.find(m => (m._id || m.id) !== myId) : null;
            const name  = c.type === 'group' ? c.name : (other?.name || 'Unknown');
            const last  = c.lastMessage;
            return (
              <div key={c._id} onClick={()=>setActiveConvId(c._id)}
                style={{padding:'12px 14px',borderBottom:`1px solid ${C.bdr}`,cursor:'pointer',background:activeConvId===c._id?'rgba(99,102,241,0.06)':'transparent',display:'flex',alignItems:'center',gap:11}}>
                <Initials name={name} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:8}}>
                    <span style={{color:C.tx,fontSize:13,fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{name}</span>
                    <span style={{color:C.txs,fontSize:10,flexShrink:0}}>{c.lastActivity ? fmtTime(c.lastActivity) : ''}</span>
                  </div>
                  <div style={{color:C.txm,fontSize:11,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {last ? (last.type === 'text' ? last.content : (last.type === 'voice' ? '🎤 Voice message' : last.type === 'image' ? '🖼 Image' : '📎 File')) : 'No messages yet'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation */}
      <div style={{display:'flex',flexDirection:'column',background:C.bg}}>
        {activeConv ? (
          <Conversation conv={activeConv} myId={myId} onUpdate={() => setPollTick(x => x + 1)} addToast={addToast} pollTick={pollTick}/>
        ) : (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
            <MessageCircle size={48} color={C.txs}/>
            <div style={{color:C.txm,fontSize:14}}>Select a conversation or start a new one</div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal users={users} onClose={()=>setShowNewChat(false)} onSelect={startDirectChat}/>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CONVERSATION
// ════════════════════════════════════════════════════════════
function Conversation({ conv, myId, onUpdate, addToast, pollTick }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText]   = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showEmojiFor, setShowEmojiFor] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null); // { msg, deadline, timeout, forEveryone }
  const [recording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);

  const fileInputRef = useRef(null);
  const scrollRef    = useRef(null);
  const recorderRef  = useRef(null);
  const recTimerRef  = useRef(null);

  const otherUser = conv.type === 'direct' ? conv.members.find(m => (m._id || m.id) !== myId) : null;
  const headerName = conv.type === 'group' ? conv.name : (otherUser?.name || 'Unknown');

  // Load messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await apiFetch(`/chat/conversations/${conv._id}/messages?limit=100`);
        if (!r.ok) return;
        const d = await r.json();
        if (cancelled) return;
        setMessages(d.data || []);
        // Mark seen
        await apiFetch(`/chat/conversations/${conv._id}/seen`, { method: 'POST' });
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
  }, [conv._id, pollTick]);

  // Scroll on new messages
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  // ── SEND ───────────────────────────────────────────────────
  const sendMessage = async (overrides = {}) => {
    const body = {
      content: input.trim(),
      type: 'text',
      replyTo: replyTo?._id || null,
      ...overrides,
    };
    if (body.type === 'text' && !body.content) return;
    setInput('');
    setReplyTo(null);
    try {
      const r = await apiFetch(`/chat/conversations/${conv._id}/messages`, { method: 'POST', body: JSON.stringify(body) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setMessages(prev => [...prev, d.data]);
      onUpdate();
    } catch (e) { addToast?.('Send failed', 'error'); }
  };

  // ── EDIT ───────────────────────────────────────────────────
  const startEdit = (msg) => { setEditingId(msg._id); setEditText(msg.content || ''); };
  const cancelEdit = () => { setEditingId(null); setEditText(''); };
  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const r = await apiFetch(`/chat/messages/${editingId}`, { method: 'PUT', body: JSON.stringify({ content: editText }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setMessages(prev => prev.map(m => m._id === editingId ? d.data : m));
      cancelEdit();
    } catch { addToast?.('Edit failed', 'error'); }
  };

  // ── DELETE with 10s undo ───────────────────────────────────
  const requestDelete = (msg, forEveryone = false) => {
    // Mark optimistically as pending; do NOT call API yet
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeout);
    }
    const timeout = setTimeout(async () => {
      try {
        const r = await apiFetch(`/chat/messages/${msg._id}`, { method: 'DELETE', body: JSON.stringify({ forEveryone }) });
        if (!r.ok) throw new Error();
        if (forEveryone) {
          setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, deletedForAll: true, content: '' } : m));
        } else {
          setMessages(prev => prev.filter(m => m._id !== msg._id));
        }
      } catch { addToast?.('Delete failed', 'error'); }
      setPendingDelete(null);
    }, 10000);
    setPendingDelete({ msg, timeout, forEveryone });
  };
  const undoDelete = () => {
    if (!pendingDelete) return;
    clearTimeout(pendingDelete.timeout);
    setPendingDelete(null);
  };

  // ── REACT ──────────────────────────────────────────────────
  const reactTo = async (msgId, emoji) => {
    setShowEmojiFor(null);
    try {
      const r = await apiFetch(`/chat/messages/${msgId}/react`, { method: 'POST', body: JSON.stringify({ emoji }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setMessages(prev => prev.map(m => m._id === msgId ? d.data : m));
    } catch { addToast?.('React failed', 'error'); }
  };

  // ── FILE UPLOAD ────────────────────────────────────────────
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { addToast?.('Max 50MB', 'error'); return; }
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await fetch(`${API}/chat/upload`, { method: 'POST', body: fd, headers: { Authorization: `Bearer ${getToken()}` } });
      if (!r.ok) throw new Error();
      const d = await r.json();
      const type = file.type.startsWith('image/') ? 'image'
                 : file.type.startsWith('video/') ? 'video'
                 : 'file';
      await sendMessage({
        type,
        content: '',
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileSize: d.fileSize,
        mimeType: d.mimeType,
      });
    } catch { addToast?.('Upload failed', 'error'); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── VOICE NOTE ─────────────────────────────────────────────
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('file', blob, `voice-${Date.now()}.webm`);
        try {
          const r = await fetch(`${API}/chat/upload`, { method: 'POST', body: fd, headers: { Authorization: `Bearer ${getToken()}` } });
          if (!r.ok) throw new Error();
          const d = await r.json();
          await sendMessage({
            type: 'voice',
            content: '',
            fileUrl: d.fileUrl,
            fileName: d.fileName,
            fileSize: d.fileSize,
            mimeType: d.mimeType,
          });
        } catch { addToast?.('Voice send failed', 'error'); }
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setRecTime(0);
      recTimerRef.current = setInterval(() => setRecTime(t => t + 1), 1000);
    } catch { addToast?.('Microphone access denied', 'error'); }
  };
  const stopRec = () => {
    if (recorderRef.current) recorderRef.current.stop();
    if (recTimerRef.current) clearInterval(recTimerRef.current);
    setRecording(false);
    setRecTime(0);
  };

  // Group by date
  const grouped = messages.reduce((acc, m) => {
    const key = fmtDate(m.createdAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <>
      {/* Header */}
      <div style={{padding:'14px 18px',borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',gap:12,background:C.surf}}>
        <Initials name={headerName} size={38}/>
        <div style={{flex:1}}>
          <div style={{color:C.tx,fontSize:14,fontWeight:700}}>{headerName}</div>
          {conv.type === 'direct' && otherUser?.lastSeen && (
            <div style={{color:C.txm,fontSize:11}}>Last seen {fmtDate(otherUser.lastSeen)} {fmtTime(otherUser.lastSeen)}</div>
          )}
          {conv.type === 'group' && <div style={{color:C.txm,fontSize:11}}>{conv.members?.length || 0} members</div>}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{flex:1,overflowY:'auto',padding:'18px 24px',background:C.bg}}>
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date}>
            <div style={{textAlign:'center',margin:'12px 0'}}>
              <span style={{background:C.surf,padding:'4px 12px',borderRadius:12,color:C.txm,fontSize:11,fontWeight:600,border:`1px solid ${C.bdr}`}}>{date}</span>
            </div>
            {msgs.map(msg => {
              const isMe = (msg.sender?._id || msg.sender) === myId;
              const isPending = pendingDelete && pendingDelete.msg._id === msg._id;
              if (isPending) {
                // Hide the pending-delete message during the 10s grace window
                return (
                  <div key={msg._id} style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start',marginBottom:8}}>
                    <div style={{padding:'7px 12px',background:'transparent',color:C.txs,fontSize:12,fontStyle:'italic',border:`1px dashed ${C.bdr}`,borderRadius:10}}>
                      Message deleted (undo available)
                    </div>
                  </div>
                );
              }

              if (msg.deletedForAll) {
                return (
                  <div key={msg._id} style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start',marginBottom:8}}>
                    <div style={{padding:'7px 12px',background:C.surf,color:C.txs,fontSize:12,fontStyle:'italic',borderRadius:10,border:`1px solid ${C.bdr}`}}>
                      🚫 This message was deleted
                    </div>
                  </div>
                );
              }

              return (
                <MessageRow
                  key={msg._id}
                  msg={msg}
                  isMe={isMe}
                  showName={conv.type === 'group' && !isMe}
                  onEdit={()=>startEdit(msg)}
                  onDelete={()=>requestDelete(msg, true)}
                  onDeleteMe={()=>requestDelete(msg, false)}
                  onReply={()=>setReplyTo(msg)}
                  onReact={(emoji)=>reactTo(msg._id, emoji)}
                  showEmoji={showEmojiFor === msg._id}
                  setShowEmoji={(v)=>setShowEmojiFor(v ? msg._id : null)}
                  isEditing={editingId === msg._id}
                  editText={editText}
                  setEditText={setEditText}
                  onSaveEdit={saveEdit}
                  onCancelEdit={cancelEdit}
                  myId={myId}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Reply preview */}
      {replyTo && (
        <div style={{padding:'8px 18px',background:C.surf,borderTop:`1px solid ${C.bdr}`,borderLeft:`3px solid ${C.acc}`,display:'flex',alignItems:'center',gap:10}}>
          <Reply size={14} color={C.acc}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:C.acc,fontSize:11,fontWeight:600}}>Replying to {replyTo.sender?.name || 'message'}</div>
            <div style={{color:C.txm,fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{replyTo.content || `[${replyTo.type}]`}</div>
          </div>
          <button onClick={()=>setReplyTo(null)} style={{background:'transparent',border:'none',cursor:'pointer',color:C.txm,padding:4,display:'flex'}}><X size={14}/></button>
        </div>
      )}

      {/* Composer */}
      <div style={{padding:'12px 18px',borderTop:`1px solid ${C.bdr}`,background:C.surf,display:'flex',alignItems:'center',gap:10}}>
        {recording ? (
          <>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:10,padding:'8px 14px',background:'rgba(239,68,68,0.1)',border:`1px solid ${C.err}40`,borderRadius:22}}>
              <span style={{width:9,height:9,borderRadius:5,background:C.err,animation:'pulse 1.2s infinite'}}/>
              <span style={{color:C.tx,fontSize:13,fontWeight:600}}>Recording {String(Math.floor(recTime/60)).padStart(2,'0')}:{String(recTime%60).padStart(2,'0')}</span>
            </div>
            <button onClick={stopRec} style={{background:C.err,border:'none',borderRadius:'50%',width:40,height:40,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <StopCircle size={18}/>
            </button>
          </>
        ) : (
          <>
            <input ref={fileInputRef} type="file" onChange={onFile} style={{display:'none'}}/>
            <button onClick={()=>fileInputRef.current?.click()} title="Attach file"
              style={{background:'transparent',border:'none',cursor:'pointer',color:C.txm,padding:6,display:'flex'}}>
              <Paperclip size={18}/>
            </button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
              placeholder="Type a message…"
              style={{flex:1,background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:22,padding:'9px 16px',color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
            {input.trim() ? (
              <button onClick={()=>sendMessage()}
                style={{background:C.acc,border:'none',borderRadius:'50%',width:40,height:40,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Send size={16}/>
              </button>
            ) : (
              <button onClick={startRec} title="Record voice note"
                style={{background:C.acc,border:'none',borderRadius:'50%',width:40,height:40,cursor:'pointer',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Mic size={16}/>
              </button>
            )}
          </>
        )}
      </div>

      {/* Undo toast */}
      {pendingDelete && (
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:C.surf,border:`2px solid ${C.gold}`,borderRadius:12,padding:'12px 20px',boxShadow:`0 12px 40px rgba(212,162,76,0.3)`,display:'flex',alignItems:'center',gap:14,zIndex:1000}}>
          <span style={{color:C.tx,fontSize:13,fontWeight:600}}>Message deleted</span>
          <button onClick={undoDelete}
            style={{background:C.gold,border:'none',borderRadius:8,padding:'6px 16px',cursor:'pointer',color:'#0b0d14',fontSize:12,fontWeight:700}}>
            UNDO
          </button>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// MESSAGE ROW
// ════════════════════════════════════════════════════════════
function MessageRow({ msg, isMe, showName, onEdit, onDelete, onDeleteMe, onReply, onReact, showEmoji, setShowEmoji, isEditing, editText, setEditText, onSaveEdit, onCancelEdit, myId }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showMenu]);

  // Aggregate reactions
  const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, mine: false };
    acc[r.emoji].count++;
    if (r.user === myId || r.user?._id === myId) acc[r.emoji].mine = true;
    return acc;
  }, {});

  return (
    <div style={{display:'flex',justifyContent:isMe?'flex-end':'flex-start',marginBottom:10,position:'relative'}}>
      <div style={{maxWidth:'72%',display:'flex',flexDirection:'column',alignItems:isMe?'flex-end':'flex-start'}}>
        {showName && <div style={{color:C.acc,fontSize:11,fontWeight:600,marginBottom:3,paddingLeft:12}}>{msg.sender?.name}</div>}

        {msg.replyTo && (
          <div style={{padding:'6px 12px',background:C.surf,borderLeft:`3px solid ${C.acc}`,borderRadius:8,marginBottom:4,maxWidth:'100%'}}>
            <div style={{color:C.acc,fontSize:10,fontWeight:600}}>{msg.replyTo.sender?.name || 'Replied'}</div>
            <div style={{color:C.txm,fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{msg.replyTo.content || `[${msg.replyTo.type}]`}</div>
          </div>
        )}

        <div style={{position:'relative',display:'flex',alignItems:'flex-end',gap:6,flexDirection:isMe?'row':'row-reverse'}}>
          {/* Action button */}
          {!isEditing && (
            <button onClick={()=>setShowMenu(!showMenu)}
              style={{background:'transparent',border:'none',cursor:'pointer',color:C.txm,padding:4,display:'flex',opacity:0.5}}
              onMouseEnter={e=>e.currentTarget.style.opacity='1'}
              onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}>
              <MoreVertical size={14}/>
            </button>
          )}

          <div style={{padding:msg.type==='image'||msg.type==='video'?4:'9px 13px',background:isMe?C.bubbleMe:C.bubbleThem,color:'#fff',borderRadius:12,wordBreak:'break-word',position:'relative'}}>
            {isEditing ? (
              <div style={{display:'flex',flexDirection:'column',gap:6,minWidth:200}}>
                <input value={editText} onChange={e=>setEditText(e.target.value)} autoFocus
                  onKeyDown={e=>{if(e.key==='Enter')onSaveEdit(); if(e.key==='Escape')onCancelEdit();}}
                  style={{background:'rgba(0,0,0,0.3)',border:`1px solid rgba(255,255,255,0.2)`,borderRadius:6,padding:'5px 9px',color:'#fff',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                  <button onClick={onCancelEdit} style={{background:'rgba(0,0,0,0.3)',border:'none',borderRadius:5,padding:'3px 9px',cursor:'pointer',color:'#fff',fontSize:11}}>Cancel</button>
                  <button onClick={onSaveEdit} style={{background:C.gold,border:'none',borderRadius:5,padding:'3px 9px',cursor:'pointer',color:'#0b0d14',fontSize:11,fontWeight:700}}>Save</button>
                </div>
              </div>
            ) : (
              <>
                {msg.type === 'text'  && <div style={{fontSize:13,lineHeight:1.45,whiteSpace:'pre-wrap'}}>{msg.content}</div>}
                {msg.type === 'image' && (
                  <img src={`${HOST}${msg.fileUrl}`} alt="" style={{maxWidth:280,maxHeight:280,borderRadius:8,display:'block'}}/>
                )}
                {msg.type === 'video' && (
                  <video src={`${HOST}${msg.fileUrl}`} controls style={{maxWidth:280,borderRadius:8}}/>
                )}
                {msg.type === 'voice' && (
                  <audio src={`${HOST}${msg.fileUrl}`} controls style={{height:36}}/>
                )}
                {msg.type === 'file' && (
                  <a href={`${HOST}${msg.fileUrl}`} target="_blank" rel="noreferrer" download
                    style={{display:'flex',alignItems:'center',gap:8,color:'#fff',textDecoration:'none'}}>
                    <FileText size={20}/>
                    <div>
                      <div style={{fontSize:12,fontWeight:600}}>{msg.fileName}</div>
                      <div style={{fontSize:10,opacity:0.8}}>{Math.round((msg.fileSize||0)/1024)} KB</div>
                    </div>
                    <Download size={14} style={{marginLeft:8}}/>
                  </a>
                )}

                <div style={{display:'flex',alignItems:'center',gap:5,marginTop:3,fontSize:9,opacity:0.7,justifyContent:'flex-end'}}>
                  {msg.edited && <span>Edited</span>}
                  <span>{fmtTime(msg.createdAt)}</span>
                  {isMe && msg.seenBy?.length > 0 && <Check size={11} style={{marginLeft:2}}/>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reactions row */}
        {Object.keys(reactionGroups).length > 0 && (
          <div style={{display:'flex',gap:4,marginTop:3,paddingLeft:isMe?0:12,paddingRight:isMe?12:0}}>
            {Object.entries(reactionGroups).map(([emoji, info]) => (
              <button key={emoji} onClick={()=>onReact(emoji)}
                style={{background:info.mine?C.accS:C.surf,border:`1px solid ${info.mine?C.acc:C.bdr}`,borderRadius:11,padding:'2px 7px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:3,color:C.tx}}>
                {emoji} {info.count > 1 && info.count}
              </button>
            ))}
          </div>
        )}

        {/* Action menu */}
        {showMenu && !isEditing && (
          <div ref={menuRef} style={{position:'absolute',top:'100%',[isMe?'right':'left']:0,marginTop:4,background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:8,padding:6,zIndex:10,minWidth:140,boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
            <button onClick={()=>{setShowMenu(false);onReply();}} style={menuBtnStyle()}>
              <Reply size={13}/> Reply
            </button>
            <button onClick={()=>{setShowMenu(false);setShowEmoji(true);}} style={menuBtnStyle()}>
              <Smile size={13}/> React
            </button>
            {isMe && msg.type === 'text' && (
              <button onClick={()=>{setShowMenu(false);onEdit();}} style={menuBtnStyle()}>
                <Edit2 size={13}/> Edit
              </button>
            )}
            {isMe && (
              <button onClick={()=>{setShowMenu(false);onDelete();}} style={menuBtnStyle('danger')}>
                <Trash2 size={13}/> Delete for everyone
              </button>
            )}
            <button onClick={()=>{setShowMenu(false);onDeleteMe();}} style={menuBtnStyle('danger')}>
              <Trash2 size={13}/> Delete for me
            </button>
          </div>
        )}

        {/* Emoji picker */}
        {showEmoji && (
          <div style={{position:'absolute',bottom:'100%',[isMe?'right':'left']:30,marginBottom:4,background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:18,padding:6,display:'flex',gap:3,zIndex:11,boxShadow:'0 8px 24px rgba(0,0,0,0.5)'}}>
            {REACTIONS.map(e => (
              <button key={e} onClick={()=>onReact(e)}
                style={{background:'transparent',border:'none',cursor:'pointer',padding:'4px 7px',fontSize:18,borderRadius:8}}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const menuBtnStyle = (variant) => ({
  display:'flex',alignItems:'center',gap:8,width:'100%',padding:'7px 11px',
  background:'transparent',border:'none',cursor:'pointer',color: variant==='danger' ? '#ef4444' : '#f1f5ff',
  fontSize:12,textAlign:'left',borderRadius:5,fontFamily:'inherit'
});

// ════════════════════════════════════════════════════════════
// NEW CHAT MODAL
// ════════════════════════════════════════════════════════════
function NewChatModal({ users, onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => (u.name || '').toLowerCase().includes(search.toLowerCase()));
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1100}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surf,border:`1px solid ${C.bdr}`,borderRadius:14,width:420,maxHeight:'70vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:18,borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h3 style={{color:C.tx,fontSize:15,fontWeight:700,margin:0}}>New conversation</h3>
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:C.txm,padding:4,display:'flex'}}><X size={18}/></button>
        </div>
        <div style={{padding:14,borderBottom:`1px solid ${C.bdr}`}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search people…" autoFocus
            style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'9px 11px',color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {filtered.map(u => (
            <div key={u._id || u.id} onClick={()=>onSelect(u._id || u.id)}
              style={{padding:'12px 14px',display:'flex',alignItems:'center',gap:11,cursor:'pointer',borderBottom:`1px solid ${C.bdr}`}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.05)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <Initials name={u.name} size={36}/>
              <div style={{flex:1}}>
                <div style={{color:C.tx,fontSize:13,fontWeight:600}}>{u.name}</div>
                <div style={{color:C.txm,fontSize:11}}>{u.jobTitle || u.department || u.email}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{padding:24,textAlign:'center',color:C.txs,fontSize:12}}>No people found</div>
          )}
        </div>
      </div>
    </div>
  );
}
