/* Fichiers déposés (stockage Supabase privé « fichiers ») et analyse par Gemini :
   - TD, dossiers d'exercices, DM (+ corrigé) → liste des exercices avec temps estimé ;
   - cours → définitions, propriétés, théorèmes… recopiés tels quels, pour les quiz. */
var Files = (function(){
  var BUCKET="fichiers", running={};
  function sb(){ return (typeof Sync!=="undefined" && Sync.client && Sync.user())? Sync.client() : null; }
  function S(){ var s=Store.get(); s.files=s.files||{}; s.mathsEx=s.mathsEx||{}; s.mathsCours=s.mathsCours||{}; return s; }
  function clean(n){ return String(n).normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9._-]+/g,"_").slice(-80); }
  function mimeOf(f){ if(f.type) return f.type; var e=(f.name.split(".").pop()||"").toLowerCase(); return {pdf:"application/pdf",docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",heic:"image/heic",txt:"text/plain"}[e]||"application/octet-stream"; }
  function upload(file, meta){
    var c=sb(); if(!c) return Promise.reject(new Error("Connecte-toi d'abord (Plus → Compte)."));
    var id=uid("f"), path=Sync.user().id+"/"+(meta.sub||"autre")+"/"+id+"-"+clean(file.name);
    return c.storage.from(BUCKET).upload(path,file,{contentType:mimeOf(file),upsert:false}).then(function(r){
      if(r.error) throw new Error(/bucket/i.test(r.error.message||"")?"Espace « fichiers » absent : lance le script fichiers.sql dans Supabase.":r.error.message);
      var f={id:id, sub:meta.sub, kind:meta.kind, chap:meta.chap||"", name:file.name, label:meta.label||"", path:path, mime:mimeOf(file), size:file.size, at:new Date().toISOString(), pair:meta.pair||null, target:meta.target||null, due:meta.due||null, status:"stored"};
      S().files[id]=f; Store.save(); return f;
    });
  }
  function analysable(f){ return f && f.sub==="maths" && ["cours","td","exos","dm"].indexOf(f.kind)>=0; }
  function analyze(id, onStep){
    var s=S(), f=s.files[id]; if(!f) return Promise.reject(new Error("Fichier introuvable."));
    if(f.kind==="corrige"){ return f.pair? analyze(f.pair,onStep) : Promise.resolve(); }
    if(!analysable(f)) return Promise.resolve();
    if(running[id]) return running[id];
    f.status="analyse"; f.err=""; Store.save(); emit();
    var p;
    if(f.kind==="cours"){
      var items=[], chap="";
      var up={}, total=0;
      var step=function(k){ return Sync.invoke({mode:"doc",kind:"cours",chap:f.chap,chunk:k,chunks:total||undefined,files:[{path:f.path,name:f.name,mime:f.mime,role:"cours",uri:up.uri,umime:up.umime}]}).then(function(r){
        if(r.uri){ up.uri=r.uri; up.umime=r.umime; } total=total||r.chunks||1;
        items=items.concat((r.items||[]).filter(function(x){ return x && x.enonce; })); chap=chap||r.chapitre;
        f.progress=Math.round((k+1)/total*100); Store.save(); emit(); if(onStep) onStep(f);
        if(k+1<total && k<40) return step(k+1);
      }); };
      p=step(0).then(function(){ S().mathsCours[id]={chap:f.chap||chap, items:items, at:new Date().toISOString()}; f.n=items.length; });
    } else {
      var corr=Object.keys(s.files).map(function(k){ return s.files[k]; }).filter(function(x){ return x.kind==="corrige" && x.pair===id; });
      var list=[{path:f.path,name:f.name,mime:f.mime,role:"enonce"}].concat(corr.slice(0,2).map(function(x){ return {path:x.path,name:x.name,mime:x.mime,role:"corrige"}; }));
      p=Sync.invoke({mode:"doc",kind:f.kind==="dm"?"dm":"exos",chap:f.chap,files:list}).then(function(r){
        var old=(S().mathsEx[id]||{}).exos||[];
        S().mathsEx[id]={chap:f.chap||r.chapitre||"", exos:(r.exercices||[]).map(function(e,i){ var o=old[i]; if(o && o.num===e.num && o.perso) e.minutes=o.minutes, e.perso=true; return e; }), corrige:!!r.corrige, at:new Date().toISOString()};
        f.n=(r.exercices||[]).length; f.corrige=!!r.corrige;
        if(f.kind==="dm") dmTask(f);
      });
    }
    running[id]=p.then(function(){ f.status="ok"; f.progress=100; Store.save(); delete running[id]; emit(); return f; },
      function(e){ f.status="err"; f.err=String(e&&e.message||e).slice(0,300); Store.save(); delete running[id]; emit(); throw e; });
    return running[id];
  }
  /* DM : une tâche « DM » (découpée jeudi, vendredi, dimanche), durée = somme des exercices */
  function dmTask(f){
    var s=S(), ex=(s.mathsEx[f.id]||{}).exos||[], tot=ex.reduce(function(a,e){ return a+(e.minutes||30); },0)||240;
    var t=s.tasks.find(function(x){ return x.file===f.id; });
    if(!t){ t={id:uid("t"),title:"DM de maths"+(f.label?" · "+f.label:""),sub:"maths",type:"DM",action:"dm",due:f.due,prio:2,done:false,created:new Date().toISOString(),progress:0,spent:0,file:f.id}; s.tasks.push(t); }
    t.dur=Math.round(tot*1.1); t.due=f.due||t.due;
  }
  function open(id){
    var f=S().files[id], c=sb(); if(!f||!c) return;
    var w=window.open("","_blank");
    c.storage.from(BUCKET).createSignedUrl(f.path,3600).then(function(r){ if(r.error){ if(w) w.close(); if(window.__toast) window.__toast(r.error.message); return; } if(w) w.location=r.data.signedUrl; else location.href=r.data.signedUrl; });
  }
  function remove(id){
    var s=S(), f=s.files[id]; if(!f) return;
    var c=sb(); if(c) c.storage.from(BUCKET).remove([f.path]).then(function(){});
    delete s.files[id]; delete s.mathsEx[id]; delete s.mathsCours[id];
    Object.keys(s.files).forEach(function(k){ if(s.files[k].pair===id) s.files[k].pair=null; });
    s.tasks=s.tasks.filter(function(t){ return t.file!==id || t.done; });
    Store.save(); emit();
  }
  var ls=[]; function emit(){ ls.forEach(function(f){ try{ f(); }catch(e){} }); }
  function of(sub){ var s=S(); return Object.keys(s.files).map(function(k){ return s.files[k]; }).filter(function(f){ return f.sub===sub; }).sort(function(a,b){ return b.at.localeCompare(a.at); }); }
  return {upload:upload, analyze:analyze, analysable:analysable, open:open, remove:remove, of:of, on:function(f){ ls.push(f); }, busy:function(id){ return !!running[id]; }};
})();
