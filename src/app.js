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
function toast(m){ document.querySelectorAll(".toast").forEach(function(t){ t.remove(); }); var el=document.createElement("div"); el.className="toast"; el.setAttribute("role","status"); el.textContent=m; document.body.appendChild(el); setTimeout(function(){ el.classList.add("out"); setTimeout(function(){ el.remove(); },260); },2600); }
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
  return {id:uid("t"),title:p.title,sub:p.sub||"perso",type:p.type,dur:p.dur,due:p.due,day:p.day,time:p.time,remind:p.remind,prio:p.prio,action:p.action,devoir:!!p.devoir,memo:!!p.memo,vac:!!p.vac,done:false,created:new Date().toISOString(),progress:0,spent:0};
}

/* ---------- coquille ---------- */
var GRANGE_IC='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4" width="4.5" height="16" rx="1"/><rect x="9.5" y="4" width="4.5" height="16" rx="1"/><path d="M16 5.2l3.3-.9 3.2 15.2-3.3.8z"/></svg>';
var NAV=[["home","Accueil",I.home],["agenda","Agenda",I.cal],["todo","To-Do",I.list],["matieres","Matières",I.grid],["echeances","Échéances",I.flag],["notes","Objectifs",I.chart],["grange","Grange",GRANGE_IC],["methodo","Méthodo",I.book]];
function shell(){
  document.getElementById("root").innerHTML=
   '<div class="shell">'+
   '<aside class="side" aria-label="Navigation"><div class="brand">Prépa<span>ECG2 · 2026–2027</span></div>'+'<div class="navs">'+
   NAV.map(function(n){ return '<button class="nav" data-go="'+n[0]+'">'+n[2]+'<span>'+n[1]+'</span></button>'+(n[0]==="matieres"?SUBJECT_ORDER.map(function(id){ var s=subj(id); return '<button class="nav" data-go="matiere" data-p="'+id+'" style="padding-left:18px"><span class="dot" style="background:var(--'+id+'-ink)"></span><span>'+s.name+'</span></button>'; }).join(""):""); }).join("")+
   '</div><button class="add-side" data-a="quick">'+I.plus+' Nouvelle tâche</button></aside>'+
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
    if(["echeances","notes","methodo","todo","bjclasse","bjcolleurs","bjcolleur","grange"].indexOf(S.view)>=0 && b.closest(".tabbar") && b.getAttribute("data-go")==="plus") on=true;
    b.classList.toggle("on",on);
  });
}
function topbar(title){
  return '<div class="topbar" id="topbar"><span class="t-title">'+esc(title)+'</span><span class="sp"></span>'+
    '<button class="sync-pill" data-a="account" id="sync-pill" aria-label="Compte et synchronisation">'+syncLabel()+'</button>'+
    '<button class="icon-btn gem-btn" data-a="gemini" aria-label="Demander à Gemini" title="Demander à Gemini">'+I.spark+'</button></div>';
}
function go(v,p){ S.view=v; S.param=p||null; render(); window.scrollTo(0,0); try{ history.replaceState(null,"","#"+v+(p?"-"+encodeURIComponent(p):"")); }catch(e){} }

function render(){
  if(typeof migrateLangNotes==="function") migrateLangNotes();
  var html="";
  switch(S.view){
    case "agenda": html=vAgenda(); break;
    case "todo": html=vTodo(); break;
    case "matieres": html=vMatieres(); break;
    case "matiere": html=vMatiere(S.param); break;
    case "echeances": html=vEcheances(); break;
    case "bjclasse": html=vBjClasse(); break;
    case "bjcolleurs": html=vBjColleurs(); break;
    case "bjcolleur": html=vBjColleur(S.param); break;
    case "notes": html=vObjectifs(); break;
    case "annales": S.view="matiere"; S.param="maths"; setMTab("grange"); html=vMatiere("maths"); break;
    case "colles": html=vColles(); break;
    case "methodo": html=vMethodo(); break;
    case "plus": html=vPlus(); break;
    case "grange": html=vGrange(); break;
    default: html=vHome();
  }
  var key=S.view+"|"+(S.param||""), nav=key!==lastViewKey; lastViewKey=key;
  if(!nav && window.morphdom && app.firstChild){ morphTo(app,'<div class="inner">'+html+'</div>'); }
  else { S.navigating=true; app.innerHTML='<div class="inner page-enter">'+html+'</div>'; S.navigating=false; }
  setActive(); bindQuick(); bindUpload(); tickTimers();
}
/* ---------- rendu par différence : seuls les éléments modifiés changent (pas de clignotement, défilement et saisie conservés) ---------- */
var lastViewKey=null, ENTER_SEL=".task,.road-it,.due,.ech,.it,.nstat,.slot";
function morphTo(root,html,opts){
  opts=opts||{};
  var tpl=document.createElement(root.tagName); tpl.innerHTML=html;
  var added=0;
  window.morphdom(root,tpl,{childrenOnly:true,
    getNodeKey:function(n){ return n.id || (n.getAttribute && n.getAttribute("data-key")) || undefined; },
    onBeforeElUpdated:function(from,to){
      if(from.isEqualNode(to)) return false;
      if(from===document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(from.tagName)) return false;
      if(from.tagName==="DETAILS" && !to.hasAttribute("data-keep")){ if(from.open) to.setAttribute("open",""); else to.removeAttribute("open"); }
      if(from.classList && from.classList.contains("page-enter")) to.classList.add("page-enter");
      return true;
    },
    onNodeAdded:function(n){ if(n.nodeType===1 && !opts.quiet && added<8 && n.matches && n.matches(ENTER_SEL)){ added++; n.classList.add("enter-item"); n.addEventListener("animationend",function(){ n.classList.remove("enter-item"); },{once:true}); } return n; }
  });
}

/* ---------- objectifs et échéances du jour ---------- */
function upcomingPales(n){ var t=iso(today()); return PALES.filter(function(p){ return p.date>=t; }).slice(0,n||99); }
function vacDay(dISO){ return (typeof VAC_PLAN!=="undefined" && inVacances(dISO) && VAC_PLAN[dISO])||null; }
/* progression du programme des vacances : chaque case cochée compte */
function vacGoals(){
  var G={exo:[0,0],hggch:[0,0],plan:[0,0],oeuvre:[0,0],txt:[0,0],theme:[0,0],rac:[0,0],synth:[0,0]};
  Object.keys(VAC_PLAN).forEach(function(d){
    dayEvents(d).forEach(function(e){
      if(!e.items) return;
      roadFor(e,d).forEach(function(r,ix){
        var g=r.g||(r.sub==="maths"&&!r.quiz&&!r.filler?"exo":null); if(!g||!G[g]) return;
        G[g][1]++; if(isDone(d,e,r,ix)) G[g][0]++;
      });
    });
  });
  return G;
}
function vacPlanCard(t){
  var G=vacGoals(), L=[["exo","Maths","exercices et blocs"],["hggch","HGG","chapitres repris"],["plan","Plans HGG","plans détaillés"],["oeuvre","CSH","œuvres (7 duos)"],["txt","Allemand","textes du dossier"],["theme","Thèmes","anglais + allemand"],["rac","RAC","d'anglais"],["synth","Synthèse","entraînement"]];
  var h='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Programme des vacances</h2><button class="link-btn" data-a="vacweek">Voir la semaine</button></div><div class="vgoals">';
  L.forEach(function(x){ var g=G[x[0]]; if(!g[1]) return; var p=Math.round(g[0]/g[1]*100); h+='<div class="vg"><div class="row" style="justify-content:space-between"><b>'+x[1]+'</b><span class="small" style="font-weight:700">'+g[0]+'/'+g[1]+'</span></div><div class="bar"><i style="width:'+p+'%"></i></div><span class="small muted">'+x[2]+'</span></div>'; });
  return h+'</div><p class="small muted" style="margin:10px 0 0">Chaque case cochée dans les feuilles de route de l\'agenda fait avancer ces compteurs.</p></section>';
}
function dayObjectives(dISO){
  var s=st(), out=[];
  if(vacDay(dISO)) return vacDay(dISO).obj.map(function(o){ return {t:o,sub:"neutral"}; });
  var next=upcomingPales(1)[0];
  if(next){ var dd=diffDays(next.date,dISO); if(dd>=0 && dd<=7) out.push({t:"Préparer le DST de "+next.t.replace(/^Concours blanc · /,"")+" ("+relDay(next.date).toLowerCase()+")",sub:next.sub}); }
  s.tasks.filter(function(t){ return !t.done && !t.vac && (t.day===dISO || (t.due && diffDays(t.due,dISO)<=2 && diffDays(t.due,dISO)>=0)); })
    .sort(function(a,b){ return (b.prio||0)-(a.prio||0); })
    .forEach(function(t){ if(out.length<3) out.push({t:t.title+(t.due?" (pour "+relDay(t.due).toLowerCase()+")":""),sub:t.sub}); });
  if(out.length<3){ dayEvents(dISO).filter(function(e){ return e.kind==="work"; }).forEach(function(e){ if(out.length<3 && !out.some(function(o){return o.sub===e.sub;})) out.push({t:e.t+" de "+hLabel(e.s)+" à "+hLabel(e.e),sub:e.sub}); }); }
  return out.slice(0,3);
}
function dueToday(dISO){
  var s=st(), out=[];
  paleOn(dISO).forEach(function(p){ out.push({when:hLabel(p.s),t:"DST · "+p.t,sub:p.sub}); });
  if(typeof BJ!=="undefined") BJ.mineOn(dISO).forEach(function(c){ var pr=colleurLine(c.colleur); out.push({when:hLabel(c.debut),t:(BJ.isEntretien(c)?"Entretien de personnalité":"Colle de "+c.discipline)+(c.colleur?" avec "+c.colleur:"")+(/^\d/.test(c.tirage||"")?" · tirage "+hLabel(c.tirage):"")+(c.salle?" · "+c.salle:"")+(pr?" — "+pr:""),sub:BJ.subOf(c)}); });
  s.tasks.filter(function(t){ return !t.done && !t.vac && t.time && t.day===dISO; }).forEach(function(t){ out.push({when:hLabel(t.time),t:t.title+" · rappel "+t.remind+" min avant",sub:t.sub}); });
  s.tasks.filter(function(t){ return !t.done && !t.vac && t.due===dISO; }).forEach(function(t){ out.push({when:"Pour auj.",t:t.title,sub:t.sub}); });
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
  h+='</div><p class="subtitle">'+(vacDay(t)?esc(vacDay(t).lieu)+" · "+esc(vacDay(t).note):inVacances(t)?"Vacances de la "+inVacances(t).name+".":"Voici l'essentiel de ta journée.")+'</p>';
  h+=homeResAsk();
  h+='<div class="grid g2">';
  h+='<section class="card"><div class="card-h"><h2>Objectifs du jour</h2></div>';
  h+=objs.length?'<ol class="objs">'+objs.map(function(o,i){ return '<li><span class="n">'+(i+1)+'</span><span>'+esc(o.t)+'</span></li>'; }).join("")+'</ol>':'<div class="empty">Rien d\'imposé aujourd\'hui.</div>';
  h+='</section>';
  h+='<section class="card"><div class="card-h"><h2>Échéances du jour</h2><button class="link-btn" data-go="echeances">Toutes</button></div>';
  h+=dues.length?'<div class="stack" style="gap:8px">'+dues.map(function(x){ return '<div class="due '+subj(x.sub).cls+'"><span class="when">'+esc(x.when)+'</span><span class="what">'+esc(x.t)+'</span></div>'; }).join("")+'</div>':'<div class="empty"><b>Aucune échéance aujourd\'hui</b>Ni colle, ni DST, ni rendu.</div>';
  h+='</section></div>';

  h+=homeMethodoCards();
  var vt=inVacances(t), vl=st().tasks.filter(function(x){ return x.vac && !x.done; });
  h+=runCard();
  if(vt && vacDay(t)) h+=vacPlanCard(t);
  else if(vl.length && (vt || (nextVac() && diffDays(nextVac().from,t)<=3))) h+='<section class="card s-hgg" style="margin-top:14px"><div class="card-h"><h2>'+(vt?"C'est les vacances":"Vacances dans "+plural(diffDays(nextVac().from,t),"jour"))+'</h2><span class="tag">'+plural(vl.length,"chose")+' à faire</span></div><p class="small muted" style="margin:0 0 10px">'+(vt?"Ta liste des vacances t'attend. Copie-la et envoie-la à Claude pour organiser ces deux semaines ensemble.":"Pense à finir d'y noter ce que tu veux faire ; on l'organisera ensemble dès le début des vacances.")+'</p><div class="row" style="gap:8px"><button class="btn tint sm" data-a="vaccopy">Copier pour Claude</button><button class="btn sm" data-go="todo">Voir la liste</button></div></section>';
  if(hasCSH(t)){
    h+='<div style="margin-top:14px">'+'<a class="ext" href="https://claude.ai/artifact/TA1xcsk7H5jfrj7vcYsfwV" target="_blank" rel="noopener"><div><b>Atelier CSH</b><span class="small muted">'+"Journée de CSH : ton œuvre du jour et son parcours d'étude t'attendent dans l'atelier."+'</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>'+'</div>';
  }

  h+='<div class="grid g2" style="margin-top:14px">';
  h+='<section class="card"><div class="card-h"><h2>Programme</h2><button class="link-btn" data-go="agenda">Agenda</button></div><div class="strip">';
  h+=evs.filter(function(e){ return e.kind!=="fixed" || e.anki || e.actu; }).map(function(e){
    var s=subj(e.sub), cls=(nm>=toMin(e.s)&&nm<toMin(e.e))?" now":(nm>=toMin(e.e)?" past":"");
    var sub=e.kind==="course"?"Cours":e.kind==="exam"?"Épreuve":e.kind==="fixed"?"Routine":"Feuille de route";
    return '<button class="slot'+cls+' '+(e.kind==="exam"?"s-exam":s.cls)+'" data-a="slot" data-d="'+t+'" data-id="'+esc(e.id)+'"><span class="h">'+hLabel(e.s)+'</span><span class="b"><b>'+esc(e.t)+'</b><span>'+sub+' · '+durTxt(toMin(e.e)-toMin(e.s))+'</span></span></button>';
  }).join("");
  h+='</div></section>';
  h+='<section class="stack"><div class="card"><div class="card-h"><h2>Tâches du jour</h2><button class="link-btn" data-go="todo">Tout voir</button></div>'+quickBox("home")+'<div class="tasks" style="margin-top:6px">'+taskRows(todayTasks())+'</div></div>';
  h+='<div class="card" id="news-card">'+newsHTML()+'</div></section></div>';
  setTimeout(loadNews,50);
  return h;
}
function todayTasks(){
  var t=iso(today());
  return st().tasks.filter(function(x){ return !x.done && !x.vac && (x.day===t || (x.due && x.due<=iso(addDays(today(),2))) || (x.day && x.day<t)); });
}

/* ---------- To-Do ---------- */
function quickBox(where){
  return '<div class="quick-wrap" data-where="'+where+'"><form class="quick" data-quick><input id="q-'+where+'" autocomplete="off" placeholder="Ex. : lire le texte 3 d\'anglais pour mardi !!" aria-label="Nouvelle tâche"><button class="go" type="submit" disabled aria-label="Ajouter">'+I.send+'</button></form><div class="parse" aria-live="polite"></div></div>';
}
function bindQuick(){
  document.querySelectorAll("form[data-quick]").forEach(function(f){
    if(f._bound) return; f._bound=true;
    var inp=f.querySelector("input"), box=f.parentNode.querySelector(".parse"), btn=f.querySelector(".go");
    var cur=null;
    function upd(){
      var v=inp.value.trim(); btn.disabled=!v; if(!v){ box.innerHTML=""; cur=null; return; }
      cur=parseTask(v); if(f._sub) cur.sub=f._sub; if(f._g){ if(!cur.type&&f._g.type) cur.type=f._g.type; if(!cur.dur&&f._g.dur){ cur.dur=f._g.dur; cur.durEstimee=true; } }
      if(f._dur){ cur.dur=f._dur; cur.durEstimee=false; }
      if(f._vac!=null) cur.vac=f._vac;
      box.innerHTML=parseChips(cur)+placeChip(cur);
      var sel=box.querySelector("select"); if(sel) sel.onchange=function(){ f._sub=sel.value; upd(); };
    }
    var gT=null;
    box.addEventListener("click",function(ev){ var vb=ev.target.closest("[data-qvac]"); if(vb){ ev.preventDefault(); f._vac=!(cur&&cur.vac); upd(); inp.focus(); return; } var d=ev.target.closest("[data-qdur]"); if(!d) return; ev.preventDefault(); f._dur=+d.getAttribute("data-qdur"); upd(); inp.focus(); });
    inp.addEventListener("input",function(){ f._sub=null; f._g=null; upd(); clearTimeout(gT);
      var v=inp.value.trim();
      if(cur && !cur.sub && v.length>6 && typeof Sync!=="undefined" && Sync.user()){
        gT=setTimeout(function(){ Sync.invoke({mode:"classify",input:v}).then(function(r){
          if(inp.value.trim()!==v || !r || !r.sub) return;
          f._sub=r.sub; f._g=r; upd(); if(cur){ box.innerHTML=parseChips(cur)+'<span class="chip act">classé par Gemini</span>'+placeChip(cur); var sel=box.querySelector("select"); if(sel) sel.onchange=function(){ f._sub=sel.value; upd(); }; }
        },function(){}); },900);
      }
    });
    f.addEventListener("submit",function(e){
      e.preventDefault(); if(!inp.value.trim()) return; upd();
      var t=taskFrom(cur); st().tasks.push(t); save(); if(typeof Plan!=="undefined") Plan.invalidate();
      inp.value=""; f._sub=null; f._dur=null; f._g=null; f._vac=null; box.innerHTML=""; btn.disabled=true;
      toast(t.vac?"Ajoutée à ta liste des vacances"+(nextVac()?" ("+nextVac().name+")":"")+".":actionToast(t)+placeToast(t)); closeSheet(); render();
    });
  });
}
function parseChips(p){
  var s=subj(p.sub||"perso");
  var h='<label class="'+s.cls+'" style="display:inline-flex"><span class="sr" hidden>Matière</span><select aria-label="Matière" style="--s:var(--'+(p.sub||"perso")+');--si:var(--'+(p.sub||"perso")+'-ink)">'+
    ["maths","hgg","csh","ang","all","perso"].map(function(id){ return '<option value="'+id+'"'+(id===(p.sub||"perso")?" selected":"")+'>'+subj(id).name+'</option>'; }).join("")+'</select></label>';
  if(p.type) h+='<span class="chip">'+esc(p.type)+'</span>';
  if(p.devoir && p.action!=="dm") h+='<span class="chip">'+(p.memo?"rappel de devoir":"devoir")+'</span>';
  if(p.sub && p.sub!=="perso" && !p.time && !p.memo && p.action!=="rappel") h+='<span class="chip" style="background:none;padding-left:0">'+(p.dur&&!p.durEstimee?"Durée :":p.dur?"Durée estimée "+durTxt(p.dur)+", à ajuster :":"Combien de temps ?")+'</span>'+[15,30,45,60,90,120].map(function(m){ return '<button type="button" class="chip'+(p.dur===m&&!p.durEstimee?" on":"")+'" data-qdur="'+m+'">'+durTxt(m)+'</button>'; }).join("");
  else if(p.dur) h+='<span class="chip">'+durTxt(p.dur)+'</span>';
  if(p.due) h+='<span class="chip">avant le '+fmtDay(p.due)+'</span>';
  if(p.day) h+='<span class="chip">'+fmtDay(p.day)+(p.time?' · '+hLabel(p.time):'')+'</span>';
  if(p.prio) h+='<span class="chip"><span class="prio">'+"!!!".slice(0,p.prio)+'</span>'+["","important","prioritaire","impératif"][p.prio]+'</span>';
  h+='<button type="button" class="chip'+(p.vac?" on":"")+'" data-qvac="1" title="Ranger dans la liste des vacances">Vacances</button>';
  var a=actionLabel(p); if(a && !p.vac) h+='<span class="chip act">→ '+esc(a)+'</span>';
  return h;
}
function placeChip(p){
  if(p.vac) return '<span class="chip act">→ liste des vacances'+(nextVac()?" ("+nextVac().name+")":"")+'</span>';
  if(typeof Plan==="undefined" || !p.sub || p.sub==="perso" || p.time || p.memo || p.action==="rappel" || !p.title) return "";
  var t=taskFrom(p); t.id="preview"; var r=Plan.preview(t);
  if(r.unplaced) return '<span class="chip" style="background:var(--red-pale);color:var(--red)">pas de créneau '+subj(p.sub).short+' libre'+(p.due?" avant l'échéance":"")+'</span>';
  if(r.dropped) return '<span class="chip">pas de place sur 14 jours : ajoute une date ou « ! »</span>';
  if(!r.at.length) return "";
  var a=r.at[0]; return '<span class="chip act">→ '+(a.d===iso(today())?"aujourd'hui":fmtDay(a.d))+' '+hLabel(a.s)+(r.at.length>1?" (en "+r.at.length+" fois)":"")+'</span>'+(r.bumped>0?'<span class="chip">repousse '+plural(r.bumped,"élément")+' hors délai</span>':r.pushed>0?'<span class="chip">décale '+plural(r.pushed,"tâche")+' sans date</span>':'');
}
function placeToast(t){
  if(typeof Plan==="undefined" || t.time || t.memo || t.sub==="perso" || t.action==="rappel") return "";
  var w=Plan.whenOf("task|"+t.id); if(w){ var a=w[0]; return " Placée "+(a.d===iso(today())?"aujourd'hui":fmtDay(a.d))+" à "+hLabel(a.s)+"."; }
  return " Aucun créneau libre"+(t.due?" avant l'échéance":"")+" : voir la To-Do.";
}
function actionLabel(p){
  if(p.action==="rappel") return "rappel "+p.remind+" min avant"+(p.time?" ("+hLabel(fromMin(toMin(p.time)-p.remind))+")":"");
  if(p.action==="csh-oeuvre") return "œuvre pour l'Atelier CSH";
  if(p.action==="hgg-fiche") return "fiche automatique dans l'Atelier HGG";
  if(p.action==="civi") return "CIVI "+(p.sub==="all"?"allemand":"anglais")+" (Google Doc)";
  if(p.action==="dm") return "découpage jeudi, vendredi, dimanche";
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
    if(!t.done && !t.time && !t.memo && !t.vac && typeof Plan!=="undefined" && t.sub!=="perso"){ var wt=whenTxt("task|"+t.id); meta.push(wt?'<span class="meta">prévu '+esc(wt)+'</span>':'<span class="meta late">sans créneau</span>'); }
    return '<div class="task p'+(t.prio||0)+(t.done?" done":"")+'" data-key="tk-'+t.id+'"><button class="check'+(t.done?" on":"")+'" data-a="toggle" data-id="'+t.id+'" aria-label="'+(t.done?"Rouvrir":"Terminer")+'">'+(t.done?I.check:"")+'</button>'+
      '<div class="tt"><span class="tedit" data-a="edittask" data-id="'+t.id+'" role="button" tabindex="0">'+esc(t.title)+'</span><div class="tm">'+tag(t.sub)+(t.type?'<span class="meta">'+esc(t.type)+'</span>':'')+meta.join("")+(t.prio?'<span class="prio">'+"!!!".slice(0,t.prio)+'</span>':'')+(t.example?'<span class="badge-ex">exemple</span>':'')+'</div></div>'+
      (t.vac&&!t.done?'<button class="chip" data-a="unvac" data-id="'+t.id+'" title="Sortir de la liste des vacances">Faire avant</button>':'')+'<button class="del" data-a="del" data-id="'+t.id+'" aria-label="Supprimer">'+I.trash+'</button></div>';
  }).join("");
}
function vTodo(){
  var s=st(), f=S.todoFilter, t=iso(today());
  var list=s.tasks.filter(function(x){ return f==="*"||x.sub===f; });
  var vacs=list.filter(function(x){ return !x.done && x.vac; });
  var open=list.filter(function(x){ return !x.done && !x.vac; }), done=list.filter(function(x){ return x.done; });
  function when(x){ return x.day||x.due||null; }
  var groups=[["En retard",open.filter(function(x){ return when(x)&&when(x)<t; })],["Aujourd'hui",open.filter(function(x){ return when(x)===t; })],
    ["Cette semaine",open.filter(function(x){ return when(x)&&when(x)>t&&diffDays(when(x),t)<=7; })],["Plus tard",open.filter(function(x){ return when(x)&&diffDays(when(x),t)>7; })],["Sans date",open.filter(function(x){ return !when(x); })]];
  var h=topbar("To-Do")+'<h1 class="large-title">To-Do</h1><p class="subtitle">Une seule liste pour tout : matières, ateliers et vie quotidienne.</p>';
  h+=quickBox("todo");
  h+='<div style="margin-top:14px">'+planAlerts()+'</div>';
  h+='<div class="filters" style="margin:14px 0 6px">'+[["*","Tout"]].concat(SUBJECT_ORDER.concat(["perso"]).map(function(id){ return [id,subj(id).name]; })).map(function(x){ return '<button class="chip'+(f===x[0]?" on":"")+'" data-a="tfilter" data-f="'+x[0]+'">'+esc(x[1])+'</button>'; }).join("")+'</div>';
  h+='<div class="stack">';
  groups.forEach(function(g){ if(!g[1].length) return; g[1].sort(function(a,b){ return (b.prio||0)-(a.prio||0)||String(when(a)).localeCompare(String(when(b))); }); h+='<section class="card"><div class="group-h">'+g[0]+' <span class="n">'+g[1].length+'</span></div><div class="tasks">'+taskRows(g[1])+'</div></section>'; });
  h+=vacCard(vacs);
  if(!open.length) h+='<div class="card"><div class="empty"><b>Tout est fait</b>Ajoute une tâche avec la barre ci-dessus.</div></div>';
  if(done.length) h+='<details class="card"><summary class="group-h" style="cursor:pointer">Terminées <span class="n">'+done.length+'</span></summary><div class="tasks">'+taskRows(done)+'</div></details>';
  h+='</div><div class="note-box" style="margin-top:14px">Exemples de saisie : « ne pas oublier le rdv Coirier 19h » · « réf Marivaux Les Fausses Confidences » · « ex : Golden Dome » · « DM maths pour lundi !!! » · « civi : élections à Berlin » · « vac : refaire les DS de 1re année ». Les tâches marquées <span class="badge-ex">exemple</span> peuvent être supprimées.</div>';
  return h;
}

/* ---------- Agenda ---------- */
var H0=7*60, H1=23*60+40, PX=0.9;
function vAgenda(){
  var mode=S.agMode||(window.innerWidth>=900?"week":"day");
  var d=parseISO(S.agDate), mon=mondayOf(d), t=iso(today());
  var h=topbar("Agenda")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Agenda</h1><div class="seg" role="tablist"><button class="'+(mode==="day"?"on":"")+'" data-a="agmode" data-m="day">Jour</button><button class="'+(mode==="week"?"on":"")+'" data-a="agmode" data-m="week">Semaine</button></div></div>';
  h+='<div class="ag-head"><div class="ag-nav"><button class="icon-btn" data-a="agstep" data-n="'+(mode==="day"?-1:-7)+'" aria-label="Précédent">'+I.left+'</button><span class="lbl-date">'+(mode==="day"?fmtLong(S.agDate).replace(/^./,function(c){return c.toUpperCase();}):"Semaine du "+mon.getDate()+" "+MON_S[mon.getMonth()])+'</span><button class="icon-btn" data-a="agstep" data-n="'+(mode==="day"?1:7)+'" aria-label="Suivant">'+I.right+'</button></div><div class="row" style="gap:6px"><button class="btn sm" data-a="slotadd">'+I.plus+' Créneau</button><button class="btn sm" data-a="agtoday">Aujourd\'hui</button></div></div>';
  if(mode==="day"){
    h+='<div class="days">'; for(var i=0;i<7;i++){ var x=addDays(mon,i), xi=iso(x); h+='<button class="'+(xi===S.agDate?"on ":"")+(xi===t?"today":"")+'" data-a="agday" data-d="'+xi+'"><small>'+DAYS_S[x.getDay()].replace(".","")+'</small><b>'+x.getDate()+'</b></button>'; } h+='</div>';
  }
  var dates=mode==="day"?[S.agDate]:[0,1,2,3,4,5,6].map(function(i){ return iso(addDays(mon,i)); });
  var height=(H1-H0)*PX, hourCol=44;
  h+='<div class="cal"><div class="cal-scroll"><div class="cal-grid" style="grid-template-columns:'+hourCol+'px repeat('+dates.length+',minmax('+(mode==="week"?"96px":"0")+',1fr))">';
  h+='<div></div>'+dates.map(function(x){ var dd=parseISO(x); return '<div class="cal-colh'+(x===t?" today":"")+'">'+DAYS_S[dd.getDay()]+' '+dd.getDate()+'</div>'; }).join("");
  h+='<div class="cal-hours" style="height:'+height+'px">'; for(var hh=8;hh<=23;hh++){ h+='<div style="top:'+((hh*60-H0)*PX)+'px">'+hh+'h</div>'; } h+='</div>';
  dates.forEach(function(x){
    h+='<div class="cal-col" data-col="'+x+'" style="height:'+height+'px">';
    for(var hh=8;hh<=23;hh++) h+='<div class="line" style="top:'+((hh*60-H0)*PX)+'px"></div>';
    var evs=dayEvents(x).concat(timedTasks(x)); calLayout(evs);
    evs.forEach(function(e){
      var top=(Math.max(toMin(e.s),H0)-H0)*PX, ht=Math.max((toMin(e.e)-toMin(e.s))*PX-2,18);
      var cls=subj(e.sub).cls+" "+(e.kind==="course"?"course":e.kind==="fixed"?"fixed":e.kind==="exam"?"exam":"");
      var road=e.kind==="work"?roadFor(e,x):[];
      var done=road.length?road.filter(function(r,ix){ return isDone(x,e,r,ix); }).length:0;
      var mv=e.kind!=="course" && e.kind!=="exam";
      var pos=e._n>1?'left:calc('+(e._c/e._n*100)+'% + 2px);right:auto;width:calc('+(100/e._n)+'% - 4px);':'';
      h+='<button class="ev '+cls+(mv?" mv":"")+'" style="top:'+top+'px;height:'+ht+'px;'+pos+'" data-a="slot" data-d="'+x+'" data-id="'+esc(e.id)+'" data-s="'+e.s+'" data-e="'+e.e+'"'+(mv?' data-drag="1"':'')+'><b>'+esc(e.t)+'</b>'+(ht>34?'<span class="evt">'+hLabel(e.s)+'–'+hLabel(e.e)+(road.length?' · '+done+'/'+road.filter(function(r){return !r.pause;}).length:'')+'</span>':'')+(mv?'<i class="rz" aria-hidden="true"></i>':'')+'</button>';
    });
    if(x===t){ var nm=nowMin(); if(nm>=H0&&nm<=H1) h+='<div class="now-line" style="top:'+((nm-H0)*PX)+'px"></div>'; }
    h+='</div>';
  });
  h+='</div></div></div>';
  h+='<div class="legend">'+SUBJECT_ORDER.map(function(id){ return tag(id); }).join("")+'<span class="tag s-neutral">Routine</span><span class="tag s-exam" style="box-shadow:inset 0 0 0 1px #EE9AC4">DST · colles</span></div>';
  h+='<p class="small muted" style="margin-top:10px">Glisse un créneau pour le déplacer, tire son bord du bas pour l\'allonger ou le raccourcir (sur téléphone : appui long, puis glisse). Touche un espace vide pour ajouter un créneau à cette heure. La feuille de route s\'adapte à la nouvelle durée ; « Chaque semaine » dans la bulle qui apparaît rend le changement permanent.</p>';
  return h;
}
/* événements qui se chevauchent : côte à côte, comme dans Google Agenda */
function calLayout(evs){
  var L=evs.slice().sort(function(a,b){ return toMin(a.s)-toMin(b.s)||toMin(b.e)-toMin(a.e); }), group=[], end=-1;
  function flush(){ var cols=[]; group.forEach(function(e){ var c=0; while(cols[c]!=null && cols[c]>toMin(e.s)) c++; cols[c]=toMin(e.e); e._c=c; }); group.forEach(function(e){ e._n=cols.length; }); group=[]; }
  L.forEach(function(e){ if(toMin(e.s)>=end) { flush(); end=-1; } group.push(e); end=Math.max(end,toMin(e.e)); }); flush();
}
function timedTasks(x){
  return st().tasks.filter(function(t){ return t.time && t.day===x && !t.done && !t.vac; }).map(function(t){ return {kind:"work",s:t.time,e:fromMin(Math.min(toMin(t.time)+(t.dur||45),H1)),t:t.title,sub:t.sub,id:"task-"+t.id,taskId:t.id}; });
}
function slotKey(d,e,r,ix){ return d+"|"+e.id+"|"+(r.task||(r.ref?r.ref.k+":"+r.ref.id:r.lab))+"|"+ix; }
function isDone(d,e,r,ix){ if(r.ref&&r.ref.k==="exo") return !!st().mathsDone[r.ref.id]; if(r.ref&&r.ref.k==="hgg") return !!hggState().done[r.ref.id]; if(r.task){ var t=st().tasks.find(function(x){return x.id===r.task;}); return t&&t.done; } return !!st().slotDone[slotKey(d,e,r,ix)]; }

function openSlot(dISO,id){
  var e=dayEvents(dISO).concat(timedTasks(dISO)).find(function(x){ return x.id===id; }); if(!e) return;
  var s=subj(e.sub), road=e.kind==="work"||e.anki||e.actu?roadFor(e,dISO):[];
  var editable=!e.colle && !(e.kind==="exam");
  var h='<div class="band '+s.cls+'"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">'+fmtLong(dISO)+' · '+hLabel(e.s)+'–'+hLabel(e.e)+(e.edited||e.added?' · modifié':'')+'</div><h2>'+esc(e.t)+'</h2></div>'+(e.taskId?'<button class="btn sm" data-a="edittask" data-id="'+e.taskId+'">Modifier</button>':editable?'<button class="btn sm" data-a="slotedit" data-d="'+dISO+'" data-id="'+esc(e.id)+'">Modifier</button><button class="icon-btn del-btn" data-a="slotdel" data-d="'+dISO+'" data-id="'+esc(e.id)+'" aria-label="Supprimer le créneau" title="Supprimer le créneau">'+I.trash+'</button>':'')+'<button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
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
      h+='<div class="road-it'+(dn1?" done":"")+'"><button class="check'+(dn1?" on":"")+'" data-a="road" data-k="'+esc(key)+'" data-task="'+(r.task||"")+'" data-ref="'+(r.ref&&r.ref.k!=="task"?esc(r.ref.k+":"+r.ref.id):"")+'" aria-label="Cocher">'+(dn1?I.check:"")+'</button><div><div class="lab">'+esc(r.lab)+(r.url?' <a class="link-btn" href="'+esc(r.url)+'" target="_blank" rel="noopener">ouvrir ↗</a>':'')+'</div><div class="sub">'+hLabel(fromMin(clock))+' · '+r.min+' min'+(r.filler?" · proposition":"")+(r.partial?" · suite plus tard":"")+(r.late?' · <span style="color:var(--red)">en retard</span>':'')+(r.star?" · ★ classique":"")+'</div>'+(r.quiz&&!dn1?'<button class="btn tint sm" data-a="quiz" style="margin-top:6px">Lancer le quiz</button>':'')+(r.ref&&r.ref.k==="hgg"&&!dn1?'<div class="partial" style="margin-top:6px"><span class="sub">Pas fini ?</span>'+[25,50,75].map(function(v){ return '<button class="chip" data-a="partial" data-ref="hgg:'+esc(r.ref.id)+'" data-v="'+v+'">'+v+' %</button>'; }).join("")+'</div>':'')+(r.task&&!dn1?'<div class="partial" style="margin-top:6px"><span class="sub">Pas fini ?</span>'+[25,50,75].map(function(v){ return '<button class="chip" data-a="partial" data-task="'+r.task+'" data-v="'+v+'">'+v+' %</button>'; }).join("")+'</div>':'')+'</div>'+
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
    var s=subj(id), n=st().tasks.filter(function(t){ return !t.done && !t.vac && t.sub===id; }).length;
    h+='<button class="subj '+s.cls+'" data-go="matiere" data-p="'+id+'"><span class="ic">'+esc(s.ic)+'</span><div><h3>'+s.name+'</h3><p>'+esc(s.blurb)+'</p></div><div class="foot"><span class="tag '+s.cls+'">'+plural(n,"tâche")+'</span></div></button>';
  });
  return h+'</div>';
}
function vMatiere(id){
  var s=subj(id), tasks=st().tasks.filter(function(t){ return !t.done && !t.vac && t.sub===id; });
  var h=topbar(s.name)+'<button class="link-btn" data-go="matieres" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Matières</button>';
  h+='<section class="hero-subj '+s.cls+'"><h1>'+s.name+'</h1><p>'+esc(s.blurb)+'</p></section><div class="stack" style="margin-top:14px">';
  if(id==="hgg"){
    h+='<a class="ext" href="https://claude.ai/artifact/TyMQ4dNtMg8XY5NeQqBuhZ" target="_blank" rel="noopener"><div><b>Atelier HGG</b><span class="small muted">Sur claude.ai : fiches, revue de presse, sujets, accroches.</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>';
    h+=hggAskCard()+hggWorkCard()+hggProgCard()+grangeCard("hgg")+filesCard("hgg");
  }
  if(id==="csh"){
    h+='<a class="ext" href="https://claude.ai/artifact/TA1xcsk7H5jfrj7vcYsfwV" target="_blank" rel="noopener"><div><b>Atelier CSH</b><span class="small muted">'+"Œuvre du jour, parcours d'étude avec extraits vérifiés, références, duos, sous-thèmes, feuille blanche, Anki."+'</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>';
    h+='<section class="card"><div class="card-h"><h2>Sous-thèmes</h2><span class="small muted">18</span></div>'+["I","II","III"].map(function(part){ return '<div class="eyebrow" style="margin:8px 0 6px">'+({I:"I · Définir",II:"II · À l'épreuve",III:"III · Rayonnante"})[part]+'</div><div class="sous">'+SOUS_THEMES.filter(function(x){return x[0]===part;}).map(function(x){ return '<span class="chip">'+esc(x[1])+'</span>'; }).join("")+'</div>'; }).join("")+'</section>';
  }
  if(id==="maths"){
    h+=mathsSpace();
  }
  if(id==="ang"||id==="all"){
    h+='<a class="ext" href="'+CIVI_DOC[id==="ang"?"en":"de"]+'" target="_blank" rel="noopener"><div><b>CIVI · '+(id==="ang"?"Nothing New on the English-Speaking Front":"CIVI")+'</b><span class="small muted">Ton document de civilisation (Google Docs). « Ajouter à ma civi » y range une news en prise de notes, dans la bonne partie.</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>';
    h+=pressCard(id==="ang"?"en":"de");
  }
  if(id==="csh"||id==="ang"||id==="all") h+=grangeCard(id);
  if(id!=="hgg"&&id!=="maths") h+=filesCard(id);
  h+='<section class="card"><div class="card-h"><h2>Tâches</h2><span class="small muted">'+tasks.length+'</span></div><div class="tasks">'+taskRows(tasks)+'</div></section></div>';
  return h;
}
function modCard(t,d){ return '<section class="card"><div class="card-h"><h2>'+esc(t)+'</h2><span class="small faint">bientôt</span></div><p class="muted small" style="margin:0">'+esc(d)+'</p></section>'; }

/* ---------- modifier un contenu : fiche-formulaire générique ---------- */
function formSheet(o){
  var h='<div class="band '+(o.cls||"")+'"></div><div class="sheet-h"><div class="ttl">'+(o.eyebrow?'<div class="eyebrow">'+esc(o.eyebrow)+'</div>':'')+'<h2>'+esc(o.title)+'</h2></div><button class="icon-btn" data-a="'+(o.after?"formback":"close")+'" aria-label="Fermer">'+I.close+'</button></div><form class="sheet-b" id="edit-form" novalidate>';
  o.fields.forEach(function(f){
    var idf='ef-'+f.k, v=f.value==null?"":f.value;
    if(f.type==="hidden") return;
    h+='<div>'+(f.label?'<label class="lbl" for="'+idf+'">'+esc(f.label)+'</label>':'');
    if(f.type==="textarea") h+='<textarea class="field" id="'+idf+'" rows="'+(f.rows||5)+'" style="min-height:'+((f.rows||5)*22)+'px">'+esc(v)+'</textarea>';
    else if(f.type==="select") h+='<select class="field" id="'+idf+'">'+f.options.map(function(x){ return '<option value="'+esc(x[0])+'"'+(String(x[0])===String(v)?" selected":"")+'>'+esc(x[1])+'</option>'; }).join("")+'</select>';
    else if(f.type==="radio") h+='<div class="seg" style="display:flex;width:100%">'+f.options.map(function(x){ return '<label style="flex:1;text-align:center;cursor:pointer" class="segl"><input type="radio" name="'+idf+'" value="'+esc(x[0])+'"'+(String(x[0])===String(v)?" checked":"")+' style="position:absolute;opacity:0">'+esc(x[1])+'</label>'; }).join("")+'</div>';
    else h+='<input class="field'+(f.type==="number"?" tab":"")+'" id="'+idf+'" type="'+(f.type==="number"?"text":(f.type||"text"))+'"'+(f.type==="number"?' inputmode="decimal"':'')+' value="'+esc(v)+'"'+(f.placeholder?' placeholder="'+esc(f.placeholder)+'"':'')+'>';
    if(f.hint) h+='<div class="small faint" style="margin-top:4px">'+esc(f.hint)+'</div>';
    h+='</div>';
  });
  h+='<div class="row" style="gap:8px;justify-content:space-between;flex-wrap:wrap;margin-top:4px"><button class="btn primary" type="submit">Enregistrer</button><div class="row" style="gap:8px">'+(o.reset?'<button class="btn" type="button" id="edit-reset">'+esc(o.resetLabel||"Rétablir l\'original")+'</button>':'')+(o.del?'<button class="btn danger" type="button" id="edit-del">'+esc(o.delLabel||"Supprimer")+'</button>':'')+'</div></div></form>';
  openSheet(h); S.formBack=o.after||null;
  var f=document.getElementById("edit-form");
  function vals(){ var v={}; o.fields.forEach(function(fl){ if(fl.type==="hidden"){ v[fl.k]=fl.value; return; } if(fl.type==="radio"){ var c=f.querySelector('input[name="ef-'+fl.k+'"]:checked'); v[fl.k]=c?c.value:null; } else v[fl.k]=f.querySelector("#ef-"+fl.k).value; }); return v; }
  function done(msg){ save(); if(typeof Plan!=="undefined") Plan.invalidate(); if(o.after) o.after(); else { closeSheet(); render(); } toast(msg); }
  f.onsubmit=function(ev){ ev.preventDefault(); var r=o.save(vals()); if(r===false) return; if(typeof r==="string"){ toast(r); return; } done(o.toast||"Modifié."); };
  f.querySelectorAll(".segl input").forEach(function(r){ r.onchange=function(){ f.querySelectorAll(".segl").forEach(function(l){ l.classList.toggle("on",l.querySelector("input").checked); }); }; if(r.checked) r.parentNode.classList.add("on"); });
  var d=document.getElementById("edit-del"); if(d) d.onclick=function(){ if(d.getAttribute("data-sure")){ o.del(vals()); done("Supprimé."); } else { d.setAttribute("data-sure","1"); d.textContent="Confirmer"; } };
  var rs=document.getElementById("edit-reset"); if(rs) rs.onclick=function(){ o.reset(vals()); done("Rétabli."); };
  var first=f.querySelector("textarea,input:not([type=radio]),select"); if(first && window.innerWidth>=600) try{ first.focus(); }catch(e){}
}
var SUB_OPTS=[["maths","Maths"],["hgg","HGG"],["csh","CSH"],["ang","Anglais"],["all","Allemand"],["perso","Perso"]];
function numOrNull(x){ var y=parseFloat(String(x||"").replace(",",".")); return isNaN(y)?null:y; }
function editTask(id){
  var t=st().tasks.find(function(x){ return x.id===id; }); if(!t) return;
  formSheet({title:"Modifier la tâche", eyebrow:subj(t.sub).name, cls:subj(t.sub).cls, fields:[
    {k:"title",label:"Intitulé",value:t.title},
    {k:"sub",label:"Matière",type:"select",options:SUB_OPTS,value:t.sub||"perso"},
    {k:"dur",label:"Durée (min)",type:"number",value:t.dur||""},
    {k:"due",label:"À rendre / échéance (« pour … »)",type:"date",value:t.due||""},
    {k:"day",label:"Jour où la faire",type:"date",value:t.day||""},
    {k:"time",label:"Heure précise (rendez-vous, rappel)",type:"time",value:t.time||""},
    {k:"prio",label:"Priorité",type:"select",options:[[0,"Normale"],[1,"! Importante"],[2,"!! Prioritaire"],[3,"!!! Impérative"]],value:t.prio||0},
    {k:"vac",label:"Liste",type:"radio",options:[["0","Planning"],["1","Vacances"]],value:t.vac?"1":"0"},
    {k:"progress",label:"Avancement (%)",type:"number",value:t.progress||0}
  ], save:function(v){ if(!v.title.trim()) return "L'intitulé est vide."; t.title=v.title.trim(); t.sub=v.sub; t.dur=numOrNull(v.dur); t.due=v.due||null; t.day=v.day||null; t.time=v.time||null; t.prio=+v.prio||0; t.vac=v.vac==="1"; t.progress=Math.max(0,Math.min(100,numOrNull(v.progress)||0)); },
    del:function(){ st().tasks=st().tasks.filter(function(x){ return x.id!==id; }); }, toast:"Tâche modifiée." });
}
function editNote(id,ep){
  var n=st().notes.find(function(x){ return x.id===id; }); if(!n) return; var e=epOfId(n.ep), fs=[
    {k:"v",label:"Note /20"+(n.parts?" (globale)":""),type:"number",value:n.v,hint:n.parts&&langW(n.ep,"Essay")?"Recalculée automatiquement (essai 50 %, RAC 30 %, thème 20 %) si tu modifies les exercices.":null},
    {k:"date",label:"Date",type:"date",value:n.date},
    {k:"label",label:"Intitulé",value:n.label||""},
    {k:"com",label:"Commentaire",type:"textarea",rows:3,value:n.com||""}];
  if(n.parts) Object.keys(n.parts).forEach(function(k,i){ fs.splice(1+i,0,{k:"p"+i,label:k+(langW(n.ep,k)?" ("+Math.round(langW(n.ep,k)*100)+" %)":"")+" /20",type:"number",value:n.parts[k]}); });
  formSheet({title:"Modifier la note", eyebrow:e?e.name:"", cls:e?subj(e.sub).cls:"", fields:fs,
    save:function(v){ var x=numOrNull(v.v); if(x==null||x<0||x>20) return "Note entre 0 et 20."; if(n.parts) Object.keys(n.parts).forEach(function(k,i){ var y=numOrNull(v["p"+i]); if(y!=null) n.parts[k]=y; }); if(n.parts && Math.abs(x-n.v)<0.001){ var g=dstGlobal(n.ep,n.parts); if(g!=null) x=g; } n.v=x; n.date=v.date||n.date; n.label=v.label.trim(); n.com=v.com.trim(); },
    del:function(){ st().notes=st().notes.filter(function(x){ return x.id!==id; }); }, after:function(){ noteDetail(ep||n.ep); render(); }, toast:"Note modifiée." });
}
function editRessenti(ep,i){
  var r=(st().ressentis[ep]||[])[i]; if(!r) return;
  formSheet({title:"Modifier le ressenti", eyebrow:(epOfId(ep)||{}).name, fields:[{k:"t",label:"Ressenti",type:"textarea",rows:7,value:r.t},{k:"date",label:"Date",type:"date",value:r.date}],
    save:function(v){ if(!v.t.trim()) return "Le texte est vide."; r.t=v.t.trim(); r.date=v.date||r.date; },
    del:function(){ st().ressentis[ep].splice(i,1); }, after:function(){ methodeSheet(ep); }, toast:"Ressenti modifié." });
}
function linesOf(a){ return (a||[]).join("\n"); }
function parseLines(t){ return String(t||"").split(/\n+/).map(function(x){ return x.replace(/^\s*[-•·]\s*/,"").trim(); }).filter(Boolean); }
function editMeth(id,f){
  var E=st().methEdits=st().methEdits||{}, o=E[id]=E[id]||{}, m=methOf(id), base=METHODO.epreuves[id]||{}, ep=epOfId(id), after=function(){ methodeSheet(id); };
  var hint="Un point par ligne. Entoure de **…** ce qui doit ressortir en gras.";
  function clean(){ if(!Object.keys(o).length) delete E[id]; }
  if(f==="essentiel"||f==="pieges") return formSheet({title:f==="essentiel"?"L'essentiel":"Pièges à éviter", eyebrow:ep.name, fields:[{k:"t",type:"textarea",rows:12,value:linesOf(m[f]),hint:hint}],
    save:function(v){ o[f]=parseLines(v.t); }, reset:base[f]?function(){ delete o[f]; clean(); }:null, after:after });
  if(f==="temps") return formSheet({title:"Gestion du temps", eyebrow:ep.name, fields:[{k:"t",type:"textarea",rows:6,value:m.temps||"",hint:"Texte libre. **…** pour le gras."}],
    save:function(v){ o.temps=v.t.trim(); }, reset:base.temps!=null?function(){ delete o.temps; clean(); }:null, after:after });
  if(f==="conseils") return formSheet({title:"Conseils des profs", eyebrow:ep.name, fields:[{k:"t",type:"textarea",rows:14,value:m.conseils_profs.map(function(c){ return c.qui+" : "+c.texte; }).join("\n\n"),hint:"Un conseil par paragraphe (sépare-les par une ligne vide), au format « Qui : conseil »."}],
    save:function(v){ o.conseils_profs=String(v.t).split(/\n\s*\n/).map(function(b){ b=b.trim(); if(!b) return null; var k=b.indexOf(" : "); return k>0?{qui:b.slice(0,k).trim(),texte:b.slice(k+3).trim()}:{qui:"",texte:b}; }).filter(Boolean); },
    reset:base.conseils_profs?function(){ delete o.conseils_profs; clean(); }:null, after:after });
  var secs=m.sections.map(function(x){ return {titre:x.titre,points:x.points.slice()}; });
  if(f==="newsec") return formSheet({title:"Nouvelle partie", eyebrow:ep.name, fields:[{k:"titre",label:"Titre",value:""},{k:"t",label:"Points",type:"textarea",rows:8,value:"",hint:hint}],
    save:function(v){ if(!v.titre.trim()) return "Donne un titre à la partie."; secs.push({titre:v.titre.trim(),points:parseLines(v.t)}); o.sections=secs; }, after:after });
  var i=+f.split(":")[1], sx=secs[i]; if(!sx) return;
  formSheet({title:"Modifier la partie", eyebrow:ep.name, fields:[{k:"titre",label:"Titre",value:sx.titre},{k:"t",label:"Points",type:"textarea",rows:12,value:linesOf(sx.points),hint:hint}],
    save:function(v){ secs[i]={titre:v.titre.trim()||sx.titre,points:parseLines(v.t)}; o.sections=secs; },
    del:function(){ secs.splice(i,1); o.sections=secs; }, delLabel:"Supprimer la partie",
    reset:o.sections&&base.sections?function(){ delete o.sections; clean(); }:null, resetLabel:"Rétablir toutes les parties", after:after });
}
function editQuizItem(k){
  var fid=k.split("#")[0], it=((st().mathsCours[fid]||{}).items||[])[+k.split("#")[1]]; if(!it) return;
  formSheet({title:"Modifier l'énoncé", eyebrow:"Quiz de cours", cls:"s-maths", fields:[{k:"titre",label:"Titre (ce que l'énoncé définit ou affirme)",value:it.titre||""},{k:"nom",label:"Numéro / nom dans le cours",value:it.nom||""},{k:"type",label:"Type",value:it.type||""},{k:"enonce",label:"Énoncé",type:"textarea",rows:8,value:it.enonce,hint:"Formules en LaTeX entre $…$."}],
    save:function(v){ it.titre=v.titre.trim(); it.nom=v.nom.trim(); it.type=v.type.trim()||it.type; it.enonce=v.enonce.trim()||it.enonce; },
    del:function(){ st().quizOff[k+"|item"]=true; it.off=true; }, delLabel:"Retirer du quiz", after:function(){ quizSheet(); }, toast:"Énoncé modifié." });
}
function editFile(id){
  var f=st().files[id]; if(!f) return; var ex=f.kind==="td"||f.kind==="exos", dm=f.kind==="dm";
  var fs=[{k:"label",label:"Nom affiché",value:f.label||f.name},{k:"chap",label:"Chapitre",value:f.chap||""}];
  if(ex) fs.push({k:"target",label:"À finir avant le",type:"date",value:f.target||""});
  if(dm) fs.push({k:"due",label:"À rendre le",type:"date",value:f.due||""});
  formSheet({title:"Modifier le fichier", eyebrow:f.name, cls:subj(f.sub).cls, fields:fs,
    save:function(v){ f.label=v.label.trim()===f.name?"":v.label.trim(); f.chap=v.chap.trim(); if(ex) f.target=v.target||null; if(dm){ f.due=v.due||null; var t=st().tasks.find(function(x){ return x.file===id; }); if(t) t.due=f.due; } if(st().mathsEx[id] && f.chap) st().mathsEx[id].chap=f.chap; if(st().mathsCours[id] && f.chap) st().mathsCours[id].chap=f.chap; }, toast:"Fichier modifié." });
}
/* créneaux de l'agenda */
var WD_NAMES=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function slotFields(e,dISO,adding){
  var wd=parseISO(dISO).getDay();
  return [{k:"t",label:"Intitulé",value:e?e.t:""},{k:"s",label:"Début",type:"time",value:e?e.s:"14:00"},{k:"e",label:"Fin",type:"time",value:e?e.e:"15:00"},
    {k:"sub",label:"Matière",type:"select",options:[["maths","Maths"],["hgg","HGG"],["csh","CSH"],["ang","Anglais"],["all","Allemand"],["neutral","Autre / routine"]],value:e?e.sub:"maths"},
    {k:"scope",label:"S'applique",type:"radio",options:[["d","Ce "+WD_NAMES[wd]+" seulement"],["w","Chaque "+WD_NAMES[wd]]],value:"d"}];
}
function slotLayer(scope,dISO){ var A=st().agendaEdits=st().agendaEdits||{}, k=scope==="w"?"w"+parseISO(dISO).getDay():dISO; return A[k]=A[k]||{hide:{},mod:{},add:[]}; }
function editSlot(dISO,id){
  var e=dayEvents(dISO).find(function(x){ return x.id===id; }); if(!e) return;
  var A=st().agendaEdits||{}, wd=parseISO(dISO).getDay();
  function ownerAdd(){ var r=null; [dISO,"w"+wd].forEach(function(k){ var L=A[k]; if(L&&L.add) L.add.forEach(function(x){ if(x.id===id) r=x; }); }); return r; }
  var chk=function(v){ if(!v.t.trim()) return "L'intitulé est vide."; if(!v.s||!v.e||toMin(v.e)<=toMin(v.s)) return "La fin doit être après le début."; };
  formSheet({title:"Modifier le créneau", eyebrow:fmtLong(dISO), cls:subj(e.sub).cls, fields:slotFields(e,dISO),
    save:function(v){ var bad=chk(v); if(bad) return bad; var ad=ownerAdd(); var vals={s:v.s,e:v.e,t:v.t.trim(),sub:v.sub};
      if(ad){ for(var k in vals) ad[k]=vals[k]; if(v.sub!==ad.sub) delete ad.subs; return; }
      slotLayer(v.scope,dISO).mod[id]=vals; },
    del:function(v){ var ad=ownerAdd(); if(ad){ [dISO,"w"+wd].forEach(function(k){ var L=A[k]; if(L&&L.add) L.add=L.add.filter(function(x){ return x.id!==id; }); }); return; } slotLayer(v.scope,dISO).hide[id]=true; },
    delLabel:"Supprimer le créneau",
    reset:e.edited?function(){ [dISO,"w"+wd].forEach(function(k){ var L=A[k]; if(L&&L.mod) delete L.mod[id]; }); }:null, resetLabel:"Rétablir l'horaire type",
    toast:"Créneau modifié." });
}
function addSlot(dISO,startMin){
  var F=slotFields(null,dISO,true); if(startMin!=null){ F[1].value=fromMin(startMin); F[2].value=fromMin(Math.min(H1,startMin+60)); }
  formSheet({title:"Nouveau créneau", eyebrow:fmtLong(dISO), fields:F,
    save:function(v){ if(!v.t.trim()) return "Donne un intitulé."; if(!v.s||!v.e||toMin(v.e)<=toMin(v.s)) return "La fin doit être après le début.";
      var kind=v.sub==="neutral"?"fixed":"work"; slotLayer(v.scope,dISO).add.push({id:uid("slot"),kind:kind,s:v.s,e:v.e,t:v.t.trim(),sub:v.sub}); }, toast:"Créneau ajouté." });
}

/* ---------- agenda : glisser pour déplacer, tirer le bas pour allonger, toucher le vide pour créer (façon Google Agenda) ---------- */
var drag=null, noClickUntil=0;
function snap5(m){ return Math.round(m/5)*5; }
function calCols(){ return Array.prototype.slice.call(document.querySelectorAll(".cal-col[data-col]")); }
function colAtX(x){ var c=calCols(); for(var i=0;i<c.length;i++){ var r=c[i].getBoundingClientRect(); if(x>=r.left&&x<r.right) return c[i]; } return null; }
function toastAct(msg,acts){
  document.querySelectorAll(".toast").forEach(function(t){ t.remove(); });
  var el=document.createElement("div"); el.className="toast act"; el.setAttribute("role","status");
  el.innerHTML='<span>'+esc(msg)+'</span>'+acts.map(function(a,i){ return '<button data-i="'+i+'">'+esc(a[0])+'</button>'; }).join("");
  document.body.appendChild(el);
  var t=setTimeout(close,6000); function close(){ el.classList.add("out"); setTimeout(function(){ el.remove(); },260); }
  el.addEventListener("click",function(ev){ var b=ev.target.closest("button"); if(!b) return; clearTimeout(t); close(); acts[+b.getAttribute("data-i")][1](); });
}
function slotOwner(dISO,id){ var A=st().agendaEdits||{}, wd=parseISO(dISO).getDay(), r=null; [dISO,"w"+wd].forEach(function(k){ var L=A[k]; if(L&&L.add) L.add.forEach(function(x){ if(x.id===id) r={x:x,k:k}; }); }); return r; }
/* enregistre un déplacement ou un changement de durée (ce jour-là ; « Chaque semaine » dans la bulle pour le rendre permanent) */
function moveSlot(d0,id,d1,s,e){
  var before=JSON.stringify({a:st().agendaEdits||{},t:st().tasks}), A=st().agendaEdits=st().agendaEdits||{}, weekly=null;
  var S1=fromMin(s), E1=fromMin(e);
  if(/^task-/.test(id)){ var tk=st().tasks.find(function(x){ return "task-"+x.id===id; }); if(tk){ tk.day=d1; tk.time=S1; tk.dur=e-s; } }
  else {
    var base=id.replace(/-[az]$/,""), own=slotOwner(d0,base);
    if(d1===d0){
      if(own&&own.k===d0){ own.x.s=S1; own.x.e=E1; }
      else { var L=slotLayer("d",d0); L.mod[base]=Object.assign({},L.mod[base]||{},{s:S1,e:E1}); if(!own) weekly=base; }
    } else {
      var src=dayEvents(d0).concat(timedTasks(d0)).find(function(x){ return x.id===id; })||{};
      var cp={id:uid("slot"),kind:src.kind==="fixed"?"fixed":"work",s:S1,e:E1,t:src.t||"Créneau",sub:src.sub||"neutral"};
      ["subs","crit","soir","light","trad","rac","plan","items","actu","bonus"].forEach(function(k){ if(src[k]!=null) cp[k]=src[k]; });
      if(own&&own.k===d0) A[d0].add=A[d0].add.filter(function(x){ return x.id!==base; }); else slotLayer("d",d0).hide[base]=true;
      slotLayer("d",d1).add.push(cp);
    }
  }
  save(); if(typeof Plan!=="undefined") Plan.invalidate(); render();
  var acts=[["Annuler",function(){ var o=JSON.parse(before); st().agendaEdits=o.a; st().tasks=o.t; save(); if(typeof Plan!=="undefined") Plan.invalidate(); render(); toast("Modification annulée."); }]];
  if(weekly) acts.push(["Chaque semaine",function(){ var L=slotLayer("d",d0), W=slotLayer("w",d0); W.mod[weekly]=Object.assign({},W.mod[weekly]||{},L.mod[weekly]); delete L.mod[weekly]; save(); if(typeof Plan!=="undefined") Plan.invalidate(); render(); toast("Appliqué chaque "+WD_NAMES[parseISO(d0).getDay()]+"."); }]);
  toastAct((d1!==d0?fmtDay(d1)+" · ":"")+hLabel(S1)+"–"+hLabel(E1),acts);
}
/* supprimer un créneau d'un geste (ce jour-là ; « Chaque semaine » ou « Annuler » dans la bulle) */
function slotDel(d0,id){
  var before=JSON.stringify(st().agendaEdits||{}), A=st().agendaEdits=st().agendaEdits||{}, base=id.replace(/-[az]$/,""), own=slotOwner(d0,base), weekly=null;
  if(own) A[own.k].add=A[own.k].add.filter(function(x){ return x.id!==base; }); else { slotLayer("d",d0).hide[base]=true; weekly=base; }
  save(); if(typeof Plan!=="undefined") Plan.invalidate(); closeSheet(); render();
  var acts=[["Annuler",function(){ st().agendaEdits=JSON.parse(before); save(); if(typeof Plan!=="undefined") Plan.invalidate(); render(); toast("Créneau rétabli."); }]];
  if(weekly) acts.push(["Chaque semaine",function(){ delete slotLayer("d",d0).hide[weekly]; slotLayer("w",d0).hide[weekly]=true; save(); if(typeof Plan!=="undefined") Plan.invalidate(); render(); toast("Supprimé chaque "+WD_NAMES[parseISO(d0).getDay()]+"."); }]);
  toastAct("Créneau supprimé",acts);
}
function dragLabel(){
  var txt=hLabel(fromMin(drag.s))+"–"+hLabel(fromMin(drag.e))+" · "+durTxt(drag.e-drag.s), t=drag.el.querySelector(".evt");
  if(!t){ t=document.createElement("span"); t.className="evt"; drag.el.insertBefore(t,drag.el.querySelector(".rz")); }
  t.textContent=txt;
}
function startDrag(){
  if(!drag) return; drag.active=true; drag.el.classList.add("dragging"); document.body.classList.add("cal-dragging");
  try{ drag.el.setPointerCapture(drag.pid); }catch(e){}
  if(navigator.vibrate) try{ navigator.vibrate(8); }catch(e){}
}
document.addEventListener("pointerdown",function(ev){
  if(S.view!=="agenda" || (ev.pointerType==="mouse"&&ev.button!==0)) return;
  var el=ev.target.closest(".ev[data-drag]");
  if(!el){ var col=ev.target.closest(".cal-col[data-col]"); if(col&&!ev.target.closest(".ev")) drag={create:true,col:col,x0:ev.clientX,y0:ev.clientY}; return; }
  var rz=ev.target.classList.contains("rz"), s=toMin(el.getAttribute("data-s")), e=toMin(el.getAttribute("data-e"));
  drag={el:el,mode:rz?"resize":"move",d0:el.getAttribute("data-d"),d1:el.getAttribute("data-d"),id:el.getAttribute("data-id"),s0:s,e0:e,s:s,e:e,x0:ev.clientX,y0:ev.clientY,pid:ev.pointerId,touch:ev.pointerType!=="mouse",active:false};
  if(drag.touch){ if(rz) startDrag(); else drag.timer=setTimeout(startDrag,320); }
});
document.addEventListener("pointermove",function(ev){
  if(!drag||drag.create) return;
  var dx=ev.clientX-drag.x0, dy=ev.clientY-drag.y0;
  if(!drag.active){
    if(drag.touch){ if(Math.abs(dx)+Math.abs(dy)>8){ clearTimeout(drag.timer); drag=null; } return; }
    if(Math.abs(dx)+Math.abs(dy)<4) return; startDrag();
  }
  ev.preventDefault();
  var dm=dy/PX, len=drag.e0-drag.s0;
  if(drag.mode==="move"){
    drag.s=Math.max(H0,Math.min(H1-len,snap5(drag.s0+dm))); drag.e=drag.s+len;
    var col=colAtX(ev.clientX); if(col&&col.getAttribute("data-col")!==drag.d1){ drag.d1=col.getAttribute("data-col"); col.appendChild(drag.el); }
  } else { drag.e=Math.max(drag.s0+15,Math.min(H1,snap5(drag.e0+dm))); }
  drag.el.style.top=((drag.s-H0)*PX)+"px"; drag.el.style.height=Math.max((drag.e-drag.s)*PX-2,18)+"px";
  drag.el.style.left=""; drag.el.style.width=""; drag.el.style.right="";
  dragLabel();
},{passive:false});
document.addEventListener("touchmove",function(ev){ if(drag&&drag.active) ev.preventDefault(); },{passive:false});
function endDrag(ev,cancel){
  if(!drag) return; var d=drag; drag=null; clearTimeout(d.timer); document.body.classList.remove("cal-dragging");
  if(d.create){
    if(!cancel&&Math.abs(ev.clientX-d.x0)+Math.abs(ev.clientY-d.y0)<6){ var r=d.col.getBoundingClientRect(), m=Math.max(H0,Math.min(H1-60,Math.floor((H0+(ev.clientY-r.top)/PX)/15)*15)); noClickUntil=Date.now()+400; addSlot(d.col.getAttribute("data-col"),m); }
    return;
  }
  if(!d.active) return;
  noClickUntil=Date.now()+400; d.el.classList.remove("dragging");
  if(cancel||(d.s===d.s0&&d.e===d.e0&&d.d1===d.d0)){ render(); return; }
  moveSlot(d.d0,d.id,d.d1,d.s,d.e);
}
document.addEventListener("pointerup",function(ev){ endDrag(ev,false); });
document.addEventListener("pointercancel",function(ev){ endDrag(ev,true); });
document.addEventListener("click",function(ev){ if(Date.now()<noClickUntil && ev.target.closest(".cal")){ ev.stopPropagation(); ev.preventDefault(); } },true);
/* navigation : glisser à gauche ou à droite sur l'agenda (vue jour), flèches du clavier, T = aujourd'hui */
(function(){ var sx=null, sy=null;
  document.addEventListener("touchstart",function(ev){ if(S.view!=="agenda"||ev.touches.length!==1||!ev.target.closest(".cal")){ sx=null; return; } sx=ev.touches[0].clientX; sy=ev.touches[0].clientY; },{passive:true});
  document.addEventListener("touchend",function(ev){ if(sx==null||(drag&&drag.active)||Date.now()<noClickUntil){ sx=null; return; } var t=ev.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy; sx=null;
    if(Math.abs(dx)>70&&Math.abs(dy)<45&&(S.agMode||(window.innerWidth>=900?"week":"day"))==="day"){ S.agDate=iso(addDays(parseISO(S.agDate),dx<0?1:-1)); render(); } },{passive:true});
  document.addEventListener("keydown",function(ev){ if(S.view!=="agenda"||layer.innerHTML||/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||"")) return;
    var wk=(S.agMode||(window.innerWidth>=900?"week":"day"))==="week";
    if(ev.key==="ArrowLeft"||ev.key==="ArrowRight"){ S.agDate=iso(addDays(parseISO(S.agDate),(ev.key==="ArrowLeft"?-1:1)*(wk?7:1))); render(); }
    else if(ev.key==="t"||ev.key==="T"){ S.agDate=iso(today()); render(); } });
})();

/* ---------- presse du jour en anglais et en allemand (revue du matin) : civi + Anki ---------- */
var DECKS={
  en:["Anglais::Civi","Anglais::Civi::AI","Anglais::Civi::Artists and Commitment","Anglais::Civi::Climate change - Race against global warming","Anglais::Civi::Culture wars","Anglais::Civi::Navigating gender","Anglais::Civi::Politics - Starmer in the storm list","Anglais::Civi::Politics - Starmer in the storm list","Anglais::Civi::Politics in the UK","Anglais::Civi::The challenges facing education","Anglais::Civi::The media","Anglais::Civi::The US","Anglais::Civi::Tipping the scales - justice and politics in Trump's America","Anglais::Oral - Ecrit::Expressions","Anglais::Oral - Ecrit::Nouns","Anglais::Oral - Ecrit::Verbs"],
  de:["Allemand::Civi","Allemand::Civi::Administration, vie en collectivité","Allemand::Civi::Arbeit","Allemand::Civi::Das deutsch-französische Tandem","Allemand::Civi::die AfD","Allemand::Civi::Die Debatte über der Pflichtdienst","Allemand::Civi::Die Länder","Allemand::Civi::Kulturkampf ums Bauhaus (Sachsen-Anhalt)","Allemand::Civi::Migration","Allemand::Civi::Ost-West","Allemand::Civi::Politik","Allemand::Civi::Verrohung der Sprache","Allemand::Civi::Wirtschaft","Allemand::Civi::Ökonomie und Industrie","Allemand::Vocabulaire général::Expressions"]
};
var ANKI_MODEL={en:"Anglais FR-EN sobre (nuit)",de:"Allemand <-> Français (éco)"};
var CIVI_DOC={en:"https://docs.google.com/document/d/1IAtxlkQi-rZg4czoK_PkzHdynwslKpz2AAljBstiqho/edit",de:"https://docs.google.com/document/d/1N1yQu4GTpNpne1TUWBkwg8i2zWYCY7pp6GQnBDUg7vM/edit"};
var PRESS={data:null,date:null,err:null,loading:false,sections:null,dates:[]};
function gUrl(){ return ((st().gapi||{}).url||"").trim(); }
function pressMark(){ var s=st(); s.press=s.press||{}; return s.press; }
function gGet(params){ var u=gUrl(); if(!u) return Promise.reject(new Error("Passerelle Google non connectée.")); return fetch(u+(u.indexOf("?")>=0?"&":"?")+params,{redirect:"follow"}).then(function(r){ return r.json(); }); }
function gPost(body){ var u=gUrl(); if(!u) return Promise.reject(new Error("Passerelle Google non connectée.")); return fetch(u,{method:"POST",redirect:"follow",body:JSON.stringify(body)}).then(function(r){ return r.json(); }).then(function(j){ if(!j||!j.ok) throw new Error((j&&j.error)||"Réponse inattendue."); return j; }); }
function pressLoad(date,force){
  if(PRESS.loading || (!force && PRESS.data && (!date||PRESS.date===date))) return;
  if(!gUrl()) return;
  if(!date){ try{ var c=JSON.parse(localStorage.getItem("prepa.press")||"null"); if(c&&c.data&&!PRESS.data){ PRESS.data=c.data; PRESS.date=c.data.date; PRESS.dates=c.dates||[]; } }catch(e){} }
  PRESS.loading=true; PRESS.err=null;
  gGet("action=news"+(date?"&date="+date:"")).then(function(j){
    PRESS.loading=false; PRESS.dates=j.dates||PRESS.dates;
    if(!j.ok){ PRESS.err=j.error; render(); return; }
    PRESS.data=j.data; PRESS.date=j.data.date; if(!date) try{ localStorage.setItem("prepa.press",JSON.stringify({data:j.data,dates:PRESS.dates})); }catch(e){}
    render();
  },function(e){ PRESS.loading=false; PRESS.err="Passerelle injoignable : "+(e&&e.message||e); render(); });
  if(!PRESS.sections) gGet("action=sections").then(function(j){ if(j.ok){ PRESS.sections={en:j.en,de:j.de}; } },function(){});
}
function pressSetup(lang){
  return '<section class="card"><div class="card-h"><h2>'+(lang==="en"?"🇬🇧":"🇩🇪")+' Presse du jour</h2></div><p class="small muted" style="margin:0 0 10px">Chaque matin, trois articles '+(lang==="en"?"du monde anglophone":"sur l'Allemagne")+' avec leur vocabulaire. Pour les recevoir ici, puis les ajouter à ta civi et à Anki en un geste, connecte une fois la passerelle Google.</p><button class="btn primary sm" data-a="gapisetup">Connecter la passerelle Google</button></section>';
}
function pressCard(lang){
  if(!gUrl()) return pressSetup(lang);
  pressLoad();
  var flag=lang==="en"?"🇬🇧":"🇩🇪", D=PRESS.data, list=D&&D[lang]||[];
  var h='<section class="card press"><div class="card-h"><h2>'+flag+' Presse du jour</h2><span class="small muted">'+(D?fmtLong(D.date):"")+'</span></div>';
  if(PRESS.dates&&PRESS.dates.length>1){ var ds=PRESS.dates.slice(-7).reverse(); h+='<div class="chips-x">'+ds.map(function(d){ return '<button class="chip'+(D&&D.date===d?" on":"")+'" data-a="pressday" data-d="'+d+'">'+fmtDay(d)+'</button>'; }).join("")+'</div>'; }
  if(PRESS.loading&&!D) return h+'<div class="empty">Chargement…</div></section>';
  if(PRESS.err&&!D) return h+'<div class="empty"><b>Pas de presse</b>'+esc(PRESS.err)+'</div></section>';
  if(!list.length) return h+'<div class="empty">Pas d\'article dans cette langue pour ce jour.</div></section>';
  var M=pressMark();
  list.forEach(function(a,i){
    var key=D.date+"|"+lang+"|"+(a.id||i), m=M[key]||{};
    h+='<article class="pa" data-key="pa-'+esc(key)+'"><div class="pa-top">'+(a.principal?'<span class="chip blu">À la une</span>':'')+'<span class="chip">'+esc(a.rubrique||"")+'</span>'+(a.pays?'<span class="chip">'+esc(a.pays)+'</span>':'')+'</div>';
    h+='<h3>'+esc(a.titre||"")+'</h3><p class="pa-txt">'+esc(a.texte||"")+'</p>'+(a.source&&a.source.url?'<a class="small" href="'+esc(a.source.url)+'" target="_blank" rel="noopener">'+esc(a.source.label||"Source")+' '+I.arrow+'</a>':'');
    var voc=a.vocab||[];
    if(voc.length){
      h+='<div class="pa-voc"><div class="group-h">Vocabulaire <span class="n">'+voc.length+'</span></div><ul>'+voc.map(function(v,j){ return '<li><label><input type="checkbox" data-pv="'+esc(key)+'" data-j="'+j+'"'+(m.ankiSel&&m.ankiSel.indexOf(j)<0?"":" checked")+'><span class="t">'+esc(v.t)+(v.uk?' <span class="uk">UK</span>':'')+'</span><span class="f">'+esc(v.f)+'</span></label></li>'; }).join("")+'</ul>';
      var deck=m.deck||a.paquet||DECKS[lang][0];
      h+='<div class="pa-anki"><select class="field sm" data-pdeck="'+esc(key)+'">'+DECKS[lang].concat(DECKS[lang].indexOf(deck)<0?[deck]:[]).map(function(d){ return '<option value="'+esc(d)+'"'+(d===deck?" selected":"")+'>'+esc(d.replace(/^(Anglais|Allemand)::/,""))+'</option>'; }).join("")+'<option value="__new">Autre paquet…</option></select>'+
        '<button class="btn sm '+(m.anki?"":"tint")+'" data-a="panki" data-k="'+esc(key)+'" data-l="'+lang+'" data-i="'+i+'">'+(m.anki?"✓ Envoyé · renvoyer":"Envoyer à Anki")+'</button></div></div>';
    }
    h+='<div class="pa-act"><button class="btn sm '+(m.civi?"":"primary")+'" data-a="pcivi" data-k="'+esc(key)+'" data-l="'+lang+'" data-i="'+i+'">'+(m.civi?"✓ Dans ta civi · rajouter":"Ajouter à ma civi")+'</button>'+(m.civi?'<a class="small" href="'+CIVI_DOC[lang]+'" target="_blank" rel="noopener">Ouvrir le document '+I.arrow+'</a>':'')+'</div></article>';
  });
  return h+'</section>';
}
function pressArt(lang,i){ return ((PRESS.data||{})[lang]||[])[+i]; }
function civiSheet(key,lang,i){
  var a=pressArt(lang,i); if(!a) return; var c=a.civi||{}, secs=(PRESS.sections||{})[lang]||[];
  var opts=secs.slice(); if(c.section&&opts.map(norm).indexOf(norm(c.section))<0) opts.unshift(c.section);
  formSheet({title:"Ajouter à ma civi", eyebrow:(lang==="en"?"🇬🇧 NOTHING NEW ON THE ENGLISH-SPEAKING FRONT":"🇩🇪 CIVI"), fields:[
    {k:"section",label:"Partie du document",type:"select",options:opts.map(function(x){ return [x,x]; }).concat([["__new","Nouvelle partie…"]]),value:c.section||opts[0]||"__new"},
    {k:"newsec",label:"Nouvelle partie (si choisie)",value:"",hint:"En majuscules, comme tes titres."},
    {k:"titre",label:"Titre du point",value:c.titre||a.titre||""},
    {k:"puces",label:"Notes (une puce par ligne, **gras** pour l'essentiel)",type:"textarea",rows:8,value:(c.puces||[]).join("\n")}],
    save:function(v){
      var sec=v.section==="__new"?v.newsec.trim():v.section; if(!sec) return "Choisis une partie ou nomme la nouvelle.";
      var puces=String(v.puces||"").split(/\n+/).map(function(x){ return x.replace(/^[-•*]\s+/,"").trim(); }).filter(Boolean);
      gPost({action:"civi",lang:lang,section:sec,titre:v.titre.trim(),puces:puces,source:a.source||null,date:PRESS.data.date}).then(function(j){ var M=pressMark(); M[key]=Object.assign({},M[key]||{},{civi:iso(today())}); save(); render(); toast(j.nouvelle?"Ajouté dans une nouvelle partie « "+sec+" ».":"Ajouté dans « "+sec+" »."); },function(e){ toast("Ajout impossible : "+(e&&e.message||e)); });
    }, toast:"Envoi vers ton document…" });
}
/* Anki : directement si Anki est ouvert sur cet ordinateur (AnkiConnect), sinon file d'attente traitée dès que l'ordinateur est allumé */
function ankiDirect(notes){
  var ctl=window.AbortController?new AbortController():null, t=setTimeout(function(){ if(ctl) ctl.abort(); },1800);
  return fetch("http://127.0.0.1:8765",{method:"POST",body:JSON.stringify({action:"multi",version:6,params:{actions:[{action:"createDeck",params:{deck:notes[0].deckName}},{action:"addNotes",params:{notes:notes}}]}}),signal:ctl?ctl.signal:undefined})
    .then(function(r){ clearTimeout(t); return r.json(); }).then(function(j){ if(!j||j.error) throw new Error(j&&j.error||"AnkiConnect"); var res=j.result&&j.result[1]; return (res&&res.result)||res; });
}
function pressAnki(key,lang,i){
  var a=pressArt(lang,i); if(!a) return; var M=pressMark(), m=M[key]||{};
  var sel=Array.prototype.slice.call(document.querySelectorAll('[data-pv]')).filter(function(x){ return x.getAttribute("data-pv")===key && x.checked; }).map(function(x){ return +x.getAttribute("data-j"); });
  if(!sel.length){ toast("Coche au moins un mot."); return; }
  var deck=m.deck||a.paquet||DECKS[lang][0], tag="presse_"+PRESS.data.date;
  var cards=sel.map(function(j){ var v=a.vocab[j]; return {id:key+"#"+j,lang:lang,deck:deck,model:ANKI_MODEL[lang],front:lang==="en"?v.f:v.t,back:lang==="en"?v.t+(v.uk?" (UK)":""):v.f,note:a.titre||"",tags:"presse "+tag}; });
  var notes=cards.map(function(c){ var f=lang==="en"?{Front:c.front,Back:c.back,Note:c.note}:{Allemand:c.front,Francais:c.back}; return {deckName:deck,modelName:c.model,fields:f,tags:["presse",tag],options:{allowDuplicate:false}}; });
  var done=function(msg){ M[key]=Object.assign({},M[key]||{},{anki:iso(today())}); save(); render(); toast(msg); };
  ankiDirect(notes).then(function(r){ var ok=(r||[]).filter(function(x){ return x; }).length; done(ok+" carte"+(ok>1?"s":"")+" ajoutée"+(ok>1?"s":"")+" dans « "+deck.split("::").pop()+" »"+(ok<notes.length?" ("+(notes.length-ok)+" déjà présente"+(notes.length-ok>1?"s":"")+")":"")+"."); },
    function(){ gPost({action:"anki",cards:cards}).then(function(){ done(cards.length+" mot"+(cards.length>1?"s":"")+" en file : ils arrivent dans Anki dès que ton ordinateur est allumé avec Anki ouvert."); },function(e){ toast("Envoi impossible : "+(e&&e.message||e)); }); });
}
function gapiSetup(){
  formSheet({title:"Passerelle Google", eyebrow:"Une seule fois", fields:[
    {k:"url",label:"Adresse de l'application Web (se termine par /exec)",value:gUrl(),hint:"1) Ouvre script.google.com → Nouveau projet. 2) Colle le code du fichier Code.gs (lien ci-dessous) à la place du code. 3) Déployer → Nouveau déploiement → Application Web ; Exécuter en tant que : moi ; Accès : tout le monde. 4) Autorise l'accès à ton Drive, puis colle ici l'adresse obtenue."}],
    save:function(v){ var u=v.url.trim(); if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(u)) return "L'adresse doit ressembler à https://script.google.com/macros/s/…/exec"; st().gapi={url:u}; PRESS.data=null; PRESS.sections=null; },
    after:null, toast:"Passerelle connectée." });
  var b=layer.querySelector(".sheet-b"); if(b) b.insertAdjacentHTML("beforeend",'<a class="ext" href="https://github.com/alexandrenkvanrossum-ship-it/pr-pa/blob/main/supabase/apps-script/Code.gs" target="_blank" rel="noopener"><div><b>Code.gs</b><span class="small muted">Le code à coller dans Apps Script</span></div><span class="btn tint sm">Ouvrir '+I.arrow+'</span></a>');
}

/* ---------- liste des vacances ---------- */
function nextVac(){ var t=iso(today()); return VACANCES.filter(function(v){ return v.to>=t; }).sort(function(a,b){ return a.from.localeCompare(b.from); })[0]||null; }
function vacCard(list){
  var v=nextVac(), t=iso(today());
  var h='<section class="card"><div class="card-h"><h2>Pour les vacances</h2><span class="small muted">'+(v?(inVacances(t)?"en cours · ":"")+esc(v.name)+" · "+fmtDay(v.from)+" → "+fmtDay(v.to):"prochaines vacances")+'</span></div>';
  if(!list.length) return h+'<div class="empty"><b>Rien pour l\'instant</b>Ajoute une tâche en touchant « Vacances » sous la barre de saisie, ou en écrivant « vac : … » ou « … pendant les vacances ».</div></section>';
  var by={}; list.forEach(function(x){ (by[x.sub]=by[x.sub]||[]).push(x); });
  SUBJECT_ORDER.concat(["perso"]).forEach(function(id){ if(!by[id]) return; h+='<div class="group-h" style="margin-top:6px">'+esc(subj(id).name)+' <span class="n">'+by[id].length+'</span></div><div class="tasks">'+taskRows(by[id])+'</div>'; });
  var tot=list.reduce(function(a,x){ return a+(x.dur||0); },0);
  h+='<div class="row" style="justify-content:space-between;gap:8px;margin-top:10px;flex-wrap:wrap"><span class="small muted">'+plural(list.length,"tâche")+(tot?" · environ "+durTxt(tot)+" estimées":"")+' · pas planifiées avant les vacances</span><button class="btn tint sm" data-a="vaccopy">Copier pour Claude</button></div>';
  return h+'</section>';
}
function vacText(){
  var v=nextVac(), l=st().tasks.filter(function(x){ return x.vac && !x.done; });
  return "Organisons mes vacances"+(v?" de la "+v.name+" ("+fmtDay(v.from)+" → "+fmtDay(v.to)+")":"")+". Voici ma liste :\n"+l.map(function(x){ return "- ["+subj(x.sub).name+"] "+x.title+(x.dur?" ("+durTxt(x.dur)+")":"")+(x.prio?" "+"!!!".slice(0,x.prio):""); }).join("\n");
}
function sheetText(txt){ openSheet('<div class="sheet-h"><div class="ttl"><h2>Ta liste des vacances</h2><div class="small muted">Sélectionne et copie ce texte, puis colle-le à Claude.</div></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b"><textarea class="field" style="min-height:260px" readonly>'+esc(txt)+'</textarea></div>'); }

/* ---------- Fichiers, maths, HGG (parties 2 et 3) ---------- */
function whenTxt(key){ var w=typeof Plan!=="undefined"?Plan.whenOf(key):null; if(!w) return ""; var a=w[0]; return (a.d===iso(today())?"auj.":fmtDay(a.d))+" "+hLabel(a.s)+(w.length>1?" (+"+(w.length-1)+")":""); }
function renderMath(el){ try{ if(window.renderMathInElement) renderMathInElement(el||document.body,{delimiters:[{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false},{left:"\\(",right:"\\)",display:false},{left:"\\[",right:"\\]",display:true}],throwOnError:false}); }catch(e){} }
var FILE_KINDS={maths:[["cours","Cours"],["td","TD"],["exos","Exercices d'accompagnement"],["dm","DM"],["corrige","Corrigé"],["copie","Copie de concours"],["autre","Autre"]],_:[["cours","Cours"],["doc","Document"],["copie","Copie de concours"],["autre","Autre"]]};
function kindName(sub,k){ var l=(FILE_KINDS[sub]||FILE_KINDS._).filter(function(x){ return x[0]===k; })[0]; return l?l[1]:k; }
function mathsChap(){ var c=st().mathsCfg||{}; if(c.chap) return c.chap; var d=typeof MATHS_DRIVE!=="undefined"?MATHS_DRIVE:null; var x=d&&d.chapitres.filter(function(y){ return y.n===d.en_cours; })[0]; return x?x.titre:""; }
function mathsChaps(){ var a=(typeof MATHS_DRIVE!=="undefined"?MATHS_DRIVE.chapitres:[]).map(function(c){ return c.titre; }); Files.of("maths").forEach(function(f){ if(f.chap && a.indexOf(f.chap)<0) a.push(f.chap); }); return a; }
function nextMonday(){ var d=today(), k=(8-d.getDay())%7||7; return iso(addDays(d,k)); }
function fileStatus(f){
  if(f.status==="analyse" && (Files.busy(f.id) || Date.now()-new Date(f.at)<5*60000)) return '<span class="meta">analyse en cours'+(f.progress&&f.progress<100?" · "+f.progress+" %":"")+'…</span>';
  if(f.status==="err"||f.status==="analyse") return '<span class="meta late">analyse échouée</span> <button class="link-btn" data-a="freanalyse" data-id="'+f.id+'">Réessayer</button>'+(f.err?'<div class="small faint">'+esc(f.err)+'</div>':'');
  if(f.status==="ok" && f.kind==="cours") return '<span class="meta">'+plural(f.n||0,"énoncé")+' relevé'+((f.n||0)>1?"s":"")+'</span>';
  if(f.status==="ok") return '<span class="meta">'+plural(f.n||0,"exercice")+(f.corrige?" · temps estimé avec le corrigé":" · sans corrigé")+'</span>';
  if(f.kind==="corrige") return f.pair?'<span class="meta">corrigé de « '+esc((st().files[f.pair]||{}).name||"?")+' »</span>':'<span class="meta">corrigé non rattaché</span>';
  return '';
}
function filesCard(sub){
  var fs=Files.of(sub), kinds=FILE_KINDS[sub]||FILE_KINDS._, isM=sub==="maths";
  var ex=fs.filter(function(f){ return ["td","exos","dm"].indexOf(f.kind)>=0; });
  var h='<section class="card"><div class="card-h"><h2>Mes fichiers</h2><span class="small muted">'+fs.length+'</span></div>';
  h+='<p class="small muted" style="margin:0 0 10px">'+(isM?"Dépose ici cours, TD, exercices, DM et corrigés du chapitre en cours (PDF, photo, Word). L'app compte les exercices, estime leur durée (avec le corrigé si tu le donnes), les répartit sur tes créneaux de maths, et tire de ton cours les quiz de début de séance.":sub==="hgg"?"Dépose ici tes documents d'HGG (photos de cours, polycopiés…). Tes chapitres du Drive sont déjà connus de l'app.":"Dépose ici tes documents de "+subj(sub).name+" pour les retrouver partout.")+'</p>';
  if(!Sync.user()) return h+'<div class="empty"><b>Connecte-toi pour déposer des fichiers</b>Plus → Compte.</div></section>';
  h+='<form id="up-form" data-sub="'+sub+'" class="stack" style="gap:8px"><div class="grid g2" style="gap:8px">';
  h+='<select class="field" id="up-kind" aria-label="Type de fichier">'+kinds.map(function(k){ return '<option value="'+k[0]+'">'+esc(k[1])+'</option>'; }).join("")+'</select>';
  if(isM) h+='<input class="field" id="up-chap" list="up-chaps" placeholder="Chapitre" value="'+esc(mathsChap())+'"><datalist id="up-chaps">'+mathsChaps().map(function(c){ return '<option value="'+esc(c)+'">'; }).join("")+'</datalist>';
  else if(sub==="hgg") h+='<input class="field" id="up-chap" placeholder="Chapitre (facultatif)">';
  if(isM){
    h+='<label id="up-date-w" class="small muted" style="display:flex;flex-direction:column;gap:4px"><span id="up-date-l">À finir avant le</span><input class="field" type="date" id="up-date" value="'+iso(addDays(today(),13))+'"></label>';
    h+='<select class="field" id="up-pair" hidden aria-label="Corrigé de"><option value="">Corrigé de…</option>'+ex.map(function(f){ return '<option value="'+f.id+'">'+esc(kindName(sub,f.kind)+" · "+(f.label||f.name))+'</option>'; }).join("")+'</select>';
  }
  h+='</div><div class="row" style="gap:8px;flex-wrap:wrap"><label class="btn sm" style="cursor:pointer">'+I.plus+' Choisir<input type="file" id="up-file" multiple accept=".pdf,.docx,.pptx,.txt,image/*" hidden></label><span class="small muted" id="up-names">Aucun fichier choisi</span><button class="btn tint sm" type="submit" id="up-go" disabled>Téléverser</button></div></form>';
  if(fs.length){
    var byChap={}; fs.forEach(function(f){ var c=f.chap||"Sans chapitre"; (byChap[c]=byChap[c]||[]).push(f); });
    Object.keys(byChap).forEach(function(c){
      h+='<div class="group-h" style="margin-top:12px">'+esc(c)+'</div><div class="notes-list">';
      byChap[c].forEach(function(f){ h+='<div class="it" style="display:flex;gap:10px;align-items:flex-start;justify-content:space-between"><div style="min-width:0"><div style="font-weight:600;overflow-wrap:anywhere">'+esc(f.name)+'</div><div class="tm" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center"><span class="tag '+subj(sub).cls+'">'+esc(kindName(sub,f.kind))+'</span>'+fileStatus(f)+(f.kind==="dm"&&f.due?'<span class="meta">à rendre '+fmtDay(f.due)+'</span>':'')+'</div></div><div class="row" style="gap:4px;flex:none"><button class="btn sm" data-a="fopen" data-id="'+f.id+'">Ouvrir</button><button class="btn sm" data-a="fedit" data-id="'+f.id+'">Modifier</button><button class="icon-btn" data-a="fdel" data-id="'+f.id+'" aria-label="Supprimer">'+I.trash+'</button></div></div>'; });
      h+='</div>';
    });
  }
  return h+'</section>';
}
function bindUpload(){
  var f=document.getElementById("up-form"); if(!f||f._bound) return; f._bound=true;
  var fi=document.getElementById("up-file"), go=document.getElementById("up-go"), nm=document.getElementById("up-names");
  fi.addEventListener("change",function(){ go.disabled=!fi.files.length; nm.textContent=fi.files.length?Array.prototype.map.call(fi.files,function(x){ return x.name; }).join(", "):"Aucun fichier choisi"; });
  var kind=document.getElementById("up-kind");
  function sync(){ var k=kind.value, w=document.getElementById("up-date-w"), pr=document.getElementById("up-pair"), l=document.getElementById("up-date-l"), d=document.getElementById("up-date"); if(!w) return;
    w.hidden=!(k==="td"||k==="exos"||k==="dm"); pr.hidden=k!=="corrige";
    if(k==="dm"){ l.textContent="À rendre le"; d.value=nextMonday(); } else { l.textContent="À finir avant le"; if(d.value===nextMonday()) d.value=iso(addDays(today(),13)); } }
  kind.addEventListener("change",sync); sync();
  f.addEventListener("submit",function(ev){
    ev.preventDefault(); var sub=f.getAttribute("data-sub"), files=Array.prototype.slice.call(fi.files); if(!files.length) return;
    var meta={sub:sub, kind:kind.value, chap:(document.getElementById("up-chap")||{}).value||""};
    var d=document.getElementById("up-date"); if(d && !document.getElementById("up-date-w").hidden){ if(meta.kind==="dm") meta.due=d.value; else meta.target=d.value; }
    var pr=document.getElementById("up-pair"); if(pr && meta.kind==="corrige") meta.pair=pr.value||null;
    if(meta.kind==="corrige" && !meta.pair && sub==="maths"){ toast("Choisis le TD ou le DM que ce corrigé accompagne."); return; }
    if(sub==="maths" && meta.chap){ st().mathsCfg=st().mathsCfg||{}; }
    go.disabled=true; go.textContent="Envoi…";
    var chain=Promise.resolve(), n=0;
    files.forEach(function(file){ chain=chain.then(function(){ return Files.upload(file,meta).then(function(rec){ n++; if(Files.analysable(rec)||(rec.kind==="corrige"&&rec.pair)){ Files.analyze(rec.id).then(function(){ toast("Analyse terminée : "+rec.name); Plan.invalidate(); window.__prepaRefresh(); },function(e){ toast("Analyse impossible : "+(e&&e.message||e)); window.__prepaRefresh(); }); } }); }); });
    chain.then(function(){ toast(plural(n,"fichier")+" envoyé"+(n>1?"s":"")+(sub==="maths"&&meta.kind!=="autre"?" · analyse en cours (jusqu'à une minute)":"")+"."); render(); },function(e){ toast(e&&e.message||"Envoi impossible."); render(); });
  });
}

/* ---------- Maths : exercices et quiz ---------- */
function exoCard(){
  var s=st(), fs=Files.of("maths").filter(function(f){ return (f.kind==="td"||f.kind==="exos") && s.mathsEx[f.id]; });
  var h='<section class="card"><div class="card-h"><h2>Exercices à faire</h2></div>';
  if(!fs.length) return h+'<div class="empty"><b>Aucun TD analysé</b>Dépose ton TD (et son corrigé) dans « Mes fichiers » : l\'app compte les exercices et les répartit sur tes créneaux de maths.</div></section>';
  var all=[]; fs.forEach(function(f){ (s.mathsEx[f.id].exos||[]).forEach(function(e,i){ all.push({f:f,e:e,k:f.id+"#"+i}); }); });
  var left=all.filter(function(x){ return !s.mathsDone[x.k]; }), mins=left.reduce(function(a,x){ return a+(x.e.minutes||30); },0);
  var P=Plan.get(), late=P.unplaced.filter(function(x){ return x.ref&&x.ref.k==="exo"; });
  h+='<div class="row" style="gap:16px;flex-wrap:wrap;margin-bottom:8px"><div><div style="font-size:26px;font-weight:800">'+left.length+'<span class="small muted"> / '+all.length+'</span></div><div class="small muted">exercices restants</div></div><div><div style="font-size:26px;font-weight:800">'+durTxt(mins)+'</div><div class="small muted">de travail estimé</div></div></div>';
  if(late.length) h+='<div class="note-box" style="margin:0 0 8px">'+plural(late.length,"exercice")+' ne tiennent pas dans tes créneaux avant la date choisie : repousse la date ou marque des exercices comme faits.</div>';
  fs.forEach(function(f){
    var X=s.mathsEx[f.id], ex=X.exos||[], dn=ex.filter(function(e,i){ return s.mathsDone[f.id+"#"+i]; }).length;
    h+='<details class="card flat" style="margin-top:8px"'+(dn<ex.length?" open":"")+'><summary style="cursor:pointer"><b>'+esc(f.label||f.name)+'</b> <span class="small muted">· '+esc(X.chap||f.chap||"")+' · '+dn+'/'+ex.length+' faits · à finir avant '+(f.target?fmtDay(f.target):"—")+(X.corrige?"":" · sans corrigé")+'</span></summary><div class="tasks" style="margin-top:6px">';
    ex.forEach(function(e,i){ var k=f.id+"#"+i, d=!!s.mathsDone[k], w=whenTxt("exo|"+k);
      h+='<div class="task'+(d?" done":"")+'"><button class="check'+(d?" on":"")+'" data-a="exo" data-k="'+esc(k)+'" aria-label="Fait">'+(d?I.check:"")+'</button><div class="tt"><span>Ex. '+esc(e.num)+(e.titre?' · '+esc(e.titre):'')+(e.classique?' <span title="classique à savoir refaire">★</span>':'')+'</span><div class="tm"><span class="meta">'+durTxt(e.minutes||30)+'</span><span class="meta">'+["","facile","moyen","difficile"][e.difficulte||2]+'</span>'+(e.questions?'<span class="meta">'+plural(e.questions,"question")+'</span>':'')+(d?'':w?'<span class="meta">prévu '+esc(w)+'</span>':'<span class="meta late">pas de créneau</span>')+'</div></div><span class="row" style="gap:2px"><button class="chip" data-a="exomin" data-k="'+esc(k)+'" data-v="-10" aria-label="Moins de temps">−</button><button class="chip" data-a="exomin" data-k="'+esc(k)+'" data-v="10" aria-label="Plus de temps">+</button></span></div>'; });
    h+='</div></details>';
  });
  return h+'</section>';
}
function quizPool(){
  var s=st(), out=[];
  Object.keys(s.mathsCours||{}).forEach(function(fid){ if(!s.files[fid]) return; (s.mathsCours[fid].items||[]).forEach(function(it,i){ if(s.quizOff[fid+"|"+it.section] || it.off) return; out.push({k:fid+"#"+i, it:it, fid:fid, chap:s.mathsCours[fid].chap}); }); });
  return out;
}
function quizPick(n){
  var s=st(), t=iso(today()), due=[], fresh=[], cur=mathsChap();
  quizPool().forEach(function(x){ var q=s.quiz[x.k]; if(!q) fresh.push(x); else if(q.n<=t) due.push(x); });
  due.sort(function(a,b){ return s.quiz[a.k].l-s.quiz[b.k].l; });
  fresh.sort(function(a,b){ return (b.chap===cur)-(a.chap===cur); });
  var out=due.slice(0,n); return out.concat(fresh.slice(0,Math.max(0,Math.min(5,n-out.length)))).map(function(x){ return x.k; });
}
/* ---------- mise en page d'un énoncé, façon cours : hypothèses, énumérations (i), (ii)…, formules centrées ---------- */
function thmKind(t){ t=norm(t||""); return /defin/.test(t)?"def":/theor|corol|lemm/.test(t)?"thm":/method/.test(t)?"meth":/remar/.test(t)?"rem":"prop"; }
function fmtEnonce(src){
  var txt=String(src||"").replace(/\r/g,"").trim(), parts=[], re=/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, m, last=0;
  while((m=re.exec(txt))){ if(m.index>last) parts.push({t:txt.slice(last,m.index)}); parts.push(m[1]!=null?{d:m[1]}:{m:m[2]}); last=re.lastIndex; }
  if(last<txt.length) parts.push({t:txt.slice(last)});
  /* indices écrits à plat dans le texte : F1, B2, Fp → F₁… (lettre majuscule isolée suivie d'un chiffre ou de p) */
  var tok=[]; parts.forEach(function(p){ if(p.t==null){ tok.push(p); return; }
    var t0=p.t.replace(/\.\s?\.\s?\./g,"…").replace(/\s+([:;?!])/g,"\u00a0$1");
    /* F1, Bp → indices ; lettre majuscule isolée (E, F…) ; « soit n / soient p » → variables mathématiques */
    var r2=/(\b[A-Z](?:\d{1,2}|p)\b)|((?:^|[\s(,;:])([B-HJ-Z])(?=[\s.,;:)]|$))|(\b(?:[Ss]oi(?:en)?t)\s+([a-z])\b)/g, a=0, k;
    while((k=r2.exec(t0))){
      var pre=t0.slice(a,k.index), math, lead="";
      if(k[1]){ var mm=k[1].match(/^([A-Z])(.+)$/); math=mm[1]+"_{"+mm[2]+"}"; }
      else if(k[2]){ lead=k[2].slice(0,k[2].length-1); math=k[3]; }
      else { lead=k[4].slice(0,k[4].length-1); math=k[5]; }
      tok.push({t:pre+lead}); tok.push({m:math}); a=r2.lastIndex; }
    if(a<t0.length) tok.push({t:t0.slice(a)}); });
  /* découpe en blocs : paragraphes, items d'énumération */
  var ENUM=/(^|\s|:)\(((?:i{1,3}|iv|vi{0,3}|ix|x)|[a-h]|\d{1,2})\)\s+/g, LEAD=/(\s)(Alors|Dans ce cas|Les assertions suivantes sont équivalentes|Les propositions suivantes sont équivalentes|On a alors|De plus|Réciproquement|Si de plus)\b/g;
  var stream=""; var store=[];
  tok.forEach(function(p){ if(p.t!=null) stream+=p.t.replace(LEAD,"\n$2"); else { store.push(p); stream+="\u0000"+(store.length-1)+"\u0001"; } });
  stream=stream.replace(ENUM,function(all,pre,lab){ return (pre===":"?":":"")+"\n\u0002"+lab+"\u0003"; });
  function inline(x){ return x.split(/\u0000(\d+)\u0001/).map(function(seg,i){ if(i%2===0) return esc(seg); var p=store[+seg]; if(p.d!=null) return '<span class="dmath">$$'+esc(breakMath(p.d))+'$$</span>'; var long=p.m.length>48 || /\\(iff|implies|Longleftrightarrow|Longrightarrow)/.test(p.m); return long?'<span class="dmath">$$'+esc(breakMath(p.m))+'$$</span>':'$'+esc(p.m)+'$'; }).join(""); }
  var out="", inList=false;
  stream.split(/\n+/).forEach(function(line){ line=line.trim(); if(!line) return;
    var it=line.match(/^\u0002([^\u0003]+)\u0003\s*([\s\S]*)$/);
    if(it){ if(!inList){ out+='<ol class="enum">'; inList=true; } out+='<li><span class="lab">('+esc(it[1])+')</span><div>'+inline(it[2].replace(/[;,]\s*$/,""))+'</div></li>'; return; }
    if(inList){ out+="</ol>"; inList=false; }
    out+='<p>'+inline(line)+'</p>';
  });
  if(inList) out+="</ol>";
  return out;
}
/* longue formule : un retour à la ligne avant ⟹ / ⟺ et après le quantificateur, alignés comme dans un cours */
function breakMath(m){
  if(m.length<40 || /\\begin\{/.test(m)) return m;
  var depth=0, cuts=[], i, c;
  for(i=0;i<m.length;i++){ c=m[i]; if(c==="{"||c==="(") depth++; else if(c==="}"||c===")") depth--; else if(depth===0){
    var rest=m.slice(i); var op=rest.match(/^\\(implies|iff|Longrightarrow|Longleftrightarrow|Rightarrow|Leftrightarrow)(?![a-zA-Z])/);
    if(op){ cuts.push({at:i,keep:true}); i+=op[0].length-1; continue; }
    if(c==="," && /^\\(forall|exists)/.test(m.trim()) && !cuts.some(function(x){return x.q;})){ cuts.push({at:i+1,q:true}); } } }
  if(!cuts.length) return m;
  var lines=[], prev=0; cuts.forEach(function(x){ lines.push(m.slice(prev,x.at).trim()); prev=x.at; }); lines.push(m.slice(prev).trim());
  lines=lines.filter(Boolean);
  return "\\begin{gathered}"+lines.join(" \\\\ ")+"\\end{gathered}";
}
function quizTitle(it){
  if(it.titre) return it.titre;
  var m=String(it.nom||"").match(/\(([^)]+)\)/); if(m) return it.type+" : "+m[1];
  /* en attendant le titre : le type et le sujet de la partie du cours, jamais un simple numéro */
  var sec=String(it.section||"").replace(/^[\dIVXivx.\s)–-]+/,"").trim();
  return (it.type||"Énoncé")+(sec?" · "+sec.charAt(0).toLowerCase()+sec.slice(1):"");
}
function quizCard(){
  if(Sync.user()) setTimeout(function(){ Files.titles().then(function(){ window.__prepaRefresh(); }); },300);
  var s=st(), pool=quizPool(), t=iso(today());
  var h='<section class="card"><div class="card-h"><h2>Quiz de cours</h2><span class="small muted">15 min en début de séance</span></div>';
  if(!pool.length) return h+'<div class="empty"><b>Pas encore de cours</b>Dépose ton cours (type « Cours ») : les définitions, propriétés et théorèmes sont relevés tels qu\'ils sont écrits.</div>'+quizSections()+'</section>';
  var seen=pool.filter(function(x){ return s.quiz[x.k]; }), due=seen.filter(function(x){ return s.quiz[x.k].n<=t; }).length, ok=seen.filter(function(x){ return s.quiz[x.k].l>=3; }).length;
  h+='<div class="row" style="gap:16px;flex-wrap:wrap;margin-bottom:10px"><div><div style="font-size:24px;font-weight:800">'+pool.length+'</div><div class="small muted">énoncés</div></div><div><div style="font-size:24px;font-weight:800">'+due+'</div><div class="small muted">à revoir aujourd\'hui</div></div><div><div style="font-size:24px;font-weight:800">'+ok+'</div><div class="small muted">bien sus</div></div></div>';
  h+='<button class="btn tint" data-a="quiz">Lancer le quiz</button>'+quizSections()+'</section>';
  return h;
}
function quizSections(){
  var s=st(), secs=[];
  Object.keys(s.mathsCours||{}).forEach(function(fid){ if(!s.files[fid]) return; var seen={}; (s.mathsCours[fid].items||[]).forEach(function(it){ if(!seen[it.section]){ seen[it.section]=1; secs.push({k:fid+"|"+it.section, l:it.section, f:s.files[fid]}); } }); });
  if(!secs.length) return "";
  return '<details style="margin-top:10px"><summary class="small" style="cursor:pointer">Parties vues en classe ('+secs.filter(function(x){ return !s.quizOff[x.k]; }).length+'/'+secs.length+')</summary><div class="stack" style="gap:4px;margin-top:6px">'+secs.map(function(x){ var on=!s.quizOff[x.k]; return '<label class="small" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-qsec="'+esc(x.k)+'"'+(on?" checked":"")+'> '+esc(x.l||"(sans titre)")+' <span class="faint">· '+esc(x.f.chap||x.f.name)+'</span></label>'; }).join("")+'</div><p class="small muted">Décoche ce qui n\'a pas encore été vu : ces énoncés ne sortiront pas au quiz.</p></details>';
}
var QINT=[1,2,4,8,16,32];
function quizSheet(){
  if(Sync.user()) Files.titles();
  var Q=S.quiz; if(!Q){ var ks=quizPick(8); if(!ks.length){ toast("Rien à réviser aujourd'hui : tout est à jour."); return; } Q=S.quiz={list:ks,i:0,show:false,res:{},again:{}}; }
  var s=st(), h='<div class="band s-maths"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">Quiz de cours · '+Math.min(Q.i+1,Q.list.length)+'/'+Q.list.length+'</div><h2>'+(Q.i>=Q.list.length?"Terminé":"Énonce-le de tête")+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  if(Q.i>=Q.list.length){
    var r=Q.res, c=[0,0,0,0]; Object.keys(r).forEach(function(k){ c[r[k]]++; });
    h+='<p>Parfait : <b>'+c[3]+'</b> · Correct : <b>'+c[2]+'</b> · Hésitant : <b>'+c[1]+'</b> · À revoir : <b>'+c[0]+'</b></p><p class="small muted">Les énoncés hésitants ou à revoir reviennent dès demain ; les autres, de plus en plus espacés.</p><button class="btn tint" data-a="close">Fermer</button></div>';
    openSheet(h); S.quiz=null; return;
  }
  var k=Q.list[Q.i], fid=k.split("#")[0], it=(s.mathsCours[fid]||{items:[]}).items[+k.split("#")[1]];
  if(!it){ Q.i++; return quizSheet(); }
  if(!it.titre && Sync.user() && !Q.asking){ Q.asking=k; Files.titleOne(fid,+k.split("#")[1]).then(function(){ var Q2=S.quiz; if(Q2 && Q2.list[Q2.i]===k && it.titre){ Q2.asking=null; quizSheet(); } else if(Q2) Q2.asking=null; }); }
  var tk=thmKind(it.type);
  h+='<div class="qcard"><div class="eyebrow">'+esc(String(it.section||"").replace(/^[\dIVX.\s]+/,"").trim()||it.type)+'</div><h3 class="qtitle">'+esc(quizTitle(it))+'</h3>';
  if(Q.show){
    h+='<div class="thm thm-'+tk+'"><div class="thm-h"><b>'+esc(it.type||"Énoncé")+(it.nom&&!new RegExp("^"+(it.type||"x")+"$","i").test(it.nom)?' '+esc(String(it.nom).replace(new RegExp("^"+(it.type||"")+"\\s*","i"),"")):'')+'</b></div><div class="thm-b qmath">'+fmtEnonce(it.enonce)+'</div></div>';
    h+='<div class="row" style="justify-content:space-between;margin-top:10px"><span class="small faint">Recopié de « '+esc((s.files[fid]||{}).name||"ton cours")+' »</span><button class="link-btn" data-a="quizedit" data-k="'+esc(k)+'">Modifier</button></div>';
  } else h+=(it.nom?'<div class="small faint" style="margin:2px 0 10px">'+esc(it.nom)+'</div>':'')+'<p class="small muted" style="margin:0">Énonce-le à voix haute ou sur une feuille, avec les hypothèses exactes, puis vérifie.</p>';
  h+='</div>';
  h+=Q.show?'<div class="grid g2" style="gap:8px">'+[[3,"Parfait"],[2,"Correct"],[1,"Hésitant"],[0,"À revoir"]].map(function(x){ return '<button class="btn'+(x[0]>=2?" tint":"")+'" data-a="qrate" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>':'<button class="btn primary" data-a="qshow">Voir l\'énoncé</button>';
  openSheet(h+'</div>'); renderMath(layer);
}
function quizRate(v){
  var Q=S.quiz, s=st(), k=Q.list[Q.i], q=s.quiz[k]||{l:-1,h:[]}, t=today();
  var l=v===3?Math.min(5,q.l+2):v===2?Math.min(5,q.l+1):v===1?Math.max(0,q.l):0; if(l<0) l=0;
  q.l=l; q.n=iso(addDays(t, v>=2?QINT[l]:1)); q.d=iso(t); q.h=(q.h||[]).concat([v]).slice(-8); s.quiz[k]=q;
  Q.res[k]=v; if(v===0 && !Q.again[k]){ Q.again[k]=1; Q.list.push(k); }
  Q.i++; Q.show=false; save(); quizSheet();
}

/* ---------- HGG : suivi des quinzaines ---------- */
function hggState(){ var s=st(); s.hgg=s.hgg||{}; ["fait","done","prog","min"].forEach(function(k){ s.hgg[k]=s.hgg[k]||{}; }); return s.hgg; }
function hggCurrent(){ var w=iso(addDays(today(),10)), b=iso(addDays(today(),-10)), Q=HGG_PROG.quinzaines, cur=Q.filter(function(q){ return q.debut<=w && q.fin>=b; });
  var last=cur.length?cur[cur.length-1]:null, nx=Q.filter(function(q){ return q.debut>(last?last.fin:iso(today())); })[0];
  if(nx){ nx=Object.assign({},nx,{next:true}); cur.push(nx); } return cur; }
function driveLink(f){ return '<a href="https://drive.google.com/open?id='+esc(f.id)+'" target="_blank" rel="noopener">'+esc(f.titre)+'</a>'; }
function hggAskCard(){
  var H=hggState(), t=iso(today()), asked=H.ask===t, qs=hggCurrent();
  var h='<section class="card'+(asked?"":" s-hgg")+'"><div class="card-h"><h2>Où en êtes-vous en classe ?</h2><span class="small muted">'+(asked?"à jour aujourd'hui":"question du jour")+'</span></div>';
  h+='<p class="small muted" style="margin:0 0 8px">Coche les chapitres déjà traités en cours. Chaque chapitre traité devient du travail (fiche, exemples, problématiques) réparti uniformément sur tes créneaux d\'HGG d\'ici la fin de la quinzaine.</p>';
  qs.forEach(function(q){
    var n=q.chapitres.filter(function(c,i){ return H.fait["q"+q.n+"#"+i]; }).length;
    h+=(q.next?'<details style="margin-top:8px"'+(n?" open":"")+'><summary class="group-h" style="cursor:pointer">Déjà commencée ? Quinzaine '+q.n+' · '+esc(q.theme)+' <span class="n">'+n+'/'+q.chapitres.length+'</span></summary>':'<div class="group-h" style="margin-top:8px">Quinzaine '+q.n+' · '+esc(q.theme)+' <span class="n">'+n+'/'+q.chapitres.length+'</span></div>')+'<div class="small faint" style="margin-bottom:4px">'+fmtDay(q.debut)+' → '+fmtDay(q.fin)+'</div><div class="stack" style="gap:2px">';
    q.chapitres.forEach(function(c,i){ var k="q"+q.n+"#"+i, on=!!H.fait[k]; h+='<label style="display:flex;gap:10px;align-items:flex-start;padding:5px 0"><input type="checkbox" data-hggfait="'+k+'"'+(on?" checked":"")+' style="margin-top:3px"><span><span>'+esc(c.titre)+'</span>'+(c.profs&&c.profs.length?' <span class="small faint">· '+esc(c.profs.join(", "))+'</span>':'')+(on&&H.fait[k]!==true?' <span class="small muted">· coché le '+fmtDay(H.fait[k])+'</span>':'')+'</span></label>'; });
    h+='</div>'+(q.next?'</details>':'');
  });
  if(!asked) h+='<button class="btn tint sm" data-a="hggask" style="margin-top:8px">C\'est à jour</button>';
  return h+'</section>';
}
function hggWorkCard(){
  var H=hggState(), list=[];
  HGG_PROG.quinzaines.forEach(function(q){ q.chapitres.forEach(function(c,i){ var k="q"+q.n+"#"+i; if(H.fait[k]) list.push({k:k,q:q,c:c}); }); });
  var h='<section class="card"><div class="card-h"><h2>Travail des chapitres</h2></div>';
  if(!list.length) return h+'<div class="empty"><b>Aucun chapitre traité coché</b>Réponds à la question ci-dessus.</div></section>';
  var todo=list.filter(function(x){ return !H.done[x.k]; }), mins=todo.reduce(function(a,x){ return a+Math.round((H.min[x.k]||120)*(1-(H.prog[x.k]||0)/100)); },0);
  h+='<p class="small muted" style="margin:0 0 8px">'+plural(todo.length,"chapitre")+' à travailler · '+durTxt(mins)+' au total · 2 h par chapitre par défaut (ajustable).</p><div class="tasks">';
  list.forEach(function(x){ var d=!!H.done[x.k], w=whenTxt("hgg|"+x.k), m=H.min[x.k]||120;
    h+='<div class="task'+(d?" done":"")+'"><button class="check'+(d?" on":"")+'" data-a="hggdone" data-k="'+x.k+'" aria-label="Fait">'+(d?I.check:"")+'</button><div class="tt"><span>'+esc(x.c.titre)+'</span><div class="tm"><span class="meta">Q'+x.q.n+' · avant le '+fmtDay(x.q.fin)+'</span><span class="meta">'+durTxt(m)+'</span>'+(H.prog[x.k]&&!d?'<span class="meta">fait à '+H.prog[x.k]+' %</span>':'')+(d?'':w?'<span class="meta">prévu '+esc(w)+'</span>':'<span class="meta late">pas de créneau</span>')+'</div>'+(x.c.fichiers&&x.c.fichiers.length?'<div class="small" style="margin-top:4px">'+x.c.fichiers.map(driveLink).join(" · ")+'</div>':'')+'</div><span class="row" style="gap:2px"><button class="chip" data-a="hggmin" data-k="'+x.k+'" data-v="-30">−</button><button class="chip" data-a="hggmin" data-k="'+x.k+'" data-v="30">+</button></span></div>'; });
  return h+'</div></section>';
}
function hggProgCard(){
  var H=hggState();
  return '<details class="card"><summary class="group-h" style="cursor:pointer">Programme de l\'année ('+HGG_PROG.quinzaines.length+' quinzaines, '+HGG_PROG.quinzaines.reduce(function(a,q){ return a+q.chapitres.length; },0)+' chapitres)</summary>'+HGG_PROG.quinzaines.map(function(q){ return '<div style="margin-top:10px"><b>Q'+q.n+' · '+esc(q.theme)+'</b> <span class="small faint">'+fmtDay(q.debut)+' → '+fmtDay(q.fin)+'</span><ul class="small" style="margin:4px 0;padding-left:18px">'+q.chapitres.map(function(c,i){ var k="q"+q.n+"#"+i; return '<li>'+esc(c.titre)+(H.done[k]?' ✓':H.fait[k]?' <span class="muted">(traité en classe)</span>':'')+(c.fichiers&&c.fichiers.length?' — '+c.fichiers.map(driveLink).join(", "):'')+'</li>'; }).join("")+'</ul></div>'; }).join("")+'</details>';
}
function mathsTodayCard(){
  var t=iso(today()), sl=dayEvents(t).filter(function(e){ return e.kind==="work" && e.sub==="maths"; });
  var h='<section class="card"><div class="card-h"><h2>Séance du jour</h2><button class="link-btn" data-go="agenda">Agenda</button></div>';
  if(!sl.length) return h+'<div class="empty">Pas de créneau de maths aujourd\'hui.</div></section>';
  return h+'<div class="strip">'+sl.map(function(e){ var r=roadFor(e,t).filter(function(x){ return !x.pause; }); return '<button class="slot s-maths" data-a="slot" data-d="'+t+'" data-id="'+esc(e.id)+'"><span class="h">'+hLabel(e.s)+'</span><span class="b"><b>'+esc(e.t)+'</b><span>'+r.slice(0,3).map(function(x){ return esc(x.lab); }).join(" · ")+(r.length>3?" …":"")+'</span></span></button>'; }).join("")+'</div></section>';
}
function planAlerts(){
  var P=Plan.get(), u=P.unplaced.filter(function(x){ return x.ref.k==="task"; }), d=P.dropped;
  if(!u.length && !d.length) return "";
  var h='<section class="card" style="margin-bottom:14px">';
  if(u.length) h+='<div class="group-h">Pas de place avant l\'échéance <span class="n">'+u.length+'</span></div><div class="small muted" style="margin-bottom:6px">Tes créneaux de la matière sont pleins d\'ici là : libère du temps, baisse une durée ou ajoute « ! » aux plus urgentes.</div>'+u.map(function(x){ return '<div class="row" style="gap:8px;padding:3px 0">'+tag(x.sub)+'<span>'+esc(x.lab)+'</span><span class="small muted">· reste '+durTxt(x.min)+(x.dl?' · avant le '+fmtDay(x.dl):'')+'</span></div>'; }).join("");
  if(d.length) h+='<div class="group-h" style="margin-top:8px">Retirées du planning <span class="n">'+d.length+'</span></div><div class="small muted" style="margin-bottom:6px">Sans date ni priorité, elles ne rentrent pas dans les 14 prochains jours. Ajoute une date ou « ! » pour les replacer.</div>'+d.map(function(x){ return '<div class="row" style="gap:8px;padding:3px 0">'+tag(x.sub)+'<span>'+esc(x.lab)+'</span><span class="small muted">· '+durTxt(x.min)+'</span></div>'; }).join("");
  return h+'</section>';
}

/* ---------- Maths : trinôme du vendredi, annales, sujets de colle ---------- */
var EPC={pink:"#D6336C",green:"#2F9E44",teal:"#0C8599",indigo:"#4C6EF5",red:"#E03131",brown:"#9C6B3C",yellow:"#C99A06",blue:"#1C7ED6",purple:"#9C36B5",gray:"#868E96"};
function epTile(ep,sm){ var e=Ann.EPS[ep]||{m:"?",c:"gray"}; return '<span class="eptile'+(sm?" sm":"")+'" style="--c:'+EPC[e.c]+'">'+esc(e.m)+'</span>'; }
function bjTile(){ return '<span class="eptile" style="--c:#B97D0C">BJ</span>'; }
function annBoot(){ if(!Ann.ready() && !S.annErr && !S.annLoading){ S.annLoading=true; Ann.load().then(function(){ S.annLoading=false; render(); },function(e){ S.annLoading=false; S.annErr=e.message||String(e); render(); }); } if(typeof Colles!=="undefined") Colles.refresh().then(function(){ Colles.pump(); }); }
function chChip(id,main){ return '<span class="chip'+(main?" chm":"")+'">'+esc(Colles.chLabel(id))+'</span>'; }
function diffDot(di){ var d=Ann.DIFF[di]; return d?'<span class="ddot d-'+di+'" title="'+d.n+'"></span>'+d.n:""; }
function stars(n,red){ return n?'<span class="stars'+(red?" red":"")+'">'+"★".repeat(n)+'<i>'+"★".repeat(3-n)+'</i></span>':""; }
function annChk(id){ var s=Ann.statusOf(id), r=Ann.rec(id)||{}; return '<button class="achk '+s+'" data-a="annchk" data-id="'+esc(id)+'" style="--p:'+(r.p||0)+'%" aria-label="'+(s==="done"?"Marquer à faire":"Marquer comme fait")+'">'+(s==="done"?I.check:s==="redo"?"↻":"")+'</button>'; }
function annRow(it,sc){
  var f=Ann.feas(it), r=Ann.rec(it.id)||{}, pills="";
  if(f.k==="later") pills+='<span class="chip">Après '+esc(f.last.n)+'</span>'; else if(f.k==="part") pills+='<span class="chip warn">Partiel</span>'; else if(f.k==="hp") pills+='<span class="chip warn">Hors programme</span>';
  if(r.s==="doing") pills+='<span class="chip warn">Commencé '+(r.p||0)+' %</span>'; if(r.s==="redo") pills+='<span class="chip vio">À refaire</span>'; if(r.f) pills+='<span class="chip blu">To-do</span>';
  return '<div class="arow" data-key="an-'+esc(it.id)+'">'+epTile(it.ep)+'<button class="abody" data-a="annopen" data-id="'+esc(it.id)+'"><b>'+esc(it.th)+'</b><span class="ameta">'+esc(Ann.title(it))+(it.tm?' · ≈ '+Ann.dur(it.tm):'')+(it.di?' · '+diffDot(it.di):'')+(it.st?' '+stars(it.st,it.rd):'')+'</span>'+(pills?'<span class="apills">'+pills+'</span>':'')+'</button>'+(sc!=null&&!it.ex?'<span class="ascore'+(sc>=75?" hi":"")+'" title="Pertinence">'+sc+'</span>':'')+annChk(it.id)+'</div>';
}
/* trinôme du vendredi : deux sujets pour le vendredi suivant, sur le programme de colle */
function pickRow(tg,p,i,cur){
  var done=cur.done&&cur.done[p.ref], h;
  if(p.kind==="colle"){
    var x=Colles.all().find(function(y){ return y.k===p.ref; }); if(!x) return "";
    var ex=x.ex&&x.ex.exercices, chs=Colles.chapters(x), pr=Ann.progAt(tg)||{main:[]};
    h=bjTile()+'<button class="abody" data-a="colopen" data-k="'+x.k+'"><b>'+(ex&&ex.length?esc(ex.map(function(e){ return e.titre; }).join(" · ")):'Sujet de '+esc(x.c||"colle"))+'</b><span class="ameta">Colle de '+esc(x.c||"?")+' · '+fmtDay(x.d)+' '+x.d.slice(0,4)+(x.cur?"":" · ECG1")+(Colles.busy(x.k)?' · lecture en cours…':(!x.ex?' · pas encore lu':''))+'</span><span class="apills">'+chs.map(function(c){ return chChip(c,pr.main.indexOf(c)>=0); }).join("")+'</span></button>';
  } else {
    var it=Ann.get(p.ref); if(!it) return "";
    h=epTile(it.ep)+'<button class="abody" data-a="annopen" data-id="'+esc(it.id)+'"><b>'+esc(it.th)+'</b><span class="ameta">'+esc(Ann.title(it))+' · ≈ '+Ann.dur(it.tm||25)+'</span><span class="apills">'+it.tg.filter(function(t){ return Ann.CH[t]; }).map(function(c){ return chChip(c); }).join("")+'</span></button>';
  }
  return '<div class="arow'+(done?" isdone":"")+'" data-key="tp-'+esc(p.ref)+'">'+h+'<button class="icon-btn sm" data-a="colswap" data-d="'+tg+'" data-i="'+i+'" title="Proposer un autre sujet" aria-label="Autre sujet">↻</button><button class="achk '+(done?"done":"")+'" data-a="coldone" data-d="'+tg+'" data-k="'+esc(p.ref)+'" aria-label="Fait avec le trinôme">'+(done?I.check:"")+'</button></div>';
}
function trinBlock(tg){
  var p=Ann.progAt(tg), cur=Colles.pick(tg);
  var h='<div class="trin-h"><div><div class="eyebrow">Pour '+fmtLong(tg)+'</div><b>'+esc(p?p.n+" · "+p.t:"Programme à préciser")+'</b></div></div>';
  if(p) h+='<div class="apills" style="margin:6px 0 4px">'+p.main.map(function(c){ return chChip(c,true); }).join("")+p.prev.map(function(c){ return chChip(c); }).join("")+'</div>';
  if(!cur||!cur.picks.length) return h+'<div class="empty"><b>Pas encore de sujet sur ce programme</b>'+(Ann.ready()?"Les sujets de colle se remplissent au fil des lectures.":"Chargement des annales…")+'</div>';
  return h+'<div class="alist">'+cur.picks.map(function(x,i){ return pickRow(tg,x,i,cur); }).join("")+'</div>';
}
function trinomeCard(){
  var tg=Colles.target(), nx=iso(addDays(parseISO(tg),7)); for(var i=0;i<8&&Colles.inVac(nx);i++) nx=iso(addDays(parseISO(nx),7));
  var n=Colles.all().length;
  var h='<section class="card trin"><div class="card-h"><h2>Trinôme du vendredi</h2><button class="link-btn" data-go="colles">'+plural(n,"sujet")+' de colle</button></div>'+trinBlock(tg);
  if(diffDays(tg,iso(today()))<=1) h+='<details class="trin-next"><summary>Préparer aussi '+fmtDay(nx)+'</summary>'+trinBlock(nx)+'</details>';
  if(Colles.needDeploy()) h+='<div class="anote orange" style="margin-top:10px"><b>Lecture des sujets en attente.</b> Redéploie la fonction « gemini » dans Supabase pour que les PDF de colle soient lus.</div>';
  return h+'<p class="small muted" style="margin:10px 0 0">Chaque vendredi, deux sujets pour le vendredi suivant : le programme de colle en cours d\'abord, le chapitre qu\'on vient de finir ensuite. ↻ en propose un autre.</p></section>';
}
function annalesCard(){
  var h='<section class="card"><div class="card-h"><h2>Annales</h2><button class="link-btn" data-go="annales">Tout chercher</button></div>';
  if(!Ann.ready()) return h+'<div class="empty">'+(S.annErr?'<b>Annales indisponibles</b>'+esc(S.annErr):'Chargement des 984 exercices…')+'</div></section>';
  var ws=Ann.weekStats(), focus=Ann.focusNow(), av=+(S.annAvail||0), o={};
  if(av){ if(av>=240){ o={minT:120,allowFull:true,ds:true}; } else o={maxT:av,orals:av<=60}; }
  var recs=Ann.recommend(focus,4,o), fsel=Ann.state().focus||"";
  h+='<div class="aweek"><div><b>'+ws.ex+'</b><span>exercices cette semaine</span></div><div><b>'+ws.min+'</b><span>minutes</span></div><div><b>'+ws.eps+'</b><span>concepteurs</span></div></div>';
  h+='<div class="row" style="justify-content:space-between;margin:12px 0 8px"><select class="field sm" id="ann-focus" aria-label="Chapitre travaillé"><option value="">Auto : '+esc(Colles.chLabel(Ann.defaultFocus()[0]))+'</option>'+Ann.CHL.map(function(c){ return '<option value="'+c.id+'"'+(fsel===c.id?" selected":"")+'>'+esc(Colles.chLabel(c.id))+'</option>'; }).join("")+'</select></div>';
  h+='<div class="seg wide">'+[["0","Peu importe"],["30","30 min"],["60","1 h"],["120","2 h"],["240","4 h"]].map(function(x){ return '<button class="'+(String(av)===x[0]?"on":"")+'" data-a="annavail" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
  h+='<div class="alist" style="margin-top:8px">'+(recs.length?recs.map(function(it){ return annRow(it,Ann.score(it,focus)); }).join(""):'<div class="empty">Rien de faisable dans ce temps pour ce chapitre.</div>')+'</div>';
  var favs=Ann.items().filter(function(it){ var r=Ann.rec(it.id); return r&&(r.f||r.s==="doing"||r.s==="redo")&&r.s!=="done"; });
  if(favs.length) h+='<div class="group-h" style="margin-top:12px">Ma liste <span class="n">'+favs.length+'</span></div><div class="alist">'+favs.slice(0,6).map(function(it){ return annRow(it); }).join("")+'</div>';
  return h+'</section>';
}
/* page Annales : recherche et filtres */
function vAnnales(){
  var h=topbar("Annales")+'<button class="link-btn" data-go="matiere" data-p="maths" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Maths</button><h1 class="large-title">Annales</h1>';
  if(!Ann.ready()){ annBoot(); return h+'<div class="card"><div class="empty">'+(S.annErr?esc(S.annErr):"Chargement…")+'</div></div>'; }
  var F=S.annF=S.annF||{mode:"ex",eps:[],chs:[],sort:"score",n:60}, R=Ann.search(S.annQ||"",F), L=R.L;
  h+='<p class="subtitle">Écrits 2000 à 2026, oraux HEC et ESCP, DS de Ginette. Classés par pertinence pour ton chapitre.</p>';
  h+='<input class="field" id="ann-q" type="search" placeholder="EDHEC 2014, Wallis, loi de Cauchy…" value="'+esc(S.annQ||"")+'" autocomplete="off">';
  h+='<div class="row" style="margin:10px 0;gap:8px"><div class="seg">'+[["ex","Écrits"],["oral","Oraux"],["ds","DS"]].map(function(x){ return '<button class="'+(F.mode===x[0]?"on":"")+'" data-a="annmode" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div></div>';
  var eps=F.mode==="oral"?Ann.OEP_ORDER:F.mode==="ds"?[]:Ann.EP_ORDER;
  if(eps.length) h+='<div class="chips-x">'+'<button class="chip'+(!F.eps.length?" on":"")+'" data-a="anneps" data-v="">Tous</button>'+eps.map(function(e){ return '<button class="chip'+(F.eps.indexOf(e)>=0?" on":"")+'" data-a="anneps" data-v="'+e+'">'+esc(Ann.EPS[e].n)+'</button>'; }).join("")+'</div>';
  var sel=function(id,cur,opts){ return '<select class="field sm" id="'+id+'">'+opts.map(function(o){ return '<option value="'+o[0]+'"'+(String(cur||"")===o[0]?" selected":"")+'>'+esc(o[1])+'</option>'; }).join("")+'</select>'; };
  h+='<div class="afilters">'+sel("annf-ch",F.chs[0]||"",[["","Tous les chapitres"]].concat(Ann.CHL.map(function(c){ return [c.id,Colles.chLabel(c.id)]; })))+sel("annf-dur",F.dur||"",[["","Toutes durées"],["30","≤ 30 min"],["60","≤ 1 h"],["120","≤ 2 h"],["long","4 h"]])+sel("annf-feas",F.feas||"",[["","Tout"],["now","Faisable maintenant"]])+sel("annf-stat",F.stat||"",[["","Tout mon suivi"],["todo","À faire"],["doing","Commencés"],["done","Faits"],["redo","À refaire"],["fav","Ma liste"]])+sel("annf-sort",F.sort||"score",[["score","Pertinence"],["recent","Plus récents"],["easy","Plus accessibles"]])+'</div>';
  h+='<div class="small muted" style="margin:8px 2px">'+plural(L.length,"exercice")+'</div><section class="card" style="padding:6px 10px"><div class="alist">'+(L.length?L.slice(0,F.n).map(function(it){ return annRow(it,R.sc[it.id]); }).join(""):'<div class="empty"><b>Aucun exercice</b>Élargis la recherche ou retire un filtre.</div>')+'</div></section>';
  if(L.length>F.n) h+='<div style="text-align:center;margin:12px"><button class="btn sm" data-a="annmore">Afficher '+Math.min(60,L.length-F.n)+' de plus</button></div>';
  return h;
}
function linkBtn(u,l){ return u&&/^https?:/.test(u)?'<a class="btn tint sm" href="'+esc(u)+'" target="_blank" rel="noopener">'+l+' '+I.arrow+'</a>':''; }
function annSheet(id){
  var it=Ann.get(id); if(!it) return;
  var sj=Ann.subj(it.sid), r=Ann.rec(id)||{s:"todo"}, ft=Ann.feasText(it), sc=Ann.score(it,Ann.focusNow());
  var h='<div class="sheet-h"><div class="ttl"><div class="eyebrow">'+esc(Ann.title(it))+'</div><h2>'+esc(it.th)+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  h+='<div class="apills">'+Ann.doms(it).map(function(d){ return '<span class="chip">'+Ann.DOM[d].g+' '+Ann.DOM[d].n+'</span>'; }).join("")+(it.di?'<span class="chip">'+diffDot(it.di)+'</span>':'')+(it.st?'<span class="chip">'+stars(it.st,it.rd)+'</span>':'')+(it.rd?'<span class="chip warn">Super classique : astuces à retenir</span>':'')+(it.ex?'':'<span class="chip blu">Pertinence '+sc+'</span>')+(it.tm?'<span class="chip">≈ '+Ann.dur(it.tm)+'</span>':'')+'</div>';
  h+='<div class="anote '+ft.c+'"><b>'+esc(ft.s)+'.</b> '+esc(ft.l)+'</div>';
  var links=it.k==="o"?linkBtn(sj.su,"Sujet et corrigé")+linkBtn(sj.co,"Corrigé QSP")+linkBtn(sj.ra,"Rapport du jury"):linkBtn(sj.su,"Sujet")+linkBtn(sj.co,"Corrigé")+linkBtn(sj.ra,"Rapport du jury");
  h+='<div class="row" style="gap:8px">'+(links||'<span class="small muted">PDF non disponible ici'+(it.k==="d"?" : demande-le à ton prof ou dans tes dossiers de DS.":".")+'</span>')+'</div>';
  if(it.rm) h+='<div><div class="group-h">Ce que le prof a relevé dans les copies</div><ul class="arm">'+it.rm.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join("")+'</ul></div>';
  (sj.vid||[]).concat(it.vid||[]).forEach(function(v){ h+='<a class="ext" href="'+esc(v.u)+'" target="_blank" rel="noopener"><div><b>▶ '+esc(v.t)+'</b></div></a>'; });
  if(!it.ex){
    h+='<div><div class="group-h">Mon suivi</div><div class="seg wide">'+[["todo","À faire"],["doing","Commencé"],["done","Fait"],["redo","À refaire"]].map(function(x){ return '<button class="'+(r.s===x[0]?"on":"")+'" data-a="annst" data-id="'+esc(id)+'" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join("")+'</div>';
    if(r.s==="doing") h+='<label class="arange"><span>Avancement <b>'+(r.p||0)+' %</b></span><input type="range" min="0" max="100" step="5" value="'+(r.p||0)+'" data-annp="'+esc(id)+'"></label>';
    h+='<div class="akv"><div><span>Ma note</span><span class="stepper"><button data-a="annnote" data-id="'+esc(id)+'" data-v="-0.5" aria-label="Moins">−</button><b>'+(r.n==null?"–":String(r.n).replace(".",",")+" /20")+'</b><button data-a="annnote" data-id="'+esc(id)+'" data-v="0.5" aria-label="Plus">+</button></span></div>';
    h+='<div><span>Temps passé</span><span class="row" style="gap:6px"><b>'+(r.t?durTxt(r.t):"0 min")+'</b>'+[15,30,60].map(function(m){ return '<button class="btn sm" data-a="anntime" data-id="'+esc(id)+'" data-v="'+m+'">+'+m+'</button>'; }).join("")+'</span></div>';
    h+='<div><span>Dans ma liste</span><button class="chip'+(r.f?" on":"")+'" data-a="annfav" data-id="'+esc(id)+'">'+(r.f?"Oui":"Ajouter")+'</button></div></div>';
    h+='<textarea class="field" id="ann-notes" data-id="'+esc(id)+'" rows="3" placeholder="Pièges, méthodes à retenir, questions à revoir…">'+esc(r.c||"")+'</textarea><div class="small muted">Barème strict : un point n\'est acquis que si une ligne de ta copie le justifie.</div></div>';
  }
  var kv=[];
  if(it.tm) kv.push(["Durée estimée","≈ "+Ann.dur(it.tm)+(it.pt?" (par partie : "+it.pt.map(function(m,i){ return ["I","II","III","IV","V","VI"][i]+" ≈ "+Ann.dur(m); }).join(", ")+")":"")]);
  if(it.qc) kv.push(["Question de cours",it.qc]);
  kv.push(["Chapitres",it.tg.filter(function(t){ return Ann.CH[t]; }).map(Colles.chLabel).join(", ")||"–"]);
  if(it.no) kv.push(["Notions",it.no]);
  if((it.hp||[]).length) kv.push(["Hors programme",it.hp.map(function(x){ return x.n; }).join(" ; ")]);
  if(it.ae) kv.push(["Pour les écrits",it.ae]); if(it.ao) kv.push(["Pour l'oral",it.ao]); if(it.nt) kv.push(["Commentaire",it.nt]);
  if(sj.vi) kv.push([it.k==="d"?"À savoir":"Vision du sujet",sj.vi]); if(sj.rr) kv.push(["Rapport du jury",sj.rr]);
  h+='<div><div class="group-h">'+(it.k==="d"?"Fiche du devoir":"Analyse Major Prépa")+'</div><dl class="adl">'+kv.map(function(x){ return '<dt>'+esc(x[0])+'</dt><dd>'+esc(x[1])+'</dd>'; }).join("")+'</dl></div>';
  var sib=Ann.items().filter(function(x){ return x.sid===it.sid&&x.id!==id; });
  if(sib.length) h+='<div><div class="group-h">Dans le même sujet</div><div class="alist">'+sib.map(function(x){ return annRow(x); }).join("")+'</div></div>';
  var keep=layer.querySelector(".sheet-b"), y=keep&&layer.getAttribute("data-ann")===id?keep.scrollTop:0;
  openSheet(h+'</div>'); layer.setAttribute("data-ann",id);
  if(y){ var sb=layer.querySelector(".sheet-b"); if(sb) sb.scrollTop=y; var sh=layer.querySelector(".sheet"); if(sh) sh.style.animation="none"; }
}
/* page Sujets de colle */
function vColles(){
  annBoot();
  var tg=Colles.target(), p=Ann.progAt(tg), F=S.colF=S.colF||{ch:"",q:"",an:""}, L=Colles.all();
  var h=topbar("Sujets de colle")+'<button class="link-btn" data-go="matiere" data-p="maths" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Maths</button><h1 class="large-title">Sujets de colle</h1>';
  h+='<p class="subtitle">Les sujets en PDF déposés sur BJcolle, lus par Gemini (énoncés et chapitres). '+plural(L.length,"sujet")+' · '+L.filter(function(x){ return x.ex&&x.ex.exercices; }).length+' lus.</p>';
  h+='<div class="afilters"><select class="field sm" id="colf-ch"><option value="">Tous les chapitres</option>'+Ann.CHL.map(function(c){ return '<option value="'+c.id+'"'+(F.ch===c.id?" selected":"")+'>'+esc(Colles.chLabel(c.id))+'</option>'; }).join("")+'</select><select class="field sm" id="colf-an"><option value="">Toutes les années</option><option value="cur"'+(F.an==="cur"?" selected":"")+'>ECG2 (cette année)</option><option value="old"'+(F.an==="old"?" selected":"")+'>ECG1 (l\'an dernier)</option></select>'+(p?'<button class="chip'+(F.ch==="prog"?" on":"")+'" data-a="colprog">Programme du '+fmtDay(tg)+'</button>':'')+'</div>';
  var words=norm(F.q).split(/\s+/).filter(Boolean);
  L=L.filter(function(x){ var chs=Colles.chapters(x); if(F.ch==="prog"&&p&&!chs.some(function(c){ return p.main.indexOf(c)>=0||p.prev.indexOf(c)>=0; })) return false; if(F.ch&&F.ch!=="prog"&&chs.indexOf(F.ch)<0) return false; if(F.an==="cur"&&!x.cur) return false; if(F.an==="old"&&x.cur) return false; return true; });
  var by={}; L.forEach(function(x){ var m=x.d.slice(0,7); (by[m]=by[m]||[]).push(x); });
  h+=Object.keys(by).sort().reverse().map(function(m){ var d=parseISO(m+"-01"); return '<div class="group-h" style="margin-top:14px">'+MONTHS[d.getMonth()].replace(/^./,function(c){ return c.toUpperCase(); })+' '+d.getFullYear()+' <span class="n">'+by[m].length+'</span></div><section class="card" style="padding:6px 10px"><div class="alist">'+by[m].map(colRow).join("")+'</div></section>'; }).join("")||'<div class="card"><div class="empty"><b>Aucun sujet</b>Retire un filtre.</div></div>';
  return h;
}
function colRow(x){
  var ex=x.ex&&x.ex.exercices, chs=Colles.chapters(x);
  return '<div class="arow" data-key="cs-'+x.k+'">'+bjTile()+'<button class="abody" data-a="colopen" data-k="'+x.k+'"><b>'+(ex&&ex.length?esc(ex.map(function(e){ return e.titre; }).join(" · ")):esc(x.n.replace(/\.pdf$/i,"")))+'</b><span class="ameta">'+esc(x.c||"?")+' · '+fmtDay(x.d)+(x.cur?"":" · ECG1")+(x.ex&&x.ex.err?" · lecture impossible":!x.ex?(Colles.busy(x.k)?" · lecture en cours…":" · pas encore lu"):"")+'</span>'+(chs.length?'<span class="apills">'+chs.map(function(c){ return chChip(c); }).join("")+'</span>':'')+'</button></div>';
}
function colleSheet(k){
  var x=Colles.all().find(function(y){ return y.k===k; }); if(!x) return;
  var ex=x.ex, h='<div class="band s-maths"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">Colle de '+esc(x.c||"?")+' · '+fmtLong(x.d)+' '+x.d.slice(0,4)+'</div><h2>'+(ex&&ex.exercices&&ex.exercices.length?esc(ex.exercices.map(function(e){ return e.titre; }).join(" · ")):"Sujet de colle")+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  h+='<div class="row" style="gap:8px"><a class="btn tint sm" href="'+esc(x.u)+'" target="_blank" rel="noopener">Ouvrir le PDF '+I.arrow+'</a>'+(ex&&ex.exercices?'<button class="btn sm" data-a="colan" data-k="'+k+'">Relire</button>':'')+'</div>';
  var chs=Colles.chapters(x); if(chs.length) h+='<div class="apills">'+chs.map(function(c){ return chChip(c); }).join("")+'</div>';
  if(Colles.busy(k)) h+='<div class="empty">Gemini lit le sujet…</div>';
  else if(!ex||!ex.exercices) h+='<div class="empty">'+(ex&&ex.err?'<b>Lecture impossible</b>'+esc(ex.err):'<b>Pas encore lu</b>Gemini recopie les énoncés et repère les chapitres.')+'<div style="margin-top:10px"><button class="btn primary sm" data-a="colan" data-k="'+k+'">Lire le sujet</button></div></div>';
  else {
    if(ex.question_cours) h+='<div class="thm thm-def"><div class="thm-h"><b>Question de cours</b></div><div class="thm-b qmath">'+fmtEnonce(ex.question_cours)+'</div></div>';
    ex.exercices.forEach(function(e){ h+='<div class="thm thm-meth"><div class="thm-h"><b>Exercice '+esc(e.num||"")+'</b> · '+esc(e.titre||"")+(e.minutes?' <span class="faint">· ≈ '+e.minutes+' min</span>':'')+'</div><div class="thm-b qmath">'+fmtEnonce(e.enonce)+'</div></div>'; });
    h+='<div class="small muted">Énoncés recopiés par Gemini : en cas de doute, le PDF fait foi.</div>';
  }
  openSheet(h+'</div>'); layer.setAttribute("data-col",k); renderMath(layer);
}

function annRefresh(){ var id=layer.getAttribute("data-ann"); if(id&&layer.innerHTML) annSheet(id); render(); }
function colAnalyze(k){ var p=Colles.analyze(k); colleSheet(k); render(); p.then(function(){ if(layer.getAttribute("data-col")===k&&layer.innerHTML) colleSheet(k); render(); },function(e){ toast("Lecture impossible : "+(e&&e.message||e)); if(layer.getAttribute("data-col")===k&&layer.innerHTML) colleSheet(k); render(); }); }
/* ---------- Échéances ---------- */
function vEcheances(){
  var t=iso(today()), m=S.echMode;
  var h=topbar("Échéances")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Échéances</h1><div class="seg"><button class="'+(m==="dst"?"on":"")+'" data-a="echmode" data-m="dst">DST</button><button class="'+(m==="colles"?"on":"")+'" data-a="echmode" data-m="colles">Colles'+(typeof BJ!=="undefined"&&BJ.unread()?' ('+BJ.unread()+')':'')+'</button></div></div>';
  if(m==="dst"){
    var fut=PALES.filter(function(p){ return p.date>=t; }), past=PALES.filter(function(p){ return p.date<t; });
    h+='<section class="card">'+fut.map(function(p){ return echRow(p,t); }).join("")+'</section>';
    if(past.length) h+='<section class="card" style="margin-top:14px"><div class="group-h">Passées</div>'+past.map(function(p){ return echRow(p,t,true); }).join("")+'</section>';
  } else {
    var w=mondayOf(today()), ref=parseISO("2026-10-05"), k=Math.round((w-ref)/(7*864e5));
    h+=bjColles();
    h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Alternance maths / HGG</h2></div>'+[0,1,2,3].map(function(i){ var ws=addDays(w,7*i), hgg=((k+i)%2+2)%2===0; return '<div class="ech"><div class="d '+(hgg?"s-hgg":"s-maths")+'"><b>'+ws.getDate()+'</b><small>'+MON_S[ws.getMonth()]+'</small></div><div class="w">Semaine du '+ws.getDate()+' '+MONTHS[ws.getMonth()]+'</div><span class="tag '+(hgg?"s-hgg":"s-maths")+'">Colle '+(hgg?"d'HGG":"de maths")+'</span></div>'; }).join("")+'</section>';
  }
  return h;
}
function echRow(p,t,past){
  var n=diffDays(p.date,t), d=parseISO(p.date), s=subj(p.sub);
  return '<div class="ech'+(past?" off":"")+'"><div class="d '+s.cls+'"><b>'+d.getDate()+'</b><small>'+MON_S[d.getMonth()]+'</small></div><div><div class="w">'+esc(p.t)+'</div><div class="small muted">'+DAYS[d.getDay()]+' · '+hLabel(p.s)+'–'+hLabel(p.e)+'</div></div><span class="cd'+(!past&&n<=7?" soon":"")+'">'+(past?"passée":n===0?"aujourd'hui":"J-"+n)+'</span></div>';
}

/* ---------- BJcolle ---------- */
function n1(x){ return x==null?"–":(Math.round(x*10)/10).toString().replace(".",","); }
function agoLabel(t){ if(!t) return "jamais"; var m=Math.round((Date.now()-new Date(t))/60000); if(m<1) return "à l'instant"; if(m<60) return "il y a "+m+" min"; var h=Math.round(m/60); if(h<24) return "il y a "+h+" h"; return "le "+fmtLong(t.slice(0,10)); }
function colleurLine(name){
  if(typeof BJ==="undefined"||!name) return "";
  var c=BJ.colleur(BJ.colleurKey(name.split(/\s*\/\s*/)[0])); if(!c||!c.notes.length) return "";
  return "moyenne "+n1(c.moy)+" sur "+c.notes.length+" notes"+(c.moyMoi!=null?" · toi : "+n1(c.moyMoi):"")+(c.sujets?" · "+c.sujets+" sujets connus":"");
}
function bjColleRow(c,past){
  var d=parseISO(c.date), s=subj(BJ.subOf(c)), pr=colleurLine(c.colleur), n=diffDays(c.date,iso(today()));
  return '<div class="ech'+(past?" off":"")+'"><div class="d '+s.cls+'"><b>'+d.getDate()+'</b><small>'+MON_S[d.getMonth()]+'</small></div><div style="min-width:0"><div class="w">'+esc(BJ.isEntretien(c)?"Entretien de personnalité":c.discipline)+(c.type?' <span class="tag">'+esc(c.type)+'</span>':'')+'</div><div class="small muted">'+DAYS[d.getDay()]+' · '+hLabel(c.debut||"00:00")+(/^\d/.test(c.tirage||"")?' · tirage '+hLabel(c.tirage):c.tirage?' · tirage anticipé':'')+(c.salle?' · '+esc(c.salle):'')+'</div>'+(c.colleur?'<div class="small"><button class="link-btn" data-go="bjcolleur" data-p="'+esc(BJ.colleurKey(c.colleur.split(/\s*\/\s*/)[0]))+'">'+esc(c.colleur)+'</button>'+(pr?' <span class="muted">· '+esc(pr)+'</span>':'')+'</div>':'')+(c.ordre&&c.ordre.length&&!past?'<div class="small faint">Passage '+(c.ordre.findIndex(function(x){return /VAN ROSSUM/i.test(x);})+1||"?")+' sur '+c.ordre.length+'</div>':'')+(past&&c.sujet?'<div class="small"><b>Sujet :</b> '+esc(c.sujet)+'</div>':'')+'</div><span class="cd'+(!past&&n<=1?" soon":"")+'">'+(past?(c.note||"—"):n===0?"aujourd'hui":n===1?"demain":"J-"+n)+'</span></div>';
}
function bjColles(){
  if(typeof BJ==="undefined") return "";
  var D=BJ.data(), stt=D.state, h="";
  if(!Sync.user()) return '<section class="card"><div class="empty"><b>Connecte-toi pour voir tes colles</b>Plus → Compte.</div></section>';
  h+='<div class="row" style="justify-content:space-between;margin:0 0 10px"><span class="small muted">BJcolle · vérifié '+agoLabel(stt&&stt.last_ok)+(stt&&stt.error?' · <span style="color:var(--red)">'+esc(stt.error)+'</span>':'')+'</span><button class="btn sm" data-a="bjcheck">Vérifier maintenant</button></div>';
  if(!BJ.ready() && !D.colles.length) return h+'<section class="card"><div class="empty"><b>Le robot BJcolle n\'a pas encore tourné</b>Une fois installé dans Supabase, il consulte BJcolle chaque heure : planning, notes, sujets et commentaires de la classe, archives de première année.</div></section>';
  var ev=D.events.filter(function(e){ return !e.lu; });
  if(ev.length) h+='<section class="card"><div class="card-h"><h2>Nouveautés</h2><button class="link-btn" data-a="bjread">Tout marquer lu</button></div><div class="stack" style="gap:8px">'+ev.slice(0,12).map(function(e){ return '<div class="due s-neutral"><span class="when">'+esc(agoLabel(e.at))+'</span><span class="what"><b>'+esc(e.titre)+'</b>'+(e.detail?'<br><span class="small muted">'+esc(e.detail)+'</span>':'')+'</span></div>'; }).join("")+'</div></section>';
  var up=BJ.upcoming();
  h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Mes prochaines colles</h2><span class="small muted">'+up.length+'</span></div>'+(up.length? up.map(function(c){ return bjColleRow(c); }).join("") : '<div class="empty">Aucune colle à venir publiée. Le planning sort le jeudi ou le vendredi.</div>')+'</section>';
  var past=BJ.mine().filter(function(c){ return c.date<iso(today()) && (c.scope==="moi"||c.scope==="kore"); }).sort(function(a,b){ return b.date.localeCompare(a.date); });
  if(past.length) h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Mes dernières colles</h2></div>'+past.slice(0,6).map(function(c){ return bjColleRow(c,true); }).join("")+'</section>';
  h+='<div class="grid g2" style="margin-top:14px"><button class="ext" data-go="bjclasse" style="border:0;text-align:left"><div><b>Colles de la classe</b><span class="small muted">Sujets, notes et commentaires, au fil de l\'eau et archives de 1re année.</span></div>'+I.right+'</button><button class="ext" data-go="bjcolleurs" style="border:0;text-align:left"><div><b>Colleurs</b><span class="small muted">Moyennes, répartition des notes, sujets déjà donnés, exigences.</span></div>'+I.right+'</button></div>';
  return h;
}
var MY_DISC=["Mathématiques","Histoire-Géographie","Français-Philosophie","Anglais LV1","Allemand LV1"];
function vBjClasse(){
  var D=BJ.data(), F=S.bjF||(S.bjF={disc:"",annee:"",q:"",colleur:"",n:80});
  var discs=[...new Set(D.colles.map(function(c){return c.discipline;}))].sort(function(a,b){ return (MY_DISC.indexOf(a)<0)-(MY_DISC.indexOf(b)<0) || a.localeCompare(b); });
  var annees=[...new Set(D.colles.map(function(c){return c.annee;}).filter(Boolean))].sort().reverse();
  var q=norm(F.q||"");
  var list=D.colles.filter(function(c){ return /^(classe|archive-classe|moi|archive-moi)$/.test(c.scope) && (!F.disc||c.discipline===F.disc) && (!F.annee||c.annee===F.annee) && (!F.colleur||BJ.colleurKey(c.colleur||"")===F.colleur) && (!q||norm([c.sujet,c.commentaire,c.colleur,c.eleve].join(" ")).indexOf(q)>=0); }).sort(function(a,b){ return ((b.date||"")+(b.debut||"")).localeCompare((a.date||"")+(a.debut||"")); });
  var h=topbar("Colles de la classe")+'<button class="link-btn" data-go="echeances" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Échéances</button><h1 class="large-title">Colles de la classe</h1>';
  h+='<p class="small muted" style="margin:0 0 12px">Privé : visible par toi seul, pour ta préparation. Les sujets apparaissent dès que le colleur remplit la feuille (vérification chaque heure).</p>';
  h+='<div class="row" style="gap:8px;margin-bottom:12px"><select class="field" id="bjf-disc" style="flex:1 1 160px"><option value="">Toutes les matières</option>'+discs.map(function(d){ return '<option'+(F.disc===d?" selected":"")+'>'+esc(d)+'</option>'; }).join("")+'</select><select class="field" id="bjf-annee" style="flex:0 1 130px"><option value="">Toutes les années</option>'+annees.map(function(a){ return '<option'+(F.annee===a?" selected":"")+'>'+a+'</option>'; }).join("")+'</select><input class="field" id="bjf-q" placeholder="Chercher un sujet, un mot…" value="'+esc(F.q||"")+'" style="flex:2 1 200px"></div>';
  if(F.colleur) h+='<div class="row" style="margin-bottom:10px"><span class="tag">Colleur : '+esc(F.colleur)+'</span><button class="link-btn" data-a="bjfclr">Retirer</button></div>';
  h+='<div class="small muted" style="margin-bottom:8px">'+list.length+' colle'+(list.length>1?"s":"")+' · '+list.filter(function(c){return c.sujet;}).length+' avec sujet</div>';
  h+='<div class="stack" style="gap:8px">'+list.slice(0,F.n).map(function(c){ var s=subj(BJ.subOf(c));
    return '<section class="card" style="padding:12px 14px"><div class="row" style="justify-content:space-between;gap:8px"><span class="tag '+s.cls+'">'+esc(BJ.isEntretien(c)?"Entretien (Fr.-Philo)":c.discipline)+'</span><span class="small muted">'+fmtLong(c.date)+' · '+hLabel(c.debut||"00:00")+'</span></div>'+(c.sujet?'<div style="font-weight:700;margin-top:6px">'+esc(c.sujet)+'</div>':'<div class="small faint" style="margin-top:6px">Sujet pas encore relevé</div>')+'<div class="small muted" style="margin-top:4px"><button class="link-btn" data-go="bjcolleur" data-p="'+esc(BJ.colleurKey((c.colleur||"").split(/\s*\/\s*/)[0]))+'">'+esc(c.colleur||"")+'</button> · '+esc(c.eleve||"")+(c.note?' · <b>'+esc(c.note)+'</b>':'')+'</div>'+(c.commentaire?'<details style="margin-top:6px"><summary class="small" style="cursor:pointer">Commentaire du colleur</summary><p class="small" style="white-space:pre-wrap;margin:6px 0 0">'+esc(c.commentaire)+'</p></details>':'')+'</section>'; }).join("")+'</div>';
  if(list.length>F.n) h+='<div style="text-align:center;margin-top:12px"><button class="btn sm" data-a="bjmore">Afficher plus</button></div>';
  return h;
}
function vBjColleurs(){
  var F=S.bjCF||(S.bjCF={disc:""});
  var all=BJ.colleurs().filter(function(c){ return c.notes.length; });
  var discs=[...new Set(all.map(function(c){return c.discipline;}))].sort(function(a,b){ return (MY_DISC.indexOf(a)<0)-(MY_DISC.indexOf(b)<0) || a.localeCompare(b); });
  var list=all.filter(function(c){ return !F.disc||c.discipline===F.disc; }).sort(function(a,b){ return (MY_DISC.indexOf(a.discipline)<0)-(MY_DISC.indexOf(b.discipline)<0) || a.discipline.localeCompare(b.discipline) || b.n-a.n; });
  var h=topbar("Colleurs")+'<button class="link-btn" data-go="echeances" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Échéances</button><h1 class="large-title">Colleurs</h1>';
  h+='<select class="field" id="bjcf-disc" style="margin-bottom:12px;max-width:320px"><option value="">Toutes les matières</option>'+discs.map(function(d){ return '<option'+(F.disc===d?" selected":"")+'>'+esc(d)+'</option>'; }).join("")+'</select>';
  h+='<section class="card">'+(list.length? list.map(function(c){ var s=subj(BJ.subOf({discipline:c.discipline}));
    return '<button class="ech" data-go="bjcolleur" data-p="'+esc(c.nom)+'" style="width:100%;border:0;background:none;text-align:left;cursor:pointer"><div class="d '+s.cls+'"><b>'+n1(c.moy)+'</b><small>moy.</small></div><div style="min-width:0"><div class="w">'+esc(c.nom)+'</div><div class="small muted">'+esc(c.discipline)+' · '+c.notes.length+' notes · écart-type '+n1(c.sd)+(c.sujets?' · '+c.sujets+' sujets':'')+'</div></div><span class="cd">'+(c.moyMoi!=null?"toi "+n1(c.moyMoi):"")+'</span></button>'; }).join("") : '<div class="empty">Pas encore de notes relevées.</div>')+'</section>';
  return h;
}
function bjHist(notes,mine){
  var bins=[0,0,0,0,0,0,0,0,0,0]; notes.forEach(function(v){ bins[Math.min(9,Math.floor(v/2))]++; });
  var mx=Math.max.apply(null,bins)||1, w=100/10;
  var bars=bins.map(function(b,i){ var hh=b/mx*60; return '<rect x="'+(i*w+1)+'" y="'+(66-hh)+'" width="'+(w-2)+'" height="'+hh+'" rx="1.5" fill="var(--blue)" opacity=".75"/>'; }).join("");
  var marks=(mine||[]).map(function(v){ var x=v/20*100; return '<line x1="'+x+'" x2="'+x+'" y1="2" y2="66" stroke="var(--red)" stroke-width="1.2" vector-effect="non-scaling-stroke"/>'; }).join("");
  return '<svg viewBox="0 0 100 78" preserveAspectRatio="none" style="width:100%;height:120px" aria-label="Répartition des notes">'+bars+marks+'<line x1="0" x2="100" y1="66" y2="66" stroke="var(--line-strong)" vector-effect="non-scaling-stroke"/></svg><div class="row small faint" style="justify-content:space-between"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span></div>';
}
function vBjColleur(nom){
  var c=BJ.colleur(nom), list=BJ.collesDe(nom).sort(function(a,b){ return ((b.date||"")+(b.debut||"")).localeCompare((a.date||"")+(a.debut||"")); });
  var h=topbar(nom||"Colleur")+'<button class="link-btn" data-go="bjcolleurs" style="display:inline-flex;align-items:center;gap:2px;margin-bottom:10px">'+I.left+' Colleurs</button><h1 class="large-title">'+esc(nom||"")+'</h1>';
  if(!c) return h+'<div class="empty">Aucune donnée pour ce colleur.</div>';
  var mine=list.filter(function(x){ return x.moi && x.note_num!=null; }).map(function(x){ return x.note_num; });
  var cls=BJ.avg(list.filter(function(x){ return x.note_num!=null; }).map(function(x){return x.note_num;}));
  h+='<p class="small muted" style="margin:0 0 12px">'+esc(Object.keys(c.disc).join(", "))+' · '+c.n+' colles relevées</p>';
  h+='<div class="grid g3"><section class="card"><div class="eyebrow">Moyenne</div><div class="tab" style="font-size:30px;font-weight:800">'+n1(c.moy)+'</div><div class="small muted">écart-type '+n1(c.sd)+' · '+c.notes.length+' notes</div></section><section class="card"><div class="eyebrow">Tes notes avec lui</div><div class="tab" style="font-size:30px;font-weight:800">'+n1(c.moyMoi)+'</div><div class="small muted">'+(mine.length?mine.map(n1).join(" · "):"pas encore de colle")+'</div></section><section class="card"><div class="eyebrow">Sujets connus</div><div class="tab" style="font-size:30px;font-weight:800">'+c.sujets+'</div><div class="small muted">dernière colle '+(c.last?fmtLong(c.last):"–")+'</div></section></div>';
  h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Répartition des notes</h2><span class="small muted">en rouge : tes notes</span></div>'+bjHist(c.notes,mine)+'</section>';
  var key="prepa.bjsum."+nom, sum=null; try{ sum=JSON.parse(localStorage.getItem(key)||"null"); }catch(e){}
  var nCom=list.filter(function(x){return x.commentaire;}).length;
  h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Ce qu\'il attend</h2><button class="btn sm" data-a="bjsum" data-p="'+esc(nom)+'" '+(nCom?"":"disabled")+'>'+(sum?"Actualiser":"Résumer avec Gemini")+'</button></div>'+(sum?'<div class="small" style="white-space:pre-wrap">'+esc(sum.text)+'</div><div class="small faint" style="margin-top:6px">D\'après '+sum.n+' commentaires · '+fmtLong(sum.at.slice(0,10))+'</div>':'<div class="small muted">'+(nCom?nCom+" commentaires disponibles : Gemini en tire ses exigences récurrentes.":"Pas encore de commentaire relevé.")+'</div>')+'</section>';
  var byYear={}; list.filter(function(x){return x.sujet;}).forEach(function(x){ (byYear[x.annee||"?"]=byYear[x.annee||"?"]||[]).push(x); });
  h+='<section class="card" style="margin-top:14px"><div class="card-h"><h2>Sujets déjà donnés</h2><button class="link-btn" data-a="bjfcol" data-p="'+esc(nom)+'">Tout voir</button></div>'+(Object.keys(byYear).length? Object.keys(byYear).sort().reverse().map(function(y){ return '<div class="group-h">'+y+'</div>'+byYear[y].map(function(x){ return '<div class="small" style="padding:6px 0;border-bottom:1px solid var(--line)"><b>'+esc(x.sujet)+'</b><br><span class="muted">'+fmtLong(x.date)+' · '+esc(x.eleve||"")+(x.note?' · '+esc(x.note):'')+'</span></div>'; }).join(""); }).join("") : '<div class="empty">Aucun sujet relevé pour l\'instant.</div>')+'</section>';
  return h;
}
function bjSummary(nom){
  var list=BJ.collesDe(nom).filter(function(x){return x.commentaire;}).slice(0,60);
  if(!list.length) return;
  toast("Gemini lit les commentaires…");
  var txt=list.map(function(x){ return "- ("+(x.note||"?")+", "+x.discipline+") "+x.commentaire.replace(/\s+/g," ").slice(0,700); }).join("\n");
  Sync.invoke({mode:"chat", context:"Profil de colleur BJcolle", messages:[{role:"user", text:"Voici les commentaires écrits par "+nom+" (colleur de prépa ECG) sur des colles d'élèves, avec la note. Dégage, sans rien inventer et en t'appuyant uniquement sur ces commentaires : 1) ses exigences récurrentes (ce qu'il valorise), 2) les reproches qui reviennent, 3) trois conseils concrets pour réussir une colle avec lui. Réponse brève, en puces.\n\n"+txt}]}).then(function(r){
    try{ localStorage.setItem("prepa.bjsum."+nom, JSON.stringify({text:r.text, n:list.length, at:new Date().toISOString()})); }catch(e){}
    if(S.view==="bjcolleur") render();
  }).catch(function(e){ toast("Gemini : "+(e&&e.message||"erreur")); });
}

/* ---------- Notes ---------- */
var BJ_EP={"Mathématiques":"o-maths","Histoire-Géographie":"o-hgg","Français-Philosophie":"o-csh","Anglais LV1":"o-ang","Allemand LV1":"o-all","Entretiens de personnalité":"o-entretien"};
function bjNotes(id){ if(typeof BJ==="undefined") return []; return BJ.mine().filter(function(c){ return c.annee==="2026-2027" && c.note_num!=null && (BJ.isEntretien(c)?"o-entretien":BJ_EP[c.discipline])===id; }).map(function(c){ return {id:"bj-"+c.id,ep:id,v:c.note_num,date:c.date,label:(c.type?c.type+" · ":BJ.isEntretien(c)?"Entretien · ":"Colle · ")+(c.colleur||""),com:"",bj:true}; }); }
function notesOf(id){ return st().notes.filter(function(n){ return n.ep===id; }).concat(bjNotes(id)).sort(function(a,b){ return a.date.localeCompare(b.date); }); }
function epOfId(id){ return EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){ return x.id===id; }); }
/* langues : la courbe principale suit la note globale des DST (les exercices notés seuls n'y entrent pas) */
function mainNotes(id){ var e=epOfId(id), ns=notesOf(id); if(!e||!e.types) return ns; var d=ns.filter(function(n){ return n.parts || !n.type; }); return d.length?d:ns; }
function exNotes(id,ty){ return notesOf(id).filter(function(n){ return (n.parts&&n.parts[ty]!=null) || (!n.parts&&n.type===ty); }).map(function(n){ return {v:n.parts&&n.parts[ty]!=null?n.parts[ty]:n.v, date:n.date}; }); }
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
  var num=0, den=0; eps.forEach(function(e){ var a=avg(mainNotes(e.id)); if(a!=null && e.coef){ num+=a*e.coef; den+=e.coef; } });
  var g=den?num/den:null;
  h+='<section class="card overall"><div><div class="eyebrow">Moyenne pondérée · coefficients HEC ('+(m==="ecrit"?"écrits /30":"oraux /36")+')</div><div class="big tab">'+f1(g)+'<small style="font-size:18px;color:var(--ink-3)"> /20</small></div></div><div style="text-align:right"><div class="eyebrow">Barre d\'admissibilité HEC 2026</div><div style="font-weight:800;font-size:22px;color:var(--red)" class="tab">15,29</div>'+(g!=null?'<div class="small '+(g>=BARRE_HEC?"":"muted")+'">'+(g>=BARRE_HEC?"Au-dessus de la barre":"Écart : "+f1(BARRE_HEC-g)+" pt")+'</div>':'')+'</div></section>';
  h+='<div class="row" style="justify-content:space-between;margin:16px 0 10px"><span class="small muted">'+(m==="ecrit"?"Depuis le début de la 1re année":"Depuis le début de la 2e année · colles importées de BJcolle")+'</span><button class="btn primary sm" data-a="addnote">'+I.plus+' Ajouter une note</button></div>';
  h+='<div class="grid g3">';
  eps.forEach(function(e){
    var ns=mainNotes(e.id), a=avg(ns), s=subj(e.sub), last=ns.length?ns[ns.length-1].v:null;
    var tr=ns.length>=2?(ns[ns.length-1].v>=avg(ns.slice(0,-1))?"↗":"↘"):"";
    h+='<button class="tile '+s.cls+'" data-a="notedetail" data-id="'+e.id+'"><div class="top"><span class="name">'+esc(e.name)+'</span><span class="coef">coef. '+(e.coefTxt||e.coef)+'</span></div><div class="avg tab">'+f1(a)+'<small> '+tr+'</small></div>'+spark(ns,"var(--si)")+'<div class="small muted">'+(ns.length?plural(ns.length,"note")+" · dernière "+f1(last):"Aucune note")+'</div></button>';
  });
  h+='</div>';
  return h;
}
function noteDetail(id){
  var e=EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){ return x.id===id; }), s=subj(e.sub), ns=mainNotes(id), all=notesOf(id), a=avg(ns), last=ns.length?ns[ns.length-1].v:null, goal=st().goals[id];
  var vals=ns.map(function(n){ return n.v; }).concat([BARRE_HEC]).concat(goal!=null?[goal]:[]);
  var lo=Math.max(0,Math.min(8,Math.floor(Math.min.apply(null,vals)-1))), hi=20;
  function pos(v){ return ((Math.max(lo,Math.min(hi,v))-lo)/(hi-lo)*100).toFixed(2)+"%"; }
  var gap=(goal!=null&&a!=null)?goal-a:null;
  function stat(lbl,val,col,sub){ return '<div class="nstat"><div class="nl"><i style="background:'+col+'"></i>'+lbl+'</div><div class="nv tab">'+val+'</div>'+(sub?'<div class="ns">'+sub+'</div>':'')+'</div>'; }
  var h='<div class="band '+s.cls+'"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">'+(id.charAt(0)==="e"?"Écrit":"Oral")+' · coef. '+(e.coefTxt||e.coef)+'</div><h2>'+esc(e.name)+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b '+s.cls+'">';
  h+='<section class="card flat"><div class="nstats">'+
    stat("Moyenne",f1(a),"var(--si)",ns.length?plural(ns.length,"note"):"aucune note")+
    stat("Dernière",f1(last),"var(--ink-2)",ns.length?fmtDay(ns[ns.length-1].date):"")+
    stat("Objectif",goal!=null?f1(goal):"–","var(--green)",gap==null?"à placer":gap<=0?"atteint":"encore "+f1(gap)+" pt")+
    stat("Barre HEC",String(BARRE_HEC).replace(".",","),"var(--ink)",a==null?"":a>=BARRE_HEC?"au-dessus":"écart "+f1(BARRE_HEC-a)+" pt")+'</div>';
  var ticks=[]; for(var tv=Math.ceil(lo/2)*2; tv<=hi; tv+=2) ticks.push(tv);
  h+='<div class="nscale"><div class="trk">'+(a!=null?'<div class="fill" style="width:'+pos(a)+'"></div>':'')+'</div>'+
    ns.map(function(n){ return '<span class="dot" style="left:'+pos(n.v)+'" title="'+f1(n.v)+' · '+esc(fmtDay(n.date))+'"></span>'; }).join("")+
    '<span class="ln bar" style="left:'+pos(BARRE_HEC)+'" title="Barre HEC"></span>'+(goal!=null?'<span class="ln goal" style="left:'+pos(goal)+'" title="Objectif"></span>':'')+(a!=null?'<span class="ln avg" style="left:'+pos(a)+'" title="Moyenne"></span>':'')+
    ticks.map(function(v){ return '<span class="tk" style="left:'+pos(v)+'">'+v+'</span>'; }).join("")+'</div>';
  h+='<div class="nleg"><span><i class="d"></i>chaque note</span><span><i style="background:var(--si)"></i>moyenne</span><span><i style="background:var(--green)"></i>objectif</span><span><i style="background:var(--ink)"></i>barre HEC</span></div>';
  if(ns.length>=2) h+=noteCurve(ns,goal,e.types?"Évolution · note globale du DST":null);
  if(e.types){
    S.noteEx=S.noteEx||{}; var cur=S.noteEx[id]||e.types[0], xs=exNotes(id,cur);
    h+='<details class="exsec"'+(S.noteEx[id]?" open":"")+'><summary>Par exercice <span class="small muted">'+e.types.map(function(t){ var a2=avg(exNotes(id,t)); return esc(t)+" "+f1(a2); }).join(" · ")+'</span></summary>';
    h+='<div class="seg exseg" role="tablist">'+e.types.map(function(t){ return '<button class="'+(t===cur?"on":"")+'" data-a="noteex" data-ep="'+id+'" data-t="'+esc(t)+'" role="tab" aria-selected="'+(t===cur)+'">'+esc(t)+'</button>'; }).join("")+'</div>';
    h+='<div class="small muted" style="margin:8px 0 0">'+(xs.length?esc(cur)+" : moyenne "+f1(avg(xs))+" sur "+plural(xs.length,"note")+" · dernière "+f1(xs[xs.length-1].v):"Pas encore de note en "+esc(cur)+".")+'</div>';
    h+=xs.length>=2?noteCurve(xs,null,""):xs.length?'':'';
    h+='</details>';
  }
  h+='<label class="lbl" for="goal-range" style="margin-top:18px">Ton objectif : <b id="goal-val">'+(goal!=null?f1(goal):"à placer")+'</b></label><input id="goal-range" type="range" min="8" max="20" step="0.5" value="'+(goal!=null?goal:16)+'" data-goal="'+id+'" style="width:100%"></section>';
  h+='<section class="card flat"><div class="card-h"><h2>Notes</h2><button class="btn sm tint" data-a="addnote" data-ep="'+id+'">'+I.plus+' Ajouter</button></div>';
  h+=all.length?'<div class="notes-list">'+all.slice().reverse().map(function(n){ return '<div class="it"><div'+(n.bj?'':' data-a="editnote" data-id="'+n.id+'" data-ep="'+id+'" role="button" style="cursor:pointer;flex:1"')+'><div style="font-weight:600">'+esc(n.label||(n.parts?"DST":e.name))+(n.type?' · '+esc(n.type):'')+'</div><div class="small muted">'+fmtDay(n.date)+(n.parts?' · '+Object.keys(n.parts).map(function(k){ return esc(k)+" "+f1(n.parts[k]); }).join(" · "):'')+(n.com?' · '+esc(n.com):'')+'</div></div><div class="row"><span class="v">'+f1(n.v)+'</span>'+(n.bj?'<span class="small faint">BJcolle</span>':'<button class="del icon-btn" style="width:30px;height:30px;opacity:1" data-a="delnote" data-id="'+n.id+'" data-ep="'+id+'" aria-label="Supprimer la note">'+I.trash+'</button>')+'</div></div>'; }).join("")+'</div>':'<div class="empty">Aucune note pour l\'instant.</div>';
  h+='</section></div>';
  openSheet(h);
}
function noteCurve(ns,goal,title){
  var W=320,H=110,pl=26,pr=8,pt=10,pb=18, vs=ns.map(function(n){ return n.v; }).concat(goal!=null?[goal]:[]);
  var lo=Math.max(0,Math.floor(Math.min.apply(null,vs))-1), hi=Math.min(20,Math.ceil(Math.max.apply(null,vs))+1);
  function X(i){ return pl+(ns.length===1?0:i/(ns.length-1)*(W-pl-pr)); } function Y(v){ return pt+(hi-v)/(hi-lo)*(H-pt-pb); }
  var g='', d=ns.map(function(n,i){ return (i?"L":"M")+X(i).toFixed(1)+" "+Y(n.v).toFixed(1); }).join(" ");
  for(var v=Math.ceil(lo); v<=hi; v+=(hi-lo>8?2:1)) g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="var(--line)" stroke-width="1"/><text x="'+(pl-6)+'" y="'+(Y(v)+3.5)+'" text-anchor="end" font-size="9.5" fill="var(--ink-3)">'+v+'</text>';
  if(goal!=null) g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(goal)+'" y2="'+Y(goal)+'" stroke="var(--green)" stroke-width="1.5" stroke-dasharray="4 3"/>';
  if(BARRE_HEC>=lo&&BARRE_HEC<=hi) g+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(BARRE_HEC)+'" y2="'+Y(BARRE_HEC)+'" stroke="var(--ink)" stroke-width="1" stroke-dasharray="2 3" opacity=".55"/>';
  return (title===""?'':'<div class="eyebrow" style="margin-top:16px">'+esc(title||"Évolution")+'</div>')+'<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block;margin-top:6px" role="img" aria-label="Évolution des notes">'+g+'<path d="'+d+'" fill="none" stroke="var(--si)" stroke-width="2.2" stroke-linejoin="round"/>'+ns.map(function(n,i){ return '<circle cx="'+X(i)+'" cy="'+Y(n.v)+'" r="3.4" fill="var(--surface)" stroke="var(--si)" stroke-width="2"><title>'+f1(n.v)+' · '+fmtDay(n.date)+'</title></circle>'; }).join("")+'</svg>';
}
function addNoteSheet(ep){
  var all=EPREUVES.ecrit.map(function(e){return ["Écrit",e];}).concat(EPREUVES.oral.map(function(e){return ["Oral",e];}));
  var h='<div class="sheet-h"><div class="ttl"><h2>Nouvelle note</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><form class="sheet-b" id="note-form">';
  h+='<div><label class="lbl" for="n-ep">Épreuve</label><select class="field" id="n-ep">'+all.map(function(x){ return '<option value="'+x[1].id+'"'+(x[1].id===(ep||(S.notesMode==="ecrit"?"e-maths":"o-maths"))?" selected":"")+'>'+x[0]+' · '+esc(x[1].name)+'</option>'; }).join("")+'</select></div>';
  h+='<div id="n-type-wrap"></div><div class="grid nvd" style="gap:10px"><div><label class="lbl" for="n-v">Note /20</label><input class="field tab" id="n-v" inputmode="decimal" placeholder="13,5" required></div><div><label class="lbl" for="n-date">Date</label><input class="field" id="n-date" type="date" value="'+iso(today())+'" required></div></div>';
  h+='<div><label class="lbl" for="n-label">Intitulé (facultatif)</label><input class="field" id="n-label" placeholder="DST n°3, colle de M. X…"></div><div><label class="lbl" for="n-com">Commentaire (facultatif)</label><input class="field" id="n-com"></div>';
  h+='<button class="btn primary" type="submit">Enregistrer</button></form>';
  openSheet(h);
  var sel=document.getElementById("n-ep"), wrap=document.getElementById("n-type-wrap");
  var nv=document.getElementById("n-v");
  function parts(){ var ty=document.getElementById("n-type"), pw=document.getElementById("n-parts"); if(!pw) return; var on=ty&&ty.value==="__dst"; pw.hidden=!on; nv.required=!on; nv.placeholder=on?(langW(sel.value,"Essay")?"auto (50/30/20)":"auto (moyenne)"):"13,5"; document.querySelector('label[for="n-v"]').textContent=on?"Note globale /20":"Note /20"; livePreview(); }
  function livePreview(){ var ty=document.getElementById("n-type"), e=epOfId(sel.value); if(!ty||ty.value!=="__dst"||!e||!e.types) return; var pr={}; e.types.forEach(function(t,i){ var x=numOrNull((document.getElementById("n-p"+i)||{}).value); if(x!=null&&x>=0&&x<=20) pr[t]=x; }); var g=dstGlobal(sel.value,pr); nv.placeholder=g!=null?"auto : "+f1(g):(langW(sel.value,"Essay")?"auto (50/30/20)":"auto (moyenne)"); }
  wrap.addEventListener("input",livePreview);
  function types(){ var e=epOfId(sel.value); wrap.innerHTML=e&&e.types?'<label class="lbl" for="n-type">Type</label><select class="field" id="n-type"><option value="__dst">DST complet (les 3 exercices)</option>'+e.types.map(function(t){return '<option value="'+esc(t)+'">'+esc(t)+' seul</option>';}).join("")+'</select><div id="n-parts" class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">'+e.types.map(function(t,i){ return '<div><label class="lbl" for="n-p'+i+'">'+esc(t)+(langW(e.id,t)?' <span class="faint" style="font-weight:600">'+Math.round(langW(e.id,t)*100)+' %</span>':'')+'</label><input class="field tab" id="n-p'+i+'" inputmode="decimal" placeholder="/20"></div>'; }).join("")+'</div>':''; var ty=document.getElementById("n-type"); if(ty) ty.onchange=parts; parts(); if(!e||!e.types){ nv.required=true; nv.placeholder="13,5"; document.querySelector('label[for="n-v"]').textContent="Note /20"; } }
  sel.onchange=types; types();
  document.getElementById("note-form").addEventListener("submit",function(ev){
    ev.preventDefault();
    var num=function(x){ var y=parseFloat(String(x||"").replace(",",".")); return isNaN(y)?null:y; };
    var v=num(document.getElementById("n-v").value), ty=document.getElementById("n-type"), pr=null, e=epOfId(sel.value);
    if(ty && ty.value==="__dst"){
      pr={}; var got=[]; e.types.forEach(function(t,i){ var x=num(document.getElementById("n-p"+i).value); if(x!=null){ if(x<0||x>20){ got=null; return; } pr[t]=x; if(got) got.push(x); } });
      if(got===null){ toast("Chaque note d'exercice doit être entre 0 et 20."); return; }
      if(v==null && got.length) v=dstGlobal(sel.value,pr);
      if(!got.length) pr=null;
    }
    if(v==null||v<0||v>20){ toast("Entre une note entre 0 et 20."); return; }
    st().notes.push({id:uid("n"),w:1,ep:sel.value,v:v,date:document.getElementById("n-date").value,label:document.getElementById("n-label").value.trim(),com:document.getElementById("n-com").value.trim(),type:ty&&ty.value!=="__dst"?ty.value:null,parts:pr});
    save(); closeSheet(); S.notesMode=sel.value.charAt(0)==="e"?"ecrit":"oral"; if(S.view==="notes") render(); toast("Note enregistrée.");
  });
}

/* ---------- Méthodo ---------- */
function vMethodo(){
  var m=S.methMode, eps=EPREUVES[m];
  var h=topbar("Méthodo")+'<div class="ag-head"><h1 class="large-title" style="margin:0">Méthodo</h1><div class="seg"><button class="'+(m==="ecrit"?"on":"")+'" data-a="methmode" data-m="ecrit">Écrit</button><button class="'+(m==="oral"?"on":"")+'" data-a="methmode" data-m="oral">Oral</button></div></div><p class="subtitle">À parcourir avant chaque échéance pour se remettre dans le bain.</p><div class="grid g3">';
  eps.forEach(function(e){ var s=subj(e.sub), r=(st().ressentis[e.id]||[]).length; h+='<button class="subj '+s.cls+'" style="min-height:120px" data-a="methode" data-id="'+e.id+'"><div class="row" style="justify-content:space-between"><h3>'+esc(e.name)+'</h3><span class="tag '+s.cls+'">coef. '+(e.coefTxt||e.coef)+'</span></div><p>'+(r?plural(r,"ressenti"):(METHODO.epreuves[e.id]&&METHODO.epreuves[e.id].essentiel.length?"Synthèse de "+plural(METHODO.epreuves[e.id].sources.length,"document")+", pièges, conseils des profs":"Pas encore de document de méthode"))+'</p></button>'; });
  return h+'</div>';
}
/* échéances (DST + mes colles BJcolle) rattachées à une épreuve de la méthodo */
var PALE_EP={"HGG":"e-hgg","Maths":"e-maths","Synthèse":"e-synth","Anglais":"e-ang","Allemand":"e-all"};
var COLLE_EP={maths:"o-maths",hgg:"o-hgg",csh:"o-csh",ang:"o-ang",all:"o-all"};
function paleEp(p){ return PALE_EP[p.t.replace(/^Concours blanc · /,"")] || (/dissert/i.test(p.t)?"e-dissert":/synth/i.test(p.t)?"e-synth":/maths/i.test(p.t)?"e-maths":/hgg/i.test(p.t)?"e-hgg":/angl/i.test(p.t)?"e-ang":/allem/i.test(p.t)?"e-all":null); }
function echeances(from,to){
  var out=[];
  PALES.forEach(function(p){ var ep=paleEp(p); if(ep && p.date>=from && p.date<=to) out.push({key:"p|"+p.date+"|"+p.t, ep:ep, date:p.date, time:p.s, end:p.e, label:"DST de "+p.t.replace(/^Concours blanc · /,""), sub:p.sub}); });
  if(typeof BJ!=="undefined") BJ.mine().forEach(function(c){ if((c.scope==="moi"||c.scope==="kore") && c.date>=from && c.date<=to && c.debut){ var ep=BJ.epOf(c); if(ep) out.push({key:"c|"+c.id, ep:ep, date:c.date, time:c.debut, end:c.fin||fromMin(toMin(c.debut)+(c.duree||20)), label:(BJ.isEntretien(c)?"Entretien de personnalité":"Colle de "+c.discipline)+(c.colleur?" ("+c.colleur+")":""), sub:BJ.subOf(c)}); } });
  return out.sort(function(a,b){ return (a.date+a.time).localeCompare(b.date+b.time); });
}
function epName(id){ var e=EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){ return x.id===id; }); return e?(id.charAt(0)==="e"?"Écrit de ":"Oral de ")+e.name:id; }
function resDismissed(){ try{ return JSON.parse(localStorage.getItem("prepa.resdone")||"{}"); }catch(e){ return {}; } }
function lcFirst(l){ return /^[A-Z][a-zé]/.test(l)? l.charAt(0).toLowerCase()+l.slice(1) : l; }
function homeResAsk(){
  var t=iso(today()), nm=nowMin();
  var dis=resDismissed(), hr="";
  echeances(iso(addDays(today(),-3)), t).filter(function(x){ return (x.date<t || toMin(x.end||x.time)<=nm) && !dis[x.key] && !(st().ressentis[x.ep]||[]).some(function(r){ return r.ev===x.key || r.date>x.date; }); }).slice(-2).forEach(function(x){
    hr+='<section class="card res-ask" style="margin:0 0 14px"><div class="card-h"><h2>Comment s\'est '+(/^DST/.test(x.label)?'passé ton ':'passée ta ')+esc(lcFirst(x.label))+' ?</h2><span class="small muted">'+fmtDay(x.date)+'</span></div><p class="small muted" style="margin:0 0 10px">Note ton ressenti à chaud : il sera remis sous tes yeux avant la prochaine '+esc(epName(x.ep).toLowerCase())+'.</p><div class="row" style="gap:8px"><button class="btn tint sm" data-a="ressenti" data-id="'+x.ep+'" data-k="'+esc(x.key)+'" data-l="'+esc(x.label)+'">Noter mon ressenti</button><button class="btn sm" data-a="resskip" data-k="'+esc(x.key)+'">Plus tard</button></div></section>';
  });
  return hr;
}
function homeMethodoCards(){
  var t=iso(today()), nm=nowMin(), h="";
  var soon=echeances(t, iso(addDays(today(),3))).filter(function(x){ return x.date>t || toMin(x.time)>nm; });
  var seen={};
  soon.forEach(function(x){ if(seen[x.ep]) return; seen[x.ep]=1; var m=methOf(x.ep), dd=diffDays(x.date,t);
    var ess=(m.essentiel||[]).slice(0,3);
    h+='<section class="card '+subj(x.sub).cls+'" style="margin-top:14px"><div class="card-h"><h2>À relire avant '+(/^DST/.test(x.label)?'ton ':'ta ')+esc(lcFirst(x.label))+'</h2><span class="tag '+subj(x.sub).cls+'">'+(dd===0?"aujourd'hui "+hLabel(x.time):dd===1?"demain "+hLabel(x.time):"J-"+dd)+'</span></div>';
    h+=ess.length?'<ul class="small" style="margin:4px 0 10px;padding-left:18px">'+ess.map(function(e){ return '<li style="margin:3px 0">'+mtx(e)+'</li>'; }).join("")+'</ul>':'<p class="small muted">'+esc(m.manque||"Pas encore de fiche de méthode pour cette épreuve.")+'</p>';
    var last=(st().ressentis[x.ep]||[]).slice(-1)[0]; if(last) h+='<p class="small muted" style="margin:0 0 10px"><b>Ton dernier ressenti</b> ('+fmtDay(last.date)+') : '+esc(last.t.length>160?last.t.slice(0,160)+"…":last.t)+'</p>';
    h+='<button class="btn tint sm" data-a="methode" data-id="'+x.ep+'">Relire toute la synthèse</button></section>'; });
  return h;
}
function mtx(t){ return esc(t).replace(/\*\*(.+?)\*\*/g,'<strong class="hl">$1</strong>'); }
function docLink(id){ var d=(METHODO.documents||[]).find(function(x){ return x.id===id; }); return d?'<a href="'+esc(d.lien)+'" target="_blank" rel="noopener">'+esc(d.titre)+'</a>'+(d.dossier?' <span class="muted">· '+esc(d.dossier)+'</span>':''):''; }
function methOf(id){ var b=METHODO.epreuves[id]||{}, o=(st().methEdits||{})[id]||{}, m={}; Object.keys(b).forEach(function(k){ m[k]=b[k]; }); Object.keys(o).forEach(function(k){ m[k]=o[k]; }); m.essentiel=m.essentiel||[]; m.sections=m.sections||[]; m.pieges=m.pieges||[]; m.conseils_profs=m.conseils_profs||[]; return m; }
function methodeSheet(id,evKey,evLabel){
  var e=EPREUVES.ecrit.concat(EPREUVES.oral).find(function(x){ return x.id===id; }), s=subj(e.sub), rs=st().ressentis[id]||[], m=methOf(id), mo=(st().methEdits||{})[id]||{};
  var eh=function(title,f,edited){ return '<div class="card-h" style="margin:0"><div class="eyebrow">'+title+(edited?' · <span style="color:var(--blue)">modifié</span>':'')+'</div><button class="link-btn" data-a="methedit" data-id="'+id+'" data-f="'+f+'">Modifier</button></div>'; };
  var li=function(a){ return '<ul class="small meth" style="margin:6px 0 0;padding-left:18px">'+a.map(function(x){ return '<li style="margin:5px 0">'+mtx(x)+'</li>'; }).join("")+'</ul>'; };
  var h='<div class="band '+s.cls+'"></div><div class="sheet-h"><div class="ttl"><div class="eyebrow">'+(id.charAt(0)==="e"?"Écrit":"Oral")+' · coef. '+(e.coefTxt||e.coef)+'</div><h2>'+esc(e.name)+'</h2></div><button class="icon-btn" data-a="close" aria-label="Fermer">'+I.close+'</button></div><div class="sheet-b">';
  var nx=echeances(iso(today()),"9999").filter(function(x){ return x.ep===id; })[0];
  if(nx) h+='<p class="small" style="margin:0 0 4px"><span class="tag '+s.cls+'">Prochaine : '+esc(nx.label)+' · '+esc(relDay(nx.date).toLowerCase())+' '+hLabel(nx.time)+'</span></p>';
  /* 1. le ressenti d'abord : ce qu'il faut corriger par rapport à la dernière fois */
  if(evKey) h+=resForm(evLabel);
  if(rs.length){
    var rl=rs.map(function(r,i){ return [r,i]; }).reverse(), last=rl[0];
    h+='<section class="card flat mres"><div class="card-h" style="margin:0"><div class="eyebrow">Ton dernier ressenti · à corriger cette fois</div><button class="link-btn" data-a="resedit" data-id="'+id+'" data-i="'+last[1]+'">Modifier</button></div><div class="small muted" style="margin:4px 0 2px">'+fmtDay(last[0].date)+(last[0].l?' · '+esc(last[0].l):'')+'</div><div class="mres-t">'+esc(last[0].t)+'</div>';
    if(rl.length>1) h+='<details class="mdet2"><summary>'+plural(rl.length-1,"ressenti")+' plus ancien'+(rl.length>2?'s':'')+'</summary>'+rl.slice(1).map(function(x){ var r=x[0]; return '<div class="mres-old"><div class="row" style="justify-content:space-between"><span class="small muted">'+fmtDay(r.date)+(r.l?' · '+esc(r.l):'')+'</span><button class="link-btn" data-a="resedit" data-id="'+id+'" data-i="'+x[1]+'">Modifier</button></div><div class="small" style="white-space:pre-wrap">'+esc(r.t)+'</div></div>'; }).join("")+'</details>';
    h+='</section>';
  }
  if(!evKey) h+='<details class="card flat mdet2"'+(rs.length?'':' open')+'><summary>Noter un ressenti</summary>'+resForm(null,true)+'</details>';
  /* 2. l'essentiel */
  h+='<section class="card flat">'+eh("L\'essentiel","essentiel",!!mo.essentiel)+(m.essentiel.length?li(m.essentiel):'<p class="small muted" style="margin:6px 0 0">Vide : touche « Modifier » pour écrire tes points.</p>')+(m.temps?'<div class="mtemps"><b>Temps</b> '+mtx(m.temps)+' <button class="link-btn" data-a="methedit" data-id="'+id+'" data-f="temps">Modifier</button></div>':'')+'</section>';
  /* 3. le reste, replié */
  if(m.pieges.length||mo.pieges) h+='<details class="card flat mdet2"><summary>Pièges à éviter <span class="small muted">('+m.pieges.length+')</span></summary><div style="text-align:right"><button class="link-btn" data-a="methedit" data-id="'+id+'" data-f="pieges">Modifier</button></div>'+li(m.pieges)+'</details>';
  if(m.conseils_profs.length) h+='<details class="card flat mdet2"><summary>Conseils des profs <span class="small muted">('+m.conseils_profs.length+')</span></summary><div style="text-align:right"><button class="link-btn" data-a="methedit" data-id="'+id+'" data-f="conseils">Modifier</button></div>'+m.conseils_profs.map(function(c){ return '<div style="margin-top:8px"><div class="small"><b>'+esc(c.qui)+'</b></div><div class="small meth" style="white-space:pre-wrap">'+mtx(c.texte)+'</div></div>'; }).join("")+'</details>';
  m.sections.forEach(function(x,i){ h+='<details class="card flat mdet2"><summary>'+esc(x.titre)+' <span class="small muted">('+x.points.length+')</span></summary><div style="text-align:right"><button class="link-btn" data-a="methedit" data-id="'+id+'" data-f="sec:'+i+'">Modifier</button></div>'+li(x.points)+'</details>'; });
  if(id.charAt(0)==="o" && typeof BJ!=="undefined"){
    var coms=BJ.mine().filter(function(c){ return BJ.epOf(c)===id && c.commentaire; }).sort(function(a,b){ return (b.date||"").localeCompare(a.date||""); }).slice(0,4);
    if(coms.length) h+='<details class="card flat mdet2" open><summary>Commentaires de tes colleurs</summary>'+coms.map(function(c){ return '<div style="margin-top:8px"><div class="small"><b>'+esc(c.colleur||"")+'</b> <span class="muted">· '+fmtDay(c.date)+(c.note?' · '+esc(c.note):'')+'</span></div><div class="small" style="white-space:pre-wrap">'+esc(c.commentaire)+'</div></div>'; }).join("")+'</details>';
  }
  if(!m.essentiel.length && m.manque) h+='<p class="small muted" style="margin:0 4px 10px">'+esc(m.manque)+'</p>';
  var rap=(typeof grRapports==="function")?grRapports(id):[];
  if(rap.length) h+='<details class="card flat mdet2"><summary>Rapports du jury <span class="small muted">('+rap.length+')</span></summary><div class="small" style="margin-top:6px">'+rap.map(function(r){ return '<div style="margin:4px 0"><a href="'+esc(r.pdf||r.u)+'" target="_blank" rel="noopener">'+esc(r.ti)+'</a></div>'; }).join("")+'</div></details>';
  if(m.sources&&m.sources.length) h+='<details class="card flat mdet2"><summary>Sources (ton Drive)</summary><ul class="small" style="margin:6px 0 0;padding-left:18px">'+m.sources.map(function(x){ var l=docLink(x); return l?'<li style="margin:3px 0">'+l+'</li>':''; }).join("")+'</ul></details>';
  h+='<div class="row" style="gap:8px;margin-top:4px"><button class="btn sm" data-a="methedit" data-id="'+id+'" data-f="newsec">'+I.plus+' Ajouter une partie</button>'+(m.temps||mo.temps!=null?'':'<button class="btn sm" data-a="methedit" data-id="'+id+'" data-f="temps">'+I.plus+' Gestion du temps</button>')+(m.pieges.length||mo.pieges?'':'<button class="btn sm" data-a="methedit" data-id="'+id+'" data-f="pieges">'+I.plus+' Pièges</button>')+'</div>';
  h+='</div>';
  openSheet(h);
  document.getElementById("res-form").addEventListener("submit",function(ev){ ev.preventDefault(); var v=document.getElementById("res-txt").value.trim(); if(!v) return; var r={date:iso(today()),t:v}; if(evKey){ r.ev=evKey; r.l=evLabel; } (st().ressentis[id]=st().ressentis[id]||[]).push(r); save(); methodeSheet(id); toast("Ressenti enregistré."); if(S.view==="home"||!S.view) render(); });
}
function resForm(label,bare){
  var f='<form id="res-form" style="margin-top:8px" class="stack"><textarea class="field" id="res-txt" placeholder="Ce qui a marché, ce qui a bloqué, la gestion du temps, ce que je change la prochaine fois…"></textarea><button class="btn tint sm" type="submit" style="align-self:flex-start">Enregistrer</button></form>';
  return bare?f:'<section class="card flat"><div class="eyebrow">'+(label?"Mon ressenti · "+esc(label):"Noter un ressenti")+'</div>'+f+'</section>';
}

/* ---------- Plus (téléphone) ---------- */
function vPlus(){
  var h=topbar("Plus")+'<h1 class="large-title">Plus</h1><p class="subtitle">Le reste de l\'app.</p><div class="stack">';
  [["grange","Grange","Sujets, oraux, DS et meilleures copies",GRANGE_IC],["todo","To-Do","Toutes tes tâches",I.list],["echeances","Échéances","DST, colles, BJcolle",I.flag],["notes","Objectifs","Moyenne HEC, barres, où gagner le plus",I.chart],["methodo","Méthodo","Méthode par épreuve, ressentis, conseils",I.book]].forEach(function(x){
    h+='<button class="ext" data-go="'+x[0]+'" style="border:0;text-align:left"><div class="row" style="gap:14px;flex-wrap:nowrap"><span class="icon-btn" style="color:var(--blue)">'+x[3]+'</span><div><b>'+x[1]+'</b><span class="small muted">'+x[2]+'</span></div></div>'+I.right+'</button>';
  });
  return h+'</div>';
}

/* ---------- fenêtres ---------- */
function openSheet(html){
  clearTimeout(sheetCloseT); var cur=layer.querySelector(".sheet:not(.closing)"), GRAB='<div class="grab" aria-hidden="true"></div>';
  /* fiche déjà ouverte : mise à jour sur place, sans rejouer l'animation (les fiches à formulaire sont reconstruites pour leurs écouteurs) */
  if(cur && window.morphdom && html.indexOf("<form")<0 && !cur.querySelector("form")){ morphTo(cur,GRAB+html,{quiet:true}); return; }
  layer.innerHTML='<div class="scrim'+(cur?' still':'')+'" data-a="close"></div><div class="sheet'+(cur?' still':'')+'" role="dialog" aria-modal="true">'+GRAB+html+'</div>';
  if(typeof enhanceDates==="function") enhanceDates(layer);
  var f=layer.querySelector(".sheet input:not([type=range]),.sheet button"); if(f && window.innerWidth>=600) try{ f.focus({preventScroll:true}); }catch(e){}
}
var sheetCloseT=null;
function closeSheet(){
  S.timers={}; var sh=layer.querySelector(".sheet"), sc=layer.querySelector(".scrim");
  if(!sh || matchMedia("(prefers-reduced-motion: reduce)").matches){ layer.innerHTML=""; return; }
  sh.classList.add("closing"); if(sc) sc.classList.add("closing"); sh.style.transform=""; 
  var snap=layer.innerHTML; clearTimeout(sheetCloseT);
  sheetCloseT=setTimeout(function(){ if(layer.querySelector(".sheet.closing")) layer.innerHTML=""; },260);
}
/* fiche glissée vers le bas pour la fermer (téléphone) */
(function(){
  var y0=null, t0=0, sh=null, dy=0;
  document.addEventListener("pointerdown",function(e){
    if(window.innerWidth>=600) return; var s=e.target.closest(".sheet"); if(!s||s.classList.contains("closing")) return;
    var b=s.querySelector(".sheet-b"); if(!(e.target.closest(".grab,.sheet-h,.band") || (b && b.scrollTop<=0 && e.target.closest(".sheet-b") && e.pointerType==="touch"))) return;
    if(e.target.closest("input,textarea,select,button,a,[data-a]") && !e.target.closest(".grab")) return;
    sh=s; y0=e.clientY; t0=Date.now(); dy=0;
  },{passive:true});
  document.addEventListener("pointermove",function(e){ if(!sh||y0==null) return; dy=Math.max(0,e.clientY-y0); if(dy>4){ sh.style.transition="none"; sh.style.transform="translateY("+dy+"px)"; } },{passive:true});
  function end(){ if(!sh) return; var v=dy/Math.max(1,Date.now()-t0); sh.style.transition="";
    if(dy>120 || (dy>40 && v>0.6)){ sh.style.transform="translateY("+dy+"px)"; closeSheet(); setTimeout(function(){ if(typeof render==="function") render(); },10); }
    else sh.style.transform=""; sh=null; y0=null; }
  document.addEventListener("pointerup",end); document.addEventListener("pointercancel",end);
})();
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
  if(mathsClick(a,b)) return;
  if(runClick(a,b)) return;
  if(grangeClick(a,b)) return;
  if(a==="close"){ closeSheet(); render(); return; }
  if(a==="quick"){ quickSheet(); return; }
  if(a==="gemini"){ geminiSheet(); return; }
  if(a==="account"){ accountSheet(); return; }
  if(a==="news-retry"){ newsErr=null; var c=document.getElementById("news-card"); if(c) c.innerHTML=newsHTML(); loadNews(true); return; }
  if(a==="syncnow"){ Sync.syncNow().then(function(){ toast("Synchronisé."); }); return; }
  if(a==="signout"){ Sync.signOut().then(function(){ closeSheet(); render(); toast("Déconnecté. Tes données restent sur cet appareil."); }); return; }
  if(a==="formback"){ if(S.formBack) S.formBack(); else { closeSheet(); render(); } return; }
  if(a==="edittask"){ editTask(b.getAttribute("data-id")); return; }
  if(a==="editnote"){ editNote(b.getAttribute("data-id"),b.getAttribute("data-ep")); return; }
  if(a==="resedit"){ editRessenti(b.getAttribute("data-id"),+b.getAttribute("data-i")); return; }
  if(a==="methedit"){ editMeth(b.getAttribute("data-id"),b.getAttribute("data-f")); return; }
  if(a==="quizedit"){ editQuizItem(b.getAttribute("data-k")); return; }
  if(a==="fedit"){ editFile(b.getAttribute("data-id")); return; }
  if(a==="slotedit"){ editSlot(b.getAttribute("data-d"),b.getAttribute("data-id")); return; }
  if(a==="slotadd"){ addSlot(S.agDate); return; }
  if(a==="gapisetup"){ gapiSetup(); return; }
  if(a==="pressday"){ pressLoad(b.getAttribute("data-d"),true); return; }
  if(a==="pcivi"){ civiSheet(b.getAttribute("data-k"),b.getAttribute("data-l"),b.getAttribute("data-i")); return; }
  if(a==="panki"){ pressAnki(b.getAttribute("data-k"),b.getAttribute("data-l"),b.getAttribute("data-i")); return; }
  if(a==="slotdel"){ slotDel(b.getAttribute("data-d"),b.getAttribute("data-id")); return; }
  if(a==="unvac"){ var tv=s.tasks.find(function(x){return x.id===b.getAttribute("data-id");}); if(tv){ tv.vac=false; save(); if(typeof Plan!=="undefined") Plan.invalidate(); render(); toast("Remise dans la To-Do normale : elle sera planifiée."); } return; }
  if(a==="vacweek"){ S.agMode="week"; S.agDate=iso(today()); go("agenda"); return; }
  if(a==="vaccopy"){ var txt=vacText(); (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(function(){ toast("Liste copiée : colle-la à Claude pour organiser tes vacances."); },function(){ sheetText(txt); }); return; }
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
    var tid=b.getAttribute("data-task"), k=b.getAttribute("data-k"), rf=b.getAttribute("data-ref");
    if(rf && a!=="timer"){ var rk=rf.slice(0,rf.indexOf(":")), rid=rf.slice(rf.indexOf(":")+1);
      if(a==="road"){ if(rk==="exo"){ if(s.mathsDone[rid]) delete s.mathsDone[rid]; else s.mathsDone[rid]=iso(today()); } else { var HH=hggState(); if(HH.done[rid]) delete HH.done[rid]; else HH.done[rid]=iso(today()); } delete S.timers[k]; }
      else { hggState().prog[rid]=+b.getAttribute("data-v"); toast("Noté : le reste du chapitre sera replanifié."); }
      save();
    } else if(a==="road"){
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
  if(a==="bjcheck"){ BJ.checkNow().then(function(){ toast("Vérification lancée : résultat dans une minute."); }).catch(function(e){ toast(e&&e.message||"Vérification impossible."); }); return; }
  if(a==="bjread"){ BJ.markRead(); render(); return; }
  if(a==="bjmore"){ S.bjF.n+=120; render(); return; }
  if(a==="bjfclr"){ S.bjF.colleur=""; render(); return; }
  if(a==="bjfcol"){ S.bjF=S.bjF||{disc:"",annee:"",q:"",n:80}; S.bjF.colleur=b.getAttribute("data-p"); go("bjclasse"); return; }
  if(a==="bjsum"){ bjSummary(b.getAttribute("data-p")); return; }
  if(a==="objbar"){ objBarSheet(b.getAttribute("data-k")); return; }
  if(a==="notesmode"){ S.notesMode=b.getAttribute("data-m"); render(); return; }
  if(a==="methmode"){ S.methMode=b.getAttribute("data-m"); render(); return; }
  if(a==="notedetail"){ noteDetail(b.getAttribute("data-id")); return; }
  if(a==="addnote"){ addNoteSheet(b.getAttribute("data-ep")); return; }
  if(a==="delnote"){ s.notes=s.notes.filter(function(n){return n.id!==b.getAttribute("data-id");}); save(); noteDetail(b.getAttribute("data-ep")); render(); return; }
  if(a==="methode"){ methodeSheet(b.getAttribute("data-id")); return; }
  if(a==="ressenti"){ methodeSheet(b.getAttribute("data-id"),b.getAttribute("data-k"),b.getAttribute("data-l")); return; }
  if(a==="fopen"){ Files.open(b.getAttribute("data-id")); return; }
  if(a==="fdel"){ var fx=s.files[b.getAttribute("data-id")]; if(fx && confirmDel(fx)){ Files.remove(fx.id); Plan.invalidate(); render(); } return; }
  if(a==="freanalyse"){ var fid=b.getAttribute("data-id"); Files.analyze(fid).then(function(){ toast("Analyse terminée."); Plan.invalidate(); window.__prepaRefresh(); },function(e){ toast("Analyse impossible : "+(e&&e.message||e)); window.__prepaRefresh(); }); render(); return; }
  if(a==="exo"){ var ek=b.getAttribute("data-k"); if(s.mathsDone[ek]) delete s.mathsDone[ek]; else s.mathsDone[ek]=iso(today()); save(); render(); return; }
  if(a==="exomin"){ var em=b.getAttribute("data-k").split("#"), eo=((s.mathsEx[em[0]]||{}).exos||[])[+em[1]]; if(eo){ eo.minutes=Math.max(5,(eo.minutes||30)+(+b.getAttribute("data-v"))); eo.perso=true; save(); render(); } return; }
  if(a==="annopen"){ annSheet(b.getAttribute("data-id")); return; }
  if(a==="annchk"){ var aid=b.getAttribute("data-id"), was=Ann.statusOf(aid)==="done", gr=Ann.setStatus(aid,was?"todo":"done"); if(!was) gameToast(gr); annRefresh(); return; }
  if(a==="annst"){ gameToast(Ann.setStatus(b.getAttribute("data-id"),b.getAttribute("data-v"))); annRefresh(); return; }
  if(a==="annnote"){ var nid=b.getAttribute("data-id"), rr=Ann.rec(nid)||{}, nn=rr.n==null?10:rr.n+(+b.getAttribute("data-v")); Ann.patch(nid,{n:Math.max(0,Math.min(20,nn))}); annRefresh(); return; }
  if(a==="anntime"){ Ann.addTime(b.getAttribute("data-id"),+b.getAttribute("data-v")); toast("+"+b.getAttribute("data-v")+" min"); annRefresh(); return; }
  if(a==="annfav"){ var fid2=b.getAttribute("data-id"); Ann.patch(fid2,{f:!((Ann.rec(fid2)||{}).f)}); annRefresh(); return; }
  if(a==="annavail"){ S.annAvail=+b.getAttribute("data-v"); render(); return; }
  if(a==="annmode"){ S.annF.mode=b.getAttribute("data-v"); S.annF.eps=[]; S.annF.n=60; render(); return; }
  if(a==="anneps"){ var ev2=b.getAttribute("data-v"), E=S.annF.eps; if(!ev2) S.annF.eps=[]; else { var ix=E.indexOf(ev2); if(ix>=0) E.splice(ix,1); else E.push(ev2); } S.annF.n=60; render(); return; }
  if(a==="annmore"){ S.annF.n+=60; render(); return; }
  if(a==="colopen"){ var ck=b.getAttribute("data-k"); colleSheet(ck); var cx=Colles.all().find(function(y){ return y.k===ck; }); if(cx&&!cx.ex&&!Colles.busy(ck)) colAnalyze(ck); return; }
  if(a==="colan"){ colAnalyze(b.getAttribute("data-k")); return; }
  if(a==="colswap"){ Colles.swap(b.getAttribute("data-d"),+b.getAttribute("data-i")); render(); return; }
  if(a==="coldone"){ Colles.toggleDone(b.getAttribute("data-d"),b.getAttribute("data-k")); render(); return; }
  if(a==="colprog"){ S.colF.ch=S.colF.ch==="prog"?"":"prog"; render(); return; }
  if(a==="quiz"){ S.quiz=null; quizSheet(); return; }
  if(a==="qshow"){ S.quiz.show=true; quizSheet(); return; }
  if(a==="qrate"){ quizRate(+b.getAttribute("data-v")); return; }
  if(a==="hggask"){ hggState().ask=iso(today()); save(); render(); return; }
  if(a==="hggdone"){ var H2=hggState(), hk=b.getAttribute("data-k"); if(H2.done[hk]) delete H2.done[hk]; else H2.done[hk]=iso(today()); save(); render(); return; }
  if(a==="hggmin"){ var H3=hggState(), mk=b.getAttribute("data-k"); H3.min[mk]=Math.max(30,(H3.min[mk]||120)+(+b.getAttribute("data-v"))); save(); render(); return; }
  if(a==="noteex"){ S.noteEx=S.noteEx||{}; S.noteEx[b.getAttribute("data-ep")]=b.getAttribute("data-t"); var sh=layer.querySelector(".sheet"), sc=sh?sh.scrollTop:0; noteDetail(b.getAttribute("data-ep")); var sh2=layer.querySelector(".sheet"); if(sh2){ sh2.scrollTop=sc; sh2.style.animation="none"; } return; }
  if(a==="resskip"){ var dz=resDismissed(); dz[b.getAttribute("data-k")]=1; try{ localStorage.setItem("prepa.resdone",JSON.stringify(dz)); }catch(e){} render(); return; }
});
var annQT=null;
document.addEventListener("input",function(ev){
  if(ev.target.id==="gr-q"){ clearTimeout(annQT); annQT=setTimeout(function(){ (S.gr=S.gr||{q:"",sub:"",type:""}).q=ev.target.value; S.grN={}; render(); },220); return; }
  if(ev.target.id==="ann-q"){ clearTimeout(annQT); annQT=setTimeout(function(){ S.annQ=ev.target.value; if(S.annF) S.annF.n=60; render(); },220); return; }
  var r=ev.target.closest("[data-goal]"); if(!r) return;
  st().goals[r.getAttribute("data-goal")]=+r.value; save();
  var v=document.getElementById("goal-val"); if(v) v.textContent=f1(+r.value);
});
document.addEventListener("change",function(ev){ var r=ev.target.closest("[data-goal]"); if(r){ noteDetail(r.getAttribute("data-goal")); render(); return; }
  var id=ev.target.id;
  if(id==="bjf-disc"){ S.bjF.disc=ev.target.value; S.bjF.n=80; render(); }
  else if(id==="bjf-annee"){ S.bjF.annee=ev.target.value; S.bjF.n=80; render(); }
  else if(id==="bjf-q"){ S.bjF.q=ev.target.value; S.bjF.n=80; render(); }
  else if(id==="bjcf-disc"){ S.bjCF.disc=ev.target.value; render(); }
  else if(ev.target.hasAttribute("data-pdeck")){ var pk=ev.target.getAttribute("data-pdeck"), PM=pressMark(), dv=ev.target.value;
    if(dv==="__new"){ var base=pk.indexOf("|en|")>0?"Anglais::Civi::":"Allemand::Civi::"; formSheet({title:"Nouveau paquet Anki",fields:[{k:"n",label:"Nom du sous-paquet",value:"",hint:"Créé dans "+base.replace(/::$/,"")}],save:function(v){ if(!v.n.trim()) return "Donne un nom."; PM[pk]=Object.assign({},PM[pk]||{},{deck:base+v.n.trim()}); },toast:"Paquet choisi."}); }
    else { PM[pk]=Object.assign({},PM[pk]||{},{deck:dv}); save(); } }
  else if(ev.target.hasAttribute("data-pv")){ var vk=ev.target.getAttribute("data-pv"), VM=pressMark(); VM[vk]=Object.assign({},VM[vk]||{}); VM[vk].ankiSel=Array.prototype.slice.call(document.querySelectorAll('[data-pv]')).filter(function(x){ return x.getAttribute("data-pv")===vk && x.checked; }).map(function(x){ return +x.getAttribute("data-j"); }); save(); }
  else if(id==="ann-focus"){ Ann.state().focus=ev.target.value||null; save(); render(); }
  else if(id==="annf-ch"){ S.annF.chs=ev.target.value?[ev.target.value]:[]; S.annF.n=60; render(); }
  else if(id==="annf-dur"){ S.annF.dur=ev.target.value; S.annF.n=60; render(); }
  else if(id==="annf-feas"){ S.annF.feas=ev.target.value; S.annF.n=60; render(); }
  else if(id==="annf-stat"){ S.annF.stat=ev.target.value; S.annF.n=60; render(); }
  else if(id==="annf-sort"){ S.annF.sort=ev.target.value; render(); }
  else if(id==="colf-ch"){ S.colF.ch=ev.target.value; render(); }
  else if(id==="colf-an"){ S.colF.an=ev.target.value; render(); }
  else if(id==="ann-notes"){ Ann.patch(ev.target.getAttribute("data-id"),{c:ev.target.value}); }
  else if(ev.target.hasAttribute("data-annp")){ Ann.patch(ev.target.getAttribute("data-annp"),{p:+ev.target.value}); annRefresh(); }
  else if(id==="m-chap"){ st().mathsCfg=st().mathsCfg||{}; st().mathsCfg.chap=ev.target.value.trim(); save(); render(); }
  else if(ev.target.hasAttribute("data-hggfait")){ var H=hggState(), k=ev.target.getAttribute("data-hggfait"); if(ev.target.checked) H.fait[k]=iso(today()); else delete H.fait[k]; H.ask=iso(today()); save(); render(); }
  else if(ev.target.hasAttribute("data-qsec")){ var qk=ev.target.getAttribute("data-qsec"); if(ev.target.checked) delete st().quizOff[qk]; else st().quizOff[qk]=true; save(); }
});
document.addEventListener("keydown",function(ev){ if(ev.key==="Escape" && layer.innerHTML){ closeSheet(); render(); } });
window.addEventListener("scroll",function(){ var tb=document.getElementById("topbar"); if(tb) tb.classList.toggle("scrolled",window.scrollY>40); },{passive:true});

/* mémorise le créneau ouvert pour pouvoir le rafraîchir */
var _openSlot=openSlot;
openSlot=function(d,id){ _openSlot(d,id); layer.setAttribute("data-slot",d+"§"+id); };
var _close=closeSheet;
closeSheet=function(){ _close(); layer.removeAttribute("data-slot"); layer.removeAttribute("data-ann"); layer.removeAttribute("data-col"); };

/* ---------- démarrage ---------- */
function start(){
  shell(); seed();
  setInterval(function(){ if(document.visibilityState==="visible" && (S.view==="home"||S.view==="agenda") && window.__prepaRefresh) window.__prepaRefresh(); },30000);
  window.__prepaRefresh=function(){ var a=document.activeElement; if(layer.innerHTML || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName))) return; render(); };
  if(typeof Sync!=="undefined"){ var bjLoaded=false; Sync.on(function(stt,user){ var p=document.getElementById("sync-pill"); if(p) p.innerHTML=syncLabel(); if(user && !bjLoaded && typeof BJ!=="undefined"){ bjLoaded=true; BJ.load(); setInterval(function(){ if(document.visibilityState==="visible") BJ.load(); },10*60000); } }); Sync.init(); }
  if(typeof BJ!=="undefined") BJ.on(function(){ window.__prepaRefresh(); });
  if(typeof Colles!=="undefined") Colles.on(function(){ if(S.view==="colles"||(S.view==="matiere"&&S.param==="maths")) window.__prepaRefresh(); });
  var h=(location.hash||"").replace("#",""); if(h){ var p=h.split("-"); if(["home","agenda","todo","matieres","matiere","echeances","notes","methodo","plus","bjclasse","bjcolleurs","bjcolleur","annales","colles","grange"].indexOf(p[0])>=0){ S.view=p[0]; S.param=p.length>1?decodeURIComponent(p.slice(1).join("-")):null; } }
  render();
  if("serviceWorker" in navigator && location.protocol==="https:" && !window.claude){ try{ navigator.serviceWorker.register("sw.js").catch(function(){}); }catch(e){} }
}
function confirmDel(f){ return window.confirm("Supprimer « "+f.name+" » ?"+(f.kind==="cours"?" Ses énoncés sortiront des quiz.":"")); }
window.__toast=toast;
window.__prepa={annSheet:function(i){ annSheet(i); },colleSheet:function(k){ colleSheet(k); },addNote:function(i){ addNoteSheet(i); },noteDetail:function(i){ noteDetail(i); },go:go, S:S, openSlot:function(d,i){ openSlot(d,i); }, quizSheet:quizSheet, methodeSheet:methodeSheet, closeSheet:function(){ closeSheet(); }};
/*@@UI@@*/
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();

