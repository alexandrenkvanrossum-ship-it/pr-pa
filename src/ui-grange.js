/* ---------- Grange : sujets, oraux, DS et meilleures copies de toutes les matières, avec une recherche centrale ---------- */
var GR_SUBS=[["","Tout"],["maths","Maths"],["hgg","HGG"],["csh","CSH"],["ang","Anglais"],["all","Allemand"]];
var GR_TYPES=[["","Tout"],["sujet","Sujets"],["copie","Copies"],["oral","Oraux"],["rapport","Rapports"],["doc","Mes docs"]];
var GR_TL={sujet:"Sujet",copie:"Copie",oral:"Oral",rapport:"Rapport",annale:"Annale"};
var GR_IDX=null;
/* copies que tu as déposées (Mes documents, type « Copie ») : rangées avec les autres */
function grMine(){
  var F=st().files||{}; return Object.keys(F).map(function(k){ return F[k]; }).filter(function(f){ return f&&!f.off&&f.kind==="copie"; }).map(function(f){
    var e={s:f.sub,t:"copie",c:f.ep||"Copie",y:f.y||null,ti:f.label||f.name,n:f.n||"",fid:f.id,src:"Ta Grange",mine:true};
    e._h=norm([e.ti,e.c,e.y||"",e.n,"copie",subj(f.sub).name,f.name].join(" ")); return e; });
}
function grIndex(){
  if(GR_IDX) return GR_IDX.concat(grMine());
  GR_IDX=(typeof GRANGE!=="undefined"?GRANGE:[]).map(function(e,i){ e._i=i; e._h=norm([e.ti,e.q||"",e.c||"",e.y||"",e.n||"",GR_TL[e.t]||"",subj(e.s).name,e.kw||""].join(" ")); return e; });
  return GR_IDX.concat(grMine());
}
function grTile(e){ var col={hgg:"#D2553A",csh:"#6152D1",ang:"#2685C7",all:"#2F4FA8",maths:"#B97D0C"}[e.s]||"#868E96"; return '<span class="eptile" style="--c:'+col+'">'+esc((e.c||"?").replace(/[^A-Za-zÉé0-9]/g,"").slice(0,3).toUpperCase())+'</span>'; }
function grRow(e){
  if(e.fid) return '<div class="arow grow">'+grTile(e)+'<div class="abody"><b>'+esc(e.ti)+'</b><span class="apills"><span class="chip">Copie</span>'+(e.y?'<span class="chip">'+e.y+'</span>':'')+(e.n?'<span class="chip '+(/^(20|19)/.test(e.n)?"gold":"blu")+'">'+esc(e.n)+'</span>':'')+'<span class="chip">Ta Grange</span></span><div class="row" style="gap:6px;margin-top:6px"><button class="btn tint sm" data-a="fopen" data-id="'+esc(e.fid)+'">Ouvrir la copie</button><button class="btn sm" data-a="grcpedit" data-id="'+esc(e.fid)+'">Modifier</button></div></div></div>';
  var links=(e.pdf?linkBtn(e.pdf,e.t==="copie"?"Copie (PDF)":"PDF"):"")+linkBtn(e.u,e.pdf?"Article":"Ouvrir")+(e.co?linkBtn(e.co,"Corrigé"):"")+(e.ra?linkBtn(e.ra,"Rapport"):"");
  return '<div class="arow grow" data-key="gr-'+e._i+'">'+grTile(e)+'<div class="abody"><b>'+esc(e.ti)+'</b>'+(e.q?'<span class="grq">« '+esc(e.q)+' »</span>':e.sq?'<span class="grq">Sujet : « '+esc(e.sq)+' »</span>':'')+'<span class="apills">'+'<span class="chip">'+esc(GR_TL[e.t]||e.t)+'</span>'+(e.y?'<span class="chip">'+e.y+'</span>':'')+(e.n?'<span class="chip '+(/^20/.test(e.n)?"gold":"blu")+'">'+esc(e.n)+'</span>':'')+(e.dur?'<span class="chip">'+esc(e.dur)+'</span>':'')+(e.src?'<span class="chip">'+esc(e.src)+'</span>':'')+'</span><div class="row" style="gap:6px;margin-top:6px">'+links+'</div></div></div>';
}
function grFiles(sub,words){
  var F=st().files||{}; return Object.keys(F).map(function(k){ return F[k]; }).filter(function(f){ if(!f||f.off) return false; if(sub&&f.sub!==sub) return false; if(!words.length) return true; var h=norm([f.name,f.label||"",f.kind||"",f.chap||"",subj(f.sub).name].join(" ")); return words.every(function(w){ return h.indexOf(w)>=0; }); });
}
function grFileRow(f){ return '<div class="arow"><span class="eptile" style="--c:#868E96">'+esc((f.kind||"doc").slice(0,3).toUpperCase())+'</span><button class="abody" data-a="fopen" data-id="'+esc(f.id)+'"><b>'+esc(f.label||f.name)+'</b><span class="ameta">'+esc(subj(f.sub).name)+(f.chap?' · '+esc(f.chap):'')+(f.kind?' · '+esc(f.kind):'')+'</span></button></div>'; }
function grSearch(q,sub,type){
  var words=norm(q||"").split(/\s+/).filter(Boolean);
  var L=grIndex().filter(function(e){ if(sub&&e.s!==sub) return false; if(type&&type!=="doc"&&(type==="sujet"?(e.t!=="sujet"&&e.t!=="annale"):e.t!==type)) return false; if(type==="doc") return false; return words.every(function(w){ return e._h.indexOf(w)>=0; }); });
  L.sort(function(a,b){ return (b.mine?1:0)-(a.mine?1:0)||(b.y||0)-(a.y||0)||(a.t==="copie"?-1:0)-(b.t==="copie"?-1:0); });
  return L;
}
function vGrange(){
  var G=S.gr=S.gr||{q:"",sub:S.param||"",type:""}; if(S.param&&G._p!==S.param){ G.sub=S.param; G._p=S.param; }
  var words=norm(G.q||"").split(/\s+/).filter(Boolean);
  var h=topbar("Grange")+'<h1 class="large-title">Grange</h1><p class="subtitle">Tous les sujets d\'écrit et d\'oral, les meilleures copies de concours et tes propres documents, dans toutes les matières. Concours BCE uniquement ; langues : ELVi.</p>';
  h+='<div class="row" style="justify-content:flex-end;margin:-6px 0 8px"><button class="btn tint sm" data-a="grcpadd">'+I.plus+' Ajouter une copie</button></div><label class="msearch">'+SEARCH_SVG+'<input class="field" id="gr-q" type="search" placeholder="Chine, ESCP 2025, 20/20, Wallis, Sois sage…" value="'+esc(G.q||"")+'" autocomplete="off" aria-label="Rechercher dans la Grange"></label>';
  h+='<div class="chips-x" style="margin-top:10px">'+GR_SUBS.map(function(x){ return '<button class="chip'+(G.sub===x[0]?" on":"")+'" data-a="grsub" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  h+='<div class="seg wide" style="margin:6px 0 12px">'+GR_TYPES.map(function(x){ return '<button class="'+(G.type===x[0]?"on":"")+'" data-a="grtype" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  /* maths : la Grange des annales (984 exercices) */
  if((!G.sub||G.sub==="maths")&&G.type!=="doc"){
    annBoot();
    if(Ann.ready()){
      var mL=words.length?Ann.search(G.q,{mode:G.type==="oral"?"oral":"ex"}).L.slice(0,G.sub==="maths"?20:6):[];
      h+='<section class="card"><div class="card-h"><h2>Maths</h2><button class="link-btn" data-a="mtab" data-v="grange">Grange maths complète</button></div>'+(words.length?(mL.length?'<div class="alist">'+mL.map(function(it){ return annRow(it,Ann.score(it,Ann.focusNow())); }).join("")+'</div>':'<div class="empty">Rien en maths pour cette recherche.</div>'):'<p class="small muted" style="margin:0">984 exercices d\'écrit (2000 à 2026), oraux HEC et ESCP, DS de Ginette avec leur durée, sujets complets avec corrigés et rapports. Tape un mot-clé ou ouvre la Grange maths pour les filtres.</p>')+'</section>';
    }
  }
  var subsShown=G.sub?[G.sub]:["maths","hgg","csh","ang","all"];
  if(G.type!=="doc") subsShown.forEach(function(sb){
    var L=grSearch(G.q,sb,G.type); if(sb==="maths"&&!L.length) return; if(!L.length&&words.length) return;
    var lim=S.grN&&S.grN[sb]||(G.sub?60:8);
    h+='<section class="card"><div class="card-h"><h2>'+esc(subj(sb).name)+(sb==="maths"?" · rapports du jury":"")+'</h2><span class="small muted">'+plural(L.length,"élément")+'</span></div>'+(L.length?'<div class="alist">'+L.slice(0,lim).map(grRow).join("")+'</div>':'<div class="empty">Rien pour l\'instant.</div>')+(L.length>lim?'<button class="link-btn" style="margin-top:8px" data-a="grmore" data-v="'+sb+'">Afficher '+Math.min(40,L.length-lim)+' de plus</button>':'')+'</section>';
  });
  var fl=grFiles(G.sub&&G.sub!==""?G.sub:null,words);
  if(G.type==="doc"||(words.length&&fl.length)) h+='<section class="card"><div class="card-h"><h2>Mes documents</h2><span class="small muted">'+plural(fl.length,"fichier")+'</span></div>'+(fl.length?'<div class="alist">'+fl.slice(0,40).map(grFileRow).join("")+'</div>':'<div class="empty">Dépose tes DST, sujets et copies dans chaque matière : ils apparaîtront ici et dans la recherche.</div>')+'</section>';
  return h+'<p class="small muted" style="margin:10px 4px">Sources : Major Prépa, Mister Prépa, rapports officiels (HEC). Les copies sont celles que ces sites publient, avec leur note. Les sujets s\'ouvrent sur la page de l\'annale.</p>';
}
/* encart Grange dans chaque matière */
function grangeCard(sub){
  var L=grSearch("",sub,""), n={sujet:0,copie:0,oral:0,rapport:0}; L.forEach(function(e){ if(e.t==="copie") n.copie++; else if(e.t==="oral") n.oral++; else if(e.t==="rapport") n.rapport++; else n.sujet++; });
  var best=L.filter(function(e){ return e.t==="copie"; }).slice(0,3), rap=L.filter(function(e){ return e.t==="rapport"; }).slice(0,2), last=L.filter(function(e){ return e.t==="sujet"||e.t==="annale"; }).slice(0,2);
  return '<section class="card"><div class="card-h"><h2>Grange</h2><button class="link-btn" data-go="grange" data-p="'+sub+'">Tout voir</button></div><div class="aweek" style="margin-bottom:10px"><div><b>'+n.sujet+'</b><span>sujets d\'écrit</span></div><div><b>'+n.copie+'</b><span>meilleures copies</span></div><div><b>'+n.oral+'</b><span>oraux</span></div><div><b>'+n.rapport+'</b><span>rapports</span></div></div>'+(last.length||best.length||rap.length?'<div class="alist">'+best.concat(rap,last).map(grRow).join("")+'</div>':'')+'</section>';
}
function grangeClick(a,b){
  var G=S.gr=S.gr||{q:"",sub:"",type:""};
  if(a==="grsub"){ G.sub=b.getAttribute("data-v"); G._p=G.sub; S.param=G.sub||null; S.grN={}; render(); return true; }
  if(a==="grtype"){ G.type=b.getAttribute("data-v"); S.grN={}; render(); return true; }
  if(a==="grcpadd"){ grCopySheet(null); return true; }
  if(a==="grcpedit"){ grCopySheet(b.getAttribute("data-id")); return true; }
  if(a==="grmore"){ var sb=b.getAttribute("data-v"); S.grN=S.grN||{}; S.grN[sb]=(S.grN[sb]||(G.sub?60:8))+40; render(); return true; }
  return false;
}

/* rapports du jury liés à une épreuve (pour la Méthodo) */
function grRapports(ep){
  var sub=(EPREUVES.ecrit.concat(EPREUVES.oral).filter(function(e){ return e.id===ep; })[0]||{}).sub;
  return grIndex().filter(function(e){ if(e.t!=="rapport") return false;
    if(ep.charAt(0)==="o") return e.kw==="oral"&&(sub==="hgg"||sub==="csh");
    if(e.kw==="oral") return false;
    if(ep==="e-dissert") return e.s==="csh"&&/culture/i.test(e.ti);
    if(ep==="e-synth") return e.s==="csh"&&/synth/i.test(e.ti);
    return e.s===sub; });
}
/* déposer une copie (PDF ou photo) : rangée dans ton espace privé, elle apparaît dans la Grange */
function grCopySheet(fid){
  var f=fid?(st().files||{})[fid]:null, G=S.gr||{};
  var subs=[["maths","Maths"],["hgg","HGG"],["csh","CSH"],["ang","Anglais"],["all","Allemand"]];
  var h='<div class="sheet-h"><div class="ttl"><h2>'+(f?"Modifier la copie":"Ajouter une copie")+'</h2><div class="small muted">Copie de concours ou de DS : elle rejoint la Grange de la matière.</div></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b"><form id="grcp" class="stack">';
  if(!f) h+='<label class="btn sm" style="cursor:pointer;align-self:flex-start">'+I.plus+' Choisir le fichier<input type="file" id="grcp-file" accept=".pdf,image/*" hidden></label><span class="small muted" id="grcp-name">Aucun fichier choisi</span>';
  h+='<label class="small">Matière<select class="field" id="grcp-sub">'+subs.map(function(x){ return '<option value="'+x[0]+'"'+(((f&&f.sub)||G.sub||"all")===x[0]?" selected":"")+'>'+x[1]+'</option>'; }).join("")+'</select></label>';
  h+='<label class="small">Titre<input class="field" id="grcp-ti" value="'+esc(f?(f.label||f.name):"")+'" placeholder="Ex. : Allemand LVA ELVi 2024 · Baptiste"></label>';
  h+='<div class="row" style="gap:8px"><label class="small" style="flex:1">Note<input class="field" id="grcp-n" value="'+esc(f&&f.n||"")+'" placeholder="19,55/20"></label><label class="small" style="flex:1">Année<input class="field" id="grcp-y" inputmode="numeric" value="'+esc(f&&f.y||"")+'" placeholder="2024"></label></div>';
  h+='<label class="small">Épreuve<input class="field" id="grcp-ep" value="'+esc(f&&f.ep||"")+'" placeholder="ELVi LVA"></label>';
  h+='<button class="btn primary" type="submit" id="grcp-go"'+(f?'':' disabled')+'>'+(f?"Enregistrer":"Téléverser")+'</button>'+(f?'<button class="btn" type="button" data-a="fdel" data-id="'+esc(f.id)+'">Supprimer</button>':'')+'</form></div>';
  openSheet(h);
  var inp=document.getElementById("grcp-file");
  if(inp) inp.addEventListener("change",function(){ var x=inp.files[0]; document.getElementById("grcp-name").textContent=x?x.name:"Aucun fichier choisi"; document.getElementById("grcp-go").disabled=!x; var ti=document.getElementById("grcp-ti"); if(x&&!ti.value) ti.value=x.name.replace(/\.[a-z]+$/i,"").replace(/[_-]+/g," "); });
  document.getElementById("grcp").addEventListener("submit",function(ev){
    ev.preventDefault();
    var meta={sub:document.getElementById("grcp-sub").value,kind:"copie",label:document.getElementById("grcp-ti").value.trim()};
    var extra={n:document.getElementById("grcp-n").value.trim(),y:parseInt(document.getElementById("grcp-y").value,10)||null,ep:document.getElementById("grcp-ep").value.trim()};
    if(f){ f.sub=meta.sub; f.label=meta.label; f.n=extra.n; f.y=extra.y; f.ep=extra.ep; save(); closeSheet(); render(); toast("Copie mise à jour."); return; }
    var x=inp.files[0]; if(!x) return; var btn=document.getElementById("grcp-go"); btn.disabled=true; btn.textContent="Envoi…";
    Files.upload(x,meta).then(function(rec){ rec.n=extra.n; rec.y=extra.y; rec.ep=extra.ep; save(); closeSheet(); render(); toast("Copie ajoutée à la Grange."); },function(e){ btn.disabled=false; btn.textContent="Téléverser"; toast(String(e&&e.message||e)); });
  });
}
