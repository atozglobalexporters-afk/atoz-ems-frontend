// ChatPage.jsx — Full Instagram-style Chat
import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const C = {
  bg:'#0f172a', surf:'#1e293b', alt:'#334155', bdr:'#334155',
  acc:'#6366f1', accH:'#4f46e5', accS:'rgba(99,102,241,.12)',
  ok:'#10b981', err:'#ef4444', warn:'#f59e0b',
  tx:'#f1f5f9', txm:'#64748b', txs:'#94a3b8',
};

const apiReq = async (method, path, body) => {
  const token = localStorage.getItem('ems_token');
  const r = await fetch(`${API}/api/chat${path}`, {
    method,
    headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) },
    ...(body!==undefined?{body:JSON.stringify(body)}:{})
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || `Error ${r.status}`);
  return d;
};

const Avatar = ({name,size=34,color=C.acc,online=false}) => {
  const init=(name||'?').split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
  return (
    <div style={{position:'relative',flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:'50%',background:color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.36,fontWeight:700,color:'#fff'}}>{init}</div>
      {online&&<div style={{position:'absolute',bottom:0,right:0,width:size*.28,height:size*.28,borderRadius:'50%',background:C.ok,border:`2px solid ${C.surf}`}} />}
    </div>
  );
};

export default function ChatPage({ user, socket, onlineUsers }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState('');
  const [typing, setTyping]               = useState({});
  const [users, setUsers]                 = useState([]);
  const [showNewChat, setShowNewChat]     = useState(false);
  const [search, setSearch]               = useState('');
  const [editMsg, setEditMsg]             = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const typingTimer    = useRef(null);
  const prevConvRef    = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });

  const loadConversations = useCallback(async () => {
    try { const r = await apiReq('GET','/conversations'); setConversations(r.data||[]); } catch {}
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('ems_token');
      const r = await fetch(`${API}/api/users`, { headers: { Authorization:`Bearer ${token}` } });
      const d = await r.json();
      setUsers((d.data||[]).filter(u => u._id !== user.id));
    } catch {}
  }, [user.id]);

  useEffect(() => { loadConversations(); loadUsers(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('message:new', msg => {
      if (activeConv && msg.conversation === activeConv._id) {
        setMessages(p => [...p, msg]);
        setTimeout(scrollToBottom, 100);
      }
      loadConversations();
    });
    socket.on('message:edited', msg => {
      setMessages(p => p.map(m => m._id === msg._id ? msg : m));
    });
    socket.on('message:deleted', ({ msgId, forEveryone }) => {
      if (forEveryone) setMessages(p => p.map(m => m._id === msgId ? { ...m, deletedForAll: true, content: '' } : m));
      else setMessages(p => p.filter(m => m._id !== msgId));
    });
    socket.on('typing:start', ({ userId, userName, conversationId }) => {
      if (activeConv && conversationId === activeConv._id && userId !== user.id) {
        setTyping(p => ({ ...p, [userId]: userName }));
      }
    });
    socket.on('typing:stop', ({ userId }) => {
      setTyping(p => { const n={...p}; delete n[userId]; return n; });
    });
    return () => {
      socket.off('message:new'); socket.off('message:edited');
      socket.off('message:deleted'); socket.off('typing:start'); socket.off('typing:stop');
    };
  }, [socket, activeConv, user.id]);

  const openConversation = async (conv) => {
    if (prevConvRef.current && socket) socket.emit('leave:conversation', prevConvRef.current);
    setActiveConv(conv);
    prevConvRef.current = conv._id;
    if (socket) socket.emit('join:conversation', conv._id);
    try {
      const r = await apiReq('GET', `/conversations/${conv._id}/messages`);
      setMessages(r.data||[]);
      setTimeout(scrollToBottom, 100);
      await apiReq('POST', `/conversations/${conv._id}/seen`);
    } catch {}
  };

  const startChat = async (userId) => {
    try {
      const r = await apiReq('POST', '/conversations', { memberId: userId, type: 'direct' });
      setShowNewChat(false);
      await loadConversations();
      openConversation(r.data);
    } catch {}
  };

  const handleSend = async () => {
    if (!text.trim() && !editMsg) return;
    if (!activeConv) return;
    try {
      if (editMsg) {
        await apiReq('PUT', `/messages/${editMsg._id}`, { content: text });
        setEditMsg(null);
      } else {
        await apiReq('POST', `/conversations/${activeConv._id}/messages`, { content: text, type: 'text' });
      }
      setText('');
      if (socket) socket.emit('typing:stop', { conversationId: activeConv._id });
    } catch {}
  };

  const handleTyping = (val) => {
    setText(val);
    if (!socket || !activeConv) return;
    socket.emit('typing:start', { conversationId: activeConv._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing:stop', { conversationId: activeConv._id }), 1500);
  };

  const handleFileUpload = async (file) => {
    if (!file || !activeConv) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true); setUploadProgress(0);
    try {
      const token = localStorage.getItem('ems_token');
      const r = await fetch(`${API}/api/chat/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const d = await r.json();
      if (d.success) {
        const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
        await apiReq('POST', `/conversations/${activeConv._id}/messages`, {
          content: file.name, type, fileUrl: d.fileUrl, fileName: d.fileName, fileSize: d.fileSize
        });
      }
    } catch {} finally { setUploading(false); setUploadProgress(0); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const getOtherMember = (conv) => conv.members?.find(m => (m._id || m) !== user.id);
  const isOnline = (userId) => onlineUsers?.some(u => u.userId === userId);
  const convName = (conv) => {
    if (conv.type === 'group') return conv.name || 'Group';
    const other = getOtherMember(conv);
    return other?.name || 'Unknown';
  };

  const filteredConvs = conversations.filter(c => convName(c).toLowerCase().includes(search.toLowerCase()));
  const typingNames = Object.values(typing);

  const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#14b8a6','#f97316'];
  const colorFor = (name) => colors[(name||'').charCodeAt(0) % colors.length];

  const formatTime = (d) => new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  const formatSize = (bytes) => bytes < 1024 ? bytes+'B' : bytes < 1048576 ? (bytes/1024).toFixed(1)+'KB' : (bytes/1048576).toFixed(1)+'MB';

  return (
    <div style={{display:'flex',height:'100%',background:C.bg,overflow:'hidden'}}>
      {/* Left: Conversation List */}
      <div style={{width:300,borderRight:`1px solid ${C.bdr}`,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'14px 16px',borderBottom:`1px solid ${C.bdr}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <h2 style={{color:C.tx,fontSize:15,fontWeight:700,margin:0}}>💬 Messages</h2>
            <button onClick={()=>setShowNewChat(!showNewChat)} style={{background:C.acc,border:'none',borderRadius:8,padding:'5px 11px',color:'#fff',fontSize:11,fontWeight:600,cursor:'pointer'}}>+ New</button>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search conversations..."
            style={{width:'100%',background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'7px 11px',color:C.tx,fontSize:12,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}} />
        </div>

        {/* New Chat Panel */}
        {showNewChat && (
          <div style={{padding:'10px 14px',borderBottom:`1px solid ${C.bdr}`,background:C.alt}}>
            <div style={{color:C.txs,fontSize:11,fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Start conversation with:</div>
            {users.map(u => (
              <div key={u._id} onClick={()=>startChat(u._id)} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 8px',borderRadius:8,cursor:'pointer',marginBottom:3}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bdr} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <Avatar name={u.name} size={28} color={colorFor(u.name)} online={isOnline(u._id)} />
                <div><div style={{color:C.tx,fontSize:12,fontWeight:600}}>{u.name}</div><div style={{color:C.txs,fontSize:10}}>{u.jobTitle||u.role}</div></div>
              </div>
            ))}
          </div>
        )}

        {/* Conversation List */}
        <div style={{flex:1,overflowY:'auto'}}>
          {filteredConvs.length === 0 ? (
            <div style={{padding:24,textAlign:'center',color:C.txm,fontSize:12}}>No conversations yet.<br/>Click "+ New" to start chatting.</div>
          ) : filteredConvs.map(conv => {
            const name = convName(conv);
            const other = getOtherMember(conv);
            const online = conv.type === 'direct' && isOnline(other?._id);
            const active = activeConv?._id === conv._id;
            return (
              <div key={conv._id} onClick={()=>openConversation(conv)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',cursor:'pointer',background:active?C.accS:'transparent',borderLeft:active?`3px solid ${C.acc}`:'3px solid transparent'}}
                onMouseEnter={e=>{if(!active)e.currentTarget.style.background=C.alt;}} onMouseLeave={e=>{if(!active)e.currentTarget.style.background='transparent';}}>
                <Avatar name={name} size={38} color={colorFor(name)} online={online} />
                <div style={{flex:1,overflow:'hidden'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:C.tx,fontWeight:600,fontSize:12}}>{name}</span>
                    {conv.lastActivity&&<span style={{color:C.txm,fontSize:9}}>{formatTime(conv.lastActivity)}</span>}
                  </div>
                  <div style={{color:C.txs,fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {conv.lastMessage?.deletedForAll ? '🚫 Message deleted' : conv.lastMessage?.content || 'No messages yet'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Active Chat */}
      {activeConv ? (
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}
          onDragOver={e=>e.preventDefault()} onDrop={handleDrop}>
          {/* Chat Header */}
          <div style={{padding:'12px 18px',borderBottom:`1px solid ${C.bdr}`,display:'flex',alignItems:'center',gap:10,background:C.surf}}>
            {(() => { const name = convName(activeConv); const other = getOtherMember(activeConv); const online = activeConv.type==='direct'&&isOnline(other?._id);
              return <>
                <Avatar name={name} size={36} color={colorFor(name)} online={online} />
                <div>
                  <div style={{color:C.tx,fontWeight:700,fontSize:13}}>{name}</div>
                  <div style={{color:online?C.ok:C.txm,fontSize:11}}>{online?'Online':'Offline'}</div>
                </div>
              </>;
            })()}
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'16px 18px',display:'flex',flexDirection:'column',gap:6}}>
            {messages.map(msg => {
              const isMine = (msg.sender?._id || msg.sender) === user.id;
              if (msg.deletedForAll) return (
                <div key={msg._id} style={{textAlign:'center',color:C.txm,fontSize:11,fontStyle:'italic',padding:'2px 0'}}>🚫 Message deleted</div>
              );
              return (
                <div key={msg._id} style={{display:'flex',justifyContent:isMine?'flex-end':'flex-start',gap:7,alignItems:'flex-end'}}>
                  {!isMine&&<Avatar name={msg.sender?.name||'?'} size={24} color={colorFor(msg.sender?.name)} />}
                  <div style={{maxWidth:'68%'}}>
                    {!isMine&&<div style={{color:C.txs,fontSize:10,marginBottom:2,paddingLeft:2}}>{msg.sender?.name}</div>}
                    <div style={{background:isMine?C.acc:C.alt,borderRadius:isMine?'14px 14px 4px 14px':'14px 14px 14px 4px',padding:'8px 12px',position:'relative',group:'message'}}>
                      {msg.type==='image'&&msg.fileUrl&&(
                        <img src={`${API}${msg.fileUrl}`} alt={msg.fileName} style={{maxWidth:200,maxHeight:200,borderRadius:8,display:'block',marginBottom:msg.content?4:0}} />
                      )}
                      {msg.type==='video'&&msg.fileUrl&&(
                        <video src={`${API}${msg.fileUrl}`} controls style={{maxWidth:200,borderRadius:8,display:'block',marginBottom:msg.content?4:0}} />
                      )}
                      {msg.type==='file'&&msg.fileUrl&&(
                        <a href={`${API}${msg.fileUrl}`} download={msg.fileName} style={{display:'flex',alignItems:'center',gap:7,color:isMine?'rgba(255,255,255,.9)':C.acc,textDecoration:'none',fontSize:12}}>
                          📄 <span>{msg.fileName}</span> {msg.fileSize&&<span style={{color:isMine?'rgba(255,255,255,.6)':C.txs,fontSize:10}}>({formatSize(msg.fileSize)})</span>}
                        </a>
                      )}
                      {msg.content&&<div style={{color:isMine?'#fff':C.tx,fontSize:13,lineHeight:1.5}}>{msg.content}</div>}
                      <div style={{display:'flex',alignItems:'center',gap:4,marginTop:2,justifyContent:'flex-end'}}>
                        {msg.edited&&<span style={{color:isMine?'rgba(255,255,255,.5)':C.txm,fontSize:9}}>edited</span>}
                        <span style={{color:isMine?'rgba(255,255,255,.5)':C.txm,fontSize:9}}>{formatTime(msg.createdAt)}</span>
                        {isMine&&<span style={{color:msg.seenBy?.length>0?C.acc:'rgba(255,255,255,.5)',fontSize:10}}>{msg.seenBy?.length>0?'✓✓':'✓'}</span>}
                      </div>
                    </div>
                    {isMine&&(
                      <div style={{display:'flex',gap:4,justifyContent:'flex-end',marginTop:2}}>
                        <button onClick={()=>{setEditMsg(msg);setText(msg.content);}} style={{background:'none',border:'none',color:C.txm,cursor:'pointer',fontSize:9,padding:'1px 4px'}}>Edit</button>
                        <button onClick={async()=>{if(window.confirm('Delete for everyone?'))await apiReq('DELETE',`/messages/${msg._id}`,{forEveryone:true});}} style={{background:'none',border:'none',color:C.err,cursor:'pointer',fontSize:9,padding:'1px 4px'}}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {typingNames.length > 0 && (
              <div style={{color:C.txs,fontSize:11,fontStyle:'italic',padding:'2px 0'}}>{typingNames.join(', ')} {typingNames.length===1?'is':'are'} typing…</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {editMsg&&<div style={{background:C.warnS||'rgba(245,158,11,.1)',padding:'6px 18px',fontSize:11,color:C.warn,display:'flex',justifyContent:'space-between'}}>
            <span>✏️ Editing message</span>
            <button onClick={()=>{setEditMsg(null);setText('');}} style={{background:'none',border:'none',color:C.err,cursor:'pointer',fontSize:11}}>✕ Cancel</button>
          </div>}
          {uploading&&<div style={{background:C.accS,padding:'6px 18px',fontSize:11,color:C.acc}}>📤 Uploading file…</div>}
          <div style={{padding:'10px 14px',borderTop:`1px solid ${C.bdr}`,display:'flex',gap:8,alignItems:'center',background:C.surf}}>
            <button onClick={()=>fileInputRef.current?.click()} style={{background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:8,padding:'7px 10px',color:C.txs,cursor:'pointer',fontSize:16}} title="Attach file">📎</button>
            <input ref={fileInputRef} type="file" style={{display:'none'}} onChange={e=>handleFileUpload(e.target.files[0])} />
            <input value={text} onChange={e=>handleTyping(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}}}
              placeholder="Type a message… (Enter to send)"
              style={{flex:1,background:C.alt,border:`1px solid ${C.bdr}`,borderRadius:10,padding:'9px 13px',color:C.tx,fontSize:13,outline:'none',fontFamily:'inherit'}} />
            <button onClick={handleSend} disabled={!text.trim()}
              style={{background:text.trim()?C.acc:C.bdr,border:'none',borderRadius:8,padding:'9px 14px',color:'#fff',cursor:text.trim()?'pointer':'not-allowed',fontWeight:700,fontSize:13,transition:'background .15s'}}>
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
          <div style={{fontSize:48}}>💬</div>
          <div style={{color:C.txm,fontSize:14}}>Select a conversation to start chatting</div>
          <button onClick={()=>setShowNewChat(true)} style={{background:C.acc,border:'none',borderRadius:8,padding:'9px 20px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:13}}>Start New Chat</button>
        </div>
      )}
    </div>
  );
}
