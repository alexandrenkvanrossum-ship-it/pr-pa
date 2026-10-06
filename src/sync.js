/* Synchronisation Supabase : le stockage local reste la copie de travail (hors ligne),
   chaque élément est un document (kind, id, data) dans la table docs, protégée par compte. */
var SUPA_URL = "https://fdiswyamvqvqwrsvzwgf.supabase.co";
var SUPA_KEY = "sb_publishable_SCyWlsrbFi_Ogn-gPENJow_c6gvZjeG";

var Sync = (function(){
  var sb=null, user=null, status="local", listeners=[], pushT=null, channel=null, busy=false;
  var SNAP="prepa.synced.v1";
  function emit(){ listeners.forEach(function(f){ try{ f(status,user); }catch(e){} }); }
  function setStatus(s){ status=s; emit(); }
  function snapGet(){ try{ return JSON.parse(localStorage.getItem(SNAP)||"{}"); }catch(e){ return {}; } }
  function snapSet(m){ try{ localStorage.setItem(SNAP,JSON.stringify(m)); }catch(e){} }

  /* état local -> documents */
  function toDocs(s){
    var m={};
    s.tasks.forEach(function(t){ m["task|"+t.id]=t; });
    s.notes.forEach(function(n){ m["note|"+n.id]=n; });
    m["state|goals"]=s.goals||{};
    m["state|ressentis"]=s.ressentis||{};
    m["state|slotDone"]=s.slotDone||{};
    m["state|meta"]={cshSkip:s.cshSkip||0,seeded:!!s.seeded};
    if(s.news) m["state|news"]=s.news;
    ["files","mathsEx","mathsCours","mathsDone","mathsCfg","quiz","quizOff","hgg"].forEach(function(k){ if(s[k]) m["state|"+k]=s[k]; });
    return m;
  }
  function applyDoc(s,kind,id,data,deleted){
    if(kind==="task"||kind==="note"){
      var arr=kind==="task"?s.tasks:s.notes, i=arr.findIndex(function(x){ return x.id===id; });
      if(deleted){ if(i>=0) arr.splice(i,1); return; }
      if(i>=0) arr[i]=data; else arr.push(data);
    } else if(kind==="state"){
      if(deleted) return;
      if(id==="meta"){ s.cshSkip=data.cshSkip||0; s.seeded=s.seeded||!!data.seeded; }
      else s[id]=data||{};
    }
  }

  function init(){
    if(!window.supabase || !window.supabase.createClient){ setStatus("local"); return; }
    try{ sb=window.supabase.createClient(SUPA_URL,SUPA_KEY,{auth:{persistSession:true,autoRefreshToken:true}}); }catch(e){ setStatus("local"); return; }
    sb.auth.getSession().then(function(r){ user=r.data&&r.data.session?r.data.session.user:null; if(user) start(); else setStatus("signedout"); });
    sb.auth.onAuthStateChange(function(ev,session){ var u=session?session.user:null; var changed=(u&&u.id)!==(user&&user.id); user=u; if(user&&changed) start(); if(!user){ stopRealtime(); setStatus("signedout"); } });
    window.addEventListener("online",function(){ if(user) pull().then(push); });
  }

  function start(){ setStatus("syncing"); pull(true).then(push).then(realtime).catch(function(){ setStatus("offline"); }); }

  function pull(first){
    if(!sb||!user) return Promise.resolve();
    return sb.from("docs").select("kind,id,data,deleted,updated_at").then(function(r){
      if(r.error) throw r.error;
      var s=Store.get(), snap=snapGet(), local=toDocs(s);
      if(first && r.data.length){ var keys={}; r.data.forEach(function(row){ keys[row.kind+"|"+row.id]=1; }); s.tasks=s.tasks.filter(function(t){ return !t.example || keys["task|"+t.id]; }); }
      r.data.forEach(function(row){
        var key=row.kind+"|"+row.id, localJson=JSON.stringify(local[key]), remoteJson=JSON.stringify(row.data);
        /* modifié localement depuis la dernière synchro et pas à distance : on garde le local */
        var localDirty=snap[key]!==undefined && snap[key]!==localJson;
        if(localDirty && snap[key]===remoteJson) return;
        applyDoc(s,row.kind,row.id,row.data,row.deleted);
        if(row.deleted) delete snap[key]; else snap[key]=remoteJson;
      });
      snapSet(snap); Store.save(true);
      if(window.__prepaRefresh) window.__prepaRefresh();
      setStatus(navigator.onLine===false?"offline":"synced");
    });
  }

  function push(){
    if(!sb||!user||busy) return Promise.resolve();
    var s=Store.get(), snap=snapGet(), docs=toDocs(s), rows=[], now=new Date().toISOString();
    Object.keys(docs).forEach(function(key){ var j=JSON.stringify(docs[key]); if(snap[key]!==j){ var p=key.split("|"); rows.push({kind:p[0],id:p[1],data:docs[key],deleted:false,updated_at:now}); } });
    Object.keys(snap).forEach(function(key){ if(!(key in docs)){ var p=key.split("|"); rows.push({kind:p[0],id:p[1],data:{},deleted:true,updated_at:now}); } });
    if(!rows.length){ setStatus("synced"); return Promise.resolve(); }
    busy=true; setStatus("syncing");
    return sb.from("docs").upsert(rows,{onConflict:"user_id,kind,id"}).then(function(r){
      busy=false;
      if(r.error){ setStatus("offline"); return; }
      var sn=snapGet();
      rows.forEach(function(row){ var key=row.kind+"|"+row.id; if(row.deleted) delete sn[key]; else sn[key]=JSON.stringify(row.data); });
      snapSet(sn); setStatus("synced");
    },function(){ busy=false; setStatus("offline"); });
  }

  function realtime(){
    if(!sb||!user||channel) return;
    channel=sb.channel("docs-"+user.id).on("postgres_changes",{event:"*",schema:"public",table:"docs",filter:"user_id=eq."+user.id},function(p){
      var row=p.new; if(!row||!row.kind) return;
      var s=Store.get(), key=row.kind+"|"+row.id, snap=snapGet(), j=JSON.stringify(row.data);
      if(snap[key]===j && !row.deleted) return;
      applyDoc(s,row.kind,row.id,row.data,row.deleted);
      if(row.deleted) delete snap[key]; else snap[key]=j;
      snapSet(snap); Store.save(true);
      if(window.__prepaRefresh) window.__prepaRefresh();
    }).subscribe();
  }
  function stopRealtime(){ if(channel&&sb){ try{ sb.removeChannel(channel); }catch(e){} } channel=null; }

  function schedule(){ if(!user) return; clearTimeout(pushT); pushT=setTimeout(push,700); }

  function signIn(email,pw){ return sb.auth.signInWithPassword({email:email,password:pw}); }
  function signUp(email,pw){ return sb.auth.signUp({email:email,password:pw,options:{emailRedirectTo:location.origin+location.pathname}}); }
  function signOut(){ stopRealtime(); return sb.auth.signOut(); }

  function invoke(body){
    if(!sb||!user||!sb.functions) return Promise.reject(new Error("signedout"));
    return sb.functions.invoke("gemini",{body:body}).then(function(r){
      if(r.error){ var m=r.error.message||"Erreur"; if(r.error.context&&r.error.context.json) return r.error.context.json().then(function(j){ throw new Error(j.error||m); }); throw new Error(m); }
      if(r.data&&r.data.error) throw new Error(r.data.error);
      return r.data;
    });
  }
  return {client:function(){ return sb; }, invoke:invoke, init:init, schedule:schedule, on:function(f){ listeners.push(f); f(status,user); }, status:function(){ return status; }, user:function(){ return user; }, available:function(){ return !!sb; }, signIn:signIn, signUp:signUp, signOut:signOut, syncNow:function(){ return pull().then(push); }};
})();
