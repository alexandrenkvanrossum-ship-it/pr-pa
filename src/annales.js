/* Annales de maths approfondies (base de BJAPP, d'après le répertoire Major Prépa) et sujets de colle de BJcolle.
   - Ann : 984 exercices (écrits 2000-2026, oraux HEC/ESCP, DS de Ginette), faisabilité selon le calendrier
     des chapitres, pertinence sur 100, suivi par exercice.
   - Colles : sujets de colle de maths (PDF déposés sur BJcolle), programme de colle par quinzaine,
     deux sujets proposés chaque vendredi pour le trinôme du vendredi suivant. */
var Ann = (function(){
  var EPS = {
    EML:{s:"emlyon",n:"emlyon",m:"EM",c:"pink",full:"Maths emlyon"},
    EDHEC:{s:"EDHEC",n:"EDHEC",m:"ED",c:"green",full:"Maths EDHEC"},
    ECRI:{s:"Ecricome",n:"Ecricome",m:"EC",c:"teal",full:"Maths Ecricome"},
    HE:{s:"Maths I",n:"Maths I HEC/ESSEC",m:"I",c:"indigo",full:"Maths I HEC/ESSEC (depuis 2019)"},
    M2:{s:"Maths II",n:"Maths II HEC/ESCP",m:"II",c:"red",full:"Maths II HEC/ESCP"},
    HEC:{s:"HEC ≤ 2018",n:"HEC",m:"H",c:"brown",full:"Maths I HEC (2000 à 2018)"},
    ESSEC:{s:"ESSEC ≤ 2018",n:"ESSEC",m:"S",c:"yellow",full:"Maths I ESSEC (2000 à 2018)"},
    OH:{s:"Oral HEC",n:"Oral HEC",m:"OH",c:"blue",full:"Oral de maths HEC"},
    OE:{s:"Oral ESCP",n:"Oral ESCP",m:"OE",c:"purple",full:"Oral de maths ESCP"},
    DS:{s:"DS Ginette",n:"DS Ginette",m:"G",c:"gray",full:"Devoirs de Ginette"}
  };
  var EP_ORDER=["EML","EDHEC","ECRI","HE","M2","HEC","ESSEC"], OEP_ORDER=["OH","OE"];
  var LBL={e1:"Exercice 1",e2:"Exercice 2",e3:"Exercice 3",p:"Problème",p1:"Problème 1",p2:"Problème 2",p3:"Problème 3",p4:"Problème 4",s:"Sujet complet",ex:"Exercice principal",qsp:"Question sans préparation",sj:"Exercice",ds:"Devoir"};
  var DIFF={f:{n:"Facile",c:"green",o:1},m:{n:"Moyen",c:"orange",o:2},d:{n:"Difficile",c:"red",o:3},td:{n:"Très difficile",c:"purple",o:4}};
  var DOM={A:{n:"Analyse",g:"∫"},L:{n:"Algèbre",g:"λ"},P:{n:"Probabilités",g:"Ω"}};
  /* chapitres : 1re année, puis 2e année avec les dates de la progression (corrigeables à la main) */
  var CHL=[
    {id:"A1",n:"Suites et séries",y:1,d:"A"},{id:"A2",n:"Fonctions, DL, Taylor",y:1,d:"A"},{id:"A3",n:"Intégration",y:1,d:"A"},
    {id:"L1",n:"Algèbre linéaire, polynômes",y:1,d:"L"},{id:"P1",n:"Probabilités discrètes",y:1,d:"P"},
    {id:"C0",k:0,n:"Intégrales généralisées",y:2,d:"A",a:"2026-09-07",b:"2026-09-25",demo:"IPP et changement de variable sur intervalle quelconque"},
    {id:"C1",k:1,n:"Variables aléatoires à densité",y:2,d:"P",a:"2026-09-21",b:"2026-10-16",demo:"Positivité de l'espérance, König-Huygens, V(aX+b), stabilité affine, convergence de Γ(x)"},
    {id:"C2",k:2,n:"Compléments d'algèbre linéaire",y:2,d:"L",a:"2026-10-12",b:"2026-11-06",demo:"Invariance de la trace par changement de base"},
    {id:"C3",k:3,n:"Diagonalisation",y:2,d:"L",a:"2026-11-02",b:"2026-11-20",demo:"Valeurs propres des matrices triangulaires, famille libre de vecteurs propres, somme directe des sous-espaces propres, projecteurs diagonalisables"},
    {id:"C4",k:4,n:"Variables aléatoires discrètes",y:2,d:"P",a:"2026-11-16",b:"2026-12-04",demo:"Loi d'une somme indépendante, stabilité binomiale/Poisson, Huygens pour la covariance, V(X+Y)"},
    {id:"C5",k:5,n:"Algèbre bilinéaire",y:2,d:"L",a:"2026-11-30",b:"2027-01-08",demo:"Cauchy-Schwarz et cas d'égalité, complétion en b.o.n., (F⊥)⊥ = F, théorème de minimisation"},
    {id:"C6",k:6,n:"Endomorphismes symétriques",y:2,d:"L",a:"2027-01-04",b:"2027-01-15",demo:"Projecteur orthogonal ⇔ symétrique, orthogonalité des sous-espaces propres, stabilité de l'orthogonal"},
    {id:"C7",k:7,n:"Fonctions de plusieurs variables",y:2,d:"A",a:"2027-01-18",b:"2027-02-05",demo:"Bornes atteintes, Schwarz, conditions d'ordre 1 et 2"},
    {id:"C8",k:8,n:"Optimisation sous contraintes linéaires",y:2,d:"A",a:"2027-02-01",b:"2027-02-12",demo:"Condition ∇f(a) ∈ Vect(∇gᵢ(a))"},
    {id:"C9",k:9,n:"Convergences de suites de VA",y:2,d:"P",a:"2027-02-08",b:"2027-02-28",demo:"Markov, Bienaymé-Tchebychev, loi faible des grands nombres"},
    {id:"C10",k:10,n:"Estimation",y:2,d:"P",a:"2027-02-24",b:"2027-03-12",demo:"Intervalles de confiance pour une Bernoulli (deux méthodes)"}
  ];
  var CH={}; CHL.forEach(function(c){ CH[c.id]=c; });
  var CH2=CHL.filter(function(c){ return c.y===2; });
  /* programme de colle de maths : un nouveau toutes les deux semaines (date = lundi où il commence) */
  var PROG=[
    {d:"2026-09-21",n:"Colle 1",t:"Révisions d'analyse et intégrales généralisées",main:["C0"],prev:["A1","A2","A3"]},
    {d:"2026-10-05",n:"Colle 2",t:"Variables aléatoires à densité",main:["C1"],prev:["C0"]},
    {d:"2026-11-02",n:"Colle 3",t:"Algèbre linéaire : 1re année et compléments (+ densités)",main:["C2","L1"],prev:["C1"]},
    {d:"2026-11-16",n:"Colle 4",t:"Algèbre linéaire et réduction",main:["C3"],prev:["C2","L1"]},
    {d:"2026-11-30",n:"Colle 5",t:"Variables et vecteurs aléatoires discrets",main:["C4"],prev:["C3"]},
    {d:"2026-12-14",n:"Pas de colle",t:"Concours blanc",main:["C4"],prev:["C3","C5"]},
    {d:"2027-01-04",n:"Colle 6",t:"Espaces euclidiens et endomorphismes symétriques",main:["C5","C6"],prev:["C3"]},
    {d:"2027-02-01",n:"Colle 7",t:"Fonctions de plusieurs variables, extrema (avec contraintes)",main:["C7","C8"],prev:["C6"]},
    {d:"2027-02-15",n:"Colle 8",t:"Convergences, estimation",main:["C9","C10"],prev:["C7"]}
  ];

  var D=null, ITEMS=[], BY={}, SUBJ={}, OY=[], IDX={}, loading=null, ls=[];
  var CACHE="prepa-annales", PATH=function(){ return Sync.user().id+"/annales/annales.json"; };
  function emit(){ ls.forEach(function(f){ try{ f(); }catch(e){} }); }
  function setData(o){
    D=o; ITEMS=o.items||[]; OY=o.oy||[]; BY={}; SUBJ={};
    (o.subjects||[]).forEach(function(s){ SUBJ[s.sid]=s; });
    ITEMS.forEach(function(it){ BY[it.id]=it; it.tg=it.tg||[]; it.hp=it.hp||[];
      IDX[it.id]=norm([EPS[it.ep]?EPS[it.ep].n:"",it.ep,it.y,it.sub||"",it.dsn||"",LBL[it.lb]||"",it.th,it.no||"",(it.hp||[]).map(function(h){ return h.n; }).join(" "),it.nt||"",it.rd?"super classique":"",it.tg.map(function(t){ return CH[t]?CH[t].n:""; }).join(" "),DIFF[it.di]?DIFF[it.di].n:""].join(" "));
    });
  }
  /* la base est rangée dans ton espace privé « fichiers » (pas dans le dépôt public) */
  function load(){
    if(D) return Promise.resolve(D);
    if(window.__ANN_DATA){ setData(window.__ANN_DATA); return Promise.resolve(D); }
    if(loading) return loading;
    loading=(window.caches?caches.open(CACHE).then(function(c){ return c.match("annales.json"); }).then(function(r){ return r?r.json():null; }).catch(function(){ return null; }):Promise.resolve(null)).then(function(j){
      if(j){ setData(j); emit(); return D; }
      if(typeof Sync==="undefined"||!Sync.user()) throw new Error("Connecte-toi pour charger les annales.");
      return Sync.client().storage.from("fichiers").download(PATH()).then(function(r){
        if(r.error) throw new Error("Base d'annales introuvable dans ton espace.");
        return r.data.text();
      }).then(function(t){
        var o=JSON.parse(t); setData(o); emit();
        if(window.caches) caches.open(CACHE).then(function(c){ c.put("annales.json",new Response(t,{headers:{"content-type":"application/json"}})); }).catch(function(){});
        return D;
      });
    }).catch(function(e){ loading=null; throw e; });
    return loading;
  }
  function S(){ var s=Store.get(); s.ann=s.ann||{}; s.ann.it=s.ann.it||{}; s.ann.ov=s.ann.ov||{}; s.ann.days=s.ann.days||{}; return s.ann; }

  /* ---------- chapitres et faisabilité ---------- */
  function T(){ return iso(today()); }
  function chStatus(id,date){
    date=date||T(); var c=CH[id]; if(!c||c.y===1) return "seen";
    var o=S().ov[id]; if(o===true) return "seen"; if(o===false) return date>=c.a?"cur":"future";
    if(date>c.b) return "seen"; if(date>=c.a) return "cur"; return "future";
  }
  function curChapters(date){ return CH2.filter(function(c){ return chStatus(c.id,date)==="cur"; }).map(function(c){ return c.id; }); }
  function defaultFocus(date){ var p=progAt(date||T()); if(p) return p.main.slice(0,1); var cur=curChapters(date); return cur.length?[cur[cur.length-1]]:["C0"]; }
  function focusNow(){ return S().focus?[S().focus]:defaultFocus(); }
  function feas(it,date){
    if(it.ex) return {k:"hp"};
    var t2=it.tg.filter(function(t){ return CH[t]&&CH[t].y===2; });
    var miss=t2.filter(function(t){ return chStatus(t,date)==="future"; }), cur=t2.filter(function(t){ return chStatus(t,date)==="cur"; });
    if(!miss.length) return {k:cur.length?"cur":"ok",cur:cur};
    var last=miss.map(function(t){ return CH[t]; }).sort(function(a,b){ return a.b<b.b?-1:1; }).pop();
    return {k:(it.pa||it.lv===1)?"part":"later",miss:miss,last:last};
  }
  function feasText(it){
    var f=feas(it);
    if(f.k==="hp") return {c:"red",s:"Hors programme ECG",l:"Repose sur une notion hors programme : masqué des recommandations."};
    if(f.k==="ok") return {c:"green",s:"Faisable maintenant",l:"Tous les chapitres nécessaires sont vus."};
    if(f.k==="cur") return {c:"blue",s:"Chapitre en cours",l:"Utilise "+f.cur.map(function(t){ return CH[t].n; }).join(", ")+", que tu travailles en ce moment."};
    var when=f.last?"après « "+f.last.n+" » (vers le "+fmtDay(f.last.b)+")":"plus tard";
    if(f.k==="part") return {c:"orange",s:"Partiellement faisable",l:"Une partie se fait déjà ; le reste "+when+"."};
    return {c:"gray",s:"À garder pour plus tard",l:"Faisable "+when+"."};
  }
  /* pertinence sur 100 : intérêt 40 %, lien avec le chapitre 30 %, programme actuel 15 %, accessibilité 15 % */
  function score(it,focus,date){
    if(it.ex) return 0;
    var I=it.st?it.st/3:0.55, txt=norm((it.nt||"")+" "+((SUBJ[it.sid]||{}).vi||""));
    if(/classique|a faire absolument/.test(txt)) I=Math.min(1,I+0.1);
    if(it.rd) I=1.12; if(it.k==="d") I=1.05;
    var E=it.y>=2023?1:(it.y>=2014?0.85:0.7), f=feas(it,date);
    var F=f.k==="later"?0.1:(f.k==="part"?0.35:0.6);
    if(focus&&focus.length&&f.k!=="later"&&it.tg.some(function(t){ return focus.indexOf(t)>=0; })) F=1;
    var Dd=({f:1,m:0.9,d:0.7,td:0.5})[it.di]; if(Dd==null) Dd=0.7;
    var s=100*(0.40*I+0.30*F+0.15*E+0.15*Dd)-Math.min(15,5*(it.hp||[]).length);
    if(it.lb==="s") s-=8; else if(["M2","HE","HEC","ESSEC"].indexOf(it.ep)>=0) s-=6;
    return Math.max(0,Math.min(100,Math.round(s)));
  }
  function doms(it){ var s={}; String(it.dm||"").split("").forEach(function(ch){ if(ch==="A") s.A=1; if(ch==="L"||ch==="B") s.L=1; if(ch==="P") s.P=1; if(ch==="T"){ s.A=s.L=s.P=1; } }); return Object.keys(s); }
  function statusOf(id){ var r=S().it[id]; return r&&r.s||"todo"; }
  function recommend(focus,n,o){
    o=o||{}; var date=o.date||T(), ex=o.exclude||{};
    var cand=ITEMS.filter(function(it){ return !it.ex&&!ex[it.id]&&statusOf(it.id)!=="done"&&(o.allowFull||it.lb!=="s")&&(!it.k||(it.k==="o"&&o.orals)||(it.k==="d"&&o.ds))&&(!o.maxT||(it.tm||0)<=o.maxT)&&(!o.minT||(it.tm||0)>=o.minT); })
      .map(function(it){ return {it:it,f:feas(it,date),s:score(it,focus,date)}; }).filter(function(x){ return x.f.k==="ok"||x.f.k==="cur"; });
    var inF=function(x){ return focus.length&&x.it.tg.some(function(t){ return focus.indexOf(t)>=0; }); };
    cand.sort(function(a,b){ return (inF(b)-inF(a))||(b.s-a.s); });
    return cand.slice(0,n).map(function(x){ return x.it; });
  }
  /* recherche et filtres (Grange) */
  function search(q,f){
    f=f||{}; var words=norm(q||"").split(/\s+/).filter(Boolean), focus=(f.chs&&f.chs.length)?f.chs:focusNow();
    var kind=f.mode==="oral"?"o":f.mode==="ds"?"d":undefined;
    var L=ITEMS.filter(function(it){
      if(it.k!==kind) return false; if(it.ex&&!f.hp) return false;
      if(f.eps&&f.eps.length&&f.eps.indexOf(it.ep)<0) return false;
      if(f.chs&&f.chs.length&&!it.tg.some(function(t){ return f.chs.indexOf(t)>=0; })) return false;
      if(f.dur){ var t=it.tm||0; if(f.dur==="long"?t<180:t>+f.dur) return false; }
      if(f.diff&&f.diff.length&&f.diff.indexOf(it.di)<0) return false;
      if(f.stars===4?!it.rd:(f.stars&&(it.st||0)<f.stars)) return false;
      if(f.feas){ var k=feas(it).k; if(f.feas==="now"&&!(k==="ok"||k==="cur")) return false; }
      if(f.stat){ var s=statusOf(it.id), r=S().it[it.id]; if(f.stat==="fav"?!(r&&r.f):s!==f.stat) return false; }
      if(words.length){ var h=IDX[it.id]; if(!words.every(function(w){ return h.indexOf(w)>=0; })) return false; }
      return true;
    });
    var sc={}; L.forEach(function(it){ sc[it.id]=score(it,focus); });
    var by={score:function(a,b){ return sc[b.id]-sc[a.id]||b.y-a.y; },recent:function(a,b){ return b.y-a.y||a.ep.localeCompare(b.ep); },easy:function(a,b){ return ((DIFF[a.di]||{o:5}).o-(DIFF[b.di]||{o:5}).o)||sc[b.id]-sc[a.id]; }}[f.sort||"score"];
    L.sort(by); return {L:L,sc:sc};
  }
  /* suivi */
  function rec(id){ return S().it[id]||null; }
  function patch(id,p){ var r=Object.assign({s:"todo"},S().it[id]||{},p); if(r.s==="todo"&&r.n==null&&!r.t&&!r.c&&!r.f) delete S().it[id]; else S().it[id]=r; Store.save(); emit(); }
  function setStatus(id,s){
    var r=Object.assign({s:"todo"},S().it[id]||{}), prev=r.s;
    if(s==="done"&&prev!=="done"){ r.d=T(); r.dc=(r.dc||0)+1; if(prev==="redo") r.r=(r.r||0)+1; }
    if(s==="doing"&&r.p==null) r.p=25; r.s=s; if(s==="redo") r.rd=T();
    S().it[id]=r; patch(id,{});
  }
  function addTime(id,m){ var d=S().days[T()]||(S().days[T()]={m:0}); d.m+=m; patch(id,{t:((rec(id)||{}).t||0)+m}); }
  function weekStats(){
    var mon=iso(mondayOf(today())), end=iso(addDays(mondayOf(today()),6)), ex=0, min=0, eps={};
    Object.keys(S().it).forEach(function(id){ var r=S().it[id]; if(r.d&&r.d>=mon&&r.d<=end&&(r.s==="done"||r.s==="redo")&&BY[id]){ ex++; eps[BY[id].ep]=1; } });
    Object.keys(S().days).forEach(function(d){ if(d>=mon&&d<=end) min+=S().days[d].m||0; });
    return {ex:ex,min:min,eps:Object.keys(eps).length};
  }

  /* ---------- programme de colle ---------- */
  function progAt(date){ var p=null; PROG.forEach(function(x){ if(x.d<=date) p=x; }); var o=(Store.get().ann||{}).progOv; if(o&&o.from<=date&&(!o.to||date<=o.to)) return Object.assign({},p||{},o.p); return p; }

  function title(it){ if(it.k==="d") return "DS "+(it.sub||"")+", "+(it.dsn||""); if(it.k==="o") return EPS[it.ep].n+" "+it.y+", "+(it.sub||""); return EPS[it.ep].n+" "+it.y+(it.sub?" ("+it.sub+")":"")+(LBL[it.lb]?", "+LBL[it.lb].toLowerCase():""); }
  function dur(t){ if(!t) return ""; if(t<60) return t+" min"; var h=Math.floor(t/60), m=t%60; return h+" h"+(m?" "+(m<10?"0":"")+m:""); }
  return {load:load, ready:function(){ return !!D; }, on:function(f){ ls.push(f); }, items:function(){ return ITEMS; }, get:function(id){ return BY[id]; }, subj:function(sid){ return SUBJ[sid]||{}; }, oy:function(){ return OY; },
    EPS:EPS, EP_ORDER:EP_ORDER, OEP_ORDER:OEP_ORDER, LBL:LBL, DIFF:DIFF, DOM:DOM, CHL:CHL, CH:CH, CH2:CH2, PROG:PROG,
    chStatus:chStatus, focusNow:focusNow, defaultFocus:defaultFocus, feas:feas, feasText:feasText, score:score, doms:doms, recommend:recommend, search:search,
    statusOf:statusOf, rec:rec, patch:patch, setStatus:setStatus, addTime:addTime, weekStats:weekStats, progAt:progAt, title:title, dur:dur, state:S};
})();

/* ---------- sujets de colle de maths (BJcolle) ---------- */
var Colles = (function(){
  var BASE="https://www.bjcolle.fr/", running={}, queue=[], busy=false, ls=[];
  function emit(){ ls.forEach(function(f){ try{ f(); }catch(e){} }); }
  function key(u){ var h=0; for(var i=0;i<u.length;i++){ h=(h*31+u.charCodeAt(i))|0; } return "k"+(h>>>0).toString(36); }
  function st(){ var s=Store.get(); s.colleSujets=s.colleSujets||{}; s.colleEx=s.colleEx||{}; s.trin=s.trin||{}; return s; }
  function isPdf(p){ return /\.pdf$/i.test(p.u||"")||/\.pdf$/i.test(p.n||""); }
  /* toutes les feuilles de colle de maths avec un sujet en PDF : relevé initial + ce que le robot ajoute */
  function all(){
    var s=st(), m={};
    function add(o){ (o.pj||[]).filter(isPdf).forEach(function(p){ var u=/^https?:/.test(p.u)?p.u:BASE+String(p.u).replace(/^\.?\//,""); var k=key(u); var x=m[k]; if(!x) x=m[k]={k:k,u:u,n:p.n,d:o.d,c:o.c,a:o.a,dates:[]}; if(o.d&&x.dates.indexOf(o.d)<0) x.dates.push(o.d); if(o.d<x.d) x.d=o.d; }); }
    Object.keys(s.colleSujets).forEach(function(k){ add(s.colleSujets[k]); });
    /* même PDF déposé pour chaque élève du groupe : on fusionne colleur + semaine + nom de fichier */
    var g={};
    Object.keys(m).forEach(function(k){ var x=m[k], w=iso(mondayOf(parseISO(x.d))), gk=norm(x.c)+"|"+w+"|"+norm(x.n).replace(/[^a-z0-9]/g,""); if(!g[gk]||(s.colleEx[k]&&!s.colleEx[g[gk].k])) g[gk]=x; });
    return Object.keys(g).map(function(k){ var x=g[k]; x.ex=s.colleEx[x.k]||null; x.cur=x.a==="2026-2027"||x.d>="2026-08-15"; return x; }).sort(function(a,b){ return b.d.localeCompare(a.d); });
  }
  /* chapitres d'un sujet : ceux relevés par l'analyse, sinon le programme de colle de la semaine (année en cours) */
  function chapters(x){
    if(x.ex&&x.ex.exercices){ var m={}; x.ex.exercices.forEach(function(e){ (e.chapitres||[]).forEach(function(c){ if(Ann.CH[c]) m[c]=1; }); }); var l=Object.keys(m); if(l.length) return l; }
    if(x.cur){ var p=Ann.progAt(x.d); if(p) return p.main.slice(); }
    return [];
  }
  function chLabel(id){ var c=Ann.CH[id]; return c?(c.y===2?"Ch. "+c.k+" "+c.n:c.n+" (1A)"):id; }

  /* ---------- trinôme du vendredi ---------- */
  function inVac(d){ return (typeof VACANCES!=="undefined"?VACANCES:[]).some(function(v){ return d>=v.from&&d<=v.to; }); }
  /* chaque vendredi, on prépare le vendredi suivant (hors vacances) */
  function target(){
    var t=today(), back=(t.getDay()-5+7)%7, lastFri=addDays(t,-back), d=addDays(lastFri,7);
    for(var i=0;i<8&&inVac(iso(d));i++) d=addDays(d,7);
    return iso(d);
  }
  function scoreFor(chs,p){ var s=0; chs.forEach(function(c){ if(p.main.indexOf(c)>=0) s+=3; else if(p.prev.indexOf(c)>=0) s+=1; else s-=1; }); return s; }
  function usedBefore(tg){ var u={}, T=st().trin; Object.keys(T).forEach(function(d){ if(d!==tg) (T[d].picks||[]).forEach(function(p){ u[p.ref]=1; }); }); return u; }
  function candidates(tg){
    var p=Ann.progAt(tg); if(!p) return [];
    var used=usedBefore(tg), out=[];
    all().forEach(function(x){ var chs=chapters(x), s=scoreFor(chs,p); if(chs.length&&s>0) out.push({kind:"colle",ref:x.k,s:s+(x.ex?1:0)-(used[x.k]?5:0)+(x.cur?0.5:0),x:x}); });
    if(Ann.ready()) Ann.items().forEach(function(it){ if(it.k==="o"&&it.lb!=="qsp"&&!it.ex){ var s=scoreFor(it.tg.filter(function(t){ return Ann.CH[t]; }),p); if(s>=3) out.push({kind:"ann",ref:it.id,s:s-2+(it.st||0)*0.3-(used[it.id]?5:0)}); } });
    return out.sort(function(a,b){ return b.s-a.s; });
  }
  function pick(tg,force){
    var T=st().trin, cur=T[tg];
    if(cur&&cur.picks&&cur.picks.length>=2&&!force) return cur;
    var c=candidates(tg); if(!c.length) return cur||null;
    var keep=(cur&&cur.picks||[]).filter(function(p){ return p.keep; });
    var picks=keep.slice();
    /* d'abord deux sujets de colle si possible, sinon des exercices d'oral */
    var pool=c.filter(function(x){ return !picks.some(function(p){ return p.ref===x.ref; })&&!(cur&&cur.skip&&cur.skip[x.ref]); });
    var top=pool.slice(0,6); top.sort(function(){ return Math.random()-0.5; }); top.sort(function(a,b){ return Math.round(b.s)-Math.round(a.s); });
    while(picks.length<2&&top.length){ var x=top.shift(); picks.push({kind:x.kind,ref:x.ref}); }
    T[tg]={picks:picks,at:new Date().toISOString(),skip:(cur&&cur.skip)||{},done:(cur&&cur.done)||{}};
    Store.save(); return T[tg];
  }
  function swap(tg,i){ var T=st().trin, cur=T[tg]; if(!cur) return; var old=cur.picks[i]; cur.skip=cur.skip||{}; if(old) cur.skip[old.ref]=1; cur.picks.forEach(function(p,j){ p.keep=j!==i; }); cur.picks.splice(i,1); var r=pick(tg,true); r.picks.forEach(function(p){ delete p.keep; }); Store.save(); emit(); }
  function toggleDone(tg,ref){ var cur=st().trin[tg]; if(!cur) return; cur.done=cur.done||{}; if(cur.done[ref]) delete cur.done[ref]; else cur.done[ref]=iso(today()); Store.save(); emit(); }

  /* ---------- analyse des PDF par Gemini (énoncés, chapitres) ---------- */
  function chList(){ return Ann.CHL.map(function(c){ return c.id+" = "+c.n+(c.y===1?" (1re année)":""); }).join(" ; "); }
  function analyze(k){
    if(running[k]) return running[k];
    var x=all().find(function(y){ return y.k===k; }); if(!x) return Promise.resolve(null);
    running[k]=Sync.invoke({mode:"doc",kind:"colle",chapitres:chList(),files:[{url:x.u,name:x.n,mime:"application/pdf"}]}).then(function(r){
      st().colleEx[k]={question_cours:r.question_cours||"",exercices:(r.exercices||[]).filter(function(e){ return e&&e.enonce; }),at:new Date().toISOString()};
      Store.save(); delete running[k]; emit(); return st().colleEx[k];
    },function(e){ st().colleEx[k]={err:String(e&&e.message||e).slice(0,200),at:new Date().toISOString(),exercices:null}; Store.save(); delete running[k]; emit(); throw e; });
    return running[k];
  }
  /* file d'attente en arrière-plan : propositions d'abord, puis l'année en cours, puis l'archive */
  function pump(){
    if(busy||typeof Sync==="undefined"||!Sync.user()) return;
    var s=st(), tg=target(), cur=s.trin[tg], want=(cur&&cur.picks||[]).filter(function(p){ return p.kind==="colle"; }).map(function(p){ return p.ref; });
    var L=all().filter(function(x){ var e=s.colleEx[x.k]; return !e||(e.err&&Date.now()-new Date(e.at)>864e5); });
    L.sort(function(a,b){ return (want.indexOf(b.k)>=0)-(want.indexOf(a.k)>=0)||(b.cur-a.cur)||b.d.localeCompare(a.d); });
    var x=L[0]; if(!x) return; busy=true;
    analyze(x.k).catch(function(){}).then(function(){ busy=false; pumped++; if(pumped<12) setTimeout(pump,4000); });
  }
  var pumped=0;
  /* nouveaux sujets relevés par le robot (pièces jointes des feuilles de colle de maths) */
  var refreshed=0;
  /* relevé initial (toutes les feuilles de colle de maths lues une fois), rangé dans ton espace privé */
  function importOnce(){
    var s=st(); if(s.colleImport) return Promise.resolve();
    return Sync.client().storage.from("fichiers").download(Sync.user().id+"/annales/colles-bjcolle.json").then(function(r){
      if(r.error) return; return r.data.text().then(function(t){ var o=JSON.parse(t), n=0; (o.colles||[]).forEach(function(c){ if(!s.colleSujets[c.id]){ s.colleSujets[c.id]={d:c.d,c:c.c,a:c.a,pj:c.pj}; n++; } }); s.colleImport=o.at||new Date().toISOString(); Store.save(); if(n) emit(); });
    }).catch(function(){});
  }
  function refresh(){
    if(typeof Sync==="undefined"||!Sync.user()||Date.now()-refreshed<10*60e3) return Promise.resolve();
    refreshed=Date.now();
    return importOnce().then(function(){ return Sync.client().from("bj_colles").select("id,date,colleur,annee,pj:champs->_pj").eq("discipline","Mathématiques").not("champs->_pj","is",null).order("date",{ascending:false}).limit(1000).then(function(r){
      if(r.error||!r.data) return; var s=st(), n=0;
      r.data.forEach(function(c){ if(!c.pj||!c.pj.length) return; var o=s.colleSujets[c.id]; if(o&&o.pj&&o.pj.length) return; s.colleSujets[c.id]={d:c.date,c:c.colleur,a:c.annee,pj:c.pj}; n++; });
      if(n){ Store.save(); emit(); }
    }); }).catch(function(){});
  }
  return {refresh:refresh, all:all, chapters:chapters, chLabel:chLabel, target:target, pick:pick, swap:swap, toggleDone:toggleDone, candidates:candidates, analyze:analyze, pump:pump, busy:function(k){ return !!running[k]; }, key:key, on:function(f){ ls.push(f); }, inVac:inVac};
})();
