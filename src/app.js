/* Interface : coquille, pages, fenêtres. */
(function(){
"use strict";

var S = {view:"home", param:null, agDate:iso(today()), agMode:null, todoFilter:"*", notesMode:"ecrit", methMode:"ecrit", echMode:"dst", timers:{}};
var app, layer;

/* ---------- icônes ---------- */
var I = {
  home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  cal:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.8v3.4M16 2.8v3.4"/></svg>',
  grid:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></svg>',
  more:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="18.5" cy="12" r="1.9"/></svg>',
  plus:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  check:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  list:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/></svg>',
  flag:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  chart:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16M6 15l4-5 3 3 5-7"/></svg>',
  book:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20"/></svg>',
  spark:'<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c.5 4.6 2.4 7 7.5 8-5.1 1-7 3.4-7.5 8-.5-4.6-2.4-7-7.5-8 5.1-1 7-3.4 7.5-8z"/><path d="M19 15.5c.2 1.6.9 2.4 2.5 2.7-1.6.3-2.3 1.1-2.5 2.8-.2-1.7-.9-2.5-2.5-2.8 1.6-.3 2.3-1.1 2.5-2.7z" opacity=".7"/></svg>',
  left:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  right:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>',
  close:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  trash:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  arrow:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  send:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>'
};

/* ---------- utilitaires d'affichage ---------- */
function subj(id){ return SUBJECTS[id]||{name:"Autre",short:"Autre",cls:"s-neutral"}; }
function tag(id,label){ var s=subj(id); return '<span class="tag '+s.cls+'">'+esc(label||s.short)+'</span>'; }
function toast(m){ var el=document.createElement("div"); el.className="toast"; el.setAttribute("role","status"); el.textContent=m; document.body.appendChild(el); setTimeout(function(){ el.remove(); },2600); }
function save(){ Store.save(); }
function st(){ return Store.get(); }
function nowMin(){ var d=new Date(); return d.getHours()*60+d.getMinutes(); }
function durTxt(m){ if(m==null) return ""; if(m<60) return m+" min"; var h=Math.floor(m/60), r=m%60; return h+"h"+(r?pad(r):""); }
function plural(n,w){ return n+" "+w+(n>1?"s":""); }

/* ---------- exemples de départ ---------- */
function seed(){
  var s=st(); if(s.seeded) return;
  var t0=today(), mon=addDays(mondayOf(t0),7);
  var ex=[
    {raw:"DM maths pour lundi !!!", over:{due:iso(mon)}},
    {raw:"Lire le texte 3 d'anglais (long) pour mardi !!"},
    {raw:"Relire le cours n°1 de Mme Kanban (introduction et partie I) pour samedi !!", over:{sub:"csh",type:"Révision",dur:45,due:"2026-10-10"}},
    {raw:"vidéo Chine 20 min pour jeudi"},
    {raw:"réf Sophocle, Antigone (premier chœur)"},
    {raw:"traduction allemand pour vendredi"},
    {raw:"civi : congrès de Reform UK", over:{sub:"ang"}}
  ];
  ex.forEach(function(e,ix){ var p=parseTask(e.raw); var t=taskFrom(p); t.id="ex-"+(ix+1); for(var k in (e.over||{})) t[k]=e.over[k]; t.example=true; s.tasks.push(t); });
  s.seeded=true; save();
}
function taskFrom(p){
  return {id:uid("t"),title:p.title,sub:p.sub||"perso",type:p.type,dur:p.dur,due:p.due,day:p.day,time:p.time,remind:p.remind,prio:p.prio,action:p.action,done:false,created:new Date().toISOString(),progress:0,spent:0};
}

/* ---------- coquille ---------- */
var NAV=[["home","Accueil",I.home],["agenda","Agenda",I.cal],["todo","To-Do",I.list],["matieres","Matières",I.grid],["echeances","Échéances",I.flag],["notes","Notes",I.chart],["methodo","Méthodo",I.book]];
function shell(){
  document.getElementById("root").innerHTML=
   '<div class="shell">'+
   '<aside class="side" aria-label="Navigation"><div class="brand">Prépa<span>ECG2 · 2026–2027</span></div>'+
   NAV.map(function(n){ return '<button class="nav" data-go="'+n[0]+'">'+n[2]+'<span>'+n[1]+'</span></button>'+(n[0]==="matieres"?SUBJECT_ORDER.map(function(id){ var s=subj(id); return '<button class="nav" data-go="matiere" data-p="'+id+'" style="padding-left:18px"><span class="dot" style="background:var(--'+id+'-ink)"></span><span>'+s.name+'</span></button>'; }).join(""):""); }).join("")+
   '<button class="add-side" data-a="quick">'+I.plus+' Nouvelle tâche</button></aside>'+
   '<main class="view" id="app"></main>'+
   '<div class="tabbar"><nav aria-label="Onglets">'+
   '<button data-go="home">'+I.home+'Accueil</button><button data-go="agenda">'+I.cal+'Agenda</button>'+
   '<div class="plus-wrap"><button class="plus" data-a="quick" aria-label="Nouvelle tâche">'+I.plus+'</button></div>'+
   '<button data-go="matieres">'+I.grid+'Matières</button><button data-go="plus">'+I.more+'Plus</button></nav></div>'+
   '</div><div id="layer"></div>';
  app=document.getElementById("app"); layer=document.getElementById("layer");
}
function setActive(){
  var v=S.view==="matiere"?"matieres":S.view;
  document.querySelectorAll("[data-go]").forEach(function(b){
    var on=b.getAttribute("data-go")===v && !b.getAttribute("data-p");
    if(S.view==="matiere" && b.getAttribute("data-p")===S.param) on=true;
    if(S.view==="matiere" && b.getAttribute("data-go")==="matieres" && b.closest(".side")) on=false;
    if(["echeances","notes","methodo","todo"].indexOf(S.view)>=0 && b.closest(".tabbar") && b.getAttribute("data-go")==="plus") on=true;
    b.classList.toggle("on",on);
  });
}
function topbar(title){
  return '<div class="topbar" id="topbar"><span class="t-title">'+esc(title)+'</span><span class="sp"></span>'+
    '<button class="sync-pill" data-a="account" id="sync-pill" aria-label="Compte et synchronisation">'+syncLabel()+'</button>'+
    '<button class="icon-btn gem-btn" data-a="gemini" aria-label="Demander à Gemini" title="Demander à Gemini">'+I.spark+'</button></div>';
}
function go(v,p){ S.view=v; S.param=p||null; render(); window.scrollTo(0,0); try{ history.replaceState(null,"","#"+v+(p?"-"+p:"")); }catch(e){} }

function render(){
  var html="";
  switch(S.view){
    case "agenda": html=vAgenda(); break;
    case "todo": html=vTodo(); break;
    case "matieres": html=vMatieres(); break;
    case "matiere": html=vMatiere(S.param); break;
    case "echeances": html=vEcheances(); break;
    case "notes": html=vNotes(); break;
    case "methodo": html=vMethodo(); break;
    case "plus": html=vPlus(); break;
    default: html=vHome();
  }
  app.innerHTML='<div class="inner page-enter">'+html+'</div>';
  setActive(); bindQuick(); tickTimers();
}

/* ---------- objectifs et échéances du jour ---------- */
function upcomingPales(n){ var t=iso(today()); return PALES.filter(function(p){ return p.date>=t; }).slice(0,n||99); }
function dayObjectives(dISO){
  var s=st(), out=[];
  var next=upcomingPales(1)[0];
  if(next){ var dd=diffDays(next.date,dISO); if(dd>=0 && dd<=7) out.push({t:"Préparer le DST de "+next.t.replace(/^Concours blanc · /,"")+" ("+relDay(next.date).toLowerCase()+")",sub:next.sub}); }
  s.tasks.filter(function(t){ return !t.done && (t.day===dISO || (t.due && diffDays(t.due,dISO)<=2 && diffDays(t.due,dISO)>=0)); })
    .sort(function(a,b){ return (b.prio||0)-(a.prio||0); })
    .forEach(function(t){ if(out.length<3) out.push({t:t.title+(t.due?" (pour "+relDay(t.due).toLowerCase()+")":""),sub:t.sub}); });
  if(out.length<3){ dayEvents(dISO).filter(function(e){ return e.kind==="work"; }).forEach(function(e){ if(out.length<3 && !out.some(function(o){return o.sub===e.sub;})) out.push({t:e.t+" de "+hLabel(e.s)+" à "+hLabel(e.e),sub:e.sub}); }); }
  return out.slice(0,3);
}
function dueToday(dISO){
  var s=st(), out=[];
  paleOn(dISO).forEach(function(p){ out.push({when:hLabel(p.s),t:"DST · "+p.t,sub:p.sub}); });
  s.tasks.filter(function(t){ return !t.done && t.time && t.day===dISO; }).forEach(function(t){ out.push({when:hLabel(t.time),t:t.title+" · rappel "+t.remind+" min avant",sub:t.sub}); });
  s.tasks.filter(function(t){ return !t.done && t.due===dISO; }).forEach(function(t){ out.push({when:"Pour auj.",t:t.title,sub:t.sub}); });
  return out;
}
function cshPick(){
  var s=st(); var d=today(); var i=(Math.floor(d/864e5)+(s.cshSkip||0))%CSH_PICKS.length; return CSH_PICKS[i];
}
function hasCSH(dISO){ return dayEvents(dISO).some(function(e){ return e.kind==="work" && (e.sub==="csh"||(e.subs||[]).indexOf("csh")>=0); }); }

/* ---------- Accueil ---------- */
function vHome(){
  var t=iso(today()), d=today(), objs=dayObjectives(t), dues=dueToday(t), evs=dayEvents(t), nm=nowMin();
  var h='';
  h+=topbar("Accueil");
  h+='<div class="hello"><div><div class="eyebrow">'+esc(DAYS[d.getDay()])+'</div><h1 class="large-title">'+d.getDate()+' '+MONTHS[d.getMonth()]+'</h1></div>';
  var next=upcomingPales(1)[0];
  if(next) h+='<span class="tag '+subj(next.sub).cls+'">Prochain DST · '+esc(next.t)+' · '+(diffDays(next.date,t)===0?"aujourd'hui":"J-"+diffDays(next.date,t))+'</span>';
  h+='</div><p class="subtitle">'+(inVacances(t)?"Vacances de la "+inVacances(t).name+" : régime à définir.":"Voici l'essentiel de ta journée.")+'</p>';
  h+='<div class="grid g2">';
  h+='<section class="card"><div class="card-h"><h2>Objectifs du jour</h2></div>';
  h+=objs.length?'<ol class="objs">'+objs.map(function(o,i){ return '<li><span class="n">'+(i+1)+'</span><span>'+esc(o.t)+'</span></li>'; }).join("")+'</ol>':'<div class="empty">Rien d\'imposé aujourd\'hui.</div>';
  h+='</section>';
  h+='<section class="card"><div class="card-h"><h2>Échéances du jour</h2><button class="link-btn" data-go="echeances">Toutes</button></div>';
  h+=dues.length?'<div class="stack" style="gap:8px">'+dues.map(function(x){ return '<div class="due '+subj(x.sub).cls+'"><span class="when">'+esc(x.when)+'</span><span class="what">'+esc(x.t)+'</span></div>'; }).join("")+'</div>':'<div class="empty"><b>Aucune échéance aujourd\'hui</b>Les colles apparaîtront ici dès que BJcolle sera branché.</div>';
  h+='</section></div>';

  if(hasCSH(t)){
    h+='<div style="margin-top:14px">'+'<a class="ext" href="https://claude.ai/artifact/TA1xcsk7H5jfrj7vcYsfwV" target="_blank" rel="noopener"><div><b>Atelier CSH</b><span class="small muted">'+"Journée de CSH : ton œuvre du jour et son parcours d'étude t'attendent dans l'atelier."+'</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>'+'</div>';
  }

  h+='<div class="grid g2" style="margin-top:14px">';
  h+='<section class="card"><div class="card-h"><h2>Programme</h2><button class="link-btn" data-go="agenda">Agenda</button></div><div class="strip">';
  h+=evs.filter(function(e){ return e.kind!=="fixed" || e.anki || e.actu; }).map(function(e){
    var s=subj(e.sub), cls=(nm>=toMin(e.s)&&nm<toMin(e.e))?" now":(nm>=toMin(e.e)?" past":"");
    var sub=e.kind==="course"?"Cours":e.kind==="exam"?"Épreuve":e.kind==="fixed"?"Routine":"Feuille de route";
    return '<button class="slot'+cls+' '+(e.kind==="exam"?"s-hgg":s.cls)+'" data-a="slot" data-d="'+t+'" data-id="'+esc(e.id)+'"><span class="h">'+hLabel(e.s)+'</span><span class="b"><b>'+esc(e.t)+'</b><span>'+sub+' · '+durTxt(toMin(e.e)-toMin(e.s))+'</span></span></button>';
  }).join("");
  h+='</div></section>';
  h+='<section class="stack"><div class="card"><div class="card-h"><h2>Tâches du jour</h2><button class="link-btn" data-go="todo">Tout voir</button></div>'+quickBox("home")+'<div class="tasks" style="margin-top:6px">'+taskRows(todayTasks())+'</div></div>';
  h+='<div class="card" id="news-card">'+newsHTML()+'</div></section></div>';
  setTimeout(loadNews,50);
  return h;
}
function todayTasks(){
  var t=iso(today());
  return st().tasks.filter(function(x){ return !x.done && (x.day===t || (x.due && x.due<=iso(addDays(today(),2))) || (x.day && x.day<t)); });
}

/* ---------- To-Do ---------- */
function quickBox(where){
  return '<div class="quick-wrap" data-where="'+where+'"><form class="quick" data-quick><input id="q-'+where+'" autocomplete="off" placeholder="Ex. : lire le texte 3 d\'anglais pour mardi !!" aria-label="Nouvelle tâche"><button class="go" type="submit" disabled aria-label="Ajouter">'+I.send+'</button></form><div class="parse" aria-live="polite"></div></div>';
}
function bindQuick(){
  document.querySelectorAll("form[data-quick]").forEach(function(f){
    var inp=f.querySelector("input"), box=f.parentNode.querySelector(".parse"), btn=f.querySelector(".go");
    var cur=null;
    function upd(){
      var v=inp.value.trim(); btn.disabled=!v; if(!v){ box.innerHTML=""; cur=null; return; }
      cur=parseTask(v); if(f._sub) cur.sub=f._sub; if(f._g){ if(!cur.type&&f._g.type) cur.type=f._g.type; if(!cur.dur&&f._g.dur) cur.dur=f._g.dur; }
      box.innerHTML=parseChips(cur);
      var sel=box.querySelector("select"); if(sel) sel.onchange=function(){ f._sub=sel.value; upd(); };
    }
    var gT=null;
    inp.addEventListener("input",function(){ f._sub=null; f._g=null; upd(); clearTimeout(gT);
      var v=inp.value.trim();
      if(cur && !cur.sub && v.length>6 && typeof Sync!=="undefined" && Sync.user()){
        gT=setTimeout(function(){ Sync.invoke({mode:"classify",input:v}).then(function(r){
          if(inp.value.trim()!==v || !r || !r.sub) return;
          f._sub=r.sub; f._g=r; upd(); if(cur){ if(!cur.type&&r.type) cur.type=r.type; if(!cur.dur&&r.dur) cur.dur=r.dur; box.innerHTML=parseChips(cur)+'<span class="chip act">classé par Gemini</span>'; var sel=box.querySelector("select"); if(sel) sel.onchange=function(){ f._sub=sel.value; upd(); }; }
        },function(){}); },900);
      }
    });
    f.addEventListener("submit",function(e){
      e.preventDefault(); if(!inp.value.trim()) return; upd();
      var t=taskFrom(cur); st().tasks.push(t); save();
      inp.value=""; f._sub=null; box.innerHTML=""; btn.disabled=true;
      toast(actionToast(t)); closeSheet(); render();
    });
  });
}
function parseChips(p){
  var s=subj(p.sub||"perso");
  var h='<label class="'+s.cls+'" style="display:inline-flex"><span class="sr" hidden>Matière</span><select aria-label="Matière" style="--s:var(--'+(p.sub||"perso")+');--si:var(--'+(p.sub||"perso")+'-ink)">'+
    ["maths","hgg","csh","ang","all","perso"].map(function(id){ return '<option value="'+id+'"'+(id===(p.sub||"perso")?" selected":"")+'>'+subj(id).name+'</option>'; }).join("")+'</select></label>';
  if(p.type) h+='<span class="chip">'+esc(p.type)+'</span>';
  if(p.dur) h+='<span class="chip">'+durTxt(p.dur)+'</span>';
  if(p.due) h+='<span class="chip">avant le '+fmtDay(p.due)+'</span>';
  if(p.day) h+='<span class="chip">'+fmtDay(p.day)+(p.time?' · '+hLabel(p.time):'')+'</span>';
  if(p.prio) h+='<span class="chip"><span class="prio">'+"!!!".slice(0,p.prio)+'</span>'+["","important","prioritaire","impératif"][p.prio]+'</span>';
  var a=actionLabel(p); if(a) h+='<span class="chip act">→ '+esc(a)+'</span>';
  return h;
}
function actionLabel(p){
  if(p.action==="rappel") return "rappel "+p.remind+" min avant"+(p.time?" ("+hLabel(fromMin(toMin(p.time)-p.remind))+")":"");
  if(p.action==="csh-oeuvre") return "œuvre pour l'Atelier CSH";
  if(p.action==="hgg-fiche") return "fiche automatique dans l'Atelier HGG";
  if(p.action==="civi") return "CIVI "+(p.sub==="all"?"allemand":"anglais")+" (Google Doc)";
  if(p.action==="dm") return "découpage jeudi, vendredi, dimanche";
  if(!p.time && (p.due||p.day)) return "placée dans un créneau "+subj(p.sub||"perso").short;
  return "";
}
function actionToast(t){
  if(t.action==="rappel") return "Ajouté à l'agenda, rappel "+t.remind+" min avant.";
  if(t.action==="csh-oeuvre") return "Tâche ajoutée. Pour la fiche, note aussi l'œuvre dans l'Atelier CSH.";
  if(t.action==="hgg-fiche") return "Ajouté. La fiche sera créée par l'Atelier HGG.";
  if(t.action==="civi") return "Ajouté. L'insertion dans ta CIVI arrive avec la connexion Google Docs.";
  return "Tâche ajoutée.";
}
function taskRows(list){
  if(!list.length) return '<div class="empty"><b>Rien pour l\'instant</b>Ajoute une tâche avec la barre ci-dessus.</div>';
  return list.map(function(t){
    var late=t.due && t.due<iso(today()) && !t.done;
    var meta=[];
    if(t.due) meta.push('<span class="meta'+(late?" late":"")+'">'+(late?"En retard · ":"Pour ")+(late?fmtDay(t.due):relDay(t.due).toLowerCase())+'</span>');
    if(t.day) meta.push('<span class="meta">'+relDay(t.day)+(t.time?" · "+hLabel(t.time):"")+'</span>');
    if(t.dur) meta.push('<span class="meta">'+durTxt(t.dur)+'</span>');
    if(t.progress && !t.done) meta.push('<span class="meta">fait à '+t.progress+' %</span>');
    return '<div class="task p'+(t.prio||0)+(t.done?" done":"")+'"><button class="check'+(t.done?" on":"")+'" data-a="toggle" data-id="'+t.id+'" aria-label="'+(t.done?"Rouvrir":"Terminer")+'">'+(t.done?I.check:"")+'</button>'+
      '<div class="tt"><span>'+esc(t.title)+'</span><div class="tm">'+tag(t.sub)+(t.type?'<span class="meta">'+esc(t.type)+'</span>':'')+meta.join("")+(t.prio?'<span class="prio">'+"!!!".slice(0,t.prio)+'</span>':'')+(t.example?'<span class="badge-ex">exemple</span>':'')+'</div></div>'+
      '<button class="del" data-a="del" data-id="'+t.id+'" aria-label="Supprimer">'+I.trash+'</button></div>';
  }).join("");
}
function vTodo(){
  var s=st(), f=S.todoFilter, t=iso(today());
  var list=s.tasks.filter(function(x){ return f==="*"||x.sub===f; });
  var open=list.filter(function(x){ return !x.done; }), done=list.filter(function(x){ return x.done; });
  function when(x){ return x.day||x.due||null; }
  var groups=[["En retard",open.filter(function(x){ return when(x)&&when(x)<t; })],["Aujourd'hui",open.filter(function(x){ return when(x)===t; })],
    ["Cette semaine",open.filter(function(x){ return when(x)&&when(x)>t&&diffDays(when(x),t)<=7; })],["Plus tard",open.filter(function(x){ return when(x)&&diffDays(when(x),t)>7; })],["Sans date",open.filter(function(x){ return !when(x); })]];
  var h=topbar("To-Do")+'<h1 class="large-title">To-Do</h1><p class="subtitle">Une seule liste pour tout : matières, ateliers et vie quotidienne.</p>';
  h+=quickBox("todo");
  h+='<div class="filters" style="margin:14px 0 6px">'+[["*","Tout"]].concat(SUBJECT_ORDER.concat(["perso"]).map(function(id){ return [id,subj(id).name]; })).map(function(x){ return '<button class="chip'+(f===x[0]?" on":"")+'" data-a="tfilter" data-f="'+x[0]+'">'+esc(x[1])+'</button>'; }).join("")+'</div>';
  h+='<div class="stack">';
  groups.forEach(function(g){ if(!g[1].length) return; g[1].sort(function(a,b){ return (b.prio||0)-(a.prio||0)||String(when(a)).localeCompare(String(when(b))); }); h+='<section class="card"><div class="group-h">'+g[0]+' <span class="n">'+g[1].length+'</span></div><div class="tasks">'+taskRows(g[1])+'</div></section>'; });
  if(!open.length) h+='<div class="card"><div class="empty"><b>Tout est fait</b>Ajoute une tâche avec la barre ci-dessus.</div></div>';
  if(done.length) h+='<details class="card"><summary class="group-h" style="cursor:pointer">Terminées <span class="n">'+done.length+'</span></summary><div class="tasks">'+taskRows(done)+'</div></details>';
  h+='</div><div class="note-box" style="margin-top:14px">Exemples de saisie : « ne pas oublier le rdv Coirier 19h » · « réf Marivaux Les Fausses Confidences » · « ex : Golden Dome » · « DM maths pour lundi !!! » · « civi : élections à Berlin ». Les tâches marquées <span class="badge-ex">exemple</span> peuvent être supprimées.</div>';
  return h;
}

/* ---------- Agenda ---------- */
var H0=7*60, H1=23*60+40, PX=0.9;
function vAgenda(){
  var mode=S.agMode||(window.innerWidth>=900?"week":"day");
  var d=parseISO(S.agDate), mon=mondayOf(d), t=iso(today());
  var h=topbar("Agenda")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Agenda</h1><div class="seg" role="tablist"><button class="'+(mode==="day"?"on":"")+'" data-a="agmode" data-m="day">Jour</button><button class="'+(mode==="week"?"on":"")+'" data-a="agmode" data-m="week">Semaine</button></div></div>';
  h+='<div class="ag-head"><div class="ag-nav"><button class="icon-btn" data-a="agstep" data-n="'+(mode==="day"?-1:-7)+'" aria-label="Précédent">'+I.left+'</button><span class="lbl-date">'+(mode==="day"?fmtLong(S.agDate).replace(/^./,function(c){return c.toUpperCase();}):"Semaine du "+mon.getDate()+" "+MON_S[mon.getMonth()])+'</span><button class="icon-btn" data-a="agstep" data-n="'+(mode==="day"?1:7)+'" aria-label="Suivant">'+I.right+'</button></div><button class="btn sm" data-a="agtoday">Aujourd\'hui</button></div>';
  if(mode==="day"){
    h+='<div class="days">'; for(var i=0;i<7;i++){ var x=addDays(mon,i), xi=iso(x); h+='<button class="'+(xi===S.agDate?"on ":"")+(xi===t?"today":"")+'" data-a="agday" data-d="'+xi+'"><small>'+DAYS_S[x.getDay()].replace(".","")+'</small><b>'+x.getDate()+'</b></button>'; } h+='</div>';
  }
  var dates=mode==="day"?[S.agDate]:[0,1,2,3,4,5,6].map(function(i){ return iso(addDays(mon,i)); });
  var height=(H1-H0)*PX, hourCol=44;
  h+='<div class="cal"><div class="cal-scroll"><div class="cal-grid" style="grid-template-columns:'+hourCol+'px repeat('+dates.length+',minmax('+(mode==="week"?"96px":"0")+',1fr))">';
  h+='<div></div>'+dates.map(function(x){ var dd=parseISO(x); return '<div class="cal-colh'+(x===t?" today":"")+'">'+DAYS_S[dd.getDay()]+' '+dd.getDate()+'</div>'; }).join("");
  h+='<div class="cal-hours" style="height:'+height+'px">'; for(var hh=8;hh<=23;hh++){ h+='<div style="top:'+((hh*60-H0)*PX)+'px">'+hh+'h</div>'; } h+='</div>';
  dates.forEach(function(x){
    h+='<div class="cal-col" style="height:'+height+'px">';
    for(var hh=8;hh<=23;hh++) h+='<div class="line" style="top:'+((hh*60-H0)*PX)+'px"></div>';
    dayEvents(x).concat(timedTasks(x)).forEach(function(e){
      var top=(Math.max(toMin(e.s),H0)-H0)*PX, ht=Math.max((toMin(e.e)-toMin(e.s))*PX-2,18);
      var cls=subj(e.sub).cls+" "+(e.kind==="course"?"course":e.kind==="fixed"?"fixed":e.kind==="exam"?"exam":"");
      var road=e.kind==="work"?roadFor(e,x):[];
      var done=road.length?road.filter(function(r,ix){ return isDone(x,e,r,ix); }).length:0;
      h+='<button class="ev '+cls+'" style="top:'+top+'px;height:'+ht+'px" data-a="slot" data-d="'+x+'" data-id="'+esc(e.id)+'"><b>'+esc(e.t)+'</b>'+(ht>34?'<span>'+hLabel(e.s)+'–'+hLabel(e.e)+(road.length?' · '+done+'/'+road.filter(function(r){return !r.pause;}).length:'')+'</span>':'')+'</button>';
    });
    if(x===t){ var nm=nowMin(); if(nm>=H0&&nm<=H1) h+='<div class="now-line" style="top:'+((nm-H0)*PX)+'px"></div>'; }
    h+='</div>';
  });
  h+='</div></div></div>';
  h+='<div class="legend">'+SUBJECT_ORDER.map(function(id){ return tag(id); }).join("")+'<span class="tag s-neutral">Routine</span><span class="tag" style="--s:var(--red-pale);--si:var(--red)">DST</span></div>';
  h+='<p class="small muted" style="margin-top:10px">Les cours sont hachurés. Les créneaux de travail suivent ta journée type ; touche un créneau pour ouvrir sa feuille de route. La répartition automatique complète arrive avec le moteur de planification.</p>';
  return h;
}
function timedTasks(x){
  return st().tasks.filter(function(t){ return t.time && t.day===x && !t.done; }).map(function(t){ return {kind:"work",s:t.time,e:fromMin(Math.min(toMin(t.time)+(t.dur||45),H1)),t:t.title,sub:t.sub,id:"task-"+t.id,taskId:t.id}; });
}
function slotKey(d,e,r,ix){ return d+"|"+e.id+"|"+(r.task||r.lab)+"|"+ix; }
function isDone(d,e,r,ix){ if(r.task){ var t=st().tasks.find(function(x){return x.id===r.task;}); return t&&t.done; } return !!st().slotDone[slotKey(d,e,r,ix)]; }

function openSlot(dISO,id){
  var e=dayEvents(dISO).concat(timedTasks(dISO)).find(function(x){ return x.id===id; }); if(!e) return;
  var s=subj(e.sub), road=e.kind==="work"||e.anki||e.actu?roadFor(e,dISO):[];
  var h='<div class="band '+s.cls+'"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">'+fmtLong(dISO)+' · '+hLabel(e.s)+'–'+hLabel(e.e)+'</div><h2>'+esc(e.t)+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  if(e.taskId){ h+='<p class="muted" style="margin:0">Rendez-vous ajouté depuis la to-do. Rappel prévu '+(st().tasks.find(function(t){return t.id===e.taskId;})||{}).remind+' min avant.</p>'; }
  else if(e.kind==="course"){ h+='<p class="muted" style="margin:0">Cours. Horaire imposé : l\'app ne le déplace jamais.</p>'; }
  else if(e.kind==="exam"){ h+='<p class="muted" style="margin:0">Pale. Les révisions démarrent automatiquement à J-14 (réactivation, entraînement, consolidation).</p>'; }
  else if(!road.length){ h+='<p class="muted" style="margin:0">Routine fixe.</p>'; }
  else{
    var tot=road.filter(function(r){ return !r.pause; }), dn=tot.filter(function(r){ return isDone(dISO,e,r,road.indexOf(r)); }).length;
    h+='<div class="'+s.cls+'"><div class="row" style="justify-content:space-between;margin-bottom:6px"><span class="small muted">Feuille de route</span><span class="small" style="font-weight:700">'+dn+'/'+tot.length+'</span></div><div class="bar"><i style="width:'+(tot.length?Math.round(dn/tot.length*100):0)+'%"></i></div></div><div class="road">';
    var clock=toMin(e.s);
    road.forEach(function(r,ix){
      var dn1=isDone(dISO,e,r,ix), key=slotKey(dISO,e,r,ix);
      if(r.pause){ h+='<div class="road-it" style="background:var(--surface-2)"><span class="min">'+hLabel(fromMin(clock))+'</span><span class="lab muted">Pause '+r.min+' min · debout</span><span></span></div>'; clock+=r.min; return; }
      h+='<div class="road-it'+(dn1?" done":"")+'"><button class="check'+(dn1?" on":"")+'" data-a="road" data-k="'+esc(key)+'" data-task="'+(r.task||"")+'" aria-label="Cocher">'+(dn1?I.check:"")+'</button><div><div class="lab">'+esc(r.lab)+'</div><div class="sub">'+hLabel(fromMin(clock))+' · '+r.min+' min'+(r.filler?" · proposition":"")+(r.partial?" · suite plus tard":"")+'</div>'+(r.task&&!dn1?'<div class="partial" style="margin-top:6px"><span class="sub">Pas fini ?</span>'+[25,50,75].map(function(v){ return '<button class="chip" data-a="partial" data-task="'+r.task+'" data-v="'+v+'">'+v+' %</button>'; }).join("")+'</div>':'')+'</div>'+
        (dn1?'<span></span>':'<button class="timer'+(S.timers[key]?" run":"")+'" data-a="timer" data-k="'+esc(key)+'" data-task="'+(r.task||"")+'">'+(S.timers[key]?"0:00":"▶ "+r.min+"′")+'</button>')+'</div>';
      clock+=r.min;
    });
    h+='</div><p class="small muted" style="margin:0">Le chrono démarre quand tu commences une tâche et s\'arrête quand tu la coches : le temps réel nourrit le diagnostic.</p>';
  }
  h+='</div>';
  openSheet(h);
}

/* ---------- Matières ---------- */
function vMatieres(){
  var h=topbar("Matières")+'<h1 class="large-title">Matières</h1><p class="subtitle">Un espace par matière.</p><div class="grid g3">';
  SUBJECT_ORDER.forEach(function(id){
    var s=subj(id), n=st().tasks.filter(function(t){ return !t.done && t.sub===id; }).length;
    h+='<button class="subj '+s.cls+'" data-go="matiere" data-p="'+id+'"><span class="ic">'+esc(s.ic)+'</span><div><h3>'+s.name+'</h3><p>'+esc(s.blurb)+'</p></div><div class="foot"><span class="tag '+s.cls+'">'+plural(n,"tâche")+'</span></div></button>';
  });
  return h+'</div>';
}
function vMatiere(id){
  var s=subj(id), tasks=st().tasks.filter(function(t){ return !t.done && t.sub===id; });
  var h=topbar(s.name)+'<button class="link-btn" data-go="matieres" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Matières</button>';
  h+='<section class="hero-subj '+s.cls+'"><h1>'+s.name+'</h1><p>'+esc(s.blurb)+'</p></section><div class="stack" style="margin-top:14px">';
  if(id==="hgg"){
    h+='<a class="ext" href="https://claude.ai/artifact/TyMQ4dNtMg8XY5NeQqBuhZ" target="_blank" rel="noopener"><div><b>Atelier HGG</b><span class="small muted">Sur claude.ai : fiches, revue de presse, sujets, accroches.</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>';
    h+=modCard("Colles d'HGG","Une semaine sur deux (semaine du 5 octobre : HGG). Le thème est proposé d'après le calendrier de l'atelier ; tu confirmes.");
  }
  if(id==="csh"){
    h+='<a class="ext" href="https://claude.ai/artifact/TA1xcsk7H5jfrj7vcYsfwV" target="_blank" rel="noopener"><div><b>Atelier CSH</b><span class="small muted">'+"Œuvre du jour, parcours d'étude avec extraits vérifiés, références, duos, sous-thèmes, feuille blanche, Anki."+'</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>';
    h+='<section class="card"><div class="card-h"><h2>Sous-thèmes</h2><span class="small muted">18</span></div>'+["I","II","III"].map(function(part){ return '<div class="eyebrow" style="margin:8px 0 6px">'+({I:"I · Définir",II:"II · À l'épreuve",III:"III · Rayonnante"})[part]+'</div><div class="sous">'+SOUS_THEMES.filter(function(x){return x[0]===part;}).map(function(x){ return '<span class="chip">'+esc(x[1])+'</span>'; }).join("")+'</div>'; }).join("")+'</section>';
  }
  if(id==="maths"){
    h+='<div class="grid g2">'+modCard("Séance du jour","Plan minuté à l'exercice près. Chaque jour de maths, l'app te demande où en est le cours.")+modCard("Quiz de cours","15 min en début de séance, quatre boutons : Parfait, Correct, Hésitant, À revoir.")+modCard("Reprise espacée","Exercices « clé » seulement : J+3, J+10, J+30 depuis la dernière tentative.")+modCard("DM du lundi","Découpé sur jeudi, vendredi et dimanche. Incompressible.")+'</div>';
    h+='<div class="note-box">Pour remplir la banque d\'exercices, envoie à Claude le cours, les exercices d\'accompagnement, le TD (et celui de l\'autre classe) du chapitre en cours.</div>';
  }
  if(id==="ang"||id==="all"){
    h+='<a class="ext" href="https://drive.google.com/drive/folders/'+(id==="ang"?"1gB_5IFmCYKBvV6NEVnpvW_s4Af3p55eN":"17qWGaCZyhugv6wWramnWl_WTCE6nAE7S")+'" target="_blank" rel="noopener"><div><b>CIVI · '+(id==="ang"?"Nothing New on the English-Speaking Front":"CIVI")+'</b><span class="small muted">Ton document sur Drive. Il s\'affichera ici avec la même structure après conversion en Google Doc.</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>';
    h+=modCard("Revue de presse du dimanche",id==="ang"?"Entièrement en anglais, vocabulaire par article, envoi vers Anki.":"Titres en allemand avec traduction, chapeau en allemand, corps en français ; un ou deux articles entièrement en allemand avec leur vocabulaire.");
  }
  h+='<section class="card"><div class="card-h"><h2>Tâches</h2><span class="small muted">'+tasks.length+'</span></div><div class="tasks">'+taskRows(tasks)+'</div></section></div>';
  return h;
}
function modCard(t,d){ return '<section class="card"><div class="card-h"><h2>'+esc(t)+'</h2><span class="small faint">bientôt</span></div><p class="muted small" style="margin:0">'+esc(d)+'</p></section>'; }

/* ---------- Échéances ---------- */
function vEcheances(){
  var t=iso(today()), m=S.echMode;
  var h=topbar("Échéances")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Échéances</h1><div class="seg"><button class="'+(m==="dst"?"on":"")+'" data-a="echmode" data-m="dst">DST</button><button class="'+(m==="colles"?"on":"")+'" data-a="echmode" data-m="colles">Colles</button></div></div>';
  if(m==="dst"){
    var fut=PALES.filter(function(p){ return p.date>=t; }), past=PALES.filter(function(p){ return p.date<t; });
    h+='<section class="card">'+fut.map(function(p){ return echRow(p,t); }).join("")+'</section>';
    if(past.length) h+='<section class="card" style="margin-top:14px"><div class="group-h">Passées</div>'+past.map(function(p){ return echRow(p,t,true); }).join("")+'</section>';
  } else {
    var w=mondayOf(today()), ref=parseISO("2026-10-05"), k=Math.round((w-ref)/(7*864e5));
    h+='<section class="card"><div class="card-h"><h2>Planning de colles</h2></div><div class="empty"><b>BJcolle n\'est pas encore branché</b>Dès la connexion, tes colles s\'afficheront ici, seront bloquées dans l\'agenda (10 min avant la préparation) et tu seras prévenu à chaque changement.</div></section>';
    h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Alternance maths / HGG</h2></div>'+[0,1,2,3].map(function(i){ var ws=addDays(w,7*i), hgg=((k+i)%2+2)%2===0; return '<div class="ech"><div class="d '+(hgg?"s-hgg":"s-maths")+'"><b>'+ws.getDate()+'</b><small>'+MON_S[ws.getMonth()]+'</small></div><div class="w">Semaine du '+ws.getDate()+' '+MONTHS[ws.getMonth()]+'</div><span class="tag '+(hgg?"s-hgg":"s-maths")+'">Colle '+(hgg?"d'HGG":"de maths")+'</span></div>'; }).join("")+'</section>';
  }
  return h;
}
function echRow(p,t,past){
  var n=diffDays(p.date,t), d=parseISO(p.date), s=subj(p.sub);
  return '<div class="ech'+(past?" off":"")+'"><div class="d '+s.cls+'"><b>'+d.getDate()+'</b><small>'+MON_S[d.getMonth()]+'</small></div><div><div class="w">'+esc(p.t)+'</div><div class="small muted">'+DAYS[d.getDay()]+' · '+hLabel(p.s)+'–'+hLabel(p.e)+'</div></div><span class="cd'+(!past&&n<=7?" soon":"")+'">'+(past?"passée":n===0?"aujourd'hui":"J-"+n)+'</span></div>';
}

/* ---------- Notes ---------- */
function notesOf(id){ return st().notes.filter(function(n){ return n.ep===id; }).sort(function(a,b){ return a.date.localeCompare(b.date); }); }
function avg(list){ if(!list.length) return null; return list.reduce(function(a,n){ return a+n.v; },0)/list.length; }
function f1(x){ return x==null?"–":(Math.round(x*10)/10).toFixed(1).replace(".",","); }
function spark(list,col){
  if(list.length<2) return '<svg viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="38" x2="100" y2="38" stroke="var(--line-strong)" stroke-dasharray="3 3"/></svg>';
  var lo=Math.min.apply(null,list.map(function(n){return n.v;}))-1, hi=Math.max.apply(null,list.map(function(n){return n.v;}))+1;
  var pts=list.map(function(n,i){ return [i/(list.length-1)*96+2, 38-(n.v-lo)/(hi-lo)*32]; });
  var d=pts.map(function(p,i){ return (i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1); }).join(" ");
  var last=pts[pts.length-1];
  return '<svg viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true"><path d="'+d+' L98 42 L2 42 Z" fill="'+col+'" opacity=".12"/><path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="2.6" fill="'+col+'"/></svg>';
}
function vNotes(){
  var m=S.notesMode, eps=EPREUVES[m];
  var h=topbar("Notes")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Notes</h1><div class="seg"><button class="'+(m==="ecrit"?"on":"")+'" data-a="notesmode" data-m="ecrit">Écrit</button><button class="'+(m==="oral"?"on":"")+'" data-a="notesmode" data-m="oral">Oral</button></div></div>';
  var num=0, den=0; eps.forEach(function(e){ var a=avg(notesOf(e.id)); if(a!=null && e.coef){ num+=a*e.coef; den+=e.coef; } });
  var g=den?num/den:null;
  h+='<section class="card overall"><div><div class="eyebrow">Moyenne pondérée · coefficients HEC ('+(m==="ecrit"?"écrits /30":"oraux /36")+')</div><div class="big tab">'+f1(g)+'<small style="font-size:18px;color:var(--ink-3)"> /20</small></div></div><div style="text-align:right"><div class="eyebrow">Barre d\'admissibilité HEC 2026</div><div style="font-weight:800;font-size:22px;color:var(--red)" class="tab">15,29</div>'+(g!=null?'<div class="small '+(g>=BARRE_HEC?"":"muted")+'">'+(g>=BARRE_HEC?"Au-dessus de la barre":"Écart : "+f1(BARRE_HEC-g)+" pt")+'</div>':'')+'</div></section>';
  h+='<div class="row" style="justify-content:space-between;margin:16px 0 10px"><span class="small muted">'+(m==="ecrit"?"Depuis le début de la 1re année":"Depuis le début de la 2e année · colles importées de BJcolle")+'</span><button class="btn primary sm" data-a="addnote">'+I.plus+' Ajouter une note</button></div>';
  h+='<div class="grid g3">';
  eps.forEach(function(e){
    var ns=notesOf(e.id), a=avg(ns), s=subj(e.sub), last=ns.length?ns[ns.length-1].v:null;
    var tr=ns.length>=2?(ns[ns.length-1].v>=avg(ns.slice(0,-1))?"↗":"↘"):"";
    h+='<button class="tile '+s.cls+'" data-a="notedetail" data-id="'+e.id+'"><div class="top"><span class="name">'+esc(e.name)+'</span><span class="coef">coef. '+(e.coefTxt||e.coef)+'</span></div><div class="avg tab">'+f1(a)+'<small> '+tr+'</small></div>'+spark(ns,"var(--si)")+'<div class="small muted">'+(ns.length?plural(ns.length,"note")+" · dernière "+f1(last):"Aucune note")+'</div></button>';
  });
  h+='</div>';
  return h;
}
function noteDetail(id){
  var e=EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){ return x.id===id; }), s=subj(e.sub), ns=notesOf(id), a=avg(ns), last=ns.length?ns[ns.length-1].v:null, goal=st().goals[id];
  function pos(v){ return (v/20*100)+"%"; }
  var marks=[];
  if(a!=null) marks.push('<span class="mk avg" style="left:'+pos(a)+'"><span>moy. '+f1(a)+'</span><i></i></span>');
  if(last!=null) marks.push('<span class="mk last up" style="left:'+pos(last)+'"><span>dernière '+f1(last)+'</span><i></i></span>');
  marks.push('<span class="mk bar up" style="left:'+pos(BARRE_HEC)+'"><span>barre HEC</span><i></i></span>');
  if(goal!=null) marks.push('<span class="mk goal" style="left:'+pos(goal)+'"><span>objectif '+f1(goal)+'</span><i></i></span>');
  var h='<div class="band '+s.cls+'"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">'+(id.charAt(0)==="e"?"Écrit":"Oral")+' · coef. '+(e.coefTxt||e.coef)+'</div><h2>'+esc(e.name)+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b '+s.cls+'">';
  h+='<section class="card flat"><div class="eyebrow">Objectifs</div><div class="ruler"><div class="track"></div>'+[0,5,10,15,20].map(function(v){ return '<span class="tick" style="left:'+pos(v)+'">'+v+'</span>'; }).join("")+marks.join("")+'</div>';
  h+='<label class="lbl" for="goal-range" style="margin-top:14px">Ton objectif : <b id="goal-val">'+(goal!=null?f1(goal):"à placer")+'</b></label><input id="goal-range" type="range" min="8" max="20" step="0.5" value="'+(goal!=null?goal:16)+'" data-goal="'+id+'" style="width:100%"></section>';
  h+='<section class="card flat"><div class="card-h"><h2>Notes</h2><button class="btn sm tint" data-a="addnote" data-ep="'+id+'">'+I.plus+' Ajouter</button></div>';
  h+=ns.length?'<div class="notes-list">'+ns.slice().reverse().map(function(n){ return '<div class="it"><div><div style="font-weight:600">'+esc(n.label||e.name)+(n.type?' · '+esc(n.type):'')+'</div><div class="small muted">'+fmtDay(n.date)+(n.com?' · '+esc(n.com):'')+'</div></div><div class="row"><span class="v">'+f1(n.v)+'</span><button class="del icon-btn" style="width:30px;height:30px;opacity:1" data-a="delnote" data-id="'+n.id+'" data-ep="'+id+'" aria-label="Supprimer la note">'+I.trash+'</button></div></div>'; }).join("")+'</div>':'<div class="empty">Aucune note pour l\'instant.</div>';
  h+='</section></div>';
  openSheet(h);
}
function addNoteSheet(ep){
  var all=EPREUVES.ecrit.map(function(e){return ["Écrit",e];}).concat(EPREUVES.oral.map(function(e){return ["Oral",e];}));
  var h='<div class="sheet-h"><div class="ttl"><h2>Nouvelle note</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><form class="sheet-b" id="note-form">';
  h+='<div><label class="lbl" for="n-ep">Épreuve</label><select class="field" id="n-ep">'+all.map(function(x){ return '<option value="'+x[1].id+'"'+(x[1].id===(ep||(S.notesMode==="ecrit"?"e-maths":"o-maths"))?" selected":"")+'>'+x[0]+' · '+esc(x[1].name)+'</option>'; }).join("")+'</select></div>';
  h+='<div id="n-type-wrap"></div><div class="grid" style="grid-template-columns:1fr 1fr;gap:10px"><div><label class="lbl" for="n-v">Note /20</label><input class="field tab" id="n-v" inputmode="decimal" placeholder="13,5" required></div><div><label class="lbl" for="n-date">Date</label><input class="field" id="n-date" type="date" value="'+iso(today())+'" required></div></div>';
  h+='<div><label class="lbl" for="n-label">Intitulé (facultatif)</label><input class="field" id="n-label" placeholder="DST n°3, colle de M. X…"></div><div><label class="lbl" for="n-com">Commentaire (facultatif)</label><input class="field" id="n-com"></div>';
  h+='<button class="btn primary" type="submit">Enregistrer</button></form>';
  openSheet(h);
  var sel=document.getElementById("n-ep"), wrap=document.getElementById("n-type-wrap");
  function types(){ var e=EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){return x.id===sel.value;}); wrap.innerHTML=e&&e.types?'<label class="lbl" for="n-type">Type d\'exercice</label><select class="field" id="n-type">'+e.types.map(function(t){return '<option>'+t+'</option>';}).join("")+'</select>':''; }
  sel.onchange=types; types();
  document.getElementById("note-form").addEventListener("submit",function(ev){
    ev.preventDefault();
    var v=parseFloat(String(document.getElementById("n-v").value).replace(",","."));
    if(isNaN(v)||v<0||v>20){ toast("Entre une note entre 0 et 20."); return; }
    var ty=document.getElementById("n-type");
    st().notes.push({id:uid("n"),ep:sel.value,v:v,date:document.getElementById("n-date").value,label:document.getElementById("n-label").value.trim(),com:document.getElementById("n-com").value.trim(),type:ty?ty.value:null});
    save(); closeSheet(); S.notesMode=sel.value.charAt(0)==="e"?"ecrit":"oral"; if(S.view==="notes") render(); toast("Note enregistrée.");
  });
}

/* ---------- Méthodo ---------- */
function vMethodo(){
  var m=S.methMode, eps=EPREUVES[m];
  var h=topbar("Méthodo")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Méthodo</h1><div class="seg"><button class="'+(m==="ecrit"?"on":"")+'" data-a="methmode" data-m="ecrit">Écrit</button><button class="'+(m==="oral"?"on":"")+'" data-a="methmode" data-m="oral">Oral</button></div></div><p class="subtitle">À parcourir avant chaque échéance pour se remettre dans le bain.</p><div class="grid g3">';
  eps.forEach(function(e){ var s=subj(e.sub), r=(st().ressentis[e.id]||[]).length; h+='<button class="subj '+s.cls+'" style="min-height:120px" data-a="methode" data-id="'+e.id+'"><div class="row" style="justify-content:space-between"><h3>'+esc(e.name)+'</h3><span class="tag '+s.cls+'">coef. '+(e.coefTxt||e.coef)+'</span></div><p>'+(r?plural(r,"ressenti"):"Méthode, avant l'épreuve, ressenti, conseils des profs")+'</p></button>'; });
  return h+'</div>';
}
function methodeSheet(id){
  var e=EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){ return x.id===id; }), s=subj(e.sub), rs=st().ressentis[id]||[];
  var h='<div class="band '+s.cls+'"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">'+(id.charAt(0)==="e"?"Écrit":"Oral")+' · coef. '+(e.coefTxt||e.coef)+'</div><h2>'+esc(e.name)+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  h+='<section class="card flat"><div class="eyebrow">Méthode</div><p class="small muted" style="margin:6px 0 0">La synthèse complète de tes documents de méthodologie Drive sera rédigée ici (étape 11). Indique-moi le dossier qui les contient.</p></section>';
  h+='<section class="card flat"><div class="eyebrow">Avant l\'épreuve</div><p class="small muted" style="margin:6px 0 0">Les cinq points essentiels, à relire en deux minutes.</p></section>';
  h+='<section class="card flat"><div class="eyebrow">Mon ressenti</div><form id="res-form" style="margin-top:8px" class="stack"><textarea class="field" id="res-txt" placeholder="Ce qui a bloqué, la sensation, ce qui n\'a pas marché…"></textarea><button class="btn tint sm" type="submit" style="align-self:flex-start">Enregistrer</button></form>'+(rs.length?'<div class="notes-list" style="margin-top:8px">'+rs.slice().reverse().map(function(r){ return '<div class="it" style="display:block"><div class="small muted">'+fmtDay(r.date)+'</div><div style="white-space:pre-wrap">'+esc(r.t)+'</div></div>'; }).join("")+'</div>':'')+'</section>';
  h+='<section class="card flat"><div class="eyebrow">Conseils des profs</div><p class="small muted" style="margin:6px 0 0">'+(id.charAt(0)==="o"?"Récupérés mot pour mot dans les commentaires BJcolle (méthode uniquement), dès que BJcolle sera branché.":"Saisis-les toi-même ou envoie la photo des commentaires de ta copie.")+'</p></section></div>';
  openSheet(h);
  document.getElementById("res-form").addEventListener("submit",function(ev){ ev.preventDefault(); var v=document.getElementById("res-txt").value.trim(); if(!v) return; (st().ressentis[id]=st().ressentis[id]||[]).push({date:iso(today()),t:v}); save(); methodeSheet(id); toast("Ressenti enregistré."); });
}

/* ---------- Plus (téléphone) ---------- */
function vPlus(){
  var h=topbar("Plus")+'<h1 class="large-title">Plus</h1><p class="subtitle">Le reste de l\'app.</p><div class="stack">';
  [["todo","To-Do","Toutes tes tâches",I.list],["echeances","Échéances","DST, colles, BJcolle",I.flag],["notes","Notes","Moyennes, évolution, objectifs",I.chart],["methodo","Méthodo","Méthode par épreuve, ressentis, conseils",I.book]].forEach(function(x){
    h+='<button class="ext" data-go="'+x[0]+'" style="border:0;text-align:left"><div class="row" style="gap:14px;flex-wrap:nowrap"><span class="icon-btn" style="color:var(--blue)">'+x[3]+'</span><div><b>'+x[1]+'</b><span class="small muted">'+x[2]+'</span></div></div>'+I.right+'</button>';
  });
  return h+'</div>';
}

/* ---------- fenêtres ---------- */
function openSheet(html){
  layer.innerHTML='<div class="scrim" data-a="close"></div><div class="sheet" role="dialog" aria-modal="true">'+html+'</div>';
  var f=layer.querySelector(".sheet input:not([type=range]),.sheet button"); if(f && window.innerWidth>=600) try{ f.focus({preventScroll:true}); }catch(e){}
}
function closeSheet(){ layer.innerHTML=""; S.timers={}; }
function quickSheet(){
  openSheet('<div class="sheet-h"><div class="ttl"><h2>Nouvelle tâche</h2><div class="small muted">Écris naturellement : date, « pour », « ! », mots-clés réf, ex, civi, DM…</div></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">'+quickBox("sheet")+'</div>');
  bindQuick(); var i=document.getElementById("q-sheet"); if(i) i.focus();
}
var chat=[];
function pageContext(){
  var t=iso(today()), parts=["Page : "+S.view+(S.param?" ("+subj(S.param).name+")":""),"Date : "+fmtLong(t)];
  var ev=dayEvents(t).filter(function(e){ return e.kind!=="fixed"; }).map(function(e){ return hLabel(e.s)+"-"+hLabel(e.e)+" "+e.t; });
  parts.push("Programme du jour : "+ev.join(" ; "));
  var tasks=st().tasks.filter(function(x){ return !x.done && (!S.param || x.sub===S.param); }).slice(0,15).map(function(x){ return x.title+" ["+subj(x.sub).name+(x.due?", pour le "+x.due:"")+(x.prio?", priorité "+x.prio:"")+"]"; });
  parts.push("Tâches ouvertes : "+(tasks.join(" ; ")||"aucune"));
  var p=upcomingPales(3).map(function(x){ return x.date+" "+x.t; }); parts.push("Prochains DST : "+p.join(" ; "));
  if(S.view==="matiere"&&S.param==="csh") parts.push("Thème de CSH de l'année : L'humanité.");
  return parts.join("\n");
}
function fmtMsg(t){ return esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/^\s*[-*] /gm,"• "); }
function geminiSheet(){
  var u=typeof Sync!=="undefined"&&Sync.user();
  var h='<div class="sheet-h"><div class="ttl"><div class="eyebrow" style="color:var(--blue)">Assistant · '+esc(S.view==="matiere"?subj(S.param).name:({home:"Accueil",agenda:"Agenda",todo:"To-Do",matieres:"Matières",echeances:"Échéances",notes:"Notes",methodo:"Méthodo",plus:"Plus"})[S.view]||"")+'</div><h2>Demander à Gemini</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b" id="chat-log">';
  if(!u) h+='<div class="gem-msg">Connecte-toi (bouton en haut à droite) pour utiliser l\'assistant.</div>';
  else if(!chat.length) h+='<div class="gem-msg small muted">Pose une question ou une petite demande. Gemini connaît la page ouverte, ton programme du jour, tes tâches et tes prochains DST. Il peut se tromper : vérifie toujours une citation ou un chiffre.</div>';
  chat.forEach(function(m){ h+='<div class="msg '+(m.role==="user"?"u":"a")+'">'+fmtMsg(m.text)+'</div>'; });
  h+='</div><form class="quick" id="chat-form" style="margin:0 18px 18px"><input id="chat-in" autocomplete="off" placeholder="Pose ta question…" aria-label="Question"'+(u?'':' disabled')+'><button class="go" type="submit"'+(u?'':' disabled')+' aria-label="Envoyer">'+I.send+'</button></form>';
  openSheet(h);
  var log=document.getElementById("chat-log"); log.scrollTop=log.scrollHeight;
  var f=document.getElementById("chat-form"), inp=document.getElementById("chat-in");
  if(u && window.innerWidth>=600) inp.focus();
  f.addEventListener("submit",function(ev){
    ev.preventDefault(); var q=inp.value.trim(); if(!q||!u) return;
    chat.push({role:"user",text:q}); chat.push({role:"assistant",text:"…",pending:true}); geminiSheet();
    Sync.invoke({mode:"chat",context:pageContext(),messages:chat.filter(function(m){ return !m.pending; })}).then(function(r){
      chat.pop(); chat.push({role:"assistant",text:r.text||"(pas de réponse)"}); if(document.getElementById("chat-log")) geminiSheet();
    },function(e){ chat.pop(); chat.push({role:"assistant",text:"Gemini n'a pas répondu ("+e.message+")."}); if(document.getElementById("chat-log")) geminiSheet(); });
  });
}

/* ---------- actualité du jour (Gemini + recherche Google) ---------- */
var newsLoading=false, newsErr=null;
function newsHTML(){
  var n=st().news, t=iso(today());
  var h='<div class="card-h"><h2>Actualité internationale</h2>'+(n&&n.date===t?'<span class="small faint">Gemini</span>':'')+'</div>';
  if(n && n.date===t && n.titre){
    h+='<div style="font-weight:700;font-size:16px;line-height:1.3;margin-bottom:6px">'+esc(n.titre)+'</div><p class="muted" style="margin:0 0 8px">'+esc(n.resume)+'</p>';
    if(n.sources&&n.sources.length) h+='<div class="row" style="gap:6px">'+n.sources.map(function(x){ return '<a class="chip" href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.title||"Source")+' '+I.arrow+'</a>'; }).join("")+'</div>';
    return h;
  }
  if(typeof Sync==="undefined"||!Sync.user()) return h+'<p class="news-empty muted" style="margin:0">Connecte-toi (bouton en haut à droite) pour recevoir chaque jour la nouvelle la plus importante, résumée en trois lignes.</p>';
  if(newsErr) return h+'<p class="news-empty muted" style="margin:0">Actualité indisponible pour le moment.</p><p class="small faint" style="margin:4px 0 0;overflow-wrap:anywhere">Détail : '+esc(newsErr)+'</p><button class="link-btn" data-a="news-retry" style="margin-top:6px">Réessayer</button>';
  return h+'<div class="stack" style="gap:8px"><div class="skel"></div><div class="skel" style="width:80%"></div><div class="skel" style="width:60%"></div></div>';
}
function loadNews(force){
  var n=st().news, t=iso(today());
  if(newsLoading || typeof Sync==="undefined" || !Sync.user()) return;
  if(!force && n && n.date===t) return;
  var lastFail=0; try{ lastFail=+localStorage.getItem("prepa.newsFail")||0; }catch(e){}
  if(!force && Date.now()-lastFail<3600e3){ newsErr=newsErr||"Nouvel essai automatique dans moins d'une heure."; var c0=document.getElementById("news-card"); if(c0) c0.innerHTML=newsHTML(); return; }
  newsLoading=true; newsErr=null;
  Sync.invoke({mode:"news",date:fmtLong(t)+" "+parseISO(t).getFullYear()}).then(function(r){
    newsLoading=false; st().news={date:t,titre:r.titre,resume:r.resume,sources:r.sources||[]}; save();
    var c=document.getElementById("news-card"); if(c) c.innerHTML=newsHTML();
  },function(e){ newsLoading=false; newsErr=e.message; try{ localStorage.setItem("prepa.newsFail",String(Date.now())); }catch(x){} var c=document.getElementById("news-card"); if(c) c.innerHTML=newsHTML(); });
}

/* ---------- compte et synchronisation ---------- */
function syncLabel(){
  var stt=typeof Sync!=="undefined"?Sync.status():"local";
  var m={synced:["ok","Synchronisé"],syncing:["run","Synchro…"],offline:["warn","Hors ligne"],signedout:["off","Se connecter"],local:["off","Sur cet appareil"]}[stt]||["off",""];
  return '<span class="sd '+m[0]+'"></span>'+m[1];
}
function accountSheet(msg){
  var u=Sync.user(), h='<div class="sheet-h"><div class="ttl"><div class="eyebrow">Compte</div><h2>Synchronisation</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  if(!Sync.available()){
    h+='<div class="gem-msg">La synchronisation fonctionne dans l\'app installée, à l\'adresse alexandrenkvanrossum-ship-it.github.io/pr-pa. Ici, tes données restent sur cet appareil.</div>';
  } else if(u){
    h+='<div class="gem-msg"><b>'+esc(u.email)+'</b><div class="small muted" style="margin-top:4px">Tes tâches, notes, objectifs et ressentis sont synchronisés entre tes appareils.</div></div>';
    h+='<div class="row"><button class="btn tint" data-a="syncnow">Synchroniser maintenant</button><button class="btn" data-a="signout">Se déconnecter</button></div>';
  } else {
    h+='<p class="muted small" style="margin:0">Connecte-toi avec le même compte sur ton téléphone et ton ordi pour retrouver partout les mêmes données.</p>';
    h+='<form id="auth-form" class="stack" style="gap:10px"><div><label class="lbl" for="au-mail">E-mail</label><input class="field" id="au-mail" type="email" autocomplete="email" required></div><div><label class="lbl" for="au-pw">Mot de passe (8 caractères minimum)</label><input class="field" id="au-pw" type="password" minlength="8" autocomplete="current-password" required></div>'+
       '<div class="row"><button class="btn primary" type="submit" data-mode="in">Se connecter</button><button class="btn tint" type="submit" data-mode="up">Créer mon compte</button></div></form>';
  }
  if(msg) h+='<div class="note-box">'+esc(msg)+'</div>';
  h+='</div>';
  openSheet(h);
  var f=document.getElementById("auth-form");
  if(f){ var mode="in"; f.querySelectorAll("button[data-mode]").forEach(function(b){ b.addEventListener("click",function(){ mode=b.getAttribute("data-mode"); }); });
    f.addEventListener("submit",function(ev){ ev.preventDefault();
      var em=document.getElementById("au-mail").value.trim(), pw=document.getElementById("au-pw").value;
      (mode==="up"?Sync.signUp(em,pw):Sync.signIn(em,pw)).then(function(r){
        if(r.error){ accountSheet(r.error.message==="Invalid login credentials"?"E-mail ou mot de passe incorrect.":r.error.message); return; }
        if(mode==="up" && !(r.data&&r.data.session)){ accountSheet("Compte créé. Ouvre l'e-mail de confirmation reçu, puis reviens te connecter ici."); return; }
        closeSheet(); render(); toast("Connecté. Synchronisation en cours.");
      });
    });
  }
}

/* ---------- chronos ---------- */
var tickH=null;
function tickTimers(){
  if(tickH) clearInterval(tickH);
  tickH=setInterval(function(){
    document.querySelectorAll(".timer.run").forEach(function(b){ var k=b.getAttribute("data-k"), t0=S.timers[k]; if(!t0) return; var s=Math.floor((Date.now()-t0)/1000); b.textContent=Math.floor(s/60)+":"+pad(s%60); });
  },1000);
}

/* ---------- actions ---------- */
document.addEventListener("click",function(ev){
  var g=ev.target.closest("[data-go]"); if(g){ ev.preventDefault(); closeSheet(); go(g.getAttribute("data-go"),g.getAttribute("data-p")); return; }
  var b=ev.target.closest("[data-a]"); if(!b) return;
  var a=b.getAttribute("data-a"), s=st();
  if(a==="close"){ closeSheet(); render(); return; }
  if(a==="quick"){ quickSheet(); return; }
  if(a==="gemini"){ geminiSheet(); return; }
  if(a==="account"){ accountSheet(); return; }
  if(a==="news-retry"){ newsErr=null; var c=document.getElementById("news-card"); if(c) c.innerHTML=newsHTML(); loadNews(true); return; }
  if(a==="syncnow"){ Sync.syncNow().then(function(){ toast("Synchronisé."); }); return; }
  if(a==="signout"){ Sync.signOut().then(function(){ closeSheet(); render(); toast("Déconnecté. Tes données restent sur cet appareil."); }); return; }
  if(a==="toggle"){ var t=s.tasks.find(function(x){return x.id===b.getAttribute("data-id");}); if(t){ t.done=!t.done; t.doneAt=t.done?new Date().toISOString():null; save(); render(); } return; }
  if(a==="del"){ s.tasks=s.tasks.filter(function(x){return x.id!==b.getAttribute("data-id");}); save(); render(); toast("Tâche supprimée."); return; }
  if(a==="tfilter"){ S.todoFilter=b.getAttribute("data-f"); render(); return; }
  if(a==="csh-skip"){ s.cshSkip=(s.cshSkip||0)+1; save(); render(); return; }
  if(a==="agmode"){ S.agMode=b.getAttribute("data-m"); render(); return; }
  if(a==="agstep"){ S.agDate=iso(addDays(parseISO(S.agDate),+b.getAttribute("data-n"))); render(); return; }
  if(a==="agtoday"){ S.agDate=iso(today()); render(); return; }
  if(a==="agday"){ S.agDate=b.getAttribute("data-d"); render(); return; }
  if(a==="slot"){ openSlot(b.getAttribute("data-d"),b.getAttribute("data-id")); return; }
  if(a==="road"||a==="timer"||a==="partial"){
    var cur=layer.querySelector(".sheet"); var reopen=cur?cur.innerHTML:"";
    var tid=b.getAttribute("data-task"), k=b.getAttribute("data-k");
    if(a==="road"){
      if(tid){ var tk=s.tasks.find(function(x){return x.id===tid;}); if(tk){ tk.done=!tk.done; if(S.timers[k]){ tk.spent=(tk.spent||0)+Math.round((Date.now()-S.timers[k])/60000); delete S.timers[k]; } } }
      else { s.slotDone[k]=!s.slotDone[k]; delete S.timers[k]; }
      save();
    } else if(a==="timer"){ if(S.timers[k]) delete S.timers[k]; else S.timers[k]=Date.now(); }
    else { var tp=s.tasks.find(function(x){return x.id===tid;}); if(tp){ tp.progress=+b.getAttribute("data-v"); save(); toast("Noté : "+tp.progress+" % fait. Le reste sera replanifié."); } }
    var keep=S.timers; var m=reopen.match(/data-d="([^"]+)" data-id/) ;
    var last=layer.getAttribute("data-slot"); if(last){ var p=last.split("§"); openSlot(p[0],p[1]); S.timers=keep; tickTimers(); var sh=layer.querySelector(".sheet"); if(sh) sh.style.animation="none"; }
    return;
  }
  if(a==="echmode"){ S.echMode=b.getAttribute("data-m"); render(); return; }
  if(a==="notesmode"){ S.notesMode=b.getAttribute("data-m"); render(); return; }
  if(a==="methmode"){ S.methMode=b.getAttribute("data-m"); render(); return; }
  if(a==="notedetail"){ noteDetail(b.getAttribute("data-id")); return; }
  if(a==="addnote"){ addNoteSheet(b.getAttribute("data-ep")); return; }
  if(a==="delnote"){ s.notes=s.notes.filter(function(n){return n.id!==b.getAttribute("data-id");}); save(); noteDetail(b.getAttribute("data-ep")); render(); return; }
  if(a==="methode"){ methodeSheet(b.getAttribute("data-id")); return; }
});
document.addEventListener("input",function(ev){
  var r=ev.target.closest("[data-goal]"); if(!r) return;
  st().goals[r.getAttribute("data-goal")]=+r.value; save();
  var v=document.getElementById("goal-val"); if(v) v.textContent=f1(+r.value);
});
document.addEventListener("change",function(ev){ var r=ev.target.closest("[data-goal]"); if(r){ noteDetail(r.getAttribute("data-goal")); render(); } });
document.addEventListener("keydown",function(ev){ if(ev.key==="Escape" && layer.innerHTML){ closeSheet(); render(); } });
window.addEventListener("scroll",function(){ var tb=document.getElementById("topbar"); if(tb) tb.classList.toggle("scrolled",window.scrollY>40); },{passive:true});

/* mémorise le créneau ouvert pour pouvoir le rafraîchir */
var _openSlot=openSlot;
openSlot=function(d,id){ _openSlot(d,id); layer.setAttribute("data-slot",d+"§"+id); };
var _close=closeSheet;
closeSheet=function(){ _close(); layer.removeAttribute("data-slot"); };

/* ---------- démarrage ---------- */
function start(){
  shell(); seed();
  window.__prepaRefresh=function(){ var a=document.activeElement; if(layer.innerHTML || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) return; render(); };
  if(typeof Sync!=="undefined"){ Sync.on(function(){ var p=document.getElementById("sync-pill"); if(p) p.innerHTML=syncLabel(); }); Sync.init(); }
  var h=(location.hash||"").replace("#",""); if(h){ var p=h.split("-"); if(["home","agenda","todo","matieres","matiere","echeances","notes","methodo","plus"].indexOf(p[0])>=0){ S.view=p[0]; S.param=p[1]||null; } }
  render();
  if("serviceWorker" in navigator && location.protocol==="https:" && !window.claude){ try{ navigator.serviceWorker.register("sw.js").catch(function(){}); }catch(e){} }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();
